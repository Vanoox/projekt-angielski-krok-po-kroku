// Sprawdzanie odpowiedzi (js/check.js). Testy zapisują zachowanie z 2026-11-21 – zmiana wyniku = świadoma decyzja.
import { test } from "node:test";
import assert from "node:assert/strict";
import { expandAnswer, displayAnswer, firstVariant, normalize, matches, tokenVariants, diffHtml, feMatch, feIsStrict, vocabAnswers, vocabMatch, orderParts } from "../js/check.js";

const ok = (given, answers) => assert.equal(matches(given, answers), true, `powinno przyjąć: „${given}” ~ ${JSON.stringify(answers)}`);
const no = (given, answers) => assert.equal(matches(given, answers), false, `powinno odrzucić: „${given}” ~ ${JSON.stringify(answers)}`);

test("składnia odpowiedzi: (opcjonalne) i {a|b}", () => {
  assert.deepEqual(expandAnswer("I (really) {like|love} it."), ["I really like it.", "I like it.", "I really love it.", "I love it."]);
  assert.deepEqual(expandAnswer("the man {who|that} came"), ["the man who came", "the man that came"]);
  assert.deepEqual([...new Set(expandAnswer("{a|{b|c}} x"))], ["a x", "b x", "c x"]); // zagnieżdżone (bywa duplikat – nieszkodliwy)
  assert.deepEqual(expandAnswer("I like (it) ."), ["I like it.", "I like."]); // spacja przed kropką znika
  assert.equal(expandAnswer("{a|b} {c|d} {e|f} {g|h} {i|j} {k|l} {m|n}").length, 64); // limit wariantów
  assert.equal(displayAnswer("the man {who|that} came (yesterday)"), "the man who/that came (yesterday)");
  assert.equal(firstVariant("{He's|He is} (very) tired."), "He's very tired.");
  ok("I saw that man.", ["I saw (that) man."]);
  ok("I saw man.", ["I saw (that) man."]);
  ok("the man that came", ["the man {who|that} came"]);
  no("the man which came", ["the man {who|that} came"]);
});

test("wielkość liter, interpunkcja, odstępy", () => {
  ok("i AM a STUDENT", ["I am a student."]);
  ok("I am a student!!!", ["I am a student."]);
  ok("I am, a student", ["I am a student."]);
  ok("  I   am a student  ", ["I am a student."]);
  ok("Yes - I am.", ["Yes – I am."]);
  assert.equal(normalize("Hello, World! – OK?"), "hello world ok");
});

test("apostrofy, cudzysłowy, diakrytyki", () => {
  ok("I’m a student.", ["I'm a student."]);
  ok("I`m a student.", ["I'm a student."]);
  ok("“Hello”, she said.", ['"Hello," she said.']);
  ok("„Hello”, she said.", ['"Hello," she said.']);
  ok("I live in Poznan.", ["I live in Poznań."]);
  ok("I live in Lodz.", ["I live in Łódź."]);
  ok("Let's meet at a cafe.", ["Let's meet at a café."]);
  no("Im a student", ["I'm a student."]); // bez apostrofu – to nie jest skrót
});

test("skróty i pełne formy (w obie strony)", () => {
  ok("I'm a student.", ["I am a student."]);
  ok("I am a student.", ["I'm a student."]);
  ok("They didn't come.", ["They did not come."]);
  ok("We'll go.", ["We will go."]);
  ok("I'd go.", ["I would go."]);
  ok("I'd gone.", ["I had gone."]);
  ok("They're here.", ["They are here."]);
  ok("We've won.", ["We have won."]);
  ok("I can't swim.", ["I cannot swim."]);
  ok("I cannot swim.", ["I can't swim."]);
  ok("I can not swim.", ["I cannot swim."]);
  ok("Let us go.", ["Let's go."]);
  ok("She won't come.", ["She will not come."]);
  // 's = has tylko przed imiesłowem / got / been
  ok("He's got a car.", ["He has got a car."]);
  ok("She's finished.", ["She has finished."]);
  ok("She's finished.", ["She is finished."]);
  no("He's a doctor.", ["He has a doctor."]);
  no("He has a doctor.", ["He's a doctor."]);
  // przeczenie w szyku pytającym: „did not they” jest niegramatyczne – nie rozwijamy
  no("Didn't they come?", ["Did not they come?"]);
  no("Did they not come?", ["Didn't they come?"]);
  assert.deepEqual(tokenVariants("didn't", "they"), ["didn't"]);
  assert.deepEqual(tokenVariants("didn't", "come"), ["didn't", "did not"]);
  assert.deepEqual(tokenVariants("she's", "got"), ["she's", "she has"]);
  assert.deepEqual(tokenVariants("she's", "happy"), ["she's", "she is"]);
});

test("„amn't” nie istnieje (commit cbef97e)", () => {
  no("I amn't tired.", ["I am not tired."]);
  no("I amn't tired.", ["I'm not tired."]);
  assert.deepEqual(tokenVariants("amn't", "tired"), ["amn't"]);
  ok("I'm not tired.", ["I am not tired."]);
  no("I amnot tired.", ["I am not tired."]);
});

test("godziny i am / pm", () => {
  ok("It starts at 7pm.", ["It starts at 7 p.m."]);
  ok("It starts at 7 PM.", ["It starts at 7 p.m."]);
  ok("It starts at 7 p.m.", ["It starts at 7pm."]);
  ok("It starts at 7.30.", ["It starts at 7:30."]);
  ok("at 7:30 a.m.", ["at 7.30am"]);
  no("It starts at 8pm.", ["It starts at 7 p.m."]);
});

