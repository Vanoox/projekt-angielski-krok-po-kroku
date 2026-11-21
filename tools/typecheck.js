// Sprawdzanie typów (JSDoc w js/ + js/types.d.ts) przez TypeScript – bez generowania plików, nic nie trafia na stronę.
// Użycie: npm run typecheck   (= node tools/typecheck.js; część npm run check i hooka przed commitem)
//
// tsc --noEmit -p tsconfig.json: cały js/ w trybie "strict" (także noImplicitAny – każdy parametr ma typ z JSDoc albo
// z kontekstu). TypeScript 7 (natywny) – ok. 1 s. Każdy błąd zatrzymuje commit.
//
// Bez zainstalowanego TypeScriptu (npm install / npm ci) sprawdzenie jest pomijane z komunikatem (kod wyjścia 0) –
// hook działa też na świeżym klonie bez node_modules. Na GitHubie (zmienna CI) brak TypeScriptu to błąd.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");

/** @returns {{ ok: boolean, info: string, skipped?: boolean }} */
function typecheck() {
  if (!fs.existsSync(tsc)) {
    if (process.env.CI) return { ok: false, info: "brak TypeScriptu – w CI najpierw npm ci" };
    return { ok: true, skipped: true, info: "POMINIĘTO – brak TypeScriptu (zainstaluj raz: npm install)" };
  }
  const r = spawnSync(process.execPath, [tsc, "--noEmit", "--pretty", "false", "-p", "tsconfig.json"], { cwd: root, encoding: "utf8" });
  if (r.error) return { ok: false, info: r.error.message };
  const out = (r.stdout + r.stderr).replace(/\r\n/g, "\n").trim();
  if (r.status === 0) return { ok: true, info: "js/ bez błędów (strict)" };
  const n = (out.match(/: error TS\d+:/g) || []).length;
  console.log(out);
  return { ok: false, info: n ? `${n} ${n === 1 ? "błąd" : "błędów"} typów` : "tsc zakończył się błędem" };
}

module.exports = { typecheck };

if (require.main === module) {
  const r = typecheck();
  console.log(`${r.ok ? (r.skipped ? "UWAGA" : "OK  ") : "BŁĄD"} typy (tsc) – ${r.info}`);
  process.exit(r.ok ? 0 : 1);
}
