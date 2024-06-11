import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BinaryGame from "./games/BinaryGame";
import "./App.css";
import SizeExpressionGame from "./games/SizeExpressionGame";
import ComputerSimulator from "./games/ComputerSimulator";
import SortSearch from "./games/SortSearch";
import NetworkMask from "./games/NetworkMask";
import StrFormat from "./games/StrFormat";
import WifiRadio from "./games/WifiRadio";

function AppContainer() {
  const searchParams = new URLSearchParams(useLocation().search);
  const gameid = searchParams.get("gameid") || "binary"; // default to binary game
  if (gameid === "binary") {
    return <BinaryGame />;
  } else if (gameid === "exp") {
    return <SizeExpressionGame />;
  } else if (gameid === "compsim") {
    return <ComputerSimulator />;
  } else if (gameid === "sortsearch") {
    return <SortSearch />;
  } else if (gameid === "network-mask") {
    return <NetworkMask />;
  } else if (gameid === "str-format") {
    return <StrFormat />;
  } else if (gameid === "radio") {
    return <WifiRadio />;
  } else {
    return <BinaryGame />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AppContainer></AppContainer>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
