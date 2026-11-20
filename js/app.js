(function () {
  "use strict";

  const LEVELS = ["A1", "A2", "B1", "B2"];
  // Ikony liniowe 24×24 (stroke = currentColor). Większość przepisana z Feather Icons (MIT, © 2013–2017 Cole Bemis)
  // i Lucide (ISC, © Lucide Contributors); "cards", "slow" – własne. Użycie: icon("check") → <svg class="ic">.
  const ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    cards: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
    test: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    repeat: '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    medal: '<circle cx="12" cy="8" r="6"/><path d="M8.2 12.6 7 22l5-3 5 3-1.2-9.4"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    map: '<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4zM8 2v16M16 6v16"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    slow: '<path d="M2 20h14.5a5.5 5.5 0 0 0 5.5-5.5V9"/><path d="M10 20a7 7 0 1 1 7-7"/><path d="M10 16a3 3 0 1 1 3-3"/><path d="M22 9l-1-4M22 9l1.6-3.6"/>',
    rotate: '<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    archive: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  };
  const icon = (name, cls) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  const LEVEL_INFO = {
    A1: { name: "Początkujący", desc: "Podstawy: to be, proste czasy, liczba mnoga, zaimki, przyimki." },
    A2: { name: "Podstawowy", desc: "Codzienna komunikacja: przeszłość, przyszłość, stopniowanie, modalne." },
    B1: { name: "Średnio zaawansowany", desc: "Strona bierna, mowa zależna, tryby warunkowe, czasy perfect." },
    B2: { name: "Wyższy średnio zaawansowany", desc: "Dedukcja, mixed conditionals, wish, konstrukcje zaawansowane." },
  };
  const CATEGORIES = [
    "Podstawy", "Czasy", "Formy czasownika", "Rzeczowniki i określniki", "Zaimki",
    "Przymiotniki i przysłówki", "Przyimki", "Czasowniki modalne", "Tryby warunkowe",
    "Konstrukcje zdaniowe", "Słownictwo i łączniki",
  ];
  const TYPE_LABEL = { choice: "wybór", gap: "luka", write: "pisanie zdania", order: "układanie zdania", dictation: "dyktando" };

  // ---------- Dane ----------
  const PRACTICE = window.PRACTICE || {};
  const raw = (window.LESSONS || []).map((l, i) => {
    const p = PRACTICE[l.id] || {};
    return { ...l, vocab: p.vocab || l.vocab || null, practice: p.practice || l.practice || [], test: p.test || l.test || [], requires: p.requires || l.requires || [], _i: i };
  });
  // Rekomendowana ścieżka: kolejność z data/lessons/order.json (kolejność nauki – każda lekcja
  // korzysta tylko z tego, co było wcześniej). Poziom tylko jako zabezpieczenie.
  const PATH = raw.slice().sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
  const BY_ID = Object.fromEntries(PATH.map((l) => [l.id, l]));
  // Sprawdziany powtórkowe (data/checkpoints.js): każdy obejmuje lekcje od poprzedniego sprawdzianu do `after`.
  const CHECKPOINTS = [];
  (window.CHECKPOINTS || []).filter((c) => BY_ID[c.after])
    .sort((a, b) => PATH.indexOf(BY_ID[a.after]) - PATH.indexOf(BY_ID[b.after]))
    .forEach((c) => {
      const end = PATH.indexOf(BY_ID[c.after]);
      const prev = CHECKPOINTS[CHECKPOINTS.length - 1];
      const start = prev ? PATH.indexOf(BY_ID[prev.after]) + 1 : 0;
      if (end < start) return;
      CHECKPOINTS.push({ ...c, n: CHECKPOINTS.length + 1, lessons: PATH.slice(start, end + 1), prior: PATH.slice(0, start), level: PATH[end].level });
    });
  const CP_BY_ID = Object.fromEntries(CHECKPOINTS.map((c) => [c.id, c]));
  const CP_AFTER = Object.fromEntries(CHECKPOINTS.map((c) => [c.after, c]));
  const lessonNo = (l) => PATH.indexOf(l) + 1;
  const VOCAB =(window.VOCAB || []).slice().sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
  const VOCAB_BY_ID = Object.fromEntries(VOCAB.map((t) => [t.id, t]));
  const vocabItems = (t) => (t.groups || []).flatMap((g) => g.items || []);

  const stripTags = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const SEARCH_TEXT = Object.fromEntries(PATH.map((l) => [l.id, stripTags(JSON.stringify({ s: l.sections, v: l.vocab, t: l.summary })).toLowerCase()]));
  const HEAD_TEXT = Object.fromEntries(PATH.map((l) => [l.id, (l.title + " " + l.titlePl + " " + l.id.replace(/-/g, " ")).toLowerCase()]));
  const practiceCount = (l) => l.practice.reduce((s, p) => s + (p.items || []).length, 0);
  const allTasks = (l) => (l.exercises || []).length + practiceCount(l) + l.test.length;

  // Rejestr zadań do „Moich błędów”. Zadania nie mają id, więc klucz = id lekcji ~ źródło
  // (e = szybki sprawdzian, p0, p1… = zestawy ćwiczeń, t = test) ~ skrót treści (typ, pytanie, opcje, odpowiedzi).
  // Zmiana treści zadania w data/ daje nowy klucz – stary wpis w eng-mistakes jest wtedy po prostu pomijany.
  const hashStr = (s) => { let x = 0x811c9dc5; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193); } return (x >>> 0).toString(36); };
  // Dyktando: zdania z przykładów w teorii lekcji (sekcje „examples”, pole en). Pomijamy zdania, których nie da się
  // jednoznacznie zapisać ze słuchu: z liczbami i walutą (25 / twenty-five), wariantami „A / B”, nawiasami, strzałkami,
  // wielokropkiem, cudzysłowem, oraz bardzo krótkie (< 3 słów) i bardzo długie (> 16 słów).
  const DICT_SKIP = /[\/=→←[\]()…_;:"“”„&<>\d£€$%+*#@]|\.\.|\s-\s/;
  function dictText(html) {
    const t = String(html || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").replace(/^[–—]\s*/, "").trim();
    if (!t || DICT_SKIP.test(t) || !/[.?!]$/.test(t)) return "";
    const n = t.split(" ").length;
    return n >= 3 && n <= 16 ? t : "";
  }
  PATH.forEach((l) => {
    const seen = new Set();
    l.dict = [];
    l.sections.filter((s) => s.type === "examples").forEach((s) => (s.items || []).forEach((e) => {
      const t = dictText(e.en), k = t.toLowerCase();
      if (!t || seen.has(k)) return;
      seen.add(k);
      l.dict.push({ type: "dictation", say: t, answers: [t], pl: e.pl || "", explain: e.pl ? `<span class="d-pl">Po polsku: ${e.pl}</span>` : "" });
    }));
  });
  const TASKS = new Map(); // klucz → { ex, lesson, src, instr }
  const KEY_OF = new WeakMap(); // obiekt zadania → klucz
  PATH.forEach((l) => {
    const srcs = [["e", l.exercises || [], ""], ...l.practice.map((p, i) => ["p" + i, p.items || [], p.instruction || ""]), ["t", l.test, ""], ["d", l.dict, ""]];
    for (const [src, items, instr] of srcs) items.forEach((ex) => {
      const base = `${l.id}~${src}~${hashStr([ex.type, ex.q || "", (ex.options || []).join("|"), JSON.stringify(ex.answers ?? ex.answer ?? "")].join("#"))}`;
      let k = base, n = 2;
      while (TASKS.has(k)) k = `${base}~${n++}`; // identyczne zadanie w tym samym zestawie
      TASKS.set(k, { ex, lesson: l, src, instr });
      KEY_OF.set(ex, k);
    });
  });
  // Kopia zadania z poleceniem (zestawy ćwiczeń, trening, sprawdziany) – zachowuje klucz oryginału.
  const withTask = (ex, task) => { const c = { ...ex, task }; if (KEY_OF.has(ex)) KEY_OF.set(c, KEY_OF.get(ex)); return c; };

  // Rejestr słówek do „Słówek na dziś”. Talia = słownictwo lekcji („lesson:<id>”) albo dział („vocab:<id>”) –
  // te same klucze co w state.known. Jedna karta na słowo: klucz = angielskie słowo małymi literami
  // (to samo słowo bywa w kilku lekcjach i działach – uczymy się go raz, a nie w każdej talii osobno).
  const wordKey = (en) => stripTags(en).toLowerCase();
  const DECKS = [
    ...PATH.filter((l) => l.vocab && (l.vocab.items || []).length).map((l) => ({ id: "lesson:" + l.id, items: l.vocab.items, title: `${lessonNo(l)}. ${l.title}`, level: l.level, href: `#/lesson/${l.id}/vocab`, lesson: l })),
    ...VOCAB.map((t) => ({ id: "vocab:" + t.id, items: vocabItems(t), title: `${t.icon || "📘"} ${t.titlePl}`, level: t.level, href: `#/vocab/${t.id}` })),
  ];
  const WORDS = new Map(); // klucz słowa → [{ deck, w }] – wszystkie miejsca, w których słowo występuje
  DECKS.forEach((d) => {
    const keys = new Set();
    d.items.forEach((w) => { const k = wordKey(w.en); if (!k) return; if (!WORDS.has(k)) WORDS.set(k, []); WORDS.get(k).push({ deck: d, w }); keys.add(k); });
    d.keys = [...keys];
  });

  // ---------- Stan (localStorage) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("eng-" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("eng-" + k, JSON.stringify(v)); } catch (e) {} },
  };
  // Cel dzienny (eng-goal): zadania + słówka w fiszkach dziennie (patrz „Cel dzienny” niżej).
  const GOAL_CHOICES = [10, 20, 30, 50], GOAL_DEFAULT = 20;
  // Ponownie wywoływane po wczytaniu kopii postępu (Object.assign(state, loadState())).
  const loadState = () => ({
    done: store.get("done", {}),
    scores: store.get("scores", {}),
    levels: store.get("levels", LEVELS.slice()),
    showPl: store.get("showPl", true),
    known: store.get("known", {}),
    mistakes: store.get("mistakes", {}),
    srs: store.get("srs", {}),
    srsNew: store.get("srsNew", 10),
    activity: store.get("activity", {}),
    goal: ((g) => (GOAL_CHOICES.includes(g) ? g : GOAL_DEFAULT))(store.get("goal", GOAL_DEFAULT)),
  });
  const state = loadState();
  const save = () => { for (const k of Object.keys(state)) store.set(k, state[k]); };
  const saveScore = (key, correct, total) => {
    const prev = state.scores[key];
    if (!prev || correct / total >= prev.correct / prev.total) state.scores[key] = { correct, total };
    save();
    syncNavState();
  };

  // ---------- Moje błędy: system pudełek (eng-mistakes) ----------
  // Wpis: { box: 1–4, due: "RRRR-MM-DD", wrong: liczba błędów, lastSeen: ISO }.
  // Błąd (gdziekolwiek) → pudełko 1, powtórka jutro. Dobra odpowiedź, gdy zadanie jest „na dziś”:
  // pudełko 1 → 2 (za 3 dni) → 3 (za 7 dni) → 4 (za 14 dni) → zadanie opanowane, znika z listy.
  // Dobra odpowiedź przed terminem niczego nie zmienia (żeby nie przeskakiwać pudełek tego samego dnia).
  const BOX_DAYS = [1, 3, 7, 14];
  const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = () => dayStr(new Date());
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dayStr(d); };
  const isDue = (m) => m.due <= today();
  const mistakeList = () => Object.entries(state.mistakes).filter(([k]) => TASKS.has(k)).map(([key, m]) => ({ key, m, ...TASKS.get(key) }));
  const mistakesDue = () => mistakeList().filter((x) => isDue(x.m)).length;
  function recordResult(key, ok) {
    const prev = state.mistakes[key];
    if (!ok) state.mistakes[key] = { box: 1, due: addDays(BOX_DAYS[0]), wrong: ((prev && prev.wrong) || 0) + 1, lastSeen: new Date().toISOString() };
    else if (!prev || !isDue(prev)) return;
    else if (prev.box >= BOX_DAYS.length) delete state.mistakes[key];
    else state.mistakes[key] = { ...prev, box: prev.box + 1, due: addDays(BOX_DAYS[prev.box]), lastSeen: new Date().toISOString() };
    store.set("mistakes", state.mistakes);
  }

  // ---------- Dziennik nauki (eng-activity) ----------
  // { "RRRR-MM-DD" (data lokalna): { t: zadania, ok: w tym poprawne, w: ocenione słówka, a?: 1 } }.
  // Zadania: każda odpowiedź w renderExercises (lekcje, zestawy, testy, trening, sprawdziany, Moje błędy,
  // quizy ze słówek); słówka: każda ocena fiszki (rateWord). a: 1 = dzień przybliżony z historii (migrateActivity).
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const dayTotal = (e) => (e ? (e.t || 0) + (e.w || 0) : 0);
  function logActivity(d) {
    const k = today(), e = { ...(state.activity[k] || {}) }, before = dayTotal(e);
    for (const [f, n] of Object.entries(d)) e[f] = (e[f] || 0) + n;
    delete e.a; // od teraz dzień ma prawdziwe dane (przybliżenie było dolnym oszacowaniem, więc tylko dopisujemy)
    state.activity[k] = e;
    store.set("activity", state.activity);
    // Cel dzienny: komunikat „Cel na dziś zrobiony” tylko w chwili przekroczenia celu i najwyżej raz dziennie
    // (eng-goalDay = dzień ostatniego komunikatu; np. podniesienie celu po jego zrobieniu nie pokaże go drugi raz).
    const hit = before < state.goal && dayTotal(e) >= state.goal && store.get("goalDay", "") !== k;
    if (hit) store.set("goalDay", k);
    syncGoal(hit);
  }
  // Historia sprzed dziennika (raz – gdy eng-activity jeszcze nie ma, także po wczytaniu starej kopii): PRZYBLIŻENIE
  // z lastSeen w eng-mistakes (1 zadanie w dniu ostatniej odpowiedzi; poprawne, gdy pudełko > 1) i eng-srs
  // (1 słówko w dniu ostatniej oceny). Wcześniejsze odpowiedzi nadpisał nowszy lastSeen, więc dni i liczby są zaniżone.
  function migrateActivity(s) {
    if (store.get("activity", null) !== null) return;
    const act = {};
    const add = (iso, f) => {
      const d = new Date(iso);
      if (!iso || isNaN(d)) return;
      const k = dayStr(d), e = act[k] || (act[k] = { a: 1 });
      for (const [x, n] of Object.entries(f)) e[x] = (e[x] || 0) + n;
    };
    Object.values(s.mistakes || {}).forEach((m) => isObj(m) && add(m.lastSeen, { t: 1, ok: m.box > 1 ? 1 : 0 }));
    Object.values(s.srs || {}).forEach((m) => isObj(m) && add(m.lastSeen, { w: 1 }));
    s.activity = act;
    store.set("activity", act);
  }
  const dayDate = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const shiftDay = (k, n) => { const d = dayDate(k); d.setDate(d.getDate() + n); return dayStr(d); };
  // Seria = dni z rzędu z choć 1 zadaniem albo słówkiem, bez dni przerwy. Bieżąca seria kończy się dziś,
  // a jeśli dziś jeszcze nic nie zrobiono – wczoraj (seria trwa do końca dnia, w którym można ją przedłużyć).
  function streakInfo() {
    const act = state.activity, on = (k) => dayTotal(act[k]) > 0;
    const days = Object.keys(act).filter((k) => DAY_RE.test(k) && on(k)).sort();
    let best = 0, run = 0, prev = "";
    for (const k of days) { run = prev && shiftDay(prev, 1) === k ? run + 1 : 1; best = Math.max(best, run); prev = k; }
    const t = today(), todayDone = on(t);
    let cur = 0;
    for (let k = todayDone ? t : shiftDay(t, -1); on(k); k = shiftDay(k, -1)) cur++;
    return { current: cur, best, days: days.length, todayDone };
  }
  const dni = (n) => `${n} ${n === 1 ? "dzień" : "dni"}`;
  // Kalendarz jak na GitHubie: kolumny = tygodnie (pn–nd), ostatnie ACT_WEEKS tygodni + bieżący.
  // Odcień wg liczby zadań + słówek w dniu (ACT_STEPS = dolne progi poziomów 1–4).
  const ACT_WEEKS = 16, ACT_STEPS = [1, 10, 25, 50];
  const actLevel = (n) => ACT_STEPS.reduce((lv, s, i) => (n >= s ? i + 1 : lv), 0);
  const MONTHS_SHORT = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  function activityHtml() {
    const s = streakInfo(), t = today(), now = dayDate(t);
    const start = new Date(now);
    start.setDate(start.getDate() - ((now.getDay() + 6) % 7) - ACT_WEEKS * 7); // poniedziałek ACT_WEEKS tygodni temu
    const cols = [`<span class="act-m"></span>` + ["pn", "", "śr", "", "pt", "", "nd"].map((d) => `<span class="act-d">${d}</span>`).join("")];
    let lastMonthCol = -9;
    for (let w = 0; w <= ACT_WEEKS; w++) {
      const cells = [];
      let label = "";
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + w * 7 + i);
        const k = dayStr(d);
        if (d.getDate() === 1) label = MONTHS_SHORT[d.getMonth()];
        if (k > t) { cells.push(`<span class="act-c act-future"></span>`); continue; }
        const e = state.activity[k], n = dayTotal(e);
        const date = d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
        const info = n ? [e.t ? `${zadan(e.t)} (dobrze: ${e.ok || 0})` : "", e.w ? `${slowek(e.w)} w fiszkach` : ""].filter(Boolean).join(", ") + (e.a ? " – przybliżone z historii" : "") : "bez nauki";
        cells.push(`<span class="act-c act-l${actLevel(n)}${k === t ? " act-today" : ""}" title="${date}: ${info}"></span>`);
      }
      // Nazwa miesiąca nad tygodniem z 1. dniem miesiąca; nad pierwszym tygodniem bez 1. dnia – jego miesiąc, o ile
      // do końca miesiąca zostało ponad tydzień (inaczej nazwy by na siebie nachodziły).
      if (!label && w === 0 && start.getDate() <= 22) label = MONTHS_SHORT[start.getMonth()];
      if (label && w - lastMonthCol < 3) label = "";
      if (label) lastMonthCol = w;
      cols.push(`<span class="act-m">${label}</span>` + cells.join(""));
    }
    const hint = !s.days ? "Zrób pierwsze zadanie albo oceń słówko w fiszkach – tu zobaczysz swoje dni nauki."
      : s.todayDone ? "Dziś już się uczysz – seria trwa."
      : s.current ? `Zrób dziś choć jedno zadanie albo słówko, żeby nie przerwać serii.`
      : "Zrób dziś choć jedno zadanie albo słówko i zacznij nową serię.";
    return `<section class="card activity" aria-label="Dziennik nauki">
      <div class="act-main">
      <div class="act-stats">
        <div class="act-stat act-streak${s.current ? " on" : ""}"><span class="act-ico" aria-hidden="true">${icon("flame")}</span><div><b>${dni(s.current)}</b><span>z rzędu</span></div></div>
        <div class="act-stat"><div><b>${dni(s.best)}</b><span>najdłuższa seria</span></div></div>
        <div class="act-stat"><div><b>${s.days}</b><span>${plural(s.days, "dzień", "dni", "dni")} nauki w sumie</span></div></div>
      </div>
      <p class="act-hint">${hint}</p>
      </div>
      <div class="act-calwrap">
      <div class="act-cal" role="img" aria-label="Kalendarz aktywności z ostatnich ${ACT_WEEKS} tygodni">${cols.map((c) => `<div class="act-col">${c}</div>`).join("")}</div>
      <div class="act-legend" aria-hidden="true">Mniej ${[0, 1, 2, 3, 4].map((l) => `<span class="act-c act-l${l}"></span>`).join("")} Więcej</div>
      </div>
    </section>`;
  }

  // ---------- Cel dzienny (eng-goal) ----------
  // Liczy się to samo co w dzienniku: zadania z odpowiedzią + ocenione słówka w fiszkach (dayTotal z eng-activity).
  // Cel to ustawienie (10/20/30/50, domyślnie 20): trafia do pliku z kopią (jak wszystkie eng-*), ale przy łączeniu
  // kopii zostaje taki, jak na tym urządzeniu (KEEP_LOCAL, jak eng-srsNew); „Zastąp” bierze go z pliku.
  // Widoki: goalHtml() – karta z kółkiem i zmianą celu (Kolejność nauki, strona główna; do wstawienia w „Twój dzień”),
  // .goal-mini – małe kółko „12/20” na każdej stronie: w górnym pasku (#goalTop), a na telefonie (gdzie w pasku brak
  // miejsca) w menu (.nav-goal). Odświeża je syncGoal() po każdym wpisie w dzienniku.
  const goalCount = () => dayTotal(state.activity[today()]);
  const goalRing = (n, g) => {
    const pct = Math.min(100, Math.round((n / g) * 100));
    return `<svg class="goal-ring${n >= g ? " is-done" : ""}" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle class="gr-bg" cx="18" cy="18" r="15"/><circle class="gr-fg" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="${pct} 100" transform="rotate(-90 18 18)"/></svg>`;
  };
  const zadanISlowek = (n) => plural(n, "zadanie lub słówko", "zadania lub słówka", "zadań lub słówek");
  function goalHtml() {
    const n = goalCount(), g = state.goal, left = g - n;
    const msg = left > 0
      ? `${n ? "Jeszcze" : "Zrób dziś"} <b>${left}</b> ${zadanISlowek(left)}. Liczą się wszystkie zadania (lekcje, testy, trening, Moje błędy) i słówka ocenione w fiszkach.`
      : `<b class="goal-ok">${icon("check")} Cel na dziś zrobiony.</b> Możesz uczyć się dalej albo wrócić jutro.`;
    return `<section class="card goal-card" id="cel" aria-label="Cel na dziś">
      <div class="goal-big" role="img" aria-label="Dziś ${n} z ${g}">${goalRing(n, g)}<span class="goal-num"><span><b>${n}</b>/${g}</span></span></div>
      <div class="goal-body">
        <b class="goal-title">Cel na dziś: ${g} ${zadanISlowek(g)}</b>
        <p class="goal-msg">${msg}</p>
        <div class="goal-set"><span>Dzienny cel:</span><div class="chips">${GOAL_CHOICES.map((c) => `<button class="chip ${c === g ? "active" : ""}" type="button" data-goal="${c}" aria-pressed="${c === g}">${c}</button>`).join("")}</div></div>
      </div>
    </section>`;
  }
  let goalMsgTimer = 0;
  function syncGoalMini() {
    const n = goalCount(), g = state.goal, done = n >= g;
    const label = done ? `Cel na dziś zrobiony (${n}/${g})` : `Cel na dziś: ${n}/${g} (zadania i słówka)`;
    document.querySelectorAll(".goal-mini").forEach((el) => {
      el.hidden = false;
      el.classList.toggle("is-done", done);
      el.title = label;
      el.setAttribute("aria-label", label);
      el.querySelector(".gt-ring").innerHTML = goalRing(n, g);
      el.querySelector(".gt-txt").textContent = `${n}/${g}`;
    });
  }
  function syncGoal(celebrate) {
    syncGoalMini();
    const m = $("#goalMsg");
    if (m && celebrate) { // krótki napis pod paskiem, sam znika; bez okna do zamykania
      m.textContent = "Cel na dziś zrobiony!";
      m.classList.add("show");
      clearTimeout(goalMsgTimer);
      goalMsgTimer = setTimeout(() => { m.classList.remove("show"); m.textContent = ""; }, 4000);
    }
    document.querySelectorAll(".goal-card").forEach((el) => { el.outerHTML = goalHtml(); });
  }

  // ---------- Słówka na dziś: pudełka dla słówek (eng-srs) ----------
  // Wpis: { box: 1–6, due: "RRRR-MM-DD", deck: talia, z której słowo trafiło do powtórek,
  //         first: dzień pierwszej oceny (do dziennego limitu nowych słówek), lastSeen: ISO }.
  // Ocena w fiszce: „Nie wiem” → pudełko 1, powtórka jutro (zawsze, także przed terminem).
  // „Trudne” → to samo pudełko, „Wiem” → pudełko wyżej; słówko wraca po 1, 3, 7, 14, 30 albo 60 dniach
  // (pudełko 6 = co 60 dni, słówka nie znikają). „Trudne” i „Wiem” przed terminem niczego nie zmieniają.
  const SRS_DAYS = [1, 3, 7, 14, 30, 60];
  const NEW_CHOICES = [5, 10, 15, 20];
  const SRS_ROUND = 20;
  function rateWord(k, rating, deck) { // rating: 0 = nie wiem, 1 = trudne, 2 = wiem
    logActivity({ w: 1 }); // każda ocena liczy się do dziennika, także przed terminem
    const prev = state.srs[k];
    let box;
    if (rating === 0) box = 1;
    else if (prev && !isDue(prev)) return;
    else box = Math.min((prev ? prev.box : 1) + (rating === 2 ? 1 : 0), SRS_DAYS.length);
    state.srs[k] = { box, due: addDays(SRS_DAYS[box - 1]), deck: (prev && prev.deck) || deck, first: prev ? prev.first || "" : today(), lastSeen: new Date().toISOString() };
    store.set("srs", state.srs);
  }
  // Migracja (przy starcie i po wczytaniu kopii): słówka oznaczone jako „znam” (✓ albo „Wiem” w fiszkach), których
  // nie ma jeszcze w powtórkach, trafiają do pudełka 3. Terminy rozkładamy na 2 tygodnie, żeby nie przyszły naraz.
  // Bez first (nie liczą się do limitu nowych) i bez lastSeen (przy łączeniu kopii wygrywa prawdziwa ocena).
  const knownEntry = (k, deck) => ({ box: 3, due: addDays(1 + (parseInt(hashStr(k), 36) % 14)), deck });
  function migrateKnown(s) {
    if (!isObj(s.srs)) s.srs = {};
    if (!NEW_CHOICES.includes(s.srsNew)) s.srsNew = 10;
    let n = 0;
    for (const [deck, words] of Object.entries(s.known || {})) for (const [en, v] of Object.entries(words || {})) {
      const k = wordKey(en);
      if (v && WORDS.has(k) && !s.srs[k]) { s.srs[k] = knownEntry(k, deck); n++; }
    }
    if (n) store.set("srs", s.srs);
  }
  // Talie w codziennej kolejce: słownictwo przerobionych lekcji oraz lekcje i działy, które uczeń zaczął
  // (ocenił w nich fiszkę albo oznaczył słowo jako znane).
  function activeDecks() {
    const started = new Set(Object.values(state.srs).map((e) => e.deck));
    for (const [d, ws] of Object.entries(state.known)) if (Object.values(ws || {}).some(Boolean)) started.add(d);
    return DECKS.filter((d) => (d.lesson && state.done[d.lesson.id]) || started.has(d.id));
  }
  // Kolejka na dziś: due = słówka z terminem do dziś (najstarsze najpierw), fresh = nowe słówka (do limitu dziennego,
  // po kolei z talii: lekcje w kolejności nauki, potem działy), avail = ile nowych czeka w taliach bez limitu.
  function srsToday() {
    const t = today(), decks = activeDecks();
    const due = Object.keys(state.srs).filter((k) => WORDS.has(k) && state.srs[k].due <= t).sort((a, b) => state.srs[a].due.localeCompare(state.srs[b].due));
    const left = Math.max(0, state.srsNew - Object.values(state.srs).filter((e) => e.first === t).length);
    const fresh = [], seen = new Set();
    let avail = 0;
    for (const d of decks) for (const k of d.keys) if (!state.srs[k] && !seen.has(k)) {
      seen.add(k); avail++;
      if (fresh.length < left) fresh.push({ k, deck: d.id });
    }
    return { due, fresh, avail, decks };
  }
  const wordsDue = () => { const q = srsToday(); return q.due.length + q.fresh.length; };
  // Treść karty: słowo z podanej talii (albo z pierwszej, w której występuje); inne znaczenia z pozostałych talii jako „też:”.
  function wordCard(k, deckId) {
    const occ = WORDS.get(k), main = occ.find((o) => o.deck.id === deckId) || occ[0];
    const also = [...new Set(occ.map((o) => stripTags(o.w.pl)))].filter((p) => p !== stripTags(main.w.pl)).slice(0, 3);
    return { k, w: main.w, deck: main.deck.id, also };
  }
  const cpKey = (c) => "checkpoint:" + c.id;
  const cpPassed = (c) => { const s = state.scores[cpKey(c)]; return !!s && s.correct / s.total >= 0.8; };
  const cpRange = (c) => `${lessonNo(c.lessons[0])}–${lessonNo(c.lessons[c.lessons.length - 1])}`;
  // Test poziomu (#/test-poziomu/A1): wynik w scores pod „test-level:A1”, zaliczenie od 80% = odznaka przy poziomie.
  const ltKey = (lv) => "test-level:" + lv;
  const ltPassed = (lv) => { const s = state.scores[ltKey(lv)]; return !!s && s.correct / s.total >= 0.8; };
  const ltBadge = (lv) => ltPassed(lv) ? `<span class="lt-badge" title="Test poziomu ${lv} zaliczony">${icon("medal")} ${lv} zaliczony</span>` : "";
  // Następny krok na ścieżce: pierwsza nieprzerobiona lekcja – chyba że tuż przed nią jest sprawdzian,
  // którego blok jest już przerobiony, a sam sprawdzian niezaliczony (pominięte starsze sprawdziany nie blokują).
  function nextStep() {
    const i = PATH.findIndex((l) => !state.done[l.id]);
    const before = i < 0 ? PATH[PATH.length - 1] : PATH[i - 1];
    const cp = before && CP_AFTER[before.id];
    if (cp && !cpPassed(cp) && cp.lessons.every((l) => state.done[l.id])) return { cp, href: `#/sprawdzian/${cp.id}`, title: `Sprawdzian ${cp.n}: ${cp.title}` };
    return i < 0 ? null : { lesson: PATH[i], href: `#/lesson/${PATH[i].id}`, title: PATH[i].title };
  }

  // ---------- Pomocnicze ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const badge = (lvl) => `<span class="badge" data-level="${lvl}">${lvl}</span>`;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (s) => Math.round((s.correct / s.total) * 100);
  const scorePill = (s) => s ? `<span class="pill ${pct(s) >= 80 ? "good" : pct(s) >= 50 ? "mid" : "low"}">${s.correct}/${s.total}</span>` : "";

  // ---------- Sprawdzanie odpowiedzi ----------
  // Składnia w odpowiedziach: „(that)” = słowo opcjonalne, „{who|that}” = alternatywy.
  function expandAnswer(a) {
    let out = [String(a)];
    for (let guard = 0; guard < 12; guard++) {
      let changed = false;
      out = out.flatMap((s) => {
        let m = s.match(/\{([^{}]*)\}/);
        if (m) { changed = true; return m[1].split("|").map((alt) => s.slice(0, m.index) + alt + s.slice(m.index + m[0].length)); }
        m = s.match(/\(([^()]*)\)/);
        if (m) { changed = true; return [s.slice(0, m.index) + m[1] + s.slice(m.index + m[0].length), s.slice(0, m.index) + s.slice(m.index + m[0].length)]; }
        return [s];
      });
      if (!changed) break;
    }
    return out.map((s) => s.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim()).slice(0, 64);
  }
  const displayAnswer = (a) => String(a).replace(/\{([^{}]*)\}/g, (_, x) => x.split("|").join("/"));
  const firstVariant = (a) => expandAnswer(a)[0];

  // Diakrytyki ignorujemy (Poznań = Poznan, café = cafe).
  const normalize = (s) => String(s || "").toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”„"«»]/g, "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l")
    .replace(/\b([ap])\.\s?m\b\.?/g, "$1m").replace(/(\d)\s+([ap]m)\b/g, "$1$2").replace(/(\d)([.:])(\d\d)\b/g, "$1:$3")
    .replace(/[.!?,;:…–—]+/g, " ").replace(/(^|\s)-+|-+(\s|$)/g, " ").replace(/\s+/g, " ").trim()
    // Równoważne zapisy tego samego słowa
    .replace(/\bany more\b/g, "anymore").replace(/\ball right\b/g, "alright").replace(/\bokay\b/g, "ok")
    .replace(/\be-mail/g, "email").replace(/\bno-one\b/g, "no one").replace(/\bper cent\b/g, "percent")
    .replace(/\b(some|any|every)body\b/g, "$1one").replace(/\bnobody\b/g, "no one");
  const CONTR = { "won't": ["will not"], "can't": ["cannot", "can not"], "cannot": ["can not", "can't"], "shan't": ["shall not"], "let's": ["let us"],
    "'ll": ["will"], "'d": ["would", "had"], "'s": ["is", "has"], "'m": ["am"], "'re": ["are"], "'ve": ["have"] };
  // Po przeczeniu w szyku pytającym (didn't they, isn't it) nie wolno rozwijać: „did not they” jest niegramatyczne.
  const SUBJECTS = new Set(["i", "you", "he", "she", "it", "we", "they", "there", "this", "that"]);
  // 's = has tylko przed imiesłowem (she's got / she's been / she's finished) – „He's a dog” ≠ „He has a dog”.
  const looksParticiple = (w) => !!w && (/^(got|been|gone|done|had|made|seen|taken|given|written|eaten|known|left|lost|found|bought|brought|thought|told|said|sent|spent|met|heard|read|run|come|become|begun|broken|chosen|driven|fallen|forgotten|flown|grown|hidden|ridden|risen|shown|spoken|stolen|sworn|thrown|woken|worn|won|sold|kept|slept|felt|paid|put|cut|hit|let|set|shut|hurt|cost|understood|stood|sat|taught|caught|fought|built|learnt|burnt|dreamt|already|just|never|ever|always|not|recently|finally|also|still)$/.test(w) || /(ed|en|wn)$/.test(w));
  function tokenVariants(t, next) {
    if ((/n't$/.test(t) || t === "cannot") && SUBJECTS.has(next)) return [t];
    if (CONTR[t]) return [t, ...CONTR[t]];
    let m;
    if ((m = t.match(/^(\w+)n't$/))) return [t, m[1] + " not"];
    if ((m = t.match(/^(\w+)'m$/))) return [t, m[1] + " am"];
    if ((m = t.match(/^(\w+)'re$/))) return [t, m[1] + " are"];
    if ((m = t.match(/^(\w+)'ve$/))) return [t, m[1] + " have"];
    if ((m = t.match(/^(\w+)'ll$/))) return [t, m[1] + " will"];
    if ((m = t.match(/^(\w+)'d$/))) return [t, m[1] + " would", m[1] + " had"];
    if ((m = t.match(/^(\w+)'s$/))) return /^(got|been|had)$/.test(next) ? [t, m[1] + " has"] : looksParticiple(next) ? [t, m[1] + " is", m[1] + " has"] : [t, m[1] + " is"];
    return [t];
  }
  function variants(s) {
    let out = [""];
    const toks = normalize(s).split(" ");
    for (let i = 0; i < toks.length; i++) {
      const vs = tokenVariants(toks[i], toks[i + 1]);
      out = out.flatMap((o) => vs.map((v) => (o ? o + " " + v : v)));
      if (out.length > 4096) out = out.slice(0, 4096);
    }
    return new Set(out.map((x) => x.replace(/\s+/g, " ").trim()));
  }
  // Luka „bez przedimka” zapisana w answers jako „-”: akceptujemy też typowe zapisy ucznia (0, x, ø, brak).
  const NOTHING = new Set(["", "0", "x", "ø", "∅", "brak", "nic", "none", "no article"]);
  const matchOne = (given, expected) => {
    if (normalize(expected) === "") return NOTHING.has(normalize(given));
    const g = variants(given); return [...variants(expected)].some((v) => g.has(v));
  };
  const matches = (given, answers) => answers.some((a) => expandAnswer(a).some((e) => matchOne(given, e)));

  // Różnice słowo po słowie (LCS) – pokazuje, czego brakuje, a co jest zbędne.
  function lcs(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const inA = new Set(), inB = new Set();
    for (let i = 0, j = 0; i < a.length && j < b.length;) {
      if (a[i] === b[j]) { inA.add(i); inB.add(j); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    return { n: dp[0][0], inA, inB };
  }
  function diffHtml(given, answers) {
    const gRaw = given.trim().split(/\s+/), gN = gRaw.map((w) => normalize(w));
    let best = null;
    // Jeśli uczeń nie używał skrótów, porównujemy z pełną formą wzorca (has not ↔ hasn't), żeby nie zaznaczać fałszywych różnic.
    const fullForm = (s) => { const t = s.split(/\s+/); return t.map((w, i) => { const v = tokenVariants(normalize(w), normalize(t[i + 1] || "")); if (!/'/.test(w) || v.length < 2) return w; const f = v[v.length - 1]; return /^[A-Z]/.test(w) ? f.charAt(0).toUpperCase() + f.slice(1) : f; }).join(" "); };
    const useFull = !/['’]/.test(given);
    for (const a of answers) for (const e0 of expandAnswer(a)) {
      const e = useFull ? fullForm(e0) : e0;
      const eRaw = e.split(/\s+/), eN = eRaw.map((w) => normalize(w));
      const r = lcs(gN, eN);
      const score = r.n * 2 - eN.length - gN.length;
      if (!best || score > best.score) best = { score, eRaw, r };
    }
    if (!best) return "";
    const g = gRaw.map((w, i) => best.r.inA.has(i) ? esc(w) : `<span class="d-extra">${esc(w)}</span>`).join(" ");
    const e = best.eRaw.map((w, j) => best.r.inB.has(j) ? esc(w) : `<span class="d-miss">${esc(w)}</span>`).join(" ");
    return `<div class="diff"><div><span class="d-lbl">Twoja odpowiedź:</span> ${g}</div><div><span class="d-lbl">Poprawnie:</span> ${e} ${speakBtn(best.eRaw.join(" "))}</div></div>`;
  }

  // ---------- Wymowa (Web Speech API) ----------
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find((v) => v.lang === "en-GB" && /natural|online|google/i.test(v.name))
      || vs.find((v) => v.lang === "en-GB") || vs.find((v) => /^en[-_]/i.test(v.lang)) || null;
  }
  // Dyktando bez angielskiego głosu nie ma sensu – pokazujemy czytelny komunikat (aktualizowany, gdy przeglądarka doczyta głosy).
  function ttsProblem(failed) {
    if (!("speechSynthesis" in window)) return "Twoja przeglądarka nie potrafi czytać tekstu na głos, więc dyktando nie zadziała. Otwórz stronę w Chrome, Edge albo Safari.";
    if ((speechSynthesis.getVoices().length && !voice) || failed) return "Nie udało się znaleźć angielskiego głosu w tym urządzeniu – zdania mogą nie być czytane albo brzmieć z polskim akcentem. Dodaj głos angielski w ustawieniach systemu (Android: Ustawienia → Zamiana tekstu na mowę, Windows: Ustawienia → Czas i język → Mowa, iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy) albo otwórz stronę w innej przeglądarce.";
    return "";
  }
  const ttsWarnHtml = (failed) => { const p = ttsProblem(failed); return p ? `<div class="callout warning"><h3>${icon("alert")} Brak głosu angielskiego</h3><div class="prose">${p}</div></div>` : ""; };
  const syncTtsWarn = (failed) => document.querySelectorAll(".tts-warn").forEach((el) => { el.innerHTML = ttsWarnHtml(failed); });
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); syncTtsWarn(); }; }
  function speak(text, btn, rate, onFail) {
    if (!("speechSynthesis" in window)) { alert("Twoja przeglądarka nie obsługuje odczytu na głos."); return; }
    speechSynthesis.cancel();
    document.querySelectorAll(".speak.playing, .d-btn.playing").forEach((b) => b.classList.remove("playing"));
    const say = stripTags(text).replace(/\s*\/\s*/g, ". ").replace(/[→=]/g, ". ").replace(/(^|\s)[–—](\s|$)/g, ". ");
    const u = new SpeechSynthesisUtterance(say);
    u.lang = voice ? voice.lang : "en-GB";
    if (voice) u.voice = voice;
    u.rate = rate || 0.92;
    u.onend = () => { if (btn) btn.classList.remove("playing"); };
    u.onerror = (e) => { if (btn) btn.classList.remove("playing"); if (onFail && !/interrupted|canceled/.test(e.error || "")) onFail(e.error); };
    if (btn) btn.classList.add("playing");
    speechSynthesis.speak(u);
  }
  // Uwaga: przekazuj tu wyłącznie tekst ANGIELSKI (tłumaczenia trzymamy w osobnych polach).
  const speakBtn = (text) => `<button class="speak" data-say="${esc(stripTags(text))}" title="Posłuchaj wymowy" aria-label="Posłuchaj">${icon("volume")}</button>`;

  // ---------- Sidebar ----------
  function renderLevelFilter() {
    $("#levelFilter").innerHTML =
      `<button class="chip ${state.levels.length === 4 ? "active" : ""}" data-all aria-pressed="${state.levels.length === 4}">Wszystkie</button>` +
      LEVELS.map((l) => { const on = state.levels.length < 4 && state.levels.includes(l); return `<button class="chip ${on ? "active" : ""}" data-level="${l}" aria-pressed="${on}" title="Poziom ${l}">${l}</button>`; }).join("");
  }
  // Stan lekcji w menu: przerobiona (state.done) / zaczęta (jakiś wynik w state.scores) / nie zaczęta.
  const lessonStarted = (id) => Object.keys(state.scores).some((k) => k === id || k.startsWith(id + "::"));
  const navMark = (id) => state.done[id] ? `<span class="nav-mark is-done" title="Przerobione">${icon("check")}</span>`
    : lessonStarted(id) ? `<span class="nav-mark is-started" title="Zaczęte – są wyniki zadań"></span>`
    : `<span class="nav-mark"></span>`;
  // Odświeża znaczniki i liczniki „3/6” w gotowym menu – bez przebudowy i bez przewijania strony.
  function syncNavState() {
    const nav = $("#nav"); if (!nav) return;
    nav.querySelectorAll(".nav-item[data-lesson]").forEach((a) => { a.querySelector(".nav-mark").outerHTML = navMark(a.dataset.lesson); });
    nav.querySelectorAll(".nav-group[data-cat]").forEach((g) => {
      const ids = [...g.querySelectorAll(".nav-item[data-lesson]")].map((a) => a.dataset.lesson);
      const d = ids.filter((id) => state.done[id]).length, c = g.querySelector(".nav-group-count");
      c.textContent = `${d}/${ids.length}`; c.title = `Przerobione: ${d} z ${ids.length}`;
      c.classList.toggle("is-full", d === ids.length);
    });
  }
  function renderNav() {
    const cur = currentLessonId();
    const h = location.hash;
    const quick = `<div class="nav-group nav-quick">
      <a class="nav-item ${h.startsWith("#/kolejnosc") ? "active" : ""}" href="#/kolejnosc"><span class="nav-ico">${icon("compass")}</span><span class="nav-title">Kolejność nauki</span></a>
      <a class="nav-item ${h.startsWith("#/vocab") ? "active" : ""}" href="#/vocab"><span class="nav-ico">${icon("book")}</span><span class="nav-title">Słownictwo</span></a>
      <a class="nav-item ${h.startsWith("#/slowka") ? "active" : ""}" href="#/slowka"><span class="nav-ico">${icon("cards")}</span><span class="nav-title">Słówka na dziś</span><span class="wd-count nav-count" title="Na dziś" hidden></span></a>
      <a class="nav-item ${h.startsWith("#/tests") ? "active" : ""}" href="#/tests"><span class="nav-ico">${icon("test")}</span><span class="nav-title">Testy – pisanie zdań</span></a>
      <a class="nav-item ${h.startsWith("#/practice") ? "active" : ""}" href="#/practice"><span class="nav-ico">${icon("target")}</span><span class="nav-title">Trening mieszany</span></a>
      <a class="nav-item ${h.startsWith("#/bledy") ? "active" : ""}" href="#/bledy"><span class="nav-ico">${icon("repeat")}</span><span class="nav-title">Moje błędy</span><span class="m-count nav-count" title="Na dziś" hidden></span></a>
      <a class="nav-item nav-goal goal-mini" href="#/kolejnosc/cel"><span class="nav-ico gt-ring"></span><span class="nav-title">Cel na dziś</span><span class="gt-txt"></span></a>
    </div>`;
    const groups = CATEGORIES.map((c) => {
      const items = PATH.filter((l) => l.category === c && state.levels.includes(l.level))
        .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
      if (!items.length) return "";
      return `<div class="nav-group" data-cat="${esc(c)}"><div class="nav-group-title"><span>${esc(c)}</span><span class="nav-group-count"></span></div>` +
        items.map((l) => `<a class="nav-item ${l.id === cur ? "active" : ""}" href="#/lesson/${l.id}" data-lesson="${l.id}">
          ${badge(l.level)}<span class="nav-title">${esc(l.title)}</span>${navMark(l.id)}</a>`).join("") +
        `</div>`;
    }).join("");
    $("#nav").innerHTML = quick + (groups || `<div class="nav-empty">Brak lekcji dla wybranych poziomów.</div>`);
    syncNavState();
    syncGoalMini();
    const active = $("#nav .nav-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
    syncTodayCounts();
  }

  // ---------- Kolejność nauki (#/kolejnosc) ----------
  function renderOrder() {
    if (!PATH.length) return `<div class="page empty"><h1>Brak lekcji</h1></div>`;
    const percent = (d, n) => (n ? Math.round((d / n) * 100) : 0);
    const nDone = PATH.filter((l) => state.done[l.id]).length;
    const step = nextStep();
    const next = step && step.lesson;
    const nCp = CHECKPOINTS.filter(cpPassed).length;
    const cpRow = (cp) => {
      const passed = cpPassed(cp), s = state.scores[cpKey(cp)];
      const isNext = step && step.cp === cp;
      return `<li class="order-item order-cp${passed ? " is-done" : ""}${isNext ? " is-next" : ""}" data-level="${cp.level}">
            <a href="#/sprawdzian/${cp.id}">
              <span class="order-num" aria-hidden="true">${icon("flag")}</span>
              <span class="order-titles"><span class="order-title">Sprawdzian ${cp.n}: ${esc(cp.title)}</span><span class="order-pl">Powtórka: lekcje ${cpRange(cp)}${cp.prior.length ? " + trochę wcześniejszych" : ""}</span></span>
              ${isNext ? '<span class="order-next-tag">Teraz</span>' : ""}
              ${s ? scorePill(s) : ""}
              <span class="order-check" aria-label="${passed ? "Zaliczony" : "Niezaliczony"}">${passed ? icon("check") : ""}</span>
            </a>
          </li>`;
    };
    // Kafelek na końcu poziomu: test całego poziomu (zaliczenie = odznaka przy nagłówku poziomu).
    const ltRow = (lv, ls) => {
      const passed = ltPassed(lv), s = state.scores[ltKey(lv)];
      const ready = ls.every((l) => state.done[l.id]);
      return `<li class="order-item order-cp order-lt${passed ? " is-done" : ""}" data-level="${lv}">
            <a href="#/test-poziomu/${lv}">
              <span class="order-num" aria-hidden="true">${icon("test")}</span>
              <span class="order-titles"><span class="order-title">Test poziomu ${lv}</span><span class="order-pl">${LT_SIZE} zadań ze wszystkich lekcji ${lv}${passed ? "" : ready ? " – poziom przerobiony, sprawdź się!" : " – zalicz (80%), a dostaniesz odznakę " + icon("medal")}</span></span>
              ${s ? scorePill(s) : ""}
              <span class="order-check" aria-label="${passed ? "Zaliczony" : "Niezaliczony"}">${passed ? icon("check") : ""}</span>
            </a>
          </li>`;
    };
    const nLt = LEVELS.filter((lv) => levelLessons(lv).length && ltPassed(lv)).length;
    const levelBars = LEVELS.map((lv) => {
      const ls = PATH.filter((l) => l.level === lv);
      if (!ls.length) return "";
      const d = ls.filter((l) => state.done[l.id]).length;
      return `<a class="order-level" href="#/kolejnosc" data-jump="lvl-${lv}" data-level="${lv}">
        <div class="order-level-head">${badge(lv)} <b>${LEVEL_INFO[lv].name}</b>${ltPassed(lv) ? `<span class="lt-mark" title="Test poziomu zaliczony">${icon("medal")}</span>` : ""}<span class="muted">${d}/${ls.length}</span></div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${ls.length}" aria-valuenow="${d}" aria-label="Postęp ${lv}"><i style="width:${percent(d, ls.length)}%"></i></div>
      </a>`;
    }).join("");
    const groups = LEVELS.map((lv) => {
      const ls = PATH.filter((l) => l.level === lv);
      if (!ls.length) return "";
      return `<section class="order-group" id="lvl-${lv}" data-level="${lv}">
        <h2 class="order-group-title">${badge(lv)} ${LEVEL_INFO[lv].name}${ltBadge(lv)}</h2>
        <ol class="order-list">${ls.map((l) => {
          const n = PATH.indexOf(l) + 1;
          const done = !!state.done[l.id];
          const isNext = next && next.id === l.id;
          return `<li class="order-item${done ? " is-done" : ""}${isNext ? " is-next" : ""}" data-level="${l.level}">
            <a href="#/lesson/${l.id}">
              <span class="order-num">${n}</span>
              ${badge(l.level)}
              <span class="order-titles"><span class="order-title">${esc(l.title)}</span>${l.titlePl ? `<span class="order-pl">${esc(l.titlePl)}</span>` : ""}</span>
              ${isNext ? '<span class="order-next-tag">Teraz</span>' : ""}
              <span class="order-check" aria-label="${done ? "Przerobione" : "Nieprzerobione"}">${done ? icon("check") : ""}</span>
            </a>
          </li>${CP_AFTER[l.id] ? cpRow(CP_AFTER[l.id]) : ""}`;
        }).join("")}${ltRow(lv, ls)}</ol>
      </section>`;
    }).join("");
    return `<div class="page order-page">
      <div class="crumbs"><a href="#/">Strona główna</a> · <span>Kolejność nauki</span></div>
      <h1>Kolejność nauki</h1>
      <p class="muted-p">Lekcje ułożone tak, jak warto się ich uczyć. Każda korzysta tylko z gramatyki i słówek z lekcji wcześniejszych. Lekcję oznaczysz jako przerobioną przyciskiem w lekcji albo zdając jej test (min. 80%).${CHECKPOINTS.length ? ` Co kilka lekcji czeka ${icon("flag")} <b>sprawdzian powtórkowy</b>: zadania z ostatnich lekcji i trochę z wcześniejszych, głównie pisanie całych zdań.` : ""} Na końcu każdego poziomu jest ${icon("test")} <b>test poziomu</b> – za zaliczenie (80%) dostajesz odznakę ${icon("medal")}.</p>
      <div class="card order-summary">
        <div class="order-total">
          <div><b>${nDone} z ${PATH.length} lekcji</b> <span class="muted">(${percent(nDone, PATH.length)}%)${CHECKPOINTS.length ? ` · sprawdziany: ${nCp}/${CHECKPOINTS.length}` : ""} · testy poziomów: ${nLt}/${LEVELS.filter((lv) => levelLessons(lv).length).length}</span></div>
          ${step ? `<a class="btn primary" href="${step.href}">${nDone ? "Kontynuuj naukę" : "Zacznij naukę"}: ${step.cp ? icon("flag") + " " : ""}${esc(step.title)} →</a>` : `<span class="pill good">Wszystkie lekcje przerobione!</span>`}
        </div>
        <div class="progress big" role="progressbar" aria-valuemin="0" aria-valuemax="${PATH.length}" aria-valuenow="${nDone}" aria-label="Postęp całego kursu"><i style="width:${percent(nDone, PATH.length)}%"></i></div>
        <div class="order-levels">${levelBars}</div>
        <a class="order-backup-link" href="#/kolejnosc/kopia" data-jump="kopia">${icon("save")} Kopia postępu – pobierz albo wczytaj z pliku</a>
      </div>
      ${goalHtml()}
      ${activityHtml()}
      ${backupReminder()}
      ${groups}
      ${backupSectionHtml()}
    </div>`;
  }

  function bindOrder() {
    document.querySelectorAll(".order-page [data-jump]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(a.dataset.jump);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    bindBackup($(".order-page .backup"));
  }

  // ---------- Kopia postępu: eksport / import (sekcja #kopia na stronie „Kolejność nauki”) ----------
  // Plik: { app: "angielski", version: 1, date, data: { "eng-done": {...}, "eng-scores": {...}, ... } } –
  // wszystkie klucze eng-* z localStorage oprócz BACKUP_SKIP. Wartości zapisane jako JSON trafiają do pliku
  // już odczytane (plik da się przeczytać); eng-theme jest w localStorage zwykłym tekstem, stąd RAW_KEYS.
  const BACKUP_APP = "angielski", BACKUP_VERSION = 1;
  const RAW_KEYS = ["eng-theme"];
  // Dane przypomnienia o kopii i dzień komunikatu o celu dziennym dotyczą tylko tego urządzenia.
  const BACKUP_SKIP = ["eng-backup", "eng-goalDay"];
  const DAY = 864e5, REMIND_DAYS = 14;
  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  // Sprawdzenie typów przy wczytywaniu – plik niezgodny z tym opisem jest odrzucany w całości.
  const BACKUP_CHECK = {
    "eng-done": isObj,
    "eng-scores": (v) => isObj(v) && Object.values(v).every((s) => isObj(s) && s.total > 0 && s.correct >= 0),
    "eng-known": (v) => isObj(v) && Object.values(v).every(isObj),
    "eng-levels": (v) => Array.isArray(v) && v.length > 0 && v.every((x) => LEVELS.includes(x)),
    "eng-showPl": (v) => typeof v === "boolean",
    "eng-mistakes": (v) => isObj(v) && Object.values(v).every((m) => isObj(m) && m.box >= 1 && typeof m.due === "string"),
    "eng-srs": (v) => isObj(v) && Object.values(v).every((m) => isObj(m) && m.box >= 1 && typeof m.due === "string"),
    "eng-srsNew": (v) => NEW_CHOICES.includes(v),
    "eng-goal": (v) => GOAL_CHOICES.includes(v),
    "eng-theme": (v) => v === "light" || v === "dark",
    "eng-activity": (v) => isObj(v) && Object.entries(v).every(([k, e]) => DAY_RE.test(k) && isObj(e) &&
      ["t", "ok", "w"].every((f) => e[f] === undefined || (Number.isFinite(e[f]) && e[f] >= 0))),
  };
  // Łączenie kopii z postępem na tym urządzeniu (a = to urządzenie, b = kopia), reguła dla każdego klucza.
  const ratio = (s) => s.correct / s.total;
  const MERGE = {
    "eng-done": (a, b) => ({ ...a, ...b }), // lekcja przerobiona w którymkolwiek miejscu
    "eng-scores": (a, b) => { // lepszy wynik (przy remisie zostaje wynik z tego urządzenia, jak w saveScore)
      const out = { ...a };
      for (const [k, s] of Object.entries(b)) if (!out[k] || ratio(s) > ratio(out[k])) out[k] = s;
      return out;
    },
    "eng-known": (a, b) => { // suma słówek oznaczonych jako „znam”
      const out = { ...a };
      for (const [k, words] of Object.entries(b)) out[k] = { ...(out[k] || {}), ...words };
      return out;
    },
    // Dziennik nauki: dla każdego dnia większa wartość każdego pola (nie suma – ta sama kopia wczytana dwa razy
    // nie może podwoić liczb). Znacznik przybliżenia „a” zostaje tylko wtedy, gdy obie strony mają dzień przybliżony.
    "eng-activity": (a, b) => {
      const out = { ...a };
      for (const [k, e] of Object.entries(b)) {
        const c = out[k];
        if (!c) { out[k] = e; continue; }
        const m = {};
        for (const f of ["t", "ok", "w"]) { const n = Math.max(c[f] || 0, e[f] || 0); if (n) m[f] = n; }
        if (c.a && e.a) m.a = 1;
        out[k] = m;
      }
      return out;
    },
  };
  // Ustawienia (poziomy w menu, tłumaczenia, motyw, limit nowych słówek, cel dzienny) przy łączeniu zostają takie, jak na tym urządzeniu –
  // także gdy tu nie były zmieniane (wartość domyślna), więc z kopii ich nie bierzemy.
  const KEEP_LOCAL = ["eng-levels", "eng-showPl", "eng-theme", "eng-srsNew", "eng-goal"];
  // Klucze bez własnej reguły (eng-mistakes, eng-srs – w postaci { klucz: { box, due, lastSeen, … } }):
  // obiekty łączymy wpis po wpisie, a gdy wpis jest w obu miejscach, wygrywa ten z późniejszym lastSeen
  // (bez lastSeen – ten z tego urządzenia). Inne wartości zostają z tego urządzenia.
  // Nowa funkcja z własnymi danymi powinna dopisać do MERGE (i BACKUP_CHECK) regułę dla swojego klucza.
  // eng-mistakes celowo bez reguły: przy tym samym zadaniu wygrywa świeższy stan pudełka. (Zadanie opanowane
  // na jednym urządzeniu, a wciąż obecne w kopii z drugiego, wraca na listę – lepiej powtórzyć raz za dużo.)
  // eng-srs też bez reguły: przy tym samym słówku wygrywa ostatnia ocena; wpisy z migracji „znam” (bez lastSeen)
  // przegrywają z każdą prawdziwą oceną. Słówka „znam” bez wpisu dostają go po wczytaniu (migrateKnown).
  const lastSeen = (e) => (isObj(e) && Date.parse(e.lastSeen)) || 0;
  function mergeDefault(a, b) {
    if (!isObj(a) || !isObj(b)) return a;
    const out = { ...a };
    for (const [k, e] of Object.entries(b)) if (!(k in out) || lastSeen(e) > lastSeen(out[k])) out[k] = e;
    return out;
  }
  function mergeData(cur, inc) {
    const out = { ...cur };
    for (const [k, v] of Object.entries(inc)) {
      if (KEEP_LOCAL.includes(k)) continue;
      out[k] = k in cur ? (MERGE[k] || mergeDefault)(cur[k], v) : v;
    }
    return out;
  }

  function lsKeys() {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("eng-") && !BACKUP_SKIP.includes(k)) out.push(k); } } catch (e) {}
    return out;
  }
  function readAll() {
    const data = {};
    for (const k of lsKeys()) {
      const raw = localStorage.getItem(k);
      if (RAW_KEYS.includes(k)) { data[k] = raw; continue; }
      try { data[k] = JSON.parse(raw); } catch (e) {} // uszkodzony wpis – i tak nie jest używany (store.get daje domyślny)
    }
    return data;
  }
  function writeAll(data, replace) {
    try {
      if (replace) lsKeys().forEach((k) => localStorage.removeItem(k));
      for (const [k, v] of Object.entries(data)) localStorage.setItem(k, RAW_KEYS.includes(k) ? String(v) : JSON.stringify(v));
      return true;
    } catch (e) { return false; }
  }
  // Zwraca { data, date } albo { error: "komunikat dla ucznia" }.
  function parseBackup(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { error: "To nie jest plik z kopią postępu (zły format pliku)." }; }
    if (!isObj(obj) || obj.app !== BACKUP_APP || !isObj(obj.data)) return { error: "Ten plik nie jest kopią postępu z tej strony." };
    if (typeof obj.version !== "number" || obj.version > BACKUP_VERSION) return { error: "Ta kopia pochodzi z nowszej wersji strony. Odśwież stronę i spróbuj jeszcze raz." };
    const data = {};
    for (const [k, v] of Object.entries(obj.data)) {
      if (!k.startsWith("eng-") || BACKUP_SKIP.includes(k)) continue;
      if (BACKUP_CHECK[k] && !BACKUP_CHECK[k](v)) return { error: "Plik z kopią jest uszkodzony – nie da się go wczytać." };
      data[k] = v;
    }
    return { data, date: obj.date };
  }
  function backupStats(data) {
    const done = data["eng-done"] || {}, known = data["eng-known"] || {};
    return {
      done: Object.keys(done).filter((id) => done[id] && BY_ID[id]).length,
      scores: Object.keys(data["eng-scores"] || {}).length,
      words: Object.values(known).reduce((s, o) => s + Object.values(o).filter(Boolean).length, 0),
      mistakes: Object.keys(data["eng-mistakes"] || {}).filter((k) => TASKS.has(k)).length,
      srs: Object.keys(data["eng-srs"] || {}).filter((k) => WORDS.has(k)).length,
      days: Object.values(data["eng-activity"] || {}).filter((e) => dayTotal(e) > 0).length,
    };
  }
  const fmtDate = (iso, time) => {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) + (time ? ", " + d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "");
  };

  // Przypomnienie: 14 dni od ostatniej kopii (albo od „Później” / początku nauki), o ile od ostatniej kopii przybyło postępu.
  // eng-backup = { last: data ostatniej kopii, since: od kiedy liczymy 14 dni, count: ile było postępu przy ostatniej kopii }.
  const progressCount = () => Object.keys(state.done).length + Object.keys(state.scores).length;
  function backupDue() {
    const n = progressCount(), b = store.get("backup", null);
    if (!n) return false;
    if (!isObj(b)) { store.set("backup", { since: new Date().toISOString(), count: 0 }); return false; }
    return n > (b.count || 0) && Date.now() - (Date.parse(b.since) || 0) >= REMIND_DAYS * DAY;
  }
  const backupReminder = () => backupDue() ? `<div class="card backup-reminder" role="note">
      <span class="br-ico" aria-hidden="true">${icon("save")}</span>
      <div class="br-text"><b>Zrób kopię postępu</b><span>Postęp jest zapisany tylko w tej przeglądarce. Kopia w pliku przyda się, gdy wyczyścisz dane przeglądarki albo zmienisz urządzenie.</span></div>
      <div class="br-actions"><button class="btn primary small" type="button" data-backup="download">Pobierz kopię</button><button class="btn small" type="button" data-backup="later">Później</button></div>
    </div>` : "";

  function downloadBackup() {
    const now = new Date();
    const file = { app: BACKUP_APP, version: BACKUP_VERSION, date: now.toISOString(), data: readAll() };
    const blob = new Blob([JSON.stringify(file, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const p = (x) => String(x).padStart(2, "0");
    a.download = `angielski-postep-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    store.set("backup", { last: now.toISOString(), since: now.toISOString(), count: progressCount() });
    document.querySelectorAll(".backup-reminder").forEach((el) => el.remove());
    const last = $(".backup-last");
    if (last) last.innerHTML = `Ostatnia kopia: <b>${fmtDate(now, true)}</b>.`;
  }

  let backupFlash = ""; // komunikat po wczytaniu kopii – pokazany raz, po ponownym narysowaniu strony

  function backupSectionHtml() {
    const b = store.get("backup", null);
    const flash = backupFlash; backupFlash = "";
    return `<section class="card backup" id="kopia">
      <h2>${icon("save")} Kopia postępu</h2>
      <p>Przerobione lekcje, wyniki zadań i słówka oznaczone jako „znam” są zapisane <b>tylko w tej przeglądarce</b>. Po wyczyszczeniu danych przeglądarki znikną. Pobierz kopię do pliku – potem wczytasz ją tutaj albo na innym urządzeniu (np. na telefonie).</p>
      <p class="muted backup-last">${b && b.last ? `Ostatnia kopia: <b>${fmtDate(b.last, true)}</b>.` : "Na tym urządzeniu nie zrobiono jeszcze kopii."}</p>
      <div class="backup-actions">
        <button class="btn primary" type="button" data-backup="download">${icon("download")} Pobierz kopię postępu</button>
        <button class="btn" type="button" data-backup="pick">${icon("upload")} Wczytaj kopię</button>
        <input type="file" accept=".json,application/json" hidden>
      </div>
      <div class="backup-panel" aria-live="polite">${flash}</div>
    </section>`;
  }

  function bindBackup(box) {
    if (!box) return;
    const input = box.querySelector("input[type=file]"), panel = box.querySelector(".backup-panel");
    box.querySelector('[data-backup="pick"]').addEventListener("click", () => { input.value = ""; input.click(); });
    const fail = (msg) => { panel.innerHTML = `<div class="backup-msg bad">${esc(msg)}</div>`; };
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      if (!f) return;
      if (f.size > 5e6) return fail("Ten plik jest za duży jak na kopię postępu.");
      const reader = new FileReader();
      reader.onerror = () => fail("Nie udało się odczytać pliku.");
      reader.onload = () => {
        const res = parseBackup(String(reader.result));
        if (res.error) return fail(res.error);
        showPreview(res);
      };
      reader.readAsText(f);
    });

    function showPreview({ data, date }) {
      const cur = readAll(), merged = mergeData(cur, data);
      const [sF, sC, sM] = [data, cur, merged].map(backupStats);
      const row = (label, k) => `<tr><td>${label}</td><td>${sF[k]}</td><td>${sC[k]}</td><td>${sM[k]}</td></tr>`;
      const empty = !sF.done && !sF.scores && !sF.words && !sF.mistakes && !sF.srs && !sF.days;
      panel.innerHTML = `<div class="backup-preview">
        <h3>Kopia${date && fmtDate(date) ? ` z ${fmtDate(date, true)}` : ""}</h3>
        ${empty ? `<p class="backup-msg warn">Ta kopia nie zawiera żadnego postępu (same ustawienia albo nic).</p>` : ""}
        <div class="backup-table"><table>
          <thead><tr><th></th><th>W kopii</th><th>Na tym urządzeniu</th><th>Po połączeniu</th></tr></thead>
          <tbody>${row("Przerobione lekcje", "done")}${row("Wyniki zadań i testów", "scores")}${row("Słówka „znam”", "words")}${row("Słówka w powtórkach", "srs")}${row("Zadania w „Moich błędach”", "mistakes")}${row("Dni nauki", "days")}</tbody>
        </table></div>
        <p><b>Połącz</b> – zostaje wszystko z obu miejsc: lekcje przerobione tu lub tam, lepszy z dwóch wyników, wszystkie znane słówka i dni nauki. Ustawienia (motyw, poziomy w menu) zostają z tego urządzenia.<br>
        <b>Zastąp</b> – postęp z tego urządzenia zostanie <b>usunięty</b> i zastąpiony kopią.</p>
        <div class="backup-actions">
          <button class="btn primary" type="button" data-act="merge">Połącz</button>
          <button class="btn danger" type="button" data-act="replace">Zastąp</button>
          <button class="btn" type="button" data-act="cancel">Anuluj</button>
        </div>
      </div>`;
      panel.querySelector('[data-act="cancel"]').addEventListener("click", () => { panel.innerHTML = ""; });
      panel.querySelector('[data-act="merge"]').addEventListener("click", () => apply(merged, false, sM));
      panel.querySelector('[data-act="replace"]').addEventListener("click", () => apply(data, true, sF));
      panel.querySelector(".backup-preview").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function apply(data, replace, stats) {
      if (!writeAll(data, replace)) return fail("Nie udało się zapisać postępu (brak miejsca w przeglądarce?).");
      Object.assign(state, loadState());
      migrateKnown(state);
      migrateActivity(state);
      const t = localStorage.getItem("eng-theme");
      if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
      syncThemeColor();
      backupFlash = `<div class="backup-msg good">${icon("check")} Kopia wczytana${replace ? " (postęp zastąpiony)" : " i połączona z postępem z tego urządzenia"}: ${stats.done} przerobionych lekcji, ${stats.scores} wyników, ${stats.words} znanych słówek.</div>`;
      renderLevelFilter();
      route();
      const sec = document.getElementById("kopia");
      if (sec) sec.scrollIntoView({ block: "start" });
    }
  }

  // ---------- Strona główna ----------
  function renderHome() {
    const nEx = PATH.reduce((s, l) => s + l.sections.filter((x) => x.type === "examples").reduce((a, x) => a + x.items.length, 0), 0);
    const nTasks = PATH.reduce((s, l) => s + allTasks(l), 0);
    const nWords = VOCAB.reduce((s, t) => s + vocabItems(t).length, 0);
    const nDone = PATH.filter((l) => state.done[l.id]).length;
    const next = nextStep();
    const overview = BY_ID["tenses-overview"];
    if (!PATH.length) return `<div class="page empty"><h1>Brak lekcji</h1><p>Nie znaleziono plików z danymi w folderze <code>data/</code>.</p></div>`;

    return `<div class="page">
      <section class="hero">
        <h1>Gramatyka angielska<br>od A1 do B2</h1>
        <p>Wszystkie najważniejsze tematy wyjaśnione po polsku: czasy, czasowniki modalne, tryby warunkowe, strona bierna i dużo więcej. Każda lekcja ma budowę, mnóstwo przykładów z tłumaczeniem, słownictwo, zestawy ćwiczeń i test z pisaniem całych zdań.</p>
        <div class="hero-actions">
          ${next ? `<a class="btn primary" href="${next.href}">${nDone ? "Kontynuuj" : "Zacznij od początku"}: ${next.cp ? icon("flag") + " " : ""}${esc(next.title)} →</a>` : `<a class="btn primary" href="#/practice">Wszystko przerobione! Trenuj →</a>`}
          <a class="btn" href="#/kolejnosc">${icon("compass")} Kolejność nauki (${nDone}/${PATH.length})</a>
          ${overview ? `<a class="btn" href="#/lesson/tenses-overview">${icon("map")} Przegląd wszystkich czasów</a>` : ""}
        </div>
      </section>
      ${Object.keys(state.activity).length ? goalHtml() : ""}
      ${todayWidget()}
      ${backupReminder()}
      <div class="stats">
        <div class="stat"><b>${PATH.length}</b><span>lekcji</span></div>
        <div class="stat"><b>${nEx}</b><span>przykładów zdań</span></div>
        <div class="stat"><b>${nTasks}</b><span>zadań i pytań testowych</span></div>
        <div class="stat"><b>${nWords}</b><span>słówek w ${VOCAB.length} działach</span></div>
      </div>
      <div class="feature-cards">
        <a class="card feature" href="#/vocab"><span class="f-ico">${icon("book")}</span><b>Słownictwo</b><span>Słówka tematyczne A1–B2: lista z wymową, fiszki i quizy.</span></a>
        <a class="card feature" href="#/tests"><span class="f-ico">${icon("test")}</span><b>Testy</b><span>Tłumaczenie i przekształcanie całych zdań – sprawdzanie na końcu.</span></a>
        <a class="card feature" href="#/practice"><span class="f-ico">${icon("target")}</span><b>Trening mieszany</b><span>Losowe zadania z wielu lekcji – czy rozpoznasz konstrukcję?</span></a>
      </div>
      ${ankiCard()}
      <div class="level-cards">
        ${LEVELS.map((lv) => {
          const ls = PATH.filter((l) => l.level === lv);
          if (!ls.length) return "";
          const d = ls.filter((l) => state.done[l.id]).length;
          return `<div class="level-card" data-level="${lv}">
            <h2>${badge(lv)} ${LEVEL_INFO[lv].name}</h2>
            <p class="lvl-desc">${LEVEL_INFO[lv].desc}</p>
            <div class="progress-label">${d} z ${ls.length} przerobionych</div>
            <div class="progress"><i style="width:${(d / ls.length) * 100}%"></i></div>
            <ul class="lesson-list">${ls.map((l) => `<li><a href="#/lesson/${l.id}">
              ${state.done[l.id] ? `<span class="done-mark">${icon("check")}</span>` : ""}<span>${esc(l.title)}</span><span class="pl">${esc(l.titlePl)}</span></a></li>`).join("")}</ul>
          </div>`;
        }).join("")}
      </div>
      <h2 class="section-title">Jak korzystać</h2>
      <div class="howto">
        <div><b>1. Słówka i teoria</b>Zacznij od zakładki „Słownictwo” w lekcji, potem przeczytaj teorię. Kliknij ${icon("volume")}, żeby usłyszeć wymowę.</div>
        <div><b>2. Ćwiczenia</b>Zestawy od łatwych do trudnych: wybór, luki, układanie zdań, przekształcenia. Każde zadanie ma wyjaśnienie.</div>
        <div><b>3. Test</b>Na koniec napisz całe zdania sam(a). Wynik i poprawki zobaczysz po zakończeniu testu.</div>
      </div>
      <p class="muted-p backup-note">Postęp zapisuje się w tej przeglądarce. <a href="#/kolejnosc/kopia">${icon("save")} Pobierz albo wczytaj kopię postępu</a> – przyda się na innym urządzeniu.</p>
    </div>`;
  }

  // ---------- Sekcje lekcji ----------
  function sectionTitle(s, fallback) { return s.title || fallback; }
  const cmpExample = (e) => typeof e === "string"
    ? `<li>${speakBtn(e)}<span>${e}</span></li>`
    : `<li>${speakBtn(e.en)}<span class="cmp-txt"><span>${e.en}</span><span class="ex-pl">${e.pl}</span></span></li>`;
  function renderSection(s, idx) {
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
          <div class="ex">${speakBtn(e.en)}<div class="ex-en">${e.en}</div>
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
            <div class="why">${m.why}</div></div>`).join("")}</div></section>`;
      case "compare":
        return `<section class="block">${h(s.title)}<div class="compare">${(s.items || []).map((c) => `
          <div class="card compare-col"><h3>${c.label}</h3><div class="prose">${c.html}</div>
          ${(c.examples || []).length ? `<ul>${c.examples.map(cmpExample).join("")}</ul>` : ""}</div>`).join("")}</div></section>`;
      default:
        return "";
    }
  }

  // ---------- Zadania ----------
  // Każde zadanie dostaje „kontroler”: evaluate() → {ok, extra} | null (brak odpowiedzi), lock().
  function exerciseHtml(ex, i, src) {
    const num = `<span class="ex-num">${i + 1}.</span>`;
    const task = ex.task ? `<div class="ex-task">${ex.task}</div>` : "";
    const hint = ex.hint ? `<div class="ex-hint">${icon("bulb")} ${ex.hint}</div>` : "";
    if (ex.type === "choice") {
      return `<div class="card exercise" data-i="${i}">${src}${task}<div class="ex-q">${num}<div>${ex.q.split("___").join("<b>_____</b>")}</div></div>${hint}
        <div class="options">${ex.options.map((o, j) => `<button class="opt" data-j="${j}">${o}</button>`).join("")}</div><div class="fb"></div></div>`;
    }
    if (ex.type === "gap") {
      const parts = ex.q.split("___");
      const q = parts.map((p, k) => p + (k < parts.length - 1 ? `<input class="gap-input" data-k="${k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Uzupełnij">` : "")).join("");
      return `<div class="card exercise" data-i="${i}">${src}${task}<div class="ex-q">${num}<div>${q}</div></div>${hint}<div class="gap-actions"></div><div class="fb"></div></div>`;
    }
    if (ex.type === "write") {
      return `<div class="card exercise write" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="w-prompt">${ex.q}</div></div>${hint}
        <div class="w-wrap"><textarea class="w-input" rows="1" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Napisz całe zdanie po angielsku…" aria-label="Twoja odpowiedź"></textarea></div>
        <div class="gap-actions"></div><div class="fb"></div></div>`;
    }
    if (ex.type === "dictation") {
      return `<div class="card exercise write dictation" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="d-controls">
          <button class="btn small d-btn d-play" title="Odtwórz zdanie">${icon("play")} Odtwórz</button><button class="btn small d-btn d-slow" title="Odtwórz wolniej">${icon("slow")} Wolniej</button><span class="d-count muted"></span></div></div>
        <div class="w-wrap"><textarea class="w-input" rows="1" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Zapisz po angielsku to, co słyszysz…" aria-label="Twoja odpowiedź"></textarea></div>
        <div class="gap-actions"></div><div class="fb"></div></div>`;
    }
    if (ex.type === "order") {
      return `<div class="card exercise order" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="w-prompt">${ex.q || "Ułóż zdanie z podanych wyrazów."}</div></div>${hint}
        <div class="o-line" aria-label="Twoje zdanie"><span class="o-placeholder">Klikaj wyrazy w kolejności…</span></div>
        <div class="o-bank"></div><div class="gap-actions"></div><div class="fb"></div></div>`;
    }
    return "";
  }

  function orderTokens(ex) {
    const ans = firstVariant(ex.answers[0]);
    const end = (ans.match(/[.?!]+$/) || [""])[0];
    let toks = ex.words ? ex.words.slice() : ans.replace(/[.?!]+$/, "").split(/\s+/);
    if (!ex.words && !ex.keepCase && toks.length && !/^I(\b|')/.test(toks[0])) toks[0] = toks[0].charAt(0).toLowerCase() + toks[0].slice(1);
    return { toks: shuffle(toks.concat(ex.extra || [])), end };
  }

  function makeController(card, ex, mode, report) {
    const deferred = mode === "deferred";
    const actions = card.querySelector(".gap-actions");
    const fb = card.querySelector(".fb");
    let done = false;
    const show = (ok, extra) => {
      card.classList.remove("pending");
      card.classList.add(ok ? "correct" : "wrong");
      fb.innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${ok ? icon("check") + " Dobrze!" : icon("x") + " Niestety."}</span>${extra || ""} <span class="explain">${ex.explain || ""}</span></div>`;
    };
    const ctl = { ex, card, result: null };
    const finish = (res) => {
      if (done) return; done = true;
      ctl.result = res;
      ctl.lock();
      if (actions) actions.innerHTML = "";
      show(res.ok, res.extra);
      if ((ex.type === "write" || ex.type === "dictation") && !res.ok && res.given) {
        const b = document.createElement("button");
        b.className = "btn small accept"; b.innerHTML = icon("check") + " Moja odpowiedź też jest poprawna";
        b.title = "Automat zna tylko podane warianty. Jeśli jesteś pewien/pewna, że Twoje zdanie jest poprawne – zalicz je.";
        b.addEventListener("click", () => {
          b.remove(); card.classList.remove("wrong"); card.classList.add("correct");
          fb.querySelector(".feedback").className = "feedback ok";
          fb.querySelector(".verdict").innerHTML = icon("check") + " Zaliczone (samoocena).";
          ctl.result.ok = true; report(ctl, true);
        });
        fb.querySelector(".feedback").appendChild(b);
      }
      report(ctl, false);
    };
    ctl.finish = finish;

    if (ex.type === "choice") {
      let sel = null;
      const opts = [...card.querySelectorAll(".opt")];
      opts.forEach((btn) => btn.addEventListener("click", () => {
        if (done) return;
        sel = +btn.dataset.j;
        if (deferred) { opts.forEach((b) => b.classList.toggle("selected", b === btn)); card.classList.add("pending"); report(ctl, false, true); }
        else finish(ctl.evaluate());
      }));
      ctl.evaluate = () => {
        if (sel === null) return { ok: false, given: null, extra: ` Poprawnie: <b>${ex.options[ex.answer]}</b>.` };
        return { ok: sel === ex.answer, given: sel };
      };
      ctl.lock = () => {
        opts.forEach((b) => { b.disabled = true; b.classList.remove("selected"); });
        opts[ex.answer].classList.add("ok");
        if (ctl.result && ctl.result.given !== null && !ctl.result.ok) opts[ctl.result.given].classList.add("bad");
      };
      ctl.answered = () => sel !== null;
      return ctl;
    }

    if (ex.type === "gap") {
      const inputs = [...card.querySelectorAll(".gap-input")];
      const multi = inputs.length > 1;
      const accepted = multi ? ex.answers : [ex.answers];
      inputs.forEach((inp, k) => {
        const size = () => { inp.style.width = Math.max(multi ? 8 : 12, inp.value.length + 3) + "ch"; };
        inp.addEventListener("input", () => { size(); if (deferred) report(ctl, false, true); });
        inp.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (k < inputs.length - 1) { inputs[k + 1].focus(); return; }
          if (!deferred && inputs.every((x) => x.value.trim())) { finish(ctl.evaluate()); focusNext(card); }
          else if (deferred) focusNext(card);
        });
      });
      ctl.evaluate = () => {
        const vals = inputs.map((x) => x.value.trim());
        const okEach = vals.map((v, k) => !!v && matches(v, accepted[k] || []));
        const any = vals.some(Boolean);
        const ok = okEach.every(Boolean);
        okEach.forEach((o, k) => inputs[k].classList.add(o ? "ok" : "bad"));
        const show = accepted.map((a) => a.map((x) => esc(displayAnswer(x))).join(" / "));
        const extra = ok
          ? (accepted.some((a) => a.length > 1) ? ` <span class="muted">(akceptowane: ${show.join(" … ")})</span>` : "")
          : ` Poprawnie: <b>${show.join("</b> … <b>")}</b>.`;
        return { ok, given: any ? vals : null, extra };
      };
      ctl.lock = () => inputs.forEach((x) => { x.disabled = true; });
      ctl.answered = () => inputs.some((x) => x.value.trim());
      if (!deferred) {
        actions.innerHTML = `<button class="btn small check">Sprawdź</button><button class="btn small giveup">Pokaż odpowiedź</button>`;
        actions.querySelector(".check").addEventListener("click", () => { if (inputs.every((x) => x.value.trim())) finish(ctl.evaluate()); else inputs.find((x) => !x.value.trim()).focus(); });
        actions.querySelector(".giveup").addEventListener("click", () => { const r = ctl.evaluate(); r.ok = false; r.given = null; finish(r); });
      }
      return ctl;
    }

    if (ex.type === "write" || ex.type === "dictation") {
      const ta = card.querySelector(".w-input");
      if (ex.type === "dictation") {
        let plays = 0;
        const cnt = card.querySelector(".d-count");
        const play = (btn, rate) => {
          speak(ex.say, btn, rate, (err) => syncTtsWarn(err));
          plays++; cnt.textContent = plays > 1 ? `odtworzono ${plays}×` : "";
          if (!done) ta.focus({ preventScroll: true });
        };
        card.querySelector(".d-play").addEventListener("click", (e) => play(e.currentTarget));
        card.querySelector(".d-slow").addEventListener("click", (e) => play(e.currentTarget, 0.7));
        // Ctrl+spacja w polu – odtwórz jeszcze raz (bez odrywania rąk od klawiatury).
        ta.addEventListener("keydown", (e) => { if (e.key === " " && (e.ctrlKey || e.metaKey)) { e.preventDefault(); play(card.querySelector(".d-play")); } });
      }
      const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
      ta.addEventListener("input", () => { grow(); if (deferred) report(ctl, false, true); });
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (!deferred && ta.value.trim()) { finish(ctl.evaluate()); focusNext(card); } else if (deferred) focusNext(card);
        }
      });
      ctl.evaluate = () => {
        const v = ta.value.trim();
        const all = ex.answers.map((a) => esc(displayAnswer(a)));
        if (!v) return { ok: false, given: null, extra: `<div class="w-correct">Poprawnie: <b>${all[0]}</b> ${speakBtn(firstVariant(ex.answers[0]))}${all.length > 1 ? `<div class="muted">Inne poprawne: ${all.slice(1).join(" · ")}</div>` : ""}</div>` };
        const ok = matches(v, ex.answers);
        const extra = ok && ex.type === "dictation" ? ` <b>${esc(ex.say)}</b> ${speakBtn(ex.say)}`
          : ok ? ` ${speakBtn(v)}${(() => { const o = ex.answers.filter((a) => !matches(v, [a])).map((a) => esc(displayAnswer(a))); return o.length ? `<div class="muted">Inne poprawne wersje: ${o.join(" · ")}</div>` : ""; })()}`
          : diffHtml(v, ex.answers) + (all.length > 1 ? `<div class="muted">Wszystkie akceptowane: ${all.join(" · ")}</div>` : "");
        return { ok, given: v, extra };
      };
      ctl.lock = () => { ta.disabled = true; ta.classList.add(ctl.result && ctl.result.ok ? "ok" : "bad"); };
      ctl.answered = () => !!ta.value.trim();
      if (!deferred) {
        actions.innerHTML = `<button class="btn small check">Sprawdź</button><button class="btn small giveup">Pokaż odpowiedź</button>`;
        actions.querySelector(".check").addEventListener("click", () => { if (ta.value.trim()) finish(ctl.evaluate()); else ta.focus(); });
        actions.querySelector(".giveup").addEventListener("click", () => { ta.value = ""; finish(ctl.evaluate()); });
      }
      return ctl;
    }

    if (ex.type === "order") {
      const line = card.querySelector(".o-line"), bank = card.querySelector(".o-bank");
      const { toks, end } = orderTokens(ex);
      bank.innerHTML = toks.map((t, k) => `<button class="o-chip" data-k="${k}">${esc(t)}</button>`).join("");
      const placeholder = line.querySelector(".o-placeholder");
      const sync = () => { placeholder.style.display = line.querySelector(".o-chip") ? "none" : ""; if (deferred) report(ctl, false, true); };
      card.addEventListener("click", (e) => {
        const chip = e.target.closest(".o-chip"); if (!chip || done) return;
        if (chip.parentElement === bank) line.appendChild(chip); else bank.appendChild(chip);
        sync();
      });
      const sentence = () => [...line.querySelectorAll(".o-chip")].map((c) => c.textContent).join(" ");
      ctl.evaluate = () => {
        const v = sentence();
        const all = ex.answers.map((a) => esc(displayAnswer(a)));
        if (!v) return { ok: false, given: null, extra: ` Poprawnie: <b>${all[0]}</b> ${speakBtn(firstVariant(ex.answers[0]))}` };
        const ok = matches(v, ex.answers);
        return { ok, given: v, extra: ok ? ` <b>${esc(v.charAt(0).toUpperCase() + v.slice(1))}${end}</b> ${speakBtn(v)}${all.length > 1 ? `<div class="muted">Też poprawnie: ${all.join(" · ")}</div>` : ""}` : diffHtml(v + end, ex.answers) };
      };
      ctl.lock = () => { card.querySelectorAll(".o-chip").forEach((c) => { c.disabled = true; }); };
      ctl.answered = () => !!line.querySelector(".o-chip");
      if (!deferred) {
        actions.innerHTML = `<button class="btn small check">Sprawdź</button><button class="btn small reset">Wyczyść</button><button class="btn small giveup">Pokaż odpowiedź</button>`;
        actions.querySelector(".check").addEventListener("click", () => { if (bank.querySelector(".o-chip") && !(ex.extra || []).length) { bank.classList.add("nudge"); setTimeout(() => bank.classList.remove("nudge"), 400); return; } finish(ctl.evaluate()); });
        actions.querySelector(".reset").addEventListener("click", () => { line.querySelectorAll(".o-chip").forEach((c) => bank.appendChild(c)); sync(); });
        actions.querySelector(".giveup").addEventListener("click", () => { line.querySelectorAll(".o-chip").forEach((c) => bank.appendChild(c)); sync(); finish(ctl.evaluate()); });
      }
      return ctl;
    }
    return null;
  }

  function focusNext(card) {
    let n = card.nextElementSibling;
    while (n) { const inp = n.querySelector("input:not(:disabled), textarea:not(:disabled)"); if (inp) { inp.focus({ preventScroll: false }); return; } n = n.nextElementSibling; }
  }

  // items: [{ex, lesson}] ; opts: {key, mode: "instant"|"deferred", showSource, onDone}
  function renderExercises(container, items, opts = {}) {
    const mode = opts.mode || "instant";
    const deferred = mode === "deferred";
    let answered = 0, correct = 0;
    const total = items.length;
    const scoreEl = container.querySelector(".score");
    const resultEl = container.querySelector(".result-slot");
    resultEl.innerHTML = "";
    const list = container.querySelector(".ex-list");
    list.innerHTML = items.map(({ ex, lesson }, i) => {
      const src = lesson && opts.showSource ? `<div class="ex-source">z lekcji: <a href="#/lesson/${lesson.id}">${esc(lesson.title)}</a> ${badge(lesson.level)}${ex.type !== "choice" && ex.type !== "gap" ? ` · ${TYPE_LABEL[ex.type]}` : ""}</div>` : "";
      return exerciseHtml(ex, i, src);
    }).join("");

    const ctls = [];
    const finishAll = () => {
      const p = Math.round((correct / total) * 100);
      const msg = p === 100 ? "Perfekcyjnie! 🎉" : p >= 80 ? "Bardzo dobrze! 👏" : p >= 50 ? "Nieźle — przejrzyj błędy i spróbuj jeszcze raz." : "Warto wrócić do teorii i powtórzyć ćwiczenia.";
      resultEl.innerHTML = `<div class="card result-banner"><b>${correct} / ${total} (${p}%)</b><div>${msg}</div></div>`;
      if (opts.key) { saveScore(opts.key, correct, total); }
      if (opts.onDone) opts.onDone(correct, total, ctls);
    };
    const updateScore = () => {
      if (deferred && !container.classList.contains("checked")) {
        const n = ctls.filter((c) => c.answered()).length;
        scoreEl.innerHTML = `Odpowiedziano: <b>${n}</b> / ${total}`;
        return;
      }
      scoreEl.innerHTML = `Wynik: <b>${correct}</b> / ${total}` + (answered < total ? ` <span class="muted">(odpowiedziano ${answered})</span>` : "");
    };
    let finished = false;
    // „Moje błędy”: zapis każdej odpowiedzi. Pominięte pytanie w teście (sprawdzanie na końcu) się nie liczy,
    // „Pokaż odpowiedź” – tak. Samoocena „Moja odpowiedź też jest poprawna” cofa zapisany błąd.
    // Dziennik nauki: każde zadanie z odpowiedzią (te same zasady pomijania), samoocena dolicza „dobrze”.
    const trackActivity = (ctl, upgrade) => {
      if (upgrade) { if (ctl.aLogged && !ctl.aOk) { ctl.aOk = true; logActivity({ ok: 1 }); } return; }
      if (deferred && ctl.result.given == null) return;
      ctl.aLogged = true; ctl.aOk = !!ctl.result.ok;
      logActivity({ t: 1, ok: ctl.aOk ? 1 : 0 });
    };
    const track = (ctl, upgrade) => {
      trackActivity(ctl, upgrade);
      const key = KEY_OF.get(ctl.ex);
      if (!key) return; // np. quiz ze słówek
      if (upgrade) {
        if (!("mPrev" in ctl)) return;
        if (ctl.mPrev) state.mistakes[key] = ctl.mPrev; else delete state.mistakes[key];
        recordResult(key, true);
      } else {
        if (deferred && ctl.result.given == null) return;
        ctl.mPrev = state.mistakes[key];
        recordResult(key, ctl.result.ok);
      }
      syncTodayCounts();
    };
    const report = (ctl, upgrade, onlyProgress) => {
      if (onlyProgress) { updateScore(); return; }
      track(ctl, upgrade);
      if (upgrade) { correct++; updateScore(); if (finished) { finishAll(); } return; }
      answered++; if (ctl.result.ok) correct++;
      updateScore();
      if (answered === total && !finished) { finished = true; finishAll(); }
    };
    list.querySelectorAll(".exercise").forEach((card) => {
      const c = makeController(card, items[+card.dataset.i].ex, mode, report);
      if (c) ctls.push(c);
    });
    container.classList.remove("checked");
    const checkBtn = container.querySelector(".check-all");
    if (checkBtn) {
      checkBtn.style.display = deferred ? "" : "none";
      checkBtn.onclick = () => {
        const left = ctls.filter((c) => !c.answered()).length;
        if (left && !confirm(`Nie odpowiedziano na ${left} ${left === 1 ? "pytanie" : "pytań"}. Zakończyć test mimo to?`)) return;
        container.classList.add("checked");
        checkBtn.style.display = "none";
        ctls.forEach((c) => c.finish(c.evaluate()));
        resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
      };
    }
    updateScore();
  }

  function exercisesShell(title, opts = {}) {
    return `<div class="exercises" ${opts.id ? `id="${opts.id}"` : ""}>
      <div class="exercises-head">${opts.h3 ? `<h3>${title}</h3>` : `<h2>${title}</h2>`}<span class="score"></span></div>
      ${opts.intro ? `<div class="ex-intro">${opts.intro}</div>` : ""}
      <div class="ex-list"></div>
      <button class="btn primary check-all" style="display:none">Zakończ i sprawdź ${icon("check")}</button>
      <div class="result-slot"></div>
      <div class="ex-footer"><button class="btn retry">${icon("rotate")} ${opts.retryLabel || "Od nowa"}</button>${opts.extraBtn || ""}</div>
    </div>`;
  }

  // ---------- Słownictwo (komponent wspólny: lekcje i działy tematyczne) ----------
  // Warianty akceptowane w quizie: „flat / apartment”, „(to) arrive”, „a headache”.
  function vocabAnswers(en) {
    const base = stripTags(en).replace(/\((AmE|BrE|US|UK|pot\.|form\.|inf\.)\)/gi, "");
    const alts = base.split(/\s*[\/;]\s*/).map((s) => s.trim()).filter(Boolean);
    const out = new Set();
    for (const a of alts) {
      for (const v of expandAnswer(a)) {
        const s = v.replace(/\s+/g, " ").trim();
        if (!s) continue;
        out.add(s);
        out.add(s.replace(/^(to|a|an|the)\s+/i, ""));
      }
    }
    return [...out];
  }
  // Wypełniacze typu „accuse (sb) of” / „do someone a favour” – pomijamy je po obu stronach.
  const dropFillers = (s) => normalize(s).replace(/\b(sb|sth|somebody|someone|something|one's|sb's)\b/g, " ").replace(/^(to|a|an|the)\s+/, "").replace(/\s+/g, " ").trim();
  const vocabMatch = (given, en) => {
    const g = dropFillers(given);
    return vocabAnswers(en).some((a) => matchOne(g, dropFillers(a)));
  };
  const knownSet = (key) => (state.known[key] = state.known[key] || {});

  function vocabListHtml(groups, key) {
    const known = knownSet(key);
    return groups.map((g) => `
      ${g.title ? `<h3 class="v-group-title">${g.title}</h3>` : ""}
      ${g.intro ? `<p class="v-group-intro">${g.intro}</p>` : ""}
      <div class="card vlist">${(g.items || []).map((w) => `
        <div class="vrow ${known[stripTags(w.en)] ? "known" : ""}" data-en="${esc(stripTags(w.en))}">
          ${speakBtn(w.en.replace(/\((AmE|BrE|US|UK)\)/g, ""))}
          <div class="v-main"><div class="v-en">${w.en}${w.pos ? ` <span class="v-pos">${w.pos}</span>` : ""}</div><div class="v-pl ex-pl">${w.pl}</div>
          ${w.ex ? `<div class="v-ex">${speakBtn(w.ex)}<span><i>${w.ex}</i>${w.exPl ? `<span class="ex-pl v-expl"> – ${w.exPl}</span>` : ""}</span></div>` : ""}
          ${w.note ? `<div class="ex-note">${w.note}</div>` : ""}</div>
          <button class="v-known" title="Oznacz jako znane">${icon("check")}</button>
        </div>`).join("")}</div>`).join("");
  }

  function vocabBlockHtml(groups, key, opts = {}) {
    const n = groups.reduce((s, g) => s + (g.items || []).length, 0);
    const k = Object.keys(knownSet(key)).length;
    return `<div class="vocab-block ${state.showPl ? "" : "hide-pl"}" data-vkey="${esc(key)}">
      <div class="v-toolbar">
        <div class="seg">
          <button class="seg-btn active" data-vmode="list">${icon("list")} Lista</button>
          <button class="seg-btn" data-vmode="cards">${icon("cards")} Fiszki</button>
          <button class="seg-btn" data-vmode="quiz-en">${icon("pen")} Wpisz po angielsku</button>
          <button class="seg-btn" data-vmode="quiz-pl">${icon("type")} Wybierz znaczenie</button>
        </div>
        <span class="v-progress">znasz <b class="v-k">${k}</b> z ${n}</span>
      </div>
      ${opts.intro ? `<div class="v-intro prose">${opts.intro}</div>` : ""}
      <div class="v-pane" data-pane="list">
        <label class="toggle"><input type="checkbox" class="v-pl-toggle" ${state.showPl ? "checked" : ""}> Pokaż tłumaczenia</label>
        ${vocabListHtml(groups, key)}
      </div>
      <div class="v-pane" data-pane="cards" hidden></div>
      <div class="v-pane" data-pane="quiz-en" hidden></div>
      <div class="v-pane" data-pane="quiz-pl" hidden></div>
    </div>`;
  }

  function bindVocabBlock(root, groups, key) {
    if (!root) return;
    const items = groups.flatMap((g) => g.items || []);
    const known = knownSet(key);
    const refreshK = () => { root.querySelector(".v-k").textContent = Object.keys(known).length; };
    root.querySelector(".v-pl-toggle").addEventListener("change", (e) => {
      state.showPl = e.target.checked; save();
      root.classList.toggle("hide-pl", !state.showPl);
      const art = root.closest(".lesson"); if (art) art.classList.toggle("hide-pl", !state.showPl);
    });
    root.addEventListener("click", (e) => {
      const kb = e.target.closest(".v-known"); if (!kb) return;
      const row = kb.closest(".vrow"); const w = row.dataset.en;
      if (known[w]) delete known[w]; else known[w] = 1;
      // „Znam” bez fiszki = jak przy migracji: pudełko 3 (odznaczenie nie zmienia powtórek).
      const k = wordKey(w);
      if (known[w] && !state.srs[k] && WORDS.has(k)) state.srs[k] = knownEntry(k, key);
      row.classList.toggle("known", !!known[w]); save(); refreshK(); syncTodayCounts();
    });
    const panes = Object.fromEntries([...root.querySelectorAll(".v-pane")].map((p) => [p.dataset.pane, p]));
    const modes = {
      cards: () => runFlashcards(panes.cards, items, key, refreshK),
      "quiz-en": () => runQuiz(panes["quiz-en"], items, "en"),
      "quiz-pl": () => runQuiz(panes["quiz-pl"], items, "pl"),
    };
    root.querySelectorAll(".seg-btn").forEach((b) => b.addEventListener("click", () => {
      root.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x === b));
      for (const [k, p] of Object.entries(panes)) p.hidden = k !== b.dataset.vmode;
      if (modes[b.dataset.vmode]) modes[b.dataset.vmode]();
    }));
  }

  // Fiszki z oceną „Nie wiem / Trudne / Wiem” – w taliach (lekcja, dział) i w „Słówkach na dziś”.
  // cards: [{ k, w, deck, also }]. „Nie wiem” odsłania odpowiedź, a karta wraca na koniec talii.
  // opts: { onRate(card, rating), onEnd(stats [nie wiem, trudne, wiem] – pierwsze oceny), top, afterDraw(), note }.
  let fcDir = "en"; // co widać na awersie – wspólne dla wszystkich fiszek
  const RATE_BTNS = [["fc-bad", icon("x") + " Nie wiem"], ["fc-hard", "~ Trudne"], ["fc-ok primary", icon("check") + " Wiem"]];
  function flashcards(pane, cards, opts) {
    const queue = cards.slice(), rated = new Set(), stats = [0, 0, 0];
    let i = 0;
    const draw = () => {
      if (i >= queue.length) { opts.onEnd(stats); return; }
      const c = queue[i], w = c.w;
      const en = `<div class="fc-word">${w.en}</div>`, pl = `<div class="fc-word">${w.pl}</div>`;
      const also = c.also && c.also.length ? `<div class="fc-also">też: ${c.also.map(esc).join(" · ")}</div>` : "";
      pane.innerHTML = `${opts.note ? `<p class="fc-note">${opts.note}</p>` : ""}
        <div class="fc-top"><span>${i + 1} / ${queue.length}</span>
          <label class="toggle"><input type="checkbox" class="fc-dir" ${fcDir === "pl" ? "checked" : ""}> Najpierw po polsku</label>${opts.top || ""}</div>
        <div class="card flashcard" tabindex="0" title="Kliknij lub naciśnij spację, aby odwrócić">
          <div class="fc-front">${fcDir === "en" ? en : pl}<div class="fc-hint">kliknij, aby odwrócić</div></div>
          <div class="fc-back" hidden>${fcDir === "en" ? pl + also : en}${w.ex ? `<div class="fc-ex"><i>${w.ex}</i>${w.exPl ? `<br><span>${w.exPl}</span>` : ""}</div>` : ""}</div>
        </div>
        <div class="fc-actions">${speakBtn(w.en)}${RATE_BTNS.map(([cls, label], r) => `<button class="btn ${cls}" data-r="${r}">${label}</button>`).join("")}</div>
        <div class="fc-keys">Spacja – odwróć · klawisze 1 / 2 / 3 – ocena</div>`;
      const card = pane.querySelector(".flashcard"), front = pane.querySelector(".fc-front"), back = pane.querySelector(".fc-back");
      const flip = () => { front.hidden = !front.hidden; back.hidden = !back.hidden; };
      let next = null; // po „Nie wiem”: odpowiedź widoczna, czekamy na „Dalej”
      const rate = (r) => {
        if (next) return next();
        if (!rated.has(c)) { rated.add(c); stats[r]++; }
        opts.onRate(c, r);
        if (r !== 0) { i++; draw(); return; }
        queue.push(c);
        front.hidden = true; back.hidden = false;
        next = () => { i++; draw(); };
        pane.querySelector(".fc-actions").innerHTML = `${speakBtn(w.en)}<button class="btn primary fc-next">Dalej →</button>`;
        pane.querySelector(".fc-next").onclick = next;
        card.focus({ preventScroll: true });
      };
      card.onclick = () => { if (!next) flip(); };
      card.onkeydown = (e) => {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (next) next(); else flip(); }
        else if (["1", "2", "3"].includes(e.key)) { e.preventDefault(); rate(+e.key - 1); }
      };
      pane.querySelectorAll("[data-r]").forEach((b) => { b.onclick = () => rate(+b.dataset.r); });
      pane.querySelector(".fc-dir").onchange = (e) => { fcDir = e.target.checked ? "pl" : "en"; draw(); };
      if (opts.afterDraw) opts.afterDraw();
      card.focus({ preventScroll: true });
    };
    draw();
  }
  const fcStatsHtml = (s) => `Wiem: ${s[2]} · Trudne: ${s[1]} · Nie wiem: ${s[0]}`;

  function runFlashcards(pane, items, key, refreshK) {
    const known = knownSet(key);
    let onlyUnknown = items.some((w) => !known[stripTags(w.en)]);
    const markRow = (w, k) => {
      const row = pane.closest(".vocab-block").querySelector(`.vrow[data-en="${CSS.escape(stripTags(w.en))}"]`);
      if (row) row.classList.toggle("known", k);
    };
    const start = () => {
      const pool = onlyUnknown ? items.filter((w) => !known[stripTags(w.en)]) : items;
      flashcards(pane, shuffle(pool.length ? pool : items).map((w) => ({ k: wordKey(w.en), w, deck: key })), {
        note: `Oceny trafiają do <a href="#/slowka">${icon("cards")} Słówek na dziś</a> – słówko wróci wtedy, gdy trzeba je powtórzyć.`,
        top: `<label class="toggle"><input type="checkbox" class="fc-only" ${onlyUnknown ? "checked" : ""}> Tylko nieznane</label>`,
        afterDraw: () => { pane.querySelector(".fc-only").onchange = (e) => { onlyUnknown = e.target.checked; start(); }; },
        onRate: (c, r) => {
          rateWord(c.k, r, key);
          const en = stripTags(c.w.en);
          if (r === 2) known[en] = 1; else if (r === 0) delete known[en];
          save(); refreshK(); markRow(c.w, !!known[en]); syncTodayCounts();
        },
        onEnd: (st) => {
          pane.innerHTML = `<div class="card fc-done"><b>Koniec talii! 🎉</b><p>${fcStatsHtml(st)}</p>
            <button class="btn primary fc-again">${icon("rotate")} Jeszcze raz (nieznane)</button> <button class="btn fc-all">Cała talia</button></div>`;
          pane.querySelector(".fc-again").onclick = () => { onlyUnknown = true; start(); };
          pane.querySelector(".fc-all").onclick = () => { onlyUnknown = false; start(); };
        },
      });
    };
    start();
  }

  function runQuiz(pane, items, dir) {
    const N = Math.min(20, items.length);
    const build = () => {
      const pick = shuffle(items).slice(0, N);
      const exs = pick.map((w) => {
        if (dir === "en") {
          return { ex: { type: "vocab", q: w.pl, en: w.en, explain: w.ex ? `<i>${w.ex}</i>${w.exPl ? ` – ${w.exPl}` : ""}` : "" } };
        }
        const others = shuffle(items.filter((x) => x !== w && stripTags(x.pl) !== stripTags(w.pl))).slice(0, 3);
        const opts = shuffle([w, ...others]);
        return { ex: { type: "choice", q: `<b>${w.en}</b> ${speakBtn(w.en)}`, options: opts.map((o) => o.pl), answer: opts.indexOf(w), explain: w.ex ? `<i>${w.ex}</i>${w.exPl ? ` – ${w.exPl}` : ""}` : "" } };
      });
      pane.innerHTML = exercisesShell(dir === "en" ? "Wpisz słowo po angielsku" : "Wybierz polskie znaczenie", { h3: true, retryLabel: "Nowe losowanie", intro: dir === "en" ? "Wystarczy samo słowo/wyrażenie (bez „to” i przedimka). Losowane " + N + " słówek." : "Losowane " + N + " słówek." });
      const box = pane.firstElementChild;
      if (dir === "en") renderVocabWrite(box, exs);
      else renderExercises(box, exs, {});
      box.querySelector(".retry").onclick = build;
    };
    build();
  }

  // Quiz PL→EN: osobny prosty renderer (porównanie z wariantami słówka).
  function renderVocabWrite(box, exs) {
    let answered = 0, correct = 0;
    const total = exs.length, scoreEl = box.querySelector(".score"), list = box.querySelector(".ex-list");
    const upd = () => { scoreEl.innerHTML = `Wynik: <b>${correct}</b> / ${total}`; if (answered === total) box.querySelector(".result-slot").innerHTML = `<div class="card result-banner"><b>${correct} / ${total}</b></div>`; };
    list.innerHTML = exs.map(({ ex }, i) => `<div class="card exercise" data-i="${i}"><div class="ex-q"><span class="ex-num">${i + 1}.</span><div>${ex.q} → <input class="gap-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></div></div><div class="gap-actions"><button class="btn small check">Sprawdź</button><button class="btn small giveup">Nie wiem</button></div><div class="fb"></div></div>`).join("");
    list.querySelectorAll(".exercise").forEach((card) => {
      const ex = exs[+card.dataset.i].ex, inp = card.querySelector("input");
      const fin = (v) => {
        const ok = v != null && vocabMatch(v, ex.en);
        inp.disabled = true; inp.classList.add(ok ? "ok" : "bad"); card.classList.add(ok ? "correct" : "wrong");
        card.querySelector(".gap-actions").remove();
        card.querySelector(".fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${icon(ok ? "check" : "x")}${ok ? " Dobrze!" : ""}</span> <b>${ex.en}</b> ${speakBtn(ex.en)} ${ex.explain ? `<div class="muted">${ex.explain}</div>` : ""}</div>`;
        answered++; if (ok) correct++; upd();
      };
      card.querySelector(".check").onclick = () => { if (inp.value.trim()) fin(inp.value); else inp.focus(); };
      card.querySelector(".giveup").onclick = () => fin(null);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && inp.value.trim()) { fin(inp.value); focusNext(card); } });
    });
    upd();
  }

  // ---------- Lekcja ----------
  function syncDoneBtn(btn, id) {
    const d = !!state.done[id];
    btn.classList.toggle("done", d);
    btn.innerHTML = d ? icon("check") + " Przerobione" : "Oznacz jako przerobione";
  }
  const TABS = [
    { id: "", label: icon("book-open") + " Lekcja" },
    { id: "vocab", label: icon("type") + " Słownictwo", count: (l) => (l.vocab && l.vocab.items || []).length },
    { id: "practice", label: icon("pen") + " Ćwiczenia", count: (l) => (l.exercises || []).length + practiceCount(l) },
    { id: "test", label: icon("test") + " Test", count: (l) => l.test.length },
    { id: "dictation", label: icon("headphones") + " Dyktando", count: (l) => l.dict.length },
  ];
  function lessonTab() { const m = location.hash.match(/^#\/lesson\/[\w-]+\/(\w+)/); return m ? m[1] : ""; }

  function renderLesson(id) {
    const l = BY_ID[id];
    if (!l) return `<div class="page empty"><h1>Nie znaleziono lekcji</h1><p><a href="#/">Wróć na stronę główną</a></p></div>`;
    const tab = lessonTab();
    const pos = PATH.indexOf(l);
    const prev = PATH[pos - 1], next = PATH[pos + 1];
    const best = state.scores[id];
    const tabs = TABS.filter((t) => !t.count || t.count(l) > 0);
    let body = "";
    if (tab === "vocab" && l.vocab) body = renderLessonVocab(l);
    else if (tab === "practice") body = renderLessonPractice(l);
    else if (tab === "test" && l.test.length) body = renderLessonTest(l);
    else if (tab === "dictation" && l.dict.length) body = renderLessonDictation(l);
    else body = renderLessonTheory(l);
    return `<article class="page lesson ${state.showPl ? "" : "hide-pl"}" id="lesson">
      <div class="lesson-head">
        <div class="crumbs" data-level="${l.level}">${badge(l.level)} <span>${esc(l.category)}</span> · <span>${LEVEL_INFO[l.level].name}</span>${best ? ` · <span>sprawdzian: ${best.correct}/${best.total}</span>` : ""}${state.scores[id + "::test"] ? ` · <span>test: ${state.scores[id + "::test"].correct}/${state.scores[id + "::test"].total}</span>` : ""}</div>
        <h1>${esc(l.title)}</h1>
        <div class="title-pl">${esc(l.titlePl)}</div>
        <p class="summary">${l.summary}</p>
        <nav class="tabs" role="tablist">${tabs.map((t) => `<a role="tab" class="tab ${t.id === tab || (!t.id && !tabs.some((x) => x.id === tab)) ? "active" : ""}" href="#/lesson/${id}${t.id ? "/" + t.id : ""}">${t.label}${t.count ? ` <span class="tab-n">${t.count(l)}</span>` : ""}</a>`).join("")}</nav>
      </div>
      ${body}
      <div class="pager">
        ${prev ? `<a class="card prev" href="#/lesson/${prev.id}"><small>← Poprzednia</small>${esc(prev.title)} ${badge(prev.level)}</a>` : "<span></span>"}
        ${CP_AFTER[id] ? `<a class="card next cp-next" href="#/sprawdzian/${CP_AFTER[id].id}"><small>Następny krok →</small>${icon("flag")} Sprawdzian ${CP_AFTER[id].n}: ${esc(CP_AFTER[id].title)}</a>`
          : next ? `<a class="card next" href="#/lesson/${next.id}"><small>Następna →</small>${badge(next.level)} ${esc(next.title)}</a>` : ""}
      </div>
    </article>`;
  }

  function renderLessonTheory(l) {
    const titled = l.sections.map((s, i) => ({ s, i })).filter(({ s }) => s.title || ["formula", "examples", "mistakes"].includes(s.type));
    const req = (l.requires || []).map((r) => BY_ID[r]).filter(Boolean);
    const v = l.vocab && l.vocab.items || [];
    const prep = req.length || v.length ? `<div class="card prep">
        <h3>${icon("briefcase")} Zanim zaczniesz</h3>
        ${req.length ? `<p><b>Powinieneś znać:</b> ${req.map((r) => `<a href="#/lesson/${r.id}">${esc(r.title)}</a>${state.done[r.id] ? " " + icon("check") : ""}`).join(", ")}</p>` : ""}
        ${v.length ? `<p><b>Słówka potrzebne w tej lekcji</b> (${v.length}): ${v.slice(0, 14).map((w) => `<span class="w-chip" title="${esc(stripTags(w.pl))}">${w.en}</span>`).join(" ")}${v.length > 14 ? " …" : ""}</p>
        <a class="btn small" href="#/lesson/${l.id}/vocab">${icon("type")} Przećwicz słówka →</a>` : ""}
      </div>` : "";
    const nPractice = practiceCount(l);
    const toc = titled.map(({ s, i }) => ({ id: `s-${i}-${slug(s.title || s.type)}`, label: stripTags(s.title || (s.type === "formula" ? "Budowa" : s.type === "examples" ? "Przykłady" : "Typowe błędy")) }));
    if ((l.exercises || []).length) toc.push({ id: "exercises", label: "Szybki sprawdzian" });
    return `
      <div class="toolbar">
        <label class="toggle"><input type="checkbox" id="plToggle" ${state.showPl ? "checked" : ""}> Pokaż tłumaczenia</label>
        <span class="spacer"></span>
        <a class="btn small" href="#exercises" data-scroll="exercises">${icon("pen")} Sprawdzian (${(l.exercises || []).length})</a>
        <button class="btn small" id="doneBtn"></button>
      </div>
      <div class="lesson-body">
      ${toc.length ? `<aside class="toc-col"><details class="toc"${TOC_WIDE.matches ? " open" : ""}>
        <summary>${icon("list")} Spis treści <span class="toc-n">${toc.length}</span></summary>
        <nav aria-label="Spis treści"><ol class="toc-list">${toc.map((t) => `<li><a href="#${t.id}" data-scroll="${t.id}">${t.label}</a></li>`).join("")}</ol></nav>
      </details></aside>` : ""}
      <div class="lesson-main">
      ${prep}
      ${l.sections.map(renderSection).join("")}
      ${exercisesShell("Szybki sprawdzian", { id: "exercises" })}
      ${nPractice || l.test.length ? `<div class="card next-steps"><b>Co dalej?</b>
        ${nPractice ? `<a class="btn" href="#/lesson/${l.id}/practice">${icon("pen")} Więcej ćwiczeń (${nPractice})</a>` : ""}
        ${l.test.length ? `<a class="btn primary" href="#/lesson/${l.id}/test">${icon("test")} Test – pisanie zdań (${l.test.length})</a>` : ""}</div>` : ""}
      </div></div>`;
  }

  // ---------- Spis treści lekcji ----------
  // Szeroki ekran: stała prawa kolumna (zawsze rozwinięta). Węższy: zwinięte <details>.
  const TOC_WIDE = window.matchMedia("(min-width: 1280px)");
  let tocCleanup = null;
  function bindToc(art) {
    const toc = art.querySelector("details.toc"); if (!toc) return;
    toc.open = TOC_WIDE.matches;
    toc.querySelector("summary").addEventListener("click", (e) => { if (TOC_WIDE.matches) e.preventDefault(); });
    const col = toc.closest(".toc-col");
    const links = [...toc.querySelectorAll("a[data-scroll]")];
    const targets = links.map((a) => document.getElementById(a.dataset.scroll));
    let cur = -2;
    // Aktywna sekcja = ostatni nagłówek, który minął linię na 30% wysokości okna.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let k = -1;
      targets.forEach((t, j) => { if (t && t.getBoundingClientRect().top < line) k = j; });
      if (k === cur) return;
      cur = k;
      links.forEach((a, j) => { a.classList.toggle("active", j === k); if (j === k) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
      const a = links[k];
      if (a && col.scrollHeight > col.clientHeight + 1 && (a.offsetTop < col.scrollTop || a.offsetTop + a.offsetHeight > col.scrollTop + col.clientHeight)) col.scrollTop = a.offsetTop - col.clientHeight / 2;
    };
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    tocCleanup = () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
    update();
  }
  TOC_WIDE.addEventListener && TOC_WIDE.addEventListener("change", () => { const d = document.querySelector("details.toc"); if (d) d.open = TOC_WIDE.matches; });

  function renderLessonVocab(l) {
    return `<section class="block"><h2>Słownictwo do tej lekcji</h2>
      <p class="muted-p">${l.vocab.intro || "Te słowa pojawiają się w przykładach i ćwiczeniach. Naucz się ich przed lekcją – wtedy skupisz się na gramatyce, a nie na słowniku."}</p>
      ${vocabBlockHtml([{ items: l.vocab.items }], "lesson:" + l.id)}</section>`;
  }

  function renderLessonPractice(l) {
    const sets = [];
    if ((l.exercises || []).length) sets.push({ title: "Szybki sprawdzian", instruction: "Podstawowe pytania z lekcji (te same co pod teorią).", items: l.exercises, key: l.id });
    l.practice.forEach((p, i) => sets.push({ ...p, key: `${l.id}::p${i}` }));
    return `<section class="block">
      <h2>Ćwiczenia</h2>
      <p class="muted-p">Zestawy ułożone od łatwiejszych do trudniejszych. Każdy zestaw sprawdza się osobno – wynik zapisuje się automatycznie.</p>
      <div class="sets">${sets.map((s, i) => `
        <details class="card set" data-set="${i}" ${i === (sets.length > 1 ? 1 : 0) ? "open" : ""}>
          <summary><span class="set-title">${s.title}</span><span class="set-meta">${s.items.length} zad. ${scorePill(state.scores[s.key])}</span></summary>
          <div class="set-body">${s.instruction ? `<div class="set-instr">${s.instruction}</div>` : ""}<div class="set-ex"></div></div>
        </details>`).join("")}</div>
      ${l.test.length ? `<div class="card next-steps"><b>Gotowe?</b><a class="btn primary" href="#/lesson/${l.id}/test">${icon("test")} Przejdź do testu (${l.test.length})</a></div>` : ""}
    </section>`;
  }

  function renderLessonTest(l) {
    const s = state.scores[l.id + "::test"];
    const types = [...new Set(l.test.map((x) => x.type))];
    return `<section class="block">
      <h2>Test: ${esc(l.title)}</h2>
      <div class="card test-intro">
        <p><b>${l.test.length} zadań.</b> ${types.includes("write") ? "Większość to pisanie <b>całych zdań</b> – tłumaczenie z polskiego, przekształcanie, poprawianie błędów. " : ""}Odpowiedzi <b>nie są sprawdzane na bieżąco</b> – zobaczysz wynik i poprawki dopiero po kliknięciu „Zakończ i sprawdź”.</p>
        <p class="muted">Wielka litera i kropka na końcu nie mają znaczenia. Formy skrócone i pełne (<i>don't / do not</i>) są równoważne. Jeśli automat nie zna Twojej (poprawnej) wersji, możesz ją zaliczyć przyciskiem „Moja odpowiedź też jest poprawna”.</p>
        ${s ? `<p>Twój najlepszy wynik: ${scorePill(s)}</p>` : ""}
      </div>
      <div id="testBox">${exercisesShell("Pytania", { h3: true, retryLabel: "Rozwiąż jeszcze raz" })}</div>
    </section>`;
  }

  // ---------- Dyktando ----------
  const DICT_ROUND = 10;
  const dictIntro = (more) => `<div class="tts-warn">${ttsWarnHtml()}</div>
    <div class="ex-intro">Kliknij <b>${icon("play")} Odtwórz</b>, posłuchaj i zapisz całe zdanie po angielsku. Możesz słuchać dowolnie wiele razy (<b>${icon("slow")} Wolniej</b> – wolniejsze tempo<span class="kbd-hint">, <kbd>Ctrl</kbd>+<kbd>spacja</kbd> w polu – jeszcze raz</span>). Wielka litera i interpunkcja nie mają znaczenia, formy skrócone i pełne (<i>I'm / I am</i>) są równoważne.${more || ""}</div>`;
  function renderLessonDictation(l) {
    const s = state.scores[l.id + "::dict"];
    return `<section class="block">
      <h2>${icon("headphones")} Dyktando</h2>
      <p class="muted-p">Zdania z przykładów w tej lekcji (${l.dict.length}) – za każdym razem ${Math.min(DICT_ROUND, l.dict.length)} losowych. Najpierw przeczytaj teorię, potem sprawdź, czy rozpoznajesz te zdania ze słuchu.${s ? ` Najlepszy wynik: ${scorePill(s)}` : ""}</p>
      <div id="dictBox">${exercisesShell("Posłuchaj i zapisz", { h3: true, retryLabel: "Nowe zdania" })}</div>
    </section>`;
  }

  function bindLesson(id) {
    const l = BY_ID[id]; if (!l) return;
    const tab = lessonTab();
    const art = $("#lesson");
    bindToc(art);
    if (tab === "vocab" && l.vocab) {
      bindVocabBlock(art.querySelector(".vocab-block"), [{ items: l.vocab.items }], "lesson:" + l.id);
      return;
    }
    if (tab === "practice") {
      const sets = [];
      if ((l.exercises || []).length) sets.push({ items: l.exercises, key: l.id, quick: true });
      l.practice.forEach((p, i) => sets.push({ ...p, key: `${l.id}::p${i}` }));
      art.querySelectorAll("details.set").forEach((d) => {
        const s = sets[+d.dataset.set];
        const mount = () => {
          if (d.dataset.ready) return; d.dataset.ready = 1;
          const host = d.querySelector(".set-ex");
          host.innerHTML = exercisesShell("", { h3: true });
          const box = host.firstElementChild;
          const run = () => renderExercises(box, s.items.map((ex) => ({ ex: withTask(ex, ex.task || "") })), {
            key: s.key,
            onDone: (c, t) => {
              d.querySelector(".set-meta").innerHTML = `${s.items.length} zad. ${scorePill(state.scores[s.key])}`;
              if (s.quick && c / t >= 0.8) { state.done[id] = true; save(); syncNavState(); }
            },
          });
          run();
          box.querySelector(".retry").addEventListener("click", () => { run(); d.scrollIntoView({ behavior: "smooth" }); });
        };
        if (d.open) mount();
        d.addEventListener("toggle", () => { if (d.open) mount(); });
      });
      return;
    }
    if (tab === "dictation" && l.dict.length) {
      const box = $("#dictBox").firstElementChild;
      box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", dictIntro());
      const run = () => renderExercises(box, shuffle(l.dict).slice(0, DICT_ROUND).map((ex) => ({ ex })), { key: l.id + "::dict" });
      run();
      box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
      return;
    }
    if (tab === "test" && l.test.length) {
      const box = $("#testBox").firstElementChild;
      const run = () => renderExercises(box, l.test.map((ex) => ({ ex })), { key: l.id + "::test", mode: "deferred" });
      run();
      box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
      return;
    }
    $("#plToggle").addEventListener("change", (e) => { state.showPl = e.target.checked; save(); art.classList.toggle("hide-pl", !state.showPl); });
    const doneBtn = $("#doneBtn"); syncDoneBtn(doneBtn, id);
    doneBtn.addEventListener("click", () => { state.done[id] = !state.done[id]; if (!state.done[id]) delete state.done[id]; save(); syncDoneBtn(doneBtn, id); syncNavState(); });
    const box = $("#exercises");
    const run = () => renderExercises(box, (l.exercises || []).map((ex) => ({ ex, lesson: l })), {
      key: id,
      onDone: (c, t) => { if (c / t >= 0.8) { state.done[id] = true; save(); syncNavState(); syncDoneBtn(doneBtn, id); } },
    });
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
  }

  // ---------- Talia Anki do pobrania ----------
  const ANKI_FILE = "downloads/Angielski_A1-B2.apkg";
  function ankiCard() {
    return `<div class="card anki-dl">
      <span class="f-ico">${icon("archive")}</span>
      <div class="anki-txt"><b>Talia Anki do pobrania</b>
        <span>Ok. 4500 słówek A1–B2 (plus trochę C1) w kierunku PL → EN, z transkrypcją IPA i nagraniem wymowy. Otwórz pobrany plik <code>.apkg</code> w programie Anki (na komputerze lub w AnkiDroid), a talia sama się zaimportuje.</span></div>
      <a class="btn primary" href="${ANKI_FILE}" download>${icon("download")} Pobierz (.apkg, ok. 50 MB)</a>
    </div>`;
  }

  // ---------- Słownictwo: działy tematyczne ----------
  let vocabLevels = LEVELS.slice();
  function renderVocabHome() {
    const list = VOCAB.filter((t) => vocabLevels.includes(t.level));
    return `<div class="page">
      <div class="hero"><h1>${icon("book")} Słownictwo</h1><p>Słówka, które trzeba znać na poziomach A1–B2, pogrupowane tematycznie. W każdym dziale: lista z wymową i przykładami, fiszki oraz dwa rodzaje quizu. Oznaczaj słowa, które już znasz – postęp zapisuje się w przeglądarce.</p></div>
      <div class="card today-widget"><span class="f-ico">${icon("cards")}</span><div class="tw-body"><b>Słówka na dziś</b>${wordsRow(srsToday())}</div></div>
      ${ankiCard()}
      <div class="chips" id="vLevels" style="margin-bottom:18px">${LEVELS.map((l) => `<button class="chip ${vocabLevels.includes(l) ? "active" : ""}" data-level="${l}">${l} · ${LEVEL_INFO[l].name}</button>`).join("")}</div>
      ${VOCAB.length ? LEVELS.filter((lv) => vocabLevels.includes(lv)).map((lv) => {
        const ts = list.filter((t) => t.level === lv);
        if (!ts.length) return "";
        return `<h2 class="section-title">${badge(lv)} ${LEVEL_INFO[lv].name}</h2><div class="topic-grid">${ts.map((t) => {
          const n = vocabItems(t).length, k = Object.keys(knownSet("vocab:" + t.id)).length;
          return `<a class="card topic" href="#/vocab/${t.id}" data-level="${t.level}">
            <span class="t-ico">${t.icon || "📘"}</span><b>${esc(t.titlePl)}</b><span class="t-en">${esc(t.title)}</span>
            <span class="t-meta">${n} słówek${k ? ` · znasz ${k}` : ""}</span><div class="progress"><i style="width:${n ? (k / n) * 100 : 0}%"></i></div></a>`;
        }).join("")}</div>`;
      }).join("") : `<div class="empty">Brak działów słownictwa.</div>`}
    </div>`;
  }
  function bindVocabHome() {
    $("#vLevels").addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      const lv = b.dataset.level;
      vocabLevels = vocabLevels.length === 4 ? [lv] : vocabLevels.includes(lv) ? vocabLevels.filter((x) => x !== lv) : vocabLevels.concat(lv);
      if (!vocabLevels.length) vocabLevels = LEVELS.slice();
      $("#content").innerHTML = renderVocabHome(); bindVocabHome();
    });
  }
  function renderVocabTopic(id) {
    const t = VOCAB_BY_ID[id];
    if (!t) return `<div class="page empty"><h1>Nie znaleziono działu</h1><p><a href="#/vocab">Wróć do słownictwa</a></p></div>`;
    const same = VOCAB.filter((x) => x.level === t.level);
    const i = same.indexOf(t);
    return `<article class="page">
      <div class="lesson-head">
        <div class="crumbs" data-level="${t.level}"><a href="#/vocab">${icon("book")} Słownictwo</a> · ${badge(t.level)} <span>${LEVEL_INFO[t.level].name}</span></div>
        <h1>${t.icon || ""} ${esc(t.titlePl)}</h1>
        <div class="title-pl">${esc(t.title)} · ${vocabItems(t).length} słówek</div>
      </div>
      ${vocabBlockHtml(t.groups, "vocab:" + t.id, { intro: t.intro })}
      <div class="pager">
        ${same[i - 1] ? `<a class="card prev" href="#/vocab/${same[i - 1].id}"><small>← Poprzedni dział</small>${esc(same[i - 1].titlePl)}</a>` : "<span></span>"}
        ${same[i + 1] ? `<a class="card next" href="#/vocab/${same[i + 1].id}"><small>Następny dział →</small>${esc(same[i + 1].titlePl)}</a>` : ""}
      </div>
    </article>`;
  }

  // ---------- Trening mieszany ----------
  let practiceCfg = { levels: LEVELS.slice(), cats: [], count: 15, src: "all" };
  const lessonPool = (cfg, filterFn) => PATH.filter((l) => cfg.levels.includes(l.level) && (!cfg.cats.length || cfg.cats.includes(l.category)));
  function setupHtml(cfg, counts, extra) {
    return `<div class="card practice-setup">
        <div><h3>Poziomy</h3><div class="chips" data-f="levels">${LEVELS.map((l) => `<button class="chip ${cfg.levels.includes(l) ? "active" : ""}" data-v="${l}">${l}</button>`).join("")}</div></div>
        <div><h3>Kategorie <span style="text-transform:none;font-weight:400">(nic nie zaznaczone = wszystkie)</span></h3><div class="chips" data-f="cats">${CATEGORIES.filter((c) => PATH.some((l) => l.category === c)).map((c) => `<button class="chip ${cfg.cats.includes(c) ? "active" : ""}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>
        ${extra || ""}
        <div><h3>Liczba pytań</h3><div class="chips" data-f="count">${counts.map((n) => `<button class="chip ${cfg.count === n ? "active" : ""}" data-v="${n}">${n}</button>`).join("")}</div></div>
        <div><button class="btn primary" id="pStart">Losuj pytania →</button> <span id="pInfo" class="muted" style="margin-left:8px"></span></div>
      </div>`;
  }
  function bindSetup(cfg, pool, start) {
    const info = () => { $("#pInfo").textContent = `Dostępnych pytań: ${pool().length}` + (cfg.src === "dictation" ? ` (${reachLabel()})` : ""); };
    document.querySelectorAll(".practice-setup .chips").forEach((box) => box.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      const f = box.dataset.f, v = b.dataset.v;
      if (f === "count" || f === "src") { cfg[f] = f === "count" ? +v : v; box.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b)); }
      else { cfg[f] = cfg[f].includes(v) ? cfg[f].filter((x) => x !== v) : cfg[f].concat(v); b.classList.toggle("active"); }
      info();
    }));
    $("#pStart").addEventListener("click", start);
    info();
  }
  const SRC = { all: "Wszystkie", choice: "Wybór i luki", write: "Pisanie zdań", order: "Układanie zdań", dictation: icon("headphones") + " Dyktando" };
  // Dyktando w treningu: tylko lekcje do bieżącej włącznie (pierwsza nieprzerobiona na ścieżce) – żeby nie dyktować zdań z gramatyką, której jeszcze nie było.
  const reachIdx = () => { const i = PATH.findIndex((l) => !state.done[l.id]); return i < 0 ? PATH.length - 1 : i; };
  const reachLabel = () => reachIdx() ? `lekcje 1–${reachIdx() + 1}` : "lekcja 1";
  function renderPractice() {
    return `<div class="page">
      <div class="hero"><h1>${icon("target")} Trening mieszany</h1><p>Losowe zadania z wielu lekcji (sprawdzane od razu) — dobry sposób, żeby sprawdzić, czy umiesz rozpoznać właściwą konstrukcję, gdy nie wiesz, z jakiej lekcji jest zadanie.</p></div>
      ${setupHtml(practiceCfg, [10, 15, 25, 40], `<div><h3>Rodzaj zadań</h3><div class="chips" data-f="src">${Object.entries(SRC).map(([k, v]) => `<button class="chip ${practiceCfg.src === k ? "active" : ""}" data-v="${k}">${v}</button>`).join("")}</div></div>`)}
      <div id="pBox"></div>
    </div>`;
  }
  function bindPractice() {
    const pool = () => practiceCfg.src === "dictation"
      ? lessonPool(practiceCfg).filter((l) => PATH.indexOf(l) <= reachIdx()).flatMap((l) => l.dict.map((ex) => ({ ex, lesson: l })))
      : lessonPool(practiceCfg).flatMap((l) => [
      ...(l.exercises || []).map((ex) => ({ ex, lesson: l })),
      ...l.practice.flatMap((p) => (p.items || []).map((ex) => ({ ex: withTask(ex, ex.task || p.instruction), lesson: l }))),
    ]).filter(({ ex }) => practiceCfg.src === "all" || (practiceCfg.src === "choice" ? ["choice", "gap"].includes(ex.type) : ex.type === practiceCfg.src));
    const start = () => {
      const items = shuffle(pool()).slice(0, practiceCfg.count);
      const box = $("#pBox");
      const dict = practiceCfg.src === "dictation", cur = PATH[reachIdx()];
      if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.${dict ? ` Dyktando obejmuje lekcje do bieżącej włącznie (teraz: ${lessonNo(cur)}. ${esc(cur.title)}).` : ""}</div>`; return; }
      box.innerHTML = exercisesShell("Pytania", { retryLabel: "Nowe losowanie" });
      if (dict) box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", dictIntro(` Zdania z lekcji do bieżącej włącznie (${reachLabel()}, teraz: <a href="#/lesson/${cur.id}">${esc(cur.title)}</a>).`));
      renderExercises(box.firstElementChild, items, { showSource: true });
      box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
      box.scrollIntoView();
    };
    bindSetup(practiceCfg, pool, start);
  }

  // ---------- Testy (pisanie zdań, sprawdzanie na końcu) ----------
  let testCfg = { levels: LEVELS.slice(), cats: [], count: 20 };
  function renderTests() {
    const perLevel = LEVELS.map((lv) => ({ lv, n: levelLessons(lv).length }));
    return `<div class="page">
      <div class="hero"><h1>${icon("test")} Testy</h1><p>Test składa się głównie z zadań, w których <b>samodzielnie piszesz całe zdania</b>: tłumaczenie z polskiego, przekształcanie (np. na stronę bierną, mowę zależną), poprawianie błędów i układanie zdań. Wynik zobaczysz dopiero na końcu – jak na prawdziwym sprawdzianie.</p></div>
      <div class="level-test-row">${perLevel.filter((x) => x.n).map((x) => `<a class="card level-test" data-level="${x.lv}" href="#/test-poziomu/${x.lv}">${badge(x.lv)} <b>Test poziomu ${x.lv}</b><span>${LT_SIZE} zadań ze wszystkich ${x.n} lekcji, z raportem tematów</span><span class="lt-score">${scorePill(state.scores[ltKey(x.lv)])}${ltPassed(x.lv) ? " " + icon("medal") : ""}</span></a>`).join("")}</div>
      ${CHECKPOINTS.length ? `<h2 class="section-title">${icon("flag")} Sprawdziany powtórkowe</h2>
      <p class="muted-p">Co kilka lekcji: zadania z ostatniego bloku lekcji i trochę z wcześniejszych, głównie pisanie całych zdań. Stoją też w <a href="#/kolejnosc">kolejności nauki</a>.</p>
      <div class="results-list">${CHECKPOINTS.map((c) => { const { cur, rev } = cpSize(c); return `<a class="card result-item test-link" href="#/sprawdzian/${c.id}"><h3>${badge(c.level)} Sprawdzian ${c.n}: ${esc(c.title)} <span class="muted" style="font-family:Inter;font-size:14px;font-weight:400">lekcje ${cpRange(c)} · ${cur + rev} zadań</span> ${scorePill(state.scores[cpKey(c)])}${cpPassed(c) ? " " + icon("check") : ""}</h3></a>`; }).join("")}</div>` : ""}
      <h2 class="section-title">Własny test</h2>
      ${setupHtml(testCfg, [10, 20, 30, 50])}
      <div id="pBox"></div>
      <h2 class="section-title">Testy z poszczególnych lekcji</h2>
      <div class="results-list">${PATH.filter((l) => l.test.length).map((l) => `<a class="card result-item test-link" href="#/lesson/${l.id}/test"><h3>${badge(l.level)} ${esc(l.title)} <span class="muted" style="font-family:Inter;font-size:14px;font-weight:400">${l.test.length} zadań</span> ${scorePill(state.scores[l.id + "::test"])}</h3></a>`).join("") || `<div class="empty">Brak testów.</div>`}</div>
    </div>`;
  }
  function bindTests() {
    const poolFor = (cfg) => lessonPool(cfg).flatMap((l) => l.test.map((ex) => ({ ex, lesson: l })));
    const start = () => {
      const items = shuffle(poolFor(testCfg)).slice(0, testCfg.count);
      const box = $("#pBox");
      if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.</div>`; return; }
      box.innerHTML = exercisesShell("Test", { retryLabel: "Nowy test" });
      renderExercises(box.firstElementChild, items, { showSource: true, mode: "deferred" });
      box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
      box.scrollIntoView();
    };
    bindSetup(testCfg, () => poolFor(testCfg), start);
  }

  // ---------- Sprawdziany powtórkowe (#/sprawdzian/<id>) ----------
  // Zadania: testy lekcji (pisanie i układanie zdań) + zadania „write” z ćwiczeń.
  function cpTasks(l) {
    return [
      ...l.test.filter((ex) => ex.type === "write" || ex.type === "order"),
      ...l.practice.flatMap((p) => (p.items || []).filter((ex) => ex.type === "write").map((ex) => withTask(ex, ex.task || p.instruction))),
    ];
  }
  // Po kolei z każdej lekcji z listy (równy udział; lekcja może wystąpić kilka razy).
  // Głównie pisanie całych zdań, co szóste zadanie – układanie zdania z wyrazów.
  function pickTasks(lessons, n) {
    const pools = new Map();
    lessons.forEach((l) => { if (!pools.has(l)) { const t = cpTasks(l); pools.set(l, { w: shuffle(t.filter((e) => e.type === "write")), o: shuffle(t.filter((e) => e.type === "order")) }); } });
    const order = shuffle(lessons), out = [];
    for (let k = 0; out.length < n && k < n * 10 && order.length; k++) {
      const l = order[k % order.length], p = pools.get(l);
      const ex = (out.length % 6 === 5 && p.o.pop()) || p.w.pop() || p.o.pop();
      if (ex) out.push({ ex, lesson: l });
    }
    return out;
  }
  // Lekcje do powtórki: bez powtórzeń, dopóki się da; niezaliczony (lub nierozwiązany) test lekcji = 2× większa szansa.
  function reviewLessons(prior, n) {
    const weight = (l) => { const s = state.scores[l.id + "::test"]; return s && s.correct / s.total >= 0.8 ? 1 : 2; };
    let bag = prior.flatMap((l) => Array(weight(l)).fill(l));
    const out = [];
    while (out.length < n && prior.length) {
      if (!bag.length) bag = prior.slice();
      const l = bag[Math.floor(Math.random() * bag.length)];
      out.push(l); bag = bag.filter((x) => x !== l);
    }
    return out;
  }
  // Długość zależy od liczby lekcji w bloku: 5 zadań na lekcję (max 20) + ok. 40% powtórki (max 10).
  function cpSize(c) {
    const cur = Math.min(5 * c.lessons.length, c.prior.length ? 20 : 25);
    const rev = c.prior.length ? Math.min(Math.round(cur * 0.6), 10) : 0;
    return { cur, rev };
  }
  const buildCheckpoint = (c) => { const { cur, rev } = cpSize(c); return shuffle([...pickTasks(c.lessons, cur), ...pickTasks(reviewLessons(c.prior, rev), rev)]); };

  function renderCheckpoint(id) {
    const c = CP_BY_ID[id];
    if (!c) return `<div class="page empty"><h1>Nie znaleziono sprawdzianu</h1><p><a href="#/kolejnosc">Wróć do kolejności nauki</a></p></div>`;
    const { cur, rev } = cpSize(c);
    const s = state.scores[cpKey(c)];
    const last = c.lessons[c.lessons.length - 1], after = PATH[PATH.indexOf(last) + 1];
    const todo = c.lessons.filter((l) => !state.done[l.id]);
    return `<div class="page checkpoint" data-level="${c.level}">
      <div class="crumbs" data-level="${c.level}"><a href="#/kolejnosc">${icon("compass")} Kolejność nauki</a> · ${badge(c.level)} <span>Sprawdzian ${c.n} z ${CHECKPOINTS.length}</span></div>
      <h1>${icon("flag")} Sprawdzian ${c.n}: ${esc(c.title)}</h1>
      <p class="summary">Powtórka po lekcjach ${cpRange(c)}${c.prior.length ? ` z dodatkiem zadań z lekcji 1–${lessonNo(c.lessons[0]) - 1}` : ""}. Zadania są wymieszane i nie widać, z której lekcji pochodzą – trzeba samemu rozpoznać, jakiej konstrukcji użyć.</p>
      <div class="card test-intro">
        <p><b>Co sprawdzamy:</b> ${esc(c.focus || "")}</p>
        <p class="cp-lessons"><b>Lekcje:</b> ${c.lessons.map((l) => `<a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a>${state.done[l.id] ? " " + icon("check") : ""}`).join(" · ")}</p>
        <p><b>${cur + rev} zadań</b>: ${cur} z tych lekcji${rev ? ` i ${rev} z wcześniejszych` : ""}. Prawie wszystkie to <b>pisanie całych zdań</b> (tłumaczenie, przekształcanie, poprawianie błędów), kilka to układanie zdań z wyrazów. Wynik i poprawki zobaczysz po kliknięciu „Zakończ i sprawdź”. Zaliczenie od <b>80%</b>. Każde podejście losuje nowe zadania.</p>
        ${todo.length ? `<p class="callout warning">Możesz pisać od razu, ale najlepiej najpierw przerobić: ${todo.map((l) => `<a href="#/lesson/${l.id}">${esc(l.title)}</a>`).join(", ")}</p>` : ""}
        ${s ? `<p>Twój najlepszy wynik: ${scorePill(s)}${cpPassed(c) ? ` – <b>zaliczone ${icon("check")}</b>` : ""}</p>` : ""}
      </div>
      <div id="cpBox" class="cp-run">${exercisesShell("Zadania", { h3: true, retryLabel: "Nowe losowanie" })}</div>
      <div id="cpReport"></div>
      <div class="pager">
        <a class="card prev" href="#/lesson/${last.id}"><small>← Ostatnia lekcja</small>${esc(last.title)} ${badge(last.level)}</a>
        ${after ? `<a class="card next" href="#/lesson/${after.id}"><small>Następna lekcja →</small>${badge(after.level)} ${esc(after.title)}</a>` : `<a class="card next" href="#/tests"><small>Dalej →</small>${icon("test")} Testy</a>`}
      </div>
    </div>`;
  }

  // Raport po sprawdzianie / teście poziomu: wynik z podziałem na lekcje, najsłabsze na górze.
  // opts: noun („Sprawdzian” / „Test poziomu A1”), isReview(l) – lekcja spoza bloku (dopisek „powtórka”),
  // after – { href, label } przycisku „Dalej” po zaliczeniu.
  function reportHtml(items, ctls, correct, total, opts) {
    const by = new Map();
    ctls.forEach((ctl) => {
      const l = items[+ctl.card.dataset.i].lesson;
      const r = by.get(l) || { ok: 0, n: 0 };
      r.n++; if (ctl.result && ctl.result.ok) r.ok++;
      by.set(l, r);
    });
    const rows = [...by].sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n || PATH.indexOf(a[0]) - PATH.indexOf(b[0]));
    const weak = rows.filter(([, r]) => r.ok < r.n);
    const passed = correct / total >= 0.8;
    const need = Math.ceil(total * 0.8) - correct;
    const isReview = opts.isReview || (() => false);
    return `<div class="card cp-report">
      <h3>${passed ? `${icon("check")} ${opts.noun} zaliczony` : `Do zaliczenia zabrakło ${need} ${need === 1 ? "punktu" : "punktów"}`}</h3>
      <p>${passed
        ? (weak.length ? "Brawo! Zerknij jeszcze na lekcje z błędami poniżej, zanim pójdziesz dalej." : "Bezbłędnie we wszystkich lekcjach – można iść dalej.")
        : "Przejrzyj poprawki przy zadaniach, powtórz lekcje z błędami (teoria i ćwiczenia), a potem wylosuj nowy zestaw."}</p>
      ${weak.length ? `<p><b>Do powtórki:</b> ${weak.slice(0, 5).map(([l]) => esc(l.title)).join(", ")}${weak.length > 5 ? ` i ${weak.length - 5} więcej` : ""}. Zadania z błędami trafiły do <a href="#/bledy">Moich błędów</a> – wrócą jutro do powtórki.</p>` : ""}
      <table class="cp-table"><thead><tr><th>Lekcja</th><th>Wynik</th><th></th></tr></thead><tbody>
        ${rows.map(([l, r]) => `<tr class="${r.ok < r.n ? "cp-weak" : ""}"><td><a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a> ${badge(l.level)}${isReview(l) ? ' <span class="muted">(powtórka)</span>' : ""}</td>
          <td>${scorePill({ correct: r.ok, total: r.n })}</td>
          <td>${r.ok < r.n ? `<a class="btn small" href="#/lesson/${l.id}/practice" title="Ćwiczenia z tej lekcji">Powtórz →</a>` : icon("check")}</td></tr>`).join("")}
      </tbody></table>
      ${passed && opts.after ? `<p><a class="btn primary" href="${opts.after.href}">${esc(opts.after.label)} →</a></p>` : ""}
    </div>`;
  }
  function cpReportHtml(c, items, ctls, correct, total) {
    const last = c.lessons[c.lessons.length - 1], after = PATH[PATH.indexOf(last) + 1];
    return reportHtml(items, ctls, correct, total, {
      noun: "Sprawdzian", isReview: (l) => !c.lessons.includes(l),
      after: after && { href: `#/lesson/${after.id}`, label: `Dalej: ${after.title}` },
    });
  }

  function bindCheckpoint(id) {
    const c = CP_BY_ID[id]; if (!c) return;
    const box = $("#cpBox").firstElementChild;
    const run = () => {
      const items = buildCheckpoint(c);
      $("#cpReport").innerHTML = "";
      renderExercises(box, items, {
        key: cpKey(c), mode: "deferred", showSource: true,
        onDone: (correct, total, ctls) => { $("#cpReport").innerHTML = cpReportHtml(c, items, ctls, correct, total); },
      });
    };
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
  }

  // ---------- Test poziomu (#/test-poziomu/<poziom>) ----------
  // 30 zadań ze wszystkich lekcji poziomu, po równo z każdej (pickTasks: głównie pisanie zdań, co szóste – układanie).
  const LT_SIZE = 30;
  const levelLessons = (lv) => PATH.filter((l) => l.level === lv);
  function renderLevelTest(lv) {
    const ls = levelLessons(lv);
    if (!ls.length) return `<div class="page empty"><h1>Nie znaleziono testu</h1><p><a href="#/tests">Wróć do testów</a></p></div>`;
    const s = state.scores[ltKey(lv)];
    const nDone = ls.filter((l) => state.done[l.id]).length;
    const last = ls[ls.length - 1], after = PATH[PATH.indexOf(last) + 1];
    return `<div class="page checkpoint" data-level="${lv}">
      <div class="crumbs" data-level="${lv}"><a href="#/kolejnosc">${icon("compass")} Kolejność nauki</a> · ${badge(lv)} <span>${LEVEL_INFO[lv].name}</span></div>
      <h1>${icon("test")} Test poziomu ${lv}</h1>
      <p class="summary">Sprawdza cały poziom ${lv} (${LEVEL_INFO[lv].name}): lekcje ${lessonNo(ls[0])}–${lessonNo(last)}. Zadania są wymieszane i nie widać, z której lekcji pochodzą. Po teście zobaczysz raport: które tematy idą dobrze, a które trzeba powtórzyć.</p>
      <div class="card test-intro">
        <p><b>${LT_SIZE} zadań</b>, po równo z każdej z ${ls.length} lekcji poziomu. Prawie wszystkie to <b>pisanie całych zdań</b> (tłumaczenie, przekształcanie, poprawianie błędów), kilka to układanie zdań z wyrazów. Wynik i poprawki zobaczysz po kliknięciu „Zakończ i sprawdź”. Zaliczenie od <b>80%</b> – dostajesz wtedy odznakę ${icon("medal")} przy poziomie w <a href="#/kolejnosc">kolejności nauki</a>. Każde podejście losuje nowe zadania.</p>
        ${nDone < ls.length ? `<p class="callout warning">Przerobione lekcje tego poziomu: ${nDone} z ${ls.length}. Test obejmuje wszystkie – możesz pisać od razu (np. żeby sprawdzić, co już umiesz), ale najlepiej po przerobieniu całego poziomu.</p>` : ""}
        ${s ? `<p>Twój najlepszy wynik: ${scorePill(s)}${ltPassed(lv) ? ` – <b>zaliczone ${icon("check")}</b> ${ltBadge(lv)}` : ""}</p>` : ""}
      </div>
      <div id="cpBox" class="cp-run">${exercisesShell("Zadania", { h3: true, retryLabel: "Nowe losowanie" })}</div>
      <div id="cpReport"></div>
      <div class="pager">
        <a class="card prev" href="#/lesson/${last.id}"><small>← Ostatnia lekcja poziomu</small>${esc(last.title)} ${badge(last.level)}</a>
        ${after ? `<a class="card next" href="#/lesson/${after.id}"><small>Następny poziom →</small>${badge(after.level)} ${esc(after.title)}</a>` : `<a class="card next" href="#/tests"><small>Dalej →</small>${icon("test")} Testy</a>`}
      </div>
    </div>`;
  }
  function bindLevelTest(lv) {
    const ls = levelLessons(lv); if (!ls.length) return;
    const box = $("#cpBox").firstElementChild;
    const after = PATH[PATH.indexOf(ls[ls.length - 1]) + 1];
    const run = () => {
      const items = shuffle(pickTasks(ls, LT_SIZE));
      $("#cpReport").innerHTML = "";
      renderExercises(box, items, {
        key: ltKey(lv), mode: "deferred", showSource: true,
        onDone: (correct, total, ctls) => {
          $("#cpReport").innerHTML = reportHtml(items, ctls, correct, total, {
            noun: `Test poziomu ${lv}`,
            after: after && { href: `#/lesson/${after.id}`, label: `Dalej: poziom ${after.level} – ${after.title}` },
          });
        },
      });
    };
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
  }

  // ---------- Moje błędy (#/bledy) ----------
  const SESSION_MAX = 20;
  const zadan = (n) => `${n} ${n === 1 ? "zadanie" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "zadania" : "zadań"}`;
  let mistakesCfg = { level: "", lesson: "" };
  const srcLabel = (x) => x.src === "e" ? "szybki sprawdzian" : x.src === "t" ? "test" : x.src === "d" ? "przykłady z lekcji" : esc(stripTags((x.lesson.practice[+x.src.slice(1)] || {}).title || "ćwiczenia"));
  const dueLabel = (m) => {
    const d = Math.round((Date.parse(m.due) - Date.parse(today())) / DAY);
    return d <= 0 ? "<b>na dziś</b>" : d === 1 ? "jutro" : `za ${d} dni`;
  };
  const filteredMistakes = () => mistakeList().filter((x) => (!mistakesCfg.level || x.lesson.level === mistakesCfg.level) && (!mistakesCfg.lesson || x.lesson.id === mistakesCfg.lesson));
  const sessionItems = (list) => shuffle(list).slice(0, SESSION_MAX).map((x) => ({ ex: x.src[0] === "p" ? withTask(x.ex, x.ex.task || x.instr) : x.ex, lesson: x.lesson }));

  // Liczniki „na dziś” w górnym pasku i w menu: .m-count = Moje błędy (link w pasku widać tylko, gdy są jakieś błędy),
  // .wd-count = Słówka na dziś (przy „Słownictwie”), na przycisku ☰ (telefon) – suma obu.
  function syncTodayCounts() {
    const n = mistakesDue(), any = mistakeList().length > 0, w = wordsDue();
    const link = $("#mistakesLink");
    if (link) { link.hidden = !any; link.title = n ? `Moje błędy – ${n} na dziś` : "Moje błędy"; }
    document.querySelectorAll(".m-count").forEach((el) => { el.textContent = n; el.hidden = !n; });
    document.querySelectorAll(".wd-count").forEach((el) => { el.textContent = w; el.hidden = !w; });
    const menu = $(".menu-count");
    if (menu) { menu.textContent = n + w; menu.hidden = !(n + w); menu.title = `Na dziś: ${[w ? slowek(w) : "", n ? zadan(n) + " z błędami" : ""].filter(Boolean).join(", ")}`; }
    const tEl = $("#mToday"), lEl = $("#mList"); // na stronie „Moje błędy” – stan na bieżąco w trakcie powtórki
    if (tEl && lEl) { const xs = filteredMistakes(); tEl.innerHTML = mTodayHtml(xs); lEl.innerHTML = mListHtml(xs); }
  }

  function mTodayHtml(list) {
    const due = list.filter((x) => isDue(x.m));
    if (due.length) return `<div class="card m-today"><div><b>Na dziś: ${zadan(due.length)}</b><span>${due.length > SESSION_MAX ? `Po ${SESSION_MAX} w jednej rundzie.` : "Zadania sprawdzają się od razu."}</span></div><button class="btn primary" data-mrun="due">Powtórz →</button></div>`;
    const next = list.map((x) => x.m.due).sort()[0];
    return `<div class="card m-today"><div><b>Na dziś wszystko powtórzone ${icon("check")}</b><span>${next ? `Następna powtórka: ${dueLabel({ due: next })}. Możesz też poćwiczyć wcześniej (przyciski „Ćwicz teraz” poniżej) – wtedy dobra odpowiedź nie przesuwa zadania dalej.` : ""}</span></div></div>`;
  }
  function mListHtml(list) {
    const by = new Map();
    list.forEach((x) => { if (!by.has(x.lesson)) by.set(x.lesson, []); by.get(x.lesson).push(x); });
    if (!list.length) return "";
    return `<h2 class="section-title">Wszystkie zadania z błędami (${list.length})</h2>` + [...by].sort((a, b) => PATH.indexOf(a[0]) - PATH.indexOf(b[0])).map(([l, xs]) => {
      const nDue = xs.filter((x) => isDue(x.m)).length;
      xs.sort((a, b) => a.m.due.localeCompare(b.m.due) || b.m.wrong - a.m.wrong);
      return `<div class="card m-group">
        <div class="m-head"><div class="m-title"><a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a> ${badge(l.level)}<span class="muted">${xs.length} zad.${nDue ? ` · ${nDue} na dziś` : ""}</span></div>
          <div class="m-actions"><button class="btn small" data-mrun="${l.id}">Ćwicz teraz</button><a class="btn small" href="#/lesson/${l.id}" title="Teoria i ćwiczenia z tej lekcji">Powtórz lekcję →</a></div></div>
        <ul class="m-list">${xs.map((x) => { const q = x.ex.type === "dictation" ? stripTags(x.ex.pl || "Zapisz zdanie ze słuchu.") : stripTags(x.ex.q || "Ułóż zdanie z wyrazów."); return `<li><span class="m-q">${x.ex.type === "dictation" ? icon("headphones") + " " : ""}${esc(q.length > 160 ? q.slice(0, 157) + "…" : q)}</span>
          <span class="m-meta">${srcLabel(x)} · ${TYPE_LABEL[x.ex.type]} · pudełko ${x.m.box}/${BOX_DAYS.length} · powtórka ${dueLabel(x.m)}${x.m.wrong > 1 ? ` · błędy: ${x.m.wrong}` : ""}</span></li>`; }).join("")}</ul>
      </div>`;
    }).join("");
  }
  function renderMistakes() {
    const all = mistakeList();
    const head = `<div class="hero"><h1>${icon("repeat")} Moje błędy</h1><p>Tu wracają zadania, w których się pomylisz – w lekcjach, ćwiczeniach, testach, treningu i sprawdzianach. Zadanie z błędem wraca następnego dnia, a po każdej dobrej odpowiedzi coraz rzadziej: po 3, 7 i 14 dniach. Czwarta dobra odpowiedź z rzędu – zadanie znika z listy. Nowy błąd – zadanie wraca na początek.</p></div>`;
    if (!all.length) return `<div class="page">${head}<div class="card empty m-empty"><b>Nie masz żadnych zadań do powtórki.</b><p>Rozwiązuj ćwiczenia i testy – zadania z błędami same się tu pojawią.</p><p><a class="btn primary" href="#/kolejnosc">${icon("compass")} Kolejność nauki</a></p></div></div>`;
    const levels = LEVELS.filter((lv) => all.some((x) => x.lesson.level === lv));
    if (mistakesCfg.level && !levels.includes(mistakesCfg.level)) mistakesCfg.level = "";
    const lessons = PATH.filter((l) => all.some((x) => x.lesson === l) && (!mistakesCfg.level || l.level === mistakesCfg.level));
    if (mistakesCfg.lesson && !lessons.some((l) => l.id === mistakesCfg.lesson)) mistakesCfg.lesson = "";
    const list = filteredMistakes();
    return `<div class="page mistakes">${head}
      <div class="card m-filter">
        <div class="chips" data-mf="level"><button class="chip ${!mistakesCfg.level ? "active" : ""}" data-v="">Wszystkie poziomy</button>${levels.map((lv) => `<button class="chip ${mistakesCfg.level === lv ? "active" : ""}" data-v="${lv}">${lv}</button>`).join("")}</div>
        <label class="m-select"><span>Lekcja:</span><select id="mLesson"><option value="">wszystkie (${lessons.length})</option>${lessons.map((l) => `<option value="${l.id}" ${mistakesCfg.lesson === l.id ? "selected" : ""}>${lessonNo(l)}. ${esc(l.title)}</option>`).join("")}</select></label>
      </div>
      <div id="mToday">${mTodayHtml(list)}</div>
      <div id="mBox"></div>
      <div id="mList">${mListHtml(list)}</div>
    </div>`;
  }
  function bindMistakes() {
    const page = $(".page.mistakes"); if (!page) return;
    const refresh = () => { const list = filteredMistakes(); $("#mToday").innerHTML = mTodayHtml(list); $("#mList").innerHTML = mListHtml(list); };
    page.querySelector(".m-filter .chips").addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      mistakesCfg.level = b.dataset.v; route();
    });
    $("#mLesson").addEventListener("change", (e) => { mistakesCfg.lesson = e.target.value; route(); });
    // „due” = zadania na dziś (z filtrem), id lekcji = wszystkie błędy z tej lekcji (także przed terminem).
    const start = (what) => {
      const pick = () => filteredMistakes().filter((x) => what === "due" ? isDue(x.m) : x.lesson.id === what);
      const box = $("#mBox");
      const run = () => {
        const items = sessionItems(pick());
        if (!items.length) { box.innerHTML = `<div class="card m-done">${icon("check")} Wszystko powtórzone.</div>`; refresh(); return; }
        box.innerHTML = exercisesShell(what === "due" ? "Powtórka na dziś" : `Ćwiczenie: ${esc(BY_ID[what].title)}`, { retryLabel: what === "due" ? "Następna runda" : "Jeszcze raz" });
        renderExercises(box.firstElementChild, items, { showSource: true, onDone: refresh });
        box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
      };
      run();
      box.scrollIntoView();
    };
    page.addEventListener("click", (e) => { const b = e.target.closest("[data-mrun]"); if (b) start(b.dataset.mrun); });
  }
  // ---------- Słówka na dziś (#/slowka) ----------
  const plural = (n, one, few, many) => n === 1 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many;
  const slowek = (n) => `${n} ${plural(n, "słówko", "słówka", "słówek")}`;
  const daysLabel = (d) => `${d} ${d === 1 ? "dzień" : "dni"}`;
  // „12 do powtórki + 10 nowych” (pusty napis, gdy nic na dziś).
  const wordsTodayTxt = (q) => [q.due.length ? `${q.due.length} do powtórki` : "", q.fresh.length ? `${q.fresh.length} ${plural(q.fresh.length, "nowe", "nowe", "nowych")}` : ""].filter(Boolean).join(" + ");
  const srsEntries = () => Object.entries(state.srs).filter(([k]) => WORDS.has(k)).map(([, e]) => e);
  function wTodayHtml(q) {
    const txt = wordsTodayTxt(q), n = q.due.length + q.fresh.length;
    if (n) return `<div class="card m-today"><div><b>Na dziś: ${txt}</b><span>${n > SRS_ROUND ? `Po ${SRS_ROUND} w jednej rundzie. ` : ""}Najpierw powtórki, potem nowe słówka.</span></div><button class="btn primary" data-wrun>Zacznij →</button></div>`;
    const next = srsEntries().map((e) => e.due).sort()[0];
    const nNext = next ? srsEntries().filter((e) => e.due === next).length : 0;
    const more = q.avail ? `Dzienny limit nowych słówek (${state.srsNew}) wykorzystany – kolejne jutro. Możesz zwiększyć limit poniżej.`
      : "Wszystkie słówka z Twoich lekcji i działów są już w powtórkach – nowe dojdą po następnej lekcji.";
    return `<div class="card m-today"><div><b>Na dziś wszystko powtórzone ${icon("check")}</b><span>${next ? `Następna powtórka: ${dueLabel({ due: next })} (${slowek(nNext)}). ` : ""}${more}</span></div></div>`;
  }
  function wInfoHtml(q) {
    const entries = srsEntries();
    const boxes = SRS_DAYS.map((d, i) => entries.filter((e) => Math.min(e.box, SRS_DAYS.length) === i + 1).length);
    const inDeck = (d) => d.keys.filter((k) => state.srs[k]).length;
    return `<div class="card wd-settings"><span>Nowych słówek dziennie:</span><div class="chips">${NEW_CHOICES.map((n) => `<button class="chip ${state.srsNew === n ? "active" : ""}" data-wnew="${n}">${n}</button>`).join("")}</div></div>
      ${entries.length ? `<h2 class="section-title">Twoje pudełka (${slowek(entries.length)})</h2>
      <div class="wd-boxes">${boxes.map((n, i) => `<div class="card wd-box"><b>${n}</b><span>pudełko ${i + 1}</span><small>co ${daysLabel(SRS_DAYS[i])}</small></div>`).join("")}</div>
      <p class="muted-p">„Wiem” przenosi słówko do następnego pudełka, „Trudne” zostawia w tym samym, „Nie wiem” cofa do pudełka 1. W pudełkach 5–6 są słówka, które znasz już dobrze (${boxes[4] + boxes[5]}).</p>` : ""}
      ${q.decks.length ? `<h2 class="section-title">Skąd są słówka</h2>
      <p class="muted-p">Słownictwo lekcji dochodzi, gdy lekcja jest przerobiona. Dział słownictwa – gdy zaczniesz go ćwiczyć fiszkami albo oznaczysz w nim słówko jako znane (<a href="#/vocab">${icon("book")} Słownictwo</a>). Słówko, które powtarza się w kilku miejscach, uczysz się tylko raz.</p>
      <div class="card wd-decks">${q.decks.map((d) => `<a class="wd-deck" href="${d.href}"><span class="wd-deck-t">${badge(d.level)} ${esc(d.title)}</span><span class="muted">w powtórkach: ${inDeck(d)} z ${d.keys.length}</span></a>`).join("")}</div>` : ""}`;
  }
  function renderWords() {
    const q = srsToday();
    const head = `<div class="hero"><h1>${icon("cards")} Słówka na dziś</h1><p>Codzienna porcja fiszek: słówka do powtórki i kilka nowych. Oceniaj szczerze: <b>Nie wiem</b> – słówko wróci jutro, <b>Trudne</b> – wróci po tym samym czasie co ostatnio, <b>Wiem</b> – wróci później: po 3, 7, 14, 30, a potem co 60 dni. Tak powtarzasz słówko wtedy, gdy zaczyna Ci uciekać z pamięci.</p></div>`;
    if (!q.decks.length && !srsEntries().length) return `<div class="page">${head}<div class="card empty m-empty"><b>Na razie nie masz słówek do nauki.</b><p>Słówka z lekcji pojawią się tu, gdy oznaczysz lekcję jako przerobioną (albo zdasz jej szybki sprawdzian). Słówka z działów – gdy zaczniesz ćwiczyć dział fiszkami.</p><p><a class="btn primary" href="#/kolejnosc">${icon("compass")} Kolejność nauki</a> <a class="btn" href="#/vocab">${icon("book")} Słownictwo</a></p></div></div>`;
    return `<div class="page words">${head}
      <div id="wToday">${wTodayHtml(q)}</div>
      <div id="wBox"></div>
      <div id="wInfo">${wInfoHtml(q)}</div>
    </div>`;
  }
  function bindWords() {
    const page = $(".page.words"); if (!page) return;
    const refresh = () => { const q = srsToday(); $("#wToday").innerHTML = wTodayHtml(q); $("#wInfo").innerHTML = wInfoHtml(q); syncTodayCounts(); };
    const run = () => {
      const q = srsToday(), box = $("#wBox");
      const cards = [...shuffle(q.due).map((k) => wordCard(k, state.srs[k].deck)), ...q.fresh.map((f) => wordCard(f.k, f.deck))].slice(0, SRS_ROUND);
      if (!cards.length) { box.innerHTML = ""; refresh(); return; }
      $("#wToday").hidden = true;
      box.innerHTML = `<section class="block wd-session"><h2>Runda: ${slowek(cards.length)}</h2><div class="wd-pane"></div></section>`;
      const pane = box.querySelector(".wd-pane");
      flashcards(pane, cards, {
        onRate: (c, r) => {
          rateWord(c.k, r, c.deck);
          const en = stripTags(c.w.en); // „znam” w talii, z której jest karta – tak samo jak w fiszkach działu
          if (r === 2) knownSet(c.deck)[en] = 1; else if (r === 0 && state.known[c.deck]) delete state.known[c.deck][en];
          save(); syncTodayCounts();
        },
        onEnd: (st) => {
          const left = wordsDue();
          pane.innerHTML = `<div class="card fc-done"><b>Runda skończona! 🎉</b><p>${fcStatsHtml(st)}</p>
            ${left ? `<button class="btn primary wd-more">Następna runda (zostało: ${left}) →</button>` : `<p class="wd-all">${icon("check")} Na dziś wszystko powtórzone. Wróć jutro!</p>`}</div>`;
          const more = pane.querySelector(".wd-more"); if (more) more.onclick = () => { run(); box.scrollIntoView(); };
          $("#wToday").hidden = false; refresh();
        },
      });
      box.scrollIntoView();
    };
    page.addEventListener("click", (e) => {
      const n = e.target.closest("[data-wnew]");
      if (n) { state.srsNew = +n.dataset.wnew; store.set("srsNew", state.srsNew); refresh(); return; }
      if (e.target.closest("[data-wrun]")) run();
    });
  }

  // Kafelek „Dziś do powtórki” (strona główna; wiersz ze słówkami także na stronie Słownictwo).
  function wordsRow(q) {
    const txt = wordsTodayTxt(q), started = q.decks.length || srsEntries().length;
    return `<a class="tw-row" href="#/slowka"><span>${icon("cards")} Słówka: ${txt ? `<b>${txt}</b>` : started ? "na dziś wszystko powtórzone " + icon("check") : "codzienne fiszki z powtórkami – zacznij ćwiczyć dowolny dział fiszkami"}</span><span class="btn small ${txt ? "primary" : ""}">${txt ? "Ucz się" : "Zobacz"} →</span></a>`;
  }
  function todayWidget() {
    const all = mistakeList(), q = srsToday(), rows = [];
    if (q.decks.length || srsEntries().length) rows.push(wordsRow(q));
    if (all.length) {
      const n = all.filter((x) => isDue(x.m)).length;
      rows.push(`<a class="tw-row" href="#/bledy"><span>${icon("repeat")} Moje błędy: ${n ? `<b>${zadan(n)}</b> na dziś` : "na dziś wszystko powtórzone " + icon("check")} (razem na liście: ${all.length})</span><span class="btn small ${n ? "primary" : ""}">${n ? "Powtórz" : "Zobacz"} →</span></a>`);
    }
    if (!rows.length) return "";
    return `<div class="card today-widget"><span class="f-ico">${icon("calendar")}</span><div class="tw-body"><b>Dziś do powtórki</b>${rows.join("")}</div></div>`;
  }

  // ---------- Wyszukiwanie ----------
  function renderSearch(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = PATH.map((l) => {
      const head = HEAD_TEXT[l.id], body = SEARCH_TEXT[l.id];
      if (!terms.every((t) => body.includes(t))) return null;
      const score = terms.reduce((s, t) => s + (head.includes(t) ? 10 : 0) + Math.min(body.split(t).length - 1, 5), 0);
      return { l, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    const words = [];
    for (const t of VOCAB) for (const w of vocabItems(t)) {
      const s = (stripTags(w.en) + " " + stripTags(w.pl)).toLowerCase();
      if (terms.every((x) => s.includes(x))) words.push({ t, w });
      if (words.length >= 30) break;
    }
    const hl = (s) => { let out = esc(s); terms.forEach((t) => { out = out.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => `<mark>${m}</mark>`); }); return out; };
    return `<div class="page"><h1 style="font-size:30px">Wyniki dla „${esc(q)}”</h1>
      ${hits.length ? `<div class="results-list">${hits.map(({ l }) => `<a class="card result-item" href="#/lesson/${l.id}">
        <h3>${badge(l.level)} ${hl(l.title)}</h3><p><b>${hl(l.titlePl)}</b> · ${esc(l.category)}</p><p>${hl(stripTags(l.summary))}</p></a>`).join("")}</div>`
        : words.length ? "" : `<div class="empty">Nic nie znaleziono. Spróbuj innego słowa, np. „past”, „modal”, „if”, „przedimki”.</div>`}
      ${words.length ? `<h2 class="section-title">Słownictwo</h2><div class="card vlist">${words.map(({ t, w }) => `<a class="vrow vlink" href="#/vocab/${t.id}">${speakBtn(w.en)}<div class="v-main"><div class="v-en">${hl(stripTags(w.en))}</div><div class="v-pl">${hl(stripTags(w.pl))}</div></div><span class="muted">${esc(t.titlePl)} ${badge(t.level)}</span></a>`).join("")}</div>` : ""}
    </div>`;
  }

  // ---------- Router ----------
  function currentLessonId() { const m = location.hash.match(/^#\/lesson\/([\w-]+)/); return m ? m[1] : null; }
  let lastRoute = "";
  function route() {
    const h = location.hash || "#/";
    const content = $("#content");
    document.body.classList.remove("nav-open");
    if (!h.startsWith("#/")) return; // kotwice wewnątrz strony
    if (tocCleanup) { tocCleanup(); tocCleanup = null; }
    let title = "Gramatyka angielska A1–B2";
    const sameLesson = currentLessonId() && lastRoute === currentLessonId();
    if (h.startsWith("#/lesson/")) {
      const id = currentLessonId();
      content.innerHTML = renderLesson(id); bindLesson(id);
      if (BY_ID[id]) title = `${BY_ID[id].title} – ${title}`;
    } else if (h.startsWith("#/sprawdzian/")) {
      const id = h.slice(13);
      content.innerHTML = renderCheckpoint(id); bindCheckpoint(id);
      if (CP_BY_ID[id]) title = `Sprawdzian ${CP_BY_ID[id].n}: ${CP_BY_ID[id].title} – ${title}`;
    } else if (h.startsWith("#/test-poziomu/")) {
      const lv = h.slice(15).toUpperCase();
      content.innerHTML = renderLevelTest(lv); bindLevelTest(lv);
      title = `Test poziomu ${lv} – ${title}`;
    } else if (h.startsWith("#/slowka")) {
      content.innerHTML = renderWords(); bindWords(); title = `Słówka na dziś – ${title}`;
    } else if (h.startsWith("#/bledy")) {
      content.innerHTML = renderMistakes(); bindMistakes(); title = `Moje błędy – ${title}`;
    } else if (h.startsWith("#/practice")) {
      content.innerHTML = renderPractice(); bindPractice(); title = `Trening – ${title}`;
    } else if (h.startsWith("#/tests")) {
      content.innerHTML = renderTests(); bindTests(); title = `Testy – ${title}`;
    } else if (h.startsWith("#/vocab/")) {
      const id = h.slice(8);
      content.innerHTML = renderVocabTopic(id);
      const t = VOCAB_BY_ID[id];
      if (t) { bindVocabBlock(content.querySelector(".vocab-block"), t.groups, "vocab:" + t.id); title = `${t.titlePl} – Słownictwo`; }
    } else if (h.startsWith("#/vocab")) {
      content.innerHTML = renderVocabHome(); bindVocabHome(); title = `Słownictwo – ${title}`;
    } else if (h.startsWith("#/kolejnosc")) {
      content.innerHTML = renderOrder(); bindOrder(); title = `Kolejność nauki – ${title}`;
    } else if (h.startsWith("#/search/")) {
      const q = decodeURIComponent(h.slice(9));
      content.innerHTML = renderSearch(q); title = `Szukaj: ${q}`;
    } else {
      content.innerHTML = renderHome();
    }
    document.title = title;
    syncGoal(); // pasek: także po północy i po wczytaniu kopii (przed szukaniem kotwicy – karta celu jest tu przebudowywana)
    // Przy przełączaniu zakładek tej samej lekcji zostajemy przy nagłówku zamiast skakać na górę.
    const tabsEl = $(".tabs");
    const anchor = h.startsWith("#/kolejnosc/") && document.getElementById(h.slice(12)); // np. #/kolejnosc/kopia
    if (sameLesson && tabsEl && window.scrollY > tabsEl.offsetTop) tabsEl.scrollIntoView();
    else if (!anchor) window.scrollTo(0, 0);
    lastRoute = currentLessonId() || "";
    renderNav();
    if (anchor) anchor.scrollIntoView(); // dopiero po renderNav – ono przewija menu do aktywnej pozycji, co cofa stronę
  }

  // ---------- Zdarzenia globalne ----------
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goal]");
    if (!b) return;
    state.goal = +b.dataset.goal;
    store.set("goal", state.goal);
    syncGoal();
    const nb = document.querySelector(`.goal-card [data-goal="${state.goal}"]`); // karta jest przebudowana – fokus wraca na przycisk
    if (nb) nb.focus();
  });
  document.addEventListener("click", (e) => {
    const sb = e.target.closest(".speak");
    if (sb) { e.preventDefault(); e.stopPropagation(); speak(sb.dataset.say, sb); return; }
    const pl = e.target.closest(".hide-pl .ex-pl");
    if (pl) { pl.classList.toggle("revealed"); return; }
    const bk = e.target.closest("[data-backup=download], [data-backup=later]");
    if (bk) {
      if (bk.dataset.backup === "download") downloadBackup();
      else { store.set("backup", { ...store.get("backup", {}), since: new Date().toISOString() }); document.querySelectorAll(".backup-reminder").forEach((el) => el.remove()); }
      return;
    }
    const sc = e.target.closest("[data-scroll]");
    if (sc) {
      e.preventDefault();
      const d = sc.closest("details.toc");
      if (d && !TOC_WIDE.matches) d.open = false; // na telefonie zwiń spis, potem przewiń
      const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: "smooth" });
    }
  }, true);
  $("#levelFilter").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    if (b.hasAttribute("data-all")) state.levels = LEVELS.slice();
    else if (state.levels.length === 4) state.levels = [b.dataset.level];
    else {
      state.levels = state.levels.includes(b.dataset.level) ? state.levels.filter((x) => x !== b.dataset.level) : state.levels.concat(b.dataset.level);
      if (!state.levels.length) state.levels = LEVELS.slice();
    }
    save(); renderLevelFilter(); renderNav();
  });
  let searchTimer;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    searchTimer = setTimeout(() => {
      if (q.length >= 2) history.replaceState(null, "", "#/search/" + encodeURIComponent(q)), route();
      else if (!q && location.hash.startsWith("#/search/")) location.hash = "#/";
    }, 200);
  });
  $("#search").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.target.value = ""; e.target.blur(); } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#search").focus(); }
  });
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#backdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));
  $("#themeBtn").addEventListener("click", () => {
    const dark = getComputedStyle(document.documentElement).colorScheme === "dark";
    const t = dark ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("eng-theme", t); } catch (e) {}
    syncThemeColor();
  });
  // Kolor paska stanu na telefonie (i okna aplikacji) = kolor górnego paska w bieżącym motywie.
  function syncThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    const c = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();
    if (meta && c) meta.setAttribute("content", c);
  }
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", syncThemeColor);
  syncThemeColor();

  // ---------- offline / instalacja (PWA): service worker z sw.js ----------
  // Przy pierwszej wizycie sw.js zapisuje stronę w pamięci telefonu – potem działa bez internetu.
  // Gdy na serwerze jest nowa wersja, pobiera się w tle i pokazujemy pasek „Jest nowa wersja”.
  // Przeładowujemy dopiero po kliknięciu, żeby nie przerwać rozwiązywania zadań.
  function initOffline() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    const sw = navigator.serviceWorker;
    let wantReload = false;
    sw.addEventListener("controllerchange", () => { if (wantReload) location.reload(); });
    const offer = (worker) => {
      if (!worker || !sw.controller || $(".update-bar")) return; // bez sw.controller = pierwsza instalacja, nie aktualizacja
      const bar = document.createElement("div");
      bar.className = "update-bar";
      bar.setAttribute("role", "status");
      bar.innerHTML = `<span>Jest nowa wersja strony.</span>
        <button class="btn primary" type="button">Odśwież</button>
        <button class="icon-btn" type="button" aria-label="Później" title="Później">${icon("x")}</button>`;
      const [refresh, later] = bar.querySelectorAll("button");
      refresh.addEventListener("click", () => { wantReload = true; refresh.disabled = true; worker.postMessage("skip-waiting"); });
      later.addEventListener("click", () => bar.remove());
      document.body.appendChild(bar);
    };
    sw.register("sw.js").then((reg) => {
      offer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        if (w) w.addEventListener("statechange", () => { if (w.state === "installed") offer(w); });
      });
      // Aplikacja na telefonie bywa otwarta długo – sprawdzaj nową wersję przy powrocie do niej.
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(() => {});
  }
  initOffline();
  window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/search/")) $("#search").value = ""; route(); });

  // Udostępnione do testów automatycznych (tools/).
  window.__ENG = { matches, expandAnswer, vocabMatch, variants };

  migrateKnown(state);
  migrateActivity(state);
  renderLevelFilter();
  route();
})();
