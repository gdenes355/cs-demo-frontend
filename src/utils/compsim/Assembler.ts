class CompileError extends Error {
  constructor(lineNo: number, msg: string) {
    super(msg);
    this.lineNo = lineNo;
    this.message = msg;
    Object.setPrototypeOf(this, CompileError.prototype);
  }

  public readonly lineNo: number;
}

const REG_COUNT = 16;
const REG_MAX = REG_COUNT - 1;
const ADDRESS_MAX = 2 ** 16 - 1;
const LITERAL_MAX = 2 ** 32 - 1;
const LITERAL_MIN = 0;

const OFFSET_OPCODE = 28;
const OFFSET_SUBCODE = 24;
const OFFSET_RN = 4;
const OFFSET_OP2 = 8;
const OFFSET_IMM_OR_R = 27;

const IMM_MAX = 2 ** (OFFSET_IMM_OR_R - OFFSET_OP2) - 1;

type C0Instr = {
  opCode: number;
  regexAddress?: RegExp;
  regexLabel?: RegExp;
};

const C0_INSTRS = new Map<string, C0Instr>(
  Object.entries({
    LDR: {
      opCode: 0,
    },
    STR: { opCode: 1 },
  })
);

type C1And2Instr = {
  opCode: number;
  regexR?: RegExp;
  regexI?: RegExp;
};

const C1_INSTRS = new Map<string, C1And2Instr>(
  Object.entries({
    ADD: { opCode: 2 },
    SUB: { opCode: 3 },
    AND: { opCode: 8 },
    ORR: { opCode: 9 },
    EOR: { opCode: 10 },
    LSL: { opCode: 12 },
    LSR: { opCode: 13 },
  })
);
const C2_INSTRS = new Map<string, C1And2Instr>(
  Object.entries({
    MOV: { opCode: 4 },
    MVN: { opCode: 11 },
    CMP: { opCode: 5 },
  })
);
type C3Instr = {
  opCode: number;
  subcode: number;
};
const C3_INSTRS = new Map<string, C3Instr>(
  Object.entries({
    B: { opCode: 6, subcode: 0 },
    BEQ: { opCode: 7, subcode: 0 },
    BGT: { opCode: 7, subcode: 1 },
    BLT: { opCode: 7, subcode: 2 },
    BNE: { opCode: 7, subcode: 3 },
  })
);

for (let instr of C0_INSTRS.keys()) {
  let regexAddress = new RegExp(
    `^${instr.toLowerCase()}\\s+r(\\d+)\\s*,\\s*(\\d+)$`
  );
  let regexLabel = new RegExp(
    `^${instr.toLowerCase()}\\s+r(\\d+)\\s*,\\s*([a-zA-Z_][a-zA-Z0-9_]*)$`
  );
  C0_INSTRS.set(instr, { ...C0_INSTRS.get(instr)!, regexAddress, regexLabel });
}

for (let instr of C1_INSTRS.keys()) {
  let regexR = new RegExp(
    `^${instr.toLowerCase()}\\s+r(\\d+)\\s*,\\s*r(\\d+)\\s*,\\s*r(\\d+)$`
  );
  let regexI = new RegExp(
    `^${instr.toLowerCase()}\\s+r(\\d+)\\s*,\\s*r(\\d+)\\s*,\\s*#(\\d+)$`
  );
  C1_INSTRS.set(instr, { ...C1_INSTRS.get(instr)!, regexR, regexI });
}
for (let instr of C2_INSTRS.keys()) {
  let regexR = new RegExp(
    `^${instr.toLowerCase()}\\s+r(\\d+)\\s*,\\s*r(\\d+)$`
  );
  let regexI = new RegExp(
    `^${instr.toLowerCase()}\\s+r(\\d+)\\s*,\\s*#(\\d+)$`
  );
  C2_INSTRS.set(instr, { ...C2_INSTRS.get(instr)!, regexR, regexI });
}

const verifiedRegister = (reg: string, lineNo: number) => {
  let regNo = parseInt(reg);
  if (regNo > REG_MAX) {
    throw new CompileError(
      lineNo,
      `Invalid register. Max register is R${REG_MAX}. Got R${reg}`
    );
  }
  return regNo;
};

