type TaskModel = {
  text: string;
  numerator: Array<number>;
  denominator: Array<number>;
  customValues: Array<number>;
  numeratorLabel: string;
  denominatorLabels: string[];
};

export default TaskModel;
