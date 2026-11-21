// Service worker – strona działa bez internetu i da się ją zainstalować na telefonie.
// Leży w katalogu głównym, bo obejmuje tylko pliki ze swojego katalogu i niżej.
//
// Część między BUILD:START i BUILD:END wpisuje `npm run build` (tools/build-index.js) – nie edytuj jej ręcznie.
// VERSION to skrót treści wszystkich plików z SHELL, więc zmienia się przy każdej zmianie strony.
// Przeglądarka sama sprawdza, czy sw.js się zmienił; nowa wersja pobiera pliki w tle, a strona
// pokazuje pasek „Jest nowa wersja” (js/app.js, initOffline). Po kliknięciu „Odśwież” nowa wersja
// przejmuje stronę i ta się przeładowuje.
//
// Strategia:
//  - „app shell” (index.html, CSS, app.js i moduły z js/, data/bundle.js, manifest, ikony) – z pamięci podręcznej,
//    bez czekania na sieć. Adresy mają ?v=<hash>, więc pod danym adresem plik się nie zmienia;
//    aktualizacja przychodzi w tle razem z nowym sw.js (nowa VERSION = nowa paczka plików).
//  - fonty Google – z pamięci podręcznej, a gdy ich brak – z sieci (i zapis na później).
//  - downloads/ (talia Anki, 51 MB) – zawsze z sieci, nigdy do pamięci podręcznej.
//  - wszystko inne – zwykle z sieci.

// BUILD:START
const VERSION = "615655a3e3";
const SHELL = [
  "./",
  "css/style.css?v=139c2d5169",
  "js/app.js?v=88ba9d29a8",
  "js/activity.js?v=7cdbdbad83",
  "js/backup.js?v=344521916e",
  "js/check.js?v=c687f0bbe3",
  "js/conj.js?v=4874c8fb94",
  "js/data.js?v=6ef32f4898",
  "js/dates.js?v=7a8253dec0",
  "js/drills.js?v=0e8b190603",
  "js/due.js?v=5e54b8a344",
  "js/errors.js?v=a8f1f08b6c",
  "js/exercises.js?v=d6202fb393",
  "js/goal.js?v=07b0aeb506",
  "js/icons.js?v=26339665e3",
  "js/nav.js?v=9beedcd299",
  "js/pwa.js?v=05d95126b0",
  "js/record.js?v=1df93b4b64",
  "js/router.js?v=652f116973",
  "js/search.js?v=47a1f4dc85",
  "js/sections.js?v=e3c8dac554",
  "js/speech.js?v=62553bb782",
  "js/spelling.js?v=53d3959397",
  "js/srs.js?v=20cf852051",
  "js/state.js?v=315154bd92",
  "js/storage.js?v=c3fee0374b",
  "js/tasks.js?v=f98611c895",
  "js/theme.js?v=ad11f6a277",
  "js/ui.js?v=fd61b30ab5",
  "js/units.js?v=325023b9e2",
  "js/util.js?v=0cb3e8776a",
  "js/views/chats.js?v=cacbb91fc6",
  "js/views/checkpoint.js?v=b505b49258",
  "js/views/conjugation.js?v=60712a70ed",
  "js/views/dialogues.js?v=dd4b8c0044",
  "js/views/home.js?v=6fc2ccd0a9",
  "js/views/lesson.js?v=60ec75ef2e",
  "js/views/level-test.js?v=492c8bad15",
  "js/views/mistakes.js?v=1624afeb9c",
  "js/views/order.js?v=c914cd2ad9",
  "js/views/practice.js?v=73cc5f9818",
  "js/views/reading.js?v=9f6790b3c4",
  "js/views/tests.js?v=075fb2de31",
  "js/views/timeline.js?v=89e3f5f3fa",
  "js/views/vocab.js?v=a7e8a0bd47",
  "js/views/words.js?v=a403dfd38b",
  "js/vocab-view.js?v=c2104d78ab",
  "data/bundle.js?v=ae9bfa7dbe",
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
    // Moduły z js/: przeglądarka bez import map (np. Safari < 16.4) prosi o js/check.js bez ?v= – w pamięci tej
    // wersji jest dokładnie jedna kopia każdego modułu, więc dopasowanie bez ?v= daje właściwy plik także offline.
    e.respondWith(fromCache(req, req, url.pathname.includes("/js/") ? { ignoreSearch: true } : undefined));
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
