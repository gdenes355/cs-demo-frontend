import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BusRef } from "./Bus";
import MachineContext from "./MachineContext";
import { CancelToken } from "../../utils/CancelToken";
import { timeout } from "../../utils/Timeout";

import { Button, Card } from "react-bootstrap";
import { Tooltip as ReactTooltip } from "react-tooltip";

import "./RAM.css";
import { DecodedInstr, decodeInstruction } from "../../utils/compsim/Decoder";
import MemoryVisualiser from "./MemoryVisualiser";
import { Download } from "react-feather";

type RAMProps = {
  size: number;
  bus: BusRef | null;
};

type RAMRef = {
  clear: () => void;
  getWord: (address: number) => number;
  setWord: (address: number, value: number) => void;
  readWord: (ct: CancelToken) => Promise<void>;
  writeWord: (ct: CancelToken) => Promise<void>;
};

type WordProps = {
  address: number;
  style: React.CSSProperties;
};

type WordRef = {
  setValue: (value: number) => void;
  activate: () => void;
  setFocus: (value: boolean) => void;
};

const Word = React.forwardRef<WordRef, WordProps>((props, ref) => {
  const [active, setActiveInternal] = useState(false);
  const [focus, setFocus] = useState(false);
  const [value, setValueInternal] = useState(0);
  useImperativeHandle(ref, () => ({ setValue, activate, setFocus }));

  const activate = () => {
    setActiveInternal(true);
    setTimeout(() => {
      setActiveInternal(false);
    }, 500);
  };

  const setValue = (value: number) => {
    setValueInternal(value >>> 0);
    activate();
  };

  const strValue = ((value as number) >>> 0).toString(16).padStart(8, "0");
  return (
    <span
      style={props.style}
      className={`ram-word ${active ? "active" : ""} ${focus ? "focus" : ""}`}
      id={`ram-word-${props.address}`}
      data-num={value as number}
    >
      {strValue}
    </span>
  );
});

const RAM = React.forwardRef<RAMRef, RAMProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    clear,
    setWord,
    getWord,
    readWord,
    writeWord,
  }));

  const machine = useContext(MachineContext);

  const [memory, setMemory] = useState<number[]>(new Array(props.size).fill(0));
  const wordRefs = useRef<(WordRef | null)[]>([]);
  const focusRef = useRef<WordRef | null>(null);

  const clear = () => {
    memory.fill(0);
    for (let i = 0; i < wordRefs.current.length; i++) {
      wordRefs.current[i]?.setValue(0);
    }
    if (focusRef.current) focusRef.current.setFocus(false);
    focusRef.current = null;
  };

  const setWord = (address: number, value: number) => {
    if (address < 0 || address >= props.size)
      throw new Error(`Invalid address ${address}`);
    memory[address] = value >>> 0;
    wordRefs.current[address]?.setValue(value);
  };

  const getWord = (address: number) => {
    if (address < 0 || address >= props.size)
      throw new Error(`Invalid address ${address}`);
    wordRefs.current[address]?.activate();
    return memory[address] >>> 0;
  };

  const readWord = async (ct: CancelToken) => {
    if (!machine.bus) return;
    ct.checkCancelled();
    let address = machine.bus.getAddressBus();
    if (focusRef.current) focusRef.current.setFocus(false);
    focusRef.current = wordRefs.current[address];
    focusRef.current?.setFocus(true);
    machine.mi?.enable("bus-address", `ram-word-${address}`, "address");
    await timeout(machine.clockInterval * 0.1, ct);
    machine.bus.setDataBus(getWord(address));
    machine.mi?.enable(`ram-word-${address}`, "bus-data", "data");
    await timeout(machine.clockInterval * 0.1, ct);
    machine.bus.setControlBus("ready");
    machine.mi?.disable();
    await timeout(machine.clockInterval * 0.1, ct);
  };

  const writeWord = async (ct: CancelToken) => {
    if (!machine.bus) return;
    ct.checkCancelled();
    let address = machine.bus.getAddressBus();
    if (focusRef.current) focusRef.current.setFocus(false);
    focusRef.current = wordRefs.current[address];
    focusRef.current?.setFocus(true);
    machine.mi?.enable("bus-address", `ram-word-${address}`, "address");
    await timeout(machine.clockInterval * 0.1, ct);
    setWord(address, machine.bus.getDataBus());
    machine.mi?.enable(`ram-word-${address}`, "bus-data", "data");
    await timeout(machine.clockInterval * 0.1, ct);
    machine.bus.setControlBus("ready");
    await timeout(machine.clockInterval * 0.1, ct);
  };

  useEffect(() => {
    setMemory(new Array(props.size).fill(0));
    wordRefs.current = new Array(props.size);
  }, [props.size]);

  const downloadAsTxt = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [memory.map((m) => m.toString(16).padStart(8, "0")).join(" ")],
      {
        type: "text/plain;charset=utf-8",
      }
    );
    element.href = URL.createObjectURL(file);
    element.target = "_blank";
    document.body.appendChild(element);
    element.click();
    setTimeout(() => {
      element.remove();
    }, 1000);
  };

  return (
    <>
      <ReactTooltip
        anchorSelect=".ram-word"
        place="top"
        variant="dark"
        style={{ zIndex: 1000000 }}
        render={({ content, activeAnchor }) => {
          if (!activeAnchor) {
            return <div />;
          }
          const attrNum = activeAnchor.getAttribute("data-num");
          const attrAddress = activeAnchor.id.split("-")[2];
          if (!attrNum || !attrAddress) return <div />;
          const num = +attrNum;
          const address = +attrAddress;
          let instr: DecodedInstr | undefined = undefined;
          try {
            instr = decodeInstruction(num);
          } catch {}
          if (!instr) return <div />;
          return <MemoryVisualiser value={num} address={address} />;
        }}
      />
      <Card style={{ width: "360px", height: "460px" }}>
        <Card.Header>
          RAM{" "}
          <Button
            size="sm"
            variant="light"
            className="float-end pt-0"
            onClick={() => downloadAsTxt()}
          >
            <Download size={15} />
          </Button>
        </Card.Header>
        <Card.Body>
          <div style={{ position: "fixed" }} className="ram">
            {[...Array(26).keys()].map((index) => {
              return (
                <span
                  key={index}
                  style={{
                    position: "absolute",
                    left: `-5px`,
                    top: `${index * 15}px`,
                    color: "#777",
                  }}
                >
                  0x{(index * 5).toString(16).padStart(2, "0")}
                </span>
              );
            })}
            {memory.map((value, index) => {
              const x = index % 5;
              const y = Math.floor(index / 5);
              return (
                <Word
                  key={index}
                  address={index}
                  ref={(el) => (wordRefs.current[index] = el)}
                  style={{
                    position: "absolute",
                    left: `${x * 60 + 30}px`,
                    top: `${y * 15}px`,
                  }}
                />
              );
            })}
          </div>
        </Card.Body>
      </Card>
    </>
  );
});

export default RAM;
export { RAMRef };
