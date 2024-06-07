import { DecodedInstr } from "./Decoder";

const alu = (instr: DecodedInstr, a: number, b: number) => {
  a = a >>> 0;
  b = b >>> 0;
  switch (instr.opCodeMn) {
    case "ADD":
      return a + b;
    case "SUB":
      return a - b;
    case "AND":
      return a & b;
    case "ORR":
      return a | b;
    case "EOR":
      return a ^ b;
    case "LSL":
      return a << b;
    case "LSR":
      return a >>> b;
    case "MOV":
      return b;
    case "MVN":
      return ~b;
    case "CMP":
      return (
        16 |
        (a === b ? 8 : 0) |
        (a > b ? 4 : 0) |
        (a < b ? 2 : 0) |
        (a !== b ? 1 : 0)
      );
  }
  return 0;
};

export { alu };
