// Kopia postępu: pobieranie i wczytywanie pliku (łączenie / zastąpienie), przypomnienie o kopii.
// Sekcja #kopia na stronie „Kolejność nauki”; logika pliku – js/storage.js.
import { esc } from "./util.js";
import { backupStats as storageBackupStats, backupDue as storageBackupDue, BACKUP_APP, BACKUP_VERSION, readAll, store, parseBackup, mergeData, writeAll, loadState, migrateState } from "./storage.js";
import { icon } from "./icons.js";
import { $, closestEl } from "./ui.js";
import { BY_ID, WORDS } from "./data.js";
import { state } from "./state.js";
import { reloadVoiceCfg } from "./speech.js";
import { renderLevelFilter } from "./nav.js";
import { hasTask } from "./conj.js";
import { route } from "./router.js";
import { syncThemeColor } from "./theme.js";

// ---------- Kopia postępu: eksport / import (sekcja #kopia na stronie „Kolejność nauki”) ----------
// Format pliku, sprawdzanie, łączenie i zapis – js/storage.js; tu widok (przypomnienie, pobieranie, podgląd, wczytanie).
/** @param {Dict<any>} data */
const backupStats = (data) => storageBackupStats(data, { lesson: (id) => !!BY_ID[id], task: (k) => hasTask(k), word: (k) => WORDS.has(k) });
/** @param {string | number | Date} iso @param {boolean} [time] */
const fmtDate = (iso, time) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) + (time ? ", " + d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "");
};
// Przypomnienie: 14 dni od ostatniej kopii (albo od „Później” / początku nauki), o ile od ostatniej kopii przybyło postępu.
// eng-backup = { last: data ostatniej kopii, since: od kiedy liczymy 14 dni, count: ile było postępu przy ostatniej kopii }.
const progressCount = () => Object.keys(state.done).length + Object.keys(state.scores).length;
const backupDue = () => storageBackupDue(progressCount());
export const backupReminder = () => backupDue() ? `<div class="card backup-reminder" role="note">
      <span class="br-ico" aria-hidden="true">${icon("save")}</span>
      <div class="br-text"><b>Zrób kopię postępu</b><span>Postęp jest zapisany tylko w tej przeglądarce. Kopia w pliku przyda się, gdy wyczyścisz dane przeglądarki albo zmienisz urządzenie.</span></div>
      <div class="br-actions"><button class="btn primary small" type="button" data-backup="download">Pobierz kopię</button><button class="btn small" type="button" data-backup="later">Później</button></div>
    </div>` : "";
