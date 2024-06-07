import React, { RefObject, useMemo } from "react";
import { Col, Overlay, Row } from "react-bootstrap";
import { useDroppable } from "@dnd-kit/core";
import TaskResult, { TaskOutcome } from "../../utils/exp/TaskResult";

import "./Task.css";
import TaskModel from "../../utils/exp/TaskModel";

type TaskProps = {
  numerator: Array<number>;
  denominator: Array<number>;
  text: string;
  result?: TaskResult;
  task: TaskModel;
  onRemoveFromNumerator: (label: string) => void;
  onRemoveFromDenominator: (label: string) => void;
};

type EqNumProps = {
  label: string;
  outcome?: TaskOutcome;
  onClick: (label: string) => void;
};

const EqNum = (props: EqNumProps) => {
  const { label, outcome, onClick } = props;

  if (label === "x" || label === "1" || outcome !== undefined) {
    return <span className="eqitem">{label}</span>;
  }
  return (
    <span className="eqitem removable" onClick={(e) => onClick(label)}>
      {props.label}
    </span>
  );
};

type EqRowProps = {
  name: string;
  values: Array<number>;
  outcome?: TaskOutcome;
  onRemove: (label: string) => void;
};

const EqRow = (props: EqRowProps) => {
  let { values, name } = props;

  const texts = useMemo(() => {
    let res: string[] = [];
    let avalues = values;
    if (avalues.length === 0) {
      avalues = [1];
    }

    avalues.forEach((v, i) => {
      res.push(v.toString());
      if (i < avalues.length - 1) {
        res.push("x");
      }
    });
    return res;
  }, [values]);

  const { isOver, setNodeRef } = useDroppable({
    id: name,
  });

  let classApp = "eqrow";
  if (props.outcome !== undefined) {
    classApp =
      props.outcome === TaskOutcome.FAILED
        ? classApp + " border border-danger  bg-danger bg-opacity-10"
        : classApp + " border border-success bg-success bg-opacity-10";
  } else if (isOver) {
    classApp += " bg-info";
  }

  return (
    <div ref={setNodeRef} className={"p-2 fw-bold rounded-pill " + classApp}>
      {texts.map((t, i) => (
        <EqNum
          key={i}
          label={t}
          outcome={props.outcome}
          onClick={props.onRemove}
        />
      ))}
    </div>
  );
};

type SolutionPopupProps = {
  result?: TaskResult;
  target: RefObject<HTMLElement>;
  task: TaskModel;
};

const SolutionPopup = (props: SolutionPopupProps) => {
  const { result } = props;
  if (!result) {
    return <></>;
  }

  return (
    <Overlay
      target={props.target}
      show={result.outcome === TaskOutcome.FAILED}
      placement="bottom"
    >
      <div className="m-3">
        <div style={{ textAlign: "center", borderBottom: "solid 1px" }}>
          {props.task.numerator.join(" x ")}
        </div>
        <div style={{ textAlign: "center" }}>
          {props.task.denominator.join(" x ")}
        </div>
      </div>
    </Overlay>
  );
};

type EquationProps = {
  numerator: Array<number>;
  denominator: Array<number>;
  result?: TaskResult;
  onRemoveFromNumerator: (label: string) => void;
  onRemoveFromDenominator: (label: string) => void;
};

const Equation = (props: EquationProps) => {
  let bg = "";
  if (props.result?.outcome === TaskOutcome.FAILED) {
    bg = " border border-danger";
  } else if (props.result?.outcome === TaskOutcome.SUCCESS) {
    bg = " border border-success";
  }

  return (
    <div className={"p-5 rounded-pill" + bg}>
      <Row className="border-bottom text-center border-dark border-2">
        <EqRow
          name="numerator"
          values={props.numerator}
          outcome={props.result?.numeratorOutcome}
          onRemove={props.onRemoveFromNumerator}
        />
      </Row>
      <Row className="text-center">
        <EqRow
          name="denominator"
          values={props.denominator}
          outcome={props.result?.denominatorOutcome}
          onRemove={props.onRemoveFromDenominator}
        />
      </Row>
    </div>
  );
};

const Task = (props: TaskProps) => {
  const eqRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <Row className="m-3">
        <p className="fw-bold">{props.text}</p>
        <p className="fst-italic mb-5">
          Drag and drop the correct numbers from the left to the equation
          (fraction) below
        </p>
      </Row>
      <Row>
        <Col md={4}></Col>
        <Col md={4} ref={eqRef}>
          <Equation
            numerator={props.numerator}
            denominator={props.denominator}
            result={props.result}
            onRemoveFromNumerator={props.onRemoveFromNumerator}
            onRemoveFromDenominator={props.onRemoveFromDenominator}
          />
          <SolutionPopup
            result={props.result}
            target={eqRef}
            task={props.task}
          />
        </Col>
      </Row>
    </>
  );
};

export default Task;
