(function () {
  "use strict";

  const LEVELS = ["A1", "A2", "B1", "B2"];
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
  const TYPE_LABEL = { choice: "wybór", gap: "luka", write: "pisanie zdania", order: "układanie zdania" };

  // ---------- Dane ----------
  const PRACTICE = window.PRACTICE || {};
  const raw = (window.LESSONS || []).map((l, i) => {
    const p = PRACTICE[l.id] || {};
    return { ...l, vocab: p.vocab || l.vocab || null, practice: p.practice || l.practice || [], test: p.test || l.test || [], requires: p.requires || l.requires || [], _i: i };
  });
  const catIdx = (c) => { const i = CATEGORIES.indexOf(c); return i < 0 ? 99 : i; };
  // Rekomendowana ścieżka: poziom → kategoria → kolejność w pliku
  const PATH = raw.slice().sort((a, b) =>
    LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || catIdx(a.category) - catIdx(b.category) || a._i - b._i);
  const BY_ID = Object.fromEntries(PATH.map((l) => [l.id, l]));
  const VOCAB = (window.VOCAB || []).slice().sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
  const VOCAB_BY_ID = Object.fromEntries(VOCAB.map((t) => [t.id, t]));
  const vocabItems = (t) => (t.groups || []).flatMap((g) => g.items || []);

  const stripTags = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const SEARCH_TEXT = Object.fromEntries(PATH.map((l) => [l.id, stripTags(JSON.stringify({ s: l.sections, v: l.vocab, t: l.summary })).toLowerCase()]));
  const HEAD_TEXT = Object.fromEntries(PATH.map((l) => [l.id, (l.title + " " + l.titlePl + " " + l.id.replace(/-/g, " ")).toLowerCase()]));
  const practiceCount = (l) => l.practice.reduce((s, p) => s + (p.items || []).length, 0);
  const allTasks = (l) => (l.exercises || []).length + practiceCount(l) + l.test.length;

  // ---------- Stan (localStorage) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("eng-" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("eng-" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const state = {
    done: store.get("done", {}),
    scores: store.get("scores", {}),
    levels: store.get("levels", LEVELS.slice()),
    showPl: store.get("showPl", true),
    known: store.get("known", {}),
  };
  const save = () => { for (const k of ["done", "scores", "levels", "showPl", "known"]) store.set(k, state[k]); };
  const saveScore = (key, correct, total) => {
    const prev = state.scores[key];
    if (!prev || correct / total >= prev.correct / prev.total) state.scores[key] = { correct, total };
    save();
  };

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
    const fullForm = (s) => { const t = s.split(/\s+/); return t.map((w, i) => { const v = tokenVariants(normalize(w), normalize(t[i + 1] || "")); return /'/.test(w) && v.length > 1 ? v[v.length - 1] : w; }).join(" "); };
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
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, btn) {
    if (!("speechSynthesis" in window)) { alert("Twoja przeglądarka nie obsługuje odczytu na głos."); return; }
    speechSynthesis.cancel();
    document.querySelectorAll(".speak.playing").forEach((b) => b.classList.remove("playing"));
    const say = stripTags(text).replace(/\s*\/\s*/g, ". ").replace(/[→=]/g, ". ").replace(/(^|\s)[–—](\s|$)/g, ". ");
    const u = new SpeechSynthesisUtterance(say);
    u.lang = voice ? voice.lang : "en-GB";
    if (voice) u.voice = voice;
    u.rate = 0.92;
    if (btn) { btn.classList.add("playing"); u.onend = u.onerror = () => btn.classList.remove("playing"); }
    speechSynthesis.speak(u);
  }
  // Uwaga: przekazuj tu wyłącznie tekst ANGIELSKI (tłumaczenia trzymamy w osobnych polach).
  const speakBtn = (text) => `<button class="speak" data-say="${esc(stripTags(text))}" title="Posłuchaj wymowy" aria-label="Posłuchaj">🔊</button>`;

  // ---------- Sidebar ----------
  function renderLevelFilter() {
    $("#levelFilter").innerHTML =
      `<button class="chip ${state.levels.length === 4 ? "active" : ""}" data-all>Wszystkie</button>` +
      LEVELS.map((l) => `<button class="chip ${state.levels.length < 4 && state.levels.includes(l) ? "active" : ""}" data-level="${l}">${l}</button>`).join("");
  }
  function renderNav() {
    const cur = currentLessonId();
    const h = location.hash;
    const quick = `<div class="nav-group nav-quick">
      <a class="nav-item ${h.startsWith("#/vocab") ? "active" : ""}" href="#/vocab"><span class="nav-ico">📚</span><span class="nav-title">Słownictwo</span></a>
      <a class="nav-item ${h.startsWith("#/tests") ? "active" : ""}" href="#/tests"><span class="nav-ico">📝</span><span class="nav-title">Testy – pisanie zdań</span></a>
      <a class="nav-item ${h.startsWith("#/practice") ? "active" : ""}" href="#/practice"><span class="nav-ico">🎯</span><span class="nav-title">Trening mieszany</span></a>
    </div>`;
    const groups = CATEGORIES.map((c) => {
      const items = PATH.filter((l) => l.category === c && state.levels.includes(l.level))
        .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a._i - b._i);
      if (!items.length) return "";
      return `<div class="nav-group"><div class="nav-group-title">${esc(c)}</div>` +
        items.map((l) => `<a class="nav-item ${l.id === cur ? "active" : ""}" href="#/lesson/${l.id}">
          ${badge(l.level)}<span class="nav-title">${esc(l.title)}</span>${state.done[l.id] ? '<span class="done-mark" title="Przerobione">✓</span>' : ""}</a>`).join("") +
        `</div>`;
    }).join("");
    $("#nav").innerHTML = quick + (groups || `<div class="nav-empty">Brak lekcji dla wybranych poziomów.</div>`);
    const active = $("#nav .nav-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  // ---------- Strona główna ----------
  function renderHome() {
    const nEx = PATH.reduce((s, l) => s + l.sections.filter((x) => x.type === "examples").reduce((a, x) => a + x.items.length, 0), 0);
    const nTasks = PATH.reduce((s, l) => s + allTasks(l), 0);
    const nWords = VOCAB.reduce((s, t) => s + vocabItems(t).length, 0);
    const nDone = PATH.filter((l) => state.done[l.id]).length;
    const next = PATH.find((l) => !state.done[l.id]);
    const overview = BY_ID["tenses-overview"];
    if (!PATH.length) return `<div class="page empty"><h1>Brak lekcji</h1><p>Nie znaleziono plików z danymi w folderze <code>data/</code>.</p></div>`;

    return `<div class="page">
      <section class="hero">
        <h1>Gramatyka angielska<br>od A1 do B2</h1>
        <p>Wszystkie najważniejsze tematy wyjaśnione po polsku: czasy, czasowniki modalne, tryby warunkowe, strona bierna i dużo więcej. Każda lekcja ma budowę, mnóstwo przykładów z tłumaczeniem, słownictwo, zestawy ćwiczeń i test z pisaniem całych zdań.</p>
        <div class="hero-actions">
          ${next ? `<a class="btn primary" href="#/lesson/${next.id}">${nDone ? "Kontynuuj" : "Zacznij od początku"}: ${esc(next.title)} →</a>` : `<a class="btn primary" href="#/practice">Wszystko przerobione! Trenuj →</a>`}
          ${overview ? `<a class="btn" href="#/lesson/tenses-overview">🗺️ Przegląd wszystkich czasów</a>` : ""}
        </div>
      </section>
      <div class="stats">
        <div class="stat"><b>${PATH.length}</b><span>lekcji</span></div>
        <div class="stat"><b>${nEx}</b><span>przykładów zdań</span></div>
        <div class="stat"><b>${nTasks}</b><span>zadań i pytań testowych</span></div>
        <div class="stat"><b>${nWords}</b><span>słówek w ${VOCAB.length} działach</span></div>
      </div>
      <div class="feature-cards">
        <a class="card feature" href="#/vocab"><span class="f-ico">📚</span><b>Słownictwo</b><span>Słówka tematyczne A1–B2: lista z wymową, fiszki i quizy.</span></a>
        <a class="card feature" href="#/tests"><span class="f-ico">📝</span><b>Testy</b><span>Tłumaczenie i przekształcanie całych zdań – sprawdzanie na końcu.</span></a>
        <a class="card feature" href="#/practice"><span class="f-ico">🎯</span><b>Trening mieszany</b><span>Losowe zadania z wielu lekcji – czy rozpoznasz konstrukcję?</span></a>
      </div>
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
              ${state.done[l.id] ? '<span class="done-mark">✓</span>' : ""}<span>${esc(l.title)}</span><span class="pl">${esc(l.titlePl)}</span></a></li>`).join("")}</ul>
          </div>`;
        }).join("")}
      </div>
      <h2 class="section-title">Jak korzystać</h2>
      <div class="howto">
        <div><b>1. Słówka i teoria</b>Zacznij od zakładki „Słownictwo” w lekcji, potem przeczytaj teorię. Kliknij 🔊, żeby usłyszeć wymowę.</div>
        <div><b>2. Ćwiczenia</b>Zestawy od łatwych do trudnych: wybór, luki, układanie zdań, przekształcenia. Każde zadanie ma wyjaśnienie.</div>
        <div><b>3. Test</b>Na koniec napisz całe zdania sam(a). Wynik i poprawki zobaczysz po zakończeniu testu.</div>
      </div>
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
        return `<section class="block" id="${id}"><div class="callout ${s.type}"><h3>${s.type === "tip" ? "💡 " : "⚠️ "}${s.title || (s.type === "tip" ? "Wskazówka" : "Uwaga")}</h3><div class="prose">${s.html}</div></div></section>`;
      case "mistakes":
        return `<section class="block">${h(sectionTitle(s, "Typowe błędy"))}<div class="mistakes">${(s.items || []).map((m) => `
          <div class="card mistake">
            <div class="mistake-row"><span class="m-icon" style="color:var(--bad)">✗</span><span class="wrong">${m.wrong}</span></div>
            <div class="mistake-row"><span class="m-icon" style="color:var(--ok)">✓</span><span class="right">${m.right}</span>${speakBtn(m.right)}</div>
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
    const hint = ex.hint ? `<div class="ex-hint">💡 ${ex.hint}</div>` : "";
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
      fb.innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${ok ? "✓ Dobrze!" : "✗ Niestety."}</span>${extra || ""} <span class="explain">${ex.explain || ""}</span></div>`;
    };
    const ctl = { ex, card, result: null };
    const finish = (res) => {
      if (done) return; done = true;
      ctl.result = res;
      ctl.lock();
      if (actions) actions.innerHTML = "";
      show(res.ok, res.extra);
      if (ex.type === "write" && !res.ok && res.given) {
        const b = document.createElement("button");
        b.className = "btn small accept"; b.textContent = "✓ Moja odpowiedź też jest poprawna";
        b.title = "Automat zna tylko podane warianty. Jeśli jesteś pewien/pewna, że Twoje zdanie jest poprawne – zalicz je.";
        b.addEventListener("click", () => {
          b.remove(); card.classList.remove("wrong"); card.classList.add("correct");
          fb.querySelector(".feedback").className = "feedback ok";
          fb.querySelector(".verdict").textContent = "✓ Zaliczone (samoocena).";
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

    if (ex.type === "write") {
      const ta = card.querySelector(".w-input");
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
        const extra = ok
          ? ` ${speakBtn(v)}${(() => { const o = ex.answers.filter((a) => !matches(v, [a])).map((a) => esc(displayAnswer(a))); return o.length ? `<div class="muted">Inne poprawne wersje: ${o.join(" · ")}</div>` : ""; })()}`
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
      if (opts.onDone) opts.onDone(correct, total);
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
    const report = (ctl, upgrade, onlyProgress) => {
      if (onlyProgress) { updateScore(); return; }
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
      <button class="btn primary check-all" style="display:none">Zakończ i sprawdź ✓</button>
      <div class="result-slot"></div>
      <div class="ex-footer"><button class="btn retry">↻ ${opts.retryLabel || "Od nowa"}</button>${opts.extraBtn || ""}</div>
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
          <button class="v-known" title="Oznacz jako znane">✓</button>
        </div>`).join("")}</div>`).join("");
  }

  function vocabBlockHtml(groups, key, opts = {}) {
    const n = groups.reduce((s, g) => s + (g.items || []).length, 0);
    const k = Object.keys(knownSet(key)).length;
    return `<div class="vocab-block ${state.showPl ? "" : "hide-pl"}" data-vkey="${esc(key)}">
      <div class="v-toolbar">
        <div class="seg">
          <button class="seg-btn active" data-vmode="list">📋 Lista</button>
          <button class="seg-btn" data-vmode="cards">🃏 Fiszki</button>
          <button class="seg-btn" data-vmode="quiz-en">✍️ Wpisz po angielsku</button>
          <button class="seg-btn" data-vmode="quiz-pl">🔤 Wybierz znaczenie</button>
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
      row.classList.toggle("known", !!known[w]); save(); refreshK();
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

  function runFlashcards(pane, items, key, refreshK) {
    const known = knownSet(key);
    let dir = "en"; // co widać na awersie
    let onlyUnknown = items.some((w) => !known[stripTags(w.en)]);
    let queue, i, okN, badN;
    const start = () => {
      const pool = onlyUnknown ? items.filter((w) => !known[stripTags(w.en)]) : items;
      queue = shuffle(pool.length ? pool : items); i = 0; okN = 0; badN = 0; draw();
    };
    const draw = () => {
      if (i >= queue.length) {
        pane.innerHTML = `<div class="card fc-done"><b>Koniec talii! 🎉</b><p>Wiem: ${okN} · Do powtórki: ${badN}</p>
          <button class="btn primary fc-again">↻ Jeszcze raz (nieznane)</button> <button class="btn fc-all">Cała talia</button></div>`;
        pane.querySelector(".fc-again").onclick = () => { onlyUnknown = true; start(); };
        pane.querySelector(".fc-all").onclick = () => { onlyUnknown = false; start(); };
        return;
      }
      const w = queue[i];
      const front = dir === "en" ? `<div class="fc-word">${w.en}</div>` : `<div class="fc-word">${w.pl}</div>`;
      const back = dir === "en" ? `<div class="fc-word">${w.pl}</div>` : `<div class="fc-word">${w.en}</div>`;
      pane.innerHTML = `<div class="fc-top"><span>${i + 1} / ${queue.length}</span>
          <label class="toggle"><input type="checkbox" class="fc-dir" ${dir === "pl" ? "checked" : ""}> Najpierw po polsku</label>
          <label class="toggle"><input type="checkbox" class="fc-only" ${onlyUnknown ? "checked" : ""}> Tylko nieznane</label></div>
        <div class="card flashcard" tabindex="0" title="Kliknij lub naciśnij spację, aby odwrócić">
          <div class="fc-front">${front}<div class="fc-hint">kliknij, aby odwrócić</div></div>
          <div class="fc-back" hidden>${back}${w.ex ? `<div class="fc-ex"><i>${w.ex}</i>${w.exPl ? `<br><span>${w.exPl}</span>` : ""}</div>` : ""}</div>
        </div>
        <div class="fc-actions">${speakBtn(w.en)}<button class="btn fc-bad">✗ Jeszcze nie</button><button class="btn primary fc-ok">✓ Wiem</button></div>`;
      const card = pane.querySelector(".flashcard");
      const flip = () => { pane.querySelector(".fc-front").hidden = !pane.querySelector(".fc-front").hidden; pane.querySelector(".fc-back").hidden = !pane.querySelector(".fc-back").hidden; };
      card.onclick = flip;
      card.onkeydown = (e) => { if (e.key === " ") { e.preventDefault(); flip(); } };
      pane.querySelector(".fc-ok").onclick = () => { known[stripTags(w.en)] = 1; okN++; save(); refreshK(); markRow(w, true); i++; draw(); };
      pane.querySelector(".fc-bad").onclick = () => { delete known[stripTags(w.en)]; badN++; save(); refreshK(); markRow(w, false); queue.push(w); i++; draw(); };
      pane.querySelector(".fc-dir").onchange = (e) => { dir = e.target.checked ? "pl" : "en"; draw(); };
      pane.querySelector(".fc-only").onchange = (e) => { onlyUnknown = e.target.checked; start(); };
      card.focus({ preventScroll: true });
    };
    const markRow = (w, k) => {
      const row = pane.closest(".vocab-block").querySelector(`.vrow[data-en="${CSS.escape(stripTags(w.en))}"]`);
      if (row) row.classList.toggle("known", k);
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
        card.querySelector(".fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span class="verdict">${ok ? "✓ Dobrze!" : "✗"}</span> <b>${ex.en}</b> ${speakBtn(ex.en)} ${ex.explain ? `<div class="muted">${ex.explain}</div>` : ""}</div>`;
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
    btn.textContent = d ? "✓ Przerobione" : "Oznacz jako przerobione";
  }
  const TABS = [
    { id: "", label: "📖 Lekcja" },
    { id: "vocab", label: "🔤 Słownictwo", count: (l) => (l.vocab && l.vocab.items || []).length },
    { id: "practice", label: "✍️ Ćwiczenia", count: (l) => (l.exercises || []).length + practiceCount(l) },
    { id: "test", label: "📝 Test", count: (l) => l.test.length },
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
        ${next ? `<a class="card next" href="#/lesson/${next.id}"><small>Następna →</small>${badge(next.level)} ${esc(next.title)}</a>` : ""}
      </div>
    </article>`;
  }

  function renderLessonTheory(l) {
    const titled = l.sections.map((s, i) => ({ s, i })).filter(({ s }) => s.title || ["formula", "examples", "mistakes"].includes(s.type));
    const req = (l.requires || []).map((r) => BY_ID[r]).filter(Boolean);
    const v = l.vocab && l.vocab.items || [];
    const prep = req.length || v.length ? `<div class="card prep">
        <h3>🧳 Zanim zaczniesz</h3>
        ${req.length ? `<p><b>Powinieneś znać:</b> ${req.map((r) => `<a href="#/lesson/${r.id}">${esc(r.title)}</a>${state.done[r.id] ? " ✓" : ""}`).join(", ")}</p>` : ""}
        ${v.length ? `<p><b>Słówka potrzebne w tej lekcji</b> (${v.length}): ${v.slice(0, 14).map((w) => `<span class="w-chip" title="${esc(stripTags(w.pl))}">${w.en}</span>`).join(" ")}${v.length > 14 ? " …" : ""}</p>
        <a class="btn small" href="#/lesson/${l.id}/vocab">🔤 Przećwicz słówka →</a>` : ""}
      </div>` : "";
    const nPractice = practiceCount(l);
    return `
      <div class="toolbar">
        <label class="toggle"><input type="checkbox" id="plToggle" ${state.showPl ? "checked" : ""}> Pokaż tłumaczenia</label>
        <span class="spacer"></span>
        <a class="btn small" href="#exercises" data-scroll="exercises">✍️ Sprawdzian (${(l.exercises || []).length})</a>
        <button class="btn small" id="doneBtn"></button>
      </div>
      <nav class="toc">${titled.map(({ s, i }) => `<a href="#s-${i}-${slug(s.title || s.type)}" data-scroll="s-${i}-${slug(s.title || s.type)}">${stripTags(s.title || (s.type === "formula" ? "Budowa" : s.type === "examples" ? "Przykłady" : "Typowe błędy"))}</a>`).join("")}</nav>
      ${prep}
      ${l.sections.map(renderSection).join("")}
      ${exercisesShell("Szybki sprawdzian", { id: "exercises" })}
      ${nPractice || l.test.length ? `<div class="card next-steps"><b>Co dalej?</b>
        ${nPractice ? `<a class="btn" href="#/lesson/${l.id}/practice">✍️ Więcej ćwiczeń (${nPractice})</a>` : ""}
        ${l.test.length ? `<a class="btn primary" href="#/lesson/${l.id}/test">📝 Test – pisanie zdań (${l.test.length})</a>` : ""}</div>` : ""}`;
  }

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
      ${l.test.length ? `<div class="card next-steps"><b>Gotowe?</b><a class="btn primary" href="#/lesson/${l.id}/test">📝 Przejdź do testu (${l.test.length})</a></div>` : ""}
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

  function bindLesson(id) {
    const l = BY_ID[id]; if (!l) return;
    const tab = lessonTab();
    const art = $("#lesson");
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
          const run = () => renderExercises(box, s.items.map((ex) => ({ ex: { ...ex, task: ex.task || "" } })), {
            key: s.key,
            onDone: (c, t) => {
              d.querySelector(".set-meta").innerHTML = `${s.items.length} zad. ${scorePill(state.scores[s.key])}`;
              if (s.quick && c / t >= 0.8) { state.done[id] = true; save(); renderNav(); }
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
    if (tab === "test" && l.test.length) {
      const box = $("#testBox").firstElementChild;
      const run = () => renderExercises(box, l.test.map((ex) => ({ ex })), { key: l.id + "::test", mode: "deferred" });
      run();
      box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView({ behavior: "smooth" }); });
      return;
    }
    $("#plToggle").addEventListener("change", (e) => { state.showPl = e.target.checked; save(); art.classList.toggle("hide-pl", !state.showPl); });
    const doneBtn = $("#doneBtn"); syncDoneBtn(doneBtn, id);
    doneBtn.addEventListener("click", () => { state.done[id] = !state.done[id]; if (!state.done[id]) delete state.done[id]; save(); syncDoneBtn(doneBtn, id); renderNav(); });
    const box = $("#exercises");
    const run = () => renderExercises(box, (l.exercises || []).map((ex) => ({ ex, lesson: l })), {
      key: id,
      onDone: (c, t) => { if (c / t >= 0.8) { state.done[id] = true; save(); renderNav(); syncDoneBtn(doneBtn, id); } },
    });
    run();
    box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
  }

  // ---------- Słownictwo: działy tematyczne ----------
  let vocabLevels = LEVELS.slice();
  function renderVocabHome() {
    const list = VOCAB.filter((t) => vocabLevels.includes(t.level));
    return `<div class="page">
      <div class="hero"><h1>📚 Słownictwo</h1><p>Słówka, które trzeba znać na poziomach A1–B2, pogrupowane tematycznie. W każdym dziale: lista z wymową i przykładami, fiszki oraz dwa rodzaje quizu. Oznaczaj słowa, które już znasz – postęp zapisuje się w przeglądarce.</p></div>
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
        <div class="crumbs" data-level="${t.level}"><a href="#/vocab">📚 Słownictwo</a> · ${badge(t.level)} <span>${LEVEL_INFO[t.level].name}</span></div>
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
    const info = () => { $("#pInfo").textContent = `Dostępnych pytań: ${pool().length}`; };
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
  const SRC = { all: "Wszystkie", choice: "Wybór i luki", write: "Pisanie zdań", order: "Układanie zdań" };
  function renderPractice() {
    return `<div class="page">
      <div class="hero"><h1>🎯 Trening mieszany</h1><p>Losowe zadania z wielu lekcji (sprawdzane od razu) — dobry sposób, żeby sprawdzić, czy umiesz rozpoznać właściwą konstrukcję, gdy nie wiesz, z jakiej lekcji jest zadanie.</p></div>
      ${setupHtml(practiceCfg, [10, 15, 25, 40], `<div><h3>Rodzaj zadań</h3><div class="chips" data-f="src">${Object.entries(SRC).map(([k, v]) => `<button class="chip ${practiceCfg.src === k ? "active" : ""}" data-v="${k}">${v}</button>`).join("")}</div></div>`)}
      <div id="pBox"></div>
    </div>`;
  }
  function bindPractice() {
    const pool = () => lessonPool(practiceCfg).flatMap((l) => [
      ...(l.exercises || []).map((ex) => ({ ex, lesson: l })),
      ...l.practice.flatMap((p) => (p.items || []).map((ex) => ({ ex: { ...ex, task: ex.task || p.instruction }, lesson: l }))),
    ]).filter(({ ex }) => practiceCfg.src === "all" || (practiceCfg.src === "choice" ? ["choice", "gap"].includes(ex.type) : ex.type === practiceCfg.src));
    const start = () => {
      const items = shuffle(pool()).slice(0, practiceCfg.count);
      const box = $("#pBox");
      if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.</div>`; return; }
      box.innerHTML = exercisesShell("Pytania", { retryLabel: "Nowe losowanie" });
      renderExercises(box.firstElementChild, items, { showSource: true });
      box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
      box.scrollIntoView();
    };
    bindSetup(practiceCfg, pool, start);
  }

  // ---------- Testy (pisanie zdań, sprawdzanie na końcu) ----------
  let testCfg = { levels: LEVELS.slice(), cats: [], count: 20 };
  function renderTests() {
    const perLevel = LEVELS.map((lv) => ({ lv, n: PATH.filter((l) => l.level === lv).reduce((s, l) => s + l.test.length, 0) }));
    return `<div class="page">
      <div class="hero"><h1>📝 Testy</h1><p>Test składa się głównie z zadań, w których <b>samodzielnie piszesz całe zdania</b>: tłumaczenie z polskiego, przekształcanie (np. na stronę bierną, mowę zależną), poprawianie błędów i układanie zdań. Wynik zobaczysz dopiero na końcu – jak na prawdziwym sprawdzianie.</p></div>
      <div class="level-test-row">${perLevel.filter((x) => x.n).map((x) => `<button class="card level-test" data-level="${x.lv}" data-lv="${x.lv}">${badge(x.lv)} <b>Test poziomu ${x.lv}</b><span>20 losowych zadań z ${x.n}</span>${scorePill(state.scores["test-level:" + x.lv])}</button>`).join("")}</div>
      <h2 class="section-title">Własny test</h2>
      ${setupHtml(testCfg, [10, 20, 30, 50])}
      <div id="pBox"></div>
      <h2 class="section-title">Testy z poszczególnych lekcji</h2>
      <div class="results-list">${PATH.filter((l) => l.test.length).map((l) => `<a class="card result-item test-link" href="#/lesson/${l.id}/test"><h3>${badge(l.level)} ${esc(l.title)} <span class="muted" style="font-family:Inter;font-size:14px;font-weight:400">${l.test.length} zadań</span> ${scorePill(state.scores[l.id + "::test"])}</h3></a>`).join("") || `<div class="empty">Brak testów.</div>`}</div>
    </div>`;
  }
  function bindTests() {
    const poolFor = (cfg) => lessonPool(cfg).flatMap((l) => l.test.map((ex) => ({ ex, lesson: l })));
    const run = (items, key, title) => {
      const box = $("#pBox");
      if (!items.length) { box.innerHTML = `<div class="empty">Brak pytań dla wybranych filtrów.</div>`; return; }
      box.innerHTML = exercisesShell(title, { retryLabel: "Nowy test" });
      renderExercises(box.firstElementChild, items, { showSource: true, mode: "deferred", key });
      return box;
    };
    const start = () => {
      const box = run(shuffle(poolFor(testCfg)).slice(0, testCfg.count), null, "Test");
      if (!box) return;
      box.querySelector(".retry").addEventListener("click", () => { start(); box.scrollIntoView(); });
      box.scrollIntoView();
    };
    bindSetup(testCfg, () => poolFor(testCfg), start);
    document.querySelectorAll(".level-test").forEach((b) => b.addEventListener("click", () => {
      const lv = b.dataset.lv;
      const go = () => {
        const box = run(shuffle(poolFor({ levels: [lv], cats: [] })).slice(0, 20), "test-level:" + lv, `Test poziomu ${lv}`);
        if (!box) return;
        box.querySelector(".retry").addEventListener("click", () => { go(); box.scrollIntoView(); });
        box.scrollIntoView();
      };
      go();
    }));
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
    let title = "Gramatyka angielska A1–B2";
    const sameLesson = currentLessonId() && lastRoute === currentLessonId();
    if (h.startsWith("#/lesson/")) {
      const id = currentLessonId();
      content.innerHTML = renderLesson(id); bindLesson(id);
      if (BY_ID[id]) title = `${BY_ID[id].title} – ${title}`;
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
    } else if (h.startsWith("#/search/")) {
      const q = decodeURIComponent(h.slice(9));
      content.innerHTML = renderSearch(q); title = `Szukaj: ${q}`;
    } else {
      content.innerHTML = renderHome();
    }
    document.title = title;
    // Przy przełączaniu zakładek tej samej lekcji zostajemy przy nagłówku zamiast skakać na górę.
    const tabsEl = $(".tabs");
    if (sameLesson && tabsEl && window.scrollY > tabsEl.offsetTop) tabsEl.scrollIntoView();
    else window.scrollTo(0, 0);
    lastRoute = currentLessonId() || "";
    renderNav();
  }

  // ---------- Zdarzenia globalne ----------
  document.addEventListener("click", (e) => {
    const sb = e.target.closest(".speak");
    if (sb) { e.preventDefault(); e.stopPropagation(); speak(sb.dataset.say, sb); return; }
    const pl = e.target.closest(".hide-pl .ex-pl");
    if (pl) { pl.classList.toggle("revealed"); return; }
    const sc = e.target.closest("[data-scroll]");
    if (sc) { e.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: "smooth" }); }
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
  });
  window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/search/")) $("#search").value = ""; route(); });

  // Udostępnione do testów automatycznych (tools/).
  window.__ENG = { matches, expandAnswer, vocabMatch, variants };

  renderLevelFilter();
  route();
})();
