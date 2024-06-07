import React from "react";
import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";

const domNode = document.getElementById("root");
if (domNode) {
  const root = createRoot(domNode);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
