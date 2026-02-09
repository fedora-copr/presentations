/*
 * Minimal HTTP server for presentations.
 *
 * Serves files from three locations (in priority order):
 *   1. /repo/{SLIDES_DIR}  - presentation-specific files (slides.md, /materials/, /assets/, etc.)
 *   2. /repo               - shared files (index.html, /assets/, etc.)
 *   3. /revealjs           - reveal.js assets (/dist/, /plugin/, etc.)
 *
 * Set the SLIDES_DIR env var to the presentation subdirectory name.
 *
 * This file is baked into the container image.
 * You should NOT need to edit it.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const SLIDES_DIR = process.env.SLIDES_DIR || "";
const TITLE = SLIDES_DIR || "presentation";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
};

// presentation-specific files -> shared root files -> reveal.js files
const DIRS = [path.join("/repo", SLIDES_DIR), "/repo", "/revealjs"];

const server = http.createServer((req, res) => {
  let url = req.url.split("?")[0];
  if (url === "/") url = "/index.html";

  for (const dir of DIRS) {
    const filePath = path.join(dir, url);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": "no-store",
        });

        // dynamic <title> based on SLIDES_DIR
        if (url === "/index.html") {
          let html = fs.readFileSync(filePath, "utf-8");
          html = html.replace(/<title>.*?<\/title>/, `<title>${TITLE}</title>`);
          res.end(html);
        } else {
          fs.createReadStream(filePath).pipe(res);
        }
        return;
      }
    } catch (_) {
      // file not found in this dir, try the next one
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 — not found");
});

// exit on Ctrl+C
process.on("SIGINT", () => {
  process.exit(0);
});
process.on("SIGTERM", () => {
  process.exit(0);
});

const PORT = 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  Presentation: ${SLIDES_DIR || "(root)"}`);
  console.log(`  URL:          http://localhost:${PORT}`);
  console.log(`  Speaker notes: press S\n`);
});
