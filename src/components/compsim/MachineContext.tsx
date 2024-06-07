import { createContext } from "react";
import { BusRef } from "./Bus";
import { CPURef } from "./CPU";
import { RAMRef } from "./RAM";
import { OutputRef } from "./Output";
import { MoveIndicatorRef } from "./MoveIndicator";
import { AssemblyEditorRef } from "./AssemblyEditor";

type MachineType = "GCSE" | "A-Level";

type MachineContextType = {
  cpu: CPURef | null;
  bus: BusRef | null;
  ram: RAMRef | null;
  mi: MoveIndicatorRef | null;
  screen: OutputRef | null;
  assemblyEditor: AssemblyEditorRef | null;
  initialised: boolean;
  clockInterval: number;
  fetchBoost: number;
  decodeBoost: number;
  machineType: MachineType;
};

const defaultContext: MachineContextType = {
  cpu: null,
  bus: null,
  ram: null,
  screen: null,
  mi: null,
  assemblyEditor: null,
  initialised: false,
  clockInterval: 1000,
  fetchBoost: 1,
  decodeBoost: 10,
  machineType: "GCSE",
};

const MachineContext = createContext(defaultContext);

export default MachineContext;
export { MachineType };
