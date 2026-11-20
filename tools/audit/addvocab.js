// Dopisuje słówka na koniec listy vocab.items w data/practice/<id>.js
// Użycie: node tools/audit/addvocab.js <plik.json>
// plik.json: { "<lesson-id>": ["en | pl", "en | pl | note", ...], ... }
const fs = require('fs');
const path = require('path');
const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const q = (s) => JSON.stringify(s.trim());
for (const [id, items] of Object.entries(spec)) {
  const f = path.join(__dirname, '../../data/practice', id + '.js');
  let s = fs.readFileSync(f, 'utf8');
  const v = s.indexOf('vocab:');
  const end = s.indexOf('\n    ],', v);
  if (v < 0 || end < 0) throw new Error('vocab block not found: ' + id);
  const lines = items.map((it) => {
    const [en, pl, note] = it.split('|');
    return `      { en: ${q(en)}, pl: ${q(pl)}${note ? `, note: ${q(note)}` : ''} },`;
  });
  s = s.slice(0, end) + '\n      // --- słowa z ćwiczeń ---\n' + lines.join('\n') + s.slice(end);
  fs.writeFileSync(f, s);
  console.log(`${id}: +${items.length}`);
}
