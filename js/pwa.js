// Offline / instalacja na telefonie: rejestracja service workera (sw.js) i pasek „Jest nowa wersja”.
import { icon } from "./icons.js";
import { $ } from "./ui.js";

// ---------- offline / instalacja (PWA): service worker z sw.js ----------
// Przy pierwszej wizycie sw.js zapisuje stronę w pamięci telefonu – potem działa bez internetu.
// Gdy na serwerze jest nowa wersja, pobiera się w tle i pokazujemy pasek „Jest nowa wersja”.
// Przeładowujemy dopiero po kliknięciu, żeby nie przerwać rozwiązywania zadań.
export function initOffline() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  const sw = navigator.serviceWorker;
  let wantReload = false;
  sw.addEventListener("controllerchange", () => { if (wantReload) location.reload(); });
  /** @param {ServiceWorker | null} worker */
  const offer = (worker) => {
    if (!worker || !sw.controller || $(".update-bar")) return; // bez sw.controller = pierwsza instalacja, nie aktualizacja
    const bar = document.createElement("div");
    bar.className = "update-bar";
    bar.setAttribute("role", "status");
    bar.innerHTML = `<span>Jest nowa wersja strony.</span>
        <button class="btn primary" type="button">Odśwież</button>
        <button class="icon-btn" type="button" aria-label="Później" title="Później">${icon("x")}</button>`;
    const [refresh, later] = bar.querySelectorAll("button");
    refresh.addEventListener("click", () => { wantReload = true; refresh.disabled = true; worker.postMessage("skip-waiting"); });
    later.addEventListener("click", () => bar.remove());
    document.body.appendChild(bar);
  };
  sw.register("sw.js").then((reg) => {
    offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      if (w) w.addEventListener("statechange", () => { if (w.state === "installed") offer(w); });
    });
    // Aplikacja na telefonie bywa otwarta długo – sprawdzaj nową wersję przy powrocie do niej.
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
  }).catch(() => {});
}
