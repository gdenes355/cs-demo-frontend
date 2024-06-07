import React, { useEffect, useRef, useState } from "react";
import AssemblyEditor, {
  AssemblyEditorRef,
} from "../components/compsim/AssemblyEditor";
import {
  CompileError,
  assemble as doAssemble,
} from "../utils/compsim/Assembler";
import RAM, { RAMRef } from "../components/compsim/RAM";
import CPU, { CPURef } from "../components/compsim/CPU";
import Bus, { BusRef } from "../components/compsim/Bus";

import { CancelToken } from "../utils/CancelToken";
import MachineContext, {
  MachineType,
} from "../components/compsim/MachineContext";
import { CancelledError } from "../utils/CancelledError";
import Output, { OutputRef } from "../components/compsim/Output";
import { Card } from "react-bootstrap";
import MoveIndicator, {
  MoveIndicatorRef,
} from "../components/compsim/MoveIndicator";

import "react-tooltip/dist/react-tooltip.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useLocation } from "react-router-dom";
import HelpInstrSet from "../components/compsim/HelpInstrSet";

import "./ComputerSimulator.css";

const RAM_SIZE = 128;

const ComputerSimulator = () => {
  const searchParams = new URLSearchParams(useLocation().search);
  const machineType: MachineType =
    searchParams.get("mode")?.toUpperCase() === "A" ? "A-Level" : "GCSE";

  const ram = useRef<RAMRef | null>(null);
  const cpu = useRef<CPURef | null>(null);
  const bus = useRef<BusRef | null>(null);
  const screen = useRef<OutputRef | null>(null);
  const moveIndicator = useRef<MoveIndicatorRef | null>(null);
  const assemblyEditor = useRef<AssemblyEditorRef | null>(null);
  const [initialised, setInitialised] = useState(false);
  const [nominalSpeed, setNominalSpeed] = useState(5);
  const [clockInterval, setClockInterval] = useState(1000);

  const [running, setRunning] = useState(false);

  const currentCT = useRef<CancelToken | undefined>(undefined);

  useEffect(() => {
    setClockInterval(16000 / 2 ** nominalSpeed);
  }, [nominalSpeed]);

  const assemble = (assembly: string) => {
    setError(undefined);
    try {
      let assemblyRes = doAssemble(assembly);
      for (let i = 0; i < assemblyRes.machineCode.length; i++) {
        ram.current?.setWord(i, assemblyRes.machineCode[i]);
      }
      assemblyEditor.current?.setLineMap(assemblyRes.lineMap);
    } catch (e) {
      if (e instanceof CompileError) {
        setError(e);
      } else {
        console.log(e);
      }
    }
  };
  const [error, setError] = React.useState<CompileError | undefined>(undefined);

  const run = async () => {
    if (!cpu.current || !bus.current || !ram.current) {
      return;
    }
    if (currentCT.current) {
      currentCT.current.cancel();
    }
    setRunning(true);
    cpu.current?.reset();

    let ct = new CancelToken();
    currentCT.current = ct;
    try {
      while (true) {
        if (currentCT.current?.isCancelled()) {
          break;
        }
        await cpu.current?.fetch(ct);
        await cpu.current?.decode(ct);
        await cpu.current?.execute(ct);
      }
    } catch (e) {
      if (e instanceof CancelledError) {
        console.log("Cancelled");
      } else {
        console.log(e);
      }
    }
    setRunning(false);
  };

  const reset = () => {
    currentCT.current?.cancel();
    cpu.current?.reset();
    ram.current?.clear();
    screen.current?.clear();
    assemblyEditor.current?.resetHighlights();
    moveIndicator.current?.disable();
  };

  const refsChanged = () => {
    if (
      !cpu.current ||
      !bus.current ||
      !ram.current ||
      !screen.current ||
      !moveIndicator ||
      !assemblyEditor
    ) {
      return;
    }
    setInitialised(true);
  };

  return (
    <div>
      <MachineContext.Provider
        value={{
          cpu: cpu.current,
          bus: bus.current,
          ram: ram.current,
          screen: screen.current,
          assemblyEditor: assemblyEditor.current,
          initialised,
          clockInterval,
          fetchBoost: 1,
          decodeBoost: 1,
          mi: moveIndicator.current,
          machineType,
        }}
      >
        <div
          style={{
            position: "fixed",
            left: "15px",
            top: "25px",
            width: "350px",
          }}
        >
          <Card bg="light" className="p-2">
            <Card.Title>
              Code
              <span
                className="float-end pt-0 help"
                style={{ cursor: "default" }}
              >
                ?
              </span>
            </Card.Title>
            <Card.Body>
              <AssemblyEditor
                onAssemble={assemble}
                error={error}
                ref={(e) => {
                  assemblyEditor.current = e;
                  refsChanged();
                }}
              />
            </Card.Body>
          </Card>
        </div>

        <div style={{ position: "fixed", left: "400px", top: "25px" }}>
          <CPU
            ref={(c) => {
              cpu.current = c;
              refsChanged();
            }}
            onReset={reset}
            canRun={!error && !running}
            onRun={run}
            nominalSpeed={nominalSpeed}
            onNominalSpeedChange={setNominalSpeed}
          />
        </div>

        <div style={{ position: "fixed", left: "802.5px", top: "100px" }}>
          <Bus
            ref={(b) => {
              bus.current = b;
              refsChanged();
            }}
          />
        </div>
        <div style={{ position: "fixed", left: "400px", top: "550px" }}>
          <Output
            ref={(o) => {
              screen.current = o;
              refsChanged();
            }}
            hidden={machineType === "A-Level"}
          />
        </div>
        <div style={{ position: "fixed", left: "1000px", top: "25px" }}>
          <RAM
            ref={(r) => {
              ram.current = r;
              refsChanged();
            }}
            size={RAM_SIZE}
            bus={bus.current}
          />
        </div>
        <div
          style={{
            position: "fixed",
            left: "0px",
            top: "0px",
            width: "0px",
            height: "0px",
          }}
        >
          <MoveIndicator
            ref={(c) => {
              moveIndicator.current = c;
              refsChanged();
            }}
          />
        </div>
        <ReactTooltip
          anchorSelect=".help"
          variant="light"
          border="1px solid black"
        >
          <HelpInstrSet />
        </ReactTooltip>
      </MachineContext.Provider>
    </div>
  );
};

export default ComputerSimulator;
