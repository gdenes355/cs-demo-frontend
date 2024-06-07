type OpCodeMn =
  | "LDR"
  | "STR"
  | "ADD"
  | "SUB"
  | "AND"
  | "ORR"
  | "EOR"
  | "LSL"
  | "LSR"
  | "MOV"
  | "MVN"
  | "CMP"
  | "B"
  | "BEQ"
  | "BGT"
  | "BLT"
  | "BNE"
  | "OUT"
  | "HALT";

const OFFSET_OPCODE = 28;
const OFFSET_SUBCODE = 24;
const OFFSET_RN = 4;
const OFFSET_OP2 = 8;
const OFFSET_IMM_OR_R = 27;

type DecodedInstr = {
  opCodeMn: OpCodeMn;
  opCode: number;
  subCode: number;
  Rd: number;
  Rn: number;
  Rm: number;
  imm: number;
  regOrImm: boolean;
  memAddr: number;
  label: number;
};

const opCodes = new Map<OpCodeMn, number>([
  ["LDR", 0],
  ["STR", 1],
  ["ADD", 2],
  ["SUB", 3],
  ["MOV", 4],
  ["CMP", 5],
  ["B", 6],
  ["BEQ", 7],
  ["BNE", 7],
  ["BGT", 7],
  ["BLT", 7],
  ["AND", 8],
  ["ORR", 9],
  ["EOR", 10],
  ["MVN", 11],
  ["LSL", 12],
  ["LSR", 13],
  ["OUT", 14],
  ["HALT", 15],
]);

const subCodes = new Map<OpCodeMn, number>([
  ["BEQ", 0],
  ["BGT", 1],
  ["BLT", 2],
  ["BNE", 3],
]);

const decodeInstruction = (instr: number): DecodedInstr => {
  try {
    instr = instr >>> 0; // convert to unsigned int
    let opCode = (instr & (0xf << OFFSET_OPCODE)) >>> OFFSET_OPCODE;
    let subCode = (instr & (0xf << OFFSET_SUBCODE)) >>> OFFSET_SUBCODE;
    let Rd = instr & 0x000000f;
    let Rn = (instr & (0xf << OFFSET_RN)) >>> OFFSET_RN;
    let Rm = (instr & (0xf << OFFSET_OP2)) >>> OFFSET_OP2;
    let imm = (instr & (0x7ffff << OFFSET_OP2)) >>> OFFSET_OP2;
    let regOrImm = (instr & (1 << OFFSET_IMM_OR_R)) >>> OFFSET_IMM_OR_R === 1;
    let memAddr = (instr & (0xfffff << OFFSET_OP2)) >>> OFFSET_OP2;
    let label = instr & 0xffff;

    let opCodeMn = [...opCodes.entries()].find(([, v]) => v === opCode)![0];
    if (opCode === opCodes.get("BEQ")) {
      // aliased conditional branch instruction. Use subcode
      opCodeMn = [...subCodes.entries()].find(([, v]) => v === subCode)![0];
    }

    return {
      opCodeMn,
      opCode,
      subCode,
      Rd,
      Rn,
      Rm,
      imm,
      regOrImm,
      memAddr,
      label,
    };
  } catch (e) {
    throw e;
  }
};

export { decodeInstruction, DecodedInstr, OpCodeMn };
