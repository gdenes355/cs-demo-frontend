import React from "react";

type InstructionProps = {
  instr: string;
  args: string[];
  desc: string;
};

const RED = "#a31515";
const BLUE = "blue";

const Instruction = ({ instr, desc, args }: InstructionProps) => {
  return (
    <tr style={{ borderBottom: "1px solid" }}>
      <td style={{ fontFamily: "monospace" }}>
        <span style={{ color: BLUE, fontWeight: "bold" }}>{instr} </span>
        {args.map((a, i) => (
          <React.Fragment key={a}>
            <span style={{ color: RED }}>{a}</span>
            {i < args.length - 1 && <span>, </span>}
          </React.Fragment>
        ))}
      </td>
      <td>{desc}</td>
    </tr>
  );
};

const istructions = [
  {
    instr: "LDR",
    args: ["Rd", "<memory>"],
    desc: "Load value from RAM at address <memory> into register d",
  },
  {
    instr: "STR",
    args: ["Rd", "<memory>"],
    desc: "Store value currently in register d into RAM at address <memory>",
  },
  {
    instr: "ADD",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Add value specified by <op2> to the value in register n and store the result in register d",
  },
  {
    instr: "SUB",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Subtract value specified by <op2> from the value in register n and store the result in register d",
  },
  {
    instr: "MOV",
    args: ["Rd", "<op2>"],
    desc: "Copy the value specified by <op2> into register d",
  },
  {
    instr: "CMP",
    args: ["Rn", "<op2>"],
    desc: "Compare the value stored in register n with the value specified by <op2>",
  },
  {
    instr: "B",
    args: ["<label>"],
    desc: "Always jump to the instruction at position <label>",
  },
  {
    instr: "B<cond>",
    args: ["<label>"],
    desc: "Branch to <label> if the last comparison met the criterion specified by <cond>. Possible values: EQ: equals, NE: not equals, GT: greater than, LT: less than",
  },
  {
    instr: "AND",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Logical bitwise AND operation between the value specified by <op2> and the value in register n and store the result in register d",
  },
  {
    instr: "ORR",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Logical bitwise OR operation between the value specified by <op2> and the value in register n and store the result in register d",
  },
  {
    instr: "EOR",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Logical bitwise XOR (exclusive or) operation between the value specified by <op2> and the value in register n and store the result in register d",
  },
  {
    instr: "MVN",
    args: ["Rd", "<op2>"],
    desc: "Logical bitwise NOT operation on the value specified by <op2> and store the result in register d",
  },
  {
    instr: "LSL",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Logical shift left the value in register n by the number of bits specified by <op2> and store the result in register d",
  },
  {
    instr: "LSR",
    args: ["Rd", "Rn", "<op2>"],
    desc: "Logical shift right the value in register n by the number of bits specified by <op2> and store the result in register d",
  },
  {
    instr: "OUT",
    args: ["<op2>"],
    desc: "Display character on screen based on the ASCII code specified by <op2>",
  },
  { instr: "HALT", args: [], desc: "Stop execution" },
];

const HelpInstrSet = () => {
  return (
    <>
      <p>Assembly based on AQA assembly</p>
      <p>
        <span style={{ fontFamily: "monospace", color: RED }}>{"<op2>"}</span>
        means a register (r0, r1, etc) or an immediate value (e.g. #65)
        <br />
        <span style={{ fontFamily: "monospace", color: RED }}>
          {"<memory>"}
        </span>
        means an address in RAM (e.g. 100 for address 100) or a label
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th style={{ width: "500px" }}></th>
          </tr>
        </thead>
        <tbody>
          {istructions.map((instr) => (
            <Instruction
              key={instr.instr}
              instr={instr.instr}
              desc={instr.desc}
              args={instr.args}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default HelpInstrSet;
