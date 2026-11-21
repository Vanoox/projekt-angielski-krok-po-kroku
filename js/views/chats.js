// Widoki #/rozmowy i #/rozmowy/<id> – rozmowy z wyborem odpowiedzi (klawisze 1–3).
import { esc } from "../util.js";
import { icon } from "../icons.js";
import { $, SITE_TITLE, badge, speakBtn, plural, closestEl } from "../ui.js";
import { lessonNo, CHATS, CHAT_BY_ID } from "../data.js";
import { state } from "../state.js";
import { saveScore, logActivity } from "../record.js";
import { voice, voiceGender, secondVoice, ttsWarnHtml, syncTtsWarn, speak, seqStop } from "../speech.js";
import { unitListHtml } from "../units.js";

// ---------- Rozmowy (#/rozmowy) ----------
// Rozgałęziony dialog jak w komunikatorze: rozmówca (lewa strona) mówi kwestię, uczeń wybiera jedną z 2–3 odpowiedzi
// (prawa strona). Zła odpowiedź bez next – krótka informacja i ponowny wybór; zła z next – rozmowa idzie gorszą ścieżką
// (np. po niegrzecznej odpowiedzi rozmówca jest chłodniejszy, a może się skończyć bez osiągnięcia celu – end: "fail").
// Każdy krok liczy się do dziennika (dobra odpowiedź za pierwszym razem = poprawne zadanie).
/** @param {Chat} c */
const chatKey = (c) => "chat:" + c.id;
/** @param {Chat} c */
const chatOpen = (c) => !!state.done[c.after];
/** @param {Chat} c */
const chatMeta = (c) => `ok. ${c.steps} ${plural(c.steps, "krok", "kroki", "kroków")} · rozmówca: ${esc(c.partner.name || "")}`;
let chAuto = true; // „Czytaj na głos” – kwestie rozmówcy czytane same (do przeładowania strony)
// Głosy: rozmówca – głos z ustawień, a gdy znamy płeć rozmówcy i pasuje do niej tylko drugi głos – drugi; „Ty” – ten
// drugi. Jeden głos w urządzeniu: ten sam dla obu, „Ty” niżej (pitch).
/**
 * @param {Chat} c
 * @returns {{ p: SpeechSynthesisVoice | null, me: SpeechSynthesisVoice | null, pitchP: number, pitchMe: number, one?: boolean }}
 */
