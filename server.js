const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || process.argv[2] || 3004);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.normalize(path.join(root, requested));

  if (!filePath.startsWith(root)) return null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  return path.join(root, "index.html");
}

const server = http.createServer((req, res) => {
  const filePath = resolveFile(req.url || "/");
  if (!filePath) {
    send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      send(res, 500, "Server error", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }

    const ext = path.extname(filePath);
    const cache =
      ext === ".html"
        ? "no-cache, must-revalidate"
        : "public, max-age=604800";

    send(res, 200, content, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": cache
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Listen & Pick running on http://0.0.0.0:${port}`);
});
