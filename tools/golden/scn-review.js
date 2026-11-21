(async () => {
  // Trening mieszany
  await go("#/practice");
  log("practice page", html(content()));
  const srcChips = $$('#content [data-f="src"] .chip');
  for (const ch of srcChips.slice(0, 3)) {
    ch.click(); await sleep(50);
    const st = $q("#pStart"); if (st) { st.click(); await sleep(200); }
    log("practice " + ch.dataset.v, await playAll(content(), 25));
    log("practice result", $$("#content .result-slot").map(html));
  }
  // Moje błędy
  await go("#/bledy");
  log("mistakes page", html(content()));
  const run = $q('#content [data-mrun="due"]') || $q("#content [data-mrun]");
  if (run) { run.click(); await sleep(200); }
  log("mistakes play", await playAll(content()));
  log("mistakes result", $$("#content .result-slot").map(html));
  log("mistakes ls", lsGet("mistakes"));
  // Słówka na dziś
  await go("#/slowka");
  log("words page", html(content()));
  const wr = $q("#content [data-wrun]"); if (wr) { wr.click(); await sleep(200); }
  for (let k = 0; k < 40; k++) {
    const nx = $q("#content .fc-next"); if (nx) { nx.click(); await sleep(30); continue; }
    const fc = $q("#content .flashcard"); if (!fc) break;
    fc.click(); await sleep(20);
    const b = $q(`#content .fc-actions [data-r="${k % 3}"]`); if (!b) break;
    b.click(); await sleep(30);
  }
  log("words end", html(content()));
  log("srs", lsGet("srs"));
  log("known", lsGet("known"));
  await go("#/");
  log("home after", html(content()));
  return LOG;
})
