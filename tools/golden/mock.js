// Atrapy do zdjęcia wzorcowego: stała data, powtarzalny Math.random, lektor, stan localStorage, zbieranie błędów.
(function () {
  const P = new URLSearchParams(location.search);
  const ST = P.get("__t"), SCN = P.get("scn"), KEEP_SW = P.get("sw") === "1";
  window.__errs = [];
  window.__spoken = [];
  const err = (m) => window.__errs.push(String(m).slice(0, 400));
  addEventListener("error", (e) => {
    if (e.target && e.target !== window && (e.target.src || e.target.href)) err("resource: " + (e.target.src || e.target.href));
    else err("error: " + (e.message || e) + " @" + (e.filename || "") + ":" + (e.lineno || ""));
  }, true);
  addEventListener("unhandledrejection", (e) => err("rejection: " + (e.reason && (e.reason.stack || e.reason))));
  const ce = console.error.bind(console), cw = console.warn.bind(console);
  console.error = (...a) => { err("console.error: " + a.join(" ")); ce(...a); };
  console.warn = (...a) => { err("console.warn: " + a.join(" ")); cw(...a); };

  // Stała data: 21.11.2026, 10:00 czasu lokalnego (Date() bez argumentów i Date.now()).
  const RealDate = Date;
  let FIXED = new RealDate(2026, 10, 21, 10, 0, 0).getTime();
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(FIXED); }
    static now() { return FIXED; }
  }
  window.Date = FakeDate;
  window.__setNow = (t) => { FIXED = t; };

  // Powtarzalny Math.random (mulberry32).
  let seed = 12345;
  Math.random = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // Lektor: dwa głosy, speak() kończy się po chwili.
  class Utt extends EventTarget {
    constructor(t) { super(); this.text = t; this.lang = ""; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1; }
  }
  const fire = (u, type, extra) => { const e = new Event(type); Object.assign(e, extra || {}); u.dispatchEvent(e); if (typeof u["on" + type] === "function") u["on" + type](e); };
  const voices = [
    { name: "Mock English (United Kingdom) Female", lang: "en-GB", voiceURI: "mock-gb", localService: true, default: true },
    { name: "Mock English (United States) Male", lang: "en-US", voiceURI: "mock-us", localService: true, default: false },
  ];
  const synth = new EventTarget();
  let cur = null, timers = [];
  Object.assign(synth, {
    speaking: false, pending: false, paused: false,
    getVoices: () => voices.slice(),
    speak(u) {
      window.__spoken.push((u.voice ? u.voice.lang : "-") + "|" + u.rate + "|" + u.pitch + "|" + u.text);
      cur = u; synth.speaking = true;
      timers.push(setTimeout(() => { fire(u, "start"); timers.push(setTimeout(() => { if (cur === u) { cur = null; synth.speaking = false; } fire(u, "end"); }, 60)); }, 10));
    },
    cancel() { timers.forEach(clearTimeout); timers = []; const u = cur; cur = null; synth.speaking = false; if (u) fire(u, "error", { error: "interrupted" }); },
    pause() {}, resume() {},
  });
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = Utt;
  try { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; } catch (e) {}
  window.webkitSpeechRecognition = undefined; window.SpeechRecognition = undefined;
  // Rozpoznawanie mowy (sr=1): start() po chwili „słyszy” window.__srSay (domyślnie: zdanie z przycisku – ostatni start),
  // potem onend; abort() – onerror "aborted" + onend. Zapis wywołań w window.__sr.
  if (P.get("sr") === "1") {
    window.__sr = [];
    window.SpeechRecognition = class {
      constructor() { this.lang = ""; this.t = []; }
      start() {
        window.__sr.push("start|" + this.lang);
        this.t.push(setTimeout(() => {
          const said = window.__srSay != null ? window.__srSay : "";
          const res = [{ transcript: said, confidence: 0.9 }];
          if (this.onresult) this.onresult({ results: [res], resultIndex: 0 });
          this.t.push(setTimeout(() => { if (this.onend) this.onend(); }, 20));
        }, 200));
      }
      stop() { window.__sr.push("stop"); }
      abort() {
        window.__sr.push("abort");
        this.t.forEach(clearTimeout); this.t = [];
        if (this.onerror) this.onerror({ error: "aborted" });
        if (this.onend) this.onend();
      }
    };
  }

  if (!KEEP_SW) { try { delete Navigator.prototype.serviceWorker; } catch (e) {} }

  // Stan localStorage przed startem aplikacji.
  const RAW = ["eng-theme"];
  try {
    localStorage.clear();
    if (ST && ST !== "new") {
      const x = new XMLHttpRequest();
      x.open("GET", "/__t/state-" + ST + ".json", false);
      x.send();
      const data = JSON.parse(x.responseText);
      for (const [k, v] of Object.entries(data)) localStorage.setItem(k, RAW.includes(k) ? String(v) : JSON.stringify(v));
    }
  } catch (e) { err("seed: " + e); }

  const lsDump = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return Object.fromEntries(Object.entries(o).sort()); };
  window.__lsDump = lsDump;
  const out = (obj) => {
    const pre = document.createElement("pre");
    pre.id = "__gm";
    pre.textContent = JSON.stringify(obj, null, 1);
    document.body.appendChild(pre);
  };
  window.__sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  addEventListener("load", () => setTimeout(async () => {
    if (!SCN) { out({ title: document.title, errors: window.__errs, spoken: window.__spoken, ls: lsDump() }); return; }
    let res;
    try {
      const get = (u) => { const x = new XMLHttpRequest(); x.open("GET", u, false); x.send(); return x.responseText; };
      (0, eval)(get("/__t/lib.js"));
      res = await (0, eval)(get("/__t/scn-" + SCN + ".js"))();
    } catch (e) { res = { crash: String(e && e.stack || e), log: window.LOG }; }
    out({ scenario: SCN, result: res, errors: window.__errs, spoken: window.__spoken, ls: lsDump() });
  }, 1500));
})();