function downloadBackup() {
  const now = new Date();
  const file = { app: BACKUP_APP, version: BACKUP_VERSION, date: now.toISOString(), data: readAll() };
  const blob = new Blob([JSON.stringify(file, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  /** @param {number} x */
  const p = (x) => String(x).padStart(2, "0");
  a.download = `angielski-postep-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  store.set("backup", { last: now.toISOString(), since: now.toISOString(), count: progressCount() });
  document.querySelectorAll(".backup-reminder").forEach((el) => el.remove());
  const last = $(".backup-last");
  if (last) last.innerHTML = `Ostatnia kopia: <b>${fmtDate(now, true)}</b>.`;
}
let backupFlash = ""; // komunikat po wczytaniu kopii – pokazany raz, po ponownym narysowaniu strony
export function backupSectionHtml() {
  const b = store.get("backup", null);
  const flash = backupFlash; backupFlash = "";
  return `<section class="card backup" id="kopia">
      <h2>${icon("save")} Kopia postępu</h2>
      <p>Przerobione lekcje, wyniki zadań i słówka oznaczone jako „znam” są zapisane <b>tylko w tej przeglądarce</b>. Po wyczyszczeniu danych przeglądarki znikną. Pobierz kopię do pliku – potem wczytasz ją tutaj albo na innym urządzeniu (np. na telefonie).</p>
      <p class="muted backup-last">${b && b.last ? `Ostatnia kopia: <b>${fmtDate(b.last, true)}</b>.` : "Na tym urządzeniu nie zrobiono jeszcze kopii."}</p>
      <div class="backup-actions">
        <button class="btn primary" type="button" data-backup="download">${icon("download")} Pobierz kopię postępu</button>
        <button class="btn" type="button" data-backup="pick">${icon("upload")} Wczytaj kopię</button>
        <input type="file" accept=".json,application/json" hidden>
      </div>
      <div class="backup-panel" aria-live="polite">${flash}</div>
    </section>`;
}
/** @param {HTMLElement | null} box sekcja #kopia */
export function bindBackup(box) {
  if (!box) return;
  const input = /** @type {HTMLInputElement} */ (box.querySelector("input[type=file]")), panel = $(".backup-panel", box);
  $('[data-backup="pick"]', box).addEventListener("click", () => { input.value = ""; input.click(); });
  /** @param {string} msg */
  const fail = (msg) => { panel.innerHTML = `<div class="backup-msg bad">${esc(msg)}</div>`; };
  input.addEventListener("change", () => {
    const f = input.files && input.files[0];
    if (!f) return;
    if (f.size > 5e6) return fail("Ten plik jest za duży jak na kopię postępu.");
    const reader = new FileReader();
    reader.onerror = () => fail("Nie udało się odczytać pliku.");
    reader.onload = () => {
      const res = parseBackup(String(reader.result));
      if (res.error !== undefined) return fail(res.error);
      showPreview(res);
    };
    reader.readAsText(f);
  });

  /** @param {{ data: Dict<any>, date: unknown }} backup */
  function showPreview({ data, date }) {
    const cur = readAll(), merged = mergeData(cur, data);
    const [sF, sC, sM] = [data, cur, merged].map(backupStats);
    /** @param {string} label @param {keyof typeof sF} k */
    const row = (label, k) => `<tr><td>${label}</td><td>${sF[k]}</td><td>${sC[k]}</td><td>${sM[k]}</td></tr>`;
    const empty = !sF.done && !sF.scores && !sF.words && !sF.mistakes && !sF.srs && !sF.days;
    panel.innerHTML = `<div class="backup-preview">
        <h3>Kopia${date && fmtDate(/** @type {string} */ (date)) ? ` z ${fmtDate(/** @type {string} */ (date), true)}` : ""}</h3>
        ${empty ? `<p class="backup-msg warn">Ta kopia nie zawiera żadnego postępu (same ustawienia albo nic).</p>` : ""}
        <div class="backup-table"><table>
          <thead><tr><th></th><th>W kopii</th><th>Na tym urządzeniu</th><th>Po połączeniu</th></tr></thead>
          <tbody>${row("Przerobione lekcje", "done")}${row("Wyniki zadań i testów", "scores")}${row("Słówka „znam”", "words")}${row("Słówka w powtórkach", "srs")}${row("Zadania w „Moich błędach”", "mistakes")}${row("Dni nauki", "days")}</tbody>
        </table></div>
        <p><b>Połącz</b> – zostaje wszystko z obu miejsc: lekcje przerobione tu lub tam, lepszy z dwóch wyników, wszystkie znane słówka i dni nauki. Ustawienia (motyw, poziomy w menu, cel dzienny, głos lektora) zostają z tego urządzenia.<br>
        <b>Zastąp</b> – postęp z tego urządzenia zostanie <b>usunięty</b> i zastąpiony kopią.</p>
        <div class="backup-actions">
          <button class="btn primary" type="button" data-act="merge">Połącz</button>
          <button class="btn danger" type="button" data-act="replace">Zastąp</button>
          <button class="btn" type="button" data-act="cancel">Anuluj</button>
        </div>
      </div>`;
    $('[data-act="cancel"]', panel).addEventListener("click", () => { panel.innerHTML = ""; });
    $('[data-act="merge"]', panel).addEventListener("click", () => apply(merged, false, sM));
    $('[data-act="replace"]', panel).addEventListener("click", () => apply(data, true, sF));
    $(".backup-preview", panel).scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /** @param {Dict<any>} data @param {boolean} replace @param {ReturnType<typeof backupStats>} stats */
  function apply(data, replace, stats) {
    if (!writeAll(data, replace)) return fail("Nie udało się zapisać postępu (brak miejsca w przeglądarce?).");
    Object.assign(state, loadState());
    migrateState(state, (k) => WORDS.has(k));
    reloadVoiceCfg();
    const t = localStorage.getItem("eng-theme");
    if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
    syncThemeColor();
    backupFlash = `<div class="backup-msg good">${icon("check")} Kopia wczytana${replace ? " (postęp zastąpiony)" : " i połączona z postępem z tego urządzenia"}: ${stats.done} przerobionych lekcji, ${stats.scores} wyników, ${stats.words} znanych słówek.</div>`;
    renderLevelFilter();
    route();
    const sec = document.getElementById("kopia");
    if (sec) sec.scrollIntoView({ block: "start" });
  }
}
// Przypomnienie o kopii (strona główna, Kolejność nauki): „Pobierz kopię” / „Później”.
document.addEventListener("click", (e) => {
  const bk = closestEl(e, "[data-backup=download], [data-backup=later]");
  if (!bk) return;
  if (bk.dataset.backup === "download") downloadBackup();
  else { store.set("backup", { ...store.get("backup", {}), since: new Date().toISOString() }); document.querySelectorAll(".backup-reminder").forEach((el) => el.remove()); }
}, true);
