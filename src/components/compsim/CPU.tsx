import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { CancelToken } from "../../utils/CancelToken";

import "./CPU.css";
import MachineContext from "./MachineContext";
import { DecodedInstr, decodeInstruction } from "../../utils/compsim/Decoder";
import { timeout } from "../../utils/Timeout";
import { alu } from "../../utils/compsim/AluExecuter";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const PC_ADDRESS = 16;
const CIR_ADDRESS = 17;
const IR_ADDRESS = 18;
const ALU_A_ADDRESS = 19;
const ALU_B_ADDRESS = 20;
const ALU_OUT_ADDRESS = 21;

const CMP_OUT_ADDRESS = 22;

const REG_ARRAY_SIZE = 23;

type CPUProps = {
  canRun: boolean;
  onReset: () => void;
  onRun: () => void;
  nominalSpeed: number;
  onNominalSpeedChange: (value: number) => void;
};

type CPURef = {
  reset: () => void;
  getReg: (address: number) => number;
  setReg: (address: number, value: number) => void;

  fetch: (ct: CancelToken) => Promise<void>;
  decode: (ct: CancelToken) => Promise<void>;
  execute: (ct: CancelToken) => Promise<void>;
};

type RegisterProps = {
  name: string;
  value: number | string;
  active: boolean;
  num: number;
  type: "data" | "address" | "control";
};

const Register = (props: RegisterProps) => {
  const strValue =
    typeof props.value === "string"
      ? props.value.padStart(8, "\u00A0")
      : ((props.value as number) >>> 0).toString(16).padStart(8, "0");
  return (
    <div
      className={
        props.active ? `reg active reg-${props.type}` : `reg reg-${props.type}`
      }
    >
      <span>{props.name}</span>
      <span id={`reg-${props.num}`} className="reg-value">
        {strValue}
      </span>
    </div>
  );
};

type CMPs = {
  acronym: string;
  operator: string;
};

const CMPIndicator = (props: RegisterProps) => {
  const intval = props.value as number;

  let vals: CMPs[] = [];
  if ((intval & 16) > 0) {
    if ((intval & 8) > 0) {
      vals.push({ acronym: "EQ", operator: "==" });
    }
    if ((intval & 4) > 0) {
      vals.push({ acronym: "GT", operator: ">" });
    }
    if ((intval & 2) > 0) {
      vals.push({ acronym: "LT", operator: "<" });
    }
    if ((intval & 1) > 0) {
      vals.push({ acronym: "NE", operator: "!=" });
    }
  }
  return (
    <div
      className={
        props.active ? `reg active reg-${props.type}` : `reg reg-${props.type}`
      }
    >
      <span>{props.name}</span>
      <span id={`reg-${props.num}`} className="reg-value">
        {vals.map((v, i) => (
          <span key={i} className="cmp-flag" data-tooltip-content={v.operator}>
            {v.acronym}
          </span>
        ))}
        <ReactTooltip
          anchorSelect=".reg .cmp-flag"
          place="bottom"
          variant="dark"
          style={{ zIndex: 1000000 }}
          render={({ content, activeAnchor }) => {
            if (!content) {
              return <div />;
            }
            return <div>{content}</div>;
          }}
        />
      </span>
    </div>
  );
};

type RegDisplay = {
  value: number;
  active: boolean;
};

