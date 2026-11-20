// Wypisuje WSZYSTKIE zadania lekcji w zwięzłej formie (po jednej linii) – do ręcznego przeglądu.
// Użycie: node tools/audit/compact.js <lesson-id>
// Format: <miejsce> | pytanie | odpowiedzi/opcje (poprawna oznaczona *)
const all = require('./all.json');
const l = all.find((x) => x.id === process.argv[2]);
if (!l) { console.error('Nie ma lekcji: ' + process.argv[2]); process.exit(1); }
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const fmt = (it) => {
  const q = strip(it.q || it.sentence || it.text || '');
  let a = '';
  if (it.options) a = it.options.map((o, i) => (i === it.answer ? '*' : '') + strip(o)).join(' / ');
  else if (it.answers) a = it.answers.map((x) => (Array.isArray(x) ? x.join(' ~ ') : strip(x))).join(' || ');
  else if (it.answer !== undefined) a = strip(JSON.stringify(it.answer));
  return `${q} | ${a}`;
};
(l.lesson.exercises || []).forEach((e, i) => console.log(`exercise${i} | ${fmt(e)}`));
const P = l.practice || {};
(P.practice || []).forEach((set, si) => (set.items || set.questions || []).forEach((it, ii) => console.log(`practice${si}.${ii} | ${fmt(it)}`)));
(P.test || []).forEach((it, i) => console.log(`test${i} | ${fmt(it)}`));
