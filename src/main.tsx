// Canonical host redirect: force apex (vellumpet.com) over www
if (typeof window !== "undefined" && window.location.hostname === "www.vellumpet.com") {
  window.location.replace(
    "https://vellumpet.com" + window.location.pathname + window.location.search + window.location.hash
  );
}

import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
