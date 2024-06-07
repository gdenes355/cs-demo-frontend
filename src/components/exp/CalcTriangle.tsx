import React from "react";

import "./CalcTriangle.css";

type CalcTriangleProps = {
  numerator: string;
  denominator: Array<string>;
  hidden?: boolean;
};

const CalcTriangle = (props: CalcTriangleProps) => {
  if (props.hidden) {
    return <></>;
  }
  return (
    <table className="calc-triangle">
      <tbody>
        <tr className="numerator">
          <td colSpan={props.denominator.length}>{props.numerator}</td>
        </tr>
        <tr className="denominator">
          {props.denominator.map((n, i) => (
            <td key={i}>{n}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default CalcTriangle;
