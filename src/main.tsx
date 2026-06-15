import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./index.css";

// Apply the luxury dark theme before first paint (default dark unless the user opted out).
const savedDark = localStorage.getItem("druze_theme_v2");
document.documentElement.classList.toggle("dark", savedDark === null ? true : savedDark === "true");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
