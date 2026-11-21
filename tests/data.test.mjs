// Prawdziwe dane kursu: każda podana poprawna odpowiedź (wszystkie warianty po expandAnswer) przechodzi przez
// sprawdzanie – w kursie nie ma zadań, których nie da się zaliczyć. (validate.js sprawdza budowę danych, nie odpowiedzi.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { expandAnswer, matches, feMatch, orderParts, firstVariant, vocabAnswers, vocabMatch } from "../js/check.js";
import { loadCourse } from "./helpers.mjs";

const c = loadCourse();
const show = (fails) => `${fails.length} zadań nie da się zaliczyć:\n` + fails.slice(0, 20).map((f) => " - " + f).join("\n");
const flat = (s) => s.toLowerCase().replace(/[.?!,]/g, "");

test("luki, zdania do napisania, dyktando: każdy wariant odpowiedzi jest przyjmowany", (t) => {
  const fails = [];
  let n = 0;
  for (const ex of c.exs) {
    if (ex.type === "gap") {
      const accepted = Array.isArray(ex.answers[0]) ? ex.answers : [ex.answers];
      accepted.forEach((acc, k) => acc.forEach((a) => expandAnswer(a).forEach((e) => { n++; if (!matches(e, acc)) fails.push(`${ex.q} [luka ${k + 1}] „${e}”`); })));
    } else if (ex.type === "write" || ex.type === "dictation") {
      ex.answers.forEach((a) => expandAnswer(a).forEach((e) => { n++; if (!matches(e, ex.answers)) fails.push(`${ex.q || ex.say} „${e}”`); }));
    }
  }
  t.diagnostic(`sprawdzonych wariantów: ${n}`);
  assert.ok(n > 5000);
  assert.deepEqual(fails, [], show(fails));
});

test("ułóż zdanie: kafelki ułożone po kolei dają poprawną odpowiedź", (t) => {
  const fails = [];
  let n = 0;
  for (const ex of c.exs.filter((x) => x.type === "order")) {
    n++;
    let toks = orderParts(ex).toks;
    if (ex.words) { // własne kafelki (validate.js: te same wyrazy co w answers[0]) – w kolejności z odpowiedzi
      const left = ex.words.slice();
      toks = firstVariant(ex.answers[0]).replace(/[.?!]+$/, "").split(/\s+/).map((w) => { const i = left.findIndex((x) => flat(x) === flat(w)); return i < 0 ? "?" : left.splice(i, 1)[0]; });
    }
    const given = toks.join(" ");
    if (!matches(given, ex.answers)) fails.push(`„${given}” ~ ${JSON.stringify(ex.answers)}`);
  }
  t.diagnostic(`zadań: ${n}`);
  assert.ok(n > 100);
  assert.deepEqual(fails, [], show(fails));
});

test("Znajdź błąd: poprawka jest przyjmowana, a zdanie z błędem – nie", (t) => {
  const fails = [];
  let n = 0;
  for (const l of c.lessons) for (const { bad, good } of l.finds) {
    n++;
    bad.answers.forEach((a) => expandAnswer(a).forEach((e) => { if (!feMatch(e, bad)) fails.push(`${l.id}: poprawka „${e}” odrzucona`); }));
    if (feMatch(bad.q, bad)) fails.push(`${l.id}: zdanie z błędem „${bad.q}” przyjęte jako poprawka`);
    if (!feMatch(good.q, good)) fails.push(`${l.id}: „${good.q}” (bez błędu) odrzucone`);
  }
  t.diagnostic(`par: ${n}`);
  assert.ok(n > 500);
  assert.deepEqual(fails, [], show(fails));
});

test("quiz ze słówek: każdy zapis słowa jest przyjmowany", (t) => {
  const items = [...c.lessons.flatMap((l) => (l.vocab && l.vocab.items) || []), ...c.vocab.flatMap((v) => (v.groups || []).flatMap((g) => g.items || []))];
  const fails = [];
  let n = 0;
  for (const w of items) for (const a of vocabAnswers(w.en)) { n++; if (!vocabMatch(a, w.en)) fails.push(`${w.en}: „${a}”`); }
  t.diagnostic(`słówek: ${items.length}, zapisów: ${n}`);
  assert.ok(items.length > 4000);
  assert.deepEqual(fails, [], show(fails));
});
