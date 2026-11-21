// Mały serwer do sprawdzania strony w przeglądarce: http://localhost:8080/
// Użycie: node tools/serve.js [port]   (albo: npm run serve; port też ze zmiennej PORT)
//
// Po co: strona ładuje js/*.js jako moduły ES (<script type="module">), a przeglądarka nie ładuje modułów
// ani service workera (offline, punkt 7) ze stron otwartych jako plik (file:///…). Serwer bez zależności
// (sam Node `http`): katalog projektu, poprawne typy MIME, tylko localhost, bez pamięci podręcznej HTTP
// (Cache-Control: no-cache – po zmianie pliku odświeżenie strony od razu go pokaże).
// GitHub Pages robi to samo na prawdziwym adresie – ten plik nie jest częścią strony.
//
// Do testów: require("./tools/serve.js").handler(root, { before(req, res, url) → true, gdy obsłużone }).
const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".apkg": "application/octet-stream",
};

function handler(root, opts = {}) {
  root = path.resolve(root);
  return (req, res) => {
    let url;
    try { url = new URL(req.url, "http://localhost"); } catch (e) { res.writeHead(400); res.end("Bad request"); return; }
    if (opts.before && opts.before(req, res, url)) return;
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, { Allow: "GET, HEAD" }); res.end(); return; }
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400); res.end("Bad request"); return; }
    let file = path.join(root, rel);
    // Tylko pliki z katalogu projektu (bez ../) i bez ukrytych (.git, .githooks…).
    if ((file !== root && !file.startsWith(root + path.sep)) || rel.split("/").some((p) => p.startsWith("."))) { res.writeHead(403); res.end("Forbidden"); return; }
    fs.stat(file, (err, st) => {
      if (!err && st.isDirectory()) { file = path.join(file, "index.html"); st = fs.existsSync(file) && fs.statSync(file); }
      if (err || !st || !st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("Nie ma takiego pliku: " + rel); return; }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Content-Length": st.size,
        "Cache-Control": "no-cache",
      });
      if (req.method === "HEAD") { res.end(); return; }
      fs.createReadStream(file).pipe(res);
    });
  };
}

module.exports = { handler, MIME };

if (require.main === module) {
  const port = Number(process.argv[2] || process.env.PORT || 8080);
  const server = http.createServer(handler(path.join(__dirname, "..")));
  server.on("error", (e) => {
    console.error(e.code === "EADDRINUSE" ? `Port ${port} jest zajęty – podaj inny: node tools/serve.js ${port + 1}` : "Błąd serwera: " + e.message);
    process.exit(1);
  });
  server.listen(port, "127.0.0.1", () => console.log(`Strona: http://localhost:${port}/  (Ctrl+C – koniec)`));
}
