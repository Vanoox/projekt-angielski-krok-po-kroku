// Wspólne pomocnicze dla scenariuszy (ładowane przez mock.js przed scn-*.js).
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var $q = (s, r = document) => r.querySelector(s);
var $$ = (s, r = document) => [...r.querySelectorAll(s)];
var strip = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/_+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
var go = async (h) => { location.hash = h; await sleep(400); };
var setVal = (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
var keyOn = (el, key, extra) => el.dispatchEvent(new KeyboardEvent("keydown", Object.assign({ key, bubbles: true, cancelable: true }, extra || {})));
var LOG = [];
var log = (k, v) => LOG.push([k, v]);
var content = () => $q("#content");
var html = (el) => (el ? el.innerHTML.replace(/\s+/g, " ") : null);
window.confirm = () => true;
window.alert = () => {};

var ALLEX = () => [...window.__ENG.TASKS.values()].map((t) => t.ex);
function findEx(card) {
  const all = ALLEX();
  if (card.classList.contains("order")) {
    const chips = $$(".o-chip", card).map((c) => c.textContent.trim().toLowerCase().replace(/[.?!,]/g, "")).sort().join(" ");
    return all.find((ex) => ex.type === "order" && ex.answers[0].toLowerCase().replace(/[.?!,]/g, "").split(/\s+/).sort().join(" ") === chips);
  }
  if (card.querySelector(".gap-input")) {
    const t = strip($q(".ex-q > div:last-child", card).innerHTML);
    return all.find((ex) => ex.type === "gap" && strip(ex.q) === t);
  }
  const p = $q(".w-prompt", card);
  if (p) { const t = strip(p.innerHTML); return all.find((ex) => ex.type === "write" && strip(ex.q) === t); }
  return null;
}
function mutate(s, i) {
  const w = s.split(" ");
  switch (i % 5) {
    case 0: return s;
    case 1: { const j = w.findIndex((x) => x.length > 3); if (j >= 0) w[j] = w[j].slice(0, -1); return w.join(" "); }
    case 2: return w.slice(1).join(" ");
    case 3: if (w.length > 2) [w[0], w[1]] = [w[1], w[0]]; return w.join(" ");
    default: return w.map((x) => (x === "a" ? "the" : x === "is" ? "are" : x === "does" ? "do" : x)).join(" ") + (/s$/.test(w[w.length - 1]) ? "" : "");
  }
}
// Odpowiada na jedno zadanie (różnie zależnie od numeru), zwraca HTML informacji zwrotnej.
async function playCard(card, i) {
  const exq = findEx(card);
  const btnCheck = () => $q(".gap-actions .check", card) || $q(".check", card);
  if ($$(".opt", card).length) { $$(".opt", card)[i % $$(".opt", card).length].click(); }
  else if (card.classList.contains("finderr")) {
    const ws = $$(".fe-w", card);
    if (i % 3 === 0) $q(".fe-none", card).click();
    else {
      ws[Math.min(ws.length - 1, i % 3)].click();
      await sleep(20);
      const ta = $q(".fe-fix textarea", card);
      if (ta && !ta.closest("[hidden]")) { setVal(ta, mutate(ws.map((b) => b.textContent).join(" "), i)); keyOn(ta, "Enter"); }
    }
  } else if (card.classList.contains("dictation")) {
    $q(".d-play", card).click(); await sleep(150);
    const last = (window.__spoken[window.__spoken.length - 1] || "").split("|").slice(3).join("|");
    const ta = $q("textarea", card); setVal(ta, mutate(last, i)); keyOn(ta, "Enter");
  } else if (card.classList.contains("order")) {
    const chips = $$(".o-chip", card);
    if (exq && i % 2 === 0) {
      const toks = exq.answers[0].replace(/[.?!]+$/, "").split(/\s+/);
      for (const t of toks) { const c = $$(".o-bank .o-chip", card).find((x) => x.textContent.trim().replace(/[.?!]+$/, "") === t); if (c) c.click(); }
    } else chips.forEach((c) => c.click());
    const b = btnCheck(); if (b) b.click();
  } else if (card.querySelector(".gap-input")) {
    const ins = $$(".gap-input", card);
    ins.forEach((inp, k) => {
      let a = exq ? (Array.isArray(exq.answers[k]) ? exq.answers[k][0] : exq.answers[0]) : "is";
      a = window.__ENG.expandAnswer(a)[0];
      setVal(inp, i % 3 === 1 ? mutate(a, 1) || "x" : i % 3 === 2 ? "zzz" : a);
    });
    const b = btnCheck(); if (b) b.click(); else keyOn(ins[ins.length - 1], "Enter");
  } else if ($q("textarea", card)) {
    const ta = $q("textarea", card);
    const a = exq ? window.__ENG.expandAnswer(exq.answers[(i >> 1) % exq.answers.length])[0] : "I am here.";
    setVal(ta, i % 7 === 6 ? "" : mutate(a, i));
    const b = btnCheck(); if (b) b.click(); else keyOn(ta, "Enter");
  }
  await sleep(30);
  return html($q(".fb", card));
}
async function playAll(root, max = 999) {
  const out = [];
  const cards = $$(".exercise", root).slice(0, max);
  for (let i = 0; i < cards.length; i++) out.push(await playCard(cards[i], i));
  return out;
}
var lsGet = (k) => { try { return JSON.parse(localStorage.getItem("eng-" + k)); } catch (e) { return localStorage.getItem("eng-" + k); } };
