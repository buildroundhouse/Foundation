/** Serve the exported Roundhouse PWA with history fallback. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const webRoot = path.resolve(__dirname, "..", "static-build", "web");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json",
  ".mjs": "application/javascript; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safePath(urlPath) {
  const relative = path.normalize(urlPath).replace(/^[/\\]+/, "");
  const candidate = path.resolve(webRoot, relative);
  return candidate === webRoot || candidate.startsWith(`${webRoot}${path.sep}`)
    ? candidate
    : null;
}

function serveFile(filePath, response) {
  const extension = path.extname(filePath).toLowerCase();
  const isHashedAsset = filePath.includes(`${path.sep}_expo${path.sep}`);
  response.writeHead(200, {
    "content-type": mimeTypes[extension] || "application/octet-stream",
    "cache-control": isHashedAsset
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, must-revalidate",
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  let pathname = url.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  const requested = safePath(pathname);
  if (requested && fs.existsSync(requested) && fs.statSync(requested).isFile()) {
    serveFile(requested, response);
    return;
  }

  const index = path.join(webRoot, "index.html");
  if (fs.existsSync(index)) {
    serveFile(index, response);
    return;
  }
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Web build not found");
});

const port = Number(process.env.PORT || 3000);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving Roundhouse on port ${port}`);
});
