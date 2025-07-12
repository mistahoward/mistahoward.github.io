import { render } from "preact"
import "./index.css"
import { App } from "./app.tsx"
import "bootstrap/dist/css/bootstrap.min.css";

render(<App />, document.getElementById("app")!)
