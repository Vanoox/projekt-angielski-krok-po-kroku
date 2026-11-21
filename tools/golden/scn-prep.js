(async () => {
  const E = window.__ENG, T = [...E.TASKS.entries()];
  const lessonIds = [...new Set(T.filter(([, v]) => v.lesson).map(([, v]) => v.lesson.id))];
  const done = Object.fromEntries(lessonIds.slice(0, 14).map((id) => [id, true]));
  const pick = (pred) => { const e = T.find(([k, v]) => pred(k, v)); return e && e[0]; };
  const L = (i) => lessonIds[i];
  const mk = [
    pick((k, v) => v.lesson.id === L(0) && v.src === "e"),
    pick((k, v) => v.lesson.id === L(1) && v.src === "p0"),
    pick((k, v) => v.lesson.id === L(2) && v.src === "t"),
    pick((k, v) => v.lesson.id === L(3) && v.src === "d"),
    pick((k, v) => v.lesson.id === L(4) && v.src === "f"),
    pick((k) => k.startsWith("read~")),
    pick((k) => k.startsWith("dlg~")),
    pick((k, v) => v.lesson.id === L(6) && v.src === "p1"),
    pick((k, v) => v.lesson.id === L(8) && v.src === "e"),
    pick((k, v) => v.lesson.id === L(10) && v.src === "t"),
  ];
  const dues = ["2026-11-21", "2026-11-20", "2026-11-21", "2026-11-25", "2026-11-19", "2026-11-21", "2026-12-01", "2026-11-18", "2026-11-23", "2026-11-21"];
  const mistakes = {};
  mk.forEach((k, i) => { if (k) mistakes[k] = { box: 1 + (i % 4), due: dues[i], wrong: 1 + (i % 3), lastSeen: `2026-11-${String(10 + i).padStart(2, "0")}T09:00:00.000Z` }; });
  mistakes["odm~go~past-simple~she~neg"] = { box: 1, due: "2026-11-21", wrong: 2, lastSeen: "2026-11-20T09:00:00.000Z" }; // może nie istnieć – wtedy pomijany
  // Słówka z lekcji 0–3
  const strip = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const vocabOf = (id) => { const l = window.LESSONS.find((x) => x.id === id); const p = (window.PRACTICE || {})[id] || {}; return ((p.vocab || l.vocab || {}).items || []); };
  const srs = {};
  let n = 0;
  for (let i = 0; i < 4; i++) for (const w of vocabOf(L(i)).slice(0, 4)) {
    const k = strip(w.en).toLowerCase();
    if (srs[k]) continue;
    const box = 1 + (n % 6);
    srs[k] = { box, due: ["2026-11-21", "2026-11-19", "2026-11-28", "2026-11-22", "2026-12-20", "2026-11-21"][n % 6], deck: "lesson:" + L(i), first: n % 5 === 0 ? "2026-11-21" : "2026-11-0" + (1 + (n % 9)), lastSeen: "2026-11-1" + (n % 10) + "T08:00:00.000Z" };
    n++;
  }
  const known = { ["lesson:" + L(0)]: Object.fromEntries(vocabOf(L(0)).slice(4, 7).map((w) => [w.en, true])) };
  if (window.VOCAB && window.VOCAB[0]) {
    const items = (window.VOCAB[0].groups || []).flatMap((g) => g.items || []);
    known["vocab:" + window.VOCAB[0].id] = Object.fromEntries(items.slice(0, 3).map((w) => [w.en, true]));
  }
  const activity = {};
  const d0 = new Date(2026, 9, 1);
  for (let i = 0; i < 51; i++) {
    const d = new Date(d0); d.setDate(d0.getDate() + i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (i % 7 === 3 || i % 11 === 5) continue;
    activity[k] = { t: (i * 7) % 40, ok: (i * 5) % 30 % ((i * 7) % 40 || 1), w: i % 9 };
    if (i < 6) activity[k].a = 1;
  }
  for (const k of ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"]) activity[k] = { t: 12, ok: 9, w: 4 };
  activity["2026-11-21"] = { t: 7, ok: 5, w: 3 };
  const cp = (window.CHECKPOINTS || [])[0];
  const scores = {
    [L(0)]: { correct: 4, total: 5 }, [L(0) + "::p0"]: { correct: 8, total: 10 }, [L(1) + "::test"]: { correct: 6, total: 10 },
    [L(0) + "::err"]: { correct: 5, total: 8 }, [L(0) + "::dict"]: { correct: 3, total: 6 }, [L(2)]: { correct: 2, total: 5 },
    "test-level:A1": { correct: 17, total: 20 }, odmiana: { correct: 7, total: 10 },
  };
  if (cp) scores["checkpoint:" + cp.id] = { correct: 9, total: 10 };
  if (E.CHATS[0]) scores["chat:" + E.CHATS[0].id] = { correct: 5, total: 7 };
  if (E.READING[0]) scores["read:" + E.READING[0].id] = { correct: 3, total: 4 };
  if (E.DIALOGUES[0]) scores["dlg:" + E.DIALOGUES[0].id] = { correct: 2, total: 4 };
  return {
    state: {
      "eng-done": done, "eng-scores": scores, "eng-levels": ["A1", "A2", "B1", "B2"], "eng-showPl": true, "eng-known": known,
      "eng-mistakes": mistakes, "eng-srs": srs, "eng-srsNew": 10, "eng-activity": activity, "eng-goal": 20,
      "eng-voice": { accent: "US", voice: "", rate: 1 }, "eng-backup": { last: "2026-11-01T10:00:00.000Z", since: "2026-11-01T10:00:00.000Z", count: 3 },
      "eng-theme": "dark",
    },
    ids: {
      lessons: lessonIds, reading: E.READING.map((r) => r.id), dialogues: E.DIALOGUES.map((d) => d.id), chats: E.CHATS.map((c) => c.id),
      checkpoints: (window.CHECKPOINTS || []).map((c) => c.id), vocab: (window.VOCAB || []).map((v) => v.id),
    },
  };
})
