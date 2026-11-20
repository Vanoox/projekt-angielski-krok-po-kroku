// Szuka słów w słowniczkach wszystkich lekcji (całe słowa, bez wielkości liter).
// Użycie: node tools/audit/findvocab.js word1 word2 ...
const all = require('./all.json');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const w of process.argv.slice(2)) {
  const re = new RegExp('(^|[^a-z])' + esc(w.toLowerCase()) + '([^a-z]|$)');
  const hits = [];
  all.forEach((l, i) => ((l.practice && l.practice.vocab && l.practice.vocab.items) || []).forEach((v) => {
    if (re.test(v.en.toLowerCase())) hits.push(i + 1 + ':' + v.en);
  }));
  console.log(w.padEnd(12), hits.length ? hits.join(' ; ') : '—');
}
