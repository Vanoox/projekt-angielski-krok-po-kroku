// Generuje raporty audytu: node tools/audit/dump.js && node tools/audit/report.js
const fs = require('fs');
const path = require('path');
const { all, ex } = require('./en.js');
const C = require('./det.js');
const order = JSON.parse(fs.readFileSync(path.join(__dirname, 'proponowana-kolejnosc.json')));
const B = Object.fromEntries(all.map((o) => [o.id, o]));
require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'vocab.js')]);
const miss = JSON.parse(fs.readFileSync(path.join(__dirname, 'vocabmiss.json')));

// 1. Słówka
let md = '# Słówka użyte w lekcji, a niewprowadzone wcześniej\n\nKolejność: `proponowana-kolejnosc.json`. Każde słowo liczone tylko przy pierwszym użyciu. `*` = występuje w teście. `[A1]` = jest w dziale tematycznym na danym poziomie (ale nie w słowniczku lekcji). Heurystyka – mogą trafić się fałszywe alarmy (imiona, formy, których lematyzator nie rozpoznał).\n\n';
miss.forEach((r) => {
  md += `## ${r.n}. ${r.id} (${r.level}) – ${r.miss.length} słów\n\n`;
  md += r.miss.map((m) => m.w + (m.in.includes('T') ? '*' : '') + (m.tv ? ` [${m.tv}]` : '')).join(', ') + '\n\n';
});
fs.writeFileSync(path.join(__dirname, 'raport-slowka.md'), md);

// 2. Gramatyka przed wprowadzeniem
const pos = Object.fromEntries(order.map((id, i) => [id, i]));
const intro = (k) => (k === 'articles' && pos['ARTICLES-BASIC'] != null ? 'ARTICLES-BASIC' : C[k][1]);
let g = '# Konstrukcje użyte przed lekcją, która je wyjaśnia\n\nKolejność: `proponowana-kolejnosc.json`. Wykrywanie heurystyczne (wyrażenia regularne) – traktuj jako listę miejsc do przejrzenia. Pominięto przedimki, my/your i this/that (w pierwszych lekcjach nie da się ich uniknąć – wymagają krótkiego wyjaśnienia na starcie, nie przepisywania zdań).\n\n';
const skip = new Set(['articles', 'obj-poss-pron', 'this-that']);
order.forEach((id, i) => {
  if (!B[id]) return;
  const items = ex(B[id]);
  const hits = [];
  for (const k in C) {
    if (skip.has(k) || i >= pos[intro(k)]) continue;
    items.filter((x) => C[k][0].test(x.s)).forEach((x) => hits.push(`- \`${x.where}\` **${k}** (lekcja ${pos[intro(k)] + 1}): ${x.s.replace(C[k][0], (m) => '**' + m + '**')}`));
  }
  if (hits.length) g += `## ${i + 1}. ${id} – ${hits.length}\n\n${hits.join('\n')}\n\n`;
});
fs.writeFileSync(path.join(__dirname, 'raport-gramatyka.md'), g);
console.log('OK: raport-slowka.md, raport-gramatyka.md');
