import React, { useState, useMemo, useEffect } from "react";
import { Button, Col, Container, FormCheck, Row } from "react-bootstrap/";
import Drawer from "../components/exp/Drawer";
import {
  useSensor,
  MouseSensor,
  TouchSensor,
  DndContext,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import Number from "../components/exp/Number";
import Task from "../components/exp/Task";
import TaskFactory from "../utils/exp/TaskFactory";
import ResultDisplay from "../components/ResultDisplay";
import TaskResult, { TaskOutcome } from "../utils/exp/TaskResult";
import evaluateTaskSolution from "../utils/exp/evaluateTaskSolution";
import { useLocation } from "react-router-dom";
import CalcTriangle from "../components/exp/CalcTriangle";

const SizeExpressionGame = () => {
  const searchParams = new URLSearchParams(useLocation().search);
  const network = !!searchParams.get("network");
  const audio = !!searchParams.get("audio");
  const bitmap = !!searchParams.get("bitmap");
  const resolution = !!searchParams.get("resolution");

  const initialTask = useMemo(
    () =>
      TaskFactory.createTask({
        bitmap,
        network,
        audio,
        resolution,
      }),
    [audio, bitmap, network, resolution]
  );

  useEffect(() => {
    setEnableAudioSizeQs(audio);
    setEnableImageSizeQs(bitmap || (!audio && !network && !resolution));
    setEnableResolutionQs(resolution);
    setEnableNetworkQs(network);
  }, [audio, bitmap, network, resolution]);

  const [numerator, setNumerator] = useState<Array<number>>([]);
  const [denominator, setDenominator] = useState<Array<number>>([]);
  const [draggedNumber, setDraggedNumber] = useState(null);
  const [activeTask, setActiveTask] = useState(initialTask);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [enableAudioSizeQs, setEnableAudioSizeQs] = useState(false);
  const [enableImageSizeQs, setEnableImageSizeQs] = useState(true);
  const [enableResolutionQs, setEnableResolutionQs] = useState(false);
  const [enableNetworkQs, setEnableNetworkQs] = useState(false);

  const [hintEnabled, setHintEnabled] = useState(false);

  const activationConstraint = { distance: 15 };
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const sensors = useSensors(mouseSensor, touchSensor);
  function handleDragStart(event: DragStartEvent) {
    setDraggedNumber(event.active.data.current?.number);
  }
  function handleDragEnd(event: DragEndEvent) {
    setDraggedNumber(null);
    if (result) {
      return;
    }
    let number = event.active.data.current?.number;
    let to = event.over?.id;
    if (number && to) {
      if (to === "numerator") {
        setNumerator([...numerator, number]);
      } else {
        setDenominator([...denominator, number]);
      }
    }
  }

  const onCheck = () => {
    if (result) {
      return;
    }
    let newRes = evaluateTaskSolution(activeTask, numerator, denominator);
    setResult(newRes);
    if (newRes.outcome === TaskOutcome.SUCCESS) {
      if (hintEnabled) {
        setScore((score) => score + 3);
      } else {
        setScore((score) => score + 5);
      }
    } else {
      if (newRes.numeratorOutcome === TaskOutcome.SUCCESS) {
        setScore((score) => score - 1);
      } else if (newRes.denominatorOutcome === TaskOutcome.SUCCESS) {
        setScore((score) => score - 1);
      } else {
        setScore((score) => score - 3);
      }
    }
  };

  const onNextQuestion = () => {
    setNumerator([]);
    setDenominator([]);
    setResult(null);
    setActiveTask(
      TaskFactory.createTask({
        audio: enableAudioSizeQs,
        bitmap: enableImageSizeQs,
        resolution: enableResolutionQs,
        network: enableNetworkQs,
      })
    );
    setHintEnabled(false);
  };

  const removeSingle = (label: string, list: number[]) => {
    let newList: number[] = [];
    let removed = false;
    for (let item of list) {
      if (item.toString() === label && !removed) {
        removed = true;
        continue;
      }
      newList.push(item);
    }

    return newList;
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Row className="h-75 border-bottom bg-light border-3">
          <Col sm={2} xs={4} className="border-end border-1">
            <Drawer customValues={activeTask.customValues} />
          </Col>
          <Col>
            <Task
              task={activeTask}
              numerator={numerator}
              denominator={denominator}
              text={activeTask.text}
              result={result || undefined}
              onRemoveFromNumerator={(l) =>
                setNumerator(removeSingle(l, numerator))
              }
              onRemoveFromDenominator={(l) =>
                setDenominator(removeSingle(l, denominator))
              }
            />
            <div className={result ? " d-none" : ""}>
              <Button
                className="float-end m-3"
                variant="success"
                onClick={onCheck}
              >
                Check
              </Button>
              <Button
                className={
                  hintEnabled ? " d-none float-end m-3" : "float-end m-3"
                }
                variant="info"
                onClick={(e) => setHintEnabled(true)}
              >
                Hint
              </Button>
            </div>
            <div className={result ? "" : " d-none"}>
              <Button
                className="float-end m-3"
                variant="info"
                onClick={onNextQuestion}
              >
                Next Question
              </Button>
            </div>
            <div>
              <CalcTriangle
                numerator={activeTask.numeratorLabel}
                denominator={activeTask.denominatorLabels}
                hidden={!hintEnabled}
              />
            </div>
          </Col>
        </Row>
        <Row className="h-25">
          <Col>
            <Container className="m-3">
              Enabled question types:
              <FormCheck
                id="audio-qs-switch"
                type="switch"
                label="Audio size questions"
                checked={enableAudioSizeQs}
                onChange={() => setEnableAudioSizeQs((v) => !v)}
              />
              <FormCheck
                id="image-qs-switch"
                type="switch"
                label="Image size questions"
                checked={enableImageSizeQs}
                onChange={() => setEnableImageSizeQs((v) => !v)}
              />
              <FormCheck
                id="resolution-qs-switch"
                type="switch"
                label="Resolution questions"
                checked={enableResolutionQs}
                onChange={() => setEnableResolutionQs((v) => !v)}
              />
              <FormCheck
                id="network-qs-switch"
                type="switch"
                label="Network questions"
                checked={enableNetworkQs}
                onChange={() => setEnableNetworkQs((v) => !v)}
              />
            </Container>
          </Col>
          <Col className="me-5">
            <ResultDisplay score={score} />
          </Col>
        </Row>
        {draggedNumber && !result ? (
          <DragOverlay>
            <Number number={draggedNumber} />
          </DragOverlay>
        ) : null}
      </DndContext>
    </>
  );
};

export default SizeExpressionGame;