const CPU = React.forwardRef<CPURef, CPUProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    reset,
    getReg,
    setReg,
    fetch,
    decode,
    execute,
  }));

  // data (immediately available, private)
  const m_regs = useMemo(() => new Array<number>(REG_ARRAY_SIZE).fill(0), []);
  const m_instruction = useRef<DecodedInstr | undefined>(undefined);
  const machine = useContext(MachineContext);
  const eventCounter = useRef(0);
  const paused = useRef(false);

  // state for rendering
  const [regs, setRegs] = useState<RegDisplay[]>(
    new Array(REG_ARRAY_SIZE).fill({ value: 0, active: false })
  );
  const [instruction, setInstruction] = useState<DecodedInstr | undefined>(
    undefined
  );
  const [decoding, setDecoding] = useState(false);
  const [aluBusy, setAluBusy] = useState(false);
  const [fdeState, setFdeState] = useState("");
  const [effectiveSpeed, setEffectiveSpeed] = useState(0);
  const [cpuPaused, setCpuPaused] = useState(false);
  const [stepping, setStepping] = useState(false);

  // interface methods
  const reset = () => {
    m_regs.fill(0);
    m_instruction.current = undefined;
    setRegs(
      new Array<RegDisplay>(REG_ARRAY_SIZE).fill({ value: 0, active: false })
    );
    setInstruction(undefined);
    setDecoding(false);
    setAluBusy(false);
    paused.current = false;
    setCpuPaused(false);
  };

  const setReg = (address: number, value: number) => {
    m_regs[address] = value >>> 0;
    updateReg(address);
  };

  const updateReg = (address: number) => {
    setRegs((regs) => {
      const newRegs = [...regs];
      newRegs[address] = { value: m_regs[address], active: true };
      setTimeout(() => {
        setRegs((regs) => {
          const newRegs = [...regs];
          newRegs[address] = { value: m_regs[address], active: false };
          return newRegs;
        });
      }, 500);
      return newRegs;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (eventCounter.current < 1) {
        setEffectiveSpeed(1000 / machine.clockInterval);
      } else {
        setEffectiveSpeed(eventCounter.current);
      }
      eventCounter.current = 0;
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [machine.clockInterval]);

  const getReg = (address: number) => {
    updateReg(address);
    return m_regs[address] >>> 0;
  };

  const getRegName = (address: number) => {
    if (address === PC_ADDRESS) {
      return "\u00A0PC";
    } else if (address === CIR_ADDRESS) {
      return "CIR";
    } else if (address === IR_ADDRESS) {
      return "OPC";
    } else if (address === ALU_A_ADDRESS) {
      return "\u00A0\u00A0A";
    } else if (address === ALU_B_ADDRESS) {
      return "\u00A0\u00A0B";
    } else if (address === ALU_OUT_ADDRESS) {
      return "ACC";
    } else if (address === CMP_OUT_ADDRESS) {
      return "FLAG";
    }
    return `R${address}`.padStart(3, "\u00A0");
  };

  const awaitContinue = async (ct: CancelToken) => {
    while (paused.current) {
      ct.checkCancelled();
      await timeout(100, ct);
    }
  };

  const readFromRam = async (address: number, ct: CancelToken) => {
    ct.checkCancelled();
    // leaving data on the bus
    if (!machine.ram || !machine.bus) return 0;
    machine.bus.setAddressBus(address);
    await timeout((machine.clockInterval * 0.1) / machine.fetchBoost, ct);
    machine.bus.setControlBus("read");
    machine.mi?.enable("cu", `bus-control`, "control");
    await timeout((machine.clockInterval * 0.1) / machine.fetchBoost, ct);
    await machine.ram.readWord(ct);
  };

  const writeToRam = async (address: number, ct: CancelToken) => {
    ct.checkCancelled();
    // assuming data is already on the bus
    if (!machine.ram || !machine.bus) return 0;
    machine.bus.setAddressBus(address);
    await timeout(machine.clockInterval * 0.1, ct);
    machine.bus.setControlBus("write");
    machine.mi?.enable("cu", `bus-control`, "control");
    await timeout(machine.clockInterval * 0.1, ct);
    await machine.ram.writeWord(ct);
  };

  const fetch = async (ct: CancelToken) => {
    ct.checkCancelled();
    await awaitContinue(ct);
    eventCounter.current++;
    setFdeState("fetch");
    if (!machine.ram || !machine.bus) return;
    let address = getReg(PC_ADDRESS);
    machine.assemblyEditor?.setActiveInstruction(address);
    machine.mi?.enable(`reg-${PC_ADDRESS}`, `bus-address`, "address");
    await readFromRam(address, ct);
    setReg(CIR_ADDRESS, machine.bus.getDataBus());
    machine.mi?.enable(`bus-data`, `reg-${CIR_ADDRESS}`, "data");
    await timeout((machine.clockInterval * 0.1) / machine.fetchBoost, ct);
    setReg(PC_ADDRESS, m_regs[PC_ADDRESS] + 1);
    machine.mi?.disable();
    await timeout((machine.clockInterval * 0.1) / machine.fetchBoost, ct);
    if (stepping) {
      paused.current = true;
      setCpuPaused(true);
    }
  };

  const decode = async (ct: CancelToken) => {
    ct.checkCancelled();
    eventCounter.current++;
    await awaitContinue(ct);
    setFdeState("decode");
    setDecoding(true);
    setInstruction(undefined);
    m_instruction.current = decodeInstruction(m_regs[CIR_ADDRESS]);
    await timeout((machine.clockInterval / machine.decodeBoost) * 0.3, ct);
    setInstruction(m_instruction.current);
    updateReg(IR_ADDRESS);
    await timeout((machine.clockInterval / machine.decodeBoost) * 0.3, ct);
    setDecoding(false);
    await timeout((machine.clockInterval / machine.decodeBoost) * 0.3, ct);
    if (stepping) {
      paused.current = true;
      setCpuPaused(true);
    }
  };

  const execute = async (ct: CancelToken) => {
    ct.checkCancelled();
    eventCounter.current++;
    await awaitContinue(ct);
    setFdeState("execute");
    if (!machine.ram || !machine.bus) return;
    if (!m_instruction.current) return;
    const instr = m_instruction.current;
    if (instr.opCodeMn === "HALT") ct.cancel();
    else if (instr.opCodeMn === "LDR") {
      machine.mi?.enable(`cu`, `bus-address`, "address");
      await readFromRam(instr.memAddr, ct);
      setReg(instr.Rd, machine.bus.getDataBus());
      machine.mi?.enable(`bus-data`, `reg-${instr.Rd}`, "data");
      await timeout(machine.clockInterval * 0.1, ct);
      machine.mi?.disable();
    } else if (instr.opCodeMn === "STR") {
      let data = getReg(instr.Rd);
      machine.bus.setDataBus(data);
      machine.mi?.enable(`reg-${instr.Rd}`, `bus-data`, "data");
      await timeout(machine.clockInterval * 0.3, ct);
      machine.mi?.enable(`cu`, `bus-address`, "address");
      await writeToRam(instr.memAddr, ct);
    } else if (instr.opCodeMn.startsWith("B")) {
      // branching!
      let cmp = getReg(CMP_OUT_ADDRESS);
      await timeout(machine.clockInterval * 0.2, ct);
      let shouldBranch = false;
      switch (instr.opCodeMn) {
        case "B":
          shouldBranch = true;
          break;
        case "BEQ":
          shouldBranch = (cmp & 8) !== 0;
          break;
        case "BNE":
          shouldBranch = (cmp & 1) !== 0;
          break;
        case "BGT":
          shouldBranch = (cmp & 4) !== 0;
          break;
        case "BLT":
          shouldBranch = (cmp & 2) !== 0;
          break;
      }
      if (shouldBranch) {
        setReg(PC_ADDRESS, instr.label);
        machine.mi?.enable(`cu`, `reg-${PC_ADDRESS}`, "address");
      }
      await timeout(machine.clockInterval * 0.2, ct);
    } else if (instr.opCodeMn === "OUT") {
      let b = instr.regOrImm ? getReg(instr.Rm) : instr.imm;
      if (instr.regOrImm) {
        machine.mi?.enable(`reg-${instr.Rm}`, `screen`, "data");
      }
      await timeout(machine.clockInterval * 0.1, ct);
      machine.screen?.setBusy(true);
      await timeout(machine.clockInterval * 0.4, ct);
      machine.screen?.write(b);
      await timeout(machine.clockInterval * 0.4, ct);
      machine.screen?.setBusy(false);
      machine.mi?.disable();
      await timeout(machine.clockInterval * 0.1, ct);
    } else {
      // ALU
      setAluBusy(true);
      await timeout(machine.clockInterval * 0.2, ct);
      let a = 0;

      if (instr.opCodeMn === "MOV" || instr.opCodeMn === "MVN") {
        // single input operand
      } else if (instr.opCodeMn === "CMP") {
        // Rd should be considered an input (ouch)
        a = getReg(instr.Rd);
        machine.mi?.enable(`reg-${instr.Rd}`, `reg-${ALU_A_ADDRESS}`, "data");
      } else {
        // 2 operands
        a = getReg(instr.Rn);
        machine.mi?.enable(`reg-${instr.Rn}`, `reg-${ALU_A_ADDRESS}`, "data");
      }
      setReg(ALU_A_ADDRESS, a);
      await timeout(machine.clockInterval * 0.15, ct);
      let b = instr.regOrImm ? getReg(instr.Rm) : instr.imm;
      setReg(ALU_B_ADDRESS, b);
      if (instr.regOrImm) {
        machine.mi?.enable(`reg-${instr.Rm}`, `reg-${ALU_B_ADDRESS}`, "data");
      } else {
        machine.mi?.disable();
      }
      await timeout(machine.clockInterval * 0.15, ct);
      machine.mi?.disable();
      let res = alu(instr, a, b);
      setReg(ALU_OUT_ADDRESS, res);
      await timeout(machine.clockInterval * 0.15, ct);
      getReg(ALU_OUT_ADDRESS);
      let targetR = instr.opCodeMn !== "CMP" ? instr.Rd : CMP_OUT_ADDRESS;
      setReg(targetR, res);
      if (machine.machineType === "GCSE") {
        machine.mi?.enable(`reg-${ALU_OUT_ADDRESS}`, `reg-${targetR}`, "data");
      } else {
        machine.mi?.enable(`alu`, `reg-${targetR}`, "data");
      }
      await timeout(machine.clockInterval * 0.15, ct);
      setAluBusy(false);
      machine.mi?.disable();
      await timeout(machine.clockInterval * 0.15, ct);
    }
    await timeout(4, ct); // small wait to allow for UI updates
    setFdeState("");
    if (stepping) {
      paused.current = true;
      setCpuPaused(true);
    }
  };

  return (
    <Card
      style={{ width: "400px", position: "absolute", height: "480px" }}
      bg="light"
      className="p-2"
    >
      <Card.Title>CPU {fdeState}</Card.Title>
      <Card.Body className="p-1">
        <Card
          className="p-1"
          style={{
            width: "160px",
            position: "absolute",
            left: "5px",
            top: "40px",
          }}
        >
          <Card.Title>Registers</Card.Title>
          <Card.Body className="p-1">
            {[...Array(11).keys()].map((index) => {
              return (
                <Register
                  key={index}
                  num={index}
                  name={getRegName(index)}
                  value={regs[index].value}
                  active={regs[index].active}
                  type="data"
                />
              );
            })}
          </Card.Body>
        </Card>
        <Card
          className={`p-1 alu ${aluBusy ? "alu-busy" : ""}`}
          id="alu"
          style={{
            width: "200px",
            position: "absolute",
            left: "180px",
            top: "235px",
          }}
        >
          <Card.Title>ALU {aluBusy ? "(busy)" : ""}</Card.Title>
          <Card.Body className="p-1">
            <Register
              num={ALU_A_ADDRESS}
              name={getRegName(ALU_A_ADDRESS)}
              value={regs[ALU_A_ADDRESS].value}
              active={regs[ALU_A_ADDRESS].active}
              type="data"
            />
            <Register
              num={ALU_B_ADDRESS}
              name={getRegName(ALU_B_ADDRESS)}
              value={regs[ALU_B_ADDRESS].value}
              active={regs[ALU_B_ADDRESS].active}
              type="data"
            />
            {machine.machineType === "GCSE" ? (
              <Register
                num={ALU_OUT_ADDRESS}
                name={getRegName(ALU_OUT_ADDRESS)}
                value={regs[ALU_OUT_ADDRESS].value}
                active={regs[ALU_OUT_ADDRESS].active}
                type="data"
              />
            ) : null}
          </Card.Body>
        </Card>
        <span
          style={{
            width: "90px",
            position: "absolute",
            left: "180px",
            top: "395px",
          }}
        >
          {effectiveSpeed}Hz
        </span>
        <Button
          size="sm"
          variant="danger"
          onClick={() => props.onReset()}
          style={{
            width: "90px",
            position: "absolute",
            left: "180px",
            top: "425px",
          }}
        >
          Reset
        </Button>
        <Form.Check
          type="switch"
          id="custom-switch"
          label="Step"
          style={{
            width: "90px",
            position: "absolute",
            left: "290px",
            top: "395px",
          }}
          onChange={(e) => setStepping(e.target.checked)}
          checked={stepping}
        />

        {props.canRun ? (
          <Button
            size="sm"
            variant="success"
            disabled={!props.canRun}
            onClick={() => props.onRun()}
            style={{
              width: "90px",
              position: "absolute",
              left: "290px",
              top: "425px",
            }}
          >
            Run
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              paused.current = !paused.current;
              setCpuPaused(paused.current);
            }}
            style={{
              width: "90px",
              position: "absolute",
              left: "290px",
              top: "425px",
            }}
          >
            {cpuPaused ? "Resume" : "Pause"}
          </Button>
        )}
        <Form.Range
          min={0}
          max={13}
          step={1}
          value={props.nominalSpeed}
          onChange={(e) =>
            props.onNominalSpeedChange(e.target.value as any as number)
          }
          style={{
            position: "absolute",
            left: "150px",
            top: "9px",
            width: "240px",
          }}
        />
        <Card
          id="cu"
          className={`p-1 control-unit ${decoding ? "decoding" : ""}`}
          style={{
            width: "200px",
            position: "absolute",
            left: "180px",
            top: "40px",
          }}
        >
          <Card.Title>CU {decoding ? "(decoding)" : ""}</Card.Title>
          <Card.Body className="p-1">
            <Register
              num={PC_ADDRESS}
              key={PC_ADDRESS}
              name={getRegName(PC_ADDRESS)}
              value={regs[PC_ADDRESS].value}
              active={regs[PC_ADDRESS].active}
              type="address"
            />
            <Register
              name={getRegName(CIR_ADDRESS)}
              num={CIR_ADDRESS}
              value={regs[CIR_ADDRESS].value}
              active={regs[CIR_ADDRESS].active}
              type="data"
            />
            <Register
              num={IR_ADDRESS}
              name={getRegName(IR_ADDRESS)}
              value={instruction?.opCodeMn || ""}
              active={regs[IR_ADDRESS].active}
              type="control"
            />
            <CMPIndicator
              num={CMP_OUT_ADDRESS}
              name={getRegName(CMP_OUT_ADDRESS)}
              value={regs[CMP_OUT_ADDRESS].value}
              active={regs[CMP_OUT_ADDRESS].active}
              type="control"
            />
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
});

export default CPU;
export { CPURef };
