type Representation = "decimal" | "binary" | "/X" | "classful";

type TaskModel = {
  ip: number;
  mask: number;
  networkId: number;
  hostId: number;
  numberOfHosts: number;

  ipRepresentation: Representation;
  maskRepresentation: Representation;
  networkIdRepresentation: Representation;
  hostIdRepresentation: Representation;
};

export default TaskModel;
export { Representation };
