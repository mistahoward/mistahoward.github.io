import { render } from "preact";
import { App } from "./app.tsx";
import { AuthProvider } from "./contexts/AuthContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./main.scss";

render(
	<AuthProvider>
		<App />
	</AuthProvider>,
	document.getElementById("app")!
);
