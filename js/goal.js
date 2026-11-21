// Cel dzienny (eng-goal): karta z kółkiem i zmianą celu, małe kółko „12/20” w pasku i w menu, komunikat po osiągnięciu.
import { goalCount as goalCountOf, GOAL_CHOICES } from "./activity.js";
import { store } from "./storage.js";
import { icon } from "./icons.js";
import { $, plural } from "./ui.js";
import { state } from "./state.js";

// ---------- Cel dzienny (eng-goal) ----------
// Liczy się to samo co w dzienniku: zadania z odpowiedzią + ocenione słówka w fiszkach (dayTotal z eng-activity).
// Cel to ustawienie (10/20/30/50, domyślnie 20): trafia do pliku z kopią (jak wszystkie eng-*), ale przy łączeniu
// kopii zostaje taki, jak na tym urządzeniu (KEEP_LOCAL, jak eng-srsNew); „Zastąp” bierze go z pliku.
// Widoki: goalHtml() – karta z kółkiem i zmianą celu (Kolejność nauki, strona główna; do wstawienia w „Twój dzień”),
// .goal-mini – małe kółko „12/20” na każdej stronie: w górnym pasku (#goalTop), a na telefonie (gdzie w pasku brak
// miejsca) w menu (.nav-goal). Odświeża je syncGoal() po każdym wpisie w dzienniku.
const goalCount = () => goalCountOf(state.activity);
const goalRing = (n, g) => {
  const pct = Math.min(100, Math.round((n / g) * 100));
  return `<svg class="goal-ring${n >= g ? " is-done" : ""}" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle class="gr-bg" cx="18" cy="18" r="15"/><circle class="gr-fg" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="${pct} 100" transform="rotate(-90 18 18)"/></svg>`;
};
export const zadanISlowek = (n) => plural(n, "zadanie lub słówko", "zadania lub słówka", "zadań lub słówek");
export function goalHtml() {
  const n = goalCount(), g = state.goal, left = g - n;
  const msg = left > 0
    ? `${n ? "Jeszcze" : "Zrób dziś"} <b>${left}</b> ${zadanISlowek(left)}. Liczą się wszystkie zadania (lekcje, testy, trening, Moje błędy) i słówka ocenione w fiszkach.`
    : `<b class="goal-ok">${icon("check")} Cel na dziś zrobiony.</b> Możesz uczyć się dalej albo wrócić jutro.`;
  return `<section class="card goal-card" id="cel" aria-label="Cel na dziś">
      <div class="goal-big" role="img" aria-label="Dziś ${n} z ${g}">${goalRing(n, g)}<span class="goal-num"><span><b>${n}</b>/${g}</span></span></div>
      <div class="goal-body">
        <b class="goal-title">Cel na dziś: ${g} ${zadanISlowek(g)}</b>
        <p class="goal-msg">${msg}</p>
        <div class="goal-set"><span>Dzienny cel:</span><div class="chips">${GOAL_CHOICES.map((c) => `<button class="chip ${c === g ? "active" : ""}" type="button" data-goal="${c}" aria-pressed="${c === g}">${c}</button>`).join("")}</div></div>
      </div>
    </section>`;
}
let goalMsgTimer = 0;
export function syncGoalMini() {
  const n = goalCount(), g = state.goal, done = n >= g;
  const label = done ? `Cel na dziś zrobiony (${n}/${g})` : `Cel na dziś: ${n}/${g} (zadania i słówka)`;
  document.querySelectorAll(".goal-mini").forEach((el) => {
    el.hidden = false;
    el.classList.toggle("is-done", done);
    el.title = label;
    el.setAttribute("aria-label", label);
    el.querySelector(".gt-ring").innerHTML = goalRing(n, g);
    el.querySelector(".gt-txt").textContent = `${n}/${g}`;
  });
}
export function syncGoal(celebrate) {
  syncGoalMini();
  const m = $("#goalMsg");
  if (m && celebrate) { // krótki napis pod paskiem, sam znika; bez okna do zamykania
    m.textContent = "Cel na dziś zrobiony!";
    m.classList.add("show");
    clearTimeout(goalMsgTimer);
    goalMsgTimer = setTimeout(() => { m.classList.remove("show"); m.textContent = ""; }, 4000);
  }
  document.querySelectorAll(".goal-card").forEach((el) => { el.outerHTML = goalHtml(); });
}
// Zmiana celu (przyciski 10/20/30/50 na karcie celu).
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-goal]");
  if (!b) return;
  state.goal = +b.dataset.goal;
  store.set("goal", state.goal);
  syncGoal();
  const nb = document.querySelector(`.goal-card [data-goal="${state.goal}"]`); // karta jest przebudowana – fokus wraca na przycisk
  if (nb) nb.focus();
});
