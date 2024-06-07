import React, { useEffect, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";

import "./ResultDisplay.css";

type ResultDisplayProps = {
  score: number;
};

const ResultDisplay = (props: ResultDisplayProps) => {
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setChanged(true);
    setTimeout(() => setChanged(false), 1000);
  }, [props.score]);

  return (
    <Row>
      <Col>
        <Alert
          variant="success"
          className={"mt-5 resultDisplay " + (changed ? " changed" : undefined)}
        >
          {props.score}
        </Alert>
      </Col>
    </Row>
  );
};

export default ResultDisplay;