test("równoważne zapisy tego samego słowa", () => {
  ok("I don't live here any more.", ["I don't live here anymore."]);
  ok("All right.", ["Alright."]);
  ok("Okay.", ["OK."]);
  ok("Send me an e-mail.", ["Send me an email."]);
  ok("No-one came.", ["No one came."]);
  ok("Nobody came.", ["No one came."]);
  ok("Somebody called.", ["Someone called."]);
  ok("Is anybody here?", ["Is anyone here?"]);
  ok("fifty per cent", ["fifty percent"]);
  // dziś bez wyjątku: łącznik w środku słowa zostaje
  no("well-known", ["well known"]);
});

test("pisownia brytyjska i amerykańska", () => {
  ok("My favourite colour is grey.", ["My favorite color is gray."]);
  ok("My favorite color is gray.", ["My favourite colour is grey."]);
  ok("I travelled to the theatre.", ["I traveled to the theater."]);
  ok("We organised it.", ["We organized it."]);
  ok("I practise every day.", ["I practice every day."]);
  ok("Is this your programme?", ["Is this your program?"]);
});

test("luka „bez przedimka” (-)", () => {
  for (const g of ["", "0", "x", "ø", "brak", "nic", "none", "no article", "-"]) ok(g, ["-"]);
  no("the", ["-"]);
  no("a", ["-"]);
});

test("złe odpowiedzi są odrzucane", () => {
  no("She work here.", ["She works here."]);
  no("She works here.", ["She work here."]);
  no("He go to school.", ["He goes to school."]);
  no("I have a dog.", ["I have got a cat."]);
  no("I am student.", ["I am a student."]);
  no("Am I a student?", ["I am a student."]);
  no("I a student.", ["I'm a student."]);
  no("", ["I am a student."]);
});

test("diffHtml – co brakuje, co zbędne", () => {
  assert.equal(diffHtml("She work here", ["She works here."]),
    '<div class="diff"><div><span class="d-lbl">Twoja odpowiedź:</span> She <span class="d-extra">work</span> here</div><div><span class="d-lbl">Poprawnie:</span> She <span class="d-miss">works</span> here. </div></div>');
  // bez skrótów u ucznia → wzorzec w pełnej formie (bez fałszywych różnic)
  assert.match(diffHtml("She has not finished", ["She hasn't finished."]), /Poprawnie:<\/span> She has not finished\. </);
  // tekst ucznia jest escapowany; przycisk lektora z argumentu
  const h = diffHtml("I like <b>cats</b>", ["I like dogs."], (t) => `[${t}]`);
  assert.match(h, /&lt;b&gt;cats&lt;\/b&gt;/);
  assert.match(h, /\[I like dogs\.\]<\/div><\/div>$/);
  assert.match(diffHtml("I like colour", ["I like color."]), /I like colour<\/div>/); // inna pisownia to nie różnica
  assert.equal(diffHtml("x", []), "");
});

test("Znajdź błąd – dokładne porównanie, gdy matches() przyjmuje błędne zdanie", () => {
  const ex = { q: "Yes, I'm.", answers: ["Yes, I am."] };
  assert.equal(feMatch("Yes, I'm.", ex), false);
  assert.equal(ex.strict, true);
  assert.equal(feMatch("Yes, I am", ex), true);
  assert.equal(feMatch("yes, i am.", ex), true);
  assert.equal(feMatch("Yes I am.", ex), false); // przecinek się liczy
  const ex2 = { q: "She go to school.", answers: ["She goes to school."] };
  assert.equal(feIsStrict(ex2), false);
  assert.equal(feMatch("She goes to school", ex2), true);
  assert.equal(feMatch("She go to school.", ex2), false);
});

test("quiz ze słówek: warianty i wypełniacze", () => {
  assert.deepEqual(vocabAnswers("(to) arrive / get <b>in</b> (BrE)"), ["to arrive", "arrive", "get in"]);
  assert.equal(vocabMatch("arrive", "(to) arrive"), true);
  assert.equal(vocabMatch("to arrive", "arrive"), true);
  assert.equal(vocabMatch("accuse of", "accuse (sb) of"), true);
  assert.equal(vocabMatch("accuse somebody of", "accuse sb of"), true);
  assert.equal(vocabMatch("a flat", "flat / apartment"), true);
  assert.equal(vocabMatch("apartment", "flat / apartment"), true);
  assert.equal(vocabMatch("house", "flat / apartment"), false);
});

test("ułóż zdanie: kafelki", () => {
  assert.deepEqual(orderParts({ answers: ["She is my best friend."] }), { toks: ["she", "is", "my", "best", "friend"], end: "." });
  assert.deepEqual(orderParts({ answers: ["I'm happy."] }), { toks: ["I'm", "happy"], end: "." });
  assert.deepEqual(orderParts({ answers: ["London is big."], keepCase: true }), { toks: ["London", "is", "big"], end: "." });
  assert.deepEqual(orderParts({ answers: ["Is she here?"], words: ["is", "she", "here"] }), { toks: ["is", "she", "here"], end: "?" });
  assert.deepEqual(orderParts({ answers: ["{Are|Were} you there?!"] }), { toks: ["are", "you", "there"], end: "?!" });
});
