// Lektor (synteza mowy, Web Speech API): wybór głosu, speak / speakSeq, okienko „Ustawienia głosu”;
// wymowa z mikrofonem (rozpoznawanie mowy) – przyciski mikrofonu w teorii i w zakładce „Wymowa”.
import { stripTags, esc } from "./util.js";
import { spellFold } from "./spelling.js";
import { normalize, lcs } from "./check.js";
import { store } from "./storage.js";
import { icon } from "./icons.js";
import { $ } from "./ui.js";
import { logActivity } from "./record.js";

// ---------- Lektor (synteza mowy, Web Speech API) i ustawienia głosu ----------
// eng-voice = { accent: "GB" | "US", voice: id wybranego głosu ("" = automatycznie), rate: tempo }.
// Zostaje na tym urządzeniu (KEEP_LOCAL) – głosy są inne w każdym systemie i przeglądarce. Zapisany głos, którego tu
// nie ma (np. po „Zastąp” kopią z innego urządzenia), zastępuje najlepszy głos wybranego akcentu – zapis zostaje.
const ACCENTS = { GB: { name: "brytyjski", lang: "en-GB" }, US: { name: "amerykański", lang: "en-US" } };
const RATE_CHOICES = [{ r: 0.7, name: "Bardzo wolno" }, { r: 0.8, name: "Wolno" }, { r: 0.92, name: "Normalnie" }, { r: 1.1, name: "Szybko" }];
export const RATE_DEFAULT = 0.92, SLOWER = 0.75; // „Wolniej” w dyktandzie = wybrane tempo × 0,75
function loadVoiceCfg() {
  const v = store.get("voice", null) || {};
  return {
    accent: ["GB", "US"].includes(v.accent) ? v.accent : "GB",
    voice: typeof v.voice === "string" ? v.voice : "",
    rate: RATE_CHOICES.some((c) => c.r === v.rate) ? v.rate : RATE_DEFAULT,
  };
}
export let voiceCfg = loadVoiceCfg(), voice = null;
export const reloadVoiceCfg = () => { voiceCfg = loadVoiceCfg(); pickVoice(); }; // po wczytaniu kopii postępu
const vLang = (v) => String(v.lang || "").replace("_", "-").toLowerCase();
const isEnVoice = (v) => /^en(-|$)/.test(vLang(v));
const voiceId = (v) => v.voiceURI || v.name;
const allVoices = () => ("speechSynthesis" in window ? speechSynthesis.getVoices() : []);
const accentVoices = (acc) => allVoices().filter((v) => vLang(v) === ACCENTS[acc].lang.toLowerCase());
// Głosy „naturalne” (Edge: Online (Natural), Chrome: Google, Apple: Premium/Enhanced) brzmią dużo lepiej niż zwykłe.
const voiceRank = (v) => (/natural|online|neural|google|premium|enhanced/i.test(v.name) ? 1 : 0);
const bestVoice = (vs) => vs.slice().sort((a, b) => voiceRank(b) - voiceRank(a))[0] || null; // przy remisie – kolejność systemu
function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const vs = accentVoices(voiceCfg.accent);
  voice = (voiceCfg.voice && vs.find((v) => voiceId(v) === voiceCfg.voice)) || bestVoice(vs)
    || bestVoice(accentVoices(voiceCfg.accent === "GB" ? "US" : "GB")) || bestVoice(allVoices().filter(isEnVoice)) || null;
}
// Płeć głosu – tylko z nazwy (Google UK English Female, Microsoft Ryan…); "" = nie wiadomo.
const V_FEMALE = new RegExp(`\\b(female|woman|${"libby sonia maisie hollie abbie bella olivia mia amy emma ava aria jenny michelle ana samantha karen moira tessa fiona serena kate susan hazel zira catherine natasha clara emily elizabeth nancy sara jane ashley cora monica joanna kendra kimberly salli ivy ruth danielle martha kathy victoria allison shelley sandy flo grandma ellie".replace(/ /g, "|")})\\b`, "i");
const V_MALE = new RegExp(`\\b(male|man|${"ryan thomas george alfie elliot ethan noah oliver guy davis tony jason brian christopher eric roger steffan andrew brandon daniel arthur alex fred tom aaron rishi lee gordon reed rocko eddy grandpa james william mark david liam matthew justin joey kevin stephen ralph albert bruce junior".replace(/ /g, "|")})\\b`, "i");
export const voiceGender = (v) => { const n = String(v.name).split(" - ")[0]; return V_FEMALE.test(n) ? "f" : V_MALE.test(n) ? "m" : ""; };
// Drugi lektor (np. druga osoba w dialogu): inny głos angielski niż main – najpierw tego samego akcentu, potem o innej
// płci (gdy da się ją poznać po nazwie), potem „naturalny”. null = w urządzeniu jest tylko jeden głos angielski
// (wtedy obie osoby czyta ten sam głos – można je odróżnić np. wysokością: utterance.pitch).
export function secondVoice(main) {
  main = main || voice;
  if (!main) return null;
  const g = voiceGender(main);
  const score = (v) => (vLang(v) === vLang(main) ? 4 : 0) + (!g || !voiceGender(v) ? 1 : voiceGender(v) !== g ? 2 : 0) + voiceRank(v);
  return allVoices().filter((v) => isEnVoice(v) && voiceId(v) !== voiceId(main)).sort((a, b) => score(b) - score(a))[0] || null;
}
// Dyktando bez angielskiego głosu nie ma sensu – pokazujemy czytelny komunikat (aktualizowany, gdy przeglądarka doczyta głosy).
function ttsProblem(failed) {
  if (!("speechSynthesis" in window)) return "Twoja przeglądarka nie potrafi czytać tekstu na głos, więc dyktando nie zadziała. Otwórz stronę w Chrome, Edge albo Safari.";
  if ((speechSynthesis.getVoices().length && !voice) || failed) return "Nie udało się znaleźć angielskiego głosu w tym urządzeniu – zdania mogą nie być czytane albo brzmieć z polskim akcentem. Dodaj głos angielski w ustawieniach systemu (Android: Ustawienia → Zamiana tekstu na mowę, Windows: Ustawienia → Czas i język → Mowa, iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy) albo otwórz stronę w innej przeglądarce.";
  return "";
}
export const ttsWarnHtml = (failed) => { const p = ttsProblem(failed); return p ? `<div class="callout warning"><h3>${icon("alert")} Brak głosu angielskiego</h3><div class="prose">${p}</div></div>` : ""; };
export const syncTtsWarn = (failed) => document.querySelectorAll(".tts-warn").forEach((el) => { el.innerHTML = ttsWarnHtml(failed); });
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); syncTtsWarn(); syncVoiceDlg(); }; }
// slower – mnożnik tempa (dyktando „Wolniej”: SLOWER); withVoice – inny głos niż wybrany (np. secondVoice());
// pitch – wysokość głosu (dialogi przy jednym głosie w urządzeniu: druga osoba niżej / wyżej).
// Zwraca wypowiedź (SpeechSynthesisUtterance) – speakSeq dopina do niej „end”; lastUtter = ostatnia rozpoczęta.
let lastUtter = null;
export function speak(text, btn, slower, onFail, withVoice, pitch) {
  if (!("speechSynthesis" in window)) { alert("Twoja przeglądarka nie obsługuje odczytu na głos."); return; }
  speechSynthesis.cancel();
  document.querySelectorAll(".speak.playing, .d-btn.playing, .vd-try.playing").forEach((b) => b.classList.remove("playing"));
  const say = stripTags(text).replace(/\s*\/\s*/g, ". ").replace(/[→=]/g, ". ").replace(/(^|\s)[–—](\s|$)/g, ". ");
  const u = new SpeechSynthesisUtterance(say), v = withVoice || voice;
  u.lang = v ? v.lang : ACCENTS[voiceCfg.accent].lang;
  if (v) u.voice = v;
  u.rate = Math.max(0.5, voiceCfg.rate * (slower || 1));
  if (pitch) u.pitch = pitch;
  u.onend = () => { if (btn) btn.classList.remove("playing"); };
  u.onerror = (e) => { if (btn) btn.classList.remove("playing"); if (onFail && !/interrupted|canceled/.test(e.error || "")) onFail(e.error); };
  if (btn) btn.classList.add("playing");
  lastUtter = u;
  speechSynthesis.speak(u);
  return u;
}
// Czytanie kilku fragmentów po kolei (czytanki – zdania, dialogi – kwestie). items: [{ text, voice?, pitch? }];
// opts: { slower (liczba albo funkcja – sprawdzana przed każdym fragmentem), onStep(i) – zaczyna się i-ty fragment,
// onStep wywoływane tuż po rozpoczęciu fragmentu; onEnd(completed) – koniec (true = do ostatniego fragmentu; false = zatrzymane), onFail(err) – błąd syntezy }.
// Kończy się też po seqStop() (zmiana strony, „Zatrzymaj”), po nowym speakSeq i wtedy, gdy coś innego zacznie mówić
// (głośnik przy słowie) – także w przerwie między fragmentami. Naraz działa jedno czytanie (seq).
let seq = null;
export function seqStop(keepSpeech, completed) { // keepSpeech – mówi już coś innego, nie przerywamy tego
  if (!seq) return;
  const s = seq;
  seq = null;
  if (!keepSpeech && "speechSynthesis" in window) speechSynthesis.cancel();
  if (s.onEnd) s.onEnd(!!completed);
}
export function speakSeq(items, opts = {}) {
  seqStop();
  const me = { onEnd: opts.onEnd };
  seq = me;
  let i = 0, cur = null;
  const next = () => {
    if (seq !== me) return;
    if (cur && lastUtter !== cur) { seqStop(true); return; } // w przerwie zaczęło mówić coś innego
    if (i >= items.length) { seqStop(false, true); return; }
    const it = items[i];
    const slower = typeof opts.slower === "function" ? opts.slower() : opts.slower;
    const u = speak(it.text, null, slower || 1, (err) => { seqStop(); if (opts.onFail) opts.onFail(err); }, it.voice, it.pitch);
    if (!u) { seqStop(); return; }
    if (opts.onStep) opts.onStep(i); // po speak() – ono zdejmuje „playing” ze wszystkich głośników
    i++;
    cur = u;
    // Przerwanie przez inną wypowiedź: Chrome / Edge – „error” (interrupted), inne przeglądarki – „end”; sprawdzamy
    // po chwili, bo zdarzenie bywa wywołane jeszcze w trakcie speak() nowej wypowiedzi (zanim zmieni się lastUtter).
    u.addEventListener("end", () => setTimeout(() => { if (seq !== me) return; if (lastUtter === u) setTimeout(next, 250); else seqStop(true); }, 0));
    u.addEventListener("error", () => setTimeout(() => { if (seq === me && lastUtter !== u) seqStop(true); }, 0));
  };
  next();
  return me;
}
export const seqIs = (me) => !!me && seq === me;
// Przyciski „Posłuchaj” (.speak[data-say]) na wszystkich stronach – jeden nasłuch na dokumencie, w fazie przechwytywania.
document.addEventListener("click", (e) => {
  const sb = e.target.closest(".speak[data-say]"); // .speak.mic (mikrofon) ma własną obsługę – data-pr
  if (sb) { e.preventDefault(); e.stopPropagation(); speak(sb.dataset.say, sb); }
}, true);

