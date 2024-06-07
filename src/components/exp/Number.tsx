import React from "react";
import { useDraggable } from "@dnd-kit/core";

type NumberProps = {
  number: number;
};

const Number = (props: NumberProps) => {
  const { number } = props;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: "drag-" + number,
    data: { number: number },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="p-3">
      <div className="text-center fw-bold border-5 border border-info rounded-pill bg-white">
        {number}
      </div>
    </div>
  );
};

export default Number;
