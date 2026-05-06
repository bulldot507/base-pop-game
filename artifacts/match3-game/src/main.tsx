import { createRoot } from "react-dom/client";
import "@coinbase/onchainkit/styles.css";
import "./index.css";
import App from "./App";
import Providers from "./providers";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
  </Providers>
);
