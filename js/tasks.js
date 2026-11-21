// Zadania budowane z treści lekcji (moduł bez DOM; testy: tests/tasks.test.mjs, tests/data.test.mjs).
import { expandAnswer } from "./check.js";

// Dyktando: zdania z przykładów w teorii lekcji (sekcje „examples”, pole en). Pomijamy zdania, których nie da się
// jednoznacznie zapisać ze słuchu: z liczbami i walutą (25 / twenty-five), wariantami „A / B”, nawiasami, strzałkami,
// wielokropkiem, cudzysłowem, oraz bardzo krótkie (< 3 słów) i bardzo długie (> 16 słów).
const DICT_SKIP = /[\/=→←[\]()…_;:"“”„&<>\d£€$%+*#@]|\.\.|\s-\s/;
export function dictText(html) {
  const t = String(html || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").replace(/^[–—]\s*/, "").trim();
  if (!t || DICT_SKIP.test(t) || !/[.?!]$/.test(t)) return "";
  const n = t.split(" ").length;
  return n >= 3 && n <= 16 ? t : "";
}

// Znajdź błąd: zadania z sekcji „mistakes” (pary wrong / right / why; błędne miejsce w <b>…</b> – każda z 552 par
// je ma, więc nie trzeba klikać „między słowami”). Błędne zdanie = pierwszy wariant przed „ / ”; końcowy dopisek
// w nawiasie (po polsku, np. „(przez telefon)”) → podpowiedź pod zdaniem. Poprawne odpowiedzi: pole fix (pełne zdania,
// składnia jak w answers: {a|b}, (opcjonalne)), a bez niego warianty z right rozdzielone „ / ” (przy kilku błędnych
// wariantach – poprawny o tym samym numerze). fix jest potrzebne, gdy right ma warianty częściowe („I've got / I have
// a new phone.”) albo gubi kontekst zdania. Każda para daje dwa zadania: bad (zdanie z błędem) i good (to samo zdanie
// poprawnie – do „Tu nie ma błędu”); w rundzie ok. 20% to good.
export const untag = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const FE_ALT = /\s+\/\s+/;
// Lekcja → lista par { bad, good } (pusta, gdy lekcja nie ma sekcji „mistakes”).
export function buildFinds(lesson) {
  const finds = [];
  (lesson.sections || []).filter((s) => s.type === "mistakes").forEach((s) => (s.items || []).forEach((m) => {
    let w = String(m.wrong || "").trim(), note = "";
    const pm = w.match(/\s*\(([^()]*)\)$/);
    if (pm) { note = pm[1].trim(); w = w.slice(0, pm.index).trim(); }
    const ws = w.split(FE_ALT), rs = String(m.right || "").split(FE_ALT).map(untag);
    if (ws.length > 1) note = ""; // dopisek dotyczył ostatniego wariantu
    if (!/<b>/.test(ws[0])) return;
    const answers = Array.isArray(m.fix) && m.fix.length ? m.fix.slice() : ws.length > 1 && rs.length === ws.length ? [rs[0]] : rs;
    const model = expandAnswer(answers[0])[0];
    const common = { type: "finderr", why: m.why || "", wrongHtml: m.wrong, rightHtml: m.right };
    finds.push({
      bad: { ...common, q: untag(ws[0]), html: ws[0], note, answers, model },
      good: { ...common, ok: true, q: model, html: model, note: "", answers: [model], model },
    });
  }));
  return finds;
}
