(async () => {
  const blobs = [];
  const oc = URL.createObjectURL;
  URL.createObjectURL = (b) => { blobs.push(b); return oc.call(URL, b); };
  const downloads = [];
  const ac = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.download) { downloads.push(this.download); return; } return ac.call(this); };
  await go("#/kolejnosc/kopia");
  log("order page", html(content()));
  // Pobierz kopię
  $q('#content [data-backup="download"]').click(); await sleep(100);
  const fileText = blobs.length ? await blobs[0].text() : "";
  log("download", downloads);
  log("backup file", fileText);
  log("backup ls", lsGet("backup"));
  log("after download", html($q("#kopia")));
  const pick = async (text, name = "kopia.json") => {
    const input = $q('#kopia input[type=file]');
    const dt = new DataTransfer(); dt.items.add(new File([text], name, { type: "application/json" }));
    window.__fileText = text;
    window.FileReader = class { readAsText() { setTimeout(() => { this.result = window.__fileText; this.onload && this.onload(); }, 5); } };
    input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(300);
    return html($q("#kopia .backup-panel"));
  };
  log("bad json", await pick("{nie json"));
  log("other app", await pick(JSON.stringify({ app: "x", version: 1, data: {} })));
  log("newer", await pick(JSON.stringify({ app: "angielski", version: 2, data: {} })));
  log("corrupt", await pick(JSON.stringify({ app: "angielski", version: 1, data: { "eng-scores": { a: { correct: 1, total: 0 } } } })));
  log("empty", await pick(JSON.stringify({ app: "angielski", version: 1, date: "2026-10-01T12:00:00Z", data: { "eng-theme": "light" } })));
  $q('#kopia [data-act="cancel"]').click(); await sleep(50);
  // Kopia z innego urządzenia: łączenie
  const other = {
    app: "angielski", version: 1, date: "2026-11-10T08:30:00.000Z", data: {
      "eng-done": { "to-be": true, "past-continuous": true, "will-future": true },
      "eng-scores": { "to-be": { correct: 5, total: 5 }, "articles-basics::test": { correct: 1, total: 10 }, "x::p0": { correct: 3, total: 4 } },
      "eng-known": { "lesson:to-be": { tired: true } },
      "eng-mistakes": { "to-be~e~6hvixb": { box: 3, due: "2026-11-30", wrong: 1, lastSeen: "2026-11-19T00:00:00.000Z" } },
      "eng-srs": { hello: { box: 2, due: "2026-11-22", deck: "lesson:to-be", first: "2026-11-01", lastSeen: "2026-11-20T23:00:00.000Z" } },
      "eng-activity": { "2026-11-21": { t: 30, ok: 1, w: 0 }, "2026-09-01": { t: 3, ok: 3 } },
      "eng-goal": 50, "eng-theme": "light", "eng-levels": ["A1"], "eng-backup": { last: "x" }, "eng-goalDay": "2026-11-21",
    },
  };
  log("preview", await pick(JSON.stringify(other)));
  $q('#kopia [data-act="merge"]').click(); await sleep(400);
  log("merged page", html(content()));
  log("merged ls", window.__lsDump());
  log("theme after merge", document.documentElement.dataset.theme || "");
  await pick(JSON.stringify(other));
  $q('#kopia [data-act="replace"]').click(); await sleep(400);
  log("replaced page", html($q("#kopia")));
  log("replaced ls", window.__lsDump());
  log("theme after replace", document.documentElement.dataset.theme || "");
  await go("#/");
  log("home", html(content()));
  return LOG;
})
