// Widoki #/czytanki i #/czytanki/<id> – czytanki z klikanymi słówkami, czytaniem na głos i pytaniami.
import { stripTags, esc } from "../util.js";
import { today } from "../dates.js";
import { wordKey } from "../srs.js";
import { store } from "../storage.js";
import { icon } from "../icons.js";
import { $, SITE_TITLE, badge, speakBtn, plural } from "../ui.js";
import { lessonNo, READING, RD_BY_ID, DECKS, rdSentences, RD_DECK, WORDS } from "../data.js";
import { state } from "../state.js";
import { syncTodayCounts } from "../due.js";
import { renderExercises, exercisesShell } from "../exercises.js";
import { ttsWarnHtml, syncTtsWarn, seqStop, speakSeq, seqIs } from "../speech.js";
import { cjTables, CJ_PL_INF } from "../conj.js";
import { unitListHtml, scrollToRead } from "../units.js";
import { dueLabel } from "./mistakes.js";

// ---------- Czytanki (#/czytanki) ----------
// Tekst = klikalne słowa; dymek z tłumaczeniem, głośnikiem i „Dodaj do fiszek”. Skąd tłumaczenie (po kolei):
// 1. glossary czytanki (słowa spoza słówek kursu i znaczenia zależne od tekstu – np. left = pozostały),
// 2. krótki słownik słów gramatycznych (RD_FUNC: zaimki, przyimki, czasowniki pomocnicze, skróty I'm / don't…),
// 3. słówka lekcji i działów (WORDS) – najpierw forma z tekstu, potem formy podstawowe (rdCands: went → go,
//    children → child, wetter → wet, booked → book…). Zwroty wielowyrazowe (living room, get up, a lot of, had dinner →
//    have dinner) mają pierwszeństwo przed pojedynczym słowem; najdłuższy pasujący fragment w obrębie zdania.
const RD_FUNC = new Map(("a=przedimek nieokreślony (jakiś, jeden – zwykle się nie tłumaczy)|an=przedimek nieokreślony przed samogłoską (jakiś, jeden)|" +
  "the=przedimek określony (ten, ta, to – zwykle się nie tłumaczy)|i=ja|you=ty; wy|he=on|she=ona|it=to; ono (o rzeczy lub zwierzęciu)|we=my|they=oni, one|" +
  "me=mnie, mi, mną|him=jego, go, mu, nim|her=jej, ją, nią; jej (czyja?)|us=nas, nam, nami|them=ich, im, nimi|my=mój, moja, moje|your=twój; wasz|" +
  "his=jego|its=jego, jej (o rzeczy lub zwierzęciu)|our=nasz|their=ich|mine=mój (bez rzeczownika)|yours=twój; wasz (bez rzeczownika)|hers=jej (bez rzeczownika)|" +
  "ours=nasz (bez rzeczownika)|theirs=ich (bez rzeczownika)|myself=się, siebie; sam(a)|yourself=się, siebie; sam(a)|himself=się, siebie; sam|herself=się, siebie; sama|" +
  "itself=się, siebie; samo|ourselves=się, siebie; sami|yourselves=się, siebie; sami|themselves=się, siebie; sami|" +
  "be=być|am=jestem (be)|is=jest (be)|are=jesteś, jesteśmy, jesteście, są (be)|was=byłem, był, była (be)|were=byłeś, byliśmy, byli (be)|been=III forma be: być|being=bycie; będąc|" +
  "have=mieć; czasownik pomocniczy (Present Perfect)|has=ma (have); pomocniczy: he / she / it|had=miał (II i III forma have); pomocniczy (Past Perfect)|having=mając|" +
  "do=robić; pomocniczy w pytaniach i przeczeniach|does=robi; pomocniczy: he / she / it|did=zrobił (II forma do); pomocniczy w Past Simple|done=zrobiony (III forma do)|" +
  "can=móc, umieć, potrafić (też: puszka)|could=mógł, umiał; mógłby|will=pomocniczy czasu przyszłego (zrobi, będzie)|would=by (tryb przypuszczający); zwykle robił (w przeszłości)|" +
  "shall=czy mam / czy mamy…? (propozycja)|should=powinien|may=może, wolno|might=może, być może|must=musieć; na pewno (must be = na pewno jest)|let=pozwolić (let's = zróbmy)|" +
  "not=nie|no=nie; żaden|yes=tak|and=i, a|or=lub, albo; czy|but=ale|so=więc; tak (bardzo)|because=ponieważ, bo|if=jeśli, jeżeli; czy|when=kiedy, gdy|while=podczas gdy, kiedy|" +
  "than=niż|then=potem; wtedy|that=tamten, tamto; że; który|this=ten, ta, to|these=ci, te|those=tamci, tamte|there=tam (there is / are = jest / są)|here=tu, tutaj|" +
  "what=co; jaki|who=kto; który (o ludziach)|which=który|where=gdzie|why=dlaczego|how=jak|whose=czyj|as=jak, jako; ponieważ; gdy|like=lubić; jak, podobnie jak|" +
  "to=do; żeby (przed czasownikiem)|of=(kogo? czego?); z|in=w; za (in two days = za dwa dni)|on=na; w (on Monday = w poniedziałek)|at=w, na, przy; o (at six = o szóstej)|" +
  "for=dla; przez (for two years = przez dwa lata)|from=z, od|with=z (kimś, czymś)|by=przez (kogo?); przy, obok; do (by Friday = do piątku)|about=o (czym?); około|" +
  "into=do (środka)|out=na zewnątrz, poza|up=w górę|down=w dół|off=z, od (oddalenie)|over=nad; ponad; skończony|under=pod|after=po; po tym, jak|before=przed; zanim; wcześniej|" +
  "since=od (jakiegoś momentu); ponieważ|until=do, aż|till=do, aż|during=podczas|through=przez (na wylot)|between=między|among=wśród|near=blisko, obok|around=wokół; około|" +
  "without=bez|within=w ciągu, w obrębie|across=przez (na drugą stronę)|along=wzdłuż|behind=za (z tyłu)|above=nad, powyżej|below=pod, poniżej|inside=wewnątrz|" +
  "outside=na zewnątrz|past=obok, za; po (godzinie)|against=przeciw; o (oprzeć się o)|towards=w kierunku|per=na (np. na godzinę)|" +
  "some=trochę, kilka, jakieś|any=jakiś, jakikolwiek; żaden (w przeczeniach)|every=każdy|each=każdy (z osobna)|all=wszyscy, wszystko; cały|both=obaj, oba, obie|" +
  "either=jeden z dwóch; też nie|neither=żaden z dwóch, ani|none=żaden, nikt|much=dużo (z rzeczownikami niepoliczalnymi); bardzo|many=dużo, wiele|" +
  "more=więcej; bardziej|most=najwięcej, najbardziej; większość|few=mało, niewiele (a few = kilka)|little=mało (a little = trochę); mały|less=mniej|lot=a lot (of) = dużo|" +
  "lots=lots of = dużo|other=inny|another=inny, kolejny, jeszcze jeden|such=taki|own=własny|same=taki sam, ten sam|very=bardzo|too=też; zbyt, za (too big = za duży)|" +
  "also=też, również|just=właśnie; tylko; po prostu|only=tylko; jedyny|even=nawet|still=wciąż, nadal|already=już|yet=jeszcze (w przeczeniach); już (w pytaniach)|" +
  "ever=kiedykolwiek|never=nigdy|always=zawsze|often=często|usually=zwykle|sometimes=czasami|else=jeszcze, inny (something else = coś innego)|" +
  "somebody=ktoś|someone=ktoś|something=coś|somewhere=gdzieś|anybody=ktokolwiek; nikt (w przeczeniach)|anyone=ktokolwiek; nikt (w przeczeniach)|" +
  "anything=cokolwiek; nic (w przeczeniach)|anywhere=gdziekolwiek; nigdzie (w przeczeniach)|everybody=wszyscy, każdy|everyone=wszyscy, każdy|everything=wszystko|" +
  "everywhere=wszędzie|nobody=nikt|nothing=nic|nowhere=nigdzie|one=jeden|two=dwa|three=trzy|four=cztery|five=pięć|six=sześć|seven=siedem|eight=osiem|nine=dziewięć|" +
  "ten=dziesięć|eleven=jedenaście|twelve=dwanaście|twenty=dwadzieścia|thirty=trzydzieści|forty=czterdzieści|fifty=pięćdziesiąt|hundred=sto|thousand=tysiąc|" +
  "first=pierwszy; najpierw|second=drugi; sekunda|third=trzeci|half=połowa, pół|o'clock=godzina (at three o'clock = o trzeciej)|please=proszę|thank=dziękować|" +
  "thanks=dzięki|sorry=przepraszam; przykro mi|hello=cześć, dzień dobry|hi=cześć|bye=cześć (na pożegnanie)|goodbye=do widzenia|oh=och|well=dobrze; cóż, no|" +
  "ok=w porządku, dobrze|okay=w porządku, dobrze|mr=pan (przed nazwiskiem)|mrs=pani (przed nazwiskiem)|ms=pani (przed nazwiskiem)|" +
  "i'm=I am – jestem|you're=you are – jesteś; jesteście|he's=he is / he has – on jest / on ma|she's=she is / she has – ona jest / ona ma|it's=it is / it has – to jest|" +
  "we're=we are – jesteśmy|they're=they are – są|i've=I have – mam (też: Present Perfect)|you've=you have – masz (też: Present Perfect)|we've=we have – mamy (też: Present Perfect)|" +
  "they've=they have – mają (też: Present Perfect)|i'll=I will – (ja) zrobię, będę|you'll=you will – zrobisz, będziesz|he'll=he will – zrobi, będzie|she'll=she will – zrobi, będzie|" +
  "it'll=it will – będzie|we'll=we will – zrobimy, będziemy|they'll=they will – zrobią, będą|i'd=I would / I had – (ja) bym; miałem|you'd=you would / you had|" +
  "he'd=he would / he had|she'd=she would / she had|we'd=we would / we had|they'd=they would / they had|isn't=is not – nie jest|aren't=are not – nie są, nie jesteś|" +
  "wasn't=was not – nie był|weren't=were not – nie byli, nie byłeś|don't=do not – nie (przeczenie)|doesn't=does not – nie (przeczenie: he / she / it)|" +
  "didn't=did not – nie (przeczenie w Past Simple)|haven't=have not – nie (Present Perfect); nie mam|hasn't=has not – nie (Present Perfect); nie ma|" +
  "hadn't=had not – nie (Past Perfect); nie miał|can't=cannot – nie mogę, nie umiem; na pewno nie|couldn't=could not – nie mógł, nie umiał|won't=will not – nie (w przyszłości)|" +
  "wouldn't=would not – nie (tryb przypuszczający)|shouldn't=should not – nie powinien|mustn't=must not – nie wolno|there's=there is – jest, znajduje się|" +
  "that's=that is – to jest|what's=what is – co jest? jaki jest?|who's=who is – kto jest?|where's=where is – gdzie jest?|let's=let us – zróbmy (propozycja)|" +
  "have got=mieć (= have)|has got=ma (= has)|haven't got=nie mieć|hasn't got=nie ma|i've got=mam|you've got=masz; macie|we've got=mamy|they've got=mają|" +
  "he's got=on ma|she's got=ona ma|it's got=ma (o rzeczy)|going to=be going to + czasownik = zamierzać, mieć zamiar (też: iść / jechać do)|have to=musieć|" +
  "has to=musi|had to=musiał|don't have to=nie musieć|doesn't have to=nie musi|didn't have to=nie musiał|must have=must have + III forma = na pewno (coś się stało)|" +
  "can't have=can't have + III forma = na pewno nie (coś się nie stało)|might have=might have + III forma = może (coś się stało)|" +
  "could have=could have + III forma = mógł (coś zrobić, ale nie zrobił); być może")
  .split("|").map((x) => { const i = x.indexOf("="); return [x.slice(0, i), [{ en: x.slice(0, i), pl: x.slice(i + 1), src: "func" }]]; }));
