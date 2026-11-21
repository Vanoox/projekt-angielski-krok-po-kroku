// Zadania budowane z treści lekcji (js/tasks.js): dyktando i „Znajdź błąd”.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dictText, buildFinds, untag } from "../js/tasks.js";

test("dyktando: tylko zdania, które da się zapisać ze słuchu", () => {
  assert.equal(dictText("I <b>am</b> a student ."), "I am a student.");
  assert.equal(dictText("– Are you&nbsp;ready?"), "Are you ready?");
  assert.equal(dictText("Hello<br>my friend."), "Hello my friend.");
  assert.equal(dictText("I have 2 cats."), ""); // liczby
  assert.equal(dictText("He is / She is here."), ""); // warianty
  assert.equal(dictText("I like (it) here."), ""); // nawiasy
  assert.equal(dictText("Yes, I do"), ""); // bez kropki na końcu
  assert.equal(dictText("Yes, please."), ""); // za krótkie
  assert.equal(dictText("One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen."), "");
  assert.equal(dictText('She said "hi" to me.'), ""); // cudzysłów
  assert.equal(dictText(""), "");
});

test("Znajdź błąd: pary bad / good", () => {
  const lesson = { sections: [{ type: "text" }, { type: "mistakes", items: [
    { wrong: "She <b>go</b> to school. (codziennie)", right: "She goes to school.", why: "3. osoba" },
    { wrong: "I <b>has</b> a dog. / He <b>have</b> a dog.", right: "I have a dog. / He has a dog." },
    { wrong: "I <b>has got</b> a phone.", right: "I've got / I have a phone.", fix: ["I {have got|'ve got|have} a phone."] },
    { wrong: "No bold here.", right: "Nothing." },
    { wrong: "I've got / I <b>has</b> a phone.", right: "I've got / I have a phone." }, // błąd tylko w 2. wariancie – pomijane
  ] }] };
  const f = buildFinds(lesson);
  assert.equal(f.length, 3);
  assert.deepEqual(f[0].bad, { type: "finderr", why: "3. osoba", wrongHtml: "She <b>go</b> to school. (codziennie)", rightHtml: "She goes to school.", q: "She go to school.", html: "She <b>go</b> to school.", note: "codziennie", answers: ["She goes to school."], model: "She goes to school." });
  assert.deepEqual(f[0].good, { type: "finderr", why: "3. osoba", wrongHtml: "She <b>go</b> to school. (codziennie)", rightHtml: "She goes to school.", ok: true, q: "She goes to school.", html: "She goes to school.", note: "", answers: ["She goes to school."], model: "She goes to school." });
  assert.equal(f[1].bad.q, "I has a dog."); // pierwszy wariant
  assert.deepEqual(f[1].bad.answers, ["I have a dog."]); // poprawny o tym samym numerze
  assert.deepEqual(f[2].bad.answers, ["I {have got|'ve got|have} a phone."]); // fix ma pierwszeństwo przed right
  assert.equal(f[2].bad.model, "I have got a phone.");
  assert.equal(f[2].good.q, "I have got a phone.");
  assert.deepEqual(buildFinds({ sections: [] }), []);
  assert.equal(untag("A <b>b</b>  c"), "A b c");
});
