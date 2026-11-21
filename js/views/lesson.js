// Widok #/lesson/<id>[/zakładka] – lekcja: teoria ze spisem treści, słownictwo, ćwiczenia, „Znajdź błąd”,
// dyktando, wymowa, test.
import { esc, stripTags } from "../util.js";
import { icon } from "../icons.js";
import { doneTick, LEVEL_INFO, $, SITE_TITLE, slug, badge, shuffle, scorePill, speakBtn, currentLessonId } from "../ui.js";
import { PATH, BY_ID, CP_AFTER, practiceCount, withTask } from "../data.js";
import { state, save } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { voiceLink, SR, PR_UNSUPPORTED, prStop } from "../speech.js";
import { syncNavState } from "../nav.js";
import { renderSection } from "../sections.js";
import { vocabBlockHtml, bindVocabBlock } from "../vocab-view.js";
import { FE_MIN, FE_ROUND, fePairs, feRound, feIntro, renderLessonFind, DICT_ROUND, dictIntro, renderLessonDictation } from "../drills.js";
import { tlLessonLink } from "./timeline.js";

// ---------- Lekcja ----------
function syncDoneBtn(btn, id) {
  const d = !!state.done[id];
  btn.classList.toggle("done", d);
  btn.innerHTML = d ? icon("check") + " Przerobione" : "Oznacz jako przerobione";
}
const TABS = [
  { id: "", label: icon("book-open") + " Lekcja" },
  { id: "vocab", label: icon("type") + " Słownictwo", count: (l) => (l.vocab && l.vocab.items || []).length },
  { id: "practice", label: icon("pen") + " Ćwiczenia", count: (l) => (l.exercises || []).length + practiceCount(l) },
  { id: "find", label: icon("search") + " Znajdź błąd", count: (l) => (l.finds.length >= FE_MIN ? l.finds.length : 0) },
  { id: "test", label: icon("test") + " Test", count: (l) => l.test.length },
  { id: "dictation", label: icon("headphones") + " Dyktando", count: (l) => l.dict.length },
  { id: "speaking", label: icon("mic") + " Wymowa", count: (l) => l.dict.length },
];
function lessonTab() { const m = location.hash.match(/^#\/lesson\/[\w-]+\/(\w+)/); return m ? m[1] : ""; }
export const lessonView = () => {
  const id = currentLessonId();
  return { html: renderLesson(id), title: BY_ID[id] ? `${BY_ID[id].title} – ${SITE_TITLE}` : SITE_TITLE, mount: () => bindLesson(id) };
};
function renderLesson(id) {
  const l = BY_ID[id];
  if (!l) return `<div class="page empty"><h1>Nie znaleziono lekcji</h1><p><a href="#/">Wróć na stronę główną</a></p></div>`;
  const tab = lessonTab();
  const pos = PATH.indexOf(l);
  const prev = PATH[pos - 1], next = PATH[pos + 1];
  const best = state.scores[id];
  const tabs = TABS.filter((t) => !t.count || t.count(l) > 0);
  let body = "";
  if (tab === "vocab" && l.vocab) body = renderLessonVocab(l);
  else if (tab === "practice") body = renderLessonPractice(l);
  else if (tab === "find" && l.finds.length >= FE_MIN) body = renderLessonFind(l);
  else if (tab === "test" && l.test.length) body = renderLessonTest(l);
  else if (tab === "dictation" && l.dict.length) body = renderLessonDictation(l);
  else if (tab === "speaking" && l.dict.length) body = renderLessonSpeaking(l);
  else body = renderLessonTheory(l);
  return `<article class="page lesson ${state.showPl ? "" : "hide-pl"}" id="lesson">
      <div class="lesson-head">
        <div class="crumbs" data-level="${l.level}">${badge(l.level)} <span>${esc(l.category)}</span> · <span>${LEVEL_INFO[l.level].name}</span>${best ? ` · <span>sprawdzian: ${best.correct}/${best.total}</span>` : ""}${state.scores[id + "::test"] ? ` · <span>test: ${state.scores[id + "::test"].correct}/${state.scores[id + "::test"].total}</span>` : ""}</div>
        <h1>${esc(l.title)}</h1>
        <div class="title-pl">${esc(l.titlePl)}</div>
        <p class="summary">${l.summary}</p>
        <nav class="tabs" role="tablist">${tabs.map((t) => `<a role="tab" class="tab ${t.id === tab || (!t.id && !tabs.some((x) => x.id === tab)) ? "active" : ""}" href="#/lesson/${id}${t.id ? "/" + t.id : ""}">${t.label}${t.count ? ` <span class="tab-n">${t.count(l)}</span>` : ""}</a>`).join("")}</nav>
      </div>
      ${body}
      <div class="pager">
        ${prev ? `<a class="card prev" href="#/lesson/${prev.id}"><small>← Poprzednia</small>${esc(prev.title)} ${badge(prev.level)}</a>` : "<span></span>"}
        ${CP_AFTER[id] ? `<a class="card next cp-next" href="#/sprawdzian/${CP_AFTER[id].id}"><small>Następny krok →</small>${icon("flag")} Sprawdzian ${CP_AFTER[id].n}: ${esc(CP_AFTER[id].title)}</a>`
        : next ? `<a class="card next" href="#/lesson/${next.id}"><small>Następna →</small>${badge(next.level)} ${esc(next.title)}</a>` : ""}
      </div>
    </article>`;
}
function renderLessonTheory(l) {
  const titled = l.sections.map((s, i) => ({ s, i })).filter(({ s }) => s.title || ["formula", "examples", "mistakes"].includes(s.type));
  const req = (l.requires || []).map((r) => BY_ID[r]).filter(Boolean);
  const v = l.vocab && l.vocab.items || [];
  const prep = req.length || v.length ? `<div class="card prep">
        <h3>${icon("briefcase")} Zanim zaczniesz</h3>
        ${req.length ? `<p><b>Powinieneś znać:</b> ${req.map((r) => `<a href="#/lesson/${r.id}">${doneTick(esc(r.title), state.done[r.id])}</a>`).join(", ")}</p>` : ""}
        ${v.length ? `<p><b>Słówka potrzebne w tej lekcji</b> (${v.length}): ${v.slice(0, 14).map((w) => `<span class="w-chip" title="${esc(stripTags(w.pl))}">${w.en}</span>`).join(" ")}${v.length > 14 ? " …" : ""}</p>
        <a class="btn small" href="#/lesson/${l.id}/vocab">${icon("type")} Przećwicz słówka →</a>` : ""}
      </div>` : "";
  const nPractice = practiceCount(l);
  const toc = titled.map(({ s, i }) => ({ id: `s-${i}-${slug(s.title || s.type)}`, label: stripTags(s.title || (s.type === "formula" ? "Budowa" : s.type === "examples" ? "Przykłady" : "Typowe błędy")) }));
  if ((l.exercises || []).length) toc.push({ id: "exercises", label: "Szybki sprawdzian" });
  return `
      <div class="toolbar">
        <label class="toggle"><input type="checkbox" id="plToggle" ${state.showPl ? "checked" : ""}> Pokaż tłumaczenia</label>
        <span class="spacer"></span>
        <a class="btn small" href="#exercises" data-scroll="exercises">${icon("pen")} Sprawdzian (${(l.exercises || []).length})</a>
        <button class="btn small" id="doneBtn"></button>
      </div>
      <div class="lesson-body">
      ${toc.length ? `<aside class="toc-col"><details class="toc"${TOC_WIDE.matches ? " open" : ""}>
        <summary>${icon("list")} Spis treści <span class="toc-n">${toc.length}</span></summary>
        <nav aria-label="Spis treści"><ol class="toc-list">${toc.map((t) => `<li><a href="#${t.id}" data-scroll="${t.id}">${t.label}</a></li>`).join("")}</ol></nav>
      </details></aside>` : ""}
      <div class="lesson-main">
      ${prep}
      ${tlLessonLink(l)}
      ${l.sections.map((s, i) => renderSection(s, i, l)).join("")}
      ${exercisesShell("Szybki sprawdzian", { id: "exercises" })}
      ${nPractice || l.test.length ? `<div class="card next-steps"><b>Co dalej?</b>
        ${nPractice ? `<a class="btn" href="#/lesson/${l.id}/practice">${icon("pen")} Więcej ćwiczeń (${nPractice})</a>` : ""}
        ${l.test.length ? `<a class="btn primary" href="#/lesson/${l.id}/test">${icon("test")} Test – pisanie zdań (${l.test.length})</a>` : ""}</div>` : ""}
      </div></div>`;
}

// ---------- Spis treści lekcji ----------
// Szeroki ekran: stała prawa kolumna (zawsze rozwinięta). Węższy: zwinięte <details>.
const TOC_WIDE = window.matchMedia("(min-width: 1280px)");
// Zwraca funkcję sprzątającą (nasłuch przewijania) – woła ją router przy zmianie strony.
function bindToc(art) {
  const toc = art.querySelector("details.toc"); if (!toc) return;
  toc.open = TOC_WIDE.matches;
  toc.querySelector("summary").addEventListener("click", (e) => { if (TOC_WIDE.matches) e.preventDefault(); });
  const col = toc.closest(".toc-col");
  const links = [...toc.querySelectorAll("a[data-scroll]")];
  const targets = links.map((a) => document.getElementById(a.dataset.scroll));
  let cur = -2;
  // Aktywna sekcja = ostatni nagłówek, który minął linię na 30% wysokości okna.
  const update = () => {
    const line = window.innerHeight * 0.3;
    let k = -1;
    targets.forEach((t, j) => { if (t && t.getBoundingClientRect().top < line) k = j; });
    if (k === cur) return;
    cur = k;
    links.forEach((a, j) => { a.classList.toggle("active", j === k); if (j === k) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
    const a = links[k];
    if (a && col.scrollHeight > col.clientHeight + 1 && (a.offsetTop < col.scrollTop || a.offsetTop + a.offsetHeight > col.scrollTop + col.clientHeight)) col.scrollTop = a.offsetTop - col.clientHeight / 2;
  };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
}
TOC_WIDE.addEventListener && TOC_WIDE.addEventListener("change", () => { const d = document.querySelector("details.toc"); if (d) d.open = TOC_WIDE.matches; });
// Linki spisu treści (data-scroll): płynne przewinięcie do sekcji.
document.addEventListener("click", (e) => {
  const sc = e.target.closest("[data-scroll]");
  if (!sc) return;
  e.preventDefault();
  const d = sc.closest("details.toc");
  if (d && !TOC_WIDE.matches) d.open = false; // na telefonie zwiń spis, potem przewiń
  const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: "smooth" });
}, true);
function renderLessonVocab(l) {
  return `<section class="block"><h2>Słownictwo do tej lekcji</h2>
      <p class="muted-p">${l.vocab.intro || "Te słowa pojawiają się w przykładach i ćwiczeniach. Naucz się ich przed lekcją – wtedy skupisz się na gramatyce, a nie na słowniku."}</p>
      ${vocabBlockHtml([{ items: l.vocab.items }], "lesson:" + l.id)}</section>`;
}
function renderLessonPractice(l) {
  const sets = [];
  if ((l.exercises || []).length) sets.push({ title: "Szybki sprawdzian", instruction: "Podstawowe pytania z lekcji (te same co pod teorią).", items: l.exercises, key: l.id });
  l.practice.forEach((p, i) => sets.push({ ...p, key: `${l.id}::p${i}` }));
  return `<section class="block">
      <h2>Ćwiczenia</h2>
      <p class="muted-p">Zestawy ułożone od łatwiejszych do trudniejszych. Każdy zestaw sprawdza się osobno – wynik zapisuje się automatycznie.</p>
      <div class="sets">${sets.map((s, i) => `
        <details class="card set" data-set="${i}" ${i === (sets.length > 1 ? 1 : 0) ? "open" : ""}>
          <summary><span class="set-title">${s.title}</span><span class="set-meta">${s.items.length} zad. ${scorePill(state.scores[s.key])}</span></summary>
          <div class="set-body">${s.instruction ? `<div class="set-instr">${s.instruction}</div>` : ""}<div class="set-ex"></div></div>
        </details>`).join("")}</div>
      ${l.test.length ? `<div class="card next-steps"><b>Gotowe?</b><a class="btn primary" href="#/lesson/${l.id}/test">${icon("test")} Przejdź do testu (${l.test.length})</a></div>` : ""}
    </section>`;
}
function renderLessonTest(l) {
  const s = state.scores[l.id + "::test"];
  const types = [...new Set(l.test.map((x) => x.type))];
  return `<section class="block">
      <h2>Test: ${esc(l.title)}</h2>
      <div class="card test-intro">
        <p><b>${l.test.length} zadań.</b> ${types.includes("write") ? "Większość to pisanie <b>całych zdań</b> – tłumaczenie z polskiego, przekształcanie, poprawianie błędów. " : ""}Odpowiedzi <b>nie są sprawdzane na bieżąco</b> – zobaczysz wynik i poprawki dopiero po kliknięciu „Zakończ i sprawdź”.</p>
        <p class="muted">Wielka litera i kropka na końcu nie mają znaczenia. Formy skrócone i pełne (<i>don't / do not</i>) są równoważne. Jeśli automat nie zna Twojej (poprawnej) wersji, możesz ją zaliczyć przyciskiem „Moja odpowiedź też jest poprawna”.</p>
        ${s ? `<p>Twój najlepszy wynik: ${scorePill(s)}</p>` : ""}
      </div>
      <div id="testBox">${exercisesShell("Pytania", { h3: true, retryLabel: "Rozwiąż jeszcze raz" })}</div>
    </section>`;
}

// ---------- Wymowa (zakładka lekcji) ----------
// Te same zdania co w dyktandzie (przykłady z teorii tej lekcji), za każdym razem DICT_ROUND losowych.
function prRoundHtml(l) {
  const xs = shuffle(l.dict).slice(0, DICT_ROUND);
  return `<p class="pr-score muted-p" aria-live="polite">Dobrze wymówione: 0 z ${xs.length}</p>
      <ol class="pr-list">${xs.map((x) => `<li class="card pr-card">
        <div class="pr-sent">${speakBtn(x.say)}<div><div class="pr-en">${esc(x.say)}</div>${x.pl ? `<div class="ex-pl" title="Kliknij, aby pokazać">${x.pl}</div>` : ""}</div></div>
        ${SR ? `<button class="btn pr-mic" data-pr="${esc(x.say)}" aria-pressed="false">${icon("mic")} <span class="pr-lbl">Powiedz</span></button>` : ""}
        <div class="pr-out" aria-live="polite"></div></li>`).join("")}</ol>`;
}
function renderLessonSpeaking(l) {
  const intro = SR
    ? `Kliknij <b>${icon("mic")} Powiedz</b> i przeczytaj zdanie na głos po angielsku. Strona rozpozna, co mówisz, i pokaże słowa: <span class="pr-ok">zielone</span> – rozpoznane, <span class="pr-bad">czerwone</span> – nie. Wzoru możesz najpierw posłuchać (${icon("volume")}). Mów spokojnie, w cichym miejscu; przeglądarka zapyta o zgodę na mikrofon. Rozpoznawanie mowy potrzebuje internetu i czasem się myli, więc wynik to tylko wskazówka – nie trafia do „Moich błędów”.${voiceLink("Akcent (brytyjski albo amerykański)")}`
    : `Tutaj możesz posłuchać zdań (${icon("volume")}) i powtarzać je na głos – sprawdzanie wymowy zadziała po otwarciu strony w Chrome albo Edge.`;
  return `<section class="block pr-box">
      <h2>${icon("mic")} Wymowa</h2>
      ${SR ? "" : `<div class="callout warning"><h3>${icon("alert")} Brak rozpoznawania mowy</h3><div class="prose">${PR_UNSUPPORTED}</div></div>`}
      <div class="ex-intro">${intro}</div>
      <p class="muted-p">Zdania z przykładów w tej lekcji (${l.dict.length}) – za każdym razem ${Math.min(DICT_ROUND, l.dict.length)} losowych.</p>
      <div id="prBox"></div>
      <div class="pr-new"><button class="btn" id="prNew">${icon("rotate")} Nowe zdania</button></div>
    </section>`;
}
function bindLesson(id) {
  const l = BY_ID[id]; if (!l) return;
  const tab = lessonTab();
  const art = $("#lesson");
  const stopToc = bindToc(art);
  bindLessonTab(l, id, tab, art);
  return stopToc;
}
function bindLessonTab(l, id, tab, art) {
  if (tab === "vocab" && l.vocab) {
    bindVocabBlock(art.querySelector(".vocab-block"), [{ items: l.vocab.items }], "lesson:" + l.id);
    return;
  }
  if (tab === "practice") {
    const sets = [];
    if ((l.exercises || []).length) sets.push({ items: l.exercises, key: l.id, quick: true });
    l.practice.forEach((p, i) => sets.push({ ...p, key: `${l.id}::p${i}` }));
    art.querySelectorAll("details.set").forEach((d) => {
      const s = sets[+d.dataset.set];
      const mount = () => {
        if (d.dataset.ready) return; d.dataset.ready = 1;
        const host = d.querySelector(".set-ex");
        host.innerHTML = exercisesShell("", { h3: true });
        const box = host.firstElementChild;
        const run = () => renderExercises(box, s.items.map((ex) => ({ ex: withTask(ex, ex.task || "") })), {
          key: s.key,
          onDone: (c, t) => {
            d.querySelector(".set-meta").innerHTML = `${s.items.length} zad. ${scorePill(state.scores[s.key])}`;
            if (s.quick && c / t >= 0.8) { state.done[id] = true; save(); syncNavState(); }
          },
        });
        run();
        box.querySelector(".retry").addEventListener("click", () => { run(); d.scrollIntoView({ behavior: "smooth" }); });
      };
      if (d.open) mount();
      d.addEventListener("toggle", () => { if (d.open) mount(); });
    });
    return;
  }
  if (tab === "speaking" && l.dict.length) {
    const box = $("#prBox"), run = () => { box.innerHTML = prRoundHtml(l); };
    run();
    $("#prNew").addEventListener("click", () => { prStop(); run(); box.scrollIntoView({ behavior: "smooth" }); });
    return;
  }
  if (tab === "dictation" && l.dict.length) {
    const box = $("#dictBox").firstElementChild;
    box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", dictIntro());
    const run = () => renderExercises(box, shuffle(l.dict).slice(0, DICT_ROUND).map((ex) => ({ ex })), { key: l.id + "::dict" });
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
    return;
  }
  if (tab === "find" && l.finds.length >= FE_MIN) {
    const box = $("#feBox").firstElementChild;
    box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", feIntro());
    const run = () => renderExercises(box, feRound(fePairs([l]), FE_ROUND).map(({ ex }) => ({ ex })), { key: l.id + "::err" });
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
    return;
  }
  if (tab === "test" && l.test.length) {
    const box = $("#testBox").firstElementChild;
    const run = () => renderExercises(box, l.test.map((ex) => ({ ex })), { key: l.id + "::test", mode: "deferred" });
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
    return;
  }
  $("#plToggle").addEventListener("change", (e) => { state.showPl = e.target.checked; save(); art.classList.toggle("hide-pl", !state.showPl); });
  const doneBtn = $("#doneBtn"); syncDoneBtn(doneBtn, id);
  doneBtn.addEventListener("click", () => { state.done[id] = !state.done[id]; if (!state.done[id]) delete state.done[id]; save(); syncDoneBtn(doneBtn, id); syncNavState(); });
  const box = $("#exercises");
  const run = () => renderExercises(box, (l.exercises || []).map((ex) => ({ ex, lesson: l })), {
    key: id,
    onDone: (c, t) => { if (c / t >= 0.8) { state.done[id] = true; save(); syncNavState(); syncDoneBtn(doneBtn, id); } },
  });
  run();
  box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
}
