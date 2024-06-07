import React from "react";
import { Container, Row } from "react-bootstrap";
import Number from "./Number";

type DrawerProps = {
  customValues: Array<number>;
};

const Drawer = (props: DrawerProps) => {
  const { customValues } = props;

  const allValues = [...new Set([8, 1000, 1024, 60, ...customValues])].sort(
    (a, b) => a - b
  );

  return (
    <Container>
      <Row>
        {allValues.map((number) => (
          <Number key={"num-" + number} number={number} />
        ))}
      </Row>
    </Container>
  );
};

export default Drawer;
