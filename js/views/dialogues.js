// Widoki #/dialogi i #/dialogi/<id> – dialogi do słuchania (dwa głosy) z pytaniami.
import { esc } from "../util.js";
import { icon } from "../icons.js";
import { $, SITE_TITLE, badge, speakBtn, plural, closestEl } from "../ui.js";
import { lessonNo, DIALOGUES, DLG_BY_ID } from "../data.js";
import { state } from "../state.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { SLOWER, voice, voiceGender, secondVoice, ttsWarnHtml, syncTtsWarn, seqStop, speakSeq, seqIs } from "../speech.js";
import { unitListHtml, scrollToRead } from "../units.js";

// ---------- Dialogi (#/dialogi) ----------
// Scenka czytana dwoma głosami: A = wybrany głos (ustawienia głosu), B = secondVoice(); przy jednym głosie angielskim
// w urządzeniu obie osoby czyta ten sam głos, a B inną wysokością (pitch). Tekst i tłumaczenie domyślnie ukryte –
// najpierw słuchamy i odpowiadamy na pytania; po sprawdzeniu wszystkich pytań tekst odsłania się sam.
/** @param {Dialogue} d */
const dlgKey = (d) => "dlg:" + d.id;
/** @param {Dialogue} d */
export const dlgOpen = (d) => !!state.done[d.after];
/** @param {Dialogue} d */
const dlgMeta = (d) => `${d.lines.length} ${plural(d.lines.length, "kwestia", "kwestie", "kwestii")} · ${d.questions.length} ${plural(d.questions.length, "pytanie", "pytania", "pytań")}`;
/** @param {Dialogue} d @param {string} w osoba (A / B) */
const dlgName = (d, w) => (d.people[w] && d.people[w].name) || (w === "A" ? "Osoba A" : "Osoba B");
// Głosy osób A i B. Gdy płeć osoby (people.X.g) i płeć głosów (z nazwy) są znane, a główny głos pasuje do B,
// a drugi do A – zamieniamy je. Jeden głos: ten sam dla obu, B wyżej (kobieta po mężczyźnie) albo niżej.
/**
 * @param {Dialogue} d
 * @returns {{ A: SpeechSynthesisVoice | null, B: SpeechSynthesisVoice | null, pitchA: number, pitchB: number, one?: boolean }}
 */
