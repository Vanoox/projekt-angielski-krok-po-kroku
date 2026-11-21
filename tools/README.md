# Narzędzia

Wszystko działa na samym Node.js (wersja 22 lub nowsza) – bez `npm install`. Polecenia uruchamiaj w katalogu głównym repozytorium.

| Polecenie | Co robi |
|---|---|
| `npm run build` | Buduje `data/bundle.js` z plików w `data/`, wpisuje `?v=<hash>`, import map modułów do `index.html` i listę plików do `sw.js` (`tools/build-index.js`). Uruchom po każdej zmianie w `data/`, `js/` albo `css/`. |
| `npm run check` | Wszystkie szybkie sprawdzenia: składnia JS, dane kursu (`validate.js`), aktualność plików z `npm run build`, testy (`tools/check.js`). |
| `npm test` | Same testy (`tests/*.test.mjs`, `node --test`). |
| `npm run validate` | Sama walidacja danych (`tools/validate.js`). |
| `npm run serve` | Strona pod adresem http://localhost:8080/ (`tools/serve.js`). Moduły ES i tryb offline nie działają z pliku (`file:///`), więc stronę sprawdzaj przez serwer. |
| `npm run audit` | Kolejność nauki: słowa i gramatyka przed lekcją, w której są uczone (`tools/audit/dump.js` + `report.js`, raporty w `tools/audit/`). |

## Hook przed commitem

`.githooks/pre-commit` uruchamia `npm run check` i zatrzymuje commit, gdy coś się nie zgadza (np. zapomniany `npm run build` albo zepsuty test). Włącz go raz na komputer:

```
git config core.hooksPath .githooks
```

## Kod strony

Moduły ES w `js/`, bez kroku kompilacji. Importy idą w jedną stronę (bez zależności w kółko): logika → części wspólne → widoki → `app.js`.

- **Logika bez DOM**, z testami w `tests/`: `check.js` (sprawdzanie odpowiedzi), `spelling.js` (pisownia BrE/AmE), `errors.js` (typowe błędy), `srs.js` (pudełka powtórek), `activity.js` (dziennik, seria, cel dzienny), `storage.js` (localStorage, migracje, kopia postępu), `tasks.js` (dyktando, „Znajdź błąd”), `dates.js`, `util.js`.
- **Części wspólne** (DOM): `icons.js` (ikony), `ui.js` (`$`, tytuł strony, odznaki, wyniki, odmiana liczebników, przycisk „Posłuchaj”), `data.js` (dane kursu przygotowane przy starcie: `PATH`, `BY_ID`, `TASKS` / `KEY_OF`, czytanki, dialogi, rozmowy, `DECKS` / `WORDS`), `state.js` (`state`, `save()` i to, co wynika ze stanu: seria, słówka na dziś, zaliczenia, następny krok), `conj.js` (logika trenera odmiany), `due.js` (liczniki „na dziś”), `goal.js` (cel dzienny), `nav.js` (menu boczne), `record.js` (zapis postępu: `saveScore`, `recordResult`, `logActivity`, `rateWord`), `speech.js` (lektor, ustawienia głosu, mikrofon), `exercises.js` (`renderExercises`, `makeController`, `exercisesShell`), `sections.js` (teoria), `drills.js` („Znajdź błąd”, dyktando), `vocab-view.js` (słownictwo: lista, fiszki, quiz), `units.js` (lista czytanek / dialogów / rozmów), `backup.js` (kopia postępu), `theme.js`, `search.js`, `router.js`, `pwa.js`.
- **Widoki** `js/views/*.js` – każdy eksportuje funkcję widoku (np. `lessonView()`), która zwraca `{ html, title, mount(el) }`; `mount` może zwrócić funkcję sprzątającą. Widok może importować części wspólne i inne widoki, ale nie `app.js`.
- **`app.js`** – start: tabela tras `setRoutes([{ match, view }, …])` (pierwsza pasująca), `hashchange`, `window.__ENG` dla testów, pierwsze `route()`.

Nowy widok: funkcja `xxxView()` w `js/views/` + wpis w tabeli tras w `app.js`. Nasłuchy na `window` / `document` dodane w `mount` zdejmuj w zwracanej funkcji sprzątającej (router woła ją przy zmianie strony; lektora i mikrofon zatrzymuje sam). Zdarzenia delegowane na `document` (przyciski „Posłuchaj”, cel dzienny, spis treści…) rejestruje przy załadowaniu moduł, do którego należą. Coś do odświeżenia razem z licznikami „na dziś” – `onTodayCounts(f)` z `due.js` (zamiast importu w kółko). Nowy plik w `js/` trafia do import map i do `sw.js` sam (po `npm run build`).

Formaty danych: `FORMAT.md` (lekcje, czytanki, dialogi, rozmowy), `PRACTICE-FORMAT.md` (ćwiczenia), przegląd treści: `REVIEW.md`.
