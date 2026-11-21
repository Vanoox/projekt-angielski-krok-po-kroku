// Wspólne stałe i drobne funkcje bez DOM (używane przez app.js i moduły logiki).

/** @type {Level[]} */
export const LEVELS = ["A1", "A2", "B1", "B2"];

/** HTML → zwykły tekst (znaczniki zamienione na spacje, pojedyncze odstępy). @param {unknown} s @returns {string} */
export const stripTags = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** Krótki skrót tekstu (FNV-1a, zapis w systemie 36) – klucze zadań w „Moich błędach”, rozkład terminów. @param {string} s @returns {string} */
export const hashStr = (s) => { let x = 0x811c9dc5; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193); } return (x >>> 0).toString(36); };

/** @type {Dict<string>} */
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
/** Tekst do wstawienia w HTML (treść od użytkownika, nazwy z danych w atrybutach). @param {unknown} s @returns {string} */
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ESC[c]);

/** Zwykły obiekt (nie null i nie tablica). @param {unknown} v @returns {v is Record<string, any>} */
export const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
