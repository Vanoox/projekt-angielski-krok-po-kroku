// Pisownia brytyjska i amerykańska (js/spelling.js): oba zapisy → jedna postać (amerykańska).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spellFold, spellFoldStr } from "../js/spelling.js";

test("słowa z listy i reguły", () => {
  const pairs = {
    colour: "color", colours: "colors", favourite: "favorite", neighbourhood: "neighborhood", centre: "center", centres: "centers", theatre: "theater",
    metre: "meter", organise: "organize", organised: "organized", organising: "organizing", realisation: "realization", travelled: "traveled",
    cancelling: "canceling", grey: "gray", tyre: "tire", cheque: "check", practise: "practice", licence: "license", programme: "program",
    catalogue: "catalog", cosy: "cozy", aeroplane: "airplane", jewellery: "jewelry", analyse: "analyze", mum: "mom", judgement: "judgment",
  };
  for (const [gb, us] of Object.entries(pairs)) {
    assert.equal(spellFold(gb), us, gb);
    assert.equal(spellFold(us), us, us); // amerykańska zostaje
  }
});

test("słowa, których reguły nie ruszają", () => {
  for (const w of ["four", "hour", "your", "tour", "promise", "advise", "exercise", "surprise", "travel", "level", "more", "here", "were", "centrepiece"]) assert.equal(spellFold(w), w, w);
});

test("całe zdanie", () => {
  assert.equal(spellFoldStr("my favourite colour is grey"), "my favorite color is gray");
});
