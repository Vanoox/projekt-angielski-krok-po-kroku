// Szuka konstrukcji, których nie wykrywa det.js/report.js, użytych PRZED lekcją, która je wyjaśnia.
// Użycie: node tools/audit/scan.js            -> liczba trafień na lekcję
//         node tools/audit/scan.js -v         -> wszystkie trafienia
//         node tools/audit/scan.js <lesson-id> -> trafienia w jednej lekcji
// Pomija pola: explain, pl, note, why, vocab, title, instruction, task, intro (polskie objaśnienia).
// Heurystyka – fałszywe alarmy są normalne (np. "had" jako "miał", "I'd like").
const all = require('./all.json');
const pos = {}; all.forEach((l, i) => (pos[l.id] = i));
const PP = "(been|done|gone|seen|eaten|taken|given|written|known|made|left|lost|met|bought|sold|told|said|found|got|heard|forgotten|broken|spoken|come|become|begun|drunk|driven|flown|run|swum|sent|spent|stolen|thought|won|worn|\w+ed)";
const pats = {
  // B1
  'pp-cont': [/\b(have|has|'ve|haven't|hasn't)( \w+)? been \w+ing\b/i, 'present-perfect-continuous'],
  'past-perf': [new RegExp("\b(had|'d)(n't)?( (already|just|never|ever|not))? " + PP + "\b", 'i'), 'past-perfect'],
  'used-to': [/\b(used to|use to)\b/i, 'used-to-would'],
  'too-enough': [/\btoo \w+ (for \w+ )?to\b|\b\w+ enough to\b|\bsuch (a|an) \w+|\bso \w+ that\b/i, 'too-enough-so-such'],
  'reported': [/\b(said|told (me|him|her|us|them)|asked (me|him|her|us|them)( if| whether)?)( that)? (he|she|they|I|we|you|it)\b/i, 'reported-speech'],
  'q-tag': [/, (isn't|aren't|don't|doesn't|didn't|won't|can't|haven't|hasn't|wasn't|weren't|is|are|do|does|did|will|can|have|has|was|were|shall) (it|he|she|you|we|they|I|there)\?/i, 'question-tags'],
  'linking': [/\b(although|though|despite|in spite of|however|whereas|moreover|therefore|even though|unless)\b/i, 'linking-words'],
  // B2
  'future-cont': [/\b(will|'ll|won't) be \w+ing\b/i, 'future-continuous'],
  'future-perf': [new RegExp("\b(will|'ll|won't) have (been )?" + PP + "\b", 'i'), 'future-perfect'],
  'past-perf-cont': [/\bhad(n't)? been \w+ing\b/i, 'past-perfect-continuous'],
  'modal-perf': [new RegExp("\b(must|might|may|could|can't|couldn't|should|shouldn't)( not)? have " + PP + "\b", 'i'), 'modals-deduction'],
  'would-have': [new RegExp("\b(would|wouldn't|'d)( not)? have " + PP + "\b", 'i'), 'conditional-3-mixed'],
  'wish': [/\b(wish|if only)\b/i, 'wish-if-only'],
  'causative': [/\b(have|has|had|having|get|gets|got|getting) (my|your|his|her|our|their|the|a|it) ?\w* (done|cut|repaired|fixed|cleaned|checked|painted|delivered|serviced|installed|stolen|tested|redecorated|dyed|built|made|washed|printed)\b/i, 'causative'],
};
const SKIP = ['vocab', 'explain', 'pl', 'why', 'note', 'requires', 'intro', 'title', 'instruction', 'task'];
const walk = (o, p, out) => {
  if (typeof o === 'string') out.push([p, o]);
  else if (Array.isArray(o)) o.forEach((x, i) => walk(x, p + '.' + i, out));
  else if (o && typeof o === 'object') for (const k in o) if (!SKIP.includes(k)) walk(o[k], p + '.' + k, out);
};
const arg = process.argv[2];
const cnt = {};
all.forEach((l, i) => {
  const out = []; walk(l.lesson, 'L', out); walk(l.practice, 'P', out);
  for (const [p, s0] of out) {
    const s = s0.replace(/<[^>]+>/g, '');
    for (const [k, [re, target]] of Object.entries(pats)) {
      if (pos[target] === undefined) throw new Error('brak lekcji ' + target);
      if (i < pos[target] && re.test(s)) {
        cnt[l.id + ' ' + k] = (cnt[l.id + ' ' + k] || 0) + 1;
        if (arg === '-v' || arg === l.id) console.log(i + 1, l.id, k, '→ lekcja', pos[target] + 1, p.slice(0, 40), '|', s.slice(0, 150));
      }
    }
  }
});
if (!arg) console.log(Object.entries(cnt).map(([k, v]) => pos[k.split(' ')[0]] + 1 + ' ' + k + ': ' + v).join('\n'));