// ---------- Okienko „Ustawienia głosu” (przycisk w górnym pasku, link w dyktandzie i wymowie) ----------
// Zmiany zapisują się od razu (bez przycisku „Zapisz”). Lista głosów = głosy wybranego akcentu z tego urządzenia.
const VOICE_SAMPLE = "Hello! Nice to meet you. How are you today?";
export const voiceLink = (what) => ("speechSynthesis" in window ? ` ${what} zmienisz w <button type="button" class="link-btn" data-voice-open>ustawieniach głosu</button>.` : "");
const voiceName = (v) => String(v.name).replace(/\s+-\s+English.*$/i, "").replace(/^Microsoft\s+/i, "").trim() || v.name;
const saveVoiceCfg = () => { store.set("voice", voiceCfg); pickVoice(); };
function voiceDlgHtml() {
  const acc = ACCENTS[voiceCfg.accent], vs = accentVoices(voiceCfg.accent), auto = bestVoice(vs);
  const cur = voiceCfg.voice && vs.some((v) => voiceId(v) === voiceCfg.voice) ? voiceCfg.voice : "";
  const row = (id, name, sub, v) => `<li class="${id === cur ? "on" : ""}">
        <label><input type="radio" name="vd-voice" value="${esc(id)}"${id === cur ? " checked" : ""}><span><span class="vd-name">${esc(name)}</span>${sub ? `<span class="vd-sub">${sub}</span>` : ""}</span></label>
        ${v ? `<button type="button" class="btn small vd-try" data-try="${esc(id)}" aria-label="Posłuchaj: ${esc(name)}">${icon("volume")}<span class="vd-try-t"> Posłuchaj</span></button>` : ""}
      </li>`;
  const online = (v) => v.localService === false ? "wymaga internetu" : "";
  let voices;
  if (!allVoices().length) voices = `<p class="muted">${ttsProblem() || "Wczytywanie listy głosów…"}</p>`;
  else if (!vs.length) voices = `<div class="callout warning vd-none"><div class="prose">W tym urządzeniu nie ma głosu z akcentem ${acc.name}m${voice ? ` – czytać będzie głos <b>${esc(voiceName(voice))}</b> (${esc(voice.lang)})` : ""}. Inne głosy można dodać w ustawieniach systemu (Windows: Ustawienia → Czas i język → Mowa, Android: Ustawienia → Zamiana tekstu na mowę) albo otworzyć stronę w innej przeglądarce.</div></div>`;
  else voices = `<ul class="vd-voices">${row("", "Automatycznie", auto ? `najlepszy dostępny: ${esc(voiceName(auto))}` : "", null)}${vs.map((v) => row(voiceId(v), voiceName(v), online(v), v)).join("")}</ul>`;
  return `<div class="vd-head"><h2 id="voiceDlgH">${icon("voice")} Ustawienia głosu</h2><button type="button" class="icon-btn vd-close" aria-label="Zamknij">${icon("x")}</button></div>
      <div class="vd-body">
        <section class="vd-sec"><h3>Akcent lektora</h3>
          <div class="chips">${Object.entries(ACCENTS).map(([k, a]) => `<button type="button" class="chip ${k === voiceCfg.accent ? "active" : ""}" data-accent="${k}" aria-pressed="${k === voiceCfg.accent}">${a.name[0].toUpperCase() + a.name.slice(1)}</button>`).join("")}</div>
          <p class="muted vd-note">Pisownia brytyjska i amerykańska (<i>colour / color, centre / center, realise / realize</i>) jest zawsze poprawna.${SR ? " Wymowa z mikrofonem rozpoznaje mowę z wybranym akcentem." : ""}</p>
        </section>
        <section class="vd-sec"><h3>Głos</h3>${voices}</section>
        <section class="vd-sec"><h3>Tempo</h3>
          <div class="chips">${RATE_CHOICES.map((c) => `<button type="button" class="chip ${c.r === voiceCfg.rate ? "active" : ""}" data-rate="${c.r}" aria-pressed="${c.r === voiceCfg.rate}">${c.name}</button>`).join("")}</div>
          <p class="muted vd-note">„Wolniej” w dyktandzie czyta jeszcze wolniej niż wybrane tempo.</p>
        </section>
        <div class="vd-foot"><button type="button" class="btn primary vd-sample">${icon("play")} Posłuchaj przykładu</button></div>
      </div>`;
}
// Przebudowa treści otwartego okienka z zachowaniem fokusu (np. po zmianie akcentu albo doczytaniu głosów).
function syncVoiceDlg() {
  const d = document.getElementById("voiceDlg");
  if (!d || !d.hasAttribute("open")) return;
  const a = document.activeElement, key = a && d.contains(a) ? ["data-accent", "data-rate", "data-try"].find((k) => a.hasAttribute(k)) : null;
  const sel = key ? `[${key}="${CSS.escape(a.getAttribute(key))}"]` : a && a.name === "vd-voice" ? `input[name="vd-voice"][value="${CSS.escape(a.value)}"]` : null;
  const top = (d.querySelector(".vd-body") || {}).scrollTop || 0;
  d.innerHTML = voiceDlgHtml();
  d.querySelector(".vd-body").scrollTop = top;
  const f = sel && d.querySelector(sel);
  if (f) f.focus(); else if (!d.contains(document.activeElement)) d.querySelector(".vd-close").focus(); // fokus nie ucieka z okienka
}
const closeVoiceDlg = (d) => { if (d.close) d.close(); else { d.removeAttribute("open"); speechSynthesis.cancel(); } };
function openVoiceDlg() {
  if (!("speechSynthesis" in window)) return;
  let d = document.getElementById("voiceDlg");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "voiceDlg"; d.className = "voice-dlg"; d.setAttribute("aria-labelledby", "voiceDlgH");
    document.body.appendChild(d);
    d.addEventListener("click", (e) => {
      if (e.target === d) { closeVoiceDlg(d); return; } // klik w tło poza okienkiem
      const t = e.target.closest("button");
      if (!t) return;
      if (t.classList.contains("vd-close")) closeVoiceDlg(d);
      else if (t.dataset.accent && t.dataset.accent !== voiceCfg.accent) { voiceCfg.accent = t.dataset.accent; voiceCfg.voice = ""; saveVoiceCfg(); syncVoiceDlg(); speak(VOICE_SAMPLE); }
      else if (t.dataset.rate) { voiceCfg.rate = +t.dataset.rate; saveVoiceCfg(); syncVoiceDlg(); speak(VOICE_SAMPLE); }
      else if (t.dataset.try) speak(VOICE_SAMPLE, t, 1, null, accentVoices(voiceCfg.accent).find((v) => voiceId(v) === t.dataset.try));
      else if (t.classList.contains("vd-sample")) speak(VOICE_SAMPLE, t);
    });
    d.addEventListener("change", (e) => {
      if (e.target.name !== "vd-voice") return;
      voiceCfg.voice = e.target.value; saveVoiceCfg(); syncVoiceDlg(); speak(VOICE_SAMPLE);
    });
    d.addEventListener("close", () => { speechSynthesis.cancel(); });
  }
  d.innerHTML = voiceDlgHtml();
  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  const on = d.querySelector(".chip.active[data-accent]"); if (on) on.focus();
}
// Ustawienia głosu: przycisk w pasku (bez syntezy mowy – ukryty) i linki [data-voice-open] w dyktandzie / wymowie.
if ("speechSynthesis" in window) $("#voiceBtn").addEventListener("click", openVoiceDlg); else $("#voiceBtn").hidden = true;
document.addEventListener("click", (e) => { if (e.target.closest("[data-voice-open]")) { e.preventDefault(); openVoiceDlg(); } });

