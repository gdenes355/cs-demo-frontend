import React, { useEffect, useRef } from "react";
import { Button, Row } from "react-bootstrap";
import SortCard, { SortCardRef } from "./SortCard";
import { motion } from "framer-motion";
import { SortTask } from "../../utils/sortsearch/ITask";

type SortProps = {
  task: SortTask;
  onComplete?: (points: number) => void;
  onScoreChange?: (score: number) => void;
};

const BubbleSort = (props: SortProps) => {
  const [passIdx, setPassIdx] = React.useState(0);
  const [compIdx, setCompIdx] = React.useState(0);
  const [foundI, setFoundI] = React.useState(false);
  const [foundJ, setFoundJ] = React.useState(false);
  const [swapped, setSwapped] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const { task } = props;

  const cardRefs = useRef<(SortCardRef | null)[]>([]);

  useEffect(() => {
    setPassIdx(0);
    setCompIdx(0);
    setFoundI(false);
    setFoundJ(false);
    setDone(false);
  }, [props.task]);

  const onCardFlip = (faceUp: boolean, key: React.Key | undefined) => {
    if (!faceUp || key === undefined) return;

    if (key === task.passes[passIdx].comparisons[compIdx].i) {
      setFoundI(true);
    } else if (key === task.passes[passIdx].comparisons[compIdx].j) {
      setFoundJ(true);
    }
  };

  const forceFaceUpState = (i: number, faceUp: boolean) => {
    cardRefs.current[i]?.setFaceUp(faceUp);
  };

  useEffect(() => {
    if (foundI && foundJ) {
      const anim = async () => {
        props.onScoreChange?.(1);
        await new Promise((r) => setTimeout(r, 500));
        const i = task.passes[passIdx].comparisons[compIdx].i;
        const j = task.passes[passIdx].comparisons[compIdx].j;

        if (task.passes[passIdx].comparisons[compIdx].swap) {
          let temp = task.numbers[i];
          task.numbers[i] = task.numbers[j];
          task.numbers[j] = temp;
          setSwapped(true);

          await new Promise((r) => setTimeout(r, 300));
        }
        await new Promise((r) => setTimeout(r, 200));
        forceFaceUpState(i, false);
        forceFaceUpState(j, false);
        setFoundI(false);
        setFoundJ(false);
        setSwapped(false);
        if (compIdx === task.passes[passIdx].comparisons.length - 1) {
          if (passIdx === task.passes.length - 1) {
            props.onComplete?.(10);
            setDone(true);
            setCompIdx(0);
            setPassIdx(0);
            return;
          }
          setPassIdx((i) => (i === undefined ? 0 : i + 1));
          setCompIdx(0);
        } else {
          setCompIdx((i) => (i === undefined ? 0 : i + 1));
        }
      };
      anim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundI, foundJ]);
  if (
    passIdx >= task.passes.length ||
    compIdx >= task.passes[passIdx].comparisons.length
  ) {
    return <></>;
  }
  return (
    <>
      <p>{task.description}</p>
      <p>
        {done
          ? "Done"
          : `You are in pass ${passIdx + 1}, comparison ${compIdx + 1}`}
      </p>
      <Row>
        {task.numbers.map((c, i) => {
          const complete = task.numbers.length - passIdx <= i;
          const isI = task.passes[passIdx].comparisons[compIdx].i === i;
          const isJ = task.passes[passIdx].comparisons[compIdx].j === i;
          return (
            <SortCard
              key={c}
              ref={(el) => (cardRefs.current[i] = el)}
              dataKey={i}
              value={c + ""}
              canFlip={(isI && !foundI) || (isJ && !foundJ)}
              faceUp={done || complete ? true : undefined}
              resetSpy={task}
              variant={
                done || complete
                  ? "success"
                  : (isI || isJ) && swapped
                  ? "warning"
                  : "dark"
              }
              onFlipped={onCardFlip}
              onFailedFlip={() => props.onScoreChange?.(-1)}
            />
          );
        })}
      </Row>
    </>
  );
};

type MergeSortRowProps = {
  nextI?: number;
  nextJ?: number;
  level: number;
  numbers: (number | undefined)[];

  onFoundIJ?: (iEl: SortCardRef | null, jEl: SortCardRef | null) => void;

  canFlip?: boolean;

  resetSpy?: any;
  onScoreChange?: (score: number) => void;
};

const MergeSortRow: (props: MergeSortRowProps) => JSX.Element = (props) => {
  const sepVariants = {
    sep: {
      width: `${100 + 20 * props.level}px`,
      padding: 0,
      margin: 0,
    },
    noSep: {
      width: "100px",
      padding: 0,
      margin: 0,
    },
  };
  const [foundI, setFoundI] = React.useState(false);
  const [foundJ, setFoundJ] = React.useState(false);
  useEffect(() => {
    setFoundI(false);
  }, [props.nextI]);
  useEffect(() => {
    setFoundJ(false);
  }, [props.nextJ]);

  useEffect(() => {
    if (
      foundI &&
      foundJ &&
      props.nextI !== undefined &&
      props.nextJ !== undefined
    ) {
      props.onFoundIJ?.(
        cardRefs.current[props.nextI],
        cardRefs.current[props.nextJ]
      );
      setFoundI(false);
      setFoundJ(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundI, foundJ]);

  const cardRefs = useRef<(SortCardRef | null)[]>([]);

  useEffect(() => {}, [props.resetSpy]);
  return (
    <>
      <Row>
        {props.numbers.map((n, i) => {
          const sep = (i + 1) % props.level === 0;

          return (
            <motion.div
              style={{ width: sep ? 20 * props.level + 100 : 100 }}
              key={i + "-sep"}
              animate={sep ? "sep" : "noSep"}
              variants={sepVariants}
              transition={{ duration: 0.2 }}
            >
              <SortCard
                ref={(el) => (cardRefs.current[i] = el)}
                value={n + ""}
                faceUp={
                  n === undefined
                    ? false
                    : props.nextI === undefined
                    ? true
                    : undefined
                }
                key={n}
                variant={n === undefined ? "dark" : "primary"}
                canFlip={
                  props.canFlip &&
                  ((i === props.nextI && !foundI) ||
                    (i === props.nextJ && !foundJ))
                }
                onFlipped={(faceUp, key) => {
                  if (i === props.nextI) {
                    setFoundI(true);
                  } else if (i === props.nextJ) {
                    setFoundJ(true);
                  }
                }}
                onFailedFlip={() => props.onScoreChange?.(-1)}
              />
            </motion.div>
          );
        })}
      </Row>
    </>
  );
};

const MergeSort = (props: SortProps) => {
  const { task } = props;

  const [sepLevel, setSepLevel] = React.useState(task.numbers.length);
  const [passIdx, setPassIdx] = React.useState(0);
  const [compIdx, setCompIdx] = React.useState(0);
  const [phase, setPhase] = React.useState<"divide" | "conquer">("divide");

  const topNums = useRef<(number | undefined)[]>(task.numbers);
  const bottomNums = useRef<(number | undefined)[]>(
    task.numbers.map((n) => undefined)
  );

  useEffect(() => {
    setPassIdx(0);
    setCompIdx(0);
    topNums.current = [...task.numbers];
    setSepLevel(task.numbers.length);
    setPhase("divide");
    bottomNums.current = task.numbers.map((n) => undefined);
  }, [props.task, task.numbers]);

  const move = (i: number) => {
    let idx = bottomNums.current.findIndex((n) => n === undefined);
    bottomNums.current[idx] = topNums.current[i];
    topNums.current[i] = undefined;
  };

  useEffect(() => {
    if (sepLevel === 1) {
      setPhase("conquer");
    }
  }, [sepLevel]);

  const onFoundIJ = (iEl: SortCardRef | null, jEl: SortCardRef | null) => {
    const anim = async () => {
      props.onScoreChange?.(1);
      await new Promise((r) => setTimeout(r, 500));
      if (task.passes[passIdx].comparisons[compIdx].swap) {
        move(task.passes[passIdx].comparisons[compIdx].j);
      } else {
        move(task.passes[passIdx].comparisons[compIdx].i);
      }
      if (iEl) {
        iEl.setFaceUp(false);
      }
      if (jEl) {
        jEl.setFaceUp(false);
      }
      for (
        let i = 0;
        i < task.passes[passIdx].comparisons[compIdx].others.length;
        i++
      ) {
        move(task.passes[passIdx].comparisons[compIdx].others[i]);
      }

      if (compIdx === task.passes[passIdx].comparisons.length - 1) {
        if (passIdx === task.passes.length - 1) {
          props.onComplete?.(10);
          setPassIdx(0);
          setCompIdx(0);
          return;
        }
        setPassIdx((i) => (i === undefined ? 0 : i + 1));
        setCompIdx(0);
        await new Promise((r) => setTimeout(r, 1000));
        topNums.current = [...bottomNums.current];
        bottomNums.current = task.numbers.map((n) => undefined);
        setSepLevel((i) => i * 2);
      } else {
        setCompIdx((i) => (i === undefined ? 0 : i + 1));
      }
    };
    anim();
  };

  if (
    passIdx >= task.passes.length ||
    compIdx >= task.passes[passIdx].comparisons.length
  ) {
    return <></>;
  }
  return (
    <>
      <p>{task.description}</p>
      <Button
        variant="outline-primary"
        onClick={() => {
          setSepLevel((i) => Math.ceil(i / 2));
          props.onScoreChange?.(1);
        }}
        disabled={phase !== "divide"}
      >
        Divide
      </Button>
      <MergeSortRow
        nextI={task.passes[passIdx].comparisons[compIdx].i}
        nextJ={task.passes[passIdx].comparisons[compIdx].j}
        level={sepLevel}
        numbers={topNums.current}
        onFoundIJ={onFoundIJ}
        canFlip={phase === "conquer"}
        onScoreChange={props.onScoreChange}
      />
      {phase === "conquer" && (
        <MergeSortRow level={sepLevel * 2} numbers={bottomNums.current} />
      )}
  </>
  );
};

export { MergeSort, BubbleSort };
