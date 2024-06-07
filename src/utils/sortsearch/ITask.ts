type ITask = {
  type: string;
};

type Comparison = {
  i: number;
  j: number;
  swap: boolean;
  others: number[];
};

type Pass = {
  comparisons: Comparison[];
};

type SortTask = ITask & {
  numbers: number[];
  description: string;
  passes: Pass[];
};

type SearchTask = ITask & {
  description: string;
  cards: string[];
  target: string;
  steps: string[];
};

export default ITask;
export { SortTask, Pass, Comparison, SearchTask };
