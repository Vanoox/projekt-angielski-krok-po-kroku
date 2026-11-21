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
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
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
    voice: '<path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    archive: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    timeline: '<path d="M2 12h20M12 6v12"/><circle cx="6" cy="12" r="2"/><path d="M15 9.5q1.5-3 3 0t3 0"/>',
    columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
    swap: '<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  };
  const icon = (name, cls) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  // Ostatnie słowo tytułu + ✓ w jednym kawałku – znaczek nie przeskakuje sam do nowej linii.
  const doneTick = (title, done) => (done ? title.replace(/\S+$/, (w) => `<span class="done-tick">${w}&nbsp;${icon("check")}</span>`) : title);
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
  const TYPE_LABEL = { choice: "wybór", gap: "luka", write: "pisanie zdania", order: "układanie zdania", dictation: "dyktando", finderr: "znajdź błąd" };

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
  // Znajdź błąd: zadania z sekcji „mistakes” (pary wrong / right / why; błędne miejsce w <b>…</b> – każda z 552 par
  // je ma, więc nie trzeba klikać „między słowami”). Błędne zdanie = pierwszy wariant przed „ / ”; końcowy dopisek
  // w nawiasie (po polsku, np. „(przez telefon)”) → podpowiedź pod zdaniem. Poprawne odpowiedzi: pole fix (pełne zdania,
  // składnia jak w answers: {a|b}, (opcjonalne)), a bez niego warianty z right rozdzielone „ / ” (przy kilku błędnych
  // wariantach – poprawny o tym samym numerze). fix jest potrzebne, gdy right ma warianty częściowe („I've got / I have
  // a new phone.”) albo gubi kontekst zdania. Każda para daje dwa zadania: bad (zdanie z błędem) i good (to samo zdanie
  // poprawnie – do „Tu nie ma błędu”); w rundzie ok. 20% to good.
  const untag = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const FE_ALT = /\s+\/\s+/;
  PATH.forEach((l) => {
    l.finds = [];
    l.sections.filter((s) => s.type === "mistakes").forEach((s) => (s.items || []).forEach((m) => {
      let w = String(m.wrong || "").trim(), note = "";
      const pm = w.match(/\s*\(([^()]*)\)$/);
      if (pm) { note = pm[1].trim(); w = w.slice(0, pm.index).trim(); }
      const ws = w.split(FE_ALT), rs = String(m.right || "").split(FE_ALT).map(untag);
      if (ws.length > 1) note = ""; // dopisek dotyczył ostatniego wariantu
      if (!/<b>/.test(ws[0])) return;
      const answers = Array.isArray(m.fix) && m.fix.length ? m.fix.slice() : ws.length > 1 && rs.length === ws.length ? [rs[0]] : rs;
      const model = expandAnswer(answers[0])[0];
      const common = { type: "finderr", why: m.why || "", wrongHtml: m.wrong, rightHtml: m.right };
      l.finds.push({
        bad: { ...common, q: untag(ws[0]), html: ws[0], note, answers, model },
        good: { ...common, ok: true, q: model, html: model, note: "", answers: [model], model },
      });
    }));
  });
  const TASKS = new Map(); // klucz → { ex, lesson, src, instr }
  const KEY_OF = new WeakMap(); // obiekt zadania → klucz
  PATH.forEach((l) => {
    const srcs = [["e", l.exercises || [], ""], ...l.practice.map((p, i) => ["p" + i, p.items || [], p.instruction || ""]), ["t", l.test, ""], ["d", l.dict, ""],
      ["f", l.finds.flatMap((p) => [p.bad, p.good]), ""]];
    for (const [src, items, instr] of srcs) items.forEach((ex) => {
      const base = `${l.id}~${src}~${hashStr([ex.type, ex.q || "", (ex.options || []).join("|"), JSON.stringify(ex.answers ?? ex.answer ?? "")].join("#"))}`;
      let k = base, n = 2;
      while (TASKS.has(k)) k = `${base}~${n++}`; // identyczne zadanie w tym samym zestawie
      TASKS.set(k, { ex, lesson: l, src, instr });
      KEY_OF.set(ex, k);
    });
  });
  // Czytanki (data/reading/*.js → window.READING, format w tools/FORMAT.md). after = najwcześniejsza lekcja, po której
  // tekst jest zrozumiały – czytanka odblokowuje się, gdy ta lekcja jest przerobiona. Kolejność: według lekcji after.
  // Pytania trafiają do rejestru zadań („Moje błędy”) z kluczem read~<id>~skrót – niezależnym od after; lekcja zadania =
  // lekcja after (grupa na liście błędów, zasięg linków w podsumowaniu typowych błędów), źródło „r”.
  const READING = (window.READING || []).filter((r) => r && BY_ID[r.after] && Array.isArray(r.text))
    .map((r, i) => ({ ...r, lesson: BY_ID[r.after], glossary: r.glossary || {}, questions: r.questions || [], _i: i }))
    .sort((a, b) => PATH.indexOf(a.lesson) - PATH.indexOf(b.lesson) || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
  const RD_BY_ID = Object.fromEntries(READING.map((r) => [r.id, r]));
  READING.forEach((r) => r.questions.forEach((ex) => {
    const base = `read~${r.id}~${hashStr([ex.type, ex.q || "", (ex.options || []).join("|"), JSON.stringify(ex.answers ?? ex.answer ?? "")].join("#"))}`;
    let k = base, n = 2;
    while (TASKS.has(k)) k = `${base}~${n++}`;
    TASKS.set(k, { ex, lesson: r.lesson, src: "r", instr: "", reading: r });
    KEY_OF.set(ex, k);
  }));
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
  // Talia „Słówka z czytanek”: hasła ze słowniczków czytanek (glossary; przykład = zdanie z tekstu). manual – słowo
  // trafia do powtórek tylko przez „Dodaj do fiszek” w czytance, bez codziennej porcji nowych słówek z tej talii.
  // Słowo z glossary, które jest też w lekcji / dziale, ma ten sam klucz – karta z talii czytanek pokazuje znaczenie
  // z tekstu, a pozostałe jako „też:”.
  const rdSentences = (p) => String(p).match(/[^.!?]+[.!?]+[”’"]*|[^.!?]+$/g) || [];
  const RD_DECK = { id: "reading", title: "📖 Słówka z czytanek", level: "", href: "#/czytanki", manual: true, items: [] };
  {
    const seen = new Set();
    READING.forEach((r) => Object.entries(r.glossary).forEach(([en, pl]) => {
      const k = wordKey(en);
      if (!k || seen.has(k)) return;
      seen.add(k);
      const re = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
      const ex = r.text.flatMap(rdSentences).map((s) => s.trim()).find((s) => re.test(s));
      RD_DECK.items.push(ex ? { en, pl, ex } : { en, pl });
    }));
    if (RD_DECK.items.length) DECKS.push(RD_DECK);
  }
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
  const mistakeList = () => Object.entries(state.mistakes).filter(([k]) => hasTask(k)).map(([key, m]) => ({ key, m, ...TASKS.get(key) })); // hasTask: też zadania z trenera odmiany
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
  const streakHint = (s) => !s.days ? "Zrób pierwsze zadanie albo oceń słówko w fiszkach – tu zobaczysz swoje dni nauki."
    : s.todayDone ? "Dziś już się uczysz – seria trwa."
    : s.current ? "Zrób dziś choć jedno zadanie albo słówko, żeby nie przerwać serii."
    : "Zrób dziś choć jedno zadanie albo słówko i zacznij nową serię.";
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
    const hint = streakHint(s);
    return `<section class="card activity" id="dziennik" aria-label="Dziennik nauki">
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
    for (const d of decks) if (!d.manual) for (const k of d.keys) if (!state.srs[k] && !seen.has(k)) { // talia czytanek – tylko „Dodaj do fiszek”
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
  // ---------- Pisownia brytyjska i amerykańska ----------
  // Obie pisownie są poprawne niezależnie od wybranego akcentu lektora: przy sprawdzaniu odpowiedzi (matchOne, diffHtml)
  // i wymowy (prTokens) każde słowo sprowadzamy do jednej postaci (amerykańskiej). Słowa wypisane jawnie, a nie same
  // reguły („-our → -or”, „-ise → -ize”), bo four/hour/your/tour i promise/advise/exercise/surprise piszemy tak samo.
  const SP_OUR = "colour favour flavour neighbour behaviour humour honour labour harbour rumour tumour vapour odour armour savour endeavour vigour rigour clamour splendour valour parlour".split(" ");
  const SP_RE = "cent theat met kilomet centimet millimet lit fib calib somb meag spect lust sab"; // centre(s/d) → center(s/ed)
  const SP_ISE = "apolog recogn real organ critic memor priorit modern special marginal emphas summar sympath minim maxim categor final util social character civil standard mobil legal visual author custom optim ideal familiar normal personal popular public scrutin stabil symbol theor harmon hospital industrial jeopard legitim local monopol neutral penal privat rational revolution steril subsid econom agon antagon fantas patron colon global digit energ immun mesmer moistur vapor vandal"; // -ise(s/d/ing/ation/er) → -ize…
  const SP_LL = "travel cancel label model fuel quarrel dial level signal total equal marvel counsel duel tunnel channel pedal shovel swivel grovel snorkel yodel funnel jewel"; // travelled → traveled
  const SPELL = {};
  ("grey gray greys grays greyer grayer greyest grayest greyish grayish mum mom mums moms tyre tire tyres tires cheque check cheques checks " +
    "practise practice practises practices practised practiced practising practicing licence license licences licenses defence defense " +
    "defences defenses offence offense offences offenses pretence pretense pyjamas pajamas aeroplane airplane aeroplanes airplanes " +
    "storey story storeys stories programme program programmes programs catalogue catalog catalogues catalogs dialogue dialog dialogues dialogs " +
    "analogue analog cosy cozy cosier cozier cosiest coziest cosiness coziness mould mold moulds molds mouldy moldy plough plow ploughs plows " +
    "aluminium aluminum sceptical skeptical sceptic skeptic moustache mustache doughnut donut doughnuts donuts kerb curb yoghurt yogurt " +
    "judgement judgment ageing aging manoeuvre maneuver manoeuvres maneuvers enrol enroll enrols enrolls enrolment enrollment fulfil fulfill " +
    "fulfils fulfills fulfilment fulfillment skilful skillful skilfully skillfully wilful willful instalment installment jewellery jewelry " +
    "analyse analyze analyses analyzes analysed analyzed analysing analyzing paralyse paralyze paralysed paralyzed")
    .split(" ").forEach((w, i, a) => { if (i % 2 === 0) SPELL[w] = a[i + 1]; });
  const SP_OUR_RE = new RegExp(`^(${SP_OUR.join("|")})(.*)$`), SP_RE_RE = new RegExp(`^(${SP_RE.replace(/ /g, "|")})re(s|d)?$`);
  const SP_ISE_RE = new RegExp(`^(${SP_ISE.replace(/ /g, "|")})is(e|es|ed|ing|ation|ations|er|ers)$`);
  const SP_LL_RE = new RegExp(`^(${SP_LL.replace(/ /g, "|")})l(ed|ing|er|ers|or|ors|ous)$`);
  function spellFold(w) {
    if (SPELL[w]) return SPELL[w];
    let m;
    if ((m = w.match(SP_OUR_RE))) return m[1].slice(0, -3) + "or" + m[2];
    if ((m = w.match(SP_RE_RE))) return m[1] + "er" + (m[2] === "d" ? "ed" : m[2] || "");
    if ((m = w.match(SP_ISE_RE))) return m[1] + "iz" + m[2];
    if ((m = w.match(SP_LL_RE))) return m[1] + m[2];
    return w;
  }
  const spellFoldStr = (s) => s.split(" ").map(spellFold).join(" ");
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
    if ((m = t.match(/^(\w+)n't$/)) && t !== "amn't") return [t, m[1] + " not"]; // „amn't” nie istnieje – nie zaliczamy go jako „am not”
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
    const g = new Set([...variants(given)].map(spellFoldStr)); return [...variants(expected)].some((v) => g.has(spellFoldStr(v)));
  };
  const matches = (given, answers) => answers.some((a) => expandAnswer(a).some((e) => matchOne(given, e)));
  // Znajdź błąd – sprawdzanie poprawki. Gdy matches() przyjmuje samo błędne zdanie (różnica tylko w przecinkach albo
  // w skrócie: „Yes, I'm.” → „Yes, I am.”, „I amn't” = „am not”, „can not” = „cannot”), porównujemy dokładnie:
  // znak po znaku, bez wielkości liter, odstępów i kropki na końcu (7 par). Wynik zapamiętany w zadaniu (ex.strict).
  const feStrictForm = (s) => String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").replace(/\s+([,.!?;:…])/g, "$1").replace(/[\s.!?…]+$/, "").trim();
  const feIsStrict = (ex) => { if (ex.strict === undefined) ex.strict = matches(ex.q, ex.answers); return ex.strict; };
  const feMatch = (given, ex) => feIsStrict(ex)
    ? ex.answers.some((a) => expandAnswer(a).some((e) => feStrictForm(e) === feStrictForm(given)))
    : matches(given, ex.answers);

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
    const gRaw = given.trim().split(/\s+/), gN = gRaw.map((w) => spellFoldStr(normalize(w)));
    let best = null;
    // Jeśli uczeń nie używał skrótów, porównujemy z pełną formą wzorca (has not ↔ hasn't), żeby nie zaznaczać fałszywych różnic.
    const fullForm = (s) => { const t = s.split(/\s+/); return t.map((w, i) => { const v = tokenVariants(normalize(w), normalize(t[i + 1] || "")); if (!/'/.test(w) || v.length < 2) return w; const f = v[v.length - 1]; return /^[A-Z]/.test(w) ? f.charAt(0).toUpperCase() + f.slice(1) : f; }).join(" "); };
    const useFull = !/['’]/.test(given);
    for (const a of answers) for (const e0 of expandAnswer(a)) {
      const e = useFull ? fullForm(e0) : e0;
      const eRaw = e.split(/\s+/), eN = eRaw.map((w) => spellFoldStr(normalize(w)));
      const r = lcs(gN, eN);
      const score = r.n * 2 - eN.length - gN.length;
      if (!best || score > best.score) best = { score, eRaw, r };
    }
    if (!best) return "";
    const g = gRaw.map((w, i) => best.r.inA.has(i) ? esc(w) : `<span class="d-extra">${esc(w)}</span>`).join(" ");
    const e = best.eRaw.map((w, j) => best.r.inB.has(j) ? esc(w) : `<span class="d-miss">${esc(w)}</span>`).join(" ");
    return `<div class="diff"><div><span class="d-lbl">Twoja odpowiedź:</span> ${g}</div><div><span class="d-lbl">Poprawnie:</span> ${e} ${speakBtn(best.eRaw.join(" "))}</div></div>`;
  }

  // ---------- Typowe błędy (tylko opis błędnej odpowiedzi – ocena się nie zmienia) ----------
  // Odpowiedź porównujemy z najbliższym wzorcem (skróty rozwinięte do pełnych form) i nazywamy różnice.
  // Heurystyka: przy wątpliwościach „other” (bez etykiety) – lepiej nic nie napisać niż napisać źle.
  const ERR_INFO = {
    s3: { label: "Końcówka -s w 3. osobie", tip: "Po he / she / it czasownik ma -s (she works), ale po does / doesn't / did i po can, will, must już nie (Does she work? She can swim).", lesson: "present-simple" },
    plural: { label: "Liczba mnoga", tip: "Po two, three, many, these, those rzeczownik ma końcówkę -s (two books, these cars), po a / one / this – nie.", lesson: "plural-nouns" },
    ends: { label: "Końcówka -s", tip: "Sprawdź końcówkę -s: czasownik po he / she / it (she works) albo rzeczownik w liczbie mnogiej (two books)." },
    article: { label: "Przedimek a / an / the", tip: "a / an – jedna rzecz, o której mówisz pierwszy raz (an przed samogłoską w wymowie: an apple); the – konkretna, znana już rzecz.", lesson: "articles-basics" },
    aux: { label: "Czasownik posiłkowy", tip: "do / does / did, am / is / are, was / were, have / has muszą pasować do osoby (he does, they do) i do czasu." },
    irr: { label: "Forma czasownika nieregularnego", tip: "Sprawdź, której z trzech form potrzeba: go – went (Past Simple) – gone (po have / has).", lesson: "irregular-verbs" },
    verb: { label: "Forma czasownika", tip: "Sprawdź końcówkę czasownika: -ing (is working), -ed (worked) albo forma podstawowa (can work, didn't work)." },
    prep: { label: "Przyimek", tip: "Przyimki często nie pasują 1:1 do polskich (in / on / at, to / for) – ucz się ich razem z całym wyrażeniem." },
    order: { label: "Szyk wyrazów", tip: "Te same słowa, inna kolejność. W zdaniu: podmiot – czasownik – reszta; w pytaniu czasownik posiłkowy przed podmiotem (Do you…? Is she…?).", lesson: "word-order" },
    typo: { label: "Literówka", tip: "Słowo jest prawie dobre – sprawdź pisownię." },
    missing: { label: "Brakujące słowo", tip: "W zdaniu brakuje wyrazu – porównaj je z poprawną wersją." },
    extra: { label: "Zbędne słowo", tip: "W zdaniu jest wyraz, którego nie powinno być." },
  };
  const ERR_KEYS = Object.keys(ERR_INFO);
  const errSet = (s) => new Set(s.split(" "));
  const ERR_ART = errSet("a an the");
  const ERR_AUX = errSet("do does did am is are was were have has had be been being will would don't doesn't didn't isn't aren't wasn't weren't haven't hasn't hadn't won't wouldn't");
  const ERR_PREP = errSet("in on at for from of with by about into onto under over since during until till after before through across between among towards toward behind near above below without inside outside around along");
  const ERR_SUBJ3 = errSet("he she it who which this that everyone someone anyone one everything something anything nothing");
  const ERR_BASE = errSet("do does did not can could will would should must might may shall to let's let don't doesn't didn't can't cannot couldn't won't wouldn't shouldn't mustn't");
  const ERR_PL = errSet("two three four five six seven eight nine ten eleven twelve twenty thirty hundred thousand many some these those few several both all of various");
  const ERR_SG = errSet("a an one this that every each another");
  const ERR_DET = errSet("my your his her its our their the this that");
  const ERR_ADV = errSet("always usually often sometimes never rarely seldom also only just really still hardly ever generally normally even already not");
  // Słowniki z danych (budowane przy pierwszym użyciu): wszystkie słowa z odpowiedzi, imiona, formy nieregularne,
  // słowa występujące jako czasownik (po he/she/it z -s, po can/don't…) i jako rzeczownik (po a/the/two…).
  let errDict = null;
  function errDicts() {
    if (errDict) return errDict;
    const known = new Set(), names = new Set(), lower = new Set(), verbs = new Set(), nouns = new Set(), irr = new Map();
    const irrL = BY_ID["irregular-verbs"];
    (irrL ? irrL.sections : []).filter((s) => s.type === "table" && /^Bezokolicznik/.test((s.headers || [])[0] || "")).forEach((s) => s.rows.forEach((r) => {
      const base = stripTags(r[0]).toLowerCase();
      if (!/^[a-z]+$/.test(base)) return;
      r.slice(0, 3).forEach((c) => stripTags(c).toLowerCase().split(/[^a-z]+/).forEach((f) => { if (f && f !== "us" && f !== base) irr.set(f, base); }));
    }));
    const sing = (w) => /ies$/.test(w) ? w.slice(0, -3) + "y" : /(ch|sh|ss|x|o)es$/.test(w) ? w.slice(0, -2) : w.slice(0, -1);
    for (const { ex } of TASKS.values()) {
      const ans = ex.type === "choice" ? [] : (ex.answers || []).flat();
      for (const a of ans) {
        const all = String(a).replace(/[{}()|]/g, " ");
        // Imiona i nazwy: wielka litera w środku zdania i nigdzie małą (odrzuca „– Are you…?” w dialogach).
        all.split(/\s+/).forEach((w, i) => { const c = w.replace(/[^\w']/g, ""); if (/^[a-z]/.test(c)) lower.add(c); else if (i && /^[A-Z][a-z]+$/.test(c)) names.add(c.toLowerCase()); });
        normalize(all).split(" ").forEach((w) => tokenVariants(w).forEach((v) => v.split(" ").forEach((x) => known.add(x))));
        let first = String(a).replace(/[()]/g, "");
        while (/\{[^{}]*\}/.test(first)) first = first.replace(/\{([^{}|]*)[^{}]*\}/g, "$1");
        const t = [...variants(first)].pop().split(" ");
        t.forEach((w, i) => {
          const p = t[i - 1];
          if (ERR_BASE.has(p) && p !== "to" && p !== "not") verbs.add(w);
          if ((p === "he" || p === "she" || p === "it") && /s$/.test(w)) verbs.add(sing(w));
          if (ERR_ART.has(p)) nouns.add(w);
          if (ERR_PL.has(p) && p !== "of" && p !== "all" && /s$/.test(w)) nouns.add(sing(w));
        });
      }
    }
    lower.forEach((w) => names.delete(w));
    return (errDict = { known, names, verbs, nouns, irr });
  }
  const errSForms = (b) => [b + "s", b + "es", /[^aeiou]y$/.test(b) ? b.slice(0, -1) + "ies" : "-"];
  const errStems = (w) => {
    const out = new Set([w]);
    for (const suf of ["ing", "ies", "ied", "es", "ed", "s", "d"]) {
      if (!w.endsWith(suf) || w.length < suf.length + 2) continue;
      const s = w.slice(0, -suf.length);
      out.add(s); out.add(s + "e");
      if (suf === "ies" || suf === "ied") out.add(s + "y");
      if (/([^aeiou])\1$/.test(s)) out.add(s.slice(0, -1));
    }
    const irr = errDicts().irr;
    [...out].forEach((s) => { if (irr.has(s)) out.add(irr.get(s)); });
    return out;
  };
  // Odległość edycyjna (zamiana sąsiednich liter liczy się jako jeden błąd).
  function errDist(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  // Brak / nadmiar -s: base – forma bez -s, missingS – uczeń pominął -s, ctx – wcześniejsze słowa wzorca.
  function errEndS(base, missingS, ctx) {
    const D = errDicts();
    const k = ctx.filter((w) => !ERR_ADV.has(w)), p = k[k.length - 1], p2 = k[k.length - 2];
    if (missingS) {
      if (ERR_SUBJ3.has(p) || D.names.has(p)) return "s3";
      if (ERR_PL.has(p) || (/^\d+$/.test(p || "") && p !== "1")) return "plural";
    } else {
      if (ERR_BASE.has(ctx[ctx.length - 1]) || ERR_BASE.has(p)) return "s3";
      if (ERR_SG.has(p)) return "plural";
    }
    const v = D.verbs.has(base), n = D.nouns.has(base);
    if (v && !n) return "s3";
    if (n && !v) return "plural";
    if (missingS && ERR_DET.has(p2) && p && !/s$/.test(p)) return "s3";
    return "ends";
  }
  function errPair(x, y, ctx) {
    if (ERR_ART.has(x) && ERR_ART.has(y)) return "article";
    if (ERR_AUX.has(x) && ERR_AUX.has(y)) return "aux";
    if (errSForms(x).includes(y) && !ERR_ADV.has(x)) return errEndS(x, true, ctx);
    if (errSForms(y).includes(x) && !ERR_ADV.has(y)) return errEndS(y, false, ctx);
    const D = errDicts(), stem = [...errStems(x)].some((s) => errStems(y).has(s)), typo = !D.known.has(x) && y.length > 1 && errDist(x, y);
    if (stem && (D.irr.has(x) || D.irr.has(y))) return "irr";
    if (typo === 1) return "typo";
    if (stem) return "verb";
    if ((ERR_PREP.has(x) || x === "to") && (ERR_PREP.has(y) || y === "to")) return "prep";
    if (typo && typo <= (y.length <= 4 ? 1 : 2)) return "typo";
    return "other";
  }
  const errLone = (w, missing) => ERR_ART.has(w) ? "article" : ERR_AUX.has(w) ? "aux" : ERR_PREP.has(w) ? "prep" : missing ? "missing" : "extra";
  // Zwraca listę kluczy ERR_INFO bez powtórzeń, ["other"] (nie wiadomo) albo [] (brak różnic).
  function errClassify(given, answers) {
    // Warianty od pełnych form (did not) – przy remisie wygrywają one, a nie skróty.
    const toks = (s) => [...variants(s)].slice(0, 8).reverse().map((v) => (v ? v.split(" ") : []));
    const ev = answers.flatMap((a) => expandAnswer(a).flatMap(toks));
    // Słowo w innej pisowni (color ↔ colour) zamieniamy na słowo ze wzorca – to nie jest błąd.
    const spell = new Map(ev.flat().map((w) => [spellFold(w), w]));
    const gv = toks(given).map((t) => t.map((w) => spell.get(spellFold(w)) || w));
    const sorted = (t) => t.slice().sort().join(" ");
    // Najbliższy wzorzec: odległość edycyjna na słowach, podobne słowo (literówka, inna forma, ten sam rodzaj) = pół błędu,
    // te same słowa w innej kolejności = jeden błąd. Przy remisie – dłuższy wzorzec (z opcjonalnymi słowami).
    const memo = new Map();
    const near = (x, y) => {
      const k = x + " " + y;
      if (!memo.has(k)) memo.set(k, (ERR_ART.has(x) && ERR_ART.has(y)) || (ERR_AUX.has(x) && ERR_AUX.has(y)) || (ERR_PREP.has(x) && ERR_PREP.has(y))
        || [...errStems(x)].some((s) => errStems(y).has(s)) || (Math.min(x.length, y.length) > 2 && errDist(x, y) <= (Math.min(x.length, y.length) <= 4 ? 1 : 2)) ? 0.5 : 1);
      return memo.get(k);
    };
    const cost = (a, b) => {
      let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
      for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : near(a[i - 1], b[j - 1])));
        prev = cur;
      }
      return prev[b.length];
    };
    let best = null;
    for (const e of ev) for (const g of gv) {
      const c = sorted(g) === sorted(e) ? (g.join(" ") === e.join(" ") ? 0 : 1) : cost(g, e);
      if (!best || c < best.c || (c === best.c && e.length > best.e.length)) best = { c, g, e };
    }
    if (!best || best.c === 0) return [];
    const { g, e } = best, r = lcs(g, e);
    if (sorted(g) === sorted(e)) return ["order"];
    if (e.length > 2 && r.n < Math.ceil(e.length / 2)) return ["other"];
    // Odcinki różnic między dopasowanymi słowami.
    const A = [...r.inA].sort((p, q) => p - q), B = [...r.inB].sort((p, q) => p - q), segs = [];
    for (let k = 0, pi = -1, pj = -1; k <= A.length; k++) {
      const ai = k < A.length ? A[k] : g.length, bj = k < B.length ? B[k] : e.length;
      if (ai - pi > 1 || bj - pj > 1) segs.push({ x: g.slice(pi + 1, ai), y: e.slice(pj + 1, bj), j: pj + 1 });
      pi = ai; pj = bj;
    }
    const out = new Set();
    // Słowo brakujące w jednym miejscu i zbędne w innym = przestawione.
    const miss = segs.flatMap((s) => s.y), moved = [];
    segs.forEach((s) => { s.x = s.x.filter((w) => { const i = miss.indexOf(w); if (i < 0) return true; miss.splice(i, 1); moved.push(w); return false; }); });
    segs.forEach((s) => { s.y = s.y.filter((w) => { const i = moved.indexOf(w); if (i < 0) return true; moved.splice(i, 1); out.add("order"); return false; }); });
    for (const s of segs) {
      const { x, y } = s, ctx = e.slice(0, s.j);
      // Różna długość: z dłuższej strony zdejmujemy przedimki / posiłkowe / przyimki (brakujące albo zbędne).
      while (x.length !== y.length && x.length && y.length) {
        const long = x.length > y.length ? x : y, i = long.findIndex((w) => ERR_ART.has(w) || ERR_AUX.has(w) || ERR_PREP.has(w));
        if (i < 0) break;
        out.add(errLone(long[i], long === y));
        long.splice(i, 1);
      }
      if (x.length && y.length && x.length !== y.length) { out.add("other"); continue; }
      if (!x.length) y.forEach((w) => out.add(errLone(w, true)));
      else if (!y.length) x.forEach((w) => out.add(errLone(w, false)));
      else x.forEach((w, i) => out.add(errPair(w, y[i], ctx.concat(y.slice(0, i)))));
    }
    if (out.size > 1) out.delete("other");
    return [...out];
  }
  // Etykiety pod poprawką przy jednym zadaniu.
  const errTagsHtml = (keys) => {
    const k = (keys || []).filter((x) => ERR_INFO[x]);
    return k.length ? `<div class="err-tags">${k.map((x) => `<span class="err-tag" title="${esc(ERR_INFO[x].tip)}">${ERR_INFO[x].label}</span>`).join("")}</div>` : "";
  };
  // Podsumowanie po zestawie: 1–3 najczęstsze typy błędów (każdy typ liczony raz na zadanie).
  function errSummaryHtml(ctls) {
    const cnt = new Map();
    ctls.forEach((c) => { if (c.result && !c.result.ok) (c.result.errs || []).forEach((k) => { if (ERR_INFO[k]) cnt.set(k, (cnt.get(k) || 0) + 1); }); });
    const top = [...cnt].sort((a, b) => b[1] - a[1] || ERR_KEYS.indexOf(a[0]) - ERR_KEYS.indexOf(b[0])).slice(0, 3);
    if (!top.length) return "";
    // Link do lekcji z wyjaśnieniem tylko wtedy, gdy nie jest dalej na ścieżce niż lekcje z tego zestawu.
    const reach = Math.max(-1, ...ctls.map((c) => { const t = TASKS.get(KEY_OF.get(c.ex)); return t ? PATH.indexOf(t.lesson) : -1; }));
    return `<div class="err-sum"><div class="err-sum-h">${top.length > 1 ? "Najczęstsze błędy" : "Najczęstszy błąd"}</div><ul>${top.map(([k, n]) => {
      const i = ERR_INFO[k], l = i.lesson && BY_ID[i.lesson] && (reach < 0 || PATH.indexOf(BY_ID[i.lesson]) <= reach) ? BY_ID[i.lesson] : null;
      return `<li><b>${i.label}</b> <span class="err-n">${n}×</span><div class="err-tip">${i.tip}${l ? ` <a href="#/lesson/${l.id}">Lekcja ${lessonNo(l)}: ${esc(l.title)} →</a>` : ""}</div></li>`;
    }).join("")}</ul></div>`;
  }

  // ---------- Lektor (synteza mowy, Web Speech API) i ustawienia głosu ----------
  // eng-voice = { accent: "GB" | "US", voice: id wybranego głosu ("" = automatycznie), rate: tempo }.
  // Zostaje na tym urządzeniu (KEEP_LOCAL) – głosy są inne w każdym systemie i przeglądarce. Zapisany głos, którego tu
  // nie ma (np. po „Zastąp” kopią z innego urządzenia), zastępuje najlepszy głos wybranego akcentu – zapis zostaje.
  const ACCENTS = { GB: { name: "brytyjski", lang: "en-GB" }, US: { name: "amerykański", lang: "en-US" } };
  const RATE_CHOICES = [{ r: 0.7, name: "Bardzo wolno" }, { r: 0.8, name: "Wolno" }, { r: 0.92, name: "Normalnie" }, { r: 1.1, name: "Szybko" }];
  const RATE_DEFAULT = 0.92, SLOWER = 0.75; // „Wolniej” w dyktandzie = wybrane tempo × 0,75
  function loadVoiceCfg() {
    const v = store.get("voice", null) || {};
    return {
      accent: ["GB", "US"].includes(v.accent) ? v.accent : "GB",
      voice: typeof v.voice === "string" ? v.voice : "",
      rate: RATE_CHOICES.some((c) => c.r === v.rate) ? v.rate : RATE_DEFAULT,
    };
  }
  let voiceCfg = loadVoiceCfg(), voice = null;
  const vLang = (v) => String(v.lang || "").replace("_", "-").toLowerCase();
  const isEnVoice = (v) => /^en(-|$)/.test(vLang(v));
  const voiceId = (v) => v.voiceURI || v.name;
  const allVoices = () => ("speechSynthesis" in window ? speechSynthesis.getVoices() : []);
  const accentVoices = (acc) => allVoices().filter((v) => vLang(v) === ACCENTS[acc].lang.toLowerCase());
  // Głosy „naturalne” (Edge: Online (Natural), Chrome: Google, Apple: Premium/Enhanced) brzmią dużo lepiej niż zwykłe.
  const voiceRank = (v) => (/natural|online|neural|google|premium|enhanced/i.test(v.name) ? 1 : 0);
  const bestVoice = (vs) => vs.slice().sort((a, b) => voiceRank(b) - voiceRank(a))[0] || null; // przy remisie – kolejność systemu
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = accentVoices(voiceCfg.accent);
    voice = (voiceCfg.voice && vs.find((v) => voiceId(v) === voiceCfg.voice)) || bestVoice(vs)
      || bestVoice(accentVoices(voiceCfg.accent === "GB" ? "US" : "GB")) || bestVoice(allVoices().filter(isEnVoice)) || null;
  }
  // Płeć głosu – tylko z nazwy (Google UK English Female, Microsoft Ryan…); "" = nie wiadomo.
  const V_FEMALE = new RegExp(`\\b(female|woman|${"libby sonia maisie hollie abbie bella olivia mia amy emma ava aria jenny michelle ana samantha karen moira tessa fiona serena kate susan hazel zira catherine natasha clara emily elizabeth nancy sara jane ashley cora monica joanna kendra kimberly salli ivy ruth danielle martha kathy victoria allison shelley sandy flo grandma ellie".replace(/ /g, "|")})\\b`, "i");
  const V_MALE = new RegExp(`\\b(male|man|${"ryan thomas george alfie elliot ethan noah oliver guy davis tony jason brian christopher eric roger steffan andrew brandon daniel arthur alex fred tom aaron rishi lee gordon reed rocko eddy grandpa james william mark david liam matthew justin joey kevin stephen ralph albert bruce junior".replace(/ /g, "|")})\\b`, "i");
  const voiceGender = (v) => { const n = String(v.name).split(" - ")[0]; return V_FEMALE.test(n) ? "f" : V_MALE.test(n) ? "m" : ""; };
  // Drugi lektor (np. druga osoba w dialogu): inny głos angielski niż main – najpierw tego samego akcentu, potem o innej
  // płci (gdy da się ją poznać po nazwie), potem „naturalny”. null = w urządzeniu jest tylko jeden głos angielski
  // (wtedy obie osoby czyta ten sam głos – można je odróżnić np. wysokością: utterance.pitch).
  function secondVoice(main) {
    main = main || voice;
    if (!main) return null;
    const g = voiceGender(main);
    const score = (v) => (vLang(v) === vLang(main) ? 4 : 0) + (!g || !voiceGender(v) ? 1 : voiceGender(v) !== g ? 2 : 0) + voiceRank(v);
    return allVoices().filter((v) => isEnVoice(v) && voiceId(v) !== voiceId(main)).sort((a, b) => score(b) - score(a))[0] || null;
  }
  // Dyktando bez angielskiego głosu nie ma sensu – pokazujemy czytelny komunikat (aktualizowany, gdy przeglądarka doczyta głosy).
  function ttsProblem(failed) {
    if (!("speechSynthesis" in window)) return "Twoja przeglądarka nie potrafi czytać tekstu na głos, więc dyktando nie zadziała. Otwórz stronę w Chrome, Edge albo Safari.";
    if ((speechSynthesis.getVoices().length && !voice) || failed) return "Nie udało się znaleźć angielskiego głosu w tym urządzeniu – zdania mogą nie być czytane albo brzmieć z polskim akcentem. Dodaj głos angielski w ustawieniach systemu (Android: Ustawienia → Zamiana tekstu na mowę, Windows: Ustawienia → Czas i język → Mowa, iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy) albo otwórz stronę w innej przeglądarce.";
    return "";
  }
  const ttsWarnHtml = (failed) => { const p = ttsProblem(failed); return p ? `<div class="callout warning"><h3>${icon("alert")} Brak głosu angielskiego</h3><div class="prose">${p}</div></div>` : ""; };
  const syncTtsWarn = (failed) => document.querySelectorAll(".tts-warn").forEach((el) => { el.innerHTML = ttsWarnHtml(failed); });
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); syncTtsWarn(); syncVoiceDlg(); }; }
  // slower – mnożnik tempa (dyktando „Wolniej”: SLOWER); withVoice – inny głos niż wybrany (np. secondVoice()).
  // Zwraca wypowiedź (SpeechSynthesisUtterance) – czytanki dopinają do niej „end”; lastUtter = ostatnia rozpoczęta.
  let lastUtter = null;
  function speak(text, btn, slower, onFail, withVoice) {
    if (!("speechSynthesis" in window)) { alert("Twoja przeglądarka nie obsługuje odczytu na głos."); return; }
    speechSynthesis.cancel();
    document.querySelectorAll(".speak.playing, .d-btn.playing, .vd-try.playing").forEach((b) => b.classList.remove("playing"));
    const say = stripTags(text).replace(/\s*\/\s*/g, ". ").replace(/[→=]/g, ". ").replace(/(^|\s)[–—](\s|$)/g, ". ");
    const u = new SpeechSynthesisUtterance(say), v = withVoice || voice;
    u.lang = v ? v.lang : ACCENTS[voiceCfg.accent].lang;
    if (v) u.voice = v;
    u.rate = Math.max(0.5, voiceCfg.rate * (slower || 1));
    u.onend = () => { if (btn) btn.classList.remove("playing"); };
    u.onerror = (e) => { if (btn) btn.classList.remove("playing"); if (onFail && !/interrupted|canceled/.test(e.error || "")) onFail(e.error); };
    if (btn) btn.classList.add("playing");
    lastUtter = u;
    speechSynthesis.speak(u);
    return u;
  }
  // Uwaga: przekazuj tu wyłącznie tekst ANGIELSKI (tłumaczenia trzymamy w osobnych polach).
  const speakBtn = (text) => `<button class="speak" data-say="${esc(stripTags(text))}" title="Posłuchaj wymowy" aria-label="Posłuchaj">${icon("volume")}</button>`;

  // ---------- Okienko „Ustawienia głosu” (przycisk w górnym pasku, link w dyktandzie i wymowie) ----------
  // Zmiany zapisują się od razu (bez przycisku „Zapisz”). Lista głosów = głosy wybranego akcentu z tego urządzenia.
  const VOICE_SAMPLE = "Hello! Nice to meet you. How are you today?";
  const voiceLink = (what) => ("speechSynthesis" in window ? ` ${what} zmienisz w <button type="button" class="link-btn" data-voice-open>ustawieniach głosu</button>.` : "");
  const voiceName = (v) => String(v.name).replace(/\s+-\s+English.*$/i, "").replace(/^Microsoft\s+/i, "").trim() || v.name;
  const saveVoiceCfg = () => { store.set("voice", voiceCfg); pickVoice(); };
  function voiceDlgHtml() {
    const acc = ACCENTS[voiceCfg.accent], vs = accentVoices(voiceCfg.accent), auto = bestVoice(vs);
    const cur = voiceCfg.voice && vs.some((v) => voiceId(v) === voiceCfg.voice) ? voiceCfg.voice : "";
    const row = (id, name, sub, v) => `<li class="${id === cur ? "on" : ""}">
        <label><input type="radio" name="vd-voice" value="${esc(id)}"${id === cur ? " checked" : ""}><span><span class="vd-name">${esc(name)}</span>${sub ? `<span class="vd-sub">${sub}</span>` : ""}</span></label>
        ${v ? `<button type="button" class="btn small vd-try" data-try="${esc(id)}" aria-label="Posłuchaj: ${esc(name)}">${icon("volume")}<span class="vd-try-t"> Posłuchaj</span></button>` : ""}
      </li>`;
    const online = (v) => v.localService === false ? "wymaga internetu" : "";
    let voices;
    if (!allVoices().length) voices = `<p class="muted">${ttsProblem() || "Wczytywanie listy głosów…"}</p>`;
    else if (!vs.length) voices = `<div class="callout warning vd-none"><div class="prose">W tym urządzeniu nie ma głosu z akcentem ${acc.name}m${voice ? ` – czytać będzie głos <b>${esc(voiceName(voice))}</b> (${esc(voice.lang)})` : ""}. Inne głosy można dodać w ustawieniach systemu (Windows: Ustawienia → Czas i język → Mowa, Android: Ustawienia → Zamiana tekstu na mowę) albo otworzyć stronę w innej przeglądarce.</div></div>`;
    else voices = `<ul class="vd-voices">${row("", "Automatycznie", auto ? `najlepszy dostępny: ${esc(voiceName(auto))}` : "", null)}${vs.map((v) => row(voiceId(v), voiceName(v), online(v), v)).join("")}</ul>`;
    return `<div class="vd-head"><h2 id="voiceDlgH">${icon("voice")} Ustawienia głosu</h2><button type="button" class="icon-btn vd-close" aria-label="Zamknij">${icon("x")}</button></div>
      <div class="vd-body">
        <section class="vd-sec"><h3>Akcent lektora</h3>
          <div class="chips">${Object.entries(ACCENTS).map(([k, a]) => `<button type="button" class="chip ${k === voiceCfg.accent ? "active" : ""}" data-accent="${k}" aria-pressed="${k === voiceCfg.accent}">${a.name[0].toUpperCase() + a.name.slice(1)}</button>`).join("")}</div>
          <p class="muted vd-note">Pisownia brytyjska i amerykańska (<i>colour / color, centre / center, realise / realize</i>) jest zawsze poprawna.${SR ? " Wymowa z mikrofonem rozpoznaje mowę z wybranym akcentem." : ""}</p>
        </section>
        <section class="vd-sec"><h3>Głos</h3>${voices}</section>
        <section class="vd-sec"><h3>Tempo</h3>
          <div class="chips">${RATE_CHOICES.map((c) => `<button type="button" class="chip ${c.r === voiceCfg.rate ? "active" : ""}" data-rate="${c.r}" aria-pressed="${c.r === voiceCfg.rate}">${c.name}</button>`).join("")}</div>
          <p class="muted vd-note">„Wolniej” w dyktandzie czyta jeszcze wolniej niż wybrane tempo.</p>
        </section>
        <div class="vd-foot"><button type="button" class="btn primary vd-sample">${icon("play")} Posłuchaj przykładu</button></div>
      </div>`;
  }
  // Przebudowa treści otwartego okienka z zachowaniem fokusu (np. po zmianie akcentu albo doczytaniu głosów).
  function syncVoiceDlg() {
    const d = document.getElementById("voiceDlg");
    if (!d || !d.hasAttribute("open")) return;
    const a = document.activeElement, key = a && d.contains(a) ? ["data-accent", "data-rate", "data-try"].find((k) => a.hasAttribute(k)) : null;
    const sel = key ? `[${key}="${CSS.escape(a.getAttribute(key))}"]` : a && a.name === "vd-voice" ? `input[name="vd-voice"][value="${CSS.escape(a.value)}"]` : null;
    const top = (d.querySelector(".vd-body") || {}).scrollTop || 0;
    d.innerHTML = voiceDlgHtml();
    d.querySelector(".vd-body").scrollTop = top;
    const f = sel && d.querySelector(sel);
    if (f) f.focus(); else if (!d.contains(document.activeElement)) d.querySelector(".vd-close").focus(); // fokus nie ucieka z okienka
  }
  const closeVoiceDlg = (d) => { if (d.close) d.close(); else { d.removeAttribute("open"); speechSynthesis.cancel(); } };
  function openVoiceDlg() {
    if (!("speechSynthesis" in window)) return;
    let d = document.getElementById("voiceDlg");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "voiceDlg"; d.className = "voice-dlg"; d.setAttribute("aria-labelledby", "voiceDlgH");
      document.body.appendChild(d);
      d.addEventListener("click", (e) => {
        if (e.target === d) { closeVoiceDlg(d); return; } // klik w tło poza okienkiem
        const t = e.target.closest("button");
        if (!t) return;
        if (t.classList.contains("vd-close")) closeVoiceDlg(d);
        else if (t.dataset.accent && t.dataset.accent !== voiceCfg.accent) { voiceCfg.accent = t.dataset.accent; voiceCfg.voice = ""; saveVoiceCfg(); syncVoiceDlg(); speak(VOICE_SAMPLE); }
        else if (t.dataset.rate) { voiceCfg.rate = +t.dataset.rate; saveVoiceCfg(); syncVoiceDlg(); speak(VOICE_SAMPLE); }
        else if (t.dataset.try) speak(VOICE_SAMPLE, t, 1, null, accentVoices(voiceCfg.accent).find((v) => voiceId(v) === t.dataset.try));
        else if (t.classList.contains("vd-sample")) speak(VOICE_SAMPLE, t);
      });
      d.addEventListener("change", (e) => {
        if (e.target.name !== "vd-voice") return;
        voiceCfg.voice = e.target.value; saveVoiceCfg(); syncVoiceDlg(); speak(VOICE_SAMPLE);
      });
      d.addEventListener("close", () => { speechSynthesis.cancel(); });
    }
    d.innerHTML = voiceDlgHtml();
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
    const on = d.querySelector(".chip.active[data-accent]"); if (on) on.focus();
  }

  // ---------- Wymowa z mikrofonem (rozpoznawanie mowy, Web Speech API) ----------
  // Chrome/Edge (także Android) i Safari; Firefox nie ma SpeechRecognition – wtedy przycisków mikrofonu nie ma.
  // Chrome rozpoznaje mowę na serwerze: potrzebny internet i strona z https (albo localhost) – z pliku (file://) nie działa.
  // Wynik NIE trafia do „Moich błędów” ani do wyników lekcji: rozpoznawanie bywa zawodne (akcent, szum, homofony),
  // więc to tylko podpowiedź dla ucznia. Do dziennika i celu dziennego liczy się pierwsza próba każdego zdania.
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const PR_SKIP = /[\/=→←[\]()…_;"“”„&<>+*#@]|\.\.|\s-\s/;
  // Zdanie do czytania na głos (przykład z teorii): bez wariantów „A / B”, strzałek, nawiasów; 2–20 słów. Liczby wolno.
  function prText(html) {
    const t = String(html || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").replace(/^[–—]\s*/, "").trim();
    if (!t || PR_SKIP.test(t) || !/[a-z]/i.test(t)) return "";
    const n = t.split(" ").length;
    return n >= 2 && n <= 20 ? t : "";
  }
  const NUM1 = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
  const NUM10 = "  twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
  function numWords(n) {
    if (n < 20) return NUM1[n];
    if (n < 100) return NUM10[Math.floor(n / 10)] + (n % 10 ? " " + NUM1[n % 10] : "");
    if (n < 1000) return NUM1[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + numWords(n % 100) : "");
    return String(n); // lata i duże liczby zostają cyframi (rozpoznawanie też zwykle zwraca je cyframi)
  }
  const ORD = { one: "first", two: "second", three: "third", five: "fifth", eight: "eighth", nine: "ninth", twelve: "twelfth" };
  const ordWords = (n) => numWords(n).replace(/(\w+)$/, (w) => ORD[w] || (/y$/.test(w) ? w.slice(0, -1) + "ieth" : w + "th"));
  // Słowa, które brzmią tak samo – rozpoznawanie wybiera jedno z nich, więc nie liczymy tego jako błędu wymowy.
  const HOMO = {};
  ["to too two", "for four", "there their", "right write", "know no", "hear here", "by buy bye", "see sea", "one won",
    "eight ate", "son sun", "wear where", "weather whether", "new knew", "hour our", "meet meat", "week weak", "its it's"]
    .forEach((g) => { const w = g.split(" "); w.forEach((x) => { HOMO[x] = w[0]; }); });
  // Pisownia brytyjska i amerykańska (colour/color, realise/realize, centre/center) – też bez znaczenia (spellFold,
  // ta sama lista co przy sprawdzaniu odpowiedzi; rozpoznawanie en-US zwraca pisownię amerykańską).
  const fold = (w) => { const s = spellFold(w); return HOMO[s] || s; };
  const PR_S_IS = new Set(["he", "she", "it", "that", "there", "what", "who", "where", "how", "here", "this"]);
  // Jedno słowo → tokeny do porównania: skróty = pełne formy (I'm = I am, can't = can not), liczby słownie (2 = two).
  function prTokens(word) {
    const out = [];
    normalize(word).replace(/%/g, " percent").replace(/-/g, " ").split(" ").filter(Boolean).forEach((t) => {
      let m;
      if (t === "can't" || t === "cannot") out.push("can", "not");
      else if (t === "won't") out.push("will", "not");
      else if (t === "shan't") out.push("shall", "not");
      else if (t === "let's") out.push("let", "us");
      else if ((m = t.match(/^(\w+)n't$/))) out.push(m[1], "not");
      else if ((m = t.match(/^(\w+)'(m|re|ve|ll|d)$/))) out.push(m[1], { m: "am", re: "are", ve: "have", ll: "will", d: "would" }[m[2]]);
      else if ((m = t.match(/^(\w+)'s$/)) && PR_S_IS.has(m[1])) out.push(m[1], "is");
      else if ((m = t.match(/^(\d+)(st|nd|rd|th)$/))) out.push(...ordWords(+m[1]).split(" "));
      else if ((m = t.match(/^(\d+):(\d\d)$/))) out.push(...numWords(+m[1]).split(" "), ...(m[2] === "00" ? ["o'clock"] : +m[2] < 10 ? ["oh", NUM1[+m[2]]] : numWords(+m[2]).split(" ")));
      else if ((m = t.match(/^(\d+)([ap]m)$/))) out.push(...numWords(+m[1]).split(" "), m[2]);
      else if (/^\d+$/.test(t)) out.push(...numWords(+t).split(" "));
      else out.push(t);
    });
    return out.map(fold);
  }
  // Porównanie słowo po słowie (LCS jak w diffHtml). Spośród kilku wersji rozpoznania (maxAlternatives) bierzemy najbliższą.
  function prCompare(target, alts) {
    const words = target.split(/\s+/), tw = [], tt = [];
    words.forEach((w, i) => prTokens(w).forEach((t) => { tt.push(t); tw.push(i); }));
    let best = null;
    for (const a of alts) {
      const at = String(a).split(/\s+/).flatMap(prTokens), r = lcs(tt, at);
      if (!best || r.n > best.r.n || (r.n === best.r.n && at.length < best.len)) best = { r, len: at.length, heard: a };
    }
    const okW = words.map((_, i) => tw.every((w, j) => w !== i || best.r.inA.has(j)));
    return { words, okW, good: okW.filter(Boolean).length, heard: best.heard };
  }
  function prError(code) {
    if (code === "not-allowed" || code === "service-not-allowed")
      return location.protocol === "file:" ? "Rozpoznawanie mowy nie działa w pliku otwartym z dysku. Otwórz stronę z internetu (adres https://…)."
        : "Brak zgody na użycie mikrofonu. Kliknij ikonę kłódki albo mikrofonu przy adresie strony, zezwól na mikrofon i spróbuj jeszcze raz.";
    if (code === "no-speech") return "Nic nie słychać. Kliknij mikrofon, chwilę poczekaj i przeczytaj zdanie wyraźnie, blisko mikrofonu.";
    if (code === "audio-capture") return "Nie znaleziono mikrofonu. Sprawdź, czy jest podłączony i włączony w ustawieniach systemu.";
    if (code === "network" || code === "offline") return "Brak połączenia z internetem. Chrome i Edge rozpoznają mowę na swoich serwerach, więc bez internetu ta funkcja nie działa.";
    if (code === "language-not-supported") return "Ta przeglądarka nie rozpoznaje mowy po angielsku. Spróbuj w Chrome albo Edge.";
    return `Nie udało się rozpoznać mowy (${esc(code)}). Spróbuj jeszcze raz.`;
  }
  const PR_UNSUPPORTED = "Twoja przeglądarka nie rozpoznaje mowy (działa w Chrome i Edge).";
  const micBtn = (text) => SR ? `<button class="speak mic" data-pr="${esc(text)}" aria-pressed="false" title="Powiedz to zdanie – sprawdź wymowę" aria-label="Sprawdź wymowę">${icon("mic")}</button>` : "";
  let prNow = null; // { rec, btn, aborted, done } – trwające słuchanie (naraz tylko jedno)
  const prStop = () => { if (prNow) { prNow.aborted = true; prNow.rec.abort(); } };
  // Miejsce na wynik: w zakładce „Wymowa” – karta zdania, w teorii – panel pod przykładem (tworzony przy pierwszej próbie).
  function prOut(btn) {
    const card = btn.closest(".pr-card");
    if (card) return card.querySelector(".pr-out");
    const ex = btn.closest(".ex");
    let o = ex.querySelector(".pr-out");
    if (!o) { ex.insertAdjacentHTML("beforeend", `<div class="pr-out" aria-live="polite"></div>`); o = ex.querySelector(".pr-out"); }
    return o;
  }
  function prSetListening(btn, on) {
    btn.classList.toggle("listening", on);
    btn.setAttribute("aria-pressed", on);
    const lbl = btn.querySelector(".pr-lbl");
    if (lbl) lbl.textContent = on ? "Słucham… (kliknij, by skończyć)" : "Powiedz";
    if (on) prOut(btn).innerHTML = `<div class="pr-msg pr-live">${icon("mic")} Mów teraz – przeczytaj zdanie na głos.</div>`;
  }
  function prResult(btn, text, alts) {
    const r = prCompare(text, alts), n = r.words.length, all = r.good === n;
    const verdict = all ? `${icon("check")} Świetnie! Rozpoznane wszystkie słowa.`
      : r.good / n >= 0.7 ? `Prawie dobrze – rozpoznane słowa: ${r.good} z ${n}. Czerwone powiedz jeszcze raz wyraźniej.`
      : `Rozpoznane słowa: ${r.good} z ${n}. Posłuchaj i spróbuj jeszcze raz.`;
    prOut(btn).innerHTML = `<div class="pr-res ${all ? "ok" : "bad"}">
      <div class="pr-words">${r.words.map((w, i) => `<span class="${r.okW[i] ? "pr-ok" : "pr-bad"}">${esc(w)}</span>`).join(" ")}</div>
      <div class="pr-verdict">${verdict}</div>
      <div class="pr-heard">Rozpoznano: „${esc(r.heard)}”</div>
      ${all ? "" : `<div class="pr-actions"><button class="btn pr-say" data-say="${esc(text)}">${icon("volume")} Posłuchaj</button><button class="btn" data-pr-again>${icon("rotate")} Spróbuj jeszcze raz</button></div>`}
    </div>`;
    const card = btn.closest(".pr-card, .ex");
    if (!card.dataset.prLogged) { card.dataset.prLogged = 1; logActivity({ t: 1, ok: all ? 1 : 0 }); }
    if (all) card.dataset.prOk = 1;
    const box = btn.closest(".pr-box");
    if (box) box.querySelector(".pr-score").textContent = `Dobrze wymówione: ${box.querySelectorAll(".pr-card[data-pr-ok]").length} z ${box.querySelectorAll(".pr-card").length}`;
  }
  function prMsg(btn, html) { prOut(btn).innerHTML = `<div class="pr-msg pr-err">${icon("alert")} <span>${html}</span></div>`; }
  function prListen(btn) {
    if (prNow) {
      if (prNow.btn === btn) { prNow.rec.stop(); return; } // drugi klik = koniec mówienia, wynik przyjdzie w onresult
      prStop();
    }
    if (navigator.onLine === false) { prMsg(btn, prError("offline")); return; }
    if ("speechSynthesis" in window) speechSynthesis.cancel(); // żeby mikrofon nie słyszał lektora
    const text = btn.dataset.pr, rec = new SR(), cur = { rec, btn, aborted: false, done: false };
    rec.lang = ACCENTS[voiceCfg.accent].lang; rec.interimResults = false; rec.maxAlternatives = 3; rec.continuous = false;
    rec.onresult = (e) => {
      const res = e.results[e.results.length - 1]; if (!res || cur.aborted) return;
      cur.done = true;
      prResult(btn, text, Array.from(res, (a) => a.transcript).filter(Boolean));
    };
    rec.onerror = (e) => { if (cur.aborted || e.error === "aborted") return; cur.done = true; prMsg(btn, prError(e.error)); };
    rec.onend = () => {
      if (prNow === cur) prNow = null;
      prSetListening(btn, false);
      if (cur.aborted) { const o = prOut(btn); if (o.querySelector(".pr-live")) o.innerHTML = ""; return; }
      if (!cur.done) prMsg(btn, prError("no-speech"));
    };
    prNow = cur;
    prSetListening(btn, true);
    try { rec.start(); } catch (err) { prNow = null; prSetListening(btn, false); prMsg(btn, prError((err && err.name) || "start")); }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pr]");
    if (b) { e.preventDefault(); prListen(b); return; }
    const again = e.target.closest("[data-pr-again]");
    if (again) { const m = again.closest(".pr-card, .ex").querySelector("[data-pr]"); if (m) prListen(m); return; }
    const say = e.target.closest(".pr-say");
    if (say) speak(say.dataset.say, say);
  });

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
      <a class="nav-item ${h.startsWith("#/czytanki") ? "active" : ""}" href="#/czytanki"><span class="nav-ico">${icon("book-open")}</span><span class="nav-title">Czytanki</span></a>
      <a class="nav-item ${h.startsWith("#/tests") ? "active" : ""}" href="#/tests"><span class="nav-ico">${icon("test")}</span><span class="nav-title">Testy – pisanie zdań</span></a>
      <a class="nav-item ${h.startsWith("#/odmiana") ? "active" : ""}" href="#/odmiana"><span class="nav-ico">${icon("layers")}</span><span class="nav-title">Odmiana czasownika</span></a>
      <a class="nav-item ${h.startsWith("#/czasy") ? "active" : ""}" href="#/czasy"><span class="nav-ico">${icon("timeline")}</span><span class="nav-title">Oś czasów</span></a>
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
      <h1>${icon("compass")} Kolejność nauki</h1>
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
    "eng-voice": isObj, // pola sprawdza loadVoiceCfg (zły akcent / tempo → wartość domyślna)
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
  // Ustawienia (poziomy w menu, tłumaczenia, motyw, limit nowych słówek, cel dzienny, głos lektora) przy łączeniu zostają takie, jak na tym urządzeniu –
  // także gdy tu nie były zmieniane (wartość domyślna), więc z kopii ich nie bierzemy.
  const KEEP_LOCAL = ["eng-levels", "eng-showPl", "eng-theme", "eng-srsNew", "eng-goal", "eng-voice"];
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
      mistakes: Object.keys(data["eng-mistakes"] || {}).filter((k) => hasTask(k)).length,
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
        <p><b>Połącz</b> – zostaje wszystko z obu miejsc: lekcje przerobione tu lub tam, lepszy z dwóch wyników, wszystkie znane słówka i dni nauki. Ustawienia (motyw, poziomy w menu, cel dzienny, głos lektora) zostają z tego urządzenia.<br>
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
      voiceCfg = loadVoiceCfg(); pickVoice();
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
  // Dwa warianty: nowa osoba (brak jakiegokolwiek postępu) widzi stronę powitalną z dużym nagłówkiem i statystykami
  // kursu; osoba, która już się uczy, na górze widzi „Twój dzień” (dayHtml), a opis kursu niżej, w mniejszej formie.
  const hasProgress = () => Object.values(state.done).some(Boolean) || Object.keys(state.scores).length > 0
    || Object.keys(state.mistakes).length > 0 || Object.keys(state.srs).length > 0 || Object.keys(state.known).length > 0
    || Object.values(state.activity).some((e) => dayTotal(e) > 0);
  const WEEKDAYS_SHORT = ["nd", "pn", "wt", "śr", "cz", "pt", "so"];
  // Karta „Następny krok”: następna lekcja albo sprawdzian (nextStep) + postęp poziomu, na którym jest uczeń.
  function nextCardHtml(next, nDone) {
    const lv = next ? (next.lesson || next.cp.lessons[next.cp.lessons.length - 1]).level : LEVELS.filter((x) => levelLessons(x).length).pop();
    const ls = levelLessons(lv), d = ls.filter((l) => state.done[l.id]).length;
    const started = next && next.lesson && lessonStarted(next.lesson.id);
    const label = !next ? "Wszystkie lekcje przerobione" : next.cp ? "Teraz sprawdzian powtórkowy" : started ? "Kontynuuj lekcję" : nDone ? "Następna lekcja" : "Pierwsza lekcja";
    const what = !next ? `<b class="nc-title">Gratulacje! ${icon("medal")}</b><span class="nc-pl">Utrwalaj wiedzę w treningu mieszanym, testach i powtórkach.</span>`
      : next.cp ? `<b class="nc-title">${icon("flag")} ${esc(next.title)}</b><span class="nc-pl">Zadania z ostatnich lekcji – głównie pisanie całych zdań.</span>`
      : `<b class="nc-title">${badge(lv)} ${esc(next.lesson.title)}</b>${next.lesson.titlePl ? `<span class="nc-pl">${esc(next.lesson.titlePl)}</span>` : ""}`;
    const btn = !next ? `<a class="btn primary" href="#/practice">Trenuj →</a>`
      : `<a class="btn primary" href="${next.href}">${next.cp ? "Rozwiąż sprawdzian" : started || nDone ? "Kontynuuj" : "Zacznij"} →</a>`;
    return `<section class="card next-card" aria-label="Następny krok">
      <div class="nc-top">
        <div class="nc-what"><span class="nc-label">${label}</span>${what}</div>
        ${btn}
      </div>
      <a class="nc-level" href="#/kolejnosc/lvl-${lv}">
        <span class="nc-level-txt"><span>${badge(lv)} ${LEVEL_INFO[lv].name}: <b>${d}/${ls.length}</b> ${plural(ls.length, "lekcja", "lekcje", "lekcji")}</span><span class="muted">cały kurs: ${nDone}/${PATH.length}</span></span>
        <span class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${ls.length}" aria-valuenow="${d}" aria-label="Postęp ${lv}"><i style="width:${ls.length ? Math.round((d / ls.length) * 100) : 0}%"></i></span>
      </a>
    </section>`;
  }
  // Karta serii: dni z rzędu (streakInfo) + ostatnie 7 dni jako kropki; pełny kalendarz jest w „Kolejności nauki”.
  function streakCardHtml() {
    const s = streakInfo(), t = today();
    let active = 0;
    const week = [6, 5, 4, 3, 2, 1, 0].map((i) => {
      const k = shiftDay(t, -i), d = dayDate(k), n = dayTotal(state.activity[k]);
      if (n) active++;
      const date = d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
      return `<span class="dw-day${n ? " on" : ""}${i ? "" : " today"}" title="${date}: ${n ? `${n} ${zadanISlowek(n)}` : "bez nauki"}"><span class="dw-dot">${n ? icon("check") : ""}</span><span class="dw-lbl">${i ? WEEKDAYS_SHORT[d.getDay()] : "dziś"}</span></span>`;
    }).join("");
    return `<section class="card streak-card" aria-label="Seria dni nauki">
      <div class="act-stat act-streak${s.current ? " on" : ""}"><span class="act-ico" aria-hidden="true">${icon("flame")}</span><div><b>${dni(s.current)} z rzędu</b><span>najdłuższa seria: ${dni(s.best)}</span></div></div>
      <div class="dw" role="img" aria-label="Ostatnie 7 dni: nauka w ${active} z 7">${week}</div>
      <p class="act-hint">${streakHint(s)}</p>
      <a class="sc-link" href="#/kolejnosc/dziennik">Kalendarz nauki →</a>
    </section>`;
  }
  function dayHtml(next, nDone) {
    const date = new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
    return `<section class="day" aria-labelledby="dayTitle">
      <div class="day-head"><h1 id="dayTitle">Twój dzień</h1><span class="day-date">${date}</span></div>
      ${nextCardHtml(next, nDone)}
      <div class="day-grid">${goalHtml()}${streakCardHtml()}</div>
      ${todayWidget()}
      ${rdNewHtml()}
    </section>`;
  }
  function renderHome() {
    const nEx = PATH.reduce((s, l) => s + l.sections.filter((x) => x.type === "examples").reduce((a, x) => a + x.items.length, 0), 0);
    const nTasks = PATH.reduce((s, l) => s + allTasks(l), 0);
    const nWords = VOCAB.reduce((s, t) => s + vocabItems(t).length, 0);
    const nDone = PATH.filter((l) => state.done[l.id]).length;
    const next = nextStep();
    const overview = BY_ID["tenses-overview"];
    if (!PATH.length) return `<div class="page empty"><h1>Brak lekcji</h1><p>Nie znaleziono plików z danymi w folderze <code>data/</code>.</p></div>`;
    const day = hasProgress();

    return `<div class="page${day ? " home-day" : ""}">
      ${day ? dayHtml(next, nDone) + backupReminder() : ""}
      <section class="hero${day ? " hero-small" : ""}">
        ${day ? `<h2>Gramatyka angielska od A1 do B2</h2>` : `<h1>Gramatyka angielska<br>od A1 do B2</h1>`}
        <p>Wszystkie najważniejsze tematy wyjaśnione po polsku: czasy, czasowniki modalne, tryby warunkowe, strona bierna i dużo więcej. Każda lekcja ma budowę, mnóstwo przykładów z tłumaczeniem, słownictwo, zestawy ćwiczeń i test z pisaniem całych zdań.</p>
        <div class="hero-actions">
          ${day ? "" : next ? `<a class="btn primary" href="${next.href}">${nDone ? "Kontynuuj" : "Zacznij od początku"}: ${next.cp ? icon("flag") + " " : ""}${esc(next.title)} →</a>` : `<a class="btn primary" href="#/practice">Wszystko przerobione! Trenuj →</a>`}
          <a class="btn" href="#/kolejnosc">${icon("compass")} Kolejność nauki (${nDone}/${PATH.length})</a>
          ${overview ? `<a class="btn" href="#/lesson/tenses-overview">${icon("map")} Przegląd wszystkich czasów</a>` : ""}
        </div>
      </section>
      ${day ? "" : todayWidget() + backupReminder()}
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
        <a class="card feature" href="#/odmiana"><span class="f-ico">${icon("layers")}</span><b>Odmiana czasownika</b><span>Dowolny czasownik we wszystkich czasach i ćwiczenie „podaj formę”.</span></a>
        <a class="card feature" href="#/czytanki"><span class="f-ico">${icon("book-open")}</span><b>Czytanki</b><span>Krótkie teksty z pytaniami – kliknięte słowo pokazuje tłumaczenie.</span></a>
        <a class="card feature" href="#/czasy"><span class="f-ico">${icon("timeline")}</span><b>Oś czasów</b><span>Wszystkie czasy na jednej osi: kiedy którego używamy.</span></a>
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
  function renderSection(s, idx, l) {
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
          <div class="ex">${(() => { const t = prText(e.en), m = t && micBtn(t); return m ? `<div class="ex-btns">${speakBtn(e.en)}${m}</div>` : speakBtn(e.en); })()}<div class="ex-en">${e.en}</div>
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
            <div class="why">${m.why}</div></div>`).join("")}</div>${l && l.finds.length >= FE_MIN ? `<a class="btn small fe-link" href="#/lesson/${l.id}/find">${icon("search")} Poćwicz: znajdź błąd w zdaniu →</a>` : ""}</section>`;
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
    if (ex.type === "finderr") {
      let first = true;
      const sent = feParse(ex.html).toks.map((x, k) => x.word
        ? `<button type="button" class="fe-w" data-k="${k}" tabindex="${first ? ((first = false), 0) : -1}">${esc(x.t)}</button>`
        : `<span class="fe-p">${esc(x.t)}</span>`).join(" ");
      return `<div class="card exercise finderr" data-i="${i}">${src}${task}<div class="ex-q">${num}<div class="fe-sent" role="group" aria-label="Zdanie – wybierz słowo z błędem">${sent}</div></div>
        ${ex.note ? `<div class="fe-note">(${esc(ex.note)})</div>` : ""}
        <div class="w-wrap fe-fix" hidden><div class="fe-lbl">${icon("check")} Tak, tu jest błąd. Popraw zdanie:</div><textarea class="w-input" rows="1" autocomplete="off" autocapitalize="sentences" spellcheck="false" aria-label="Poprawione zdanie"></textarea></div>
        <div class="gap-actions"><button type="button" class="btn small fe-none">Tu nie ma błędu</button></div><div class="fb"></div></div>`;
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

  // Znajdź błąd: zdanie z <b>…</b> → tekst bez znaczników (pojedyncze spacje), tokeny (kawałki między spacjami;
  // interpunkcja zostaje przy słowie, np. „film,” – tak da się wskazać zbędny przecinek), bold = token ma choć jeden
  // znak w <b>, sel = pierwszy pogrubiony fragment w tekście (zaznaczany w polu poprawki).
  function feParse(html) {
    let raw = "", rawB = [], b = false;
    String(html || "").replace(/<\/?b>|<[^>]*>|[^<]+/g, (m) => {
      if (m === "<b>") b = true; else if (m === "</b>") b = false;
      else if (m[0] !== "<") for (let i = 0; i < m.length; i++) { raw += m[i]; rawB.push(b); }
      return m;
    });
    let text = "";
    const fl = [];
    for (let i = 0; i < raw.length; i++) {
      const sp = /\s/.test(raw[i]);
      if (sp && (!text || text.endsWith(" "))) continue;
      text += sp ? " " : raw[i]; fl.push(rawB[i]);
    }
    while (text.endsWith(" ")) { text = text.slice(0, -1); fl.pop(); }
    const toks = [];
    text.replace(/\S+/g, (t, s) => { toks.push({ t, s, bold: fl.slice(s, s + t.length).some(Boolean), word: /[\p{L}\p{N}]/u.test(t) }); return t; });
    let a = fl.findIndex((x, i) => x && text[i] !== " "), sel = null;
    if (a >= 0) { let e = a; while (e < text.length && fl[e]) e++; while (e > a && text[e - 1] === " ") e--; sel = [a, e]; }
    return { text, toks, sel };
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
      if ((ex.type === "write" || ex.type === "dictation" || res.canAccept) && !res.ok && res.given) {
        const b = document.createElement("button");
        b.className = "btn small accept"; b.innerHTML = icon("check") + " Moja odpowiedź też jest poprawna";
        b.title = "Automat zna tylko podane warianty. Jeśli jesteś pewien/pewna, że Twoje zdanie jest poprawne – zalicz je.";
        b.addEventListener("click", () => {
          b.remove(); card.classList.remove("wrong"); card.classList.add("correct");
          fb.querySelector(".feedback").className = "feedback ok";
          fb.querySelector(".verdict").innerHTML = icon("check") + " Zaliczone (samoocena).";
          const tags = fb.querySelector(".err-tags"); if (tags) tags.remove();
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
        // Typ błędu w luce: porównujemy razem z kilkoma słowami przed luką (np. „She ___” → końcówka -s w 3. osobie).
        const before = (k) => { const w = ex.q.split("___")[k].replace(/\([^)]*\)/g, " ").trim().split(/\s+/).filter(Boolean).slice(-3).join(" "); return w ? w + " " : ""; };
        const errs = ok ? [] : [...new Set(vals.flatMap((v, k) => (v && !okEach[k] ? errClassify(before(k) + v, (accepted[k] || []).map((a) => before(k) + a)) : [])))];
        const extra = ok
          ? (accepted.some((a) => a.length > 1) ? ` <span class="muted">(akceptowane: ${show.join(" … ")})</span>` : "")
          : ` Poprawnie: <b>${show.join("</b> … <b>")}</b>.` + (any ? errTagsHtml(errs) : "");
        return { ok, given: any ? vals : null, extra, errs };
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
        card.querySelector(".d-slow").addEventListener("click", (e) => play(e.currentTarget, SLOWER));
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
        const ok = matches(v, ex.answers), errs = ok ? [] : errClassify(v, ex.answers);
        const extra = ok && ex.type === "dictation" ? ` <b>${esc(ex.say)}</b> ${speakBtn(ex.say)}`
          : ok ? ` ${speakBtn(v)}${(() => { const o = ex.answers.filter((a) => !matches(v, [a])).map((a) => esc(displayAnswer(a))); return o.length ? `<div class="muted">Inne poprawne wersje: ${o.join(" · ")}</div>` : ""; })()}`
          : diffHtml(v, ex.answers) + errTagsHtml(errs) + (all.length > 1 ? `<div class="muted">Wszystkie akceptowane: ${all.join(" · ")}</div>` : "");
        return { ok, given: v, extra, errs };
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

    if (ex.type === "finderr") {
      // Dwa kroki: 1) kliknięcie słowa (każde słowo z <b> się liczy) albo „Tu nie ma błędu”, 2) poprawienie całego zdania
      // w polu wypełnionym błędnym zdaniem (zaznaczony pogrubiony fragment – wystarczy pisać). Źle wskazane miejsce kończy
      // zadanie od razu (z pokazaniem błędu). Zawsze sprawdzane od razu – także w trybie „deferred” (tam tych zadań nie ma).
      const { toks, text, sel } = feParse(ex.html);
      const btns = [...card.querySelectorAll(".fe-w")], sentEl = card.querySelector(".fe-sent");
      const fixBox = card.querySelector(".fe-fix"), ta = fixBox.querySelector(".w-input");
      const isTarget = (b) => !ex.ok && toks[+b.dataset.k].bold;
      let stage = 0, picked = null, viaKey = false; // stage: 0 – szukanie, 1 – poprawianie
      const why = () => (ex.why ? `<div class="fe-why">${icon("bulb")} ${ex.why}</div>` : "");
      const accepted = () => {
        const all = ex.answers.map((a) => esc(displayAnswer(a)));
        return all.length > 1 || expandAnswer(ex.answers[0]).length > 1 ? `<div class="muted">Wszystkie akceptowane: ${all.join(" · ")}</div>` : "";
      };
      const model = (lead) => `${lead ? " " + lead : ""}<div class="w-correct">Poprawnie: <b>${esc(ex.model)}</b> ${speakBtn(ex.model)}</div>${accepted()}`;
      const typical = () => `<div class="fe-typical"><span class="d-lbl">Typowy błąd:</span> <span class="fe-bad">${ex.wrongHtml}</span></div>`;
      // Klawiaturą: strzałki / Home / End przechodzą między słowami (jedno słowo w kolejności Tab), Enter wybiera.
      sentEl.addEventListener("keydown", (e) => {
        const k = btns.indexOf(document.activeElement);
        if (k < 0) return;
        const n = { ArrowRight: k + 1, ArrowDown: k + 1, ArrowLeft: k - 1, ArrowUp: k - 1, Home: 0, End: btns.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault();
        const to = btns[Math.max(0, Math.min(btns.length - 1, n))];
        btns.forEach((b) => { b.tabIndex = b === to ? 0 : -1; });
        to.focus();
      });
      const nextCard = () => { if (!viaKey) return; let n = card.nextElementSibling; while (n && !n.querySelector(".fe-w:not(:disabled), textarea:not(:disabled), input:not(:disabled)")) n = n.nextElementSibling; if (n) n.querySelector(".fe-w[tabindex='0'], textarea, input").focus(); };
      const startFix = () => {
        stage = 1;
        btns.forEach((b) => { if (isTarget(b)) b.classList.add("found"); });
        fixBox.hidden = false;
        ta.value = text; grow(); ta.focus();
        if (sel) ta.setSelectionRange(sel[0], sel[1]);
        actions.innerHTML = `<button type="button" class="btn small check">Sprawdź</button><button type="button" class="btn small giveup">Pokaż odpowiedź</button>`;
        actions.querySelector(".check").addEventListener("click", () => { if (ta.value.trim()) finish(ctl.evaluate()); else ta.focus(); });
        actions.querySelector(".giveup").addEventListener("click", () => finish({ ok: false, given: null, extra: model() + why() }));
      };
      const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
      ta.addEventListener("input", grow);
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (ta.value.trim()) { viaKey = true; finish(ctl.evaluate()); nextCard(); } }
      });
      btns.forEach((b) => b.addEventListener("click", (e) => {
        if (done || stage) return;
        picked = b; viaKey = e.detail === 0;
        if (isTarget(b)) { startFix(); return; }
        b.classList.add("miss");
        finish(ex.ok ? { ok: false, given: b.textContent, extra: " To zdanie jest poprawne." + typical() + why() }
          : { ok: false, given: b.textContent, extra: model("Błąd jest w innym miejscu – zaznaczonym w zdaniu.") + why() });
        nextCard();
      }));
      card.querySelector(".fe-none").addEventListener("click", (e) => {
        if (done || stage) return;
        picked = "none"; viaKey = e.detail === 0;
        finish(ex.ok ? { ok: true, given: "none", extra: " To zdanie jest poprawne." + typical() + why() }
          : { ok: false, given: "none", extra: model("W tym zdaniu jest błąd – zaznaczony w zdaniu.") + why() });
        nextCard();
      });
      ctl.evaluate = () => {
        if (stage === 1) {
          const v = ta.value.trim();
          if (!v) return { ok: false, given: null, extra: model() + why() };
          const ok = feMatch(v, ex), strict = feIsStrict(ex), errs = ok || strict ? [] : errClassify(v, ex.answers);
          const extra = ok ? ` ${speakBtn(v)}${(() => { const o = ex.answers.filter((a) => !feMatch(v, { ...ex, answers: [a] })).map((a) => esc(displayAnswer(a))); return o.length ? `<div class="muted">Inne poprawne wersje: ${o.join(" · ")}</div>` : ""; })()}`
            : strict ? model("Tu liczy się każdy znak: przecinki i formy skrócone (I'm / I am).")
            : diffHtml(v, ex.answers) + errTagsHtml(errs) + accepted();
          return { ok, given: v, extra: extra + why(), errs, canAccept: true };
        }
        // Tylko „Zakończ i sprawdź” w trybie deferred: bez odpowiedzi = pominięte.
        return { ok: false, given: null, extra: (ex.ok ? " To zdanie jest poprawne." + typical() : model()) + why() };
      };
      ctl.lock = () => {
        btns.forEach((b) => { b.disabled = true; if (isTarget(b) && stage === 0) b.classList.add("target"); });
        if (ex.ok && ctl.result && ctl.result.ok) sentEl.classList.add("fe-ok");
        ta.disabled = true;
        if (stage === 1) ta.classList.add(ctl.result && ctl.result.ok ? "ok" : "bad");
      };
      ctl.answered = () => picked !== null;
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
        const ok = matches(v, ex.answers), errs = ok ? [] : errClassify(v, ex.answers);
        return { ok, given: v, errs, extra: ok ? ` <b>${esc(v.charAt(0).toUpperCase() + v.slice(1))}${end}</b> ${speakBtn(v)}${all.length > 1 ? `<div class="muted">Też poprawnie: ${all.join(" · ")}</div>` : ""}` : diffHtml(v + end, ex.answers) + errTagsHtml(errs) };
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
      const msg = p === 100 ? "Perfekcyjnie! 🎉" : p >= 80 ? "Bardzo dobrze! 👏" : p >= 50 ? "Nieźle – przejrzyj błędy i spróbuj jeszcze raz." : "Warto wrócić do teorii i powtórzyć ćwiczenia.";
      resultEl.innerHTML = `<div class="card result-banner"><b>${correct} / ${total} (${p}%)</b><div>${msg}</div>${errSummaryHtml(ctls)}</div>`;
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
    { id: "find", label: icon("search") + " Znajdź błąd", count: (l) => (l.finds.length >= FE_MIN ? l.finds.length : 0) },
    { id: "test", label: icon("test") + " Test", count: (l) => l.test.length },
    { id: "dictation", label: icon("headphones") + " Dyktando", count: (l) => l.dict.length },
    { id: "speaking", label: icon("mic") + " Wymowa", count: (l) => l.dict.length },
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
    else if (tab === "find" && l.finds.length >= FE_MIN) body = renderLessonFind(l);
    else if (tab === "test" && l.test.length) body = renderLessonTest(l);
    else if (tab === "dictation" && l.dict.length) body = renderLessonDictation(l);
    else if (tab === "speaking" && l.dict.length) body = renderLessonSpeaking(l);
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
        ${req.length ? `<p><b>Powinieneś znać:</b> ${req.map((r) => `<a href="#/lesson/${r.id}">${doneTick(esc(r.title), state.done[r.id])}</a>`).join(", ")}</p>` : ""}
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
      ${tlLessonLink(l)}
      ${l.sections.map((s, i) => renderSection(s, i, l)).join("")}
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

  // ---------- Znajdź błąd (zakładka lekcji, trening) ----------
  const FE_MIN = 5, FE_ROUND = 10, FE_GOOD = 0.2;
  // Runda: n różnych par, z czego ok. 20% jako zdanie poprawne (good) – żeby nie klikać na ślepo „jakiegoś” słowa.
  const fePairs = (lessons) => lessons.flatMap((l) => l.finds.map((p) => ({ ...p, lesson: l })));
  function feRound(pairs, n) {
    const xs = shuffle(pairs).slice(0, n), nGood = Math.round(xs.length * FE_GOOD);
    return shuffle(xs.map((p, i) => ({ ex: i < nGood ? p.good : p.bad, lesson: p.lesson })));
  }
  const feIntro = (more) => `<div class="ex-intro">Kliknij <b>słowo, w którym jest błąd</b>, a potem popraw zdanie – pole wypełni się tym zdaniem z zaznaczonym błędnym fragmentem, więc wystarczy wpisać poprawną wersję. Mniej więcej co piąte zdanie jest poprawne – wtedy kliknij <b>Tu nie ma błędu</b>.<span class="kbd-hint"> Klawiatura: <kbd>←</kbd> <kbd>→</kbd> – wybór słowa, <kbd>Enter</kbd> – zatwierdzenie.</span>${more || ""}</div>`;
  function renderLessonFind(l) {
    const s = state.scores[l.id + "::err"];
    return `<section class="block">
      <h2>${icon("search")} Znajdź błąd</h2>
      <p class="muted-p">Zdania z części „Typowe błędy” tej lekcji (${l.finds.length}) – za każdym razem ${Math.min(FE_ROUND, l.finds.length)} losowych. Po odpowiedzi zobaczysz poprawne zdanie i krótkie wyjaśnienie.${s ? ` Najlepszy wynik: ${scorePill(s)}` : ""}</p>
      <div id="feBox">${exercisesShell("Znajdź i popraw błąd", { h3: true, retryLabel: "Nowe zdania" })}</div>
    </section>`;
  }

  // ---------- Dyktando ----------
  const DICT_ROUND = 10;
  const dictIntro = (more) => `<div class="tts-warn">${ttsWarnHtml()}</div>
    <div class="ex-intro">Kliknij <b>${icon("play")} Odtwórz</b>, posłuchaj i zapisz całe zdanie po angielsku. Możesz słuchać dowolnie wiele razy (<b>${icon("slow")} Wolniej</b> – wolniejsze tempo<span class="kbd-hint">, <kbd>Ctrl</kbd>+<kbd>spacja</kbd> w polu – jeszcze raz</span>). Wielka litera i interpunkcja nie mają znaczenia, formy skrócone i pełne (<i>I'm / I am</i>) są równoważne.${more || ""}${voiceLink("Akcent, głos i tempo lektora")}</div>`;
  function renderLessonDictation(l) {
    const s = state.scores[l.id + "::dict"];
    return `<section class="block">
      <h2>${icon("headphones")} Dyktando</h2>
      <p class="muted-p">Zdania z przykładów w tej lekcji (${l.dict.length}) – za każdym razem ${Math.min(DICT_ROUND, l.dict.length)} losowych. Najpierw przeczytaj teorię, potem sprawdź, czy rozpoznajesz te zdania ze słuchu.${s ? ` Najlepszy wynik: ${scorePill(s)}` : ""}</p>
      <div id="dictBox">${exercisesShell("Posłuchaj i zapisz", { h3: true, retryLabel: "Nowe zdania" })}</div>
    </section>`;
  }

  // ---------- Wymowa (zakładka lekcji) ----------
  // Te same zdania co w dyktandzie (przykłady z teorii tej lekcji), za każdym razem DICT_ROUND losowych.
  function prRoundHtml(l) {
    const xs = shuffle(l.dict).slice(0, DICT_ROUND);
    return `<p class="pr-score muted-p" aria-live="polite">Dobrze wymówione: 0 z ${xs.length}</p>
      <ol class="pr-list">${xs.map((x) => `<li class="card pr-card">
        <div class="pr-sent">${speakBtn(x.say)}<div><div class="pr-en">${esc(x.say)}</div>${x.pl ? `<div class="ex-pl" title="Kliknij, aby pokazać">${x.pl}</div>` : ""}</div></div>
        ${SR ? `<button class="btn pr-mic" data-pr="${esc(x.say)}" aria-pressed="false">${icon("mic")} <span class="pr-lbl">Powiedz</span></button>` : ""}
        <div class="pr-out" aria-live="polite"></div></li>`).join("")}</ol>`;
  }
  function renderLessonSpeaking(l) {
    const intro = SR
      ? `Kliknij <b>${icon("mic")} Powiedz</b> i przeczytaj zdanie na głos po angielsku. Strona rozpozna, co mówisz, i pokaże słowa: <span class="pr-ok">zielone</span> – rozpoznane, <span class="pr-bad">czerwone</span> – nie. Wzoru możesz najpierw posłuchać (${icon("volume")}). Mów spokojnie, w cichym miejscu; przeglądarka zapyta o zgodę na mikrofon. Rozpoznawanie mowy potrzebuje internetu i czasem się myli, więc wynik to tylko wskazówka – nie trafia do „Moich błędów”.${voiceLink("Akcent (brytyjski albo amerykański)")}`
      : `Tutaj możesz posłuchać zdań (${icon("volume")}) i powtarzać je na głos – sprawdzanie wymowy zadziała po otwarciu strony w Chrome albo Edge.`;
    return `<section class="block pr-box">
      <h2>${icon("mic")} Wymowa</h2>
      ${SR ? "" : `<div class="callout warning"><h3>${icon("alert")} Brak rozpoznawania mowy</h3><div class="prose">${PR_UNSUPPORTED}</div></div>`}
      <div class="ex-intro">${intro}</div>
      <p class="muted-p">Zdania z przykładów w tej lekcji (${l.dict.length}) – za każdym razem ${Math.min(DICT_ROUND, l.dict.length)} losowych.</p>
      <div id="prBox"></div>
      <div class="pr-new"><button class="btn" id="prNew">${icon("rotate")} Nowe zdania</button></div>
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
    if (tab === "speaking" && l.dict.length) {
      const box = $("#prBox"), run = () => { box.innerHTML = prRoundHtml(l); };
      run();
      $("#prNew").addEventListener("click", () => { prStop(); run(); box.scrollIntoView({ behavior: "smooth" }); });
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
    if (tab === "find" && l.finds.length >= FE_MIN) {
      const box = $("#feBox").firstElementChild;
      box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", feIntro());
      const run = () => renderExercises(box, feRound(fePairs([l]), FE_ROUND).map(({ ex }) => ({ ex })), { key: l.id + "::err" });
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

  // ---------- Odmiana czasownika (#/odmiana) ----------
  // Formy: nieregularne z tabel lekcji irregular-verbs (Bezokolicznik | Past Simple | Past Participle, tabela przedrostków
  // i par do pomylenia), regularne według reguł pisowni (-s/-es/-ies, -ed/-ied z podwajaniem, -ing). Czasowniki stanu
  // z tabeli lekcji present-simple-vs-continuous. Tabela 13 czasów dla wybranej osoby i ćwiczenie „podaj formę”.
  let cjData = null;
  function cjTables() {
    if (cjData) return cjData;
    const irr = new Map(), notes = new Map(), stative = new Map();
    // „burnt / burned” → ["burnt", "burned"]; „got (US: gotten)” → ["got"] + us: ["gotten"].
    const alts = (c) => stripTags(c).toLowerCase().replace(/\([^)]*\)/g, " ").split(/\s*\/\s*/).map((x) => x.trim()).filter((x) => /^[a-z]+$/.test(x));
    const us = (c) => { const m = stripTags(c).match(/\((?:US|AmE):\s*([a-z /]+)\)/i); return m ? alts(m[1]) : []; };
    const add = (base, past, pp, ppUS) => { if (/^[a-z]+$/.test(base) && past.length && pp.length && !irr.has(base)) irr.set(base, { past, pp, ppUS: ppUS || [] }); };
    const l = BY_ID["irregular-verbs"];
    (l ? l.sections : []).filter((s) => s.type === "table").forEach((s) => {
      const h = (s.headers || []).map(stripTags);
      if (h[0] === "Bezokolicznik" && h[1] === "Past Simple") s.rows.forEach((r) => add(stripTags(r[0]).toLowerCase(), alts(r[1]), alts(r[2]), us(r[2])));
      else if (h[1] === "Z przedrostkiem") s.rows.forEach((r) => { // „do – did – done” | „undo (cofnąć), redo” → undid/undone, redid/redone
        const f = stripTags(r[0]).toLowerCase().split(/\s+[–-]\s+/);
        if (f.length !== 3 || !/^[a-z]+$/.test(f[0])) return;
        stripTags(r[1]).toLowerCase().replace(/\([^)]*\)/g, " ").split(",").map((x) => x.trim()).forEach((b) => {
          if (!b.endsWith(f[0]) || b === f[0]) return;
          const pre = b.slice(0, -f[0].length);
          add(b, alts(f[1]).map((x) => pre + x), alts(f[2]).map((x) => pre + x));
        });
      });
      else if (h[1] === "BrE") s.rows.forEach((r) => { // spell – spelt / spelled (formy BrE, gdy różnią się od regularnej)
        const base = stripTags(r[0]).toLowerCase(), f = alts(r[1]);
        if (!/–/.test(stripTags(r[1])) && f.some((x) => x !== cjEd(base))) add(base, f, f);
      });
      else if (/^Pary/.test(stripTags(s.title || ""))) s.rows.forEach((r) => { // ten sam bezokolicznik w kilku wierszach → uwaga (lie – lay / lie – lied)
        const base = stripTags(r[0]).toLowerCase(), f = stripTags(r[1]);
        if (!/^[a-z]+$/.test(base) || !/^[a-z]+ – /.test(f)) return;
        const ff = f.toLowerCase().split(/\s+–\s+/);
        if (ff.length === 3 && ff[1] !== cjEd(base)) add(base, alts(ff[1]), alts(ff[2])); // pierwsze znaczenie: lie – lay – lain
        if (!notes.has(base)) notes.set(base, []);
        notes.get(base).push(`${f} = ${stripTags(r[2]).replace(/:.*$/, "")}`);
      });
    });
    [...notes].forEach(([b, xs]) => { if (xs.length < 2) notes.delete(b); });
    CJ_IRR_MORE.split(", ").forEach((x) => { const [b, p, pp] = x.split(" "); add(b, p.split("/"), pp.split("/")); });
    // Czasowniki stanu: „have (= posiadać)” i grupa „Zmysły (mimowolnie)” – tylko w jednym znaczeniu (amb), reszta – zawsze (strict).
    const sv = BY_ID["present-simple-vs-continuous"];
    const st = sv && sv.sections.find((s) => s.type === "table" && /stanu/.test(s.title || "") && stripTags((s.headers || [])[1]) === "Czasowniki");
    (st ? st.rows : []).forEach((r) => stripTags(r[1]).split(",").forEach((x) => {
      const w = x.replace(/\([^)]*\)/g, "").trim().toLowerCase();
      if (/^[a-z]+( [a-z]+)?$/.test(w)) stative.set(w, /\(/.test(x) || /\(/.test(stripTags(r[0])) ? "amb" : "strict");
      if (w === "realise" || w === "recognise") stative.set(w.replace(/ise$/, "ize"), stative.get(w));
    }));
    return (cjData = { irr, notes, stative, stLesson: sv });
  }
  // Nieregularne spoza tabel lekcji (słówka z działów i czasowniki, które uczeń może wpisać): bezokolicznik II III.
  const CJ_IRR_MORE = "shine shone shone, sweep swept swept, forbid forbade forbidden, unwind unwound unwound, reset reset reset, withdraw withdrew withdrawn, " +
    "broadcast broadcast broadcast, cast cast cast, offset offset offset, undergo underwent undergone, oversee oversaw overseen, bear bore borne, " +
    "spill spilt/spilled spilt/spilled, spoil spoilt/spoiled spoilt/spoiled, lean leant/leaned leant/leaned, leap leapt/leaped leapt/leaped, " +
    "kneel knelt/kneeled knelt/kneeled, dwell dwelt/dwelled dwelt/dwelled, arise arose arisen, awake awoke awoken, bleed bled bled, breed bred bred, " +
    "bind bound bound, cling clung clung, creep crept crept, flee fled fled, fling flung flung, forecast forecast forecast, foresee foresaw foreseen, " +
    "grind ground ground, mislead misled misled, misunderstand misunderstood misunderstood, overtake overtook overtaken, overhear overheard overheard, " +
    "sew sewed sewn/sewed, sow sowed sown/sowed, mow mowed mown/mowed, swell swelled swollen/swelled, shed shed shed, shrink shrank shrunk, slide slid slid, " +
    "speed sped sped, spin spun spun, spit spat spat, spring sprang sprung, sting stung stung, stink stank stunk, strike struck struck, swear swore sworn, " +
    "swing swung swung, tread trod trodden, weave wove woven, weep wept wept, wind wound wound, wring wrung wrung, bid bid bid, slit slit slit, " +
    "input input input, outdo outdid outdone, overdo overdid overdone, overeat overate overeaten, rebuild rebuilt rebuilt, retell retold retold, " +
    "rethink rethought rethought, withhold withheld withheld, withstand withstood withstood, outgrow outgrew outgrown, override overrode overridden, " +
    "babysit babysat babysat, stride strode stridden, strive strove striven, string strung strung, thrust thrust thrust, slay slew slain";
  const CJ_SP_LL = new Set(SP_LL.split(" ")); // travel → travelled (BrE; AmE traveled przyjmuje spellFold)
  const CJ_DOUBLE = new Set("prefer refer admit occur permit regret control commit omit submit transfer equip patrol compel expel propel rebel deter incur confer kidnap worship emit transmit forget begin upset reset offset forbid input babysit".split(" "));
  const cjSyll = (w) => (w.replace(/e$/, "").match(/[aeiouy]+/g) || []).length;
  // Podwajanie ostatniej spółgłoski: stop → stopped, plan → planning, prefer → preferred, travel → travelled; visit → visited.
  function cjDoubles(w) {
    if (/[wxy]$/.test(w)) return false;
    if (CJ_DOUBLE.has(w) || CJ_SP_LL.has(w)) return true;
    return cjSyll(w) === 1 && (/(^|[^aeiou])[aeiou][b-df-hj-np-tvz]$/.test(w) || /qu[aeiou][b-df-hj-np-tvz]$/.test(w));
  }
  const cjS = (w) => w === "have" ? "has" : /(s|x|z|ch|sh|o)$/.test(w) ? w + "es" : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + "ies" : w + "s";
  function cjIng(w) {
    if (/ie$/.test(w)) return w.slice(0, -2) + "ying"; // lie → lying
    if (/[^aeioy]e$/.test(w) && w !== "be") return w.slice(0, -1) + "ing"; // make → making (ale see → seeing, dye → dyeing)
    if (/[^aeiou]ic$/.test(w) && cjSyll(w) > 1) return w + "king"; // panic → panicking
    return cjDoubles(w) ? w + w.slice(-1) + "ing" : w + "ing";
  }
  function cjEd(w) {
    if (/e$/.test(w)) return w + "d";
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ied";
    if (/[^aeiou]ic$/.test(w) && cjSyll(w) > 1) return w + "ked";
    return cjDoubles(w) ? w + w.slice(-1) + "ed" : w + "ed";
  }
  const cjClean = (s) => String(s || "").toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim().replace(/^to /, "");
  const CJ_VALID = /^[a-z]+( [a-z']+){0,4}$/;
  // { verb, base, rest, s3, ing, past: [...], pp: [...], ppUS: [...], irr } – rest = reszta wyrażenia („wake up” → „up”).
  function cjForms(verb) {
    const v = cjClean(verb), [base, ...r] = v.split(" ");
    const irr = cjTables().irr.get(base);
    return { verb: v, base, rest: r.join(" "), s3: base === "be" ? "is" : cjS(base), ing: cjIng(base),
      past: irr ? irr.past : [cjEd(base)], pp: irr ? irr.pp : [cjEd(base)], ppUS: irr ? irr.ppUS : [], irr: !!irr };
  }
  // Czasownik stanu: "strict" (know, want…), "amb" (have, see, feel… – tylko w jednym znaczeniu) albo "".
  function cjStative(f) {
    const st = cjTables().stative;
    if (st.has(f.verb)) return st.get(f.verb);
    return st.has(f.base) && (!f.rest || /^(to|of|about|on|in|with|for|like|from|at)$/.test(f.rest)) ? st.get(f.base) : "";
  }

  // Czasy: aux = słowa przed czasownikiem (BE/WAS/HAVE zależą od osoby), v = forma czasownika, sub = „do” w przeczeniach
  // i pytaniach (Present / Past Simple). Opis z tabeli zbiorczej lekcji tenses-overview.
  const CJ_TENSES = [
    { id: "ps", name: "Present Simple", lesson: "present-simple", aux: [], v: "s", sub: "do" },
    { id: "pc", name: "Present Continuous", lesson: "present-continuous", aux: ["BE"], v: "ing", cont: true },
    { id: "pas", name: "Past Simple", lesson: "past-simple", aux: [], v: "past", sub: "did" },
    { id: "pac", name: "Past Continuous", lesson: "past-continuous", aux: ["WAS"], v: "ing", cont: true },
    { id: "pp", name: "Present Perfect", lesson: "present-perfect", aux: ["HAVE"], v: "pp" },
    { id: "ppc", name: "Present Perfect Continuous", lesson: "present-perfect-continuous", aux: ["HAVE", "been"], v: "ing", cont: true },
    { id: "pap", name: "Past Perfect", lesson: "past-perfect", aux: ["had"], v: "pp" },
    { id: "papc", name: "Past Perfect Continuous", lesson: "past-perfect-continuous", aux: ["had", "been"], v: "ing", cont: true },
    { id: "fs", name: "Future Simple", lesson: "future-will", aux: ["will"], v: "base" },
    { id: "gt", name: "be going to", lesson: "going-to", aux: ["BE", "going", "to"], v: "base", use: "zamiar, plan; przewidywanie na podstawie tego, co widać" },
    { id: "fc", name: "Future Continuous", lesson: "future-continuous", aux: ["will", "be"], v: "ing", cont: true },
    { id: "fp", name: "Future Perfect", lesson: "future-perfect", aux: ["will", "have"], v: "pp" },
    { id: "fpc", name: "Future Perfect Continuous", lesson: "future-perfect", aux: ["will", "have", "been"], v: "ing", cont: true },
  ].filter((t) => BY_ID[t.lesson]);
  const CJ_BY_ID = Object.fromEntries(CJ_TENSES.map((t) => [t.id, t]));
  (() => {
    const ov = BY_ID["tenses-overview"], tb = ov && ov.sections.find((s) => s.type === "table" && /12 czasów/.test(s.title || ""));
    (tb ? tb.rows : []).forEach((r) => { const t = CJ_TENSES.find((x) => x.name === stripTags(r[0])); if (t && !t.use) t.use = stripTags(r[2]); });
  })();
  const CJ_PERSONS = ["I", "you", "he", "she", "it", "we", "they"];
  const CJ_FORMS = { aff: "twierdzenie", neg: "przeczenie", q: "pytanie" };
  const CJ_NEG = { is: "isn't", are: "aren't", was: "wasn't", were: "weren't", do: "don't", does: "doesn't", did: "didn't", have: "haven't", has: "hasn't", had: "hadn't", will: "won't" };
  const CJ_SHORT = { am: "'m", is: "'s", are: "'re", have: "'ve", has: "'s", had: "'d", will: "'ll" };
  const CJ_REFL = { I: ["my", "myself"], you: ["your", "yourself"], he: ["his", "himself"], she: ["her", "herself"], it: ["its", "itself"], we: ["our", "ourselves"], they: ["their", "themselves"] };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // Jedna forma: { main, alts: [inne poprawne zapisy do pokazania], vps: [warianty bez podmiotu – odpowiedzi w ćwiczeniu] }.
  function cjBuild(f, t, p, form) {
    const third = p === "he" || p === "she" || p === "it", plural = p === "you" || p === "we" || p === "they";
    const be = p === "I" ? "am" : third ? "is" : "are", was = plural ? "were" : "was";
    const rest = f.rest.replace(/\byourself\b/g, CJ_REFL[p][1]).replace(/\byour\b/g, CJ_REFL[p][0]);
    const isBe = f.base === "be";
    let aux = t.aux.map((a) => a === "BE" ? be : a === "WAS" ? was : a === "HAVE" ? (third ? "has" : "have") : a);
    let vs; // warianty formy czasownika
    if (t.v === "s") vs = [isBe ? be : third ? f.s3 : f.base];
    else if (t.v === "past") vs = isBe ? [was] : f.past;
    else if (t.v === "pp") vs = f.pp.concat(f.ppUS);
    else if (t.v === "ing") vs = [f.ing];
    else vs = [f.base];
    // be w Present / Past Simple: am/is/are, was/were bez „do”.
    if (isBe && t.sub) { aux = [vs[0]]; vs = [""]; }
    else if (t.sub && form !== "aff") { aux = [t.sub === "did" ? "did" : third ? "does" : "do"]; vs = [f.base]; }
    const tail = (v) => [v, rest].filter(Boolean).join(" ");
    const join = (...xs) => xs.filter(Boolean).join(" ");
    const shown = vs.slice(0, 1).concat(f.ppUS.length && t.v === "pp" ? [] : vs.slice(1)); // gotten (AmE) tylko w odpowiedziach
    if (form === "q") {
      const qs = vs.map((v) => cap(join(aux[0], p, ...aux.slice(1), tail(v))) + "?");
      return { main: qs[0], alts: qs.slice(1, shown.length), vps: qs.map((q) => q.slice(0, -1)) };
    }
    if (form === "neg") {
      const a0 = aux[0], more = aux.slice(1);
      const shortNeg = (v) => a0 === "am" ? join("I'm not", ...more, tail(v)) : join(p, CJ_NEG[a0], ...more, tail(v));
      const full = (v) => join(p, a0, "not", ...more, tail(v));
      const vps = vs.map((v) => a0 === "am" ? join("am not", ...more, tail(v)) : join(CJ_NEG[a0], ...more, tail(v))); // matches() zna też „has not”
      return { main: shortNeg(vs[0]), alts: [full(vs[0])].concat(shown.slice(1).map(shortNeg)), vps };
    }
    const full = (v) => join(p, ...aux, tail(v));
    const sh = aux.length && CJ_SHORT[aux[0]] ? (v) => join(p + CJ_SHORT[aux[0]], ...aux.slice(1), tail(v)) : null;
    const vps = vs.map((v) => join(...aux, tail(v)));
    return { main: full(vs[0]), alts: (sh ? [sh(vs[0])] : []).concat(shown.slice(1).map(full)), vps };
  }

  // Czasowniki ze słówek: „eat / drink” = „jeść / pić” rozbite na dwa. Czasownik = polski odpowiednik zaczyna się od
  // bezokolicznika (-ać, -eć, -ić, -yć, -uć, -ąć, -ść; móc, biec…). Talie lekcji – wszystko; działy tematyczne – do 3 słów.
  const CJ_PL_INF = /^[a-ząćęłńóśźż]+(ać|eć|ić|yć|uć|ąć|ść|źć)$|^(móc|pomóc|biec|piec|upiec|strzec)$/;
  const CJ_PL_NOUN = /(ość|ęść|paznokieć|powieść|postać|maść|liść|przepaść|chłopiec)$/;
  const CJ_NOT_VERB = /^(can|could|may|might|must|shall|should|will|would|ought|boiler|oven|stove|cooker)\b/; // modalne; rzeczowniki „piec”
  let cjVerbList = null;
  function cjVerbs() {
    if (cjVerbList) return cjVerbList;
    const map = new Map();
    DECKS.forEach((d) => !d.manual && d.items.forEach((w) => {
      const en = stripTags(w.en), pl = stripTags(w.pl || "").split(";")[0].trim();
      const es = en.split(/\s*\/\s*/), ps = pl.split(/\s*\/\s*/);
      if (es.length > 1 && es.length !== ps.length) return;
      es.forEach((e, i) => {
        const v = e.trim(), p = (ps[i] || ps[0]).trim(), first = p.split(/[\s,(]/)[0];
        if (!/^[a-z][a-z' ]*$/.test(v) || CJ_NOT_VERB.test(v) || /^(be|have been|have gone) ./.test(v) || /\b(sb|sth|one's|oneself)\b/.test(v)) return;
        if (!CJ_PL_INF.test(first) || CJ_PL_NOUN.test(first)) return;
        if (!d.lesson && v.split(" ").length > 3) return;
        if (!map.has(v)) map.set(v, { verb: v, pl: p, lesson: d.lesson ? PATH.indexOf(d.lesson) : Infinity });
        else if (d.lesson) { const x = map.get(v); x.lesson = Math.min(x.lesson, PATH.indexOf(d.lesson)); }
      });
    }));
    return (cjVerbList = map);
  }
  // Ćwiczenie: czasowniki, które uczeń już zna – ze słówek lekcji do bieżącej albo (podstawowe czasowniki z działów,
  // np. go, do, watch) użyte jako czasownik w zdaniach z tych lekcji (po to / can / don't / I / you…, he + -s, be + -ing).
  let cjIntroMap = null;
  function cjIntro() {
    if (cjIntroMap) return cjIntroMap;
    const V = cjVerbs(), first = new Map(), texts = PATH.map(() => []);
    for (const { ex, lesson, src } of TASKS.values()) if (src !== "r" && ex.type !== "choice" && ex.type !== "finderr") (ex.answers || []).flat().slice(0, 2).forEach((a) => texts[PATH.indexOf(lesson)].push(firstVariant(a)));
    PATH.forEach((l, i) => l.sections.filter((s) => s.type === "examples").forEach((s) => (s.items || []).forEach((x) => texts[i].push(stripTags(x.en)))));
    const single = [...V.values()].filter((x) => x.lesson === Infinity && !/ /.test(x.verb));
    const want = new Map(); // forma → czasownik
    single.forEach((x) => { const f = cjForms(x.verb); want.set("B " + f.base, x.verb); want.set("S " + f.s3, x.verb); want.set("G " + f.ing, x.verb); });
    texts.forEach((ts, i) => ts.forEach((s) => {
      const t = normalize(s).split(" ");
      t.forEach((w, k) => {
        const p = t[k - 1] || "";
        const hit = (/^(to|can|can't|cannot|will|won't|don't|doesn't|didn't|do|does|did|let's|must|should|i|you|we|they)$/.test(p) && want.get("B " + w))
          || (/^(he|she|it)$/.test(p) && want.get("S " + w)) || (/^(am|is|are|was|were|i'm|you're|he's|she's|it's|we're|they're|been)$/.test(p) && want.get("G " + w));
        if (hit && !first.has(hit)) first.set(hit, i);
      });
    }));
    cjIntroMap = new Map([...V.values()].map((x) => [x.verb, Math.min(x.lesson, first.has(x.verb) ? first.get(x.verb) : Infinity)]));
    return cjIntroMap;
  }
  // Ćwiczenie: tylko czasowniki, które brzmią naturalnie z każdą osobą i bez dopełnienia – czynności (work, cook…) i wyrażenia
  // z dopełnieniem ze słówek (have breakfast, play the guitar). Dostępne od lekcji, w której pojawiają się w słówkach / zdaniach
  // (cjIntro). Jednorazowe (arrive, wake up…) – bez czasów Perfect Continuous („she had been arriving” brzmi dziwnie).
  const CJ_DRILL_ACT = new Set(("work|study|teach|cook|read|write|play|drive|swim|run|sleep|sing|dance|travel|relax|walk|laugh|cry|talk|chat|cycle|" +
    "exercise|ski|paint|climb|shout|learn|eat|drink|smoke|clean|wash|hurry|worry|concentrate|complain|celebrate|vacuum|tidy|have breakfast|" +
    "have a shower|have a break|do the shopping|eat out|tidy up|ride a bike|play the guitar|play the piano|go jogging|go hiking|go to work|" +
    "stay up late|go out|lose weight").split("|"));
  const CJ_DRILL_PUNCT = new Set(("get up|wake up|go to bed|get up early|fall asleep|get dressed|get home|arrive|move house|get married|get engaged|" +
    "make a decision|win the lottery|get lost|get back|split up|grow up|give up|find out|vote|retire|graduate").split("|"));
  const CJ_PERF_CONT = new Set(["ppc", "papc", "fpc"]);
  const cjLockedIdx = (t) => PATH.indexOf(BY_ID[t.lesson]);

  // Moje błędy: klucz odm~czasownik~czas~osoba~forma – zadanie odtwarzane z generatora (stabilne, dopóki czasownik
  // jest w słówkach i czas w CJ_TENSES). Lekcja zadania = lekcja czasu.
  function cjTask(key) {
    if (TASKS.has(key)) return TASKS.get(key);
    const [pre, verbEnc, tid, p, form] = key.split("~");
    const t = CJ_BY_ID[tid], verb = decodeURIComponent(verbEnc || "");
    if (pre !== "odm" || !t || !CJ_PERSONS.includes(p) || !CJ_FORMS[form] || !cjVerbs().has(verb)) return null;
    const f = cjForms(verb), b = cjBuild(f, t, p, form), lesson = BY_ID[t.lesson];
    const subj = p === "I" ? "I" : cap(p);
    const ex = form === "q"
      ? { type: "gap", q: `___? (${esc(p)} / ${esc(verb)})`, answers: b.vps }
      : { type: "gap", q: `${subj} ___ (${esc(verb)}).`, answers: b.vps };
    ex.task = `<b>${esc(t.name)}</b> · ${CJ_FORMS[form]}`;
    const sentence = form === "q" ? b.main : cap(b.main) + ".";
    // Całe zdanie z podmiotem (w pytaniu odpowiedź już jest całym zdaniem – wtedy tylko głośnik).
    ex.explain = `<span class="cj-ans">${form === "q" ? "" : esc(sentence) + " "}${speakBtn(sentence)}</span> <a href="#/lesson/${lesson.id}">${esc(t.name)} – lekcja ${lessonNo(lesson)}</a>`;
    const rec = { ex, lesson, src: "o", instr: "" };
    TASKS.set(key, rec); KEY_OF.set(ex, key);
    return rec;
  }
  function hasTask(k) { return TASKS.has(k) || (k.startsWith("odm~") && !!cjTask(k)); }
  // 10 zadań: czasy z przerobionych lekcji (wybrane w filtrze), czasowniki znane do bieżącej lekcji, różne czasowniki.
  function cjDrillItems(tenses, forms, n) {
    const reach = reachIdx(), intro = cjIntro();
    const verbs = shuffle([...cjVerbs().keys()].filter((v) => intro.get(v) <= reach && (CJ_DRILL_ACT.has(v) || CJ_DRILL_PUNCT.has(v))));
    const out = [], used = new Set();
    for (let guard = 0; out.length < n && guard < n * 40 && verbs.length; guard++) {
      const t = tenses[Math.floor(Math.random() * tenses.length)];
      const fits = (x) => !(t.cont && cjStative(cjForms(x))) && !(CJ_PERF_CONT.has(t.id) && CJ_DRILL_PUNCT.has(x));
      const v = verbs.find((x) => !used.has(x) && fits(x)) || verbs.find(fits);
      if (!v) continue;
      used.add(v);
      const p = ["I", "you", "he", "she", "we", "they"][Math.floor(Math.random() * 6)];
      const form = forms[Math.floor(Math.random() * forms.length)];
      const rec = cjTask(`odm~${encodeURIComponent(v)}~${t.id}~${p}~${form}`);
      if (rec) out.push({ ex: rec.ex, lesson: rec.lesson });
    }
    return out;
  }

  let cjCfg = { verb: "go", person: "he", tenses: null, forms: ["aff", "neg", "q"] };
  const cjDone = () => CJ_TENSES.filter((t) => state.done[t.lesson]);
  function cjFormsLine(f) {
    const ph = (w) => [w, f.rest].filter(Boolean).join(" ");
    const past = f.past.map(ph).join(" / "), pp = f.pp.map(ph).join(" / ") + (f.ppUS.length ? ` (AmE: ${f.ppUS.map(ph).join(" / ")})` : "");
    const il = BY_ID["irregular-verbs"];
    const kind = f.base === "be" ? "nieregularny (am / is / are, was / were)" : f.irr ? "nieregularny" : "regularny";
    return `<div class="cj-forms">
      <div class="cj-three"><span class="cj-f"><small>bezokolicznik</small><b>${esc(ph(f.base))}</b>${speakBtn(ph(f.base))}</span><span class="cj-f"><small>Past Simple (II)</small><b>${esc(past)}</b>${speakBtn(ph(f.past[0]))}</span><span class="cj-f"><small>Past Participle (III)</small><b>${esc(pp)}</b>${speakBtn(ph(f.pp[0]))}</span><span class="cj-f"><small>he / she / it</small><b>${esc(ph(f.s3))}</b>${speakBtn(ph(f.s3))}</span><span class="cj-f"><small>-ing</small><b>${esc(ph(f.ing))}</b>${speakBtn(ph(f.ing))}</span></div>
      <div class="cj-kind">Czasownik <b>${kind}</b>${il ? ` – <a href="#/lesson/${il.id}">${f.irr ? "lista czasowników nieregularnych" : "jak tworzyć formy -ed"}</a>` : ""}</div>
    </div>`;
  }
  function cjTableHtml(f, p) {
    const reach = reachIdx(), st = cjStative(f), stl = cjTables().stLesson;
    const rows = CJ_TENSES.map((t) => {
      const l = BY_ID[t.lesson], idx = cjLockedIdx(t), locked = idx > reach;
      const name = `<a class="cj-tense" href="#/lesson/${l.id}">${esc(t.name)}</a>${t.use ? `<span class="cj-use">${esc(t.use)}</span>` : ""}${locked ? `<span class="cj-lock">poznasz w lekcji ${idx + 1}. ${esc(l.title)}</span>` : ""}`;
      if (t.cont && st === "strict") return `<tr class="cj-row${locked ? " cj-locked" : ""}"><th scope="row">${name}</th><td class="cj-na" colspan="3" data-l="">${icon("alert")} <span><b>${esc(f.verb)}</b> to czasownik stanu – w czasach Continuous zwykle go nie używamy${stl ? ` (<a href="#/lesson/${stl.id}">czasowniki stanu</a>)` : ""}.</span></td></tr>`;
      const cells = Object.keys(CJ_FORMS).map((form) => {
        const b = cjBuild(f, t, p, form);
        return `<td data-l="${form === "aff" ? "+" : form === "neg" ? "−" : "?"}"><span class="cj-main">${esc(b.main)}</span>${speakBtn(b.main)}${b.alts.length ? `<span class="cj-alt">też: ${b.alts.map(esc).join(" · ")}</span>` : ""}</td>`;
      }).join("");
      return `<tr class="cj-row${locked ? " cj-locked" : ""}"><th scope="row">${name}</th>${cells}</tr>`;
    }).join("");
    return `<div class="card cj-table-card"><table class="cj-table"><thead><tr><th scope="col">Czas</th><th scope="col">Twierdzenie (+)</th><th scope="col">Przeczenie (−)</th><th scope="col">Pytanie (?)</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function cjResultHtml() {
    const V = cjVerbs(), v = cjClean(cjCfg.verb);
    if (!v) return `<div class="empty">Wpisz czasownik po angielsku, np. <b>go</b>, <b>work</b>, <b>get up</b>.</div>`;
    if (!CJ_VALID.test(v)) return `<div class="empty">Wpisz czasownik po angielsku – same litery, np. <b>go</b> albo <b>wake up</b>.</div>`;
    const f = cjForms(v), info = V.get(v), st = cjStative(f), notes = cjTables().notes.get(f.base), stl = cjTables().stLesson;
    const msgs = [];
    if (info) msgs.push(`<span class="cj-pl">${esc(info.pl)}</span>`);
    else msgs.push(`<span class="cj-warn">${icon("alert")} Tego czasownika nie ma w słówkach kursu – formy są utworzone według reguł${f.irr ? "" : ". Sprawdź w słowniku, czy nie jest nieregularny"}.</span>`);
    if (notes) msgs.push(`<span class="cj-note">${icon("bulb")} <b>${esc(f.base)}</b> ma kilka znaczeń: ${notes.map(esc).join("; ")}. Tabela pokazuje pierwsze.</span>`);
    if (st === "amb") msgs.push(`<span class="cj-note">${icon("bulb")} <b>${esc(f.verb)}</b> bywa czasownikiem stanu – w znaczeniu stanu (np. have = mieć, posiadać; see = widzieć) nie używamy form Continuous, w znaczeniu czynności (have lunch, see a doctor) – tak.${stl ? ` <a href="#/lesson/${stl.id}">Czasowniki stanu</a>` : ""}</span>`);
    return `<div class="cj-msgs">${msgs.join("")}</div>${cjFormsLine(f)}${cjTableHtml(f, cjCfg.person)}`;
  }
  function renderConj(arg) {
    if (arg) cjCfg.verb = cjClean(decodeURIComponent(arg));
    const V = [...cjVerbs().values()].sort((a, b) => a.verb.localeCompare(b.verb));
    return `<div class="page conj">
      <div class="hero"><h1>${icon("layers")} Odmiana czasownika</h1><p>Wpisz czasownik i zobacz go we wszystkich czasach – w twierdzeniu, przeczeniu i pytaniu. Czasy, których jeszcze nie było na Twojej ścieżce, są wyszarzone. Niżej ćwiczenie „podaj formę”. Kiedy którego czasu używać – zobacz <a href="#/czasy">oś czasów</a>.</p></div>
      <div class="card cj-search">
        <label class="cj-field"><span>Czasownik</span><input id="cjVerb" type="text" list="cjList" value="${esc(cjCfg.verb)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="np. go, work, get up"></label>
        <datalist id="cjList">${V.map((x) => `<option value="${esc(x.verb)}">${esc(x.pl)}</option>`).join("")}</datalist>
        <div class="cj-persons"><span>Osoba</span><div class="chips" role="group" aria-label="Osoba">${CJ_PERSONS.map((p) => `<button class="chip ${cjCfg.person === p ? "active" : ""}" data-p="${p}" aria-pressed="${cjCfg.person === p}">${p}</button>`).join("")}</div></div>
      </div>
      <div id="cjOut">${cjResultHtml()}</div>
      <h2 class="section-title" id="cwiczenie">${icon("pen")} Ćwiczenie: podaj formę</h2>
      <div id="cjDrill">${cjDrillSetupHtml()}</div>
      <div id="cjBox"></div>
    </div>`;
  }
  function cjDrillSetupHtml() {
    const done = cjDone();
    if (!done.length) {
      const first = BY_ID[CJ_TENSES[0].lesson];
      return `<div class="card empty">Ćwiczenie obejmuje czasy z <b>przerobionych lekcji</b>. Zacznij od lekcji <a href="#/lesson/${first.id}">${lessonNo(first)}. ${esc(first.title)}</a> i oznacz ją jako przerobioną.</div>`;
    }
    if (!cjCfg.tenses || !cjCfg.tenses.every((id) => done.some((t) => t.id === id)) || !cjCfg.tenses.length) cjCfg.tenses = done.map((t) => t.id);
    return `<div class="card practice-setup cj-setup">
      <div><h3>Czasy <span style="text-transform:none;font-weight:400">(z przerobionych lekcji)</span></h3><div class="chips" data-f="tenses">${done.map((t) => `<button class="chip ${cjCfg.tenses.includes(t.id) ? "active" : ""}" data-v="${t.id}" aria-pressed="${cjCfg.tenses.includes(t.id)}">${esc(t.name)}</button>`).join("")}</div></div>
      <div><h3>Formy</h3><div class="chips" data-f="forms">${Object.entries(CJ_FORMS).map(([k, v]) => `<button class="chip ${cjCfg.forms.includes(k) ? "active" : ""}" data-v="${k}" aria-pressed="${cjCfg.forms.includes(k)}">${v}</button>`).join("")}</div></div>
      <div><button class="btn primary" id="cjStart">Losuj ${CJ_ROUND} zadań →</button> <span class="muted cj-best">${state.scores.odmiana ? "Najlepszy wynik: " + scorePill(state.scores.odmiana) : ""}</span></div>
    </div>`;
  }
  const CJ_ROUND = 10;
  function bindConj() {
    const page = $(".page.conj"); if (!page) return;
    const inp = $("#cjVerb"), out = $("#cjOut");
    const show = () => {
      out.innerHTML = cjResultHtml();
      const v = cjClean(cjCfg.verb);
      history.replaceState(null, "", location.pathname + location.search + (v && CJ_VALID.test(v) ? `#/odmiana/${encodeURIComponent(v)}` : "#/odmiana"));
    };
    let timer = 0;
    inp.addEventListener("input", () => { cjCfg.verb = inp.value; clearTimeout(timer); timer = setTimeout(show, cjVerbs().has(cjClean(inp.value)) ? 0 : 350); });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(timer); cjCfg.verb = inp.value; show(); } });
    page.querySelector(".cj-persons").addEventListener("click", (e) => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      cjCfg.person = b.dataset.p;
      page.querySelectorAll(".cj-persons .chip").forEach((c) => { const on = c === b; c.classList.toggle("active", on); c.setAttribute("aria-pressed", on); });
      out.innerHTML = cjResultHtml();
    });
    const drill = $("#cjDrill");
    drill.addEventListener("click", (e) => {
      const b = e.target.closest(".chips .chip");
      if (b) {
        const f = b.closest(".chips").dataset.f, v = b.dataset.v, list = cjCfg[f];
        if (list.includes(v) && list.length === 1) return; // przynajmniej jeden czas i jedna forma
        cjCfg[f] = list.includes(v) ? list.filter((x) => x !== v) : list.concat(v);
        b.classList.toggle("active"); b.setAttribute("aria-pressed", cjCfg[f].includes(v));
        return;
      }
      if (e.target.closest("#cjStart")) start();
    });
    const box = $("#cjBox");
    const start = () => {
      const items = cjDrillItems(CJ_TENSES.filter((t) => cjCfg.tenses.includes(t.id)), cjCfg.forms, CJ_ROUND);
      if (!items.length) { box.innerHTML = `<div class="empty">Brak czasowników do ćwiczenia – przerób kilka pierwszych lekcji.</div>`; return; }
      box.innerHTML = exercisesShell("Podaj formę", { retryLabel: "Nowe losowanie", intro: "Wpisz formę czasownika w podanym czasie. W pytaniu napisz całe pytanie, np. <i>Does she work</i>. Skróty (doesn't, she's) i pełne formy są poprawne." });
      renderExercises(box.firstElementChild, items, { key: "odmiana", onDone: () => { const s = drill.querySelector(".cj-best"); if (s) s.innerHTML = "Najlepszy wynik: " + scorePill(state.scores.odmiana); } });
      box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
      box.scrollIntoView();
      const first = box.querySelector(".gap-input"); if (first) first.focus({ preventScroll: true });
    };
  }

  // ---------- Oś czasów (#/czasy) ----------
  // Każdy czas narysowany na wspólnej osi (SVG 600×48: oś y = 24, „teraz” x = 300). Kształty: dot – jedno zdarzenie,
  // dots – powtarza się, wave – czynność w trakcie (arrow – trwa aż do końca fali), ref – moment odniesienia „wtedy”,
  // arc – strzałka skutku / „wcześniej niż” (dash – zamiar). Treść karty pochodzi z lekcji danego czasu: budowa z sekcji
  // formula (rows – które wiersze), przykłady z sekcji examples (ex – początek zdania), słowa-sygnały z pierwszej tabeli
  // „…sygnał…” (sig – początek wyrażenia albo para [en, pl], gdy tabela ich nie ma). Porównania – sekcje compare lekcji.
  const TL_Y = 24;
  const TL = {
    pas: { pl: "czas przeszły prosty", short: "zakończone, wiadomo kiedy", shape: [["dot", 170]],
      pic: "Jedna kropka w przeszłości: zdarzenie zaczęło się i skończyło. Zwykle wiemy albo pytamy, <b>kiedy</b> to było.",
      ex: ["I visited my grandparents", "We went to Italy", "Did you see the match"], sig: ["yesterday", "… ago", "last night", "in 2010", "when I was"] },
    pac: { pl: "czas przeszły ciągły", short: "w trakcie w przeszłości", shape: [["ref", 200], ["wave", 136, 264]],
      pic: "Fala wokół kreski „wtedy”: w tym momencie przeszłym czynność była <b>w trakcie</b>. Kreska to np. godzina (at 7 pm yesterday) albo krótkie zdarzenie, które ją przerwało (when the phone rang).",
      ex: ["At 7 pm yesterday", "I was having a shower", "While I was working"], sig: ["at 8 o'clock", "at that moment", "this time last week", "while / when"] },
    pap: { pl: "czas zaprzeszły", short: "wcześniej niż inne zdarzenie", shape: [["ref", 220], ["arc", 110, 220], ["dot", 110]],
      pic: "Dwa momenty w przeszłości: kreska „wtedy” to chwila z opowieści (zwykle Past Simple), a kropka przed nią – to, co stało się <b>jeszcze wcześniej</b>.",
      ex: ["When I got to the station", "By the time we arrived", "I was hungry because"], sig: ["by the time", "already", "never … before", "before / after"] },
    papc: { pl: "czas zaprzeszły ciągły", short: "jak długo – do chwili w przeszłości", shape: [["ref", 220], ["wave", 76, 204, 1]],
      pic: "Fala, która dochodzi do kreski „wtedy”: czynność trwała <b>jakiś czas</b> przed momentem w przeszłości. Ważne jest, jak długo.",
      ex: ["I had been waiting for an hour", "The streets were wet", "Her eyes were red"], sig: ["for + okres", "since + początek", "how long", "all day", "when / by the time"] },
    ps: { pl: "czas teraźniejszy prosty", short: "nawyki, fakty", shape: [["dots"]],
      pic: "Kropki na całej osi: coś dzieje się <b>regularnie</b> albo jest zawsze prawdą – wczoraj, dziś i jutro.",
      ex: ["I get up at seven", "My sister lives", "Water boils"], sig: ["always", "usually", "often", "never", "every day", "on Mondays"] },
    pc: { pl: "czas teraźniejszy ciągły", short: "teraz, w trakcie", shape: [["wave", 236, 364]],
      pic: "Fala wokół „teraz”: czynność <b>trwa w tej chwili</b> albo w tym okresie (this week) – zaczęła się i jeszcze się nie skończyła.",
      ex: ["I'm reading a really", "Look! It's snowing", "I'm working from home"], sig: ["now / right now", "at the moment", "Look! / Listen!", "today, this week", "these days"] },
    pp: { pl: "czas teraźniejszy dokonany", short: "skutek teraz, doświadczenie", shape: [["arc", 170, 300], ["dot", 170]],
      pic: "Kropka w przeszłości i strzałka do „teraz”: nie mówimy, kiedy to się stało – liczy się <b>skutek albo doświadczenie teraz</b>. Tak samo mówimy o stanie, który trwa od przeszłości do teraz (for, since).",
      ex: ["Have you ever been to London", "I've lost my phone", "I've lived here for five"], sig: ["ever", "never", "just", "already", "yet", ["for + okres", "od / przez (ile czasu)"], ["since + punkt w czasie", "od (kiedy)"]] },
    ppc: { pl: "czas teraźniejszy dokonany ciągły", short: "jak długo – do teraz", shape: [["wave", 140, 284, 1]],
      pic: "Fala od przeszłości aż do „teraz”: czynność trwa do tej chwili (albo przed chwilą się skończyła) i ważne jest, <b>jak długo</b>.",
      ex: ["I've been waiting for you", "How long have you been learning", "I'm exhausted"], sig: ["How long", "for + okres", "since + punkt", "all day", "lately"] },
    fs: { pl: "czas przyszły prosty", short: "decyzja teraz, obietnica, opinia", shape: [["dot", 440]],
      pic: "Kropka w przyszłości: coś się stanie. Używamy will, gdy <b>decydujemy w chwili mówienia</b>, obiecujemy, proponujemy albo mówimy, co naszym zdaniem się stanie (I think…).",
      ex: ["I'm thirsty", "I'll call you as soon as", "I think Poland will win"], sig: ["I think", "I'm sure", "probably", "perhaps", "tomorrow"] },
    gt: { pl: "zamiar, plan, przewidywanie", short: "zamiar, widać, że się stanie", shape: [["arc", 300, 431, 1], ["dot", 440]],
      pic: "Przerywana strzałka od „teraz” do kropki w przyszłości: <b>już teraz</b> mamy zamiar (decyzja zapadła wcześniej) albo widzimy znaki, że coś się zaraz stanie.",
      ex: ["I'm going to start a new job", "We're going to paint", "Look at those clouds"], sig: ["I've decided", "tonight", "Look! / Watch out!"] },
    fc: { pl: "czas przyszły ciągły", short: "w trakcie w przyszłości", shape: [["ref", 460], ["wave", 396, 524]],
      pic: "Fala wokół kreski „wtedy” w przyszłości: w tym momencie czynność <b>będzie w trakcie</b>.",
      ex: ["This time next week", "Don't call me at 9", "At midnight we'll still"], sig: [["this time tomorrow / next week", "jutro / w przyszłym tygodniu o tej porze"], ["at 8 tomorrow", "jutro o ósmej"], ["still", "wciąż, nadal"]] },
    fp: { pl: "czas przyszły dokonany", short: "zakończone do chwili w przyszłości", shape: [["ref", 480], ["arc", 380, 480], ["dot", 380]],
      pic: "Kropka przed kreską „wtedy” w przyszłości: coś będzie <b>już zakończone</b> najpóźniej do tego momentu (by Friday).",
      rows: /^Future Perfect \(/, ex: ["I'll have finished the project", "By the time you get here", "Will you have read"], sig: ["by + czas", "by the time", "in + okres", "before"] },
    fpc: { pl: "czas przyszły dokonany ciągły", short: "jak długo – do chwili w przyszłości", shape: [["ref", 480], ["wave", 220, 464, 1]],
      pic: "Fala, która dochodzi do kreski „wtedy” w przyszłości: liczymy, <b>jak długo</b> coś będzie trwało do tego momentu.",
      rows: /^Future Perfect Continuous \(/, ex: ["In June I'll have been", "By 6 p.m. she'll", "Next month we'll"], sig: ["for + okres", "by + czas", "by the time"] },
  };
  const TL_GROUPS = [["Przeszłość", ["pas", "pac", "pap", "papc"]], ["Teraźniejszość", ["ps", "pc", "pp", "ppc"]], ["Przyszłość", ["fs", "gt", "fc", "fp", "fpc"]]];
  const tlIds = () => TL_GROUPS.flatMap(([, ids]) => ids).filter((id) => TL[id] && CJ_BY_ID[id]);
  const tlStrip = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const tlLesson = (id) => BY_ID[CJ_BY_ID[id].lesson];
  const tlLocked = (id) => cjLockedIdx(CJ_BY_ID[id]) > reachIdx();
  const tlKnown = (id) => !!state.done[CJ_BY_ID[id].lesson];
  function tlSvg(id) {
    const f = (n) => +n.toFixed(1);
    const head = (x, y, dx, dy) => { // trójkąt grotu: czubek (x, y), kierunek (dx, dy)
      const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = 10, w = 5.5;
      return `<path class="tl-head" d="M${f(x)} ${f(y)}L${f(x - ux * s - uy * w)} ${f(y - uy * s + ux * w)}L${f(x - ux * s + uy * w)} ${f(y - uy * s - ux * w)}Z"/>`;
    };
    let refs = "", body = "";
    for (const [k, a, b, opt] of TL[id].shape) {
      if (k === "ref") refs += `<line class="tl-ref" x1="${a}" y1="7" x2="${a}" y2="41"/>`;
      else if (k === "dot") body += `<circle class="tl-dot" cx="${a}" cy="${TL_Y}" r="7"/>`;
      else if (k === "dots") for (let x = 60; x <= 540; x += 60) body += `<circle class="tl-dot" cx="${x}" cy="${TL_Y}" r="5"/>`;
      else if (k === "wave") {
        const end = opt ? b - 8 : b, n = Math.max(2, Math.round((end - a) / 16)), w = (end - a) / n / 2;
        body += `<path class="tl-wave" d="M${a} ${TL_Y}q${f(w / 2)} -8 ${f(w)} 0${(" t" + f(w) + " 0").repeat(2 * n - 1)}"/>`;
        if (opt) body += head(b + 2, TL_Y, 1, 0);
      } else if (k === "arc") { // łuk nad osią od a do b; linia kończy się tuż przed czubkiem grotu
        const y0 = TL_Y - 6, cy = TL_Y - 30, mx = (a + b) / 2, dx = b - mx, dy = y0 - cy, l = Math.hypot(dx, dy);
        body += `<path class="tl-arc${opt ? " dash" : ""}" d="M${a} ${y0}Q${mx} ${cy} ${f(b - dx / l * 7)} ${f(y0 - dy / l * 7)}"/>` + head(b, y0, dx, dy);
      }
    }
    return `<svg class="tl-svg" viewBox="0 0 600 48" aria-hidden="true" focusable="false"><line class="tl-ax" x1="10" y1="${TL_Y}" x2="582" y2="${TL_Y}"/><path class="tl-axhead" d="M590 ${TL_Y}l-11 -5.5v11z"/><line class="tl-now" x1="300" y1="2" x2="300" y2="46"/>${refs}${body}</svg>`;
  }
  function tlFormula(id) {
    const re = TL[id].rows || /^(Twierdzenie|Przeczenie|Pytanie) \(/;
    const s = tlLesson(id).sections.find((x) => x.type === "formula" && x.rows.some((r) => re.test(tlStrip(r.label))));
    return s ? s.rows.filter((r) => re.test(tlStrip(r.label))).slice(0, 3) : [];
  }
  function tlExamples(id) {
    const all = tlLesson(id).sections.filter((s) => s.type === "examples").flatMap((s) => s.items || []);
    return TL[id].ex.map((p) => all.find((e) => tlStrip(e.en).startsWith(p))).filter(Boolean);
  }
  function tlSignals(id) {
    const tb = tlLesson(id).sections.find((s) => s.type === "table" && /sygna/i.test(s.title || ""));
    const rows = tb ? tb.rows.map((r) => [tlStrip(r[0]), tlStrip(r[1])]) : [];
    return TL[id].sig.map((p) => (Array.isArray(p) ? p : rows.find(([en]) => en.startsWith(p)))).filter(Boolean);
  }
  // Etykieta kolumny porównania → czas: ostatnia nazwa czasu w etykiecie („When + Past Simple, Past Continuous” → Past
  // Continuous), przy remisie dłuższa („Present Perfect Continuous (have been + -ing)”); „will” i „going to” jako skróty.
  const TL_ALIAS = { fs: ["will"], gt: ["going to"] };
  function tlLabelId(label) {
    const s = tlStrip(label);
    let best = null, bi = -1, bl = 0;
    for (const t of CJ_TENSES) for (const n of [t.name, ...(TL_ALIAS[t.id] || [])]) {
      const re = new RegExp(`\\b${n.replace(/ /g, "\\s+")}\\b`, "gi");
      let m, last = -1;
      while ((m = re.exec(s))) last = m.index;
      if (last < 0) continue;
      if (last > bi || (last === bi && n.length > bl)) { best = t.id; bi = last; bl = n.length; }
    }
    return best;
  }
  // Link z lekcji: lekcja czasu → jej wiersz na osi, lekcje porównujące dwa czasy → porównanie, przegląd czasów → cała oś.
  const TL_LESSON_CMP = { "present-simple-vs-continuous": ["ps", "pc"], "present-perfect-vs-past-simple": ["pas", "pp"] };
  function tlLessonLink(l) {
    if (l.id === "tenses-overview") return `<a class="card tl-promo" href="#/czasy"><span class="f-ico">${icon("timeline")}</span><span><b>Oś czasów</b><span>Wszystkie czasy na jednym rysunku: kiedy którego używać, budowa, przykłady, słowa-sygnały i porównania dwóch czasów.</span></span></a>`;
    const cmp = TL_LESSON_CMP[l.id];
    if (cmp) return `<p class="tl-lesson-link"><a href="#/czasy/porownaj/${cmp[0]}/${cmp[1]}">${icon("timeline")} Te dwa czasy na osi czasów →</a></p>`;
    const t = CJ_TENSES.find((x) => x.lesson === l.id && TL[x.id]);
    return t ? `<p class="tl-lesson-link"><a href="#/czasy/${t.id}">${icon("timeline")} Ten czas na osi czasów →</a></p>` : "";
  }
  let tlCmpCache = null;
  function tlCompares() {
    if (!tlCmpCache) {
      tlCmpCache = [];
      PATH.forEach((l) => l.sections.forEach((s) => {
        if (s.type !== "compare") return;
        const ids = (s.items || []).map((it) => tlLabelId(it.label));
        if (new Set(ids.filter(Boolean)).size >= 2) tlCmpCache.push({ l, s, ids });
      }));
    }
    return tlCmpCache;
  }
  // Gotowe pary (chipy, w kolejności lekcji): sąsiednie kolumny porównań do 3 kolumn. Zestawienia 4 sposobów mówienia
  // o przyszłości dają też pary typu Present Simple – Future Simple – te są dostępne z list wyboru, bez osobnego chipa.
  function tlPairs() {
    const seen = new Set(), out = [], order = tlIds();
    tlCompares().forEach(({ ids }) => {
      if (ids.length > 3) return;
      const u = [...new Set(ids.filter(Boolean))];
      u.slice(1).forEach((b, i) => {
        const p = [u[i], b].sort((x, y) => order.indexOf(x) - order.indexOf(y)), k = p.join("/");
        if (!seen.has(k)) { seen.add(k); out.push(p); }
      });
    });
    return out;
  }

  // sel – czas z rozwiniętą kartą (karta otwiera się pod jego wierszem, null = wszystkie zwinięte); a, b – porównanie.
  let tlCfg = { sel: null, known: false, a: "pas", b: "pp" };
  function tlRowHtml(id) {
    const t = CJ_BY_ID[id], locked = tlLocked(id), on = tlCfg.sel === id;
    return `<button type="button" class="tl-row${locked ? " locked" : ""}${on ? " active" : ""}" data-t="${id}" aria-expanded="${on}"${on ? ` aria-controls="tlCard"` : ""}>
      <span class="tl-name"><b>${doneTick(esc(t.name), tlKnown(id))}</b><small>${esc(TL[id].short)}${locked ? ` · lekcja ${cjLockedIdx(t) + 1}` : ""}</small></span>${tlSvg(id)}<span class="tl-chev" aria-hidden="true">${icon("chevron")}</span></button>
      ${on ? `<div class="tl-card" id="tlCard" role="region" aria-label="${esc(t.name)}">${tlCardHtml(id)}</div>` : ""}`;
  }
  function tlLanesHtml() {
    const groups = TL_GROUPS.map(([g, ids]) => {
      const v = ids.filter((id) => TL[id] && CJ_BY_ID[id] && (!tlCfg.known || tlKnown(id)));
      return v.length ? `<div class="tl-group" role="group" aria-label="${g}"><div class="tl-gname">${g}</div>${v.map(tlRowHtml).join("")}</div>` : "";
    }).join("");
    if (!groups) {
      const first = BY_ID[CJ_TENSES[0].lesson];
      return `<div class="tl-empty">Nie masz jeszcze przerobionych lekcji z czasami. Zacznij od lekcji <a href="#/lesson/${first.id}">${lessonNo(first)}. ${esc(first.title)}</a> i oznacz ją jako przerobioną – albo pokaż wszystkie czasy.</div>`;
    }
    return `<div class="tl-scale-row" aria-hidden="true"><span></span><span class="tl-scale"><span>← przeszłość</span><span class="tl-now-l">teraz</span><span>przyszłość →</span></span></div>${groups}`;
  }
  function tlFilterHtml() {
    const n = tlIds().filter(tlKnown).length;
    return `<div class="chips tl-filter" role="group" aria-label="Które czasy pokazać">
      <button class="chip ${tlCfg.known ? "" : "active"}" data-known="0" aria-pressed="${!tlCfg.known}">Wszystkie czasy (${tlIds().length})</button>
      <button class="chip ${tlCfg.known ? "active" : ""}" data-known="1" aria-pressed="${tlCfg.known}">Tylko te, które znam (${n})</button></div>`;
  }
  const TL_LEGEND = `<div class="tl-legend">
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><circle class="tl-dot" cx="18" cy="10" r="6"/></svg>jedno zdarzenie</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><path class="tl-wave" d="M3 10q3.75 -7 7.5 0t7.5 0t7.5 0t7.5 0"/></svg>czynność w trakcie</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><line class="tl-ref" x1="18" y1="2" x2="18" y2="18"/></svg>„wtedy” – moment, o którym mówimy</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><path class="tl-arc" d="M4 15Q16 -1 28 12"/><path class="tl-head" d="M32 15l-9.5 -1.5l5 -7z"/></svg>skutek albo „wcześniej niż”</span>
      <span><svg viewBox="0 0 36 20" aria-hidden="true"><line class="tl-now" x1="18" y1="1" x2="18" y2="19"/></svg>teraz</span>
    </div>`;
  function tlCardHtml(id) {
    const t = CJ_BY_ID[id], d = TL[id], l = tlLesson(id), no = cjLockedIdx(t) + 1;
    const rows = tlFormula(id), ex = tlExamples(id), sig = tlSignals(id), ref = d.shape.find((s) => s[0] === "ref");
    return `<div class="tl-card-head"><h2>${esc(t.name)}</h2><span class="tl-pl">${esc(d.pl)}</span>${badge(l.level)}</div>
      ${tlLocked(id) ? `<p class="tl-lock">${icon("alert")} <span>Ten czas poznasz w lekcji <a href="#/lesson/${l.id}">${no}. ${esc(l.title)}</a> – możesz już zajrzeć.</span></p>` : ""}
      <div class="tl-big">
        <div class="tl-marks" aria-hidden="true">${ref ? `<span style="left:${(ref[1] / 6).toFixed(2)}%">wtedy</span>` : ""}<span class="tl-now-l" style="left:50%">teraz</span></div>
        ${tlSvg(id)}
        <div class="tl-ends" aria-hidden="true"><span>← przeszłość</span><span>przyszłość →</span></div>
      </div>
      <p class="tl-pic">${d.pic}</p>
      ${t.use ? `<p class="tl-use"><b>Kiedy używamy?</b> ${esc(t.use)}.</p>` : ""}
      ${rows.length ? `<h3>Budowa</h3><div class="formula-grid">${rows.map((r) => `<div class="formula-row"><div class="f-label">${r.label}</div><div class="f-body"><div class="formula">${r.formula}</div>${r.example ? `<div class="f-example">${speakBtn(r.example)}<span>${r.example}</span></div>` : ""}</div></div>`).join("")}</div>` : ""}
      ${ex.length ? `<h3>Przykłady</h3><ul class="tl-ex">${ex.map(cmpExample).join("")}</ul>` : ""}
      ${sig.length ? `<h3>Słowa-sygnały</h3><ul class="tl-sig">${sig.map(([en, pl]) => `<li><b>${esc(en)}</b><span>${esc(pl)}</span></li>`).join("")}</ul>` : ""}
      <div class="tl-links"><a class="btn primary" href="#/lesson/${l.id}">${icon("book-open")} Lekcja ${no}. ${esc(l.title)}</a><a class="btn" href="#/odmiana">${icon("layers")} Odmiana czasownika</a><button type="button" class="btn" data-cmp="${id}">${icon("repeat")} Porównaj z innym czasem</button></div>`;
  }
  function tlCmpHtml() {
    const { a, b } = tlCfg, ids = tlIds();
    const opts = (v) => ids.map((id) => `<option value="${id}"${id === v ? " selected" : ""}>${esc(CJ_BY_ID[id].name)}</option>`).join("");
    const col = (id) => {
      const t = CJ_BY_ID[id], f = tlFormula(id)[0], e = tlExamples(id)[0];
      return `<div class="card tl-cmp-col"><h3><a href="#/czasy/${id}" data-t="${id}">${esc(t.name)}</a></h3>${tlSvg(id)}
        <p class="tl-cmp-use">${esc(t.use || TL[id].short)}</p>
        ${f ? `<div class="formula">${f.formula}</div>` : ""}
        ${e ? `<ul class="tl-ex">${cmpExample(e)}</ul>` : ""}</div>`;
    };
    const pairs = tlPairs().map(([x, y]) => `<button class="chip ${(x === a && y === b) || (x === b && y === a) ? "active" : ""}" data-pair="${x}/${y}">${esc(CJ_BY_ID[x].name)} – ${esc(CJ_BY_ID[y].name)}</button>`).join("");
    let res;
    if (a === b) res = `<p class="tl-note">Wybierz dwa różne czasy.</p>`;
    else {
      const blocks = tlCompares().filter((c) => c.ids.includes(a) && c.ids.includes(b)).map(({ l, s, ids: cids }) => `<div class="tl-src">
          <h3>${s.title} <small>z lekcji <a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a></small></h3>
          <div class="compare">${s.items.filter((_, i) => cids[i] === a || cids[i] === b).map((c) => `<div class="card compare-col"><h3>${c.label}</h3><div class="prose">${c.html}</div>${(c.examples || []).length ? `<ul>${c.examples.map(cmpExample).join("")}</ul>` : ""}</div>`).join("")}</div></div>`);
      res = `<div class="compare tl-cmp-cols">${col(a)}${col(b)}</div>` + (blocks.length
        ? `<h3 class="tl-sub">Porównanie z lekcji</h3>${blocks.slice(0, 2).join("")}${blocks.length > 2 ? `<details class="tl-more"><summary>Więcej porównań tych czasów (${blocks.length - 2})</summary>${blocks.slice(2).join("")}</details>` : ""}`
        : `<p class="tl-note">W lekcjach nie ma osobnego porównania tych dwóch czasów – porównaj rysunek, budowę i przykłady powyżej.</p>`);
    }
    return `<div class="card tl-cmp-pick">
        <div class="tl-selects"><label><span>Czas 1</span><select id="tlA">${opts(a)}</select></label><button type="button" class="btn small" id="tlSwap" title="Zamień miejscami" aria-label="Zamień miejscami">${icon("swap")}</button><label><span>Czas 2</span><select id="tlB">${opts(b)}</select></label></div>
        ${pairs ? `<div><h3>Gotowe porównania z lekcji</h3><div class="chips tl-pairs">${pairs}</div></div>` : ""}
      </div>${res}`;
  }
  function renderTimeline(arg) {
    const p = String(arg || "").split("/").map((x) => { try { return decodeURIComponent(x); } catch (e) { return ""; } });
    const ok = (id) => !!(TL[id] && CJ_BY_ID[id]);
    if (p[0] === "porownaj" && ok(p[1]) && ok(p[2])) { tlCfg.a = p[1]; tlCfg.b = p[2]; }
    else tlCfg.sel = ok(p[0]) ? p[0] : null;
    return `<div class="page timeline">
      <div class="hero"><h1>${icon("timeline")} Oś czasów</h1><p>Wszystkie czasy na jednej osi: przeszłość – teraz – przyszłość. Kliknij czas, żeby zobaczyć, co znaczy rysunek, jak zbudować zdanie, przykłady i słowa-sygnały. Niżej porównasz dwa czasy obok siebie.</p></div>
      <div class="card tl-wrap">
        <div class="tl-top">${tlFilterHtml()}</div>
        ${TL_LEGEND}
        <div class="tl-lanes" id="tlLanes">${tlLanesHtml()}</div>
      </div>
      <h2 class="section-title" id="tlCmp">${icon("columns")} Porównaj dwa czasy</h2>
      <div id="tlCmpBox">${tlCmpHtml()}</div>
    </div>`;
  }
  function bindTimeline() {
    const page = $(".page.timeline"); if (!page) return;
    const lanes = $("#tlLanes"), cmp = $("#tlCmpBox");
    const url = () => history.replaceState(null, "", location.pathname + location.search + (tlCfg.sel ? "#/czasy/" + tlCfg.sel : "#/czasy"));
    // Otwiera / zamyka kartę pod wierszem; wiersz zostaje w tym samym miejscu ekranu (karta wyżej mogła się zamknąć).
    const toggle = (id, open) => {
      const r0 = lanes.querySelector(`.tl-row[data-t="${id}"]`), top0 = r0 ? r0.getBoundingClientRect().top : null;
      tlCfg.sel = open || tlCfg.sel !== id ? id : null;
      if (tlCfg.known && !tlKnown(id)) { tlCfg.known = false; page.querySelector(".tl-top").innerHTML = tlFilterHtml(); }
      lanes.innerHTML = tlLanesHtml();
      const r1 = lanes.querySelector(`.tl-row[data-t="${id}"]`);
      if (r1) {
        if (top0 !== null && !open) { // bez płynnego przewijania (html ma scroll-behavior: smooth) – korekta ma być niewidoczna
          const st = document.documentElement.style;
          st.scrollBehavior = "auto"; window.scrollBy(0, r1.getBoundingClientRect().top - top0); st.scrollBehavior = "";
        }
        else r1.scrollIntoView({ block: "start" });
        r1.focus({ preventScroll: true });
      }
      url();
    };
    lanes.addEventListener("click", (e) => {
      const c = e.target.closest("[data-cmp]");
      if (c) {
        const id = c.dataset.cmp, pair = tlPairs().find((x) => x.includes(id));
        [tlCfg.a, tlCfg.b] = pair ? (pair[0] === id ? pair : [pair[1], pair[0]]) : [id, tlIds().find((x) => x !== id)];
        showCmp(); $("#tlCmp").scrollIntoView({ block: "start" });
        return;
      }
      const r = e.target.closest(".tl-row"); if (r) toggle(r.dataset.t);
    });
    lanes.addEventListener("keydown", (e) => { // strzałki góra/dół, Home, End – między wierszami czasów
      const r = e.target.closest(".tl-row"); if (!r || !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      const all = [...lanes.querySelectorAll(".tl-row")], i = all.indexOf(r);
      const j = e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : Math.min(all.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)));
      e.preventDefault(); all[j].focus();
    });
    page.querySelector(".tl-top").addEventListener("click", (e) => {
      const b = e.target.closest("[data-known]"); if (!b) return;
      tlCfg.known = b.dataset.known === "1";
      if (tlCfg.known && tlCfg.sel && !tlKnown(tlCfg.sel)) { tlCfg.sel = null; url(); }
      page.querySelector(".tl-top").innerHTML = tlFilterHtml();
      lanes.innerHTML = tlLanesHtml();
      const nb = page.querySelector(`.tl-top [data-known="${b.dataset.known}"]`); if (nb) nb.focus();
    });
    const showCmp = () => { cmp.innerHTML = tlCmpHtml(); };
    cmp.addEventListener("change", (e) => {
      if (e.target.id !== "tlA" && e.target.id !== "tlB") return;
      tlCfg[e.target.id === "tlA" ? "a" : "b"] = e.target.value;
      const id = e.target.id; showCmp(); $("#" + id).focus();
    });
    cmp.addEventListener("click", (e) => {
      const pb = e.target.closest("[data-pair]");
      if (pb) { [tlCfg.a, tlCfg.b] = pb.dataset.pair.split("/"); showCmp(); const c = cmp.querySelector(`[data-pair="${pb.dataset.pair}"]`); if (c) c.focus(); return; }
      if (e.target.closest("#tlSwap")) { [tlCfg.a, tlCfg.b] = [tlCfg.b, tlCfg.a]; showCmp(); $("#tlSwap").focus(); return; }
      const t = e.target.closest("a[data-t]");
      if (t) { e.preventDefault(); toggle(t.dataset.t, true); }
    });
  }

  // ---------- Czytanki (#/czytanki) ----------
  // Tekst = klikalne słowa; dymek z tłumaczeniem, głośnikiem i „Dodaj do fiszek”. Skąd tłumaczenie (po kolei):
  // 1. glossary czytanki (słowa spoza słówek kursu i znaczenia zależne od tekstu – np. left = pozostały),
  // 2. krótki słownik słów gramatycznych (RD_FUNC: zaimki, przyimki, czasowniki pomocnicze, skróty I'm / don't…),
  // 3. słówka lekcji i działów (WORDS) – najpierw forma z tekstu, potem formy podstawowe (rdCands: went → go,
  //    children → child, wetter → wet, booked → book…). Zwroty wielowyrazowe (living room, get up, a lot of, had dinner →
  //    have dinner) mają pierwszeństwo przed pojedynczym słowem; najdłuższy pasujący fragment w obrębie zdania.
  const RD_FUNC = new Map(("a=przedimek nieokreślony (jakiś, jeden – zwykle się nie tłumaczy)|an=przedimek nieokreślony przed samogłoską (jakiś, jeden)|" +
    "the=przedimek określony (ten, ta, to – zwykle się nie tłumaczy)|i=ja|you=ty; wy|he=on|she=ona|it=to; ono (o rzeczy lub zwierzęciu)|we=my|they=oni, one|" +
    "me=mnie, mi, mną|him=jego, go, mu, nim|her=jej, ją, nią; jej (czyja?)|us=nas, nam, nami|them=ich, im, nimi|my=mój, moja, moje|your=twój; wasz|" +
    "his=jego|its=jego, jej (o rzeczy lub zwierzęciu)|our=nasz|their=ich|mine=mój (bez rzeczownika)|yours=twój; wasz (bez rzeczownika)|hers=jej (bez rzeczownika)|" +
    "ours=nasz (bez rzeczownika)|theirs=ich (bez rzeczownika)|myself=się, siebie; sam(a)|yourself=się, siebie; sam(a)|himself=się, siebie; sam|herself=się, siebie; sama|" +
    "itself=się, siebie; samo|ourselves=się, siebie; sami|yourselves=się, siebie; sami|themselves=się, siebie; sami|" +
    "be=być|am=jestem (be)|is=jest (be)|are=jesteś, jesteśmy, jesteście, są (be)|was=byłem, był, była (be)|were=byłeś, byliśmy, byli (be)|been=III forma be: być|being=bycie; będąc|" +
    "have=mieć; czasownik pomocniczy (Present Perfect)|has=ma (have); pomocniczy: he / she / it|had=miał (II i III forma have); pomocniczy (Past Perfect)|having=mając|" +
    "do=robić; pomocniczy w pytaniach i przeczeniach|does=robi; pomocniczy: he / she / it|did=zrobił (II forma do); pomocniczy w Past Simple|done=zrobiony (III forma do)|" +
    "can=móc, umieć, potrafić (też: puszka)|could=mógł, umiał; mógłby|will=pomocniczy czasu przyszłego (zrobi, będzie)|would=by (tryb przypuszczający); zwykle robił (w przeszłości)|" +
    "shall=czy mam / czy mamy…? (propozycja)|should=powinien|may=może, wolno|might=może, być może|must=musieć; na pewno (must be = na pewno jest)|let=pozwolić (let's = zróbmy)|" +
    "not=nie|no=nie; żaden|yes=tak|and=i, a|or=lub, albo; czy|but=ale|so=więc; tak (bardzo)|because=ponieważ, bo|if=jeśli, jeżeli; czy|when=kiedy, gdy|while=podczas gdy, kiedy|" +
    "than=niż|then=potem; wtedy|that=tamten, tamto; że; który|this=ten, ta, to|these=ci, te|those=tamci, tamte|there=tam (there is / are = jest / są)|here=tu, tutaj|" +
    "what=co; jaki|who=kto; który (o ludziach)|which=który|where=gdzie|why=dlaczego|how=jak|whose=czyj|as=jak, jako; ponieważ; gdy|like=lubić; jak, podobnie jak|" +
    "to=do; żeby (przed czasownikiem)|of=(kogo? czego?); z|in=w; za (in two days = za dwa dni)|on=na; w (on Monday = w poniedziałek)|at=w, na, przy; o (at six = o szóstej)|" +
    "for=dla; przez (for two years = przez dwa lata)|from=z, od|with=z (kimś, czymś)|by=przez (kogo?); przy, obok; do (by Friday = do piątku)|about=o (czym?); około|" +
    "into=do (środka)|out=na zewnątrz, poza|up=w górę|down=w dół|off=z, od (oddalenie)|over=nad; ponad; skończony|under=pod|after=po; po tym, jak|before=przed; zanim; wcześniej|" +
    "since=od (jakiegoś momentu); ponieważ|until=do, aż|till=do, aż|during=podczas|through=przez (na wylot)|between=między|among=wśród|near=blisko, obok|around=wokół; około|" +
    "without=bez|within=w ciągu, w obrębie|across=przez (na drugą stronę)|along=wzdłuż|behind=za (z tyłu)|above=nad, powyżej|below=pod, poniżej|inside=wewnątrz|" +
    "outside=na zewnątrz|past=obok, za; po (godzinie)|against=przeciw; o (oprzeć się o)|towards=w kierunku|per=na (np. na godzinę)|" +
    "some=trochę, kilka, jakieś|any=jakiś, jakikolwiek; żaden (w przeczeniach)|every=każdy|each=każdy (z osobna)|all=wszyscy, wszystko; cały|both=obaj, oba, obie|" +
    "either=jeden z dwóch; też nie|neither=żaden z dwóch, ani|none=żaden, nikt|much=dużo (z rzeczownikami niepoliczalnymi); bardzo|many=dużo, wiele|" +
    "more=więcej; bardziej|most=najwięcej, najbardziej; większość|few=mało, niewiele (a few = kilka)|little=mało (a little = trochę); mały|less=mniej|lot=a lot (of) = dużo|" +
    "lots=lots of = dużo|other=inny|another=inny, kolejny, jeszcze jeden|such=taki|own=własny|same=taki sam, ten sam|very=bardzo|too=też; zbyt, za (too big = za duży)|" +
    "also=też, również|just=właśnie; tylko; po prostu|only=tylko; jedyny|even=nawet|still=wciąż, nadal|already=już|yet=jeszcze (w przeczeniach); już (w pytaniach)|" +
    "ever=kiedykolwiek|never=nigdy|always=zawsze|often=często|usually=zwykle|sometimes=czasami|else=jeszcze, inny (something else = coś innego)|" +
    "somebody=ktoś|someone=ktoś|something=coś|somewhere=gdzieś|anybody=ktokolwiek; nikt (w przeczeniach)|anyone=ktokolwiek; nikt (w przeczeniach)|" +
    "anything=cokolwiek; nic (w przeczeniach)|anywhere=gdziekolwiek; nigdzie (w przeczeniach)|everybody=wszyscy, każdy|everyone=wszyscy, każdy|everything=wszystko|" +
    "everywhere=wszędzie|nobody=nikt|nothing=nic|nowhere=nigdzie|one=jeden|two=dwa|three=trzy|four=cztery|five=pięć|six=sześć|seven=siedem|eight=osiem|nine=dziewięć|" +
    "ten=dziesięć|eleven=jedenaście|twelve=dwanaście|twenty=dwadzieścia|thirty=trzydzieści|forty=czterdzieści|fifty=pięćdziesiąt|hundred=sto|thousand=tysiąc|" +
    "first=pierwszy; najpierw|second=drugi; sekunda|third=trzeci|half=połowa, pół|o'clock=godzina (at three o'clock = o trzeciej)|please=proszę|thank=dziękować|" +
    "thanks=dzięki|sorry=przepraszam; przykro mi|hello=cześć, dzień dobry|hi=cześć|bye=cześć (na pożegnanie)|goodbye=do widzenia|oh=och|well=dobrze; cóż, no|" +
    "ok=w porządku, dobrze|okay=w porządku, dobrze|mr=pan (przed nazwiskiem)|mrs=pani (przed nazwiskiem)|ms=pani (przed nazwiskiem)|" +
    "i'm=I am – jestem|you're=you are – jesteś; jesteście|he's=he is / he has – on jest / on ma|she's=she is / she has – ona jest / ona ma|it's=it is / it has – to jest|" +
    "we're=we are – jesteśmy|they're=they are – są|i've=I have – mam (też: Present Perfect)|you've=you have – masz (też: Present Perfect)|we've=we have – mamy (też: Present Perfect)|" +
    "they've=they have – mają (też: Present Perfect)|i'll=I will – (ja) zrobię, będę|you'll=you will – zrobisz, będziesz|he'll=he will – zrobi, będzie|she'll=she will – zrobi, będzie|" +
    "it'll=it will – będzie|we'll=we will – zrobimy, będziemy|they'll=they will – zrobią, będą|i'd=I would / I had – (ja) bym; miałem|you'd=you would / you had|" +
    "he'd=he would / he had|she'd=she would / she had|we'd=we would / we had|they'd=they would / they had|isn't=is not – nie jest|aren't=are not – nie są, nie jesteś|" +
    "wasn't=was not – nie był|weren't=were not – nie byli, nie byłeś|don't=do not – nie (przeczenie)|doesn't=does not – nie (przeczenie: he / she / it)|" +
    "didn't=did not – nie (przeczenie w Past Simple)|haven't=have not – nie (Present Perfect); nie mam|hasn't=has not – nie (Present Perfect); nie ma|" +
    "hadn't=had not – nie (Past Perfect); nie miał|can't=cannot – nie mogę, nie umiem; na pewno nie|couldn't=could not – nie mógł, nie umiał|won't=will not – nie (w przyszłości)|" +
    "wouldn't=would not – nie (tryb przypuszczający)|shouldn't=should not – nie powinien|mustn't=must not – nie wolno|there's=there is – jest, znajduje się|" +
    "that's=that is – to jest|what's=what is – co jest? jaki jest?|who's=who is – kto jest?|where's=where is – gdzie jest?|let's=let us – zróbmy (propozycja)|" +
    "have got=mieć (= have)|has got=ma (= has)|haven't got=nie mieć|hasn't got=nie ma|i've got=mam|you've got=masz; macie|we've got=mamy|they've got=mają|" +
    "he's got=on ma|she's got=ona ma|it's got=ma (o rzeczy)|going to=be going to + czasownik = zamierzać, mieć zamiar (też: iść / jechać do)|have to=musieć|" +
    "has to=musi|had to=musiał|don't have to=nie musieć|doesn't have to=nie musi|didn't have to=nie musiał|must have=must have + III forma = na pewno (coś się stało)|" +
    "can't have=can't have + III forma = na pewno nie (coś się nie stało)|might have=might have + III forma = może (coś się stało)|" +
    "could have=could have + III forma = mógł (coś zrobić, ale nie zrobił); być może")
    .split("|").map((x) => { const i = x.indexOf("="); return [x.slice(0, i), [{ en: x.slice(0, i), pl: x.slice(i + 1), src: "func" }]]; }));
  const RD_SPECIAL = { children: "child", people: "person", men: "man", women: "woman", feet: "foot", teeth: "tooth", mice: "mouse", knives: "knife", wives: "wife",
    lives: "life", leaves: "leaf", shelves: "shelf", halves: "half", better: "good", best: "good", worse: "bad", worst: "bad", further: "far", furthest: "far" };
  let rdIrr = null;
  // Formy podstawowe słowa (jak tools/audit/lemma.js): forma nieregularna → bezokolicznik (tabele lekcji irregular-verbs),
  // -s/-es/-ies, -ed/-ied (z podwojoną spółgłoską), -ing, -er/-est, -ly. Pierwsza pozycja = samo słowo.
  function rdCands(w) {
    if (!rdIrr) {
      rdIrr = new Map();
      cjTables().irr.forEach((f, base) => [...f.past, ...f.pp, ...f.ppUS].forEach((x) => { if (x !== base && !rdIrr.has(x)) rdIrr.set(x, base); }));
    }
    const c = [w];
    const add = (x) => { if (x && x.length > 1 && !c.includes(x)) { c.push(x); if (rdIrr.has(x)) add(rdIrr.get(x)); } };
    add(RD_SPECIAL[w]); add(rdIrr.get(w));
    if (c.length > 1) return c; // forma nieregularna – bez odcinania końcówek (best ≠ be)
    if (/ies$/.test(w)) add(w.slice(0, -3) + "y");
    if (/(s|x|z|ch|sh|o)es$/.test(w)) add(w.slice(0, -2));
    if (/[^s']s$/.test(w)) add(w.slice(0, -1));
    if (/ied$/.test(w)) add(w.slice(0, -3) + "y");
    if (/ed$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/([^aeiou])\1ed$/.test(w)) add(w.slice(0, -3)); }
    if (/ing$/.test(w)) { const s = w.slice(0, -3); add(s); add(s + "e"); if (/([^aeiou])\1$/.test(s)) add(s.slice(0, -1)); if (/ying$/.test(w)) add(s.slice(0, -1) + "ie"); }
    if (/ier$/.test(w)) add(w.slice(0, -3) + "y");
    if (/iest$/.test(w)) add(w.slice(0, -4) + "y");
    if (/er$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/([^aeiou])\1er$/.test(w)) add(w.slice(0, -3)); }
    if (/est$/.test(w)) { add(w.slice(0, -3)); add(w.slice(0, -2)); if (/([^aeiou])\1est$/.test(w)) add(w.slice(0, -4)); }
    if (/ily$/.test(w)) add(w.slice(0, -3) + "y");
    if (/ly$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -2) + "le"); }
    return c;
  }
  const rdNorm = (s) => String(s).toLowerCase().replace(/[’‘`´]/g, "'");
  // Formy hasła słówka do wyszukiwania: „afraid (of)” → afraid, afraid of; „colour (BrE)” → colour; „box – boxes” → box,
  // boxes; „pick sb up” → pick up; „How often…?” → how often. Nawias z przecinkiem lub „/” (formy czasownika) – pomijany.
  function rdVariants(alt) {
    let a = alt.replace(/\((BrE|AmE|US|UK)\)/g, " ");
    const out = new Set();
    const vs = /\(([^()]*)\)/.test(a) ? [a.replace(/\([^()]*\)/g, " "), a.replace(/\(([^()]*)\)/g, (m, x) => (/[,/]/.test(x) ? " " : x))] : [a];
    vs.forEach((v) => v.split(/\s+[–—]\s+/).forEach((f) => {
      f = rdNorm(f).replace(/…|\.\.\./g, " ").replace(/[?!.,;:]/g, " ").replace(/\b(sb|sth|someone|someone's|somebody|somebody's|one's)\b/g, " ").replace(/\s+/g, " ").trim();
      if (f && !/[+=]/.test(f)) out.add(f);
    }));
    return [...out];
  }
  // Dodaje hasło do mapy forma → wpisy. Warianty „A / B” osobno, z tłumaczeniem z tej samej pozycji w pl (gdy liczba
  // wariantów się zgadza); krótszy wariant dostaje początek pierwszego: „have breakfast / lunch / dinner” → have lunch.
  // „ / ” poza nawiasami: „ile (policzalne / niepoliczalne)” to jeden wariant.
  function rdSplit(s) {
    const out = [];
    let depth = 0, cur = "";
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === "(") depth++;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (!depth && s.startsWith(" / ", i)) { out.push(cur); cur = ""; i += 2; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map((x) => x.trim()).filter(Boolean);
  }
  // Tłumaczenie wariantu nr g (z n): „zimno (komuś) / gorąco (komuś); zimny / gorący” → dla hot: „gorąco (komuś); gorący”.
  function rdPairPl(p, g, n) {
    if (n < 2) return p;
    const segs = p.split(/\s*;\s*/).map(rdSplit);
    if (segs.every((x) => x.length === n)) return segs.map((x) => x[g]).join("; ");
    const all = rdSplit(p);
    return all.length === n ? all[g] : p;
  }
  function rdIndexAdd(map, en, pl, info) {
    const e = stripTags(en), p = stripTags(pl);
    const alts = rdSplit(e);
    // „colour (BrE) / color (AmE)” – jeden wariant znaczeniowy (ta sama pozycja w pl).
    const grp = [];
    alts.forEach((a, i) => grp.push(i && /\((AmE|US)\)/.test(a) && /\((BrE|UK)\)/.test(alts[i - 1]) ? grp[i - 1] : (i ? grp[i - 1] + 1 : 0)));
    const n = grp.length ? grp[grp.length - 1] + 1 : 0;
    const head = rdVariants(alts[0] || "")[0] || "", hw = head.split(" ");
    const put = (f, entry) => { if (!map.has(f)) map.set(f, []); if (!map.get(f).some((x) => x.k === entry.k && x.pl === entry.pl && x.en === entry.en)) map.get(f).push(entry); };
    alts.forEach((a, i) => {
      const entry = { ...info, en: a.trim(), pl: rdPairPl(p, grp[i], n) };
      const forms = rdVariants(a);
      forms.forEach((f) => put(f, entry));
      // „have breakfast / lunch / dinner” → have lunch (hasło = cały zwrot, tłumaczenie całego wpisu)
      const fw = forms[0] ? forms[0].split(" ") : [];
      if (i && fw.length && hw.length > 1 && fw.length < hw.length) {
        const f = hw.slice(0, hw.length - fw.length).concat(fw).join(" ");
        put(f, { ...info, en: f, pl: p, pre: true });
      }
    });
  }
  let rdIdx = null;
  function rdIndex() {
    if (rdIdx) return rdIdx;
    rdIdx = new Map();
    DECKS.forEach((d) => { if (!d.manual) d.items.forEach((w) => rdIndexAdd(rdIdx, w.en, w.pl, { src: "words", deck: d.id, k: wordKey(w.en) })); });
    return rdIdx;
  }
  const rdGlossMaps = new Map();
  function rdGloss(r) {
    if (!rdGlossMaps.has(r.id)) {
      const m = new Map();
      Object.entries(r.glossary).forEach(([en, pl]) => rdIndexAdd(m, en, pl, { src: "gloss", deck: RD_DECK.id, k: wordKey(en) }));
      rdGlossMaps.set(r.id, m);
    }
    return rdGlossMaps.get(r.id);
  }
  // Słowa tekstu: { t: słowo z tekstu, n: forma do szukania (małe litery, bez 's i końcowego '), s: numer zdania }.
  const RD_WORD = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*(?:-[\p{L}\p{N}]+)*['’]?/gu;
  function rdParse(r) {
    if (r._parsed) return r._parsed;
    const words = [];
    let s = 0;
    const paras = r.text.map((p) => rdSentences(p).map((sent) => {
      const toks = [];
      let last = 0;
      sent = sent.trim();
      for (const m of sent.matchAll(RD_WORD)) {
        if (m.index > last) toks.push({ p: sent.slice(last, m.index) });
        toks.push({ w: words.length });
        words.push({ t: m[0], n: rdNorm(m[0]).replace(/'$/, ""), s });
        last = m.index + m[0].length;
      }
      if (last < sent.length) toks.push({ p: sent.slice(last) });
      return { s: s++, text: sent, toks };
    }));
    return (r._parsed = { paras, words });
  }
  // Formy słowa do szukania: samo słowo, bez 's (Tom's → tom, company's → company), formy podstawowe.
  function rdWordForms(n, max) {
    const base = /'s$/.test(n) && !RD_FUNC.has(n) ? n.slice(0, -2) : n;
    const out = [n];
    rdCands(base).forEach((c) => { if (!out.includes(c)) out.push(c); });
    return max ? out.slice(0, max) : out;
  }
  // Tłumaczenie słowa nr i: { from, len, src, entries } albo null. Najdłuższy fragment (do 5 słów, w jednym zdaniu)
  // zawierający słowo; przy tej samej długości: glossary > słowa gramatyczne > słówka. Dla pojedynczego słowa
  // ze słówek – wpisy wszystkich form (left → lewo; leave – wyjść), najpierw forma z tekstu.
  // Kolejność wpisów: hasło dokładnie równe szukanej formie (get przed „get (the door / the phone)”, własne hasło przed
  // doklejonym wariantem), bez wykrzyknika / pytajnika (look ≠ Look!), a dla form z -ed / -ing najpierw znaczenia
  // czasownikowe (polski bezokolicznik): watched → oglądać, nie zegarek.
  const rdIsVerb = (e) => CJ_PL_INF.test(stripTags(e.pl).split(/[\s,;(]/)[0]);
  function rdRank(es, form, verbish) {
    const head = (e) => rdNorm(e.en.replace(/\((BrE|AmE|US|UK)\)/g, "")).replace(/\s+/g, " ").trim();
    const score = (e) => (head(e) === form ? 0 : rdVariants(e.en).includes(form) ? 2 : 4) + (e.pre ? 1 : 0) + (/[!?]/.test(e.en) ? 8 : 0) + (verbish && !rdIsVerb(e) ? 5 : 0);
    return es.map((e, k) => [e, k]).sort((a, b) => score(a[0]) - score(b[0]) || a[1] - b[1]).map((x) => x[0]);
  }
  function rdLookup(r, i) {
    const { words } = rdParse(r), w = words[i];
    if (!w) return null;
    const maps = [["gloss", rdGloss(r)], ["func", RD_FUNC], ["words", rdIndex()]];
    for (let len = Math.min(5, words.length); len >= 2; len--) {
      for (let st = Math.max(0, i - len + 1); st <= i && st + len <= words.length; st++) {
        if (words[st].s !== words[st + len - 1].s) continue;
        const mid = words.slice(st + 1, st + len - 1).map((x) => x.n).join(" ");
        const firsts = rdWordForms(words[st].n, 5), lasts = rdWordForms(words[st + len - 1].n, 3);
        for (const [src, map] of maps) {
          for (const a of firsts) for (const b of lasts) {
            if (src === "func" && (a !== words[st].n || b !== words[st + len - 1].n)) continue; // had got ≠ have got
            const f = [a, mid, b].filter(Boolean).join(" "), e = map.get(f);
            if (e) return { from: st, len, src, entries: rdRank(e, f, /(ed|ing)$/.test(words[st].n) && a !== words[st].n) };
          }
        }
      }
    }
    const all = rdWordForms(w.n), poss = /'s$/.test(w.n) && !RD_FUNC.has(w.n);
    // Słowa gramatyczne najpierw tylko w formie z tekstu (evening ≠ even), z odciętą końcówką – na samym końcu (thanked → thank).
    for (const [src, map, only] of [maps[0], [...maps[1], true], maps[2], maps[1]]) {
      if (only) { const e = map.get(w.n); if (e) return { from: i, len: 1, src, entries: e }; continue; }
      // Gdy sama forma z tekstu (albo bez 's) jest w słowniczku, dokładamy tylko pewne formy podstawowe: nieregularne
      // (left → leave) i czasowniki przy -ed / -ing (meeting → meet) – bez „evening → even”, „news → new”.
      const exact = map.has(all[0]) || (poss && map.has(all[1]));
      const forms = !exact ? all : all.filter((f, k) => !k || (poss && k === 1) || rdIrr.get(w.n) === f || RD_SPECIAL[w.n] === f
        || (/(ed|ing)$/.test(w.n) && (map.get(f) || []).some(rdIsVerb)));
      const es = [];
      forms.forEach((f) => (map.get(f) || []).forEach((e) => { if (!es.some((x) => x.k === e.k && x.pl === e.pl && x.en === e.en)) es.push(e); }));
      // -ing po „be” (I'm meeting, was coming) – czasownik, nawet gdy jest rzeczownik o tej formie (meeting = spotkanie).
      const afterBe = i > 0 && /^(am|is|are|was|were|be|been|isn't|aren't|wasn't|weren't)$|'(m|re|s)$/.test(words[i - 1].n);
      if (es.length) return { from: i, len: 1, src, entries: rdRank(es, forms.find((f) => map.has(f)), /(ed|ing)$/.test(w.n) && (!map.has(w.n) || (afterBe && /ing$/.test(w.n)))) };
    }
    if (w.n.includes("-")) { // twenty-six, five-star: tłumaczenia części
      const parts = w.n.split("-").map((p) => { const x = RD_FUNC.get(p) || rdIndex().get(p) || rdIndex().get(rdCands(p)[1] || ""); return x ? x[0].pl.split(/[;,]/)[0].trim() : null; });
      if (parts.every(Boolean)) return { from: i, len: 1, src: "parts", entries: [{ en: w.t, pl: parts.join(" + "), src: "parts" }] };
    }
    return null;
  }
  // Opis źródła tłumaczenia w dymku.
  function rdSrcLabel(e) {
    if (e.src === "gloss") return "ze słowniczka tego tekstu";
    if (e.src === "func") return "słowo gramatyczne";
    if (e.src === "parts") return "złożone z części";
    const d = DECKS.find((x) => x.id === e.deck);
    return d ? (d.lesson ? `słówka lekcji ${esc(d.title)}` : `Słownictwo: ${esc(d.title)}`) : "";
  }

  const rdOpen = (r) => !!state.done[r.after];
  const rdKey = (r) => "read:" + r.id;
  const rdWordCount = (r) => r.text.join(" ").split(/\s+/).filter(Boolean).length;
  const rdMeta = (r) => `${rdWordCount(r)} słów · ${r.questions.length} ${plural(r.questions.length, "pytanie", "pytania", "pytań")}`;
  // Lista materiałów (czytanki; w kolejnych punktach także dialogi i rozmowy – ten sam kod): grupy według poziomu,
  // odblokowanie według lekcji after (przerobiona = otwarte), zablokowane widoczne z dopiskiem „po lekcji N”.
  // opts: { base: "#/czytanki", key: (x) => klucz wyniku w state.scores, meta: (x) => krótki opis }.
  function unitCardHtml(x, opts) {
    const open = !!state.done[x.after], s = state.scores[opts.key(x)];
    const status = !open ? `<span class="unit-lock">${icon("lock")} po lekcji ${lessonNo(x.lesson)}</span>` : s ? scorePill(s) : `<span class="unit-new">Nowa</span>`;
    return `<a class="card unit${open ? "" : " locked"}" href="${opts.base}/${x.id}">
      <span class="unit-top">${x.topic ? `<span class="unit-topic">${esc(x.topic)}</span>` : "<span></span>"}${status}</span>
      <b class="unit-title" lang="en">${esc(x.title)}</b><span class="unit-pl">${esc(x.titlePl)}</span>
      <span class="unit-meta">${opts.meta(x)}${open ? "" : `<br>Najpierw lekcja ${lessonNo(x.lesson)}: ${esc(x.lesson.title)}`}</span></a>`;
  }
  function unitListHtml(items, opts) {
    return LEVELS.map((lv) => {
      const xs = items.filter((x) => x.level === lv);
      if (!xs.length) return "";
      return `<h2 class="section-title unit-lv">${badge(lv)} ${LEVEL_INFO[lv].name}</h2><div class="unit-list">${xs.map((x) => unitCardHtml(x, opts)).join("")}</div>`;
    }).join("");
  }
  function renderReadingHome() {
    const head = `<div class="hero"><h1>${icon("book-open")} Czytanki</h1><p>Krótkie teksty z życia – dom, praca, podróże, zakupy – z pytaniami sprawdzającymi zrozumienie. Kliknij dowolne słowo, żeby zobaczyć tłumaczenie i dodać je do fiszek. Tekst możesz też odsłuchać.</p></div>`;
    if (!READING.length) return `<div class="page">${head}<div class="card empty m-empty"><b>Na razie nie ma czytanek.</b></div></div>`;
    const open = READING.filter(rdOpen).length;
    return `<div class="page reading-home">${head}
      <div class="card m-today rd-info"><div><b>Odblokowane: ${open} z ${READING.length}</b><span>Czytanka otwiera się po lekcji, która wprowadza ostatnią potrzebną konstrukcję – tekst ma tylko gramatykę i słówka, które już znasz (nieliczne nowe słowa mają tłumaczenie po kliknięciu). Zablokowaną też możesz otworzyć, ale może być trudna.</span></div></div>
      ${unitListHtml(READING, { base: "#/czytanki", key: rdKey, meta: rdMeta })}</div>`;
  }
  function rdTextHtml(r) {
    const { paras, words } = rdParse(r);
    return paras.map((ss) => `<p>${ss.map((x) => `<span class="rd-s" data-s="${x.s}">${x.toks.map((t) => t.p != null ? esc(t.p)
      : `<button type="button" class="rd-w" data-w="${t.w}" tabindex="${t.w ? -1 : 0}">${esc(words[t.w].t)}</button>`).join("")}</span>`).join(" ")}</p>`).join("");
  }
  function renderReading(id) {
    const r = RD_BY_ID[id];
    if (!r) return `<div class="page empty"><h1>Nie ma takiej czytanki</h1><p><a href="#/czytanki">← Wszystkie czytanki</a></p></div>`;
    const i = READING.indexOf(r), next = READING[i + 1], l = r.lesson;
    const tts = "speechSynthesis" in window;
    return `<div class="page reading" data-id="${r.id}">
      <p class="rd-back"><a href="#/czytanki">← Wszystkie czytanki</a></p>
      <header class="rd-head">
        <div class="rd-tags">${badge(r.level)}${r.topic ? `<span class="unit-topic">${esc(r.topic)}</span>` : ""}<span class="muted">${rdMeta(r)}</span></div>
        <h1 lang="en">${esc(r.title)}</h1>
        <p class="rd-pl">${esc(r.titlePl)}</p>
      </header>
      ${rdOpen(r) ? "" : `<div class="callout warning"><h3>${icon("lock")} Ta czytanka jest po lekcji ${lessonNo(l)}</h3><div class="prose"><p>Tekst używa konstrukcji z lekcji <a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a>, której jeszcze nie masz przerobionej. Możesz go przeczytać już teraz, ale mogą być w nim rzeczy, których jeszcze nie znasz.</p></div></div>`}
      <div class="rd-tools">
        ${tts ? `<button type="button" class="btn primary rd-play" aria-pressed="false">${icon("play")} <span>Przeczytaj na głos</span></button><a href="#" class="rd-voice" data-voice-open>${icon("voice")} Ustawienia głosu</a>` : ""}
        <span class="rd-hint">${icon("bulb")} Kliknij słowo, żeby zobaczyć tłumaczenie.</span>
      </div>
      ${tts ? `<div class="tts-warn">${ttsWarnHtml()}</div>` : ""}
      <article class="card rd-text" lang="en" aria-label="Tekst – kliknij słowo, żeby zobaczyć tłumaczenie">${rdTextHtml(r)}</article>
      ${exercisesShell("Pytania do tekstu", { id: "rdQ", intro: "Odpowiedz na pytania – możesz zaglądać do tekstu. Złe odpowiedzi trafią do „Moich błędów”." })}
      <div class="rd-next">${next ? `<a class="btn" href="#/czytanki/${next.id}">Następna czytanka: <span lang="en">${esc(next.title)}</span> →</a>` : `<a class="btn" href="#/czytanki">Wszystkie czytanki →</a>`}</div>
    </div>`;
  }
  // Czytanie na głos zdanie po zdaniu z podświetleniem. Kończy się samo, po „Zatrzymaj”, po zmianie strony
  // i wtedy, gdy coś innego zacznie mówić (głośnik w dymku) – speak() zapamiętuje ostatnią wypowiedź w lastUtter.
  let rdRun = 0;
  function rdStop(keepSpeech) { // keepSpeech – mówi już coś innego (głośnik w dymku), nie przerywamy tego
    if (!rdRun) return;
    rdRun = 0;
    document.querySelectorAll(".rd-s.rd-on").forEach((s) => s.classList.remove("rd-on"));
    const b = $(".rd-play");
    if (b) { b.setAttribute("aria-pressed", "false"); b.innerHTML = `${icon("play")} <span>Przeczytaj na głos</span>`; }
    if (!keepSpeech && "speechSynthesis" in window) speechSynthesis.cancel();
  }
  function rdReadAloud(page) {
    const sents = [...page.querySelectorAll(".rd-s")], btn = page.querySelector(".rd-play");
    const run = ++rdRun;
    let i = 0, cur = null;
    btn.setAttribute("aria-pressed", "true");
    btn.innerHTML = `${icon("stop")} <span>Zatrzymaj</span>`;
    const next = () => {
      if (run !== rdRun) return;
      if (cur && lastUtter !== cur) { rdStop(true); return; } // w przerwie między zdaniami zaczęło mówić coś innego
      sents.forEach((s) => s.classList.remove("rd-on"));
      if (i >= sents.length) { rdStop(); return; }
      const s = sents[i++];
      s.classList.add("rd-on");
      const r = s.getBoundingClientRect();
      if (r.top < 70 || r.bottom > innerHeight) s.scrollIntoView({ block: "center" });
      const u = speak(s.textContent, null, 1, (err) => { rdStop(); syncTtsWarn(err); });
      if (!u) { rdStop(); return; }
      cur = u;
      // Przerwanie przez inną wypowiedź: Chrome / Edge – „error” (interrupted), inne przeglądarki – „end”; sprawdzamy
      // po chwili, bo zdarzenie bywa wywołane jeszcze w trakcie speak() nowej wypowiedzi (zanim zmieni się lastUtter).
      u.addEventListener("end", () => setTimeout(() => { if (run !== rdRun) return; if (lastUtter === u) setTimeout(next, 250); else rdStop(true); }, 0));
      u.addEventListener("error", () => setTimeout(() => { if (run === rdRun && lastUtter !== u) rdStop(true); }, 0));
    };
    next();
  }
  // Dymek z tłumaczeniem – w stronie (position: absolute), pod słowem albo nad nim, zawsze w szerokości ekranu.
  function rdPopHtml(r, res, surface) {
    const e = res ? res.entries[0] : null;
    const name = !e && /^\p{Lu}/u.test(surface);
    if (!e) return `<div class="rd-pop-h"><b lang="en">${esc(surface)}</b>${speakBtn(surface)}<button type="button" class="icon-btn rd-pop-x" aria-label="Zamknij">${icon("x")}</button></div>
      <div class="rd-pop-pl muted">${name ? "Imię albo nazwa własna." : "Brak tego słowa w słowniczku."}</div>`;
    const head = e.src === "func" || e.src === "parts" ? surface : e.en.replace(/\((BrE|AmE)\)/g, "").split(/\s+[–—]\s+/)[0].trim(); // „shelf – shelves” → shelf
    const say = e.src === "func" || e.src === "parts" ? surface : rdVariants(e.en)[0] || surface;
    const also = res.entries.slice(1).filter((x, k, a) => !e.pl.includes(x.pl) && a.findIndex((y) => y.pl === x.pl) === k).slice(0, 3);
    const k = e.k && WORDS.has(e.k) ? e.k : null, inSrs = k && state.srs[k];
    const base = rdNorm(head) !== rdNorm(surface) ? `<span class="rd-pop-base" lang="en">${esc(head)}</span>` : "";
    return `<div class="rd-pop-h"><b lang="en">${esc(surface)}</b>${speakBtn(say)}<button type="button" class="icon-btn rd-pop-x" aria-label="Zamknij">${icon("x")}</button></div>
      ${base ? `<div class="rd-pop-from">forma podstawowa: ${base}</div>` : ""}
      <div class="rd-pop-pl">${esc(e.pl)}</div>
      ${also.length ? `<div class="rd-pop-also">też: ${also.map((x) => (rdNorm(x.en) !== rdNorm(e.en) ? `<span lang="en">${esc(x.en)}</span> – ` : "") + esc(x.pl)).join("; ")}</div>` : ""}
      <div class="rd-pop-src">${rdSrcLabel(e)}</div>
      ${k ? `<div class="rd-pop-act" data-k="${esc(k)}">${inSrs ? `<span class="rd-added">${icon("check")} W fiszkach · powtórka ${dueLabel(inSrs)}</span>` : `<button type="button" class="btn small rd-add">${icon("plus")} Dodaj do fiszek</button>`}</div>` : ""}`;
  }
  function rdPlacePop(page, pop, word) {
    const pr = page.getBoundingClientRect(), wr = word.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    pop.style.left = "0px"; pop.style.top = "0px";
    pop.style.width = `${Math.min(320, vw - 16)}px`; // 100vw w CSS liczyłoby też pasek przewijania
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = wr.left + wr.width / 2 - pw / 2;
    left = Math.max(8, Math.min(left, vw - pw - 8));
    const below = wr.bottom + 8 + ph <= innerHeight || wr.top - 8 - ph < 64;
    const top = below ? wr.bottom + 8 : wr.top - 8 - ph;
    pop.style.left = `${left - pr.left}px`;
    pop.style.top = `${top - pr.top}px`;
    pop.classList.toggle("above", !below);
  }
  function bindReading(id) {
    const page = $(".page.reading"), r = RD_BY_ID[id];
    if (!page || !r) return;
    const box = $("#rdQ");
    const run = () => {
      renderExercises(box, r.questions.map((ex) => ({ ex, lesson: r.lesson })), { key: rdKey(r) });
    };
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
    const text = page.querySelector(".rd-text");
    let pop = null, cur = null;
    const close = (focus) => {
      if (pop) { pop.remove(); pop = null; }
      if (cur) { cur.classList.remove("on"); cur.removeAttribute("aria-expanded"); if (focus) cur.focus(); cur = null; }
    };
    const open = (word, kb) => {
      close();
      const i = +word.dataset.w, res = rdLookup(r, i), { words } = rdParse(r);
      const span = res && res.len > 1 ? words.slice(res.from, res.from + res.len).map((x) => x.t).join(" ") : words[i].t;
      cur = word;
      word.classList.add("on");
      word.setAttribute("aria-expanded", "true");
      pop = document.createElement("div");
      pop.className = "card rd-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", `Tłumaczenie: ${span}`);
      pop.tabIndex = -1;
      pop.innerHTML = rdPopHtml(r, res, span);
      page.appendChild(pop);
      rdPlacePop(page, pop, word);
      if (kb) pop.focus();
    };
    text.addEventListener("click", (e) => {
      const w = e.target.closest(".rd-w");
      if (!w) return;
      if (w === cur) { close(); return; }
      open(w, e.detail === 0);
    });
    text.addEventListener("keydown", (e) => {
      const w = e.target.closest(".rd-w");
      if (!w) return;
      const all = [...text.querySelectorAll(".rd-w")], i = all.indexOf(w);
      const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key];
      if (to == null) { if (e.key === "Escape" && pop) { e.preventDefault(); close(true); } return; }
      e.preventDefault();
      const t = all[Math.max(0, Math.min(all.length - 1, to))];
      w.tabIndex = -1; t.tabIndex = 0; t.focus();
    });
    page.addEventListener("click", (e) => {
      if (!pop) return;
      if (e.target.closest(".rd-pop-x")) { close(true); return; }
      const add = e.target.closest(".rd-add");
      if (add) {
        const k = add.parentNode.dataset.k;
        if (!state.srs[k]) {
          state.srs[k] = { box: 1, due: today(), deck: RD_DECK.id, first: "", lastSeen: new Date().toISOString() };
          store.set("srs", state.srs);
          syncTodayCounts();
        }
        add.parentNode.innerHTML = `<span class="rd-added" tabindex="-1">${icon("check")} Dodano do fiszek · powtórka ${dueLabel(state.srs[k])}</span>`;
        pop.querySelector(".rd-added").focus();
        return;
      }
      if (!e.target.closest(".rd-pop") && !e.target.closest(".rd-w")) close();
    });
    page.addEventListener("keydown", (e) => { if (e.key === "Escape" && pop && pop.contains(e.target)) { e.preventDefault(); close(true); } });
    const onResize = () => { if (pop && cur) rdPlacePop(page, pop, cur); };
    window.addEventListener("resize", onResize);
    rdCleanup = () => window.removeEventListener("resize", onResize);
    const play = page.querySelector(".rd-play");
    if (play) play.addEventListener("click", () => { if (rdRun) rdStop(); else rdReadAloud(page); });
  }
  let rdCleanup = null;
  // Strona główna: najnowsza odblokowana czytanka bez wyniku.
  function rdNewHtml() {
    const fresh = READING.filter((x) => rdOpen(x) && !state.scores[rdKey(x)]);
    const r = fresh[fresh.length - 1];
    if (!r) return "";
    return `<a class="card rd-new" href="#/czytanki/${r.id}"><span class="f-ico">${icon("book-open")}</span>
      <span class="rd-new-txt"><b>Nowa czytanka: <span lang="en">${esc(r.title)}</span></b><span>${badge(r.level)} ${esc(r.titlePl)} · ${rdMeta(r)}${fresh.length > 1 ? ` · i ${fresh.length - 1} ${plural(fresh.length - 1, "inna czeka", "inne czekają", "innych czeka")} w Czytankach` : ""}</span></span>
      <span class="btn small primary">Czytaj →</span></a>`;
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
    const info = () => { $("#pInfo").textContent = `Dostępnych pytań: ${pool().length}` + (REACH_SRC.has(cfg.src) ? ` (${reachLabel()})` : ""); };
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
  const SRC = { all: "Wszystkie", choice: "Wybór i luki", write: "Pisanie zdań", order: "Układanie zdań", dictation: icon("headphones") + " Dyktando", finderr: icon("search") + " Znajdź błąd" };
  // Dyktando i „Znajdź błąd” w treningu: tylko lekcje do bieżącej włącznie (pierwsza nieprzerobiona na ścieżce) – żeby nie dawać zdań z gramatyką, której jeszcze nie było.
  const REACH_SRC = new Set(["dictation", "finderr"]);
  const reachIdx = () => { const i = PATH.findIndex((l) => !state.done[l.id]); return i < 0 ? PATH.length - 1 : i; };
  const reachLabel = () => reachIdx() ? `lekcje 1–${reachIdx() + 1}` : "lekcja 1";
  function renderPractice() {
    return `<div class="page">
      <div class="hero"><h1>${icon("target")} Trening mieszany</h1><p>Losowe zadania z wielu lekcji (sprawdzane od razu) – dobry sposób, żeby sprawdzić, czy umiesz rozpoznać właściwą konstrukcję, gdy nie wiesz, z jakiej lekcji jest zadanie.</p></div>
      ${setupHtml(practiceCfg, [10, 15, 25, 40], `<div><h3>Rodzaj zadań</h3><div class="chips" data-f="src">${Object.entries(SRC).map(([k, v]) => `<button class="chip ${practiceCfg.src === k ? "active" : ""}" data-v="${k}">${v}</button>`).join("")}</div></div>`)}
      <div id="pBox"></div>
    </div>`;
  }
  function bindPractice() {
    const reachable = () => lessonPool(practiceCfg).filter((l) => PATH.indexOf(l) <= reachIdx());
    // Dla „Znajdź błąd” pula to pary (każda da zdanie z błędem albo bez – feRound).
    const pool = () => practiceCfg.src === "dictation" ? reachable().flatMap((l) => l.dict.map((ex) => ({ ex, lesson: l })))
      : practiceCfg.src === "finderr" ? fePairs(reachable())
      : lessonPool(practiceCfg).flatMap((l) => [
      ...(l.exercises || []).map((ex) => ({ ex, lesson: l })),
      ...l.practice.flatMap((p) => (p.items || []).map((ex) => ({ ex: withTask(ex, ex.task || p.instruction), lesson: l }))),
    ]).filter(({ ex }) => practiceCfg.src === "all" || (practiceCfg.src === "choice" ? ["choice", "gap"].includes(ex.type) : ex.type === practiceCfg.src));
    const start = () => {
      const fe = practiceCfg.src === "finderr";
      const items = fe ? feRound(pool(), practiceCfg.count) : shuffle(pool()).slice(0, practiceCfg.count);
      const box = $("#pBox");
      const dict = practiceCfg.src === "dictation", cur = PATH[reachIdx()];
      if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.${dict || fe ? ` ${dict ? "Dyktando" : "„Znajdź błąd”"} obejmuje lekcje do bieżącej włącznie (teraz: ${lessonNo(cur)}. ${esc(cur.title)}).` : ""}</div>`; return; }
      box.innerHTML = exercisesShell("Pytania", { retryLabel: "Nowe losowanie" });
      const reachNote = ` Zdania z lekcji do bieżącej włącznie (${reachLabel()}, teraz: <a href="#/lesson/${cur.id}">${esc(cur.title)}</a>).`;
      if (dict) box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", dictIntro(reachNote));
      if (fe) box.querySelector(".ex-list").insertAdjacentHTML("beforebegin", feIntro(reachNote));
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
        <p class="cp-lessons"><b>Lekcje:</b> ${c.lessons.map((l) => `<a href="#/lesson/${l.id}">${lessonNo(l)}. ${doneTick(esc(l.title), state.done[l.id])}</a>`).join(" · ")}</p>
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
  const srcLabel = (x) => x.src === "e" ? "szybki sprawdzian" : x.src === "t" ? "test" : x.src === "d" ? "przykłady z lekcji" : x.src === "f" ? "typowe błędy z lekcji" : x.src === "o" ? "trener odmiany" : x.src === "r" ? `czytanka „${esc(x.reading.title)}”` : esc(stripTags((x.lesson.practice[+x.src.slice(1)] || {}).title || "ćwiczenia"));
  const dueLabel = (m) => {
    const d = Math.round((Date.parse(m.due) - Date.parse(today())) / DAY);
    return d <= 0 ? "<b>na dziś</b>" : d === 1 ? "jutro" : `za ${d} dni`;
  };
  const filteredMistakes = () => mistakeList().filter((x) => (!mistakesCfg.level || x.lesson.level === mistakesCfg.level) && (!mistakesCfg.lesson || x.lesson.id === mistakesCfg.lesson));
  // Pytanie do czytanki poza tekstem: polecenie z linkiem do czytanki (tekst otwiera się w tej samej karcie).
  const rdTaskHtml = (r) => `Pytanie do czytanki <a href="#/czytanki/${r.id}">„${esc(r.title)}”</a> (${esc(r.titlePl)})`;
  const sessionItems = (list) => shuffle(list).slice(0, SESSION_MAX).map((x) => ({ ex: x.src[0] === "p" ? withTask(x.ex, x.ex.task || x.instr) : x.src === "r" ? withTask(x.ex, rdTaskHtml(x.reading)) : x.ex, lesson: x.lesson }));

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
        <ul class="m-list">${xs.map((x) => { const q = x.ex.type === "dictation" ? stripTags(x.ex.pl || "Zapisz zdanie ze słuchu.") : (x.src === "o" ? stripTags(x.ex.task) + ": " : "") + stripTags(x.ex.q || "Ułóż zdanie z wyrazów."); return `<li><span class="m-q">${x.ex.type === "dictation" ? icon("headphones") + " " : x.ex.type === "finderr" ? icon("search") + " " : ""}${esc(q.length > 160 ? q.slice(0, 157) + "…" : q)}</span>
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
    const deckCount = (d) => d.manual ? `dodane: ${Object.values(state.srs).filter((e) => e.deck === d.id).length}` : `w powtórkach: ${inDeck(d)} z ${d.keys.length}`;
    return `<div class="card wd-settings"><span>Nowych słówek dziennie:</span><div class="chips">${NEW_CHOICES.map((n) => `<button class="chip ${state.srsNew === n ? "active" : ""}" data-wnew="${n}">${n}</button>`).join("")}</div></div>
      ${entries.length ? `<h2 class="section-title">Twoje pudełka (${slowek(entries.length)})</h2>
      <div class="wd-boxes">${boxes.map((n, i) => `<div class="card wd-box"><b>${n}</b><span>pudełko ${i + 1}</span><small>co ${daysLabel(SRS_DAYS[i])}</small></div>`).join("")}</div>
      <p class="muted-p">„Wiem” przenosi słówko do następnego pudełka, „Trudne” zostawia w tym samym, „Nie wiem” cofa do pudełka 1. W pudełkach 5–6 są słówka, które znasz już dobrze (${boxes[4] + boxes[5]}).</p>` : ""}
      ${q.decks.length ? `<h2 class="section-title">Skąd są słówka</h2>
      <p class="muted-p">Słownictwo lekcji dochodzi, gdy lekcja jest przerobiona. Dział słownictwa – gdy zaczniesz go ćwiczyć fiszkami albo oznaczysz w nim słówko jako znane (<a href="#/vocab">${icon("book")} Słownictwo</a>). Słówko, które powtarza się w kilku miejscach, uczysz się tylko raz. W czytankach możesz dodać do fiszek pojedyncze słowa (kliknij słowo → „Dodaj do fiszek”).</p>
      <div class="card wd-decks">${q.decks.map((d) => `<a class="wd-deck" href="${d.href}"><span class="wd-deck-t">${d.level ? badge(d.level) + " " : ""}${esc(d.title)}</span><span class="muted">${deckCount(d)}</span></a>`).join("")}</div>` : ""}`;
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
    return `<div class="page"><h1 class="search-h1">${icon("search")} Wyniki dla „${esc(q)}”</h1>
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
    if (rdCleanup) { rdCleanup(); rdCleanup = null; }
    prStop();
    rdStop();
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
    } else if (h.startsWith("#/czytanki/")) {
      const id = h.slice(11);
      content.innerHTML = renderReading(id); bindReading(id);
      title = RD_BY_ID[id] ? `${RD_BY_ID[id].title} – Czytanki` : `Czytanki – ${title}`;
    } else if (h.startsWith("#/czytanki")) {
      content.innerHTML = renderReadingHome(); title = `Czytanki – ${title}`;
    } else if (h.startsWith("#/czasy")) {
      content.innerHTML = renderTimeline(h.split("/").slice(2).join("/")); bindTimeline(); title = `Oś czasów – ${title}`;
    } else if (h.startsWith("#/odmiana")) {
      content.innerHTML = renderConj(h.split("/")[2] || ""); bindConj(); title = `Odmiana czasownika – ${title}`;
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
    const anchor = (h.startsWith("#/kolejnosc/") && document.getElementById(h.slice(12))) // np. #/kolejnosc/kopia
      || (h.startsWith("#/czasy/porownaj/") && document.getElementById("tlCmp"));
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
    const sb = e.target.closest(".speak[data-say]"); // .speak.mic (mikrofon) ma własną obsługę – data-pr
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
  // Telefon i tablet (do 960px): pole wyszukiwania schowane pod lupą, po otwarciu zakrywa pasek górny.
  const closeSearch = () => { const el = $("#search"); el.value = ""; el.blur(); document.body.classList.remove("search-open"); if (location.hash.startsWith("#/search/")) location.hash = "#/"; };
  $("#searchBtn").addEventListener("click", () => { document.body.classList.add("search-open"); $("#search").focus(); });
  $("#searchClose").addEventListener("click", closeSearch);
  const SEARCH_PH = $("#search").placeholder, PHONE = matchMedia("(max-width: 960px)");
  const syncSearchPh = () => { $("#search").placeholder = PHONE.matches ? "Szukaj tematu lub słówka…" : SEARCH_PH; };
  syncSearchPh(); PHONE.addEventListener("change", syncSearchPh);
  $("#search").addEventListener("blur", (e) => { if (!e.target.value.trim()) document.body.classList.remove("search-open"); });
  $("#search").addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#search").focus(); }
  });
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#backdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));
  // Ustawienia głosu: przycisk w pasku (bez syntezy mowy – ukryty) i linki [data-voice-open] w dyktandzie / wymowie.
  if ("speechSynthesis" in window) $("#voiceBtn").addEventListener("click", openVoiceDlg); else $("#voiceBtn").hidden = true;
  document.addEventListener("click", (e) => { if (e.target.closest("[data-voice-open]")) { e.preventDefault(); openVoiceDlg(); } });
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
  // Słowniki do opisu błędów (ok. 0,3 s) budujemy, gdy przeglądarka nic nie robi – nie przy pierwszym „Sprawdź”.
  if ("requestIdleCallback" in window) requestIdleCallback(() => errDicts(), { timeout: 8000 }); else setTimeout(errDicts, 3000);
  window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/search/")) { $("#search").value = ""; document.body.classList.remove("search-open"); } route(); });

  // Udostępnione do testów automatycznych (tools/).
  window.__ENG = { matches, expandAnswer, vocabMatch, variants, rdLookup, rdParse, READING };

  migrateKnown(state);
  migrateActivity(state);
  renderLevelFilter();
  route();
})();
