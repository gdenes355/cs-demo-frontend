import React, { useEffect } from "react";
import { Row } from "react-bootstrap";
import SortCard from "./SortCard";
import { SearchTask } from "../../utils/sortsearch/ITask";

type SearchProps = {
  task: SearchTask;
  onComplete?: (points: number) => void;
  onScoreChange?: (score: number) => void;
};

const Search = (props: SearchProps) => {
  const [stepIdx, setStepIdx] = React.useState<number>(0);
  const { task } = props;

  useEffect(() => {
    setStepIdx(0);
  }, [task]);

  const onFlipped = () => {
    if (stepIdx === task.steps.length - 1) {
      props.onComplete?.(10);
      return;
    }
    setStepIdx((i) => (i === undefined ? 0 : i + 1));
    props.onScoreChange?.(1);
  };
  return (
    <div>
      <SortCard value={task.target} canFlip={false} faceUp={true} />
      <p>{task.description}</p>
      <Row>
        {task.cards.map((c) => (
          <SortCard
            key={c}
            value={c}
            canFlip={task.steps[stepIdx] === c}
            onFlipped={onFlipped}
            resetSpy={task}
            variant="dark"
            onFailedFlip={() => props.onScoreChange?.(-1)}
          />
        ))}
      </Row>
    </div>
  );
};

export default Search;
