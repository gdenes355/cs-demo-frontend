import React, { useEffect, useState } from "react";
import { Alert, AlertProps } from "react-bootstrap";
import { motion, useAnimation } from "framer-motion";

type SortCardProps = {
  /** value to display on the card when facing up */
  value: string;

  /** is this card facing up. When uncontrolled, leave as undefined */
  faceUp?: boolean;

  canFlip?: boolean;
  shakeSpy?: any;
  resetSpy?: any;
  width?: number;
  height?: number;
  variant?: AlertProps["variant"];
  onClick?: () => void;
  onFlipped?: (faceUp: boolean, key: React.Key | undefined) => void;
  onFailedFlip?: () => void;

  dataKey?: React.Key;
};

type SortCardRef = {
  /** set whether face up when uncontrolled */
  setFaceUp: (faceUp: boolean) => void;
};

const cardVariants = {
  faceUp: {
    rotateY: 0,
    scale: 1.0,
    transition: { duration: 0.35 },
    zIndex: 10,
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
  },
  faceDown: () => ({
    rotateY: 180,
    scale: 1,
    x: 0,
    opacity: 1,
    zIndex: 10,
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
    transition: { duration: 0.35 },
  }),
};

const cardOp = {
  faceUp: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  faceDown: {
    opacity: 0,
    x: 0,
    y: 0,
  },
};

const shakeVariants = {
  start: () => ({
    rotate: [0, 10, -10, 10, -10, 10, -10, 0],
    transition: {
      delay: 0,
      repeat: 0,
      duration: 0.6,
    },
  }),
  reset: {
    rotate: 0,
  },
};

const SortCard = React.forwardRef<SortCardRef, SortCardProps>((props, ref) => {
  useEffect(() => {
    if (props.faceUp !== undefined) {
      setFaceUp(props.faceUp);
    }
  }, [props.faceUp]);
  const shakeAnim = useAnimation();
  const width = props.width || 65;
  const height = props.height || 80;
  const [faceUp, setFaceUp] = useState<boolean>(props.faceUp || false);

  React.useImperativeHandle(ref, () => ({ setFaceUp: setFaceUpRef }));

  const setFaceUpRef = (faceUp: boolean) => {
    if (props.faceUp === undefined) {
      setFaceUp(faceUp);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (!!props.shakeSpy) {
      shakeAnim.start("start");
    }
    return () => {
      controller.abort();
    };
  }, [props.shakeSpy, shakeAnim]);

  useEffect(() => {
    if (!!props.resetSpy && props.faceUp === undefined) {
      setFaceUp(false);
    }
  }, [props.resetSpy, props.faceUp]);

  const cardClick = () => {
    if (props.faceUp !== undefined) {
      if (props.canFlip === false) {
        shakeAnim.start("start");
        props.onFailedFlip?.();
      }
      return;
    }

    if (props.canFlip) {
      props.onFlipped?.(!faceUp, props.dataKey);
      setFaceUp((s) => !s);
    } else {
      shakeAnim.start("start");
      props.onFailedFlip?.();
    }
    props.onClick?.();
  };

  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        textAlign: "center",
        fontSize: `${height / 4}px`,
        cursor: props.canFlip ? "pointer" : "pointer",
        lineHeight: `${height / 2}px`,
        padding: "0px",
        margin: "10px",
      }}
    >
      <motion.div
        variants={shakeVariants}
        animate={shakeAnim}
        style={{ width: "100%", height: "100%", borderRadius: "0.375rem" }}
      >
        <motion.div
          variants={cardVariants}
          animate={faceUp ? "faceUp" : "faceDown"}
          onClick={cardClick}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "0.375rem",
          }}
        >
          <motion.div
            style={{ width: "100%", height: "100%" }}
            animate={faceUp ? "faceUp" : "faceDown"}
            variants={cardOp}
          >
            <Alert
              style={{ width: "100%", height: "100%" }}
              variant={props.variant}
            >
              {faceUp ? props.value : ""}
            </Alert>
          </motion.div>

          <div
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <motion.div
              animate={!faceUp ? "faceUp" : "faceDown"}
              variants={cardOp}
              style={{ width: "100%", height: "100%" }}
            >
              <Alert
                style={{ width: "100%", height: "100%" }}
                variant={props.variant}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});
export default SortCard;
export { SortCardRef };
