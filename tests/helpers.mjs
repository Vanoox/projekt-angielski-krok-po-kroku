// Wspólne dla testów: dane kursu z data/bundle.js (tak jak widzi je strona) i atrapa localStorage.
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { buildFinds, dictText } from "../js/tasks.js";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));

let course = null;
// { lessons (kolejność nauki, z practice/test/vocab z data/practice), reading, dialogues, vocab, exs: wszystkie zadania }
export function loadCourse() {
  if (course) return course;
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(ROOT + "data/bundle.js", "utf8"), ctx, { filename: "data/bundle.js" });
  const W = JSON.parse(JSON.stringify(ctx.window)); // zwykłe obiekty (nie z kontekstu vm)
  const P = W.PRACTICE || {};
  const lessons = (W.LESSONS || []).map((l) => {
    const p = P[l.id] || {};
    const out = { ...l, vocab: p.vocab || l.vocab || null, practice: p.practice || l.practice || [], test: p.test || l.test || [] };
    out.finds = buildFinds(out);
    out.dict = [];
    out.sections.filter((s) => s.type === "examples").forEach((s) => (s.items || []).forEach((e) => { const t = dictText(e.en); if (t) out.dict.push({ type: "dictation", say: t, answers: [t] }); }));
    return out;
  });
  const reading = W.READING || [], dialogues = W.DIALOGUES || [];
  // Zadania jak w rejestrze TASKS w app.js (lekcje: e, p0…, t, d, f; czytanki i dialogi: pytania).
  const exs = [];
  for (const l of lessons) {
    exs.push(...(l.exercises || []), ...l.practice.flatMap((p) => p.items || []), ...l.test, ...l.dict, ...l.finds.flatMap((p) => [p.bad, p.good]));
  }
  for (const r of reading) exs.push(...(r.questions || []));
  for (const d of dialogues) exs.push(...(d.questions || []));
  course = { lessons, byId: Object.fromEntries(lessons.map((l) => [l.id, l])), reading, dialogues, vocab: W.VOCAB || [], exs };
  return course;
}

// Atrapa localStorage (Map) – ustawiana przed importem js/storage.js.
export function fakeLocalStorage() {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
    _map: m,
  };
}

// Data lokalna (miesiąc od 1): d(2026, 11, 21, 10) = 21 listopada 2026, 10:00.
export const d = (y, mo, day, h = 12, mi = 0, s = 0) => new Date(y, mo - 1, day, h, mi, s);
