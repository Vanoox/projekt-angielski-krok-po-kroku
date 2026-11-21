// Serwer testowy: projekt (tools/serve.js) + pliki testowe z /__t/ + wstrzyknięcie mock.js do index.html (?__t=…).
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = process.env.GM_ROOT || path.join(__dirname, "..", "..");
const { handler, MIME } = require("../serve.js");
const HERE = __dirname;

function start(port) {
  const flags = { offline: false, bump: false };
  const h = handler(ROOT, {
    before(req, res, url) {
      if (url.pathname === "/__t/ctl") {
        for (const k of Object.keys(flags)) if (url.searchParams.has(k)) flags[k] = url.searchParams.get(k) === "1";
        res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(flags)); return true;
      }
      if (flags.offline && !url.pathname.startsWith("/__t/")) { req.socket.destroy(); return true; }
      if (flags.bump && url.pathname === "/sw.js") {
        res.writeHead(200, { "Content-Type": "text/javascript", "Cache-Control": "no-cache" });
        res.end(fs.readFileSync(ROOT + "/sw.js", "utf8").replace(/const VERSION = "([^"]*)"/, 'const VERSION = "$1-bump"'));
        return true;
      }
      if (url.pathname.startsWith("/__t/")) {
        const f = path.join(HERE, url.pathname.slice(5));
        if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return true; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "text/plain", "Cache-Control": "no-store" });
        res.end(fs.readFileSync(f));
        return true;
      }
      if ((url.pathname === "/" || url.pathname === "/index.html") && url.searchParams.has("__t")) {
        let html = fs.readFileSync(ROOT + "/index.html", "utf8");
        html = html.replace("<head>", '<head>\n  <script src="/__t/mock.js"></script>');
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(html);
        return true;
      }
      return false;
    },
  });
  return new Promise((ok) => { const s = http.createServer(h); s.listen(port, "127.0.0.1", () => ok(s)); });
}
module.exports = { start };
if (require.main === module) start(Number(process.argv[2] || 8765)).then(() => console.log("gm server up"));
