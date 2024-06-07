enum TaskOutcome {
  SUCCESS,
  FAILED,
}
type TaskResult = {
  outcome: TaskOutcome;
  numeratorOutcome: TaskOutcome;
  denominatorOutcome: TaskOutcome;
};

export default TaskResult;

export { TaskOutcome };