export function chatVoices(c) {
  const a = voice, b = secondVoice(a), g = c.partner.g;
  if (!a || !b) return { p: a, me: a, pitchP: 1, pitchMe: 0.8, one: true };
  return g && voiceGender(a) !== g && voiceGender(b) === g ? { p: b, me: a, pitchP: 1, pitchMe: 1 } : { p: a, me: b, pitchP: 1, pitchMe: 1 };
}
/** @returns {View} */
export const chatsHomeView = () => ({ html: renderChatsHome(), title: `Rozmowy – ${SITE_TITLE}` });
/** @param {string} id @returns {View} */
export const chatView = (id) => ({ html: renderChat(id), title: CHAT_BY_ID[id] ? `${CHAT_BY_ID[id].title} – Rozmowy` : `Rozmowy – ${SITE_TITLE}`, mount: () => bindChat(id) });
function renderChatsHome() {
  const head = `<div class="hero"><h1>${icon("messages")} Rozmowy</h1><p>Ty decydujesz, co powiesz. Rozmówca odpowiada, a rozmowa toczy się dalej zależnie od twojego wyboru – jak w prawdziwym życiu. Zła odpowiedź? Dowiesz się, dlaczego, i spróbujesz jeszcze raz. Nieuprzejma? Rozmowa może pójść gorzej.</p></div>`;
  if (!CHATS.length) return `<div class="page">${head}<div class="card empty m-empty"><b>Na razie nie ma rozmów.</b></div></div>`;
  const open = CHATS.filter(chatOpen).length;
  return `<div class="page chats-home">${head}
      <div class="card m-today rd-info"><div><b>Odblokowane: ${open} z ${CHATS.length}</b><span>Rozmowa otwiera się po lekcji, która wprowadza ostatnią potrzebną konstrukcję – kwestie mają tylko gramatykę i słówka, które już znasz (nieliczne nowe zwroty są w słowniczku nad rozmową). Zablokowaną też możesz otworzyć, ale może być trudna.</span></div></div>
      ${unitListHtml(CHATS, { base: "#/rozmowy", key: chatKey, meta: chatMeta })}</div>`;
}
/** @param {string} id */
function renderChat(id) {
  const c = CHAT_BY_ID[id];
  if (!c) return `<div class="page empty"><h1>Nie ma takiej rozmowy</h1><p><a href="#/rozmowy">← Wszystkie rozmowy</a></p></div>`;
  const i = CHATS.indexOf(c), next = CHATS[i + 1], l = c.lesson;
  const tts = "speechSynthesis" in window, gl = Object.entries(c.glossary);
  return `<div class="page chat" data-id="${c.id}">
      <p class="rd-back"><a href="#/rozmowy">← Wszystkie rozmowy</a></p>
      <header class="rd-head">
        <div class="rd-tags">${badge(c.level)}${c.topic ? `<span class="unit-topic">${esc(c.topic)}</span>` : ""}<span class="muted">${chatMeta(c)}</span></div>
        <h1 lang="en">${esc(c.title)}</h1>
        <p class="rd-pl">${esc(c.titlePl)}</p>
      </header>
      ${chatOpen(c) ? "" : `<div class="callout warning"><h3>${icon("lock")} Ta rozmowa jest po lekcji ${lessonNo(l)}</h3><div class="prose"><p>Rozmowa używa konstrukcji z lekcji <a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a>, której jeszcze nie masz przerobionej. Możesz spróbować już teraz, ale mogą być w niej rzeczy, których jeszcze nie znasz.</p></div></div>`}
      <div class="card dl-scene ch-goal"><p><b>Sytuacja:</b> ${esc(c.setting)}</p><p class="ch-goal-line">${icon("flag")}<span><b>Twój cel:</b> ${esc(c.goal)}</span></p>
        <p class="dl-people">Rozmawiasz z: <span class="dl-person dl-A"><span class="dl-dot" aria-hidden="true"></span>${esc(c.partner.name || "Rozmówca")}</span></p></div>
      ${gl.length ? `<div class="card dl-gloss"><h3>Nowe słowa i zwroty</h3><p class="muted">Przejrzyj je przed rozmową – nie ma ich jeszcze w słówkach lekcji.</p><ul>${gl.map(([en, pl]) => `<li><b lang="en">${esc(en)}</b>${speakBtn(en)} – ${esc(pl)}</li>`).join("")}</ul></div>` : ""}
      ${tts ? `<div class="tts-warn">${ttsWarnHtml()}</div>` : ""}
      <div class="dl-tools ch-tools">
        ${tts ? `<button type="button" class="btn ch-auto" aria-pressed="${chAuto}">${icon("volume")} <span>Czytaj na głos</span></button>` : ""}
        <button type="button" class="btn ch-tr" aria-pressed="false">${icon("book")} <span>Pokaż tłumaczenie</span></button>
        <button type="button" class="btn ch-restart-top">${icon("rotate")} <span>Od początku</span></button>
        ${tts ? `<a href="#" class="rd-voice" data-voice-open>${icon("voice")} Ustawienia głosu</a>` : ""}
      </div>
      <ol class="dl-lines show-en ch-log" aria-label="Rozmowa" aria-live="polite"></ol>
      <section class="card ch-choices" aria-labelledby="chAsk">
        <h2 id="chAsk" class="ch-ask">Co odpowiesz?<span class="kbd-hint">klawisze <kbd>1</kbd>–<kbd>3</kbd></span></h2>
        <div class="ch-opts" role="group" aria-labelledby="chAsk"></div>
        <p class="ch-fb" role="status"></p>
      </section>
      <section class="ch-summary" aria-label="Podsumowanie rozmowy" hidden></section>
      <div class="rd-next">${next ? `<a class="btn" href="#/rozmowy/${next.id}">Następna rozmowa: <span lang="en">${esc(next.title)}</span> →</a>` : `<a class="btn" href="#/rozmowy">Wszystkie rozmowy →</a>`}</div>
    </div>`;
}
/** @param {string} id @returns {(() => void) | undefined} */
function bindChat(id) {
  const page = $(".page.chat"), c = CHAT_BY_ID[id];
  if (!page || !c) return;
  const log = $(".ch-log", page), choices = $(".ch-choices", page), optsEl = $(".ch-opts", page);
  const fb = $(".ch-fb", page), sum = $(".ch-summary", page);
  const autoBtn = /** @type {HTMLElement | null} */ (page.querySelector(".ch-auto")), trBtn = $(".ch-tr", page);
  const tts = "speechSynthesis" in window, me = "Ty", them = c.partner.name || "Rozmówca";
  /** @type {ChatOption[]} */
  let order = [];
  /** @type {string[]} */
  let path = [];
  /** @type {ChatNode | null} */
  let node = null;
  let steps = 0, good = 0, tried = 0, run = 0, busy = false;
  /** @type {{ text: string, me: boolean }[]} */
  const lines = []; // kwestie w dzienniku: { text, me } – indeks = data-k przycisku głośnika
  /** @param {string} text @param {boolean} mine @param {HTMLElement | null} [btn] */
  const say = (text, mine, btn) => {
    const v = chatVoices(c);
    speak(text, btn, 1, (err) => syncTtsWarn(err), mine ? v.me : v.p, mine ? v.pitchMe : v.pitchP);
  };
  const canAuto = () => tts && chAuto && (!navigator.userActivation || navigator.userActivation.hasBeenActive);
  /** @param {boolean} mine @param {string} en @param {string | undefined} pl @param {string} [cls] */
  const bubble = (mine, en, pl, cls) => {
    const k = lines.push({ text: en, me: mine }) - 1;
    const li = document.createElement("li");
    li.className = `dl-line ${mine ? "dl-B" : "dl-A"} ch-line${cls ? " " + cls : ""}`;
    li.innerHTML = `${tts ? `<button type="button" class="speak dl-say ch-say" data-k="${k}" aria-label="Posłuchaj: ${mine ? "twoja kwestia" : esc(them)}" title="Posłuchaj">${icon("volume")}</button>` : ""}
        <div class="dl-bubble"><span class="dl-who">${esc(mine ? me : them)}</span><span class="dl-en" lang="en">${esc(en)}</span>${pl ? `<span class="dl-pl">${esc(pl)}</span>` : ""}</div>`;
    log.appendChild(li);
    return li;
  };
  /** @param {string | undefined} text @param {string} [cls] */
  const note = (text, cls) => {
    const li = document.createElement("li");
    li.className = `ch-note ${cls || ""}`;
    li.innerHTML = `${icon("alert")}<span>${esc(text)}</span>`;
    log.appendChild(li);
  };
  /** @param {HTMLElement} el */
  const reveal = (el) => { const r = el.getBoundingClientRect(); if (r.bottom > innerHeight - 8 || r.top < 70) el.scrollIntoView({ block: r.height > innerHeight - 90 ? "start" : "end" }); };
  /** @param {string} nid @param {boolean} userAct */
  function show(nid, userAct) {
    const n = node = c.nodes[nid];
    path.push(nid);
    const li = bubble(false, n.say, n.pl);
    if (canAuto()) say(n.say, false, li.querySelector(".ch-say"));
    if (n.end) { finish(); if (userAct) reveal(sum); return; }
    // Kolejność odpowiedzi losowa (żeby dobra nie była zawsze pierwsza); klawisze 1–3 = kolejność na ekranie.
    order = (n.options || []).map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5).map((x) => x.o);
    tried = 0;
    fb.textContent = "";
    fb.className = "ch-fb";
    optsEl.innerHTML = order.map((o, i) => `<div class="ch-opt">
        ${tts ? `<button type="button" class="speak ch-hear" data-i="${i}" aria-label="Posłuchaj odpowiedzi ${i + 1}" title="Posłuchaj">${icon("volume")}</button>` : ""}
        <button type="button" class="ch-pick" data-i="${i}"><span class="ch-num" aria-hidden="true">${i + 1}</span><span class="ch-txt" lang="en">${esc(o.en)}</span></button></div>`).join("");
    choices.hidden = false;
    if (userAct) { $(".ch-pick", optsEl).focus({ preventScroll: true }); reveal(choices); }
  }
  /** @param {number} i pozycja odpowiedzi na ekranie */
  function choose(i) {
    const o = order[i], btn = /** @type {NodeListOf<HTMLButtonElement>} */ (optsEl.querySelectorAll(".ch-pick"))[i];
    if (!o || !btn || busy || btn.classList.contains("bad")) return;
    if (!tried) { steps++; if (o.ok) good++; logActivity({ t: 1, ok: o.ok ? 1 : 0 }); }
    tried++;
    if (!o.ok && !o.next) { // zła odpowiedź – informacja i ponowny wybór
      btn.classList.add("bad");
      btn.disabled = true;
      btn.insertAdjacentHTML("beforeend", `<span class="sr-only"> (zła odpowiedź)</span>`);
      fb.className = "ch-fb bad";
      fb.innerHTML = `${icon("x")}<span>${esc(o.feedback)} <b>Wybierz jeszcze raz.</b></span>`;
      const left = /** @type {HTMLElement | null} */ (optsEl.querySelector(".ch-pick:not(:disabled)"));
      if (left) left.focus({ preventScroll: true });
      return;
    }
    // Dalej: dobra odpowiedź albo gorsza ścieżka (feedback jako notka w rozmowie).
    choices.hidden = true;
    optsEl.innerHTML = "";
    fb.textContent = "";
    bubble(true, o.en, o.pl || "", o.ok ? (tried === 1 ? "ch-good" : "") : "ch-worse");
    if (!o.ok) note(o.feedback, "ch-note-bad");
    else if (o.feedback) note(o.feedback);
    busy = true;
    const me2 = run;
    setTimeout(() => { if (me2 !== run || !page.isConnected) return; busy = false; show(/** @type {string} */ (o.next), true); }, 600); // dobra odpowiedź ma zawsze next (validate.js)
  }
  function finish() {
    const end = /** @type {ChatNode} */ (node);
    choices.hidden = true;
    const ok = end.end === "ok";
    if (steps) saveScore(chatKey(c), good, steps);
    const best = state.scores[chatKey(c)];
    // Kwestie do zapamiętania: dobre odpowiedzi z każdego kroku, przez który przeszła rozmowa (bez powtórek).
    const seen = new Set();
    /** @type {ChatOption[]} */
    const keep = [];
    path.forEach((nid) => (c.nodes[nid].options || []).filter((o) => o.ok).forEach((o) => { if (!seen.has(o.en)) { seen.add(o.en); keep.push(o); } }));
    sum.innerHTML = `<div class="card ch-sum ${ok ? "is-ok" : "is-fail"}">
        <h2>${icon(ok ? "check" : "x")} ${ok ? "Cel osiągnięty!" : "Cel nieosiągnięty"}</h2>
        <p class="ch-sum-goal"><b>Cel:</b> ${esc(c.goal)}</p>
        ${end.note ? `<p>${esc(end.note)}</p>` : ""}
        <p class="ch-stat">Dobre wybory za pierwszym razem: <b>${good} z ${steps}</b>${best && (best.correct !== good || best.total !== steps) ? ` <span class="muted">· najlepszy wynik: ${best.correct}/${best.total}</span>` : ""}</p>
        <h3>Kwestie do zapamiętania</h3>
        <ul class="ch-keep">${keep.map((o) => `<li><span><b lang="en">${esc(o.en)}</b>${tts ? speakBtn(o.en) : ""}</span><span class="ch-keep-pl">${esc(o.pl)}</span></li>`).join("")}</ul>
        <div class="ch-again"><button type="button" class="btn primary ch-restart">${icon("rotate")} Zacznij od nowa</button>${!ok ? "" : good < steps ? `<span class="muted">Spróbuj jeszcze raz – tym razem bez pomyłek.</span>` : `<span class="muted">${icon("medal")} Bez jednej pomyłki!</span>`}</div>
      </div>`;
    sum.hidden = false;
    $(".ch-restart", sum).addEventListener("click", () => { start(); $(".ch-tools", page).scrollIntoView({ block: "start" }); });
  }
  function start() {
    run++;
    busy = false;
    seqStop();
    if (tts) speechSynthesis.cancel();
    log.innerHTML = "";
    lines.length = 0;
    path = []; steps = 0; good = 0;
    sum.hidden = true; sum.innerHTML = "";
    show(c.start, false);
  }
  log.addEventListener("click", (e) => {
    const b = closestEl(e, ".ch-say");
    if (b) { const x = lines[+(b.dataset.k || 0)]; if (x) say(x.text, x.me, b); }
  });
  optsEl.addEventListener("click", (e) => {
    const h = closestEl(e, ".ch-hear");
    if (h) { const o = order[+(h.dataset.i || 0)]; if (o) say(o.en, true, h); return; }
    const p = closestEl(e, ".ch-pick");
    if (p) choose(+(p.dataset.i || 0));
  });
  if (autoBtn) autoBtn.addEventListener("click", () => { chAuto = !chAuto; autoBtn.setAttribute("aria-pressed", String(chAuto)); if (!chAuto && tts) speechSynthesis.cancel(); });
  trBtn.addEventListener("click", () => {
    const on = !log.classList.contains("show-pl");
    log.classList.toggle("show-pl", on);
    trBtn.setAttribute("aria-pressed", String(on));
    $("span", trBtn).textContent = on ? "Ukryj tłumaczenie" : "Pokaż tłumaczenie";
  });
  $(".ch-restart-top", page).addEventListener("click", start);
  // Klawisze 1–3 wybierają odpowiedź (nie w polach tekstowych, nie przy otwartym okienku, bez Ctrl/Alt/Cmd).
  /** @param {KeyboardEvent} e */
  const onKey = (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || choices.hidden) return;
    if (/input|textarea|select/i.test(document.activeElement?.tagName || "") || document.querySelector("dialog[open]")) return;
    const n = /** @type {Dict<number>} */ ({ 1: 0, 2: 1, 3: 2 })[e.key];
    if (n == null || n >= order.length) return;
    e.preventDefault();
    choose(n);
  };
  document.addEventListener("keydown", onKey);
  start();
  return () => { document.removeEventListener("keydown", onKey); run++; if (tts) speechSynthesis.cancel(); }; // zmiana strony: stop klawiszy, odpowiedzi w drodze i czytanej kwestii
}
