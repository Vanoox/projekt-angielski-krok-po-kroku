// „Typowe błędy” (js/errors.js) – nazwa błędu przy złej odpowiedzi. Słowniki z prawdziwych danych kursu, jak na stronie.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildErrDict, errClassify, errTagsHtml, errTop, ERR_INFO, ERR_KEYS } from "../js/errors.js";
import { loadCourse } from "./helpers.mjs";

const c = loadCourse();
const D = buildErrDict(c.exs, c.byId["irregular-verbs"]);
const kinds = (given, answer, dict = D) => errClassify(given, [answer], dict);

test("słowniki z danych", () => {
  assert.ok(D.known.has("apples") && D.known.has("receive"));
  assert.equal(D.irr.get("went"), "go");
  assert.equal(D.irr.get("bought"), "buy");
  assert.ok(D.verbs.has("work") && D.nouns.has("book"));
  assert.ok(D.names.size > 20); // imiona z odpowiedzi (Tom, Anna…)
});

const CASES = {
  s3: [["She work every day.", "She works every day."], ["Does she works here?", "Does she work here?"], ["He can swims.", "He can swim."], ["Tom play football.", "Tom plays football."]],
  plural: [["I have two book.", "I have two books."], ["I have a books.", "I have a book."], ["These car are fast.", "These cars are fast."]],
  article: [["I have the dog.", "I have a dog."], ["She is a honest woman.", "She is an honest woman."], ["She is teacher.", "She is a teacher."]],
  aux: [["She don't like it.", "She doesn't like it."], ["They was at home.", "They were at home."], ["Do she like it?", "Does she like it?"], ["Where you live?", "Where do you live?"], ["I am agree.", "I agree."]],
  irr: [["I goed home.", "I went home."], ["I have went there.", "I have gone there."], ["She buyed a car.", "She bought a car."]],
  verb: [["She is work now.", "She is working now."], ["He can playing.", "He can play."]],
  prep: [["I live at London.", "I live in London."], ["I'm good in English.", "I'm good at English."], ["It depends of you.", "It depends on you."]],
  order: [["Always I get up early.", "I always get up early."], ["What time it is?", "What time is it?"]],
  typo: [["I like aples.", "I like apples."], ["She is beautifull.", "She is beautiful."], ["I recieve emails.", "I receive emails."]],
  missing: [["I want go home.", "I want to go home."]],
  extra: [["I can to swim.", "I can swim."]],
};
for (const [kind, cases] of Object.entries(CASES)) {
  test(`rodzaj błędu: ${kind}`, () => {
    for (const [g, a] of cases) assert.deepEqual(kinds(g, a), [kind], `„${g}” → „${a}”`);
  });
}

test("kilka różnic, brak różnic, nie wiadomo", () => {
  assert.deepEqual(kinds("I want to go home.", "I want to go to the home."), ["missing", "article"]);
  assert.deepEqual(kinds("I am a student.", "I'm a student."), []); // skrót to nie błąd
  assert.deepEqual(kinds("My favourite colour.", "My favorite color."), []); // pisownia BrE/AmE to nie błąd
  assert.deepEqual(kinds("Pizza is great.", "I went to school yesterday."), ["other"]);
  assert.deepEqual(kinds("I worked yesterday.", "I work every day."), ["other"]);
});

test("bez słowników z danych: -s ogólnie, 3. osoba z kontekstu, literówka", () => {
  const E = buildErrDict([], null);
  assert.deepEqual(kinds("I like the cat.", "I like the cats.", E), ["ends"]);
  assert.deepEqual(kinds("She work.", "She works.", E), ["s3"]);
  assert.deepEqual(kinds("I like aples.", "I like apples.", E), ["typo"]);
});

test("etykiety i podsumowanie po zestawie", () => {
  assert.equal(errTagsHtml([]), "");
  assert.equal(errTagsHtml(["other"]), "");
  assert.equal(errTagsHtml(["typo", "nie-ma"]), `<div class="err-tags"><span class="err-tag" title="${ERR_INFO.typo.tip}">Literówka</span></div>`);
  const res = [{ ok: false, errs: ["typo", "s3"] }, { ok: false, errs: ["s3"] }, { ok: true, errs: ["prep"] }, null, { ok: false, errs: ["article"] }, { ok: false, errs: ["other"] }, { ok: false, errs: ["typo"] }, { ok: false, errs: ["prep"] }];
  // najczęstsze najpierw, przy remisie – kolejność z ERR_INFO; dobre odpowiedzi i „other” się nie liczą
  assert.deepEqual(errTop(res), [["s3", 2], ["typo", 2], ["article", 1]]);
  assert.deepEqual(errTop([{ ok: true }, null]), []);
  assert.ok(ERR_KEYS.indexOf("s3") < ERR_KEYS.indexOf("typo"));
});
