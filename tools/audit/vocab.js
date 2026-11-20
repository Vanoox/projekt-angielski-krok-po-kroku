const fs = require('fs');
const { all, ex } = require('./en.js');
const { lem, cands, FUNC } = require('./lemma.js');
const order = JSON.parse(fs.readFileSync(__dirname + '/' + (process.argv[2] || 'proponowana-kolejnosc.json'))).filter((x) => x !== 'ARTICLES-BASIC');
const B = Object.fromEntries(all.map((o) => [o.id, o]));
const TV = JSON.parse(fs.readFileSync(__dirname + '/vocab.json'));

function vwords(en) {
  const s = new Set();
  String(en).replace(/<[^>]*>/g, '').replace(/\((BrE|AmE)\)/g, '').toLowerCase().split(/[^\p{L}'\-]+/u).forEach((t) => {
    t = t.replace(/^'+|'+$/g, '');
    if (!t) return;
    s.add(t); s.add(lem(t));
    t.split('-').forEach((p) => p && s.add(p));
  });
  return s;
}
const LV = ['A1', 'A2', 'B1', 'B2'];
const tvAll = {};
TV.forEach((t) => (t.groups || []).forEach((g) => (g.items || []).forEach((it) => vwords(it.en).forEach((w) => {
  if (!tvAll[w] || LV.indexOf(t.level) < LV.indexOf(tvAll[w])) tvAll[w] = t.level;
}))));

// proper names: capitalised mid-sentence and never lowercase
const capCount = {}, lowCount = {};
all.forEach((o) => ex(o).forEach((x) => x.s.split(/\s+/).forEach((t, i) => {
  const w = t.replace(/[^A-Za-z']/g, '').replace(/'s$/, '');
  if (!w) return;
  if (/^[A-Z][a-z]/.test(w) && i > 0) capCount[w.toLowerCase()] = 1;
  if (/^[a-z]/.test(w)) lowCount[w] = 1;
})));
const NAMES = new Set(Object.keys(capCount).filter((w) => !lowCount[w]));

const known = new Set(FUNC);const firstSeen = new Set();
const report = [];
const isKnown = (p) => NAMES.has(p.toLowerCase().replace(/'s$/, '')) || cands(p).some((c) => known.has(c));
order.forEach((id, idx) => {
  const o = B[id];
  (o.practice?.vocab?.items || []).forEach((it) => vwords(it.en).forEach((w) => known.add(w)));
  const miss = {};
  ex(o).forEach((x) => {
    if (/:q$/.test(x.where)) return;
    const kind = /^test/.test(x.where) ? 'T' : /^(practice|exercise)/.test(x.where) ? 'P' : 'L';
    x.s.replace(/[“”"]/g, ' ').replace(/’/g, "'").replace(/n't\b/gi, ' not').replace(/'(m|re|ve|ll|d)\b/gi, ' ').replace(/\b(it|he|she|that|what|there|who|where|here|how|let)'s\b/gi, '$1').split(/[^\p{L}'\-]+/u).forEach((t) => {
      t = t.replace(/^['’\-]+|['’\-]+$/g, '');
      if (!t || t.length < 2) return;
      if (isKnown(t)) return;
      if (t.includes('-') && t.split('-').every((p) => !p || isKnown(p))) return;
      const k = lem(t); if (firstSeen.has(k)) return;
      (miss[k] = miss[k] || { w: k, in: new Set(), ex: x.s }).in.add(kind);
    });
  });
  Object.keys(miss).forEach(k=>firstSeen.add(k)); report.push({ n: idx + 1, id, level: o.level, miss: Object.values(miss).map((m) => ({ w: m.w, in: [...m.in].sort().join(''), tv: tvAll[m.w] || cands(m.w).map((c) => tvAll[c]).find(Boolean) || '', ex: m.ex })) });
});
fs.writeFileSync(__dirname + '/vocabmiss.json', JSON.stringify(report, null, 1));
report.forEach((r) => {
  const t = r.miss.filter((m) => m.in.includes('T'));
  console.log(`${String(r.n).padStart(2)} ${r.level} ${r.id.padEnd(30)} brak:${String(r.miss.length).padStart(4)}  w teście:${String(t.length).padStart(3)}  (nie ma też w działach tematycznych: ${r.miss.filter((m) => !m.tv).length})`);
});
console.log('SUMA', report.reduce((s, r) => s + r.miss.length, 0));
