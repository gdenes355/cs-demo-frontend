import React, { useMemo } from "react";
import { OpCodeMn, decodeInstruction } from "../../utils/compsim/Decoder";
import { Table } from "react-bootstrap";

import "./MemoryVisualiser.css";

type MemoryVisualiserProps = {
  address: number;
  value: number;
};

type Field = {
  header: string;
  value: string;
  unused?: boolean;
};

type PotentialFields =
  | "opCode"
  | "subCode"
  | "Rd"
  | "Rn"
  | "op2"
  | "regOrImm"
  | "memAddr"
  | "label";

const opCodeMnToFields = (opCodeMn: OpCodeMn): PotentialFields[] => {
  switch (opCodeMn) {
    case "LDR":
    case "STR":
      return ["opCode", "memAddr", "Rd"];
    case "ADD":
    case "SUB":
    case "AND":
    case "ORR":
    case "EOR":
    case "LSL":
    case "LSR":
      return ["opCode", "regOrImm", "op2", "Rn", "Rd"];
    case "MOV":
    case "MVN":
      return ["opCode", "regOrImm", "op2", "Rd"];
    case "CMP":
      return ["opCode", "op2", "regOrImm", "Rd"];
    case "B":
      return ["opCode", "label"];
    case "BEQ":
    case "BGT":
    case "BLT":
    case "BNE":
      return ["opCode", "subCode", "label"];
    case "OUT":
      return ["opCode", "regOrImm", "op2"];
    case "HALT":
      return ["opCode"];
  }
};

const opCodeMnToUnusedFields = (opCodeMn: OpCodeMn): PotentialFields[] => {
  // fields that are unused in the instruction (0s)
  switch (opCodeMn) {
    case "LDR":
    case "STR":
    case "MOV":
    case "MVN":
    case "CMP":
      return ["Rn"];
    case "OUT":
      return ["Rn", "Rd"];
    case "B":
      return ["subCode"];
    default:
      return [];
  }
};

const getFields = (value: number): Field[] => {
  try {
    let ins = decodeInstruction(value);
    let vf = opCodeMnToFields(ins.opCodeMn);
    let uf = opCodeMnToUnusedFields(ins.opCodeMn);
    let opc = ins.opCodeMn.toString();
    if (ins.opCode === 7) {
      opc = "B??";
    }

    let res: Field[] = [
      {
        // every Op gets the mnemonic OpCode
        header: opc,
        value: ins.opCode.toString(2).padStart(4, "0"),
      },
    ];
    if (vf.includes("regOrImm")) {
      if (ins.regOrImm) {
        res.push({ header: "R", value: "1" });
        res.push({
          header: "unused",
          value: "".padStart(15, "0"),
          unused: true,
        });
        res.push({
          header: "R" + ins.imm,
          value: ins.imm.toString(2).padStart(4, "0"),
        });
      } else {
        res.push({ header: "#", value: "0" });
        res.push({
          header:
            ins.imm.toString(10) +
            (ins.imm >= 32 && ins.imm < 128
              ? ` (${String.fromCharCode(ins.imm)})`
              : ""),
          value: ins.imm.toString(2).padStart(19, "0"),
        });
      }
    } else {
      if (vf.includes("subCode")) {
        res.push({
          header: ["EQ (==)", "GT (>)", "LT (<)", "NE (!=)"][ins.subCode],
          value: ins.subCode.toString(2).padStart(4, "0"),
        });
      } else if (uf.includes("subCode")) {
        res.push({
          header: "unused",
          value: "".padStart(4, "0"),
          unused: true,
        });
      }
    }
    if (vf.includes("memAddr")) {
      res.push({
        header: `RAM 0x${ins.memAddr
          .toString(16)
          .padStart(2, "0")} (${ins.memAddr.toString(10)})`,
        value: ins.imm.toString(2).padStart(19, "0"),
      });
    }
    if (vf.includes("Rn")) {
      res.push({
        header: `R${ins.Rn}`,
        value: ins.Rn.toString(2).padStart(4, "0"),
      });
    } else if (uf.includes("Rn")) {
      res.push({ header: "unused", value: "".padStart(4, "0"), unused: true });
    }
    if (vf.includes("Rd")) {
      res.push({
        header: `R${ins.Rd}`,
        value: ins.Rd.toString(2).padStart(4, "0"),
      });
    } else if (uf.includes("Rd")) {
      res.push({ header: "unused", value: "".padStart(4, "0"), unused: true });
    }

    if (vf.includes("label")) {
      res.push({
        header: `to instruction ${ins.label}`,
        value: ins.label.toString(2).padStart(24, "0"),
      });
    }
    if (opc === "HALT") {
      res.push({ header: "unused", value: "".padStart(28, "0"), unused: true });
    }

    return res;
  } catch (e) {
    return [];
  }
};

const MemoryVisualiser = (props: MemoryVisualiserProps) => {
  const { address } = props;

  const fields: Field[] = useMemo(() => {
    return getFields(props.value);
  }, [props.value]);

  const ascii = useMemo(() => {
    if (props.value >= 32 && props.value <= 255) {
      return String.fromCharCode(props.value);
    }
  }, [props.value]);

  return (
    <div className="memory-vis">
      <h5>Address: 0x{address.toString(16).padStart(2, "0")}</h5>
      <h5>0x {props.value.toString(16).padStart(8, "0")}</h5>
      <h5>dec {props.value.toString(10)}</h5>
      {ascii ? <h5>ascii {ascii}</h5> : null}
      <Table size="sm" variant="dark">
        <thead>
          <tr>
            {fields.map((field, index) => (
              <th key={index} className={`${field.unused ? "unused" : ""}`}>
                {field.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {fields.map((field, index) => (
              <td key={index} className={`${field.unused ? "unused" : ""}`}>
                {field.value}
              </td>
            ))}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default MemoryVisualiser;
