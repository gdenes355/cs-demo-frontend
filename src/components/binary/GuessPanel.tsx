import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { dec2bin, PLACE_VALUES } from "../../utils/numbases";
import { QuestionType } from "./Question";

import "./GuessPanel.css";

type GuessPanelProps = {
  value: number;
  questionType?: QuestionType;
  onValueChanged: (value: number) => void;
};

type DigitProps = {
  placeValue: number;
  value: number;
  idx: number;
  onValueChanged: (value: number) => void;
};

const Digit = (props: DigitProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { onValueChanged, idx } = props;
  useEffect(() => {
    if (!buttonRef.current) {
      return;
    }
    // If pressed key is our target key then set to true
    const downHandler = (ev: KeyboardEvent) => {
      if (ev.key === "" + (idx + 1)) {
        buttonRef.current?.click();
      }
    };

    window.addEventListener("keydown", downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, [idx]);

  return (
    <Col className="text-center">
      <Button
        ref={buttonRef}
        onClick={() => onValueChanged(1 - props.value)}
        value={props.value}
        active={props.value === 1}
        variant={props.value === 1 ? "primary active" : "secondary"}
        size="lg"
        className="m-2"
      >
        {props.value}
      </Button>
    </Col>
  );
};

const GuessPanel = (props: GuessPanelProps) => {
  const NBPS = "\u00A0";
  const bin = dec2bin(props.value);
  const [placeValues, setPlaceValues] = useState([NBPS]);
  useEffect(() => {
    switch (props.questionType) {
      case QuestionType.HEX2BIN:
        setPlaceValues(["8", "4", "2", "1", "8 ", "4 ", "2 ", "1 "]);
        break;
      case QuestionType.LOG_SH:
        setPlaceValues([NBPS]);
        break;
      case QuestionType.ARI_SH:
        setPlaceValues([NBPS]);
        break;
      case QuestionType.ADDITION:
        setPlaceValues(["128", "64", "32", "16", "8", "4", "2", "1"]);
        break;
      default:
        setPlaceValues(["-128", "64", "32", "16", "8", "4", "2", "1"]);
        break;
    }
  }, [props.questionType]);

  return (
    <Card className="guessPanel">
      <Card.Body>
        <Row>
          {placeValues.map((pv) => {
            return (
              <Col key={pv} className="text-center">
                {pv}
              </Col>
            );
          })}
        </Row>
        <Row>
          {PLACE_VALUES.map((pv, i) => (
            <Digit
              key={pv}
              value={bin[i]}
              placeValue={pv}
              idx={i}
              onValueChanged={(v) => {
                props.onValueChanged(props.value + (v === 1 ? pv : -pv));
              }}
            />
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GuessPanel;
