// Wyszukiwanie: pole w górnym pasku (na telefonie pod lupą) i strona wyników #/search/<tekst>.
import { stripTags, esc } from "./util.js";
import { icon } from "./icons.js";
import { $, badge, speakBtn } from "./ui.js";
import { PATH, VOCAB, vocabItems, SEARCH_TEXT, HEAD_TEXT } from "./data.js";
import { route } from "./router.js";

// ---------- Wyszukiwanie ----------
export const searchView = (q) => ({ html: renderSearch(q), title: `Szukaj: ${q}` });
function renderSearch(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = PATH.map((l) => {
    const head = HEAD_TEXT[l.id], body = SEARCH_TEXT[l.id];
    if (!terms.every((t) => body.includes(t))) return null;
    const score = terms.reduce((s, t) => s + (head.includes(t) ? 10 : 0) + Math.min(body.split(t).length - 1, 5), 0);
    return { l, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
  const words = [];
  for (const t of VOCAB) for (const w of vocabItems(t)) {
    const s = (stripTags(w.en) + " " + stripTags(w.pl)).toLowerCase();
    if (terms.every((x) => s.includes(x))) words.push({ t, w });
    if (words.length >= 30) break;
  }
  const hl = (s) => { let out = esc(s); terms.forEach((t) => { out = out.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => `<mark>${m}</mark>`); }); return out; };
  return `<div class="page"><h1 class="search-h1">${icon("search")} Wyniki dla „${esc(q)}”</h1>
      ${hits.length ? `<div class="results-list">${hits.map(({ l }) => `<a class="card result-item" href="#/lesson/${l.id}">
        <h3>${badge(l.level)} ${hl(l.title)}</h3><p><b>${hl(l.titlePl)}</b> · ${esc(l.category)}</p><p>${hl(stripTags(l.summary))}</p></a>`).join("")}</div>`
      : words.length ? "" : `<div class="empty">Nic nie znaleziono. Spróbuj innego słowa, np. „past”, „modal”, „if”, „przedimki”.</div>`}
      ${words.length ? `<h2 class="section-title">Słownictwo</h2><div class="card vlist">${words.map(({ t, w }) => `<a class="vrow vlink" href="#/vocab/${t.id}">${speakBtn(w.en)}<div class="v-main"><div class="v-en">${hl(stripTags(w.en))}</div><div class="v-pl">${hl(stripTags(w.pl))}</div></div><span class="muted">${esc(t.titlePl)} ${badge(t.level)}</span></a>`).join("")}</div>` : ""}
    </div>`;
}
// Pole wyszukiwania w górnym pasku (wyniki: #/search/<tekst>).
let searchTimer;
$("#search").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  searchTimer = setTimeout(() => {
    if (q.length >= 2) history.replaceState(null, "", "#/search/" + encodeURIComponent(q)), route();
    else if (!q && location.hash.startsWith("#/search/")) location.hash = "#/";
  }, 200);
});
// Telefon i tablet (do 960px): pole wyszukiwania schowane pod lupą, po otwarciu zakrywa pasek górny.
const closeSearch = () => { const el = $("#search"); el.value = ""; el.blur(); document.body.classList.remove("search-open"); if (location.hash.startsWith("#/search/")) location.hash = "#/"; };
$("#searchBtn").addEventListener("click", () => { document.body.classList.add("search-open"); $("#search").focus(); });
$("#searchClose").addEventListener("click", closeSearch);
const SEARCH_PH = $("#search").placeholder, PHONE = matchMedia("(max-width: 960px)");
const syncSearchPh = () => { $("#search").placeholder = PHONE.matches ? "Szukaj tematu lub słówka…" : SEARCH_PH; };
syncSearchPh(); PHONE.addEventListener("change", syncSearchPh);
$("#search").addEventListener("blur", (e) => { if (!e.target.value.trim()) document.body.classList.remove("search-open"); });
$("#search").addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#search").focus(); }
});