export function dlgVoices(d) {
  const gA = d.people.A && d.people.A.g, gB = d.people.B && d.people.B.g;
  const a = voice, b = secondVoice(a);
  if (!a || !b) return { A: a, B: a, pitchA: 1, pitchB: gB === "f" && gA !== "f" ? 1.3 : 0.75, one: true };
  const ga = voiceGender(a), gb = voiceGender(b);
  const swap = gA && gB && gA !== gB && ga === gB && gb === gA;
  return swap ? { A: b, B: a, pitchA: 1, pitchB: 1 } : { A: a, B: b, pitchA: 1, pitchB: 1 };
}
/** @returns {View} */
export const dialoguesHomeView = () => ({ html: renderDialoguesHome(), title: `Dialogi – ${SITE_TITLE}` });
/** @param {string} id @returns {View} */
export const dialogueView = (id) => ({ html: renderDialogue(id), title: DLG_BY_ID[id] ? `${DLG_BY_ID[id].title} – Dialogi` : `Dialogi – ${SITE_TITLE}`, mount: () => { bindDialogue(id); } });
function renderDialoguesHome() {
  const head = `<div class="hero"><h1>${icon("chat")} Dialogi</h1><p>Krótkie scenki z życia – kawiarnia, ulica, lekarz, hotel, rozmowa o pracę, reklamacja – czytane przez dwie osoby. Najpierw posłuchaj i odpowiedz na pytania, potem sprawdź się z tekstem i tłumaczeniem.</p></div>`;
  if (!DIALOGUES.length) return `<div class="page">${head}<div class="card empty m-empty"><b>Na razie nie ma dialogów.</b></div></div>`;
  const open = DIALOGUES.filter(dlgOpen).length;
  return `<div class="page dialogues-home">${head}
      <div class="card m-today rd-info"><div><b>Odblokowane: ${open} z ${DIALOGUES.length}</b><span>Dialog otwiera się po lekcji, która wprowadza ostatnią potrzebną konstrukcję – scenka ma tylko gramatykę i słówka, które już znasz (nieliczne nowe zwroty są w słowniczku nad dialogiem). Zablokowany też możesz otworzyć, ale może być trudny.</span></div></div>
      ${unitListHtml(DIALOGUES, { base: "#/dialogi", key: dlgKey, meta: dlgMeta })}</div>`;
}
// Pasek zastępczy w miejscu ukrytego tekstu – długość mniej więcej jak kwestia.
/** @param {string} en */
const dlgBar = (en) => `<span class="dl-bar" aria-hidden="true" style="width:${Math.min(24, 3 + en.length * 0.22).toFixed(1)}em"></span>`;
/** @param {string} id */
function renderDialogue(id) {
  const d = DLG_BY_ID[id];
  if (!d) return `<div class="page empty"><h1>Nie ma takiego dialogu</h1><p><a href="#/dialogi">← Wszystkie dialogi</a></p></div>`;
  const i = DIALOGUES.indexOf(d), next = DIALOGUES[i + 1], l = d.lesson;
  const tts = "speechSynthesis" in window;
  const gl = Object.entries(d.glossary);
  /** @param {string} w */
  const who = (w) => `<span class="dl-person dl-${w}"><span class="dl-dot" aria-hidden="true"></span>${esc(dlgName(d, w))}</span>`;
  return `<div class="page dialogue" data-id="${d.id}">
      <p class="rd-back"><a href="#/dialogi">← Wszystkie dialogi</a></p>
      <header class="rd-head">
        <div class="rd-tags">${badge(d.level)}${d.topic ? `<span class="unit-topic">${esc(d.topic)}</span>` : ""}<span class="muted">${dlgMeta(d)}</span></div>
        <h1 lang="en">${esc(d.title)}</h1>
        <p class="rd-pl">${esc(d.titlePl)}</p>
      </header>
      ${dlgOpen(d) ? "" : `<div class="callout warning"><h3>${icon("lock")} Ten dialog jest po lekcji ${lessonNo(l)}</h3><div class="prose"><p>Scenka używa konstrukcji z lekcji <a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a>, której jeszcze nie masz przerobionej. Możesz jej posłuchać już teraz, ale mogą być w niej rzeczy, których jeszcze nie znasz.</p></div></div>`}
      <div class="card dl-scene"><p><b>Sytuacja:</b> ${esc(d.setting)}</p><p class="dl-people">Mówią: ${who("A")} ${who("B")}</p></div>
      ${gl.length ? `<div class="card dl-gloss"><h3>Nowe słowa i zwroty</h3><p class="muted">Przejrzyj je przed słuchaniem – nie ma ich jeszcze w słówkach lekcji.</p><ul>${gl.map(([en, pl]) => `<li><b lang="en">${esc(en)}</b>${speakBtn(en)} – ${esc(pl)}</li>`).join("")}</ul></div>` : ""}
      ${tts ? `<div class="tts-warn">${ttsWarnHtml()}</div>` : `<div class="callout warning"><h3>${icon("alert")} Brak lektora</h3><div class="prose">Twoja przeglądarka nie potrafi czytać tekstu na głos, więc tekst dialogu jest od razu widoczny. Żeby ćwiczyć słuchanie, otwórz stronę w Chrome, Edge albo Safari.</div></div>`}
      <div class="dl-tools">
        ${tts ? `<button type="button" class="btn primary dl-all" aria-pressed="false">${icon("play")} <span>Odtwórz całość</span></button>
        <button type="button" class="btn dl-slow" aria-pressed="false">${icon("slow")} <span>Wolniej</span></button>` : ""}
        <button type="button" class="btn dl-text" aria-pressed="${tts ? "false" : "true"}">${icon("type")} <span>${tts ? "Pokaż tekst" : "Ukryj tekst"}</span></button>
        <button type="button" class="btn dl-tr" aria-pressed="false">${icon("book")} <span>Pokaż tłumaczenie</span></button>
        ${tts ? `<a href="#" class="rd-voice" data-voice-open>${icon("voice")} Ustawienia głosu</a>` : ""}
      </div>
      <p class="dl-status muted" role="status">${tts ? `${icon("headphones")} Posłuchaj całej rozmowy (możesz kilka razy), potem odpowiedz na pytania. Tekst możesz odsłonić w każdej chwili.` : ""}</p>
      <ol class="dl-lines${tts ? "" : " show-en"}" aria-label="Kwestie dialogu">${d.lines.map((x, k) => `<li class="dl-line dl-${x.who}" data-i="${k}">
        ${tts ? `<button type="button" class="speak dl-say" aria-label="Odtwórz kwestię ${k + 1} – ${esc(dlgName(d, x.who))}" title="Odtwórz tę kwestię">${icon("play")}</button>` : ""}
        <div class="dl-bubble"><span class="dl-who">${esc(dlgName(d, x.who))}</span>
          <span class="dl-en" lang="en">${esc(x.en)}</span>${dlgBar(x.en)}<span class="sr-only dl-sr">(tekst ukryty)</span>
          <span class="dl-pl">${esc(x.pl)}</span></div></li>`).join("")}</ol>
      ${exercisesShell("Pytania do dialogu", { id: "dlQ", intro: "Odpowiedz na pytania – jeśli trzeba, posłuchaj jeszcze raz całości albo pojedynczych kwestii. Złe odpowiedzi trafią do „Moich błędów”." })}
      <div class="rd-next">${next ? `<a class="btn" href="#/dialogi/${next.id}">Następny dialog: <span lang="en">${esc(next.title)}</span> →</a>` : `<a class="btn" href="#/dialogi">Wszystkie dialogi →</a>`}</div>
    </div>`;
}
/** @param {string} id */
function bindDialogue(id) {
  const page = $(".page.dialogue"), d = DLG_BY_ID[id];
  if (!page || !d) return;
  const list = $(".dl-lines", page), lines = [.../** @type {NodeListOf<HTMLElement>} */ (list.querySelectorAll(".dl-line"))];
  const allBtn = /** @type {HTMLElement | null} */ (page.querySelector(".dl-all")), slowBtn = $(".dl-slow", page); // bez syntezy mowy – bez przycisków odtwarzania
  const textBtn = $(".dl-text", page), trBtn = $(".dl-tr", page), status = $(".dl-status", page);
  /** @param {HTMLElement} btn @param {boolean} on @param {string} onLabel @param {string} offLabel */
  const setToggle = (btn, on, onLabel, offLabel) => { btn.setAttribute("aria-pressed", String(on)); $("span", btn).textContent = on ? onLabel : offLabel; };
  /** @param {boolean} on */
  const showText = (on) => { list.classList.toggle("show-en", on); setToggle(textBtn, on, "Ukryj tekst", "Pokaż tekst"); };
  /** @param {boolean} on */
  const showTr = (on) => { list.classList.toggle("show-pl", on); setToggle(trBtn, on, "Ukryj tłumaczenie", "Pokaż tłumaczenie"); };
  textBtn.addEventListener("click", () => showText(!list.classList.contains("show-en")));
  trBtn.addEventListener("click", () => showTr(!list.classList.contains("show-pl")));
  const box = $("#dlQ");
  const run = () => renderExercises(box, d.questions.map((ex) => ({ ex, lesson: d.lesson })), {
    key: dlgKey(d),
    onDone: () => { if (!list.classList.contains("show-en")) { showText(true); status.innerHTML = `${icon("check")} Pytania sprawdzone – tekst jest już widoczny. Posłuchaj jeszcze raz i czytaj razem z nagraniem.`; } },
  });
  run();
  $(".retry", box).addEventListener("click", () => { run(); box.scrollIntoView(); });
  if (!allBtn) return;
  const all = allBtn;
  // Odtwarzanie: całość (od pierwszej kwestii) albo jedna kwestia; „Wolniej” działa od następnej kwestii.
  /** @type {import("../speech.js").SeqHandle | null} */
  let me = null;
  let heard = false;
  const clear = () => lines.forEach((li) => { li.classList.remove("dl-on"); li.removeAttribute("aria-current"); });
  const allLabel = () => `${icon("play")} <span>${heard ? "Odtwórz jeszcze raz" : "Odtwórz całość"}</span>`;
  /** @param {number} from @param {number} to */
  const play = (from, to) => {
    const vs = dlgVoices(d), whole = from === 0 && to === d.lines.length;
    if (whole) { all.setAttribute("aria-pressed", "true"); all.innerHTML = `${icon("stop")} <span>Zatrzymaj</span>`; }
    /** @param {number} k */
    const btnOf = (k) => $(".dl-say", lines[k]);
    me = speakSeq(d.lines.slice(from, to).map((x) => ({ text: x.en, voice: x.who === "A" || x.who === "B" ? vs[x.who] : undefined, pitch: x.who === "A" ? vs.pitchA : vs.pitchB })), {
      slower: () => (slowBtn.getAttribute("aria-pressed") === "true" ? SLOWER : 1),
      onStep: (k) => {
        clear();
        lines.forEach((li) => $(".dl-say", li).classList.remove("playing"));
        const li = lines[from + k];
        li.classList.add("dl-on"); li.setAttribute("aria-current", "true");
        btnOf(from + k).classList.add("playing");
        if (whole) scrollToRead(li);
      },
      onEnd: (completed) => {
        clear();
        lines.forEach((li) => $(".dl-say", li).classList.remove("playing"));
        if (whole && completed && !heard) {
          heard = true;
          if (!list.classList.contains("show-en")) status.innerHTML = `${icon("check")} Wysłuchane! Teraz odpowiedz na pytania pod dialogiem. Tekst możesz odsłonić przyciskiem „Pokaż tekst”.`;
        }
        all.setAttribute("aria-pressed", "false"); all.innerHTML = allLabel();
      },
      onFail: (err) => syncTtsWarn(err),
    });
  };
  all.addEventListener("click", () => { if (seqIs(me) && all.getAttribute("aria-pressed") === "true") seqStop(); else play(0, d.lines.length); });
  slowBtn.addEventListener("click", () => setToggle(slowBtn, slowBtn.getAttribute("aria-pressed") !== "true", "Wolniej", "Wolniej"));
  list.addEventListener("click", (e) => {
    const b = closestEl(e, ".dl-say");
    if (!b) return;
    const k = +(/** @type {HTMLElement} */ (b.closest(".dl-line")).dataset.i || 0);
    if (seqIs(me) && b.classList.contains("playing") && all.getAttribute("aria-pressed") !== "true") { seqStop(); return; } // drugi klik – stop
    play(k, k + 1);
  });
}
