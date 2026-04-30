import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");

const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

// SSR polyfills: some client modules (e.g. supabase auth) touch browser globals
// at import time. Provide minimal in-memory shims so prerender doesn't crash.
const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
};
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = createMemoryStorage();
}
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = createMemoryStorage();
}
if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    localStorage: globalThis.localStorage,
    sessionStorage: globalThis.sessionStorage,
    location: { search: "", href: "", pathname: "/" },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

const { render } = await import(path.resolve(distPath, "server/entry-server.js"));

const routes = [
  "/dog-obituary-example",
  "/cat-memorial-tribute-example",
  "/pet-memorial-message",
  "/what-to-write-when-a-dog-dies",
  "/pet-memorial",
  "/pet-memorial-quotes",
  "/rainbow-bridge-quotes",
  "/cope-with-losing-a-pet",
  "/pet-sympathy-messages",
  "/short-dog-memorial-quotes",
  "/dog-memorial-quotes",
  "/cat-memorial-quotes",
  "/pet-remembrance-quotes",
  "/what-to-write-when-a-cat-dies",
  "/pet-condolence-messages",
  "/short-pet-memorial-quotes",
  "/dog-loss-quotes",
  "/cat-loss-quotes",
  "/pet-memorial-captions",
  "/instagram-pet-memorial-captions",
  "/sudden-pet-death-quotes",
  "/pet-anniversary-quotes",
  "/rest-in-peace-dog-quotes",
  // Batch 1 — Dog Breeds
  "/labrador-memorial-quotes",
  "/golden-retriever-memorial-quotes",
  "/german-shepherd-memorial-quotes",
  "/french-bulldog-memorial-quotes",
  "/poodle-memorial-quotes",
  "/beagle-memorial-quotes",
  "/rottweiler-memorial-quotes",
  "/yorkie-memorial-quotes",
  "/dachshund-memorial-quotes",
  "/boxer-dog-memorial-quotes",
  // Batch 2 — Pet Names
  "/pet-memorial-quotes-bella",
  "/pet-memorial-quotes-max",
  "/pet-memorial-quotes-luna",
  "/pet-memorial-quotes-charlie",
  "/pet-memorial-quotes-lucy",
  "/pet-memorial-quotes-daisy",
  "/pet-memorial-quotes-milo",
  "/pet-memorial-quotes-cooper",
  "/pet-memorial-quotes-bailey",
  "/pet-memorial-quotes-sadie",
  // Batch 3 — Emotional Long-Tail
  "/losing-a-pet-quotes",
  "/grieving-pet-quotes",
  "/pet-loss-poems",
  "/pet-memorial-prayers",
  "/short-pet-loss-messages",
  "/long-pet-memorial-messages",
  "/pet-loss-instagram-captions",
  "/pet-remembrance-messages",
  "/pet-grief-quotes",
  "/missing-my-pet-quotes",
  "/loss-of-dog-messages-to-a-friend",
  "/pet-loss-messages",
];

for (const route of routes) {
  const { html, head } = render(route);

  let page = template;

  page = page.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`
  );

  if (head) {
    page = page.replace(/<title>[^<]*<\/title>/, "");
    page = page.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, "");
    page = page.replace("</head>", `${head}\n</head>`);
  }

  const routeDir = path.resolve(distPath, route.slice(1));
  fs.mkdirSync(routeDir, { recursive: true });
  const filePath = path.resolve(routeDir, "index.html");
  fs.writeFileSync(filePath, page);
  console.log(`✓ Pre-rendered: ${route}`);
}

console.log(`\nDone! ${routes.length} SEO pages pre-rendered.`);
