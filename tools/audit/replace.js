// Zastępuje fragmenty w pliku. Każdy fragment musi wystąpić dokładnie raz.
// Użycie: node tools/audit/replace.js <plik> <pary.json>   (pary: [[stare, nowe], ...])
const fs = require('fs');
const [file, pairsFile] = process.argv.slice(2);
let s = fs.readFileSync(file, 'utf8');
const pairs = JSON.parse(fs.readFileSync(pairsFile, 'utf8'));
let bad = 0;
for (const [a, b] of pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.log(`!! ${n}x: ${a.slice(0, 90)}`); bad++; continue; }
  s = s.replace(a, () => b);
}
if (bad) { console.log(`Przerwano – ${bad} problemów, plik bez zmian.`); process.exit(1); }
fs.writeFileSync(file, s);
console.log(`OK: ${pairs.length} zmian w ${file}`);
