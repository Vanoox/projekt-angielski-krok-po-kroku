// Widok #/czasy – oś czasów: wszystkie czasy na jednej osi, karty czasów i porównania.
import { esc } from "../util.js";
import { icon } from "../icons.js";
import { doneTick, $, SITE_TITLE, badge, speakBtn } from "../ui.js";
import { PATH, BY_ID, lessonNo } from "../data.js";
import { state, reachIdx } from "../state.js";
import { cmpExample } from "../sections.js";
import { CJ_TENSES, CJ_BY_ID, cjLockedIdx } from "../conj.js";

// ---------- Oś czasów (#/czasy) ----------
// Każdy czas narysowany na wspólnej osi (SVG 600×48: oś y = 24, „teraz” x = 300). Kształty: dot – jedno zdarzenie,
// dots – powtarza się, wave – czynność w trakcie (arrow – trwa aż do końca fali), ref – moment odniesienia „wtedy”,
// arc – strzałka skutku / „wcześniej niż” (dash – zamiar). Treść karty pochodzi z lekcji danego czasu: budowa z sekcji
// formula (rows – które wiersze), przykłady z sekcji examples (ex – początek zdania), słowa-sygnały z pierwszej tabeli
// „…sygnał…” (sig – początek wyrażenia albo para [en, pl], gdy tabela ich nie ma). Porównania – sekcje compare lekcji.
const TL_Y = 24;
const TL = {
  pas: { pl: "czas przeszły prosty", short: "zakończone, wiadomo kiedy", shape: [["dot", 170]],
    pic: "Jedna kropka w przeszłości: zdarzenie zaczęło się i skończyło. Zwykle wiemy albo pytamy, <b>kiedy</b> to było.",
    ex: ["I visited my grandparents", "We went to Italy", "Did you see the match"], sig: ["yesterday", "… ago", "last night", "in 2010", "when I was"] },
  pac: { pl: "czas przeszły ciągły", short: "w trakcie w przeszłości", shape: [["ref", 200], ["wave", 136, 264]],
    pic: "Fala wokół kreski „wtedy”: w tym momencie przeszłym czynność była <b>w trakcie</b>. Kreska to np. godzina (at 7 pm yesterday) albo krótkie zdarzenie, które ją przerwało (when the phone rang).",
    ex: ["At 7 pm yesterday", "I was having a shower", "While I was working"], sig: ["at 8 o'clock", "at that moment", "this time last week", "while / when"] },
  pap: { pl: "czas zaprzeszły", short: "wcześniej niż inne zdarzenie", shape: [["ref", 220], ["arc", 110, 220], ["dot", 110]],
    pic: "Dwa momenty w przeszłości: kreska „wtedy” to chwila z opowieści (zwykle Past Simple), a kropka przed nią – to, co stało się <b>jeszcze wcześniej</b>.",
    ex: ["When I got to the station", "By the time we arrived", "I was hungry because"], sig: ["by the time", "already", "never … before", "before / after"] },
  papc: { pl: "czas zaprzeszły ciągły", short: "jak długo – do chwili w przeszłości", shape: [["ref", 220], ["wave", 76, 204, 1]],
    pic: "Fala, która dochodzi do kreski „wtedy”: czynność trwała <b>jakiś czas</b> przed momentem w przeszłości. Ważne jest, jak długo.",
    ex: ["I had been waiting for an hour", "The streets were wet", "Her eyes were red"], sig: ["for + okres", "since + początek", "how long", "all day", "when / by the time"] },
  ps: { pl: "czas teraźniejszy prosty", short: "nawyki, fakty", shape: [["dots"]],
    pic: "Kropki na całej osi: coś dzieje się <b>regularnie</b> albo jest zawsze prawdą – wczoraj, dziś i jutro.",
    ex: ["I get up at seven", "My sister lives", "Water boils"], sig: ["always", "usually", "often", "never", "every day", "on Mondays"] },
  pc: { pl: "czas teraźniejszy ciągły", short: "teraz, w trakcie", shape: [["wave", 236, 364]],
    pic: "Fala wokół „teraz”: czynność <b>trwa w tej chwili</b> albo w tym okresie (this week) – zaczęła się i jeszcze się nie skończyła.",
    ex: ["I'm reading a really", "Look! It's snowing", "I'm working from home"], sig: ["now / right now", "at the moment", "Look! / Listen!", "today, this week", "these days"] },
  pp: { pl: "czas teraźniejszy dokonany", short: "skutek teraz, doświadczenie", shape: [["arc", 170, 300], ["dot", 170]],
    pic: "Kropka w przeszłości i strzałka do „teraz”: nie mówimy, kiedy to się stało – liczy się <b>skutek albo doświadczenie teraz</b>. Tak samo mówimy o stanie, który trwa od przeszłości do teraz (for, since).",
    ex: ["Have you ever been to London", "I've lost my phone", "I've lived here for five"], sig: ["ever", "never", "just", "already", "yet", ["for + okres", "od / przez (ile czasu)"], ["since + punkt w czasie", "od (kiedy)"]] },
  ppc: { pl: "czas teraźniejszy dokonany ciągły", short: "jak długo – do teraz", shape: [["wave", 140, 284, 1]],
    pic: "Fala od przeszłości aż do „teraz”: czynność trwa do tej chwili (albo przed chwilą się skończyła) i ważne jest, <b>jak długo</b>.",
    ex: ["I've been waiting for you", "How long have you been learning", "I'm exhausted"], sig: ["How long", "for + okres", "since + punkt", "all day", "lately"] },
  fs: { pl: "czas przyszły prosty", short: "decyzja teraz, obietnica, opinia", shape: [["dot", 440]],
    pic: "Kropka w przyszłości: coś się stanie. Używamy will, gdy <b>decydujemy w chwili mówienia</b>, obiecujemy, proponujemy albo mówimy, co naszym zdaniem się stanie (I think…).",
    ex: ["I'm thirsty", "I'll call you as soon as", "I think Poland will win"], sig: ["I think", "I'm sure", "probably", "perhaps", "tomorrow"] },
  gt: { pl: "zamiar, plan, przewidywanie", short: "zamiar, widać, że się stanie", shape: [["arc", 300, 431, 1], ["dot", 440]],
    pic: "Przerywana strzałka od „teraz” do kropki w przyszłości: <b>już teraz</b> mamy zamiar (decyzja zapadła wcześniej) albo widzimy znaki, że coś się zaraz stanie.",
    ex: ["I'm going to start a new job", "We're going to paint", "Look at those clouds"], sig: ["I've decided", "tonight", "Look! / Watch out!"] },
  fc: { pl: "czas przyszły ciągły", short: "w trakcie w przyszłości", shape: [["ref", 460], ["wave", 396, 524]],
    pic: "Fala wokół kreski „wtedy” w przyszłości: w tym momencie czynność <b>będzie w trakcie</b>.",
    ex: ["This time next week", "Don't call me at 9", "At midnight we'll still"], sig: [["this time tomorrow / next week", "jutro / w przyszłym tygodniu o tej porze"], ["at 8 tomorrow", "jutro o ósmej"], ["still", "wciąż, nadal"]] },
  fp: { pl: "czas przyszły dokonany", short: "zakończone do chwili w przyszłości", shape: [["ref", 480], ["arc", 380, 480], ["dot", 380]],
    pic: "Kropka przed kreską „wtedy” w przyszłości: coś będzie <b>już zakończone</b> najpóźniej do tego momentu (by Friday).",
    rows: /^Future Perfect \(/, ex: ["I'll have finished the project", "By the time you get here", "Will you have read"], sig: ["by + czas", "by the time", "in + okres", "before"] },
  fpc: { pl: "czas przyszły dokonany ciągły", short: "jak długo – do chwili w przyszłości", shape: [["ref", 480], ["wave", 220, 464, 1]],
    pic: "Fala, która dochodzi do kreski „wtedy” w przyszłości: liczymy, <b>jak długo</b> coś będzie trwało do tego momentu.",
    rows: /^Future Perfect Continuous \(/, ex: ["In June I'll have been", "By 6 p.m. she'll", "Next month we'll"], sig: ["for + okres", "by + czas", "by the time"] },
};
const TL_GROUPS = [["Przeszłość", ["pas", "pac", "pap", "papc"]], ["Teraźniejszość", ["ps", "pc", "pp", "ppc"]], ["Przyszłość", ["fs", "gt", "fc", "fp", "fpc"]]];
const tlIds = () => TL_GROUPS.flatMap(([, ids]) => ids).filter((id) => TL[id] && CJ_BY_ID[id]);
const tlStrip = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const tlLesson = (id) => BY_ID[CJ_BY_ID[id].lesson];
const tlLocked = (id) => cjLockedIdx(CJ_BY_ID[id]) > reachIdx();
const tlKnown = (id) => !!state.done[CJ_BY_ID[id].lesson];
function tlSvg(id) {
  const f = (n) => +n.toFixed(1);
  const head = (x, y, dx, dy) => { // trójkąt grotu: czubek (x, y), kierunek (dx, dy)
    const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = 10, w = 5.5;
    return `<path class="tl-head" d="M${f(x)} ${f(y)}L${f(x - ux * s - uy * w)} ${f(y - uy * s + ux * w)}L${f(x - ux * s + uy * w)} ${f(y - uy * s - ux * w)}Z"/>`;
  };
  let refs = "", body = "";
  for (const [k, a, b, opt] of TL[id].shape) {
    if (k === "ref") refs += `<line class="tl-ref" x1="${a}" y1="7" x2="${a}" y2="41"/>`;
    else if (k === "dot") body += `<circle class="tl-dot" cx="${a}" cy="${TL_Y}" r="7"/>`;
    else if (k === "dots") for (let x = 60; x <= 540; x += 60) body += `<circle class="tl-dot" cx="${x}" cy="${TL_Y}" r="5"/>`;
    else if (k === "wave") {
      const end = opt ? b - 8 : b, n = Math.max(2, Math.round((end - a) / 16)), w = (end - a) / n / 2;
      body += `<path class="tl-wave" d="M${a} ${TL_Y}q${f(w / 2)} -8 ${f(w)} 0${(" t" + f(w) + " 0").repeat(2 * n - 1)}"/>`;
      if (opt) body += head(b + 2, TL_Y, 1, 0);
    } else if (k === "arc") { // łuk nad osią od a do b; linia kończy się tuż przed czubkiem grotu
      const y0 = TL_Y - 6, cy = TL_Y - 30, mx = (a + b) / 2, dx = b - mx, dy = y0 - cy, l = Math.hypot(dx, dy);
      body += `<path class="tl-arc${opt ? " dash" : ""}" d="M${a} ${y0}Q${mx} ${cy} ${f(b - dx / l * 7)} ${f(y0 - dy / l * 7)}"/>` + head(b, y0, dx, dy);
    }
  }
  return `<svg class="tl-svg" viewBox="0 0 600 48" aria-hidden="true" focusable="false"><line class="tl-ax" x1="10" y1="${TL_Y}" x2="582" y2="${TL_Y}"/><path class="tl-axhead" d="M590 ${TL_Y}l-11 -5.5v11z"/><line class="tl-now" x1="300" y1="2" x2="300" y2="46"/>${refs}${body}</svg>`;
}
function tlFormula(id) {
  const re = TL[id].rows || /^(Twierdzenie|Przeczenie|Pytanie) \(/;
  const s = tlLesson(id).sections.find((x) => x.type === "formula" && x.rows.some((r) => re.test(tlStrip(r.label))));
  return s ? s.rows.filter((r) => re.test(tlStrip(r.label))).slice(0, 3) : [];
}
function tlExamples(id) {
  const all = tlLesson(id).sections.filter((s) => s.type === "examples").flatMap((s) => s.items || []);
  return TL[id].ex.map((p) => all.find((e) => tlStrip(e.en).startsWith(p))).filter(Boolean);
}
function tlSignals(id) {
  const tb = tlLesson(id).sections.find((s) => s.type === "table" && /sygna/i.test(s.title || ""));
  const rows = tb ? tb.rows.map((r) => [tlStrip(r[0]), tlStrip(r[1])]) : [];
  return TL[id].sig.map((p) => (Array.isArray(p) ? p : rows.find(([en]) => en.startsWith(p)))).filter(Boolean);
}
// Etykieta kolumny porównania → czas: ostatnia nazwa czasu w etykiecie („When + Past Simple, Past Continuous” → Past
// Continuous), przy remisie dłuższa („Present Perfect Continuous (have been + -ing)”); „will” i „going to” jako skróty.
const TL_ALIAS = { fs: ["will"], gt: ["going to"] };
function tlLabelId(label) {
  const s = tlStrip(label);
  let best = null, bi = -1, bl = 0;
  for (const t of CJ_TENSES) for (const n of [t.name, ...(TL_ALIAS[t.id] || [])]) {
    const re = new RegExp(`\\b${n.replace(/ /g, "\\s+")}\\b`, "gi");
    let m, last = -1;
    while ((m = re.exec(s))) last = m.index;
    if (last < 0) continue;
    if (last > bi || (last === bi && n.length > bl)) { best = t.id; bi = last; bl = n.length; }
  }
  return best;
}
// Link z lekcji: lekcja czasu → jej wiersz na osi, lekcje porównujące dwa czasy → porównanie, przegląd czasów → cała oś.
const TL_LESSON_CMP = { "present-simple-vs-continuous": ["ps", "pc"], "present-perfect-vs-past-simple": ["pas", "pp"] };
export function tlLessonLink(l) {
  if (l.id === "tenses-overview") return `<a class="card tl-promo" href="#/czasy"><span class="f-ico">${icon("timeline")}</span><span><b>Oś czasów</b><span>Wszystkie czasy na jednym rysunku: kiedy którego używać, budowa, przykłady, słowa-sygnały i porównania dwóch czasów.</span></span></a>`;
  const cmp = TL_LESSON_CMP[l.id];
  if (cmp) return `<p class="tl-lesson-link"><a href="#/czasy/porownaj/${cmp[0]}/${cmp[1]}">${icon("timeline")} Te dwa czasy na osi czasów →</a></p>`;
  const t = CJ_TENSES.find((x) => x.lesson === l.id && TL[x.id]);
  return t ? `<p class="tl-lesson-link"><a href="#/czasy/${t.id}">${icon("timeline")} Ten czas na osi czasów →</a></p>` : "";
}
let tlCmpCache = null;
function tlCompares() {
  if (!tlCmpCache) {
    tlCmpCache = [];
    PATH.forEach((l) => l.sections.forEach((s) => {
      if (s.type !== "compare") return;
      const ids = (s.items || []).map((it) => tlLabelId(it.label));
      if (new Set(ids.filter(Boolean)).size >= 2) tlCmpCache.push({ l, s, ids });
    }));
  }
  return tlCmpCache;
}
// Gotowe pary (chipy, w kolejności lekcji): sąsiednie kolumny porównań do 3 kolumn. Zestawienia 4 sposobów mówienia
// o przyszłości dają też pary typu Present Simple – Future Simple – te są dostępne z list wyboru, bez osobnego chipa.
function tlPairs() {
  const seen = new Set(), out = [], order = tlIds();
  tlCompares().forEach(({ ids }) => {
    if (ids.length > 3) return;
    const u = [...new Set(ids.filter(Boolean))];
    u.slice(1).forEach((b, i) => {
      const p = [u[i], b].sort((x, y) => order.indexOf(x) - order.indexOf(y)), k = p.join("/");
      if (!seen.has(k)) { seen.add(k); out.push(p); }
    });
  });
  return out;
}
// sel – czas z rozwiniętą kartą (karta otwiera się pod jego wierszem, null = wszystkie zwinięte); a, b – porównanie.
let tlCfg = { sel: null, known: false, a: "pas", b: "pp" };
function tlRowHtml(id) {
  const t = CJ_BY_ID[id], locked = tlLocked(id), on = tlCfg.sel === id;
  return `<button type="button" class="tl-row${locked ? " locked" : ""}${on ? " active" : ""}" data-t="${id}" aria-expanded="${on}"${on ? ` aria-controls="tlCard"` : ""}>
      <span class="tl-name"><b>${doneTick(esc(t.name), tlKnown(id))}</b><small>${esc(TL[id].short)}${locked ? ` · lekcja ${cjLockedIdx(t) + 1}` : ""}</small></span>${tlSvg(id)}<span class="tl-chev" aria-hidden="true">${icon("chevron")}</span></button>
      ${on ? `<div class="tl-card" id="tlCard" role="region" aria-label="${esc(t.name)}">${tlCardHtml(id)}</div>` : ""}`;
}
function tlLanesHtml() {
  const groups = TL_GROUPS.map(([g, ids]) => {
    const v = ids.filter((id) => TL[id] && CJ_BY_ID[id] && (!tlCfg.known || tlKnown(id)));
    return v.length ? `<div class="tl-group" role="group" aria-label="${g}"><div class="tl-gname">${g}</div>${v.map(tlRowHtml).join("")}</div>` : "";
  }).join("");
  if (!groups) {
    const first = BY_ID[CJ_TENSES[0].lesson];
    return `<div class="tl-empty">Nie masz jeszcze przerobionych lekcji z czasami. Zacznij od lekcji <a href="#/lesson/${first.id}">${lessonNo(first)}. ${esc(first.title)}</a> i oznacz ją jako przerobioną – albo pokaż wszystkie czasy.</div>`;
  }
  return `<div class="tl-scale-row" aria-hidden="true"><span></span><span class="tl-scale"><span>← przeszłość</span><span class="tl-now-l">teraz</span><span>przyszłość →</span></span></div>${groups}`;
}
function tlFilterHtml() {
  const n = tlIds().filter(tlKnown).length;
  return `<div class="chips tl-filter" role="group" aria-label="Które czasy pokazać">
      <button class="chip ${tlCfg.known ? "" : "active"}" data-known="0" aria-pressed="${!tlCfg.known}">Wszystkie czasy (${tlIds().length})</button>
      <button class="chip ${tlCfg.known ? "active" : ""}" data-known="1" aria-pressed="${tlCfg.known}">Tylko te, które znam (${n})</button></div>`;
}
const TL_LEGEND = `<div class="tl-legend">
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><circle class="tl-dot" cx="18" cy="10" r="6"/></svg>jedno zdarzenie</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><path class="tl-wave" d="M3 10q3.75 -7 7.5 0t7.5 0t7.5 0t7.5 0"/></svg>czynność w trakcie</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><line class="tl-ref" x1="18" y1="2" x2="18" y2="18"/></svg>„wtedy” – moment, o którym mówimy</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><path class="tl-arc" d="M4 15Q16 -1 28 12"/><path class="tl-head" d="M32 15l-9.5 -1.5l5 -7z"/></svg>skutek albo „wcześniej niż”</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><line class="tl-now" x1="18" y1="1" x2="18" y2="19"/></svg>teraz</span>
    </div>`;
function tlCardHtml(id) {
  const t = CJ_BY_ID[id], d = TL[id], l = tlLesson(id), no = cjLockedIdx(t) + 1;
  const rows = tlFormula(id), ex = tlExamples(id), sig = tlSignals(id), ref = d.shape.find((s) => s[0] === "ref");
  return `<div class="tl-card-head"><h2>${esc(t.name)}</h2><span class="tl-pl">${esc(d.pl)}</span>${badge(l.level)}</div>
      ${tlLocked(id) ? `<p class="tl-lock">${icon("alert")} <span>Ten czas poznasz w lekcji <a href="#/lesson/${l.id}">${no}. ${esc(l.title)}</a> – możesz już zajrzeć.</span></p>` : ""}
      <div class="tl-big">
        <div class="tl-marks" aria-hidden="true">${ref ? `<span style="left:${(ref[1] / 6).toFixed(2)}%">wtedy</span>` : ""}<span class="tl-now-l" style="left:50%">teraz</span></div>
        ${tlSvg(id)}
        <div class="tl-ends" aria-hidden="true"><span>← przeszłość</span><span>przyszłość →</span></div>
      </div>
      <p class="tl-pic">${d.pic}</p>
      ${t.use ? `<p class="tl-use"><b>Kiedy używamy?</b> ${esc(t.use)}.</p>` : ""}
      ${rows.length ? `<h3>Budowa</h3><div class="formula-grid">${rows.map((r) => `<div class="formula-row"><div class="f-label">${r.label}</div><div class="f-body"><div class="formula">${r.formula}</div>${r.example ? `<div class="f-example">${speakBtn(r.example)}<span>${r.example}</span></div>` : ""}</div></div>`).join("")}</div>` : ""}
      ${ex.length ? `<h3>Przykłady</h3><ul class="tl-ex">${ex.map(cmpExample).join("")}</ul>` : ""}
      ${sig.length ? `<h3>Słowa-sygnały</h3><ul class="tl-sig">${sig.map(([en, pl]) => `<li><b>${esc(en)}</b><span>${esc(pl)}</span></li>`).join("")}</ul>` : ""}
      <div class="tl-links"><a class="btn primary" href="#/lesson/${l.id}">${icon("book-open")} Lekcja ${no}. ${esc(l.title)}</a><a class="btn" href="#/odmiana">${icon("layers")} Odmiana czasownika</a><button type="button" class="btn" data-cmp="${id}">${icon("repeat")} Porównaj z innym czasem</button></div>`;
}
function tlCmpHtml() {
  const { a, b } = tlCfg, ids = tlIds();
  const opts = (v) => ids.map((id) => `<option value="${id}"${id === v ? " selected" : ""}>${esc(CJ_BY_ID[id].name)}</option>`).join("");
  const col = (id) => {
    const t = CJ_BY_ID[id], f = tlFormula(id)[0], e = tlExamples(id)[0];
    return `<div class="card tl-cmp-col"><h3><a href="#/czasy/${id}" data-t="${id}">${esc(t.name)}</a></h3>${tlSvg(id)}
        <p class="tl-cmp-use">${esc(t.use || TL[id].short)}</p>
        ${f ? `<div class="formula">${f.formula}</div>` : ""}
        ${e ? `<ul class="tl-ex">${cmpExample(e)}</ul>` : ""}</div>`;
  };
  const pairs = tlPairs().map(([x, y]) => `<button class="chip ${(x === a && y === b) || (x === b && y === a) ? "active" : ""}" data-pair="${x}/${y}">${esc(CJ_BY_ID[x].name)} – ${esc(CJ_BY_ID[y].name)}</button>`).join("");
  let res;
  if (a === b) res = `<p class="tl-note">Wybierz dwa różne czasy.</p>`;
  else {
    const blocks = tlCompares().filter((c) => c.ids.includes(a) && c.ids.includes(b)).map(({ l, s, ids: cids }) => `<div class="tl-src">
          <h3>${s.title} <small>z lekcji <a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a></small></h3>
          <div class="compare">${s.items.filter((_, i) => cids[i] === a || cids[i] === b).map((c) => `<div class="card compare-col"><h3>${c.label}</h3><div class="prose">${c.html}</div>${(c.examples || []).length ? `<ul>${c.examples.map(cmpExample).join("")}</ul>` : ""}</div>`).join("")}</div></div>`);
    res = `<div class="compare tl-cmp-cols">${col(a)}${col(b)}</div>` + (blocks.length
      ? `<h3 class="tl-sub">Porównanie z lekcji</h3>${blocks.slice(0, 2).join("")}${blocks.length > 2 ? `<details class="tl-more"><summary>Więcej porównań tych czasów (${blocks.length - 2})</summary>${blocks.slice(2).join("")}</details>` : ""}`
      : `<p class="tl-note">W lekcjach nie ma osobnego porównania tych dwóch czasów – porównaj rysunek, budowę i przykłady powyżej.</p>`);
  }
  return `<div class="card tl-cmp-pick">
        <div class="tl-selects"><label><span>Czas 1</span><select id="tlA">${opts(a)}</select></label><button type="button" class="btn small" id="tlSwap" title="Zamień miejscami" aria-label="Zamień miejscami">${icon("swap")}</button><label><span>Czas 2</span><select id="tlB">${opts(b)}</select></label></div>
        ${pairs ? `<div><h3>Gotowe porównania z lekcji</h3><div class="chips tl-pairs">${pairs}</div></div>` : ""}
      </div>${res}`;
}
export const timelineView = (arg) => ({ html: renderTimeline(arg), title: `Oś czasów – ${SITE_TITLE}`, mount: () => { bindTimeline(); } });
function renderTimeline(arg) {
  const p = String(arg || "").split("/").map((x) => { try { return decodeURIComponent(x); } catch (e) { return ""; } });
  const ok = (id) => !!(TL[id] && CJ_BY_ID[id]);
  if (p[0] === "porownaj" && ok(p[1]) && ok(p[2])) { tlCfg.a = p[1]; tlCfg.b = p[2]; }
  else tlCfg.sel = ok(p[0]) ? p[0] : null;
  return `<div class="page timeline">
      <div class="hero"><h1>${icon("timeline")} Oś czasów</h1><p>Wszystkie czasy na jednej osi: przeszłość – teraz – przyszłość. Kliknij czas, żeby zobaczyć, co znaczy rysunek, jak zbudować zdanie, przykłady i słowa-sygnały. Niżej porównasz dwa czasy obok siebie.</p></div>
      <div class="card tl-wrap">
        <div class="tl-top">${tlFilterHtml()}</div>
        ${TL_LEGEND}
        <div class="tl-lanes" id="tlLanes">${tlLanesHtml()}</div>
      </div>
      <h2 class="section-title" id="tlCmp">${icon("columns")} Porównaj dwa czasy</h2>
      <div id="tlCmpBox">${tlCmpHtml()}</div>
    </div>`;
}
function bindTimeline() {
  const page = $(".page.timeline"); if (!page) return;
  const lanes = $("#tlLanes"), cmp = $("#tlCmpBox");
  const url = () => history.replaceState(null, "", location.pathname + location.search + (tlCfg.sel ? "#/czasy/" + tlCfg.sel : "#/czasy"));
  // Otwiera / zamyka kartę pod wierszem; wiersz zostaje w tym samym miejscu ekranu (karta wyżej mogła się zamknąć).
  const toggle = (id, open) => {
    const r0 = lanes.querySelector(`.tl-row[data-t="${id}"]`), top0 = r0 ? r0.getBoundingClientRect().top : null;
    tlCfg.sel = open || tlCfg.sel !== id ? id : null;
    if (tlCfg.known && !tlKnown(id)) { tlCfg.known = false; page.querySelector(".tl-top").innerHTML = tlFilterHtml(); }
    lanes.innerHTML = tlLanesHtml();
    const r1 = lanes.querySelector(`.tl-row[data-t="${id}"]`);
    if (r1) {
      if (top0 !== null && !open) { // bez płynnego przewijania (html ma scroll-behavior: smooth) – korekta ma być niewidoczna
        const st = document.documentElement.style;
        st.scrollBehavior = "auto"; window.scrollBy(0, r1.getBoundingClientRect().top - top0); st.scrollBehavior = "";
      }
      else r1.scrollIntoView({ block: "start" });
      r1.focus({ preventScroll: true });
    }
    url();
  };
  lanes.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cmp]");
    if (c) {
      const id = c.dataset.cmp, pair = tlPairs().find((x) => x.includes(id));
      [tlCfg.a, tlCfg.b] = pair ? (pair[0] === id ? pair : [pair[1], pair[0]]) : [id, tlIds().find((x) => x !== id)];
      showCmp(); $("#tlCmp").scrollIntoView({ block: "start" });
      return;
    }
    const r = e.target.closest(".tl-row"); if (r) toggle(r.dataset.t);
  });
  lanes.addEventListener("keydown", (e) => { // strzałki góra/dół, Home, End – między wierszami czasów
    const r = e.target.closest(".tl-row"); if (!r || !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const all = [...lanes.querySelectorAll(".tl-row")], i = all.indexOf(r);
    const j = e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : Math.min(all.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)));
    e.preventDefault(); all[j].focus();
  });
  page.querySelector(".tl-top").addEventListener("click", (e) => {
    const b = e.target.closest("[data-known]"); if (!b) return;
    tlCfg.known = b.dataset.known === "1";
    if (tlCfg.known && tlCfg.sel && !tlKnown(tlCfg.sel)) { tlCfg.sel = null; url(); }
    page.querySelector(".tl-top").innerHTML = tlFilterHtml();
    lanes.innerHTML = tlLanesHtml();
    const nb = page.querySelector(`.tl-top [data-known="${b.dataset.known}"]`); if (nb) nb.focus();
  });
  const showCmp = () => { cmp.innerHTML = tlCmpHtml(); };
  cmp.addEventListener("change", (e) => {
    if (e.target.id !== "tlA" && e.target.id !== "tlB") return;
    tlCfg[e.target.id === "tlA" ? "a" : "b"] = e.target.value;
    const id = e.target.id; showCmp(); $("#" + id).focus();
  });
  cmp.addEventListener("click", (e) => {
    const pb = e.target.closest("[data-pair]");
    if (pb) { [tlCfg.a, tlCfg.b] = pb.dataset.pair.split("/"); showCmp(); const c = cmp.querySelector(`[data-pair="${pb.dataset.pair}"]`); if (c) c.focus(); return; }
    if (e.target.closest("#tlSwap")) { [tlCfg.a, tlCfg.b] = [tlCfg.b, tlCfg.a]; showCmp(); $("#tlSwap").focus(); return; }
    const t = e.target.closest("a[data-t]");
    if (t) { e.preventDefault(); toggle(t.dataset.t, true); }
  });
}
