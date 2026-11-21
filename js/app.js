// Start strony (index.html ładuje ten plik jako <script type="module">): tabela tras dla routera, nasłuch zmiany adresu,
// window.__ENG dla testów, migracja stanu i pierwsze wyświetlenie. Logika bez DOM – moduły z punktu 24 (check.js, srs.js…),
// widoki – views/*.js, części wspólne – pozostałe pliki w js/ (opis w tools/README.md).
import { matches, expandAnswer, vocabMatch, variants } from "./check.js";
import { migrateState } from "./storage.js";
import { $ } from "./ui.js";
import { TASKS, READING, DIALOGUES, CHATS, WORDS } from "./data.js";
import { state } from "./state.js";
import { orderView } from "./views/order.js";
import { errDicts } from "./exercises.js";
import { renderLevelFilter } from "./nav.js";
import { homeView } from "./views/home.js";
import { lessonView } from "./views/lesson.js";
import { vocabHomeView, vocabTopicView } from "./views/vocab.js";
import { conjView } from "./views/conjugation.js";
import { timelineView } from "./views/timeline.js";
import { rdParse, rdLookup, readingHomeView, readingView } from "./views/reading.js";
import { dlgVoices, dialoguesHomeView, dialogueView } from "./views/dialogues.js";
import { chatVoices, chatsHomeView, chatView } from "./views/chats.js";
import { practiceView } from "./views/practice.js";
import { testsView } from "./views/tests.js";
import { checkpointView } from "./views/checkpoint.js";
import { levelTestView } from "./views/level-test.js";
import { mistakesView } from "./views/mistakes.js";
import { wordsView } from "./views/words.js";
import { searchView } from "./search.js";
import { setRoutes, route } from "./router.js";
import { initOffline } from "./pwa.js";

// ---------- Start ----------
initOffline();
// Słowniki do opisu błędów (ok. 0,3 s) budujemy, gdy przeglądarka nic nie robi – nie przy pierwszym „Sprawdź”.
if ("requestIdleCallback" in window) requestIdleCallback(() => errDicts(), { timeout: 8000 }); else setTimeout(errDicts, 3000);
window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/search/")) { $("#search").value = ""; document.body.classList.remove("search-open"); } route(); });
// Udostępnione do testów automatycznych (tools/).
window.__ENG = { matches, expandAnswer, vocabMatch, variants, rdLookup, rdParse, READING, DIALOGUES, dlgVoices, CHATS, chatVoices, TASKS };
// Trasy w kolejności sprawdzania (pierwsza pasująca); ostatnia – strona główna dla każdego innego adresu.
setRoutes([
  { match: /^#\/lesson\//, view: () => lessonView() },
  { match: /^#\/sprawdzian\//, view: (h) => checkpointView(h.slice(13)) },
  { match: /^#\/test-poziomu\//, view: (h) => levelTestView(h.slice(15).toUpperCase()) },
  { match: /^#\/slowka/, view: () => wordsView() },
  { match: /^#\/bledy/, view: () => mistakesView() },
  { match: /^#\/practice/, view: () => practiceView() },
  { match: /^#\/tests/, view: () => testsView() },
  { match: /^#\/vocab\//, view: (h) => vocabTopicView(h.slice(8)) },
  { match: /^#\/vocab/, view: () => vocabHomeView() },
  { match: /^#\/czytanki\//, view: (h) => readingView(h.slice(11)) },
  { match: /^#\/czytanki/, view: () => readingHomeView() },
  { match: /^#\/dialogi\//, view: (h) => dialogueView(h.slice(10)) },
  { match: /^#\/dialogi/, view: () => dialoguesHomeView() },
  { match: /^#\/rozmowy\//, view: (h) => chatView(h.slice(10)) },
  { match: /^#\/rozmowy/, view: () => chatsHomeView() },
  { match: /^#\/czasy/, view: (h) => timelineView(h.split("/").slice(2).join("/")) },
  { match: /^#\/odmiana/, view: (h) => conjView(h.split("/")[2] || "") },
  { match: /^#\/kolejnosc/, view: () => orderView() },
  { match: /^#\/search\//, view: (h) => searchView(decodeURIComponent(h.slice(9))) },
  { match: /^/, view: () => homeView() },
]);
migrateState(state, (k) => WORDS.has(k));
renderLevelFilter();
route();
