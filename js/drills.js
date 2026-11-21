// Zestawy „Znajdź błąd” i dyktando – wspólne dla zakładek lekcji i treningu mieszanego.
import { icon } from "./icons.js";
import { shuffle, scorePill } from "./ui.js";
import { state } from "./state.js";
import { exercisesShell } from "./exercises.js";
import { ttsWarnHtml, voiceLink } from "./speech.js";

// ---------- Znajdź błąd (zakładka lekcji, trening) ----------
export const FE_MIN = 5, FE_ROUND = 10, FE_GOOD = 0.2;
// Runda: n różnych par, z czego ok. 20% jako zdanie poprawne (good) – żeby nie klikać na ślepo „jakiegoś” słowa.
/** @param {Lesson[]} lessons */
export const fePairs = (lessons) => lessons.flatMap((l) => l.finds.map((p) => ({ ...p, lesson: l })));
/** @param {(FindPair & { lesson: Lesson })[]} pairs @param {number} n @returns {{ ex: FindErrTask, lesson: Lesson }[]} */
export function feRound(pairs, n) {
  const xs = shuffle(pairs).slice(0, n), nGood = Math.round(xs.length * FE_GOOD);
  return shuffle(xs.map((p, i) => ({ ex: i < nGood ? p.good : p.bad, lesson: p.lesson })));
}
/** @param {string} [more] */
export const feIntro = (more) => `<div class="ex-intro">Kliknij <b>słowo, w którym jest błąd</b>, a potem popraw zdanie – pole wypełni się tym zdaniem z zaznaczonym błędnym fragmentem, więc wystarczy wpisać poprawną wersję. Mniej więcej co piąte zdanie jest poprawne – wtedy kliknij <b>Tu nie ma błędu</b>.<span class="kbd-hint"> Klawiatura: <kbd>←</kbd> <kbd>→</kbd> – wybór słowa, <kbd>Enter</kbd> – zatwierdzenie.</span>${more || ""}</div>`;
/** @param {Lesson} l */
export function renderLessonFind(l) {
  const s = state.scores[l.id + "::err"];
  return `<section class="block">
      <h2>${icon("search")} Znajdź błąd</h2>
      <p class="muted-p">Zdania z części „Typowe błędy” tej lekcji (${l.finds.length}) – za każdym razem ${Math.min(FE_ROUND, l.finds.length)} losowych. Po odpowiedzi zobaczysz poprawne zdanie i krótkie wyjaśnienie.${s ? ` Najlepszy wynik: ${scorePill(s)}` : ""}</p>
      <div id="feBox">${exercisesShell("Znajdź i popraw błąd", { h3: true, retryLabel: "Nowe zdania" })}</div>
    </section>`;
}

// ---------- Dyktando ----------
export const DICT_ROUND = 10;
/** @param {string} [more] */
export const dictIntro = (more) => `<div class="tts-warn">${ttsWarnHtml()}</div>
    <div class="ex-intro">Kliknij <b>${icon("play")} Odtwórz</b>, posłuchaj i zapisz całe zdanie po angielsku. Możesz słuchać dowolnie wiele razy (<b>${icon("slow")} Wolniej</b> – wolniejsze tempo<span class="kbd-hint">, <kbd>Ctrl</kbd>+<kbd>spacja</kbd> w polu – jeszcze raz</span>). Wielka litera i interpunkcja nie mają znaczenia, formy skrócone i pełne (<i>I'm / I am</i>) są równoważne.${more || ""}${voiceLink("Akcent, głos i tempo lektora")}</div>`;
/** @param {Lesson} l */
export function renderLessonDictation(l) {
  const s = state.scores[l.id + "::dict"];
  return `<section class="block">
      <h2>${icon("headphones")} Dyktando</h2>
      <p class="muted-p">Zdania z przykładów w tej lekcji (${l.dict.length}) – za każdym razem ${Math.min(DICT_ROUND, l.dict.length)} losowych. Najpierw przeczytaj teorię, potem sprawdź, czy rozpoznajesz te zdania ze słuchu.${s ? ` Najlepszy wynik: ${scorePill(s)}` : ""}</p>
      <div id="dictBox">${exercisesShell("Posłuchaj i zapisz", { h3: true, retryLabel: "Nowe zdania" })}</div>
    </section>`;
}
