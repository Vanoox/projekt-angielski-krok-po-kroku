(async () => {
  const ids = [...new Set([...window.__ENG.TASKS.values()].filter((t) => t.lesson).map((t) => t.lesson.id))];
  const startIfNeeded = async () => { if (!$q("#content .exercise")) { const b = $q("#content .exercises .btn.primary, #content button.btn.primary"); if (b) { b.click(); await sleep(200); } } };
  const grab = (tag) => {
    log(tag + " score", $$("#content .score").map((e) => e.textContent));
    log(tag + " result", $$("#content .result-slot").map(html));
  };
  for (const i of [5, 20, 45, 1]) {
    await go(`#/lesson/${ids[i]}/practice`);
    await startIfNeeded();
    log("practice " + ids[i], await playAll(content()));
    grab("practice " + ids[i]);
  }
  for (const i of [5, 30]) {
    await go(`#/lesson/${ids[i]}/find`);
    await startIfNeeded();
    log("find " + ids[i], await playAll(content()));
    grab("find " + ids[i]);
  }
  await go(`#/lesson/${ids[0]}/dictation`);
  await startIfNeeded();
  log("dict", await playAll(content()));
  grab("dict");
  for (const i of [5, 40]) {
    await go(`#/lesson/${ids[i]}/test`);
    await startIfNeeded();
    const cards = $$("#content .exercise");
    for (let k = 0; k < cards.length; k++) if (k % 4 !== 3) await playCard(cards[k], k);
    const ca = $q("#content .check-all"); if (ca) ca.click();
    await sleep(100);
    log("test " + ids[i] + " fb", $$("#content .exercise .fb").map(html));
    grab("test " + ids[i]);
    // Samoocena / retry
    const r = $q("#content .retry"); if (r) { r.click(); await sleep(100); log("test retry", html($q("#content .ex-list")).length); }
  }
  log("goal mini", html($q("#goalTop")));
  return LOG;
})
