import React, { useImperativeHandle, useRef, useState } from "react";
import { Alert } from "react-bootstrap";

import "./Bus.css";

type ControlBusValues = "read" | "write" | "ready" | "";

type BusProps = {};

type BusRef = {
  reset: () => void;
  setAddressBus: (address: number) => void;
  getAddressBus: () => number;
  setDataBus: (data: number) => void;
  getDataBus: () => number;
  setControlBus: (control: ControlBusValues) => void;
  getControlBus: () => string;
};

const Bus = React.forwardRef<BusRef, BusProps>((props, ref) => {
  const m_address = useRef<number>(0);
  const m_data = useRef<number>(0);
  const m_control = useRef<ControlBusValues>("");

  const [address, setAddress] = useState<number>(0);
  const [data, setData] = useState<number>(0);
  const [control, setControl] = useState<ControlBusValues>("");
  const [addressActive, setAddressActive] = useState<boolean>(false);
  const [dataActive, setDataActive] = useState<boolean>(false);
  const [controlActive, setControlActive] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    reset,
    setAddressBus,
    getAddressBus,
    setDataBus,
    getDataBus,
    setControlBus,
    getControlBus,
  }));

  const setAddressBus = (address: number) => {
    m_address.current = address;
    setAddress(address);
    setAddressActive(true);
    setTimeout(() => {
      setAddressActive(false);
    }, 500);
  };

  const setDataBus = (data: number) => {
    m_data.current = data;
    setData(data);
    setDataActive(true);
    setTimeout(() => {
      setDataActive(false);
    }, 500);
  };

  const setControlBus = (control: ControlBusValues) => {
    m_control.current = control;
    setControl(control);
    setControlActive(true);
    setTimeout(() => {
      setControlActive(false);
    }, 500);
  };

  const getAddressBus = () => {
    setAddressActive(true);
    setTimeout(() => {
      setAddressActive(false);
    }, 500);
    return m_address.current;
  };
  const getDataBus = () => {
    setDataActive(true);
    setTimeout(() => {
      setDataActive(false);
    }, 500);
    return m_data.current;
  };
  const getControlBus = () => {
    setControlActive(true);
    setTimeout(() => {
      setControlActive(false);
    }, 500);
    return m_control.current;
  };

  const reset = () => {
    setAddressBus(0);
    setDataBus(0);
    setControlBus("");
  };

  return (
    <div className="bus">
      <Alert
        variant="danger"
        className={addressActive ? "a-bus active" : "a-bus"}
      >
        address{" "}
        <span className="bus-reg" id="bus-address">
          {(address >>> 0).toString(16).padStart(8, "0")}
        </span>
      </Alert>
      <Alert
        variant="success"
        className={dataActive ? "a-bus active" : "a-bus"}
      >
        &nbsp;&nbsp;&nbsp;data{" "}
        <span className="bus-reg" id="bus-data">
          {(data >>> 0).toString(16).padStart(8, "0")}
        </span>
      </Alert>
      <Alert
        variant="info"
        className={controlActive ? "a-bus active" : "a-bus"}
      >
        control{" "}
        <span className="bus-reg" id="bus-control">
          {control.padStart(5, "\u00A0")}
        </span>
      </Alert>
    </div>
  );
});

export default Bus;
export { BusRef };
