// Wspólna lista czytanek, dialogów i rozmów (karty z poziomem, odblokowaniem po lekcji i wynikiem).
import { esc, LEVELS } from "./util.js";
import { icon } from "./icons.js";
import { LEVEL_INFO, badge, scorePill } from "./ui.js";
import { lessonNo } from "./data.js";
import { state } from "./state.js";

// ---------- Lista czytanek, dialogów i rozmów ----------
// Lista materiałów (czytanki, dialogi i rozmowy – ten sam kod): grupy według poziomu,
// odblokowanie według lekcji after (przerobiona = otwarte), zablokowane widoczne z dopiskiem „po lekcji N”.
// opts: { base: "#/czytanki", key: (x) => klucz wyniku w state.scores, meta: (x) => krótki opis }.
function unitCardHtml(x, opts) {
  const open = !!state.done[x.after], s = state.scores[opts.key(x)];
  const status = !open ? `<span class="unit-lock">${icon("lock")} po lekcji ${lessonNo(x.lesson)}</span>` : s ? scorePill(s) : `<span class="unit-new">Nowa</span>`;
  return `<a class="card unit${open ? "" : " locked"}" href="${opts.base}/${x.id}">
      <span class="unit-top">${x.topic ? `<span class="unit-topic">${esc(x.topic)}</span>` : "<span></span>"}${status}</span>
      <b class="unit-title" lang="en">${esc(x.title)}</b><span class="unit-pl">${esc(x.titlePl)}</span>
      <span class="unit-meta">${opts.meta(x)}${open ? "" : `<br>Najpierw lekcja ${lessonNo(x.lesson)}: ${esc(x.lesson.title)}`}</span></a>`;
}
export function unitListHtml(items, opts) {
  return LEVELS.map((lv) => {
    const xs = items.filter((x) => x.level === lv);
    if (!xs.length) return "";
    return `<h2 class="section-title unit-lv">${badge(lv)} ${LEVEL_INFO[lv].name}</h2><div class="unit-list">${xs.map((x) => unitCardHtml(x, opts)).join("")}</div>`;
  }).join("");
}
export const scrollToRead = (el) => { const r = el.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight) el.scrollIntoView({ block: "center" }); };
