(async () => {
  const ids = [...new Set([...window.__ENG.TASKS.values()].filter((t) => t.lesson).map((t) => t.lesson.id))];
  const snap = (tag) => log(tag, { title: document.title, content: html(content()), nav: html($q("#nav")).length, filter: html($q("#levelFilter")), goal: html($q("#goalTop")) });
  await go(`#/lesson/${ids[16]}`);
  snap("lesson");
  const done = $q("#doneBtn"); log("done btn", !!done);
  if (done) { done.click(); await sleep(100); snap("lesson done"); }
  const pl = $q("#content input[type=checkbox]"); if (pl) { pl.click(); await sleep(50); snap("lesson pl toggle"); }
  for (const a of $$("#content .tabs a")) { a.click(); await sleep(300); log("tab " + location.hash, html(content()).length); }
  await go("#/");
  snap("home");
  await go("#/kolejnosc/cel");
  const chip = $$("#content [data-goal]")[0]; if (chip) { chip.click(); await sleep(100); }
  snap("goal changed");
  log("ls goal", lsGet("goal"));
  // Filtr poziomów w menu
  const lf = $$("#levelFilter button, #levelFilter input"); log("level filter n", lf.length);
  if (lf[1]) { lf[1].click(); await sleep(100); log("levels", lsGet("levels")); log("nav", html($q("#nav")).length); lf[1].click(); await sleep(100); }
  // Motyw
  $q("#themeBtn").click(); await sleep(50); log("theme", [document.documentElement.dataset.theme, localStorage.getItem("eng-theme")]);
  // Wyszukiwanie
  const s = $q("#search"); setVal(s, "past simple"); await sleep(600); log("search hash", location.hash); snap("search");
  keyOn(document.body, "/"); await sleep(50); log("focus", document.activeElement && document.activeElement.id);
  await go("#/czasy");
  const row = $q("#content [aria-expanded]"); if (row) { row.click(); await sleep(200); }
  snap("timeline open");
  await go("#/odmiana/go");
  snap("conj go");
  await go("#/vocab/" + (window.VOCAB[2] || window.VOCAB[0]).id);
  snap("vocab topic");
  const fcBtn = $$("#content button").find((b) => /fiszk/i.test(b.textContent)); if (fcBtn) { fcBtn.click(); await sleep(200); snap("vocab flashcards"); }
  // Okienko ustawień głosu
  $q("#voiceBtn").click(); await sleep(200);
  const dlg = $q("dialog[open], .voice-dlg, [role=dialog]"); log("voice dialog", dlg ? html(dlg) : null);
  const acc = $q('[data-accent="GB"]'); if (acc) { acc.click(); await sleep(100); log("voice cfg", lsGet("voice")); }
  const tr = $q("[data-try]"); if (tr) { tr.click(); await sleep(200); }
  keyOn(document.activeElement || document.body, "Escape"); await sleep(100);
  return LOG;
})
