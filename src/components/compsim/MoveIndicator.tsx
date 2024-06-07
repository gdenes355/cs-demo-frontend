import React, { useImperativeHandle, useState, useContext } from "react";
import MachineContext from "./MachineContext";

type IndicatorType = "data" | "address" | "control";

type MoveIndicatorRef = {
  enable: (from: string, to: string, type: IndicatorType) => void;
  disable: () => void;
};

type MoveIndicatorProps = {};

type MoveIndicatorState = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  type: IndicatorType;
};

const moveColorMap = new Map<IndicatorType, string>([
  ["data", "green"],
  ["address", "red"],
  ["control", "blue"],
]);

const MoveIndicator = React.forwardRef<MoveIndicatorRef, MoveIndicatorProps>(
  (props, ref) => {
    const machine = useContext(MachineContext);

    useImperativeHandle(ref, () => ({ enable, disable }));
    const [state, setState] = useState<MoveIndicatorState | undefined>(
      undefined
    );

    const adjustPt = (a: DOMRect, b: DOMRect) => {
      let ax = a.x + a.width / 2;
      let ay = a.y + a.height / 2;
      let bx = b.x + b.width / 2;
      let by = b.y + b.height / 2;
      if (by > a.bottom) {
        ay = a.bottom;
      } else if (by < a.top) {
        ay = a.top;
      }
      if (bx > a.right) {
        ax = a.right;
      } else if (bx < a.left) {
        ax = a.left - 5;
      }
      return { x: ax, y: ay };
    };

    const enable = (from: string, to: string, type: IndicatorType) => {
      if (machine.clockInterval < 100) return;

      let fromEl = document.getElementById(from);
      let toEl = document.getElementById(to);
      if (!fromEl || !toEl) return;

      let fromR = fromEl.getBoundingClientRect();
      let toR = toEl.getBoundingClientRect();
      if (!fromR || !toR) return;

      let p0 = adjustPt(fromR, toR);
      let p1 = adjustPt(toR, fromR);

      setState({
        x0: p0.x,
        y0: p0.y,
        x1: p1.x,
        y1: p1.y,
        type,
      });
    };

    const disable = () => {
      setState(undefined);
    };

    if (!state) return <></>;

    return (
      <svg width="1920" height="1080" style={{ pointerEvents: "none" }}>
        <defs>
          <marker
            id="arrow"
            markerWidth="5"
            markerHeight="5"
            refX="2"
            refY="3.5"
            orient="auto"
          >
            <path
              d="M2,1 L2,5 L5,3.5 L2,2"
              style={{ fill: moveColorMap.get(state.type) || "transparent" }}
            />
          </marker>
        </defs>

        <path
          d={`M${state.x0},${state.y0} L${state.x1},${state.y1}`}
          style={{
            stroke: moveColorMap.get(state.type) || "transparent",
            strokeWidth: "4.25px",
            fill: "none",
            markerEnd: "url(#arrow)",
          }}
        />
      </svg>
    );
  }
);

export default MoveIndicator;

export { MoveIndicatorRef };
