import TaskModel, { Representation } from "./TaskModel";

const makeRandomIP = () => {
  let bytes = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
  let num = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  return (num >>> 0) & 0xffffffff;
};

const makeRandomMaskLen: () => number = () => {
  return Math.floor(Math.random() * 30) + 1;
};

const findIpRepresentation: () => Representation = () => {
  if (Math.random() < 0.5) {
    return "decimal";
  } else {
    return "binary";
  }
};

const findMaskRepresentation: (mask: number) => Representation = (mask) => {
  let options: Representation[] = ["decimal", "binary", "/X"];
  if (mask === 0xffffff00 || mask === 0xffff0000 || mask === 0xff000000) {
    options.push("classful");
  }
  return options[Math.floor(Math.random() * options.length)];
};

const TaskFactory = () => {
  return {
    createTask: () => {
      let ip = makeRandomIP();
      let maskLen = makeRandomMaskLen();
      let mask = parseInt("1".repeat(maskLen) + "0".repeat(32 - maskLen), 2);
      let networkId = ip & mask;
      let hostId = ip & ~mask;
      let numberOfHosts = 2 ** (32 - maskLen) - 2;
      let ipRepresentation = findIpRepresentation();
      let maskRepresentation = findMaskRepresentation(mask);
      let networkIdRepresentation = findIpRepresentation();
      let hostIdRepresentation = findIpRepresentation();
      let res: TaskModel = {
        ip,
        mask,
        networkId,
        hostId,
        numberOfHosts,
        ipRepresentation,
        maskRepresentation,
        networkIdRepresentation,
        hostIdRepresentation,
      };
      return res;
    },
  };
};

export default TaskFactory;
