// Sekcje teorii w lekcji (tekst, przykłady, tabele, porównania, typowe błędy) i odsłanianie ukrytych tłumaczeń.
import { icon } from "./icons.js";
import { slug, speakBtn } from "./ui.js";
import { prText, micBtn } from "./speech.js";
import { FE_MIN } from "./drills.js";

// ---------- Sekcje lekcji ----------
function sectionTitle(s, fallback) { return s.title || fallback; }
export const cmpExample = (e) => typeof e === "string"
  ? `<li>${speakBtn(e)}<span>${e}</span></li>`
  : `<li>${speakBtn(e.en)}<span class="cmp-txt"><span>${e.en}</span><span class="ex-pl">${e.pl}</span></span></li>`;
export function renderSection(s, idx, l) {
  const id = `s-${idx}-${slug(s.title || s.type)}`;
  const h = (t) => (t ? `<h2 id="${id}">${t}</h2>` : `<span id="${id}"></span>`);
  switch (s.type) {
    case "text":
      return `<section class="block">${h(s.title)}<div class="prose">${s.html}</div></section>`;
    case "formula":
      return `<section class="block">${h(sectionTitle(s, "Budowa"))}<div class="formula-grid">${(s.rows || []).map((r) => `
          <div class="formula-row"><div class="f-label">${r.label}</div><div class="f-body">
            <div class="formula">${r.formula}</div>
            ${r.example ? `<div class="f-example">${speakBtn(r.example)}<span>${r.example}</span></div>` : ""}
            ${r.examplePl ? `<div class="f-pl ex-pl">${r.examplePl}</div>` : ""}
          </div></div>`).join("")}</div></section>`;
    case "examples":
      return `<section class="block">${h(sectionTitle(s, "Przykłady"))}<div class="card examples">${(s.items || []).map((e) => `
          <div class="ex">${(() => { const t = prText(e.en), m = t && micBtn(t); return m ? `<div class="ex-btns">${speakBtn(e.en)}${m}</div>` : speakBtn(e.en); })()}<div class="ex-en">${e.en}</div>
            <div class="ex-pl" title="Kliknij, aby pokazać">${e.pl}</div>
            ${e.note ? `<div class="ex-note">${e.note}</div>` : ""}</div>`).join("")}</div></section>`;
    case "table":
      return `<section class="block">${h(s.title)}<div class="card table-wrap"><table>
          <thead><tr>${s.headers.map((x) => `<th>${x}</th>`).join("")}</tr></thead>
          <tbody>${(s.rows || []).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
    case "tip":
    case "warning":
      return `<section class="block" id="${id}"><div class="callout ${s.type}"><h3>${icon(s.type === "tip" ? "bulb" : "alert")} ${s.title || (s.type === "tip" ? "Wskazówka" : "Uwaga")}</h3><div class="prose">${s.html}</div></div></section>`;
    case "mistakes":
      return `<section class="block">${h(sectionTitle(s, "Typowe błędy"))}<div class="mistakes">${(s.items || []).map((m) => `
          <div class="card mistake">
            <div class="mistake-row"><span class="m-icon" style="color:var(--bad)">${icon("x")}</span><span class="wrong">${m.wrong}</span></div>
            <div class="mistake-row"><span class="m-icon" style="color:var(--ok)">${icon("check")}</span><span class="right">${m.right}</span>${speakBtn(m.right)}</div>
            <div class="why">${m.why}</div></div>`).join("")}</div>${l && l.finds.length >= FE_MIN ? `<a class="btn small fe-link" href="#/lesson/${l.id}/find">${icon("search")} Poćwicz: znajdź błąd w zdaniu →</a>` : ""}</section>`;
    case "compare":
      return `<section class="block">${h(s.title)}<div class="compare">${(s.items || []).map((c) => `
          <div class="card compare-col"><h3>${c.label}</h3><div class="prose">${c.html}</div>
          ${(c.examples || []).length ? `<ul>${c.examples.map(cmpExample).join("")}</ul>` : ""}</div>`).join("")}</div></section>`;
    default:
      return "";
  }
}
// Ukryte tłumaczenia (.hide-pl – przełącznik „Tłumaczenie”): kliknięcie odsłania jedno.
document.addEventListener("click", (e) => {
  const pl = e.target.closest(".hide-pl .ex-pl");
  if (pl) pl.classList.toggle("revealed");
}, true);
