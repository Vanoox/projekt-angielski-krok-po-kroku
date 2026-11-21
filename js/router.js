// Router: wybiera widok z tabeli tras (setRoutes w app.js), sprząta po poprzednim widoku, zatrzymuje lektora
// i mikrofon, ustawia tytuł karty i przewija stronę.
import { $, currentLessonId } from "./ui.js";
import { syncGoal } from "./goal.js";
import { seqStop, prStop } from "./speech.js";
import { renderNav } from "./nav.js";

// ---------- Router ----------
// Tabela tras (ROUTES, ustawiana przez setRoutes przy starcie): pierwsza trasa, której match pasuje do location.hash.
// view(h) zwraca { html, title, mount(el) }; mount może zwrócić funkcję sprzątającą (nasłuch przewijania, klawiszy…) –
// router woła ją przy następnej zmianie strony. Zatrzymanie lektora i mikrofonu jest wspólne dla wszystkich stron.
let ROUTES = [];
export const setRoutes = (routes) => { ROUTES = routes; };
let lastRoute = "", viewCleanup = null;
export function route() {
  const h = location.hash || "#/";
  const content = $("#content");
  document.body.classList.remove("nav-open");
  if (!h.startsWith("#/")) return; // kotwice wewnątrz strony
  if (viewCleanup) { viewCleanup(); viewCleanup = null; }
  prStop();
  seqStop(); // czytanie na głos (czytanki, dialogi)
  const sameLesson = currentLessonId() && lastRoute === currentLessonId();
  const view = ROUTES.find((r) => r.match.test(h)).view(h);
  content.innerHTML = view.html;
  const cleanup = view.mount && view.mount(content);
  if (typeof cleanup === "function") viewCleanup = cleanup;
  document.title = view.title;
  syncGoal(); // pasek: także po północy i po wczytaniu kopii (przed szukaniem kotwicy – karta celu jest tu przebudowywana)
  // Przy przełączaniu zakładek tej samej lekcji zostajemy przy nagłówku zamiast skakać na górę.
  const tabsEl = $(".tabs");
  const anchor = (h.startsWith("#/kolejnosc/") && document.getElementById(h.slice(12))) // np. #/kolejnosc/kopia
    || (h.startsWith("#/czasy/porownaj/") && document.getElementById("tlCmp"));
  if (sameLesson && tabsEl && window.scrollY > tabsEl.offsetTop) tabsEl.scrollIntoView();
  else if (!anchor) window.scrollTo(0, 0);
  lastRoute = currentLessonId() || "";
  renderNav();
  if (anchor) anchor.scrollIntoView(); // dopiero po renderNav – ono przewija menu do aktywnej pozycji, co cofa stronę
}
