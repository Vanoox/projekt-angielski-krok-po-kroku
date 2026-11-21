# Zdjęcie wzorcowe (golden master)

Sprawdza, że po zmianie struktury kodu strona działa i wygląda **dokładnie tak samo**: przed zmianą zapisujesz wynik, po zmianie robisz to samo i porównujesz. Potrzebny Node 22+ i Microsoft Edge (inna ścieżka: zmienna `EDGE`). Wyniki trafiają do `tools/golden/out/` (poza gitem).

```
node tools/golden/run.js before            # PRZED zmianą: zdjęcia DOM + testy klikane (ok. 1 min)
node tools/golden/run-cdp.js before offline@student@sw=1   # PRZED: offline (service worker, prawdziwy czas)
…zmiana kodu, npm run build…
node tools/golden/run.js after
node tools/golden/run-cdp.js after offline@student@sw=1
node tools/golden/compare.js before after  # różnice (normalizowane: ?v=, komentarze HTML, import map)
```

Szczegóły jednego wyniku: `node tools/golden/summary.js tools/golden/out/after/scn-ex-student.txt`.

## Jak to działa

- `gm-server.js` – serwer z `tools/serve.js`; do `index.html` z parametrem `?__t=<stan>` wstrzykuje `mock.js`, pliki z `/__t/` bierze z tego katalogu (`GM_ROOT` – inny katalog strony, np. stara wersja z `git archive`).
- `mock.js` (przed aplikacją): stała data 21.11.2026 10:00, powtarzalny `Math.random`, lektor z dwoma głosami (zapisuje, co mówi), bez rozpoznawania mowy (chyba że `sr=1` – atrapa „słyszy” `window.__srSay`) i bez service workera (chyba że `sw=1`), stan localStorage: `new` = pusty, `student` = `state-student.json` (przerobione lekcje, wyniki, Moje błędy, fiszki, dziennik, motyw ciemny). Zbiera błędy konsoli i na końcu dopisuje do strony `<pre id="__gm">` (tytuł, błędy, localStorage, wynik scenariusza).
- `run.js` – headless Edge z `--virtual-time-budget` i `--dump-dom`: trasy z `routes()` (lekcje z każdego poziomu ze wszystkimi zakładkami, trening, testy, sprawdziany, test poziomu, Moje błędy, słówka, odmiana, oś czasów, czytanki, dialogi, rozmowy, kolejność + kopia + cel, wyszukiwanie, złe adresy) dla obu stanów oraz scenariusze `scn-*.js` (ładowane z `lib.js`): ćwiczenia wszystkich typów z dobrymi i złymi odpowiedziami, lekcja i menu, trening / Moje błędy / fiszki, testy i trener odmiany, kopia postępu (pobieranie, wczytywanie: złe pliki, łączenie, zastąpienie), lektor w dialogach i czytankach, rozmowa z klawiszami 1–3; `scn-views.js` (z `sr=1`) – nasłuchy `scroll` / `resize` / `keydown` dodane przez widoki znikają po zmianie strony, wymowa z mikrofonem w zakładce „Wymowa” i w teorii, przerwanie słuchania przy zmianie strony.
- `run-cdp.js` – jeden scenariusz w prawdziwym czasie przez DevTools Protocol (czas wirtualny nie czeka na service workera ani FileReader): `scn-offline.js` sprawdza pamięć podręczną, stronę bez sieci (w ramce) i pasek „Jest nowa wersja”.
- `w375.html` – szerokość stron w ramce 375 px (`/__t/w375.html`, wynik w `<pre id="out">`).
- `prep` (`node tools/golden/run.js x prep`) tworzy od nowa `state-student.json` i `ids.json` z aktualnych danych – rób to **przed** zdjęciem „before”, nie między „before” i „after”.
