import React from "react";
import ReactDOM from "react-dom";
import "tippy.js/dist/tippy.css";
import { Playground } from "../../../src/Playground";
import "../../../src/styles.css";

const rootElement = document.getElementById('root');
ReactDOM.render(<Playground />, rootElement);
