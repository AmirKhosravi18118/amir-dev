// Zero-dependency static file server for the hermetic smoke suite and local use.
// usage: node tools/static-server.mjs [port]   (default 4173)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.argv[2]) || 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    // site-config stub: matches production API shape so local/pages render identically
    if (path === "/api/v1/public/site-config") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ topbar: { visible: true, text: "", cta: "#pricing" } }));
      return;
    }
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) throw new Error("traversal");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  }
});

server.listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
