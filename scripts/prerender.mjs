import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");

// Read the client-built index.html as template
const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

// Import the SSR bundle
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
];

for (const route of routes) {
  const { html, head } = render(route);

  let page = template;

  // Inject rendered HTML into root div
  page = page.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`
  );

  // Replace existing title with Helmet title, and inject other head tags
  if (head) {
    // Remove existing title
    page = page.replace(/<title>[^<]*<\/title>/, "");
    // Remove existing meta description
    page = page.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, "");
    // Inject Helmet head tags before </head>
    page = page.replace("</head>", `${head}\n</head>`);
  }

  // Write to dist/<route>/index.html
  const routeDir = path.resolve(distPath, route.slice(1));
  fs.mkdirSync(routeDir, { recursive: true });
  const filePath = path.resolve(routeDir, "index.html");
  fs.writeFileSync(filePath, page);
  console.log(`✓ Pre-rendered: ${route}`);
}

console.log(`\nDone! ${routes.length} SEO pages pre-rendered.`);