const RD_SPECIAL = { children: "child", people: "person", men: "man", women: "woman", feet: "foot", teeth: "tooth", mice: "mouse", knives: "knife", wives: "wife",
  lives: "life", leaves: "leaf", shelves: "shelf", halves: "half", better: "good", best: "good", worse: "bad", worst: "bad", further: "far", furthest: "far" };
let rdIrr = null;
// Formy podstawowe słowa (jak tools/audit/lemma.js): forma nieregularna → bezokolicznik (tabele lekcji irregular-verbs),
// -s/-es/-ies, -ed/-ied (z podwojoną spółgłoską), -ing, -er/-est, -ly. Pierwsza pozycja = samo słowo.
function rdCands(w) {
  if (!rdIrr) {
    rdIrr = new Map();
    cjTables().irr.forEach((f, base) => [...f.past, ...f.pp, ...f.ppUS].forEach((x) => { if (x !== base && !rdIrr.has(x)) rdIrr.set(x, base); }));
  }
  const c = [w];
  const add = (x) => { if (x && x.length > 1 && !c.includes(x)) { c.push(x); if (rdIrr.has(x)) add(rdIrr.get(x)); } };
  add(RD_SPECIAL[w]); add(rdIrr.get(w));
  if (c.length > 1) return c; // forma nieregularna – bez odcinania końcówek (best ≠ be)
  if (/ies$/.test(w)) add(w.slice(0, -3) + "y");
  if (/(s|x|z|ch|sh|o)es$/.test(w)) add(w.slice(0, -2));
  if (/[^s']s$/.test(w)) add(w.slice(0, -1));
  if (/ied$/.test(w)) add(w.slice(0, -3) + "y");
  if (/ed$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/([^aeiou])\1ed$/.test(w)) add(w.slice(0, -3)); }
  if (/ing$/.test(w)) { const s = w.slice(0, -3); add(s); add(s + "e"); if (/([^aeiou])\1$/.test(s)) add(s.slice(0, -1)); if (/ying$/.test(w)) add(s.slice(0, -1) + "ie"); }
  if (/ier$/.test(w)) add(w.slice(0, -3) + "y");
  if (/iest$/.test(w)) add(w.slice(0, -4) + "y");
  if (/er$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/([^aeiou])\1er$/.test(w)) add(w.slice(0, -3)); }
  if (/est$/.test(w)) { add(w.slice(0, -3)); add(w.slice(0, -2)); if (/([^aeiou])\1est$/.test(w)) add(w.slice(0, -4)); }
  if (/ily$/.test(w)) add(w.slice(0, -3) + "y");
  if (/ly$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -2) + "le"); }
  return c;
}
const rdNorm = (s) => String(s).toLowerCase().replace(/[’‘`´]/g, "'");
// Formy hasła słówka do wyszukiwania: „afraid (of)” → afraid, afraid of; „colour (BrE)” → colour; „box – boxes” → box,
// boxes; „pick sb up” → pick up; „How often…?” → how often. Nawias z przecinkiem lub „/” (formy czasownika) – pomijany.
function rdVariants(alt) {
  let a = alt.replace(/\((BrE|AmE|US|UK)\)/g, " ");
  const out = new Set();
  const vs = /\(([^()]*)\)/.test(a) ? [a.replace(/\([^()]*\)/g, " "), a.replace(/\(([^()]*)\)/g, (m, x) => (/[,/]/.test(x) ? " " : x))] : [a];
  vs.forEach((v) => v.split(/\s+[–—]\s+/).forEach((f) => {
    f = rdNorm(f).replace(/…|\.\.\./g, " ").replace(/[?!.,;:]/g, " ").replace(/\b(sb|sth|someone|someone's|somebody|somebody's|one's)\b/g, " ").replace(/\s+/g, " ").trim();
    if (f && !/[+=]/.test(f)) out.add(f);
  }));
  return [...out];
}
// Dodaje hasło do mapy forma → wpisy. Warianty „A / B” osobno, z tłumaczeniem z tej samej pozycji w pl (gdy liczba
// wariantów się zgadza); krótszy wariant dostaje początek pierwszego: „have breakfast / lunch / dinner” → have lunch.
// „ / ” poza nawiasami: „ile (policzalne / niepoliczalne)” to jeden wariant.
function rdSplit(s) {
  const out = [];
  let depth = 0, cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (!depth && s.startsWith(" / ", i)) { out.push(cur); cur = ""; i += 2; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
// Tłumaczenie wariantu nr g (z n): „zimno (komuś) / gorąco (komuś); zimny / gorący” → dla hot: „gorąco (komuś); gorący”.
function rdPairPl(p, g, n) {
  if (n < 2) return p;
  const segs = p.split(/\s*;\s*/).map(rdSplit);
  if (segs.every((x) => x.length === n)) return segs.map((x) => x[g]).join("; ");
  const all = rdSplit(p);
  return all.length === n ? all[g] : p;
}
function rdIndexAdd(map, en, pl, info) {
  const e = stripTags(en), p = stripTags(pl);
  const alts = rdSplit(e);
  // „colour (BrE) / color (AmE)” – jeden wariant znaczeniowy (ta sama pozycja w pl).
  const grp = [];
  alts.forEach((a, i) => grp.push(i && /\((AmE|US)\)/.test(a) && /\((BrE|UK)\)/.test(alts[i - 1]) ? grp[i - 1] : (i ? grp[i - 1] + 1 : 0)));
  const n = grp.length ? grp[grp.length - 1] + 1 : 0;
  const head = rdVariants(alts[0] || "")[0] || "", hw = head.split(" ");
  const put = (f, entry) => { if (!map.has(f)) map.set(f, []); if (!map.get(f).some((x) => x.k === entry.k && x.pl === entry.pl && x.en === entry.en)) map.get(f).push(entry); };
  alts.forEach((a, i) => {
    const entry = { ...info, en: a.trim(), pl: rdPairPl(p, grp[i], n) };
    const forms = rdVariants(a);
    forms.forEach((f) => put(f, entry));
    // „have breakfast / lunch / dinner” → have lunch (hasło = cały zwrot, tłumaczenie całego wpisu)
    const fw = forms[0] ? forms[0].split(" ") : [];
    if (i && fw.length && hw.length > 1 && fw.length < hw.length) {
      const f = hw.slice(0, hw.length - fw.length).concat(fw).join(" ");
      put(f, { ...info, en: f, pl: p, pre: true });
    }
  });
}
let rdIdx = null;
function rdIndex() {
  if (rdIdx) return rdIdx;
  rdIdx = new Map();
  DECKS.forEach((d) => { if (!d.manual) d.items.forEach((w) => rdIndexAdd(rdIdx, w.en, w.pl, { src: "words", deck: d.id, k: wordKey(w.en) })); });
  return rdIdx;
}
const rdGlossMaps = new Map();
function rdGloss(r) {
  if (!rdGlossMaps.has(r.id)) {
    const m = new Map();
    Object.entries(r.glossary).forEach(([en, pl]) => rdIndexAdd(m, en, pl, { src: "gloss", deck: RD_DECK.id, k: wordKey(en) }));
    rdGlossMaps.set(r.id, m);
  }
  return rdGlossMaps.get(r.id);
}
// Słowa tekstu: { t: słowo z tekstu, n: forma do szukania (małe litery, bez 's i końcowego '), s: numer zdania }.
const RD_WORD = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*(?:-[\p{L}\p{N}]+)*['’]?/gu;
export function rdParse(r) {
  if (r._parsed) return r._parsed;
  const words = [];
  let s = 0;
  const paras = r.text.map((p) => rdSentences(p).map((sent) => {
    const toks = [];
    let last = 0;
    sent = sent.trim();
    for (const m of sent.matchAll(RD_WORD)) {
      if (m.index > last) toks.push({ p: sent.slice(last, m.index) });
      toks.push({ w: words.length });
      words.push({ t: m[0], n: rdNorm(m[0]).replace(/'$/, ""), s });
      last = m.index + m[0].length;
    }
    if (last < sent.length) toks.push({ p: sent.slice(last) });
    return { s: s++, text: sent, toks };
  }));
  return (r._parsed = { paras, words });
}
// Formy słowa do szukania: samo słowo, bez 's (Tom's → tom, company's → company), formy podstawowe.
function rdWordForms(n, max) {
  const base = /'s$/.test(n) && !RD_FUNC.has(n) ? n.slice(0, -2) : n;
  const out = [n];
  rdCands(base).forEach((c) => { if (!out.includes(c)) out.push(c); });
  return max ? out.slice(0, max) : out;
}
// Tłumaczenie słowa nr i: { from, len, src, entries } albo null. Najdłuższy fragment (do 5 słów, w jednym zdaniu)
// zawierający słowo; przy tej samej długości: glossary > słowa gramatyczne > słówka. Dla pojedynczego słowa
// ze słówek – wpisy wszystkich form (left → lewo; leave – wyjść), najpierw forma z tekstu.
// Kolejność wpisów: hasło dokładnie równe szukanej formie (get przed „get (the door / the phone)”, własne hasło przed
// doklejonym wariantem), bez wykrzyknika / pytajnika (look ≠ Look!), a dla form z -ed / -ing najpierw znaczenia
// czasownikowe (polski bezokolicznik): watched → oglądać, nie zegarek.
const rdIsVerb = (e) => CJ_PL_INF.test(stripTags(e.pl).split(/[\s,;(]/)[0]);
function rdRank(es, form, verbish) {
  const head = (e) => rdNorm(e.en.replace(/\((BrE|AmE|US|UK)\)/g, "")).replace(/\s+/g, " ").trim();
  const score = (e) => (head(e) === form ? 0 : rdVariants(e.en).includes(form) ? 2 : 4) + (e.pre ? 1 : 0) + (/[!?]/.test(e.en) ? 8 : 0) + (verbish && !rdIsVerb(e) ? 5 : 0);
  return es.map((e, k) => [e, k]).sort((a, b) => score(a[0]) - score(b[0]) || a[1] - b[1]).map((x) => x[0]);
}
export function rdLookup(r, i) {
  const { words } = rdParse(r), w = words[i];
  if (!w) return null;
  const maps = [["gloss", rdGloss(r)], ["func", RD_FUNC], ["words", rdIndex()]];
  for (let len = Math.min(5, words.length); len >= 2; len--) {
    for (let st = Math.max(0, i - len + 1); st <= i && st + len <= words.length; st++) {
      if (words[st].s !== words[st + len - 1].s) continue;
      const mid = words.slice(st + 1, st + len - 1).map((x) => x.n).join(" ");
      const firsts = rdWordForms(words[st].n, 5), lasts = rdWordForms(words[st + len - 1].n, 3);
      for (const [src, map] of maps) {
        for (const a of firsts) for (const b of lasts) {
          if (src === "func" && (a !== words[st].n || b !== words[st + len - 1].n)) continue; // had got ≠ have got
          const f = [a, mid, b].filter(Boolean).join(" "), e = map.get(f);
          if (e) return { from: st, len, src, entries: rdRank(e, f, /(ed|ing)$/.test(words[st].n) && a !== words[st].n) };
        }
      }
    }
  }
  const all = rdWordForms(w.n), poss = /'s$/.test(w.n) && !RD_FUNC.has(w.n);
  // Słowa gramatyczne najpierw tylko w formie z tekstu (evening ≠ even), z odciętą końcówką – na samym końcu (thanked → thank).
  for (const [src, map, only] of [maps[0], [...maps[1], true], maps[2], maps[1]]) {
    if (only) { const e = map.get(w.n); if (e) return { from: i, len: 1, src, entries: e }; continue; }
    // Gdy sama forma z tekstu (albo bez 's) jest w słowniczku, dokładamy tylko pewne formy podstawowe: nieregularne
    // (left → leave) i czasowniki przy -ed / -ing (meeting → meet) – bez „evening → even”, „news → new”.
    const exact = map.has(all[0]) || (poss && map.has(all[1]));
    const forms = !exact ? all : all.filter((f, k) => !k || (poss && k === 1) || rdIrr.get(w.n) === f || RD_SPECIAL[w.n] === f
      || (/(ed|ing)$/.test(w.n) && (map.get(f) || []).some(rdIsVerb)));
    const es = [];
    forms.forEach((f) => (map.get(f) || []).forEach((e) => { if (!es.some((x) => x.k === e.k && x.pl === e.pl && x.en === e.en)) es.push(e); }));
    // -ing po „be” (I'm meeting, was coming) – czasownik, nawet gdy jest rzeczownik o tej formie (meeting = spotkanie).
    const afterBe = i > 0 && /^(am|is|are|was|were|be|been|isn't|aren't|wasn't|weren't)$|'(m|re|s)$/.test(words[i - 1].n);
    if (es.length) return { from: i, len: 1, src, entries: rdRank(es, forms.find((f) => map.has(f)), /(ed|ing)$/.test(w.n) && (!map.has(w.n) || (afterBe && /ing$/.test(w.n)))) };
  }
  if (w.n.includes("-")) { // twenty-six, five-star: tłumaczenia części
    const parts = w.n.split("-").map((p) => { const x = RD_FUNC.get(p) || rdIndex().get(p) || rdIndex().get(rdCands(p)[1] || ""); return x ? x[0].pl.split(/[;,]/)[0].trim() : null; });
    if (parts.every(Boolean)) return { from: i, len: 1, src: "parts", entries: [{ en: w.t, pl: parts.join(" + "), src: "parts" }] };
  }
  return null;
}
// Opis źródła tłumaczenia w dymku.
function rdSrcLabel(e) {
  if (e.src === "gloss") return "ze słowniczka tego tekstu";
  if (e.src === "func") return "słowo gramatyczne";
  if (e.src === "parts") return "złożone z części";
  const d = DECKS.find((x) => x.id === e.deck);
  return d ? (d.lesson ? `słówka lekcji ${esc(d.title)}` : `Słownictwo: ${esc(d.title)}`) : "";
}
const rdOpen = (r) => !!state.done[r.after];
const rdKey = (r) => "read:" + r.id;
const rdWordCount = (r) => r.text.join(" ").split(/\s+/).filter(Boolean).length;
const rdMeta = (r) => `${rdWordCount(r)} słów · ${r.questions.length} ${plural(r.questions.length, "pytanie", "pytania", "pytań")}`;
export const readingHomeView = () => ({ html: renderReadingHome(), title: `Czytanki – ${SITE_TITLE}` });
export const readingView = (id) => ({ html: renderReading(id), title: RD_BY_ID[id] ? `${RD_BY_ID[id].title} – Czytanki` : `Czytanki – ${SITE_TITLE}`, mount: () => bindReading(id) });
function renderReadingHome() {
  const head = `<div class="hero"><h1>${icon("book-open")} Czytanki</h1><p>Krótkie teksty z życia – dom, praca, podróże, zakupy – z pytaniami sprawdzającymi zrozumienie. Kliknij dowolne słowo, żeby zobaczyć tłumaczenie i dodać je do fiszek. Tekst możesz też odsłuchać.</p></div>`;
  if (!READING.length) return `<div class="page">${head}<div class="card empty m-empty"><b>Na razie nie ma czytanek.</b></div></div>`;
  const open = READING.filter(rdOpen).length;
  return `<div class="page reading-home">${head}
      <div class="card m-today rd-info"><div><b>Odblokowane: ${open} z ${READING.length}</b><span>Czytanka otwiera się po lekcji, która wprowadza ostatnią potrzebną konstrukcję – tekst ma tylko gramatykę i słówka, które już znasz (nieliczne nowe słowa mają tłumaczenie po kliknięciu). Zablokowaną też możesz otworzyć, ale może być trudna.</span></div></div>
      ${unitListHtml(READING, { base: "#/czytanki", key: rdKey, meta: rdMeta })}</div>`;
}
function rdTextHtml(r) {
  const { paras, words } = rdParse(r);
  return paras.map((ss) => `<p>${ss.map((x) => `<span class="rd-s" data-s="${x.s}">${x.toks.map((t) => t.p != null ? esc(t.p)
    : `<button type="button" class="rd-w" data-w="${t.w}" tabindex="${t.w ? -1 : 0}">${esc(words[t.w].t)}</button>`).join("")}</span>`).join(" ")}</p>`).join("");
}
function renderReading(id) {
  const r = RD_BY_ID[id];
  if (!r) return `<div class="page empty"><h1>Nie ma takiej czytanki</h1><p><a href="#/czytanki">← Wszystkie czytanki</a></p></div>`;
  const i = READING.indexOf(r), next = READING[i + 1], l = r.lesson;
  const tts = "speechSynthesis" in window;
  return `<div class="page reading" data-id="${r.id}">
      <p class="rd-back"><a href="#/czytanki">← Wszystkie czytanki</a></p>
      <header class="rd-head">
        <div class="rd-tags">${badge(r.level)}${r.topic ? `<span class="unit-topic">${esc(r.topic)}</span>` : ""}<span class="muted">${rdMeta(r)}</span></div>
        <h1 lang="en">${esc(r.title)}</h1>
        <p class="rd-pl">${esc(r.titlePl)}</p>
      </header>
      ${rdOpen(r) ? "" : `<div class="callout warning"><h3>${icon("lock")} Ta czytanka jest po lekcji ${lessonNo(l)}</h3><div class="prose"><p>Tekst używa konstrukcji z lekcji <a href="#/lesson/${l.id}">${lessonNo(l)}. ${esc(l.title)}</a>, której jeszcze nie masz przerobionej. Możesz go przeczytać już teraz, ale mogą być w nim rzeczy, których jeszcze nie znasz.</p></div></div>`}
      <div class="rd-tools">
        ${tts ? `<button type="button" class="btn primary rd-play" aria-pressed="false">${icon("play")} <span>Przeczytaj na głos</span></button><a href="#" class="rd-voice" data-voice-open>${icon("voice")} Ustawienia głosu</a>` : ""}
        <span class="rd-hint">${icon("bulb")} Kliknij słowo, żeby zobaczyć tłumaczenie.</span>
      </div>
      ${tts ? `<div class="tts-warn">${ttsWarnHtml()}</div>` : ""}
      <article class="card rd-text" lang="en" aria-label="Tekst – kliknij słowo, żeby zobaczyć tłumaczenie">${rdTextHtml(r)}</article>
      ${exercisesShell("Pytania do tekstu", { id: "rdQ", intro: "Odpowiedz na pytania – możesz zaglądać do tekstu. Złe odpowiedzi trafią do „Moich błędów”." })}
      <div class="rd-next">${next ? `<a class="btn" href="#/czytanki/${next.id}">Następna czytanka: <span lang="en">${esc(next.title)}</span> →</a>` : `<a class="btn" href="#/czytanki">Wszystkie czytanki →</a>`}</div>
    </div>`;
}
// Czytanie na głos zdanie po zdaniu z podświetleniem (speakSeq). Kończy się samo, po „Zatrzymaj”, po zmianie strony
// i wtedy, gdy coś innego zacznie mówić (głośnik w dymku).
let rdSeq = null;
function rdReadAloud(page) {
  const sents = [...page.querySelectorAll(".rd-s")], btn = page.querySelector(".rd-play");
  const clear = () => sents.forEach((s) => s.classList.remove("rd-on"));
  btn.setAttribute("aria-pressed", "true");
  btn.innerHTML = `${icon("stop")} <span>Zatrzymaj</span>`;
  rdSeq = speakSeq(sents.map((s) => ({ text: s.textContent })), {
    onStep: (i) => { clear(); sents[i].classList.add("rd-on"); scrollToRead(sents[i]); },
    onEnd: () => { clear(); btn.setAttribute("aria-pressed", "false"); btn.innerHTML = `${icon("play")} <span>Przeczytaj na głos</span>`; },
    onFail: (err) => syncTtsWarn(err),
  });
}
// Dymek z tłumaczeniem – w stronie (position: absolute), pod słowem albo nad nim, zawsze w szerokości ekranu.
function rdPopHtml(r, res, surface) {
  const e = res ? res.entries[0] : null;
  const name = !e && /^\p{Lu}/u.test(surface);
  if (!e) return `<div class="rd-pop-h"><b lang="en">${esc(surface)}</b>${speakBtn(surface)}<button type="button" class="icon-btn rd-pop-x" aria-label="Zamknij">${icon("x")}</button></div>
      <div class="rd-pop-pl muted">${name ? "Imię albo nazwa własna." : "Brak tego słowa w słowniczku."}</div>`;
  const head = e.src === "func" || e.src === "parts" ? surface : e.en.replace(/\((BrE|AmE)\)/g, "").split(/\s+[–—]\s+/)[0].trim(); // „shelf – shelves” → shelf
  const say = e.src === "func" || e.src === "parts" ? surface : rdVariants(e.en)[0] || surface;
  const also = res.entries.slice(1).filter((x, k, a) => !e.pl.includes(x.pl) && a.findIndex((y) => y.pl === x.pl) === k).slice(0, 3);
  const k = e.k && WORDS.has(e.k) ? e.k : null, inSrs = k && state.srs[k];
  const base = rdNorm(head) !== rdNorm(surface) ? `<span class="rd-pop-base" lang="en">${esc(head)}</span>` : "";
  return `<div class="rd-pop-h"><b lang="en">${esc(surface)}</b>${speakBtn(say)}<button type="button" class="icon-btn rd-pop-x" aria-label="Zamknij">${icon("x")}</button></div>
      ${base ? `<div class="rd-pop-from">forma podstawowa: ${base}</div>` : ""}
      <div class="rd-pop-pl">${esc(e.pl)}</div>
      ${also.length ? `<div class="rd-pop-also">też: ${also.map((x) => (rdNorm(x.en) !== rdNorm(e.en) ? `<span lang="en">${esc(x.en)}</span> – ` : "") + esc(x.pl)).join("; ")}</div>` : ""}
      <div class="rd-pop-src">${rdSrcLabel(e)}</div>
      ${k ? `<div class="rd-pop-act" data-k="${esc(k)}">${inSrs ? `<span class="rd-added">${icon("check")} W fiszkach · powtórka ${dueLabel(inSrs)}</span>` : `<button type="button" class="btn small rd-add">${icon("plus")} Dodaj do fiszek</button>`}</div>` : ""}`;
}
function rdPlacePop(page, pop, word) {
  const pr = page.getBoundingClientRect(), wr = word.getBoundingClientRect(), vw = document.documentElement.clientWidth;
  pop.style.left = "0px"; pop.style.top = "0px";
  pop.style.width = `${Math.min(320, vw - 16)}px`; // 100vw w CSS liczyłoby też pasek przewijania
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = wr.left + wr.width / 2 - pw / 2;
  left = Math.max(8, Math.min(left, vw - pw - 8));
  const below = wr.bottom + 8 + ph <= innerHeight || wr.top - 8 - ph < 64;
  const top = below ? wr.bottom + 8 : wr.top - 8 - ph;
  pop.style.left = `${left - pr.left}px`;
  pop.style.top = `${top - pr.top}px`;
  pop.classList.toggle("above", !below);
}
function bindReading(id) {
  const page = $(".page.reading"), r = RD_BY_ID[id];
  if (!page || !r) return;
  const box = $("#rdQ");
  const run = () => {
    renderExercises(box, r.questions.map((ex) => ({ ex, lesson: r.lesson })), { key: rdKey(r) });
  };
  run();
  box.querySelector(".retry").addEventListener("click", () => { run(); box.scrollIntoView(); });
  const text = page.querySelector(".rd-text");
  let pop = null, cur = null;
  const close = (focus) => {
    if (pop) { pop.remove(); pop = null; }
    if (cur) { cur.classList.remove("on"); cur.removeAttribute("aria-expanded"); if (focus) cur.focus(); cur = null; }
  };
  const open = (word, kb) => {
    close();
    const i = +word.dataset.w, res = rdLookup(r, i), { words } = rdParse(r);
    const span = res && res.len > 1 ? words.slice(res.from, res.from + res.len).map((x) => x.t).join(" ") : words[i].t;
    cur = word;
    word.classList.add("on");
    word.setAttribute("aria-expanded", "true");
    pop = document.createElement("div");
    pop.className = "card rd-pop";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", `Tłumaczenie: ${span}`);
    pop.tabIndex = -1;
    pop.innerHTML = rdPopHtml(r, res, span);
    page.appendChild(pop);
    rdPlacePop(page, pop, word);
    if (kb) pop.focus();
  };
  text.addEventListener("click", (e) => {
    const w = e.target.closest(".rd-w");
    if (!w) return;
    if (w === cur) { close(); return; }
    open(w, e.detail === 0);
  });
  text.addEventListener("keydown", (e) => {
    const w = e.target.closest(".rd-w");
    if (!w) return;
    const all = [...text.querySelectorAll(".rd-w")], i = all.indexOf(w);
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key];
    if (to == null) { if (e.key === "Escape" && pop) { e.preventDefault(); close(true); } return; }
    e.preventDefault();
    const t = all[Math.max(0, Math.min(all.length - 1, to))];
    w.tabIndex = -1; t.tabIndex = 0; t.focus();
  });
  page.addEventListener("click", (e) => {
    if (!pop) return;
    if (e.target.closest(".rd-pop-x")) { close(true); return; }
    const add = e.target.closest(".rd-add");
    if (add) {
      const k = add.parentNode.dataset.k;
      if (!state.srs[k]) {
        state.srs[k] = { box: 1, due: today(), deck: RD_DECK.id, first: "", lastSeen: new Date().toISOString() };
        store.set("srs", state.srs);
        syncTodayCounts();
      }
      add.parentNode.innerHTML = `<span class="rd-added" tabindex="-1">${icon("check")} Dodano do fiszek · powtórka ${dueLabel(state.srs[k])}</span>`;
      pop.querySelector(".rd-added").focus();
      return;
    }
    if (!e.target.closest(".rd-pop") && !e.target.closest(".rd-w")) close();
  });
  page.addEventListener("keydown", (e) => { if (e.key === "Escape" && pop && pop.contains(e.target)) { e.preventDefault(); close(true); } });
  const onResize = () => { if (pop && cur) rdPlacePop(page, pop, cur); };
  window.addEventListener("resize", onResize);
  const play = page.querySelector(".rd-play");
  if (play) play.addEventListener("click", () => { if (seqIs(rdSeq)) seqStop(); else rdReadAloud(page); });
  return () => window.removeEventListener("resize", onResize);
}
// Strona główna: najnowsza odblokowana czytanka bez wyniku.
export function rdNewHtml() {
  const fresh = READING.filter((x) => rdOpen(x) && !state.scores[rdKey(x)]);
  const r = fresh[fresh.length - 1];
  if (!r) return "";
  return `<a class="card rd-new" href="#/czytanki/${r.id}"><span class="f-ico">${icon("book-open")}</span>
      <span class="rd-new-txt"><b>Nowa czytanka: <span lang="en">${esc(r.title)}</span></b><span>${badge(r.level)} ${esc(r.titlePl)} · ${rdMeta(r)}${fresh.length > 1 ? ` · i ${fresh.length - 1} ${plural(fresh.length - 1, "inna czeka", "inne czekają", "innych czeka")} w Czytankach` : ""}</span></span>
      <span class="btn small primary">Czytaj →</span></a>`;
}
