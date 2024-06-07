import React, { useCallback, useEffect, useMemo, useState } from "react";
import useRunner from "../components/str-format/useRunner";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import Task, { Var } from "../utils/str-format/Task";
import makeTask from "../utils/str-format/TaskFactory";
import ResultDisplay from "../components/ResultDisplay";
import Output from "../components/str-format/Output";
import { useLocation } from "react-router-dom";

const StrFormat = () => {
  const runner = useRunner();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const noSign = !!searchParams.get("nosign");

  const [score, setScore] = useState<number>(0);
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [expected, setExpected] = useState<string | undefined>(undefined);
  const [actual, setActual] = useState<string | undefined>(undefined);

  const [complete, setComplete] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [incrementalImprovement, setIncrementalImprovement] = useState(false);

  const inputRef = React.createRef<HTMLInputElement>();

  useEffect(() => {
    setTask(makeTask(!noSign));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const varValue = (v: Var, index: number) => {
    switch (v.type) {
      case "int":
        return `${v.values[index]}`;
      case "float":
        return `${v.values[index]}`;
      case "str":
        return `"${v.values[index]}"`;
      case "bool":
        return `${
          (v.values[index] + "")[0].toUpperCase() +
          (v.values[index] + "").slice(1)
        }`;
    }
  };

  const preamble = useMemo(() => {
    let res = "";
    if (!task) return res;
    if (task.declLayout === "nested") {
      res += "data = [\n";
      for (let i = 0; i < task.vars[0].values.length; i++) {
        res +=
          "    [" + task.vars.map((v) => varValue(v, i)).join(", ") + "],\n";
      }
      res += "]\n";
    } else {
      for (let v of task.vars) {
        const vs = v.values.map((_, i) => varValue(v, i)).join(", ");
        res += `${v.name} = [${vs}]\n`;
      }
    }
    return res;
  }, [task]);

  const postamble = useMemo(() => {
    let res = "";
    if (!task) return res;
    if (task.declLayout === "nested") {
      let vs = task.vars.map((_, i) => `row[${i}]`).join(", ");
      res += `for row in data:\n    print("$".format(${vs}))\n`;
    } else {
      let vs = task.vars.map((v) => `${v.name}[i]`).join(", ");
      res += `for i in range(len(a)):\n    print("$".format(${vs}))\n`;
    }
    return res;
  }, [task]);

  const evaluate = useCallback(
    (format: string) => {
      if (
        task &&
        runner.state === "ready" &&
        preamble !== "" &&
        postamble !== ""
      ) {
        const prerpe = `import sys\nclass Output:\n  def __init__(self):self.buffer = ""\n  def write(self, text):self.buffer += text\nsys.stdout = Output()\n`;
        const postpost = `sys.stdout.buffer`;
        const code = `${prerpe}${preamble}${postamble.split("$")[0]}${format}${
          postamble.split("$")[1]
        }${postpost}`;
        try {
          return runner.run(code);
        } catch (e) {
          console.error(e);
          return "Error";
        }
      }
      return undefined;
    },
    [runner, task, preamble, postamble]
  );

  const giveUp = () => {
    setShowSolution(true);
    setScore((x) => Math.max(0, x - 5));
    setComplete(true);
  };

  useEffect(() => {
    setExpected(task ? evaluate(task.formatString) : undefined);
  }, [task, runner, evaluate]);

  if (!task) return <></>;

  const onCheck = () => {
    if (runner.state === "ready" && inputRef.current && !complete) {
      const userInput = inputRef.current.value;
      if (userInput === "") return;
      const result = evaluate(userInput);
      setActual(result);

      if (result === "Error") {
        setScore((x) => Math.max(0, x - 1));
        return;
      }

      if (result === expected) {
        let points = 10;
        if (incrementalImprovement) points -= 5;
        if (showHint) points -= 2;

        setScore((x) => x + points);
        setComplete(true);
      } else {
        setIncrementalImprovement(true);
      }
    }
  };

  return (
    <div style={{ overflowY: "scroll", height: "100%" }}>
      <Container className="mt-4">
        <h1>String Formatting</h1>
        <p>Complete the print statement to match the expected output.</p>
        <Card>
          <code style={{ fontSize: "1.2rem", color: "black" }} className="m-2">
            <pre>{preamble}</pre>
          </code>
        </Card>
        <div>
          <Button
            variant="danger"
            onClick={() => giveUp()}
            disabled={complete || showSolution}
            style={{
              position: "absolute",
              left: "auto",
              right: "100px",
              margin: "10px",
              top: "10px",
              zIndex: 10,
              fontWeight: "bold",
            }}
          >
            Show Solution
          </Button>
          <Button
            variant="warning"
            onClick={() => setShowHint(true)}
            disabled={showHint || complete}
            style={{
              position: "absolute",
              left: "auto",
              right: "100px",
              margin: "10px",
              zIndex: 9,
              fontWeight: "bold",
              top: "60px",
            }}
          >
            Show Hint
          </Button>
          {complete ? (
            <Button
              variant="info"
              onClick={() => {
                setTask(makeTask(noSign));
                setShowSolution(false);
                setComplete(false);
                setIncrementalImprovement(false);
                setShowHint(false);
                setActual(undefined);
                inputRef.current!.value = "";
                inputRef.current!.focus();
              }}
              style={{
                position: "absolute",
                left: "auto",
                right: "100px",
                margin: "10px",
                zIndex: 8,
                fontWeight: "bold",
                top: "110px",
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              disabled={runner.state !== "ready"}
              onClick={() => onCheck()}
              style={{
                position: "absolute",
                left: "auto",
                right: "100px",
                margin: "10px",
                zIndex: 7,
                fontWeight: "bold",
                top: "110px",
              }}
            >
              Check
            </Button>
          )}
        </div>
        <Card>
          <code style={{ fontSize: "1.2rem", color: "black" }} className="m-2">
            <pre>
              {postamble.split("$")[0]}
              <input
                type="text"
                ref={inputRef}
                onKeyDown={(e) => (e.key === "Enter" ? onCheck() : undefined)}
                readOnly={complete}
              />
              {postamble.split("$")[1]}
            </pre>
          </code>
        </Card>
        {showHint ? (
          <Alert variant="light" style={{ fontSize: "1rem" }}>
            {task.hint.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </Alert>
        ) : null}
        <Alert
          variant="light"
          style={{ fontWeight: "bold", fontSize: "1.5rem" }}
        >
          <Row>
            <Col>
              <p>Expected</p>
              <Output expected={undefined} actual={expected || ""} />
            </Col>
            <Col>
              <p>Actual</p>
              <Output expected={expected || ""} actual={actual || ""} />
              {actual ? (
                <p style={{ fontWeight: "normal", fontSize: "1rem" }}>
                  Colours based on overall string difference
                </p>
              ) : null}
            </Col>
          </Row>

          {(complete && actual !== expected) || showSolution ? (
            <pre className="float-end">{task.formatString}</pre>
          ) : null}
        </Alert>

        <ResultDisplay score={score} />
      </Container>
    </div>
  );
};

export default StrFormat;
