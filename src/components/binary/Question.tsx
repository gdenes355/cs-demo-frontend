import React, { useImperativeHandle } from "react";
import { bin2dec, dec2bin } from "../../utils/numbases";
import { Alert, Col, Row } from "react-bootstrap";

import "./Question.css";

enum QuestionType {
  DEC2BIN = 0,
  HEX2BIN = 1,
  LOG_SH = 2,
  ARI_SH = 3,
  ADDITION = 4,
  MAX,
}

type QuestionProps = {
  initialValue: number;
  arg?: number;
  questionType: QuestionType;
};

type QuestionHandle = {
  getAnswer: () => number;
};

type SubQuestionProps = { initialValue: number; arg: number };

const QuestionDec2Bin = (props: SubQuestionProps) => {
  return <span>decimal {props.initialValue} to binary</span>;
};

const Hex2Bin = (props: SubQuestionProps) => {
  const value =
    props.initialValue < 0 ? props.initialValue + 256 : props.initialValue;
  return <span>hex 0x{value.toString(16)} to binary</span>;
};

const ArithmeticShift = (props: SubQuestionProps) => {
  if (props.arg > 0) {
    return (
      <span>
        Arithmetic shift {dec2bin(props.initialValue)} left by {props.arg}
      </span>
    );
  } else {
    return (
      <span>
        Arithmetic shift {dec2bin(props.initialValue)} right by {-props.arg}
      </span>
    );
  }
};

const LogicalShift = (props: SubQuestionProps) => {
  if (props.arg > 0) {
    return (
      <span>
        Logical shift {dec2bin(props.initialValue)} left by {props.arg}
      </span>
    );
  } else {
    return (
      <span>
        Logical shift {dec2bin(props.initialValue)} right by {-props.arg}
      </span>
    );
  }
};

const Addition = (props: SubQuestionProps) => {
  return (
    <div>
      <Row>
        &nbsp;
        {dec2bin(props.initialValue).map((d, i) => (
          <Col style={{ textAlign: "center" }} key={i}>
            {d}
          </Col>
        ))}
      </Row>
      <Row>
        +
        {dec2bin(props.arg).map((d, i) => (
          <Col style={{ textAlign: "center" }} key={i}>
            {d}
          </Col>
        ))}
      </Row>
    </div>
  );
};

const componentMap: Map<
  QuestionType,
  (props: SubQuestionProps) => React.ReactNode
> = new Map([
  [QuestionType.DEC2BIN, QuestionDec2Bin],
  [QuestionType.HEX2BIN, Hex2Bin],
  [QuestionType.ARI_SH, ArithmeticShift],
  [QuestionType.LOG_SH, LogicalShift],
  [QuestionType.ADDITION, Addition],
]);

const arSh = (dec: number, n: number) => {
  let bin = dec2bin(dec);
  if (n > 0) {
    for (let i = 0; i < n; i++) {
      bin.shift();
      bin.push(0);
    }
  } else {
    for (let i = 0; i < Math.abs(n); i++) {
      bin.pop();
      bin = [bin[0], ...bin];
    }
  }
  return bin2dec(bin);
};

const logSh = (dec: number, n: number) => {
  let bin = dec2bin(dec);
  if (n > 0) {
    for (let i = 0; i < n; i++) {
      bin.shift();
      bin.push(0);
    }
  } else {
    for (let i = 0; i < Math.abs(n); i++) {
      bin.pop();
      bin = [0, ...bin];
    }
  }
  return bin2dec(bin);
};

const answerMap: Map<QuestionType, (props: SubQuestionProps) => number> =
  new Map([
    [QuestionType.DEC2BIN, (props) => props.initialValue],
    [QuestionType.HEX2BIN, (props) => props.initialValue],
    [
      QuestionType.ARI_SH,
      (props) => {
        return arSh(props.initialValue, props.arg);
      },
    ],
    [
      QuestionType.LOG_SH,
      (props) => {
        return logSh(props.initialValue, props.arg);
      },
    ],
    [QuestionType.ADDITION, (props) => (props.initialValue + props.arg) & 0xff],
  ]);

const Question = React.forwardRef<QuestionHandle, QuestionProps>(
  (props, ref) => {
    const getAnswer = () => {
      let ans =
        answerMap.get(props.questionType)?.({
          initialValue: props.initialValue,
          arg: props.arg || 0,
        }) || 0;
      if (ans > 127) {
        ans -= 256;
      }
      return ans;
    };
    useImperativeHandle(ref, () => ({ getAnswer }));

    return (
      <Alert className="question" variant="info">
        {componentMap.get(props.questionType)?.({
          initialValue: props.initialValue,
          arg: props.arg || 0,
        })}
      </Alert>
    );
  }
);

export default Question;
export { QuestionType, QuestionHandle };
