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

- `js/app.js` – widoki, lektor, router (moduł ES, importuje resztę).
- Logika bez DOM, z testami w `tests/`: `js/check.js` (sprawdzanie odpowiedzi), `js/spelling.js` (pisownia BrE/AmE), `js/errors.js` (typowe błędy), `js/srs.js` (pudełka powtórek), `js/activity.js` (dziennik, seria, cel dzienny), `js/storage.js` (localStorage, migracje, kopia postępu), `js/tasks.js` (dyktando, „Znajdź błąd”), `js/dates.js`, `js/util.js`.
- Nowy plik w `js/` trafia do import map i do `sw.js` sam (po `npm run build`).

Formaty danych: `FORMAT.md` (lekcje, czytanki, dialogi, rozmowy), `PRACTICE-FORMAT.md` (ćwiczenia), przegląd treści: `REVIEW.md`.
