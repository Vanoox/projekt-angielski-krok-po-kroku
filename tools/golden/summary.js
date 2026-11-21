// node summary.js <file> – krótki przegląd wyniku scenariusza
const fs = require("fs");
const t = fs.readFileSync(process.argv[2], "utf8").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const j = JSON.parse(t);
console.log("errors:", j.errors, "crash:", j.result && j.result.crash);
const L = Array.isArray(j.result) ? j.result : j.result.log || [];
for (const [k, v] of L) {
  if (Array.isArray(v) && v.length && typeof v[0] === "string" && /feedback|<div/.test(v[0] || "")) {
    const s = v.map((x) => (x == null ? "null" : /feedback ok/.test(x) ? "ok" : /feedback bad|feedback no|wrong/.test(x) ? "bad" : x === "" ? "empty" : "?"));
    const tags = v.filter((x) => x && /err-tag/.test(x)).length, diff = v.filter((x) => x && /class="diff"/.test(x)).length;
    console.log(k, v.length, JSON.stringify(s.reduce((a, x) => ((a[x] = (a[x] || 0) + 1), a), {})), "errTags", tags, "diff", diff);
  } else console.log(k, JSON.stringify(v).slice(0, 160));
}
console.log("spoken:", (j.spoken || []).length);
