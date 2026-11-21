// Widok #/odmiana – trener odmiany czasownika (tabela form i ćwiczenia; logika w conj.js).
import { esc } from "../util.js";
import { icon } from "../icons.js";
import { $, SITE_TITLE, shuffle, scorePill, speakBtn, closestEl } from "../ui.js";
/** @typedef {import("../conj.js").CjTense} CjTense */
/** @typedef {import("../conj.js").CjForms} CjForms */
import { BY_ID, lessonNo } from "../data.js";
import { state, reachIdx } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { cjTables, cjClean, CJ_VALID, cjForms, cjStative, CJ_TENSES, CJ_PERSONS, CJ_FORMS, cjBuild, cjVerbs, cjIntro, CJ_DRILL_ACT, CJ_DRILL_PUNCT, CJ_PERF_CONT, cjLockedIdx, cjTask } from "../conj.js";

// ---------- Odmiana czasownika (#/odmiana) ----------
// 10 zadań: czasy z przerobionych lekcji (wybrane w filtrze), czasowniki znane do bieżącej lekcji, różne czasowniki.
/** @param {CjTense[]} tenses @param {string[]} forms @param {number} n @returns {{ ex: Exercise, lesson: Lesson }[]} */
function cjDrillItems(tenses, forms, n) {
  const reach = reachIdx(), intro = cjIntro();
  const verbs = shuffle([...cjVerbs().keys()].filter((v) => /** @type {number} */ (intro.get(v)) <= reach && (CJ_DRILL_ACT.has(v) || CJ_DRILL_PUNCT.has(v))));
  /** @type {{ ex: Exercise, lesson: Lesson }[]} */
  const out = [];
  const used = new Set();
  for (let guard = 0; out.length < n && guard < n * 40 && verbs.length; guard++) {
    const t = tenses[Math.floor(Math.random() * tenses.length)];
    /** @param {string} x */
    const fits = (x) => !(t.cont && cjStative(cjForms(x))) && !(CJ_PERF_CONT.has(t.id) && CJ_DRILL_PUNCT.has(x));
    const v = verbs.find((x) => !used.has(x) && fits(x)) || verbs.find(fits);
    if (!v) continue;
    used.add(v);
    const p = ["I", "you", "he", "she", "we", "they"][Math.floor(Math.random() * 6)];
    const form = forms[Math.floor(Math.random() * forms.length)];
    const rec = cjTask(`odm~${encodeURIComponent(v)}~${t.id}~${p}~${form}`);
    if (rec) out.push({ ex: rec.ex, lesson: rec.lesson });
  }
  return out;
}
/** @type {{ verb: string, person: string, tenses: string[] | null, forms: string[] }} */
let cjCfg = { verb: "go", person: "he", tenses: null, forms: ["aff", "neg", "q"] };
const cjDone = () => CJ_TENSES.filter((t) => state.done[t.lesson]);
/** @param {CjForms} f */
function cjFormsLine(f) {
  /** @param {string} w */
  const ph = (w) => [w, f.rest].filter(Boolean).join(" ");
  const past = f.past.map(ph).join(" / "), pp = f.pp.map(ph).join(" / ") + (f.ppUS.length ? ` (AmE: ${f.ppUS.map(ph).join(" / ")})` : "");
  const il = BY_ID["irregular-verbs"];
  const kind = f.base === "be" ? "nieregularny (am / is / are, was / were)" : f.irr ? "nieregularny" : "regularny";
  return `<div class="cj-forms">
      <div class="cj-three"><span class="cj-f"><small>bezokolicznik</small><b>${esc(ph(f.base))}</b>${speakBtn(ph(f.base))}</span><span class="cj-f"><small>Past Simple (II)</small><b>${esc(past)}</b>${speakBtn(ph(f.past[0]))}</span><span class="cj-f"><small>Past Participle (III)</small><b>${esc(pp)}</b>${speakBtn(ph(f.pp[0]))}</span><span class="cj-f"><small>he / she / it</small><b>${esc(ph(f.s3))}</b>${speakBtn(ph(f.s3))}</span><span class="cj-f"><small>-ing</small><b>${esc(ph(f.ing))}</b>${speakBtn(ph(f.ing))}</span></div>
      <div class="cj-kind">Czasownik <b>${kind}</b>${il ? ` – <a href="#/lesson/${il.id}">${f.irr ? "lista czasowników nieregularnych" : "jak tworzyć formy -ed"}</a>` : ""}</div>
    </div>`;
}
/** @param {CjForms} f @param {string} p osoba */
function cjTableHtml(f, p) {
  const reach = reachIdx(), st = cjStative(f), stl = cjTables().stLesson;
  const rows = CJ_TENSES.map((t) => {
    const l = BY_ID[t.lesson], idx = cjLockedIdx(t), locked = idx > reach;
    const name = `<a class="cj-tense" href="#/lesson/${l.id}">${esc(t.name)}</a>${t.use ? `<span class="cj-use">${esc(t.use)}</span>` : ""}${locked ? `<span class="cj-lock">poznasz w lekcji ${idx + 1}. ${esc(l.title)}</span>` : ""}`;
    if (t.cont && st === "strict") return `<tr class="cj-row${locked ? " cj-locked" : ""}"><th scope="row">${name}</th><td class="cj-na" colspan="3" data-l="">${icon("alert")} <span><b>${esc(f.verb)}</b> to czasownik stanu – w czasach Continuous zwykle go nie używamy${stl ? ` (<a href="#/lesson/${stl.id}">czasowniki stanu</a>)` : ""}.</span></td></tr>`;
    const cells = Object.keys(CJ_FORMS).map((form) => {
      const b = cjBuild(f, t, p, form);
      return `<td data-l="${form === "aff" ? "+" : form === "neg" ? "−" : "?"}"><span class="cj-main">${esc(b.main)}</span>${speakBtn(b.main)}${b.alts.length ? `<span class="cj-alt">też: ${b.alts.map(esc).join(" · ")}</span>` : ""}</td>`;
    }).join("");
    return `<tr class="cj-row${locked ? " cj-locked" : ""}"><th scope="row">${name}</th>${cells}</tr>`;
  }).join("");
  return `<div class="card cj-table-card"><table class="cj-table"><thead><tr><th scope="col">Czas</th><th scope="col">Twierdzenie (+)</th><th scope="col">Przeczenie (−)</th><th scope="col">Pytanie (?)</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function cjResultHtml() {
  const V = cjVerbs(), v = cjClean(cjCfg.verb);
  if (!v) return `<div class="empty">Wpisz czasownik po angielsku, np. <b>go</b>, <b>work</b>, <b>get up</b>.</div>`;
  if (!CJ_VALID.test(v)) return `<div class="empty">Wpisz czasownik po angielsku – same litery, np. <b>go</b> albo <b>wake up</b>.</div>`;
  const f = cjForms(v), info = V.get(v), st = cjStative(f), notes = cjTables().notes.get(f.base), stl = cjTables().stLesson;
  const msgs = [];
  if (info) msgs.push(`<span class="cj-pl">${esc(info.pl)}</span>`);
  else msgs.push(`<span class="cj-warn">${icon("alert")} Tego czasownika nie ma w słówkach kursu – formy są utworzone według reguł${f.irr ? "" : ". Sprawdź w słowniku, czy nie jest nieregularny"}.</span>`);
  if (notes) msgs.push(`<span class="cj-note">${icon("bulb")} <b>${esc(f.base)}</b> ma kilka znaczeń: ${notes.map(esc).join("; ")}. Tabela pokazuje pierwsze.</span>`);
  if (st === "amb") msgs.push(`<span class="cj-note">${icon("bulb")} <b>${esc(f.verb)}</b> bywa czasownikiem stanu – w znaczeniu stanu (np. have = mieć, posiadać; see = widzieć) nie używamy form Continuous, w znaczeniu czynności (have lunch, see a doctor) – tak.${stl ? ` <a href="#/lesson/${stl.id}">Czasowniki stanu</a>` : ""}</span>`);
  return `<div class="cj-msgs">${msgs.join("")}</div>${cjFormsLine(f)}${cjTableHtml(f, cjCfg.person)}`;
}
/** @param {string} [arg] czasownik z adresu */
export const conjView = (arg) => ({ html: renderConj(arg), title: `Odmiana czasownika – ${SITE_TITLE}`, mount: () => { bindConj(); } });
/** @param {string} [arg] */
function renderConj(arg) {
  if (arg) cjCfg.verb = cjClean(decodeURIComponent(arg));
  const V = [...cjVerbs().values()].sort((a, b) => a.verb.localeCompare(b.verb));
  return `<div class="page conj">
      <div class="hero"><h1>${icon("layers")} Odmiana czasownika</h1><p>Wpisz czasownik i zobacz go we wszystkich czasach – w twierdzeniu, przeczeniu i pytaniu. Czasy, których jeszcze nie było na Twojej ścieżce, są wyszarzone. Niżej ćwiczenie „podaj formę”. Kiedy którego czasu używać – zobacz <a href="#/czasy">oś czasów</a>.</p></div>
      <div class="card cj-search">
        <label class="cj-field"><span>Czasownik</span><input id="cjVerb" type="text" list="cjList" value="${esc(cjCfg.verb)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="np. go, work, get up"></label>
        <datalist id="cjList">${V.map((x) => `<option value="${esc(x.verb)}">${esc(x.pl)}</option>`).join("")}</datalist>
        <div class="cj-persons"><span>Osoba</span><div class="chips" role="group" aria-label="Osoba">${CJ_PERSONS.map((p) => `<button class="chip ${cjCfg.person === p ? "active" : ""}" data-p="${p}" aria-pressed="${cjCfg.person === p}">${p}</button>`).join("")}</div></div>
      </div>
      <div id="cjOut">${cjResultHtml()}</div>
      <h2 class="section-title" id="cwiczenie">${icon("pen")} Ćwiczenie: podaj formę</h2>
      <div id="cjDrill">${cjDrillSetupHtml()}</div>
      <div id="cjBox"></div>
    </div>`;
}
function cjDrillSetupHtml() {
  const done = cjDone();
  if (!done.length) {
    const first = BY_ID[CJ_TENSES[0].lesson];
    return `<div class="card empty">Ćwiczenie obejmuje czasy z <b>przerobionych lekcji</b>. Zacznij od lekcji <a href="#/lesson/${first.id}">${lessonNo(first)}. ${esc(first.title)}</a> i oznacz ją jako przerobioną.</div>`;
  }
  if (!cjCfg.tenses || !cjCfg.tenses.every((id) => done.some((t) => t.id === id)) || !cjCfg.tenses.length) cjCfg.tenses = done.map((t) => t.id);
  const sel = cjCfg.tenses;
  return `<div class="card practice-setup cj-setup">
      <div><h3>Czasy <span style="text-transform:none;font-weight:400">(z przerobionych lekcji)</span></h3><div class="chips" data-f="tenses">${done.map((t) => `<button class="chip ${sel.includes(t.id) ? "active" : ""}" data-v="${t.id}" aria-pressed="${sel.includes(t.id)}">${esc(t.name)}</button>`).join("")}</div></div>
      <div><h3>Formy</h3><div class="chips" data-f="forms">${Object.entries(CJ_FORMS).map(([k, v]) => `<button class="chip ${cjCfg.forms.includes(k) ? "active" : ""}" data-v="${k}" aria-pressed="${cjCfg.forms.includes(k)}">${v}</button>`).join("")}</div></div>
      <div><button class="btn primary" id="cjStart">Losuj ${CJ_ROUND} zadań →</button> <span class="muted cj-best">${state.scores.odmiana ? "Najlepszy wynik: " + scorePill(state.scores.odmiana) : ""}</span></div>
    </div>`;
}
const CJ_ROUND = 10;
function bindConj() {
  const page = $(".page.conj"); if (!page) return;
  const inp = /** @type {HTMLInputElement} */ ($("#cjVerb")), out = $("#cjOut");
  const show = () => {
    out.innerHTML = cjResultHtml();
    const v = cjClean(cjCfg.verb);
    history.replaceState(null, "", location.pathname + location.search + (v && CJ_VALID.test(v) ? `#/odmiana/${encodeURIComponent(v)}` : "#/odmiana"));
  };
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  inp.addEventListener("input", () => { cjCfg.verb = inp.value; clearTimeout(timer); timer = setTimeout(show, cjVerbs().has(cjClean(inp.value)) ? 0 : 350); });
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(timer); cjCfg.verb = inp.value; show(); } });
  $(".cj-persons", page).addEventListener("click", (e) => {
    const b = closestEl(e, "[data-p]"); if (!b) return;
    cjCfg.person = String(b.dataset.p);
    page.querySelectorAll(".cj-persons .chip").forEach((c) => { const on = c === b; c.classList.toggle("active", on); c.setAttribute("aria-pressed", String(on)); });
    out.innerHTML = cjResultHtml();
  });
  const drill = $("#cjDrill");
  drill.addEventListener("click", (e) => {
    const b = closestEl(e, ".chips .chip");
    if (b) {
      const f = /** @type {"tenses" | "forms"} */ (/** @type {HTMLElement} */ (b.closest(".chips")).dataset.f), v = String(b.dataset.v), list = /** @type {string[]} */ (cjCfg[f]);
      if (list.includes(v) && list.length === 1) return; // przynajmniej jeden czas i jedna forma
      const next = cjCfg[f] = list.includes(v) ? list.filter((x) => x !== v) : list.concat(v);
      b.classList.toggle("active"); b.setAttribute("aria-pressed", String(next.includes(v)));
      return;
    }
    if (closestEl(e, "#cjStart")) start();
  });
  const box = $("#cjBox");
  const start = () => {
    const sel = cjCfg.tenses || [];
    const items = cjDrillItems(CJ_TENSES.filter((t) => sel.includes(t.id)), cjCfg.forms, CJ_ROUND);
    if (!items.length) { box.innerHTML = `<div class="empty">Brak czasowników do ćwiczenia – przerób kilka pierwszych lekcji.</div>`; return; }
    box.innerHTML = exercisesShell("Podaj formę", { retryLabel: "Nowe losowanie", intro: "Wpisz formę czasownika w podanym czasie. W pytaniu napisz całe pytanie, np. <i>Does she work</i>. Skróty (doesn't, she's) i pełne formy są poprawne." });
    renderExercises(/** @type {HTMLElement} */ (box.firstElementChild), items, { key: "odmiana", onDone: () => { const s = drill.querySelector(".cj-best"); if (s) s.innerHTML = "Najlepszy wynik: " + scorePill(state.scores.odmiana); } });
    $(".retry", box).addEventListener("click", () => { start(); box.scrollIntoView(); });
    box.scrollIntoView();
    const first = /** @type {HTMLElement | null} */ (box.querySelector(".gap-input")); if (first) first.focus({ preventScroll: true });
  };
}
