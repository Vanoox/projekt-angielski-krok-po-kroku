(async () => {
  const cps = (window.CHECKPOINTS || []).map((c) => c.id);
  const deferredRun = async (tag) => {
    const st = $$("#content button.btn.primary").find((b) => !b.classList.contains("check-all")); if (!$q("#content .exercise") && st) { st.click(); await sleep(200); }
    const cards = $$("#content .exercise");
    for (let k = 0; k < cards.length; k++) if (k % 5 !== 4) await playCard(cards[k], k);
    const ca = $q("#content .check-all"); if (ca) ca.click();
    await sleep(150);
    log(tag + " fb", $$("#content .exercise .fb").map(html));
    log(tag + " result", $$("#content .result-slot").map(html));
    log(tag + " page", html(content()).length);
  };
  await go("#/sprawdzian/" + cps[0]); await deferredRun("cp0");
  await go("#/sprawdzian/" + cps[5]); await deferredRun("cp5");
  await go("#/test-poziomu/A1"); await deferredRun("ltA1");
  log("ltA1 report", html(content()));
  await go("#/test-poziomu/B1"); await deferredRun("ltB1");
  await go("#/tests");
  log("tests page", html(content()));
  // Trener odmiany: ćwiczenie
  await go("#/odmiana");
  const drillBtn = $q("#cjStart");
  if (drillBtn) { drillBtn.click(); await sleep(200); }
  const inputs = $$("#content .cj-drill input, #content .exercise input");
  log("conj inputs", inputs.length);
  log("conj play", await playAll(content()));
  log("conj result", $$("#content .result-slot").map(html));
  const verb = $q("#content input[list], #content input[type=search], #content .cj-verb input");
  if (verb) { setVal(verb, "write"); verb.dispatchEvent(new Event("change", { bubbles: true })); await sleep(200); log("conj table", html($q("#content .cj-table, #content .cj-forms")) || html(content()).length); }
  return LOG;
})
