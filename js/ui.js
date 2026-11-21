// Wspólne drobiazgi widoków: $, tytuł strony, nazwy poziomów i kategorii, odznaki, wyniki, losowanie,
// polska odmiana liczebników (zadań, słówek, dni), przycisk „Posłuchaj”, id lekcji z adresu.
import { esc, stripTags } from "./util.js";
import { icon } from "./icons.js";

// ---------- Poziomy, kategorie, rodzaje zadań ----------
// Ostatnie słowo tytułu + ✓ w jednym kawałku – znaczek nie przeskakuje sam do nowej linii.
export const doneTick = (title, done) => (done ? title.replace(/\S+$/, (w) => `<span class="done-tick">${w}&nbsp;${icon("check")}</span>`) : title);
export const LEVEL_INFO = {
  A1: { name: "Początkujący", desc: "Podstawy: to be, proste czasy, liczba mnoga, zaimki, przyimki." },
  A2: { name: "Podstawowy", desc: "Codzienna komunikacja: przeszłość, przyszłość, stopniowanie, modalne." },
  B1: { name: "Średnio zaawansowany", desc: "Strona bierna, mowa zależna, tryby warunkowe, czasy perfect." },
  B2: { name: "Wyższy średnio zaawansowany", desc: "Dedukcja, mixed conditionals, wish, konstrukcje zaawansowane." },
};
export const CATEGORIES = [
  "Podstawy", "Czasy", "Formy czasownika", "Rzeczowniki i określniki", "Zaimki",
  "Przymiotniki i przysłówki", "Przyimki", "Czasowniki modalne", "Tryby warunkowe",
  "Konstrukcje zdaniowe", "Słownictwo i łączniki",
];
export const TYPE_LABEL = { choice: "wybór", gap: "luka", write: "pisanie zdania", order: "układanie zdania", dictation: "dyktando", finderr: "znajdź błąd" };

// ---------- Pomocnicze ----------
export const $ = (s, r = document) => r.querySelector(s);
export const SITE_TITLE = "Gramatyka angielska A1–B2";
export const slug = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const badge = (lvl) => `<span class="badge" data-level="${lvl}">${lvl}</span>`;
export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = (s) => Math.round((s.correct / s.total) * 100);
export const scorePill = (s) => s ? `<span class="pill ${pct(s) >= 80 ? "good" : pct(s) >= 50 ? "mid" : "low"}">${s.correct}/${s.total}</span>` : "";

// ---------- Przycisk „Posłuchaj” (kliknięcie obsługuje speech.js) ----------
// Uwaga: przekazuj tu wyłącznie tekst ANGIELSKI (tłumaczenia trzymamy w osobnych polach).
export const speakBtn = (text) => `<button class="speak" data-say="${esc(stripTags(text))}" title="Posłuchaj wymowy" aria-label="Posłuchaj">${icon("volume")}</button>`;

// ---------- Polska odmiana liczebników ----------
export const dni = (n) => `${n} ${n === 1 ? "dzień" : "dni"}`;
export const zadan = (n) => `${n} ${n === 1 ? "zadanie" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "zadania" : "zadań"}`;
export const plural = (n, one, few, many) => n === 1 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many;
export const slowek = (n) => `${n} ${plural(n, "słówko", "słówka", "słówek")}`;
export const daysLabel = (d) => `${d} ${d === 1 ? "dzień" : "dni"}`;

// ---------- Adres ----------
export function currentLessonId() { const m = location.hash.match(/^#\/lesson\/([\w-]+)/); return m ? m[1] : null; }
