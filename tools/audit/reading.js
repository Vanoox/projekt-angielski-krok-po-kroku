// Audyt czytanek (data/reading/*.js) – zgodność z kolejnością nauki.
// Użycie: node tools/audit/reading.js [id czytanki …]
// Dla każdego tekstu (akapity + pytania, odpowiedzi i opcje po angielsku):
//  1. słowa, których nie ma w słówkach lekcji 1…after (słowniczki lekcji, data/practice), w słowach gramatycznych
//     (FUNC z lemma.js) ani w glossary czytanki – przy każdym: lekcja, w której słowo wchodzi później, albo dział
//     tematyczny ([A1] = jest w działach na danym poziomie, ale nie w słowniczkach lekcji);
//  2. konstrukcje z późniejszych lekcji (wyrażenia regularne z det.js – heurystyka, trzeba przejrzeć);
//  3. wpisy glossary, których nie ma w tekście (zbędne), i wpisy, które są już w słówkach lekcji 1…after;
//  4. liczbę słów tekstu.
// Słowo z wielkiej litery w środku zdania, którego nie ma w słówkach, jest traktowane jak imię / nazwa (lista „nazwy”).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { lem, cands, FUNC } = require('./lemma.js');
const C = require('./det.js');

const R = path.join(__dirname, '..', '..', 'data');
const ctx = { window: {} };
vm.createContext(ctx);
for (const d of ['lessons', 'practice', 'vocab', 'reading']) {
  const dir = path.join(R, d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
}
const order = JSON.parse(fs.readFileSync(path.join(R, 'lessons', 'order.json')));
const pos = Object.fromEntries(order.map((id, i) => [id, i]));
const P = ctx.window.PRACTICE || {};
const READING = ctx.window.READING || [];
const only = process.argv.slice(2);

const strip = (s) => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const isPl = (s) => /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(s);
// Słowa z hasła słówka: „far (from) / close (to)” → far, from, close, to + formy podstawowe.
function vwords(en) {
  const s = new Set();
  strip(en).replace(/\((BrE|AmE)\)/g, '').toLowerCase().split(/[^\p{L}'\-]+/u).forEach((t) => {
    t = t.replace(/^'+|'+$/g, '');
    if (!t) return;
    s.add(t); s.add(lem(t));
    t.split('-').forEach((p) => p && s.add(p));
  });
  return s;
}
// Lekcja, w której słowo wchodzi do słowniczka (pierwsza), i poziom działu tematycznego.
const firstLesson = {};
order.forEach((id, i) => ((P[id] && P[id].vocab && P[id].vocab.items) || []).forEach((it) => vwords(it.en).forEach((w) => { if (!(w in firstLesson)) firstLesson[w] = i; })));
const LV = ['A1', 'A2', 'B1', 'B2'];
const tvLevel = {};
(ctx.window.VOCAB || []).forEach((t) => (t.groups || []).forEach((g) => (g.items || []).forEach((it) => vwords(it.en).forEach((w) => {
  if (!tvLevel[w] || LV.indexOf(t.level) < LV.indexOf(tvLevel[w])) tvLevel[w] = t.level;
}))));
const where = (w) => {
  const c = cands(w);
  const l = c.map((x) => firstLesson[x]).filter((x) => x != null).sort((a, b) => a - b)[0];
  const t = c.map((x) => tvLevel[x]).find(Boolean);
  return [l != null ? `lekcja ${l + 1}` : '', t ? `[${t}]` : ''].filter(Boolean).join(' ') || '—';
};

// Wszystkie angielskie zdania czytanki: akapity + pytania (q, opcje, odpowiedzi – pierwszy wariant).
function sentences(r) {
  const out = [];
  (r.text || []).forEach((p, i) => out.push({ where: 'text' + i, s: strip(p) }));
  (r.questions || []).forEach((x, i) => {
    const w = 'q' + i;
    if (x.q && !isPl(x.q)) out.push({ where: w, s: strip(x.q).replace(/_{2,}/g, ' ') });
    (x.options || []).forEach((o) => { if (!isPl(o)) out.push({ where: w + ':opt', s: strip(o) }); });
    (x.answers || []).forEach((a) => {
      const v = Array.isArray(a) ? a[0] : a;
      if (!isPl(v)) out.push({ where: w + ':ans', s: strip(v).replace(/\{([^|}]*)[^}]*\}/g, '$1').replace(/\(([^)]*)\)/g, '$1') });
    });
  });
  return out;
}
const tokens = (s) => s.replace(/[“”"]/g, ' ').replace(/’/g, "'").replace(/\bcan't\b/gi, 'can not').replace(/\bwon't\b/gi, 'will not').replace(/n't\b/gi, ' not').replace(/'(m|re|ve|ll|d)\b/gi, ' ')
  .replace(/\b(it|he|she|that|what|there|who|where|here|how|let)'s\b/gi, '$1').split(/[^\p{L}'\-]+/u).map((t) => t.replace(/^['’\-]+|['’\-]+$/g, '')).filter(Boolean);

let problems = 0;
for (const r of READING) {
  if (only.length && !only.includes(r.id)) continue;
  const ai = pos[r.after];
  if (ai == null) { console.log(`${r.id}: nieznana lekcja after „${r.after}”`); problems++; continue; }
  const known = new Set(FUNC);
  order.slice(0, ai + 1).forEach((id) => ((P[id] && P[id].vocab && P[id].vocab.items) || []).forEach((it) => vwords(it.en).forEach((w) => known.add(w))));
  const gloss = new Set();
  Object.keys(r.glossary || {}).forEach((g) => vwords(g).forEach((w) => gloss.add(w)));
  const isKnown = (t) => cands(t).some((c) => known.has(c));
  const isGloss = (t) => cands(t).some((c) => gloss.has(c));
  const miss = new Map(), names = new Set(), usedGloss = new Set();
  const all = sentences(r);
  all.forEach((x) => tokens(x.s).forEach((t, i) => {
    if (t.length < 2 && !/^[ai]$/i.test(t)) return;
    const parts = t.includes('-') ? t.split('-').filter(Boolean) : [t];
    if (isGloss(t)) { cands(t).forEach((c) => gloss.has(c) && usedGloss.add(c)); return; }
    if (parts.every((p) => isKnown(p) || isGloss(p))) { parts.forEach((p) => cands(p).forEach((c) => gloss.has(c) && usedGloss.add(c))); return; }
    if (/^[A-Z]/.test(t) && !isKnown(t.toLowerCase())) { names.add(t); return; }
    const k = lem(t.toLowerCase());
    if (!miss.has(k)) miss.set(k, { w: k, n: 0, ex: x.where + ': ' + x.s.slice(0, 90) });
    miss.get(k).n++;
  }));
  // Konstrukcje z późniejszych lekcji.
  const gram = [];
  for (const k in C) {
    const intro = pos[C[k][1]];
    if (intro == null || intro <= ai) continue;
    all.filter((x) => C[k][0].test(x.s)).forEach((x) => gram.push(`   ${k} (lekcja ${intro + 1}) ${x.where}: ${x.s.replace(C[k][0], (m) => '[' + m + ']').slice(0, 120)}`));
  }
  // Glossary: wpisy nieużyte i wpisy zbędne (słowo znane z lekcji).
  const textWords = new Set();
  all.forEach((x) => tokens(x.s).forEach((t) => cands(t).forEach((c) => textWords.add(c))));
  const glossUnused = Object.keys(r.glossary || {}).filter((g) => ![...vwords(g)].some((w) => textWords.has(w) || cands(w).some((c) => textWords.has(c))));
  const glossKnown = Object.keys(r.glossary || {}).filter((g) => { const ws = [...vwords(g)].filter((w) => !FUNC.has(w)); return ws.length && ws.every((w) => known.has(w)); });
  const nWords = (r.text || []).map(strip).join(' ').split(/\s+/).filter(Boolean).length;
  console.log(`\n=== ${r.id} (${r.level}, po lekcji ${ai + 1}: ${r.after}) – ${nWords} słów, ${(r.questions || []).length} pytań`);
  if (miss.size) { problems += miss.size; console.log(` słowa spoza słówek (${miss.size}):`); [...miss.values()].forEach((m) => console.log(`   ${m.w.padEnd(16)} ${where(m.w).padEnd(16)} ${m.ex}`)); }
  if (gram.length) { problems += gram.length; console.log(` konstrukcje z późniejszych lekcji (${gram.length}):\n${gram.join('\n')}`); }
  if (glossUnused.length) { problems += glossUnused.length; console.log(` glossary – brak w tekście: ${glossUnused.join(', ')}`); }
  if (glossKnown.length) console.log(` glossary – słowa są już w słówkach lekcji (zostaw, jeśli to inne znaczenie albo zwrot): ${glossKnown.join(', ')}`);
  if (names.size) console.log(` nazwy (wielka litera, spoza słówek; [poziom] = jest w działach tematycznych): ${[...names].map((n) => {
    const t = cands(n.toLowerCase().replace(/'s$/, '')).map((c) => tvLevel[c]).find(Boolean);
    return t ? `${n} [${t}]` : n;
  }).join(', ')}`);
}
console.log(`\n${problems ? 'Do przejrzenia: ' + problems : 'OK – brak uwag'}`);
