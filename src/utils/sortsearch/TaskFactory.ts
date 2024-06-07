import { Comparison, Pass, SearchTask, SortTask } from "./ITask";

const makeUniqueRandomArray = (n: number) => {
  const arr = [...Array(n * 10).keys()]
    .sort((a, b) => 0.5 - Math.random())
    .map((n) => n + 1)
    .slice(0, n);
  return arr;
};

const makeLinearSearch: (numberOfCards: number) => SearchTask = (
  numberOfCards
) => {
  let cards = makeUniqueRandomArray(numberOfCards).map((n) => n.toString());
  let targetIdx = Math.floor(Math.random() * numberOfCards);
  let target = cards[targetIdx];
  let steps = [...Array(targetIdx + 1).keys()].map((i) => cards[i]);
  const description = "Perform a linear search for the target value";
  return { cards, target, steps, description, type: "search" };
};

const makeBinarySearch: (numberOfCards: number) => SearchTask = (
  numberOfCards
) => {
  let cardValues = makeUniqueRandomArray(numberOfCards).sort((a, b) => a - b);
  let cards = cardValues.map((n) => n.toString());
  let targetIdx = Math.floor(Math.random() * numberOfCards);
  let target = cards[targetIdx];
  let targetValue = cardValues[targetIdx];
  let ul = cards.length - 1;
  let ll = 0;
  let steps: string[] = [];
  while (ul > ll) {
    let middle = Math.floor((ul + ll) / 2);
    steps.push(cards[middle]);
    if (cardValues[middle] === targetValue) {
      break;
    } else if (cardValues[middle] < targetValue) {
      ll = middle + 1;
    } else {
      ul = middle - 1;
    }
  }
  if (!steps.includes(target)) {
    steps.push(target);
  }
  const description = "Perform a binary search for the target value";
  return { cards, target, steps, description, type: "search" };
};

const makeBubbleSort: (numberOfCards: number) => SortTask = (numberOfCards) => {
  let numbers = makeUniqueRandomArray(numberOfCards);
  let ns = [...numbers];
  const description = "Perform a bubble sort";
  let passes: Pass[] = [];
  for (let i = 0; i < ns.length - 1; i++) {
    let comparisons: Comparison[] = [];
    for (let j = 0; j < ns.length - i - 1; j++) {
      let swap = false;
      if (ns[j] > ns[j + 1]) {
        swap = true;
        let temp = ns[j];
        ns[j] = ns[j + 1];
        ns[j + 1] = temp;
      }
      comparisons.push({ i: j, j: j + 1, swap, others: [] });
    }
    passes.push({ comparisons });
  }
  return { numbers, description, passes, type: "bubble" };
};

const range = (start: number, end: number) => {
  return [...Array(end - start).keys()].map((i) => i + start);
};

const makeMergeSort: (numberOfCards: number) => SortTask = (numberOfCards) => {
  let numbers = makeUniqueRandomArray(numberOfCards);
  let ns = [...numbers];
  const description = "Perform a merge sort";
  let passes: Pass[] = [];
  let level = 1;
  let nextNs: number[] = [];
  while (level < ns.length - 1) {
    let comparisons: Comparison[] = [];
    for (let i = 0; i < ns.length / level / 2; i++) {
      let leftBase = i * level * 2;
      let rightBase = leftBase + level;
      let a = 0;
      let b = 0;
      while (a < level && b < level) {
        let swap = false;
        let x = a + leftBase;
        let y = b + rightBase;
        if (ns[x] < ns[y]) {
          a++;
          nextNs.push(ns[x]);
        } else {
          b++;
          swap = true;
          nextNs.push(ns[y]);
        }
        let others: number[] = [];
        if (a === level) {
          others = range(y, rightBase + level);
        } else if (b === level) {
          others = range(x, rightBase);
        }
        for (const o of others) {
          nextNs.push(ns[o]);
        }

        comparisons.push({
          i: x,
          j: y,
          swap,
          others: others,
        });
      }
    }
    passes.push({ comparisons });
    level *= 2;
    ns = nextNs;
    nextNs = [];
  }
  return { numbers, description, passes, type: "merge" };
};

const TaskFactory = () => {
  return {
    createTask: (noMerge: boolean) => {
      let randSelection = Math.floor(Math.random() * (noMerge ? 3 : 4));
      if (randSelection === 0)
        return makeLinearSearch(Math.floor(Math.random() * 10) + 5);
      if (randSelection === 1)
        return makeBinarySearch(Math.floor(Math.random() * 5) + 10);
      if (randSelection === 2)
        return makeBubbleSort(Math.floor(Math.random() * 4) + 4);
      return makeMergeSort(Math.pow(2, Math.floor(Math.random() * 2) + 2));
    },
  };
};

export default TaskFactory;
