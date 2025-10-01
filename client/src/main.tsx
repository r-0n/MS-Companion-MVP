import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./lib/serviceWorkerRegistration";

createRoot(document.getElementById("root")!).render(<App />);

registerServiceWorker();
