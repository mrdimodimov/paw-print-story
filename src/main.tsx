// Safari safe-storage polyfill: must run before any module touches localStorage
(() => {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch {
    const memoryStore: Record<string, string> = {};
    const storage: Storage = {
      get length() { return Object.keys(memoryStore).length; },
      clear() { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
      getItem(key: string) { return memoryStore[key] ?? null; },
      setItem(key: string, value: string) { memoryStore[key] = value; },
      removeItem(key: string) { delete memoryStore[key]; },
      key(index: number) { return Object.keys(memoryStore)[index] ?? null; },
    };
    Object.defineProperty(window, "localStorage", { value: storage, writable: false });
  }
})();

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
