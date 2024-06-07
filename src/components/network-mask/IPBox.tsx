import React, { CSSProperties, useImperativeHandle, useRef } from "react";
import { Alert, Form } from "react-bootstrap";
import { Representation } from "../../utils/network-mask/TaskModel";

type IPBoxProps = {
  value: string;
  representation?: Representation;
  noBackground?: boolean;
  editable?: boolean;
  onChange?: (value: string, full: boolean) => void;
};

type IPBoxRef = {
  focus: () => void;
};

const st: (props: IPBoxProps) => CSSProperties = (props) => {
  return {
    width:
      props.representation === "binary"
        ? "1rem"
        : props.representation === "classful"
        ? "7rem"
        : "3rem",
    textAlign: "center",
    height: "fit-content",
    marginRight: "1px",
    backgroundColor: props.noBackground ? "transparent" : "white",
    borderColor: props.noBackground ? "transparent" : "#fdfdfe",
    fontFamily: "monospace",
    fontSize: "1.5rem",
    paddingLeft: "1px",
    paddingRight: "1px",
    paddingTop: "0px",
    paddingBottom: "0px",
    marginBottom: "0px",
  };
};

const IPBox = React.forwardRef<IPBoxRef, IPBoxProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focus = () => {
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(0, 0);
  };

  useImperativeHandle(ref, () => ({ focus }));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (props.onChange) {
      if (!v) v = "0";
      let max = 0;
      let maxLen = 0;
      if (props.representation === "binary") {
        max = 1;
        maxLen = 1;
        if (v.length > 1) {
          if (e.target.selectionEnd === 1) {
            v = v[0];
          } else {
            v = v[1];
          }
        }
      } else if (props.representation === "decimal") {
        max = 255;
        maxLen = 3;
      }
      let vInt = parseInt(v);
      v = vInt.toString();

      if (vInt <= max && v.length <= maxLen) {
        v = vInt.toString();
        props.onChange(v, maxLen === v.length);
      }
    }
  };

  if (props.editable) {
    return (
      <>
        <Form.Control
          value={props.value}
          onChange={onChange}
          ref={inputRef}
          style={st(props)}
        />
      </>
    );
  }
  return (
    <Alert variant="light" style={st(props)}>
      <span
        style={{
          color: "black",
          height: "fit-content",
        }}
      >
        {props.value}
      </span>
    </Alert>
  );
});

export default IPBox;
export type { IPBoxRef };
