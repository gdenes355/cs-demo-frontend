import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import Search from "../components/sortsearch/Search";
import { BubbleSort, MergeSort } from "../components/sortsearch/Sort";
import ITask, { SearchTask, SortTask } from "../utils/sortsearch/ITask";
import TaskFactory from "../utils/sortsearch/TaskFactory";
import ResultDisplay from "../components/ResultDisplay";
import { useLocation } from "react-router-dom";

const SortSearch = () => {
  const searchParams = new URLSearchParams(useLocation().search);
  const noMerge = !!searchParams.get("nomerge");
  const [task, setTask] = useState<ITask | undefined>(undefined);
  const [score, setScore] = useState<number>(0);
  useEffect(() => {
    setTask(TaskFactory().createTask(noMerge));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onComplete = (points: number) => {
    setTimeout(() => {
      setTask(TaskFactory().createTask(!noMerge));
    }, 1000);
    setScore((x) => x + points);
  };

  if (!task) return <></>;

  if (task?.type === "search") {
    return (
      <div>
        <Container>
          <h1>GCSE Algorithms</h1>
          <Search
            task={task as SearchTask}
            onComplete={onComplete}
            onScoreChange={(n) => setScore((x) => x + n)}
          />
          <ResultDisplay score={score} />
        </Container>
      </div>
    );
  } else {
    return (
      <div>
        <Container>
          <h1>GCSE Algorithms</h1>
          {task?.type === "merge" ? (
            <MergeSort
              task={task as SortTask}
              onComplete={onComplete}
              onScoreChange={(n) => setScore((x) => x + n)}
            />
          ) : (
            <BubbleSort
              task={task as SortTask}
              onComplete={onComplete}
              onScoreChange={(n) => setScore((x) => x + n)}
            />
          )}
          <ResultDisplay score={score} />
        </Container>
      </div>
    );
  }
};

export default SortSearch;
