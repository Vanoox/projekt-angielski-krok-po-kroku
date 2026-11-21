// Daty jako tekst „RRRR-MM-DD” w czasie lokalnym (dziennik nauki, terminy powtórek).
// Funkcje z „dzisiejszą” datą przyjmują ją jako ostatni argument (domyślnie teraz) – w testach podaje się stałą datę.

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
export const DAY = 864e5; // milisekundy w dobie
export const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const today = (now = new Date()) => dayStr(now);
// Dzień za n dni od now (n < 0 – wstecz).
export const addDays = (n, now = new Date()) => { const d = new Date(now); d.setDate(d.getDate() + n); return dayStr(d); };
// „RRRR-MM-DD” → Date (północ czasu lokalnego).
export const dayDate = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
export const shiftDay = (k, n) => { const d = dayDate(k); d.setDate(d.getDate() + n); return dayStr(d); };
