// Sprzątanie po widokach i wymowa z mikrofonem (uruchamiaj z atrapą rozpoznawania mowy: views@student@sr=1).
// 1) Nasłuchy na window / document dodane przez widoki (spis treści: scroll + resize, czytanka: resize, rozmowa: keydown)
//    znikają po zmianie strony. 2) Mikrofon w zakładce „Wymowa” i w teorii: dobra i zła wymowa, przerwanie przy zmianie strony.
(async () => {
  const E = window.__ENG;
  const active = new Map(); // klucz → opis
  const tgt = (t) => (t === window ? "window" : t === document ? "document" : null);
  const add0 = EventTarget.prototype.addEventListener, rm0 = EventTarget.prototype.removeEventListener;
  const cap = (o) => !!(o === true || (o && o.capture));
  const ids = new WeakMap(); let nid = 0;
  const fid = (f) => { if (!ids.has(f)) ids.set(f, ++nid); return ids.get(f); };
  EventTarget.prototype.addEventListener = function (type, fn, o) {
    const t = tgt(this); if (t && fn) active.set(`${t}:${type}:${fid(fn)}:${cap(o)}`, `${t}:${type}`);
    return add0.call(this, type, fn, o);
  };
  EventTarget.prototype.removeEventListener = function (type, fn, o) {
    const t = tgt(this); if (t && fn) active.delete(`${t}:${type}:${fid(fn)}:${cap(o)}`);
    return rm0.call(this, type, fn, o);
  };
  const snap = () => { const c = {}; for (const v of active.values()) c[v] = (c[v] || 0) + 1; return Object.fromEntries(Object.entries(c).sort()); };

  await go("#/");
  log("home", snap());
  const first = $q('#nav .nav-item[data-lesson]').dataset.lesson;
  await go("#/lesson/" + first);
  log("lesson theory (toc)", snap());
  await go("#/lesson/" + first + "/vocab");
  log("lesson vocab", snap());
  await go("#/czytanki/" + E.READING[0].id);
  log("reading", snap());
  await go("#/rozmowy/" + E.CHATS[0].id);
  log("chat", snap());
  await go("#/dialogi/" + E.DIALOGUES[0].id);
  log("dialogue", snap());
  await go("#/");
  log("home again", snap());

  // Wymowa (zakładka lekcji)
  const lid = E.DIALOGUES[0].lesson.id;
  await go(`#/lesson/${lid}/speaking`);
  const mics = $$("#content [data-pr]");
  log("mics", mics.length);
  if (mics[0]) {
    window.__srSay = mics[0].dataset.pr;
    mics[0].click(); await sleep(50);
    log("listening", mics[0].getAttribute("aria-pressed"));
    await sleep(500);
    log("pr good", html(mics[0].closest(".pr-card")));
  }
  if (mics[1]) {
    window.__srSay = "banana yellow tomorrow";
    mics[1].click(); await sleep(600);
    log("pr bad", html(mics[1].closest(".pr-card")));
    const again = $q("[data-pr-again]", mics[1].closest(".pr-card"));
    if (again) { window.__srSay = mics[1].dataset.pr; again.click(); await sleep(600); log("pr again", html(mics[1].closest(".pr-card"))); }
  }
  if (mics[2]) {
    window.__srSay = mics[2].dataset.pr;
    mics[2].click(); await sleep(20);
    await go("#/");
    await sleep(500);
    log("pr after nav", window.__sr.slice());
  }
  // Mikrofon w teorii (przykłady)
  await go("#/lesson/" + lid);
  const tm = $q("#content .speak.mic");
  if (tm) {
    window.__srSay = tm.dataset.pr;
    tm.click(); await sleep(600);
    log("theory mic", html(tm.closest(".ex")));
  } else log("theory mic", "none");
  log("sr", window.__sr.slice());
  log("listeners end", snap());
  EventTarget.prototype.addEventListener = add0; EventTarget.prototype.removeEventListener = rm0;
  return LOG;
})
