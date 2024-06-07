import React from "react";
import { Alert, AlertProps, Form } from "react-bootstrap";

type HostCountCardProps = {
  value: string;
  onChange?: (value: string) => void;
  correct?: boolean;
  variant?: AlertProps["variant"];
};

const HostCountCard = (props: HostCountCardProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (props.onChange) {
      if (!v) v = "0";
      let vInt = parseInt(v);
      v = vInt.toString();
      props.onChange(v);
    }
  };

  return (
    <Alert
      variant={props.variant || "primary"}
      style={{
        display: "flex",
        width: "fit-content",
        padding: "10px",
        height: "fit-content",
        borderStyle: "solid",
        borderWidth: "3px",
        borderColor:
          props.correct === undefined
            ? "transparent"
            : props.correct
            ? "green"
            : "red",
      }}
    >
      <span
        style={{
          marginRight: "10px",
          fontSize: "1.5rem",
          fontFamily: "monospace",
        }}
      >
        Number of possible hosts:
      </span>
      <Form.Control
        value={props.value}
        onChange={onChange}
        style={{
          width: "15rem",

          textAlign: "center",
          height: "fit-content",
          marginRight: "1px",
          backgroundColor: "white",
          borderColor: "#fdfdfe",
          fontFamily: "monospace",
          fontSize: "1.5rem",
          paddingLeft: "1px",
          paddingRight: "1px",
          paddingTop: "0px",
          paddingBottom: "0px",
          marginBottom: "0px",
        }}
      />
    </Alert>
  );
};

export default HostCountCard;
