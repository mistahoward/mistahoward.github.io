import { render } from "preact";
import { App } from "./app.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./main.scss";

render(<App />, document.getElementById("app")!);
