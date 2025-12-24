import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";  // or ./index.css if that's what you have

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
