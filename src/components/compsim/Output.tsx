import React from "react";
import { Card } from "react-bootstrap";

type OutputProps = {
  hidden?: boolean;
};

type OutputRef = {
  write: (value: number) => void;
  setBusy: (value: boolean) => void;
  clear: () => void;
};

const Output = React.forwardRef<OutputRef, OutputProps>((props, ref) => {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useImperativeHandle(ref, () => ({ write, clear, setBusy }));

  const clear = () => {
    setValue("");
  };

  const write = (c: number) => {
    setValue((value) => value + String.fromCharCode(c));
  };

  if (props.hidden) return <></>;

  return (
    <Card
      id="screen"
      className="output p-2"
      style={{ fontFamily: "monospace", width: "400px" }}
      bg={busy ? "warning" : "light"}
    >
      <Card.Title>Screen</Card.Title>
      <Card.Body>{value}</Card.Body>
    </Card>
  );
});

export default Output;
export { OutputRef };