// ---------- Wymowa z mikrofonem (rozpoznawanie mowy, Web Speech API) ----------
// Chrome/Edge (także Android) i Safari; Firefox nie ma SpeechRecognition – wtedy przycisków mikrofonu nie ma.
// Chrome rozpoznaje mowę na serwerze: potrzebny internet i strona z https (albo localhost) – z pliku (file://) nie działa.
// Wynik NIE trafia do „Moich błędów” ani do wyników lekcji: rozpoznawanie bywa zawodne (akcent, szum, homofony),
// więc to tylko podpowiedź dla ucznia. Do dziennika i celu dziennego liczy się pierwsza próba każdego zdania.
export const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const PR_SKIP = /[\/=→←[\]()…_;"“”„&<>+*#@]|\.\.|\s-\s/;
// Zdanie do czytania na głos (przykład z teorii): bez wariantów „A / B”, strzałek, nawiasów; 2–20 słów. Liczby wolno.
export function prText(html) {
  const t = String(html || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").replace(/^[–—]\s*/, "").trim();
  if (!t || PR_SKIP.test(t) || !/[a-z]/i.test(t)) return "";
  const n = t.split(" ").length;
  return n >= 2 && n <= 20 ? t : "";
}
const NUM1 = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const NUM10 = "  twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
function numWords(n) {
  if (n < 20) return NUM1[n];
  if (n < 100) return NUM10[Math.floor(n / 10)] + (n % 10 ? " " + NUM1[n % 10] : "");
  if (n < 1000) return NUM1[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + numWords(n % 100) : "");
  return String(n); // lata i duże liczby zostają cyframi (rozpoznawanie też zwykle zwraca je cyframi)
}
const ORD = { one: "first", two: "second", three: "third", five: "fifth", eight: "eighth", nine: "ninth", twelve: "twelfth" };
const ordWords = (n) => numWords(n).replace(/(\w+)$/, (w) => ORD[w] || (/y$/.test(w) ? w.slice(0, -1) + "ieth" : w + "th"));
// Słowa, które brzmią tak samo – rozpoznawanie wybiera jedno z nich, więc nie liczymy tego jako błędu wymowy.
const HOMO = {};
["to too two", "for four", "there their", "right write", "know no", "hear here", "by buy bye", "see sea", "one won",
  "eight ate", "son sun", "wear where", "weather whether", "new knew", "hour our", "meet meat", "week weak", "its it's"]
  .forEach((g) => { const w = g.split(" "); w.forEach((x) => { HOMO[x] = w[0]; }); });
// Pisownia brytyjska i amerykańska (colour/color, realise/realize, centre/center) – też bez znaczenia (spellFold,
// ta sama lista co przy sprawdzaniu odpowiedzi; rozpoznawanie en-US zwraca pisownię amerykańską).
const fold = (w) => { const s = spellFold(w); return HOMO[s] || s; };
const PR_S_IS = new Set(["he", "she", "it", "that", "there", "what", "who", "where", "how", "here", "this"]);
// Jedno słowo → tokeny do porównania: skróty = pełne formy (I'm = I am, can't = can not), liczby słownie (2 = two).
function prTokens(word) {
  const out = [];
  normalize(word).replace(/%/g, " percent").replace(/-/g, " ").split(" ").filter(Boolean).forEach((t) => {
    let m;
    if (t === "can't" || t === "cannot") out.push("can", "not");
    else if (t === "won't") out.push("will", "not");
    else if (t === "shan't") out.push("shall", "not");
    else if (t === "let's") out.push("let", "us");
    else if ((m = t.match(/^(\w+)n't$/))) out.push(m[1], "not");
    else if ((m = t.match(/^(\w+)'(m|re|ve|ll|d)$/))) out.push(m[1], { m: "am", re: "are", ve: "have", ll: "will", d: "would" }[m[2]]);
    else if ((m = t.match(/^(\w+)'s$/)) && PR_S_IS.has(m[1])) out.push(m[1], "is");
    else if ((m = t.match(/^(\d+)(st|nd|rd|th)$/))) out.push(...ordWords(+m[1]).split(" "));
    else if ((m = t.match(/^(\d+):(\d\d)$/))) out.push(...numWords(+m[1]).split(" "), ...(m[2] === "00" ? ["o'clock"] : +m[2] < 10 ? ["oh", NUM1[+m[2]]] : numWords(+m[2]).split(" ")));
    else if ((m = t.match(/^(\d+)([ap]m)$/))) out.push(...numWords(+m[1]).split(" "), m[2]);
    else if (/^\d+$/.test(t)) out.push(...numWords(+t).split(" "));
    else out.push(t);
  });
  return out.map(fold);
}
// Porównanie słowo po słowie (LCS jak w diffHtml). Spośród kilku wersji rozpoznania (maxAlternatives) bierzemy najbliższą.
function prCompare(target, alts) {
  const words = target.split(/\s+/), tw = [], tt = [];
  words.forEach((w, i) => prTokens(w).forEach((t) => { tt.push(t); tw.push(i); }));
  let best = null;
  for (const a of alts) {
    const at = String(a).split(/\s+/).flatMap(prTokens), r = lcs(tt, at);
    if (!best || r.n > best.r.n || (r.n === best.r.n && at.length < best.len)) best = { r, len: at.length, heard: a };
  }
  const okW = words.map((_, i) => tw.every((w, j) => w !== i || best.r.inA.has(j)));
  return { words, okW, good: okW.filter(Boolean).length, heard: best.heard };
}
function prError(code) {
  if (code === "not-allowed" || code === "service-not-allowed")
    return location.protocol === "file:" ? "Rozpoznawanie mowy nie działa w pliku otwartym z dysku. Otwórz stronę z internetu (adres https://…)."
      : "Brak zgody na użycie mikrofonu. Kliknij ikonę kłódki albo mikrofonu przy adresie strony, zezwól na mikrofon i spróbuj jeszcze raz.";
  if (code === "no-speech") return "Nic nie słychać. Kliknij mikrofon, chwilę poczekaj i przeczytaj zdanie wyraźnie, blisko mikrofonu.";
  if (code === "audio-capture") return "Nie znaleziono mikrofonu. Sprawdź, czy jest podłączony i włączony w ustawieniach systemu.";
  if (code === "network" || code === "offline") return "Brak połączenia z internetem. Chrome i Edge rozpoznają mowę na swoich serwerach, więc bez internetu ta funkcja nie działa.";
  if (code === "language-not-supported") return "Ta przeglądarka nie rozpoznaje mowy po angielsku. Spróbuj w Chrome albo Edge.";
  return `Nie udało się rozpoznać mowy (${esc(code)}). Spróbuj jeszcze raz.`;
}
export const PR_UNSUPPORTED = "Twoja przeglądarka nie rozpoznaje mowy (działa w Chrome i Edge).";
export const micBtn = (text) => SR ? `<button class="speak mic" data-pr="${esc(text)}" aria-pressed="false" title="Powiedz to zdanie – sprawdź wymowę" aria-label="Sprawdź wymowę">${icon("mic")}</button>` : "";
let prNow = null; // { rec, btn, aborted, done } – trwające słuchanie (naraz tylko jedno)
export const prStop = () => { if (prNow) { prNow.aborted = true; prNow.rec.abort(); } };
// Miejsce na wynik: w zakładce „Wymowa” – karta zdania, w teorii – panel pod przykładem (tworzony przy pierwszej próbie).
function prOut(btn) {
  const card = btn.closest(".pr-card");
  if (card) return card.querySelector(".pr-out");
  const ex = btn.closest(".ex");
  let o = ex.querySelector(".pr-out");
  if (!o) { ex.insertAdjacentHTML("beforeend", `<div class="pr-out" aria-live="polite"></div>`); o = ex.querySelector(".pr-out"); }
  return o;
}
function prSetListening(btn, on) {
  btn.classList.toggle("listening", on);
  btn.setAttribute("aria-pressed", on);
  const lbl = btn.querySelector(".pr-lbl");
  if (lbl) lbl.textContent = on ? "Słucham… (kliknij, by skończyć)" : "Powiedz";
  if (on) prOut(btn).innerHTML = `<div class="pr-msg pr-live">${icon("mic")} Mów teraz – przeczytaj zdanie na głos.</div>`;
}
function prResult(btn, text, alts) {
  const r = prCompare(text, alts), n = r.words.length, all = r.good === n;
  const verdict = all ? `${icon("check")} Świetnie! Rozpoznane wszystkie słowa.`
    : r.good / n >= 0.7 ? `Prawie dobrze – rozpoznane słowa: ${r.good} z ${n}. Czerwone powiedz jeszcze raz wyraźniej.`
    : `Rozpoznane słowa: ${r.good} z ${n}. Posłuchaj i spróbuj jeszcze raz.`;
  prOut(btn).innerHTML = `<div class="pr-res ${all ? "ok" : "bad"}">
      <div class="pr-words">${r.words.map((w, i) => `<span class="${r.okW[i] ? "pr-ok" : "pr-bad"}">${esc(w)}</span>`).join(" ")}</div>
      <div class="pr-verdict">${verdict}</div>
      <div class="pr-heard">Rozpoznano: „${esc(r.heard)}”</div>
      ${all ? "" : `<div class="pr-actions"><button class="btn pr-say" data-say="${esc(text)}">${icon("volume")} Posłuchaj</button><button class="btn" data-pr-again>${icon("rotate")} Spróbuj jeszcze raz</button></div>`}
    </div>`;
  const card = btn.closest(".pr-card, .ex");
  if (!card.dataset.prLogged) { card.dataset.prLogged = 1; logActivity({ t: 1, ok: all ? 1 : 0 }); }
  if (all) card.dataset.prOk = 1;
  const box = btn.closest(".pr-box");
  if (box) box.querySelector(".pr-score").textContent = `Dobrze wymówione: ${box.querySelectorAll(".pr-card[data-pr-ok]").length} z ${box.querySelectorAll(".pr-card").length}`;
}
function prMsg(btn, html) { prOut(btn).innerHTML = `<div class="pr-msg pr-err">${icon("alert")} <span>${html}</span></div>`; }
function prListen(btn) {
  if (prNow) {
    if (prNow.btn === btn) { prNow.rec.stop(); return; } // drugi klik = koniec mówienia, wynik przyjdzie w onresult
    prStop();
  }
  if (navigator.onLine === false) { prMsg(btn, prError("offline")); return; }
  if ("speechSynthesis" in window) speechSynthesis.cancel(); // żeby mikrofon nie słyszał lektora
  const text = btn.dataset.pr, rec = new SR(), cur = { rec, btn, aborted: false, done: false };
  rec.lang = ACCENTS[voiceCfg.accent].lang; rec.interimResults = false; rec.maxAlternatives = 3; rec.continuous = false;
  rec.onresult = (e) => {
    const res = e.results[e.results.length - 1]; if (!res || cur.aborted) return;
    cur.done = true;
    prResult(btn, text, Array.from(res, (a) => a.transcript).filter(Boolean));
  };
  rec.onerror = (e) => { if (cur.aborted || e.error === "aborted") return; cur.done = true; prMsg(btn, prError(e.error)); };
  rec.onend = () => {
    if (prNow === cur) prNow = null;
    prSetListening(btn, false);
    if (cur.aborted) { const o = prOut(btn); if (o.querySelector(".pr-live")) o.innerHTML = ""; return; }
    if (!cur.done) prMsg(btn, prError("no-speech"));
  };
  prNow = cur;
  prSetListening(btn, true);
  try { rec.start(); } catch (err) { prNow = null; prSetListening(btn, false); prMsg(btn, prError((err && err.name) || "start")); }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pr]");
  if (b) { e.preventDefault(); prListen(b); return; }
  const again = e.target.closest("[data-pr-again]");
  if (again) { const m = again.closest(".pr-card, .ex").querySelector("[data-pr]"); if (m) prListen(m); return; }
  const say = e.target.closest(".pr-say");
  if (say) speak(say.dataset.say, say);
});
