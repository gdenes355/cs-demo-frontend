import { prod } from "../MathUtils";
import TaskModel from "./TaskModel";
import { TaskOutcome } from "./TaskResult";

function approxEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.0001;
}

function cmp(a: Array<number>, b: Array<number>) {
  a = a.filter((x) => x !== 1); // copy and remove 1s
  b = b.filter((x) => x !== 1); // copy and remove 1s

  return approxEqual(prod(a), prod(b)); // simple test for now: are the two prods equal?
}

function evaluateTaskSolution(
  task: TaskModel,
  numerator: Array<number>,
  denominator: Array<number>
) {
  let num = cmp(task.numerator, numerator);
  let den = cmp(task.denominator, denominator);
  let frac = approxEqual(
    prod(task.numerator) / prod(task.denominator),
    prod(numerator) / prod(denominator));

  let overall = (num && den) || frac;

  let numeratorOutcome = num ? TaskOutcome.SUCCESS : TaskOutcome.FAILED;
  let denominatorOutcome = den ? TaskOutcome.SUCCESS : TaskOutcome.FAILED;
  let outcome = overall ? TaskOutcome.SUCCESS : TaskOutcome.FAILED;
  console.log(
    "comparing",
    task,
    numerator,
    denominator,
    numeratorOutcome,
    denominatorOutcome
  );
  return { outcome, numeratorOutcome, denominatorOutcome };
}

export default evaluateTaskSolution;
