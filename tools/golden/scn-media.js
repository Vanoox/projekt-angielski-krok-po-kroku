(async () => {
  const E = window.__ENG;
  // Dialog: odtwórz całość
  await go("#/dialogi/" + E.DIALOGUES[0].id);
  log("dlg page", html(content()));
  const playAllBtn = $$("#content button").find((b) => /odtwórz|posłuchaj całego|całość/i.test(b.textContent));
  if (playAllBtn) { playAllBtn.click(); await sleep(3000); }
  log("dlg spoken", window.__spoken.slice());
  log("dlg q", await playAll(content()));
  log("dlg after", html(content()).length);
  // Przejście na inną stronę w trakcie czytania
  if (playAllBtn) { const b2 = $$("#content button").find((b) => /odtwórz|posłuchaj całego|całość/i.test(b.textContent)); if (b2) b2.click(); await sleep(100); }
  await go("#/czytanki/" + E.READING[1].id);
  const n0 = window.__spoken.length; await sleep(1000); log("stopped after nav", window.__spoken.length - n0);
  log("rd page", html(content()));
  const w = $q("#content .rd-w, #content [data-w]"); if (w) { w.click(); await sleep(200); log("rd word pop", html($q(".rd-pop, .rd-popup, [role=dialog]"))); }
  const add = $q(".rd-add, [data-add]"); if (add) { add.click(); await sleep(100); log("rd srs", lsGet("srs")); }
  log("rd q", await playAll(content()));
  log("rd result", $$("#content .result-slot").map(html));
  // Rozmowa: klawisze 1–3
  await go("#/rozmowy/" + E.CHATS[0].id);
  for (let k = 0; k < 30; k++) {
    if ($q("#content .ch-summary")) break;
    const opts = $$("#content .ch-opt:not(:disabled)");
    if (!opts.length) { await sleep(300); continue; }
    keyOn(document.body, String(1 + (k % opts.length)));
    await sleep(400);
  }
  log("chat end", html(content()));
  log("chat score", lsGet("scores"));
  await go("#/");
  keyOn(document.body, "1"); await sleep(100); log("keys after leave", location.hash);
  // Wymowa (brak rozpoznawania mowy)
  const lid = E.DIALOGUES[0].lesson.id;
  await go(`#/lesson/${lid}/speaking`);
  log("speaking", html(content()));
  return LOG;
})
