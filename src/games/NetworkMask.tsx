import React, { useEffect, useState } from "react";
import TaskModel from "../utils/network-mask/TaskModel";
import TaskFactory from "../utils/network-mask/TaskFactory";
import { Container } from "react-bootstrap";
import ResultDisplay from "../components/ResultDisplay";
import IPCard from "../components/network-mask/IPCard";
import HostCountCard from "../components/network-mask/HostCountCard";

const NetworkMask = () => {
  const [score, setScore] = useState<number>(0);
  const [task, setTask] = useState<TaskModel | undefined>(undefined);

  const [networkId, setNetworkId] = useState<number>(0);
  const [hostId, setHostId] = useState<number>(0);
  const [hostCount, setHostCount] = useState<number>(0);

  useEffect(() => {
    setTask(TaskFactory().createTask());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onComplete = (points: number) => {
    setTimeout(() => {
      setNetworkId(0);
      setHostId(0);
      setHostCount(0);
      setTask(TaskFactory().createTask());
    }, 1000);
    setScore((x) => x + points);
  };

  useEffect(() => {
    if (
      task &&
      task.networkId >>> 0 === networkId &&
      hostId === task.hostId &&
      hostCount === task.numberOfHosts
    ) {
      onComplete(10);
    }
  }, [task, networkId, hostId, hostCount]);

  if (!task) return <></>;
  return (
    <div>
      <Container className="mt-4">
        <h1>Network Masks</h1>
        <IPCard
          label="IP Address "
          ip={task.ip}
          representation={task.ipRepresentation}
          variant="primary"
        />
        <IPCard
          label="Subnet Mask"
          ip={task.mask}
          representation={task.maskRepresentation}
          variant="secondary"
        />
        <h2 style={{ marginTop: "40px" }}>Complete the fields below</h2>
        <IPCard
          label="Network ID "
          ip={networkId}
          representation={task.ipRepresentation}
          variant="success"
          editable={true}
          onChange={(ip) => setNetworkId(ip)}
          correct={networkId === task.networkId >>> 0}
        />
        <IPCard
          label="Host ID&#160;&#160;&#160;&#160;"
          ip={hostId}
          representation={task.hostIdRepresentation}
          variant="warning"
          editable={true}
          onChange={(ip) => setHostId(ip)}
          correct={hostId === task.hostId}
        />

        <HostCountCard
          value={hostCount + ""}
          onChange={(v) => {
            setHostCount(parseInt(v));
          }}
          correct={hostCount === task.numberOfHosts}
        />

        <ResultDisplay score={score} />
      </Container>
    </div>
  );
};

export default NetworkMask;
