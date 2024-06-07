import { diffChars } from "diff";
import React, { useCallback, useMemo } from "react";

type OutputProps = {
  expected?: string;
  actual: string;
};

const Output: React.FC<OutputProps> = ({ expected, actual }) => {
  const difference = useMemo(() => {
    if (!expected || !actual) return [];
    const eLines = expected.split("\n");
    const aLines = actual.split("\n");
    if (eLines.length !== aLines.length) {
      return [];
    }
    return eLines.map((e, i) => diffChars(e, aLines[i]));
  }, [expected, actual]);

  const line = useCallback((diff: any) => {
    return diff.map((part: any, i: number) => {
      return part.removed ? null : (
        <span
          key={i}
          style={{
            backgroundColor: part.added
              ? "lightcoral"
              : part.removed
              ? "#FFFF66"
              : "lightgreen",
            color: part.added
              ? "darkred"
              : part.removed
              ? "black"
              : "darkgreen",
            visibility: part.removed ? "collapse" : "visible",
          }}
        >
          {part.value}
        </span>
      );
    });
  }, []);

  const longestLine = useMemo(() => {
    return actual.split("\n").reduce((acc, curr) => {
      return curr.length > acc ? curr.length : acc;
    }, 0);
  }, [actual]);

  return (
    <code
      style={{
        fontSize: "1.5rem",
        color: "black",
        marginTop: 0,
      }}
    >
      <pre
        style={{
          paddingLeft: "0.2rem",
          margin: "0",
          fontWeight: "lighter",
          color: "#666",
        }}
      >
        {longestLine > 9
          ? Array.from({ length: longestLine })
              .map((_, i) => (i > 8 ? Math.floor((i + 1) / 10) + "" : " "))
              .join("") + "\n"
          : "\n"}
        {Array.from({ length: longestLine }).map((_, i) => ((i + 1) % 10) + "")}
      </pre>
      <pre
        style={{
          fontWeight: "bold",
          borderWidth: 1,
          borderColor: "black",
          borderStyle: "solid",
          display: "inline-block",
          padding: "0.2rem",
        }}
      >
        {expected
          ? difference.map((diff, i) => <div key={i}>{line(diff)}</div>)
          : actual}
      </pre>
    </code>
  );
};

export default Output;
