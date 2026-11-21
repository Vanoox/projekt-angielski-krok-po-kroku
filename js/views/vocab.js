// Widoki #/vocab i #/vocab/<id> – działy tematyczne słownictwa.
import { LEVELS, esc } from "../util.js";
import { icon } from "../icons.js";
import { LEVEL_INFO, $, SITE_TITLE, badge } from "../ui.js";
import { VOCAB, VOCAB_BY_ID, vocabItems } from "../data.js";
import { srsToday } from "../state.js";
import { knownSet, vocabBlockHtml, bindVocabBlock, ankiCard } from "../vocab-view.js";
import { wordsRow } from "./words.js";

// ---------- Słownictwo: działy tematyczne ----------
let vocabLevels = LEVELS.slice();
export const vocabHomeView = () => ({ html: renderVocabHome(), title: `Słownictwo – ${SITE_TITLE}`, mount: () => { bindVocabHome(); } });
export const vocabTopicView = (id) => {
  const t = VOCAB_BY_ID[id];
  return { html: renderVocabTopic(id), title: t ? `${t.titlePl} – Słownictwo` : SITE_TITLE, mount: (el) => { if (t) bindVocabBlock(el.querySelector(".vocab-block"), t.groups, "vocab:" + t.id); } };
};
function renderVocabHome() {
  const list = VOCAB.filter((t) => vocabLevels.includes(t.level));
  return `<div class="page">
      <div class="hero"><h1>${icon("book")} Słownictwo</h1><p>Słówka, które trzeba znać na poziomach A1–B2, pogrupowane tematycznie. W każdym dziale: lista z wymową i przykładami, fiszki oraz dwa rodzaje quizu. Oznaczaj słowa, które już znasz – postęp zapisuje się w przeglądarce.</p></div>
      <div class="card today-widget"><span class="f-ico">${icon("cards")}</span><div class="tw-body"><b>Słówka na dziś</b>${wordsRow(srsToday())}</div></div>
      ${ankiCard()}
      <div class="chips" id="vLevels" style="margin-bottom:18px">${LEVELS.map((l) => `<button class="chip ${vocabLevels.includes(l) ? "active" : ""}" data-level="${l}">${l} · ${LEVEL_INFO[l].name}</button>`).join("")}</div>
      ${VOCAB.length ? LEVELS.filter((lv) => vocabLevels.includes(lv)).map((lv) => {
      const ts = list.filter((t) => t.level === lv);
      if (!ts.length) return "";
      return `<h2 class="section-title">${badge(lv)} ${LEVEL_INFO[lv].name}</h2><div class="topic-grid">${ts.map((t) => {
        const n = vocabItems(t).length, k = Object.keys(knownSet("vocab:" + t.id)).length;
        return `<a class="card topic" href="#/vocab/${t.id}" data-level="${t.level}">
            <span class="t-ico">${t.icon || "📘"}</span><b>${esc(t.titlePl)}</b><span class="t-en">${esc(t.title)}</span>
            <span class="t-meta">${n} słówek${k ? ` · znasz ${k}` : ""}</span><div class="progress"><i style="width:${n ? (k / n) * 100 : 0}%"></i></div></a>`;
      }).join("")}</div>`;
    }).join("") : `<div class="empty">Brak działów słownictwa.</div>`}
    </div>`;
}
function bindVocabHome() {
  $("#vLevels").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    const lv = b.dataset.level;
    vocabLevels = vocabLevels.length === 4 ? [lv] : vocabLevels.includes(lv) ? vocabLevels.filter((x) => x !== lv) : vocabLevels.concat(lv);
    if (!vocabLevels.length) vocabLevels = LEVELS.slice();
    $("#content").innerHTML = renderVocabHome(); bindVocabHome();
  });
}
function renderVocabTopic(id) {
  const t = VOCAB_BY_ID[id];
  if (!t) return `<div class="page empty"><h1>Nie znaleziono działu</h1><p><a href="#/vocab">Wróć do słownictwa</a></p></div>`;
  const same = VOCAB.filter((x) => x.level === t.level);
  const i = same.indexOf(t);
  return `<article class="page">
      <div class="lesson-head">
        <div class="crumbs" data-level="${t.level}"><a href="#/vocab">${icon("book")} Słownictwo</a> · ${badge(t.level)} <span>${LEVEL_INFO[t.level].name}</span></div>
        <h1>${t.icon || ""} ${esc(t.titlePl)}</h1>
        <div class="title-pl">${esc(t.title)} · ${vocabItems(t).length} słówek</div>
      </div>
      ${vocabBlockHtml(t.groups, "vocab:" + t.id, { intro: t.intro })}
      <div class="pager">
        ${same[i - 1] ? `<a class="card prev" href="#/vocab/${same[i - 1].id}"><small>← Poprzedni dział</small>${esc(same[i - 1].titlePl)}</a>` : "<span></span>"}
        ${same[i + 1] ? `<a class="card next" href="#/vocab/${same[i + 1].id}"><small>Następny dział →</small>${esc(same[i + 1].titlePl)}</a>` : ""}
      </div>
    </article>`;
}
