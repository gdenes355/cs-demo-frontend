import React, { useEffect, useRef, useState } from "react";
import { Representation } from "../../utils/network-mask/TaskModel";
import IPBox, { IPBoxRef } from "./IPBox";
import { Alert, AlertProps } from "react-bootstrap";

type IPCardProps = {
  label: string;
  ip: number;
  representation: Representation;
  variant?: AlertProps["variant"];
  editable?: boolean;
  onChange?: (ip: number) => void;
  correct?: boolean;
};

const ipToContiguousLength = (ip: number) => {
  ip = ip >>> 0;
  let ct0 = 0;
  while (ip > 0 && (ip & 1) === 0) {
    ct0++;
    ip = ip >>> 1;
  }
  return 32 - ct0;
};

const IPCard = (props: IPCardProps) => {
  const [values, setValues] = useState<string[]>([]);
  const refs = useRef<(IPBoxRef | null)[]>(new Array(8).fill(null));

  useEffect(() => {
    let ip = props.ip >>> 0;
    if (props.representation === "binary") {
      let str = ip.toString(2).padStart(32, "0");
      setValues(Array.from(str));
    } else if (props.representation === "decimal") {
      let res: string[] = [];
      for (let i = 0; i < 4; i++) {
        let val = ip & 0xff;
        ip = ip >>> 8;
        res = [val.toString(), ...res];
      }
      setValues(res);
    } else if (props.representation === "/X") {
      setValues([`/${ipToContiguousLength(ip)}`]);
    } else if (props.representation === "classful") {
      let len = ipToContiguousLength(ip);
      switch (len) {
        case 8:
          setValues(["Class A"]);
          return;
        case 16:
          setValues(["Class B"]);
          return;
        case 24:
          setValues(["Class C"]);
          return;
      }
    }
  }, [props]);

  const getValue = () => {
    if (props.representation === "binary") {
      return parseInt(values.join(""), 2);
    } else if (props.representation === "decimal") {
      let val =
        (parseInt(values[0]) << 24) |
        (parseInt(values[1]) << 16) |
        (parseInt(values[2]) << 8) |
        parseInt(values[3]);
      return val >>> 0;
    }
    return 0;
  };

  const onChange = (i: number, v: string, full: boolean) => {
    values[i] = v;
    setValues([...values]);
    if (props.onChange) {
      props.onChange(getValue());
      if (i + 1 < values.length && full && refs.current[i + 1]) {
        refs.current[i + 1]?.focus();
      }
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
        {props.label}:
      </span>
      {values.map((v, i) => (
        <React.Fragment key={i}>
          <IPBox
            value={v}
            representation={props.representation}
            editable={props.editable}
            onChange={(v, c) => onChange(i, v, c)}
            ref={(el) => {
              refs.current[i] = el;
            }}
          />
          {i !== values.length - 1 &&
          ((props.representation === "binary" && i % 8 === 7) ||
            props.representation === "decimal") ? (
            <IPBox value="." representation={"binary"} noBackground={true} />
          ) : null}
        </React.Fragment>
      ))}
    </Alert>
  );
};

export default IPCard;