const verifiedImm = (imm: string, lineNo: number) => {
  let immNo = parseInt(imm);
  if (immNo > IMM_MAX) {
    throw new CompileError(
      lineNo,
      `Invalid Immediate value. Max immediate numerical value is ${IMM_MAX}. Got ${imm}`
    );
  }
  return immNo;
};

const verifiedAddress = (addr: string, lineNo: number) => {
  let addrNo = parseInt(addr);
  if (addrNo > ADDRESS_MAX) {
    throw new CompileError(
      lineNo,
      `Invalid memory location. Max memory location value is ${ADDRESS_MAX}. Got ${addrNo}`
    );
  }
  return addrNo;
};

// number literal: #123 or #0xff
const tryParseNumberLiteral = (line: string, lineNo: number) => {
  let match: RegExpMatchArray | null;
  if ((match = line.match(/^#(\d+)$/))) {
    let value = match[1];
    let valueNo = parseInt(value);
    if (valueNo > LITERAL_MAX) {
      throw new CompileError(
        lineNo,
        `Invalid Immediate value. Max literal value is ${LITERAL_MAX}. Got ${value}`
      );
    } else if (valueNo < LITERAL_MIN) {
      throw new CompileError(
        lineNo,
        `Invalid Immediate value. Min literal value is ${LITERAL_MIN}. Got ${value}`
      );
    }
    return valueNo;
  }
};

// C0-style memory instructions: LDR, STR
const tryParseC0 = (
  line: string,
  lineNo: number,
  labelMap: Map<string, number>
) => {
  let match: RegExpMatchArray | null;
  for (let instr of C0_INSTRS.keys()) {
    if ((match = line.match(C0_INSTRS.get(instr)!.regexAddress!))) {
      let rd = verifiedRegister(match[1], lineNo);
      let memref = verifiedAddress(match[2], lineNo);
      return (
        ((C0_INSTRS.get(instr)!.opCode << OFFSET_OPCODE) |
          (memref << OFFSET_OP2) |
          rd) >>>
        0
      );
    }
    if ((match = line.match(C0_INSTRS.get(instr)!.regexLabel!))) {
      let rd = verifiedRegister(match[1], lineNo);
      let label = labelMap.get(match[2]);
      if (label === undefined) {
        throw new CompileError(lineNo, `Unknown label ${match[2]}`);
      }
      return (
        ((C0_INSTRS.get(instr)!.opCode << OFFSET_OPCODE) |
          (label << OFFSET_OP2) |
          rd) >>>
        0
      );
    }
  }
};

// C1-style ALU instructions: ADD, SUB, AND, ORR, EOR, LSL, LSR
const tryParseC1 = (line: string, lineNo: number) => {
  for (let instr of C1_INSTRS.values()) {
    let match: RegExpMatchArray | null;
    if ((match = line.match(instr.regexR!))) {
      // ? Rd, Rn, Rm
      let rd = verifiedRegister(match[1], lineNo);
      let rn = verifiedRegister(match[2], lineNo);
      let rm = verifiedRegister(match[3], lineNo);
      return (
        ((instr.opCode << OFFSET_OPCODE) |
          (1 << OFFSET_IMM_OR_R) |
          (rm << OFFSET_OP2) |
          (rn << OFFSET_RN) |
          rd) >>>
        0
      );
    } else if ((match = line.match(instr.regexI!))) {
      // ? Rd, Rn, Imm
      let rd = verifiedRegister(match[1], lineNo);
      let rn = verifiedRegister(match[2], lineNo);
      let imm = verifiedImm(match[3], lineNo);
      return (
        ((instr.opCode << OFFSET_OPCODE) |
          (imm << OFFSET_OP2) |
          (rn << OFFSET_RN) |
          rd) >>>
        0
      );
    }
  }
};

// C2-style ALU instructions: MOV, MVN, CMP
const tryParseC2 = (line: string, lineNo: number) => {
  for (let instr of C2_INSTRS.values()) {
    let match: RegExpMatchArray | null;
    if ((match = line.match(instr.regexR!))) {
      // ? Rd, Rm
      let rd = verifiedRegister(match[1], lineNo);
      let rm = verifiedRegister(match[2], lineNo);
      return (
        ((instr.opCode << OFFSET_OPCODE) |
          (1 << OFFSET_IMM_OR_R) |
          (rm << OFFSET_OP2) |
          rd) >>>
        0
      );
    } else if ((match = line.match(instr.regexI!))) {
      // ? Rd, Imm
      let rd = verifiedRegister(match[1], lineNo);
      let imm = verifiedImm(match[2], lineNo);
      return ((instr.opCode << OFFSET_OPCODE) | (imm << OFFSET_OP2) | rd) >>> 0;
    }
  }
};

// OUT
const tryParseC3 = (line: string, lineNo: number) => {
  let match: RegExpMatchArray | null;
  if ((match = line.match(/out\s+r(\d+)/))) {
    let rm = verifiedRegister(match[1], lineNo);
    return (
      ((14 << OFFSET_OPCODE) | (1 << OFFSET_IMM_OR_R) | (rm << OFFSET_OP2)) >>>
      0
    );
  }
  if ((match = line.match(/out\s+#(\d+)/))) {
    let imm = verifiedImm(match[1], lineNo);
    return ((14 << OFFSET_OPCODE) | (imm << OFFSET_OP2)) >>> 0;
  }
};

// C3-style branch instructions: B, BEQ, BNE, BGT, BLT
const tryParseC4 = (
  line: string,
  lineNo: number,
  labelMap: Map<string, number>
) => {
  let match = line.match(/^(b(?:eq|ne|gt|lt|))\s+([A-Za-z_][A-Za-z_0-9]*)$/);
  if (match) {
    let mode = C3_INSTRS.get(match[1].toUpperCase());
    if (!mode) {
      throw new CompileError(lineNo, `Unknown branch mode ${match[1]}`);
    }
    let label = labelMap.get(match[2]);
    if (label === undefined) {
      throw new CompileError(lineNo, `Unknown label ${match[2]}`);
    }
    return (
      ((mode.opCode << OFFSET_OPCODE) |
        (mode.subcode << OFFSET_SUBCODE) |
        label) >>>
      0
    );
  }
};

type AssemblerResult = {
  machineCode: number[];
  lineMap: Map<number, number>;
};

const assemble: (code: string) => AssemblerResult = (code) => {
  let lines = code
    .split("\n")
    .map((s) => s.split("//")[0]) // remove comments
    .map((s) => s.trim().toLowerCase())
    .map((s, i) => ({ lineNo: i, data: s }))
    .filter((s) => s.data.length > 0);

  let labelMap = new Map<string, number>();

  let machineCode: number[] = [];

  let lineMap: Map<number, number> = new Map();

  let counter = 0;
  // pre-process labels
  for (let line of lines) {
    let match: RegExpMatchArray | null;
    if ((match = line.data.match(/^([A-Za-z_][A-Za-z_0-9]*):$/))) {
      // label:
      let label = match[1];
      labelMap.set(label, counter);
    } else {
      lineMap.set(counter, line.lineNo);
      counter++;
    }
  }

  for (let line of lines) {
    if (line.data.match(/^([A-Za-z_][A-Za-z_0-9]*):$/)) {
      // label:
      continue;
    }
    let instr: number | undefined = undefined;
    if (
      (instr = tryParseNumberLiteral(line.data, line.lineNo + 1)) !== undefined
    ) {
      // number literal
      machineCode.push(instr);
    } else if (
      (instr = tryParseC0(line.data, line.lineNo + 1, labelMap)) !== undefined
    ) {
      // C0: LDR/STR Rd, MemRef
      machineCode.push(instr);
    } else if ((instr = tryParseC1(line.data, line.lineNo + 1)) !== undefined) {
      // C1: ALU Rd, Rn, Op2
      machineCode.push(instr);
    } else if ((instr = tryParseC2(line.data, line.lineNo + 1)) !== undefined) {
      // C2: ALU Rd, Op2
      machineCode.push(instr);
    } else if ((instr = tryParseC3(line.data, line.lineNo + 1)) !== undefined) {
      // C3: ALU Op2
      machineCode.push(instr);
    } else if (
      (instr = tryParseC4(line.data, line.lineNo + 1, labelMap)) !== undefined
    ) {
      // C3: B?? Label
      machineCode.push(instr);
    } else if (line.data === "halt") {
      machineCode.push(15 << OFFSET_OPCODE);
    } else {
      throw new CompileError(
        line.lineNo + 1,
        `Invalid instruction ${line.data}`
      );
    }
  }

  return { machineCode, lineMap };
};

export { assemble, CompileError, AssemblerResult };
