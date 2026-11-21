// node compare.js <dirA> <dirB> – różnice między zdjęciami (po normalizacji ?v=, komentarzy HTML i bloku modułów).
const fs = require("fs");
const path = require("path");
const [A, B] = process.argv.slice(2).map((d) => path.join(__dirname, "out", d));
const norm = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/\?v=[0-9a-f]{6,}/g, "?v=H")
  .replace(/<script type="importmap">[\s\S]*?<\/script>/g, "").replace(/<link rel="modulepreload"[^>]*>/g, "")
  .replace(/<script[^>]*src="?(js\/[^" >]*|APP)"?[^>]*><\/script>/g, "<script src=APP></script>")
  .replace(/\n\s*\n/g, "\n").replace(/[ \t]+\n/g, "\n");
let same = 0, diff = 0;
const files = fs.readdirSync(A).filter((f) => !f.startsWith("_"));
for (const f of files) {
  const pb = path.join(B, f);
  if (!fs.existsSync(pb)) { console.log("BRAK w B:", f); diff++; continue; }
  const a = norm(fs.readFileSync(path.join(A, f), "utf8")), b = norm(fs.readFileSync(pb, "utf8"));
  if (a === b) { same++; continue; }
  diff++;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  console.log(`RÓŻNICA ${f} @${i}:\n  A: ${JSON.stringify(a.slice(Math.max(0, i - 120), i + 200))}\n  B: ${JSON.stringify(b.slice(Math.max(0, i - 120), i + 200))}`);
}
for (const f of fs.readdirSync(B)) if (!f.startsWith("_") && !files.includes(f)) { console.log("BRAK w A:", f); diff++; }
console.log(`takie same: ${same}, różne: ${diff}`);
process.exit(diff ? 1 : 0);
