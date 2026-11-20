// Service worker – strona działa bez internetu i da się ją zainstalować na telefonie.
// Leży w katalogu głównym, bo obejmuje tylko pliki ze swojego katalogu i niżej.
//
// Część między BUILD:START i BUILD:END wpisuje `node tools/build-index.js` – nie edytuj jej ręcznie.
// VERSION to skrót treści wszystkich plików z SHELL, więc zmienia się przy każdej zmianie strony.
// Przeglądarka sama sprawdza, czy sw.js się zmienił; nowa wersja pobiera pliki w tle, a strona
// pokazuje pasek „Jest nowa wersja” (js/app.js, initOffline). Po kliknięciu „Odśwież” nowa wersja
// przejmuje stronę i ta się przeładowuje.
//
// Strategia:
//  - „app shell” (index.html, CSS, app.js, data/bundle.js, manifest, ikony) – z pamięci podręcznej,
//    bez czekania na sieć. Adresy mają ?v=<hash>, więc pod danym adresem plik się nie zmienia;
//    aktualizacja przychodzi w tle razem z nowym sw.js (nowa VERSION = nowa paczka plików).
//  - fonty Google – z pamięci podręcznej, a gdy ich brak – z sieci (i zapis na później).
//  - downloads/ (talia Anki, 51 MB) – zawsze z sieci, nigdy do pamięci podręcznej.
//  - wszystko inne – zwykle z sieci.

// BUILD:START
const VERSION = "5fa1299754";
const SHELL = [
  "./",
  "css/style.css?v=9c1b7fa2a3",
  "js/app.js?v=38b583b687",
  "data/bundle.js?v=374964a8d6",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-192.png",
  "icons/maskable-512.png",
];
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap";
// BUILD:END

const CACHE = "eng-shell-" + VERSION;
const FONTS = "eng-fonts-v1";
const FONT_SUBSETS = ["latin", "latin-ext"]; // polskie znaki są w latin-ext; reszty (cyrylica itd.) nie pobieramy
const INDEX = new URL("./", self.location).href;

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: "reload" – z serwera, a nie z pamięci HTTP przeglądarki (mogłaby oddać starą wersję).
    await cache.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })));
    await cacheFonts().catch(() => {}); // bez fontów strona działa (czcionka systemowa)
  })());
  // Nie wywołujemy skipWaiting(): przy aktualizacji nowa wersja czeka, aż uczeń kliknie „Odśwież”,
  // żeby nie podmieniać plików w trakcie rozwiązywania zadań.
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("eng-shell-") && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim(); // przy pierwszej instalacji strona od razu działa offline
  })());
});

self.addEventListener("message", (e) => {
  if (e.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.includes("/downloads/")) return; // duże pliki do pobrania – tylko sieć
    const isIndex = url.href.split(/[?#]/)[0] === INDEX || url.pathname.endsWith("/index.html");
    if (req.mode === "navigate" && isIndex) {
      e.respondWith(fromCache(INDEX, req, { ignoreSearch: true }));
      return;
    }
    e.respondWith(fromCache(req, req));
    return;
  }

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(fontFirst(req));
  }
});

// Najpierw pamięć podręczna tej wersji, potem sieć.
async function fromCache(key, req, opts) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(key, opts);
  if (hit) return hit;
  return fetch(req);
}

async function fontFirst(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone()).catch(() => {});
  return res;
}

// Arkusz fontów Google + pliki fontów (tylko potrzebne zakresy znaków), żeby od pierwszej wizyty
// strona offline wyglądała tak samo. Przy pierwszej wizycie strona pobiera fonty, zanim działa
// service worker, więc same z siebie nie trafiłyby do pamięci podręcznej.
async function cacheFonts() {
  if (!FONT_CSS) return;
  const cache = await caches.open(FONTS);
  if (await cache.match(FONT_CSS, { ignoreVary: true })) return;
  const res = await fetch(FONT_CSS);
  if (!res.ok) return;
  const css = await res.clone().text();
  const urls = [];
  for (const block of css.split("/* ").slice(1)) {
    const subset = block.slice(0, block.indexOf(" */"));
    if (!FONT_SUBSETS.includes(subset)) continue;
    const m = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (m && !urls.includes(m[1])) urls.push(m[1]);
  }
  await Promise.all(urls.map(async (u) => {
    const r = await fetch(u);
    if (r.ok) await cache.put(u, r);
  }));
  await cache.put(FONT_CSS, res);
}
