// Pisownia brytyjska i amerykańska (moduł bez DOM; testy: tests/spelling.test.mjs).
// Obie pisownie są poprawne niezależnie od wybranego akcentu lektora: przy sprawdzaniu odpowiedzi (matchOne, diffHtml)
// i wymowy (prTokens) każde słowo sprowadzamy do jednej postaci (amerykańskiej). Słowa wypisane jawnie, a nie same
// reguły („-our → -or”, „-ise → -ize”), bo four/hour/your/tour i promise/advise/exercise/surprise piszemy tak samo.
const SP_OUR = "colour favour flavour neighbour behaviour humour honour labour harbour rumour tumour vapour odour armour savour endeavour vigour rigour clamour splendour valour parlour".split(" ");
const SP_RE = "cent theat met kilomet centimet millimet lit fib calib somb meag spect lust sab"; // centre(s/d) → center(s/ed)
const SP_ISE = "apolog recogn real organ critic memor priorit modern special marginal emphas summar sympath minim maxim categor final util social character civil standard mobil legal visual author custom optim ideal familiar normal personal popular public scrutin stabil symbol theor harmon hospital industrial jeopard legitim local monopol neutral penal privat rational revolution steril subsid econom agon antagon fantas patron colon global digit energ immun mesmer moistur vapor vandal"; // -ise(s/d/ing/ation/er) → -ize…
export const SP_LL = "travel cancel label model fuel quarrel dial level signal total equal marvel counsel duel tunnel channel pedal shovel swivel grovel snorkel yodel funnel jewel"; // travelled → traveled
const SPELL = {};
("grey gray greys grays greyer grayer greyest grayest greyish grayish mum mom mums moms tyre tire tyres tires cheque check cheques checks " +
  "practise practice practises practices practised practiced practising practicing licence license licences licenses defence defense " +
  "defences defenses offence offense offences offenses pretence pretense pyjamas pajamas aeroplane airplane aeroplanes airplanes " +
  "storey story storeys stories programme program programmes programs catalogue catalog catalogues catalogs dialogue dialog dialogues dialogs " +
  "analogue analog cosy cozy cosier cozier cosiest coziest cosiness coziness mould mold moulds molds mouldy moldy plough plow ploughs plows " +
  "aluminium aluminum sceptical skeptical sceptic skeptic moustache mustache doughnut donut doughnuts donuts kerb curb yoghurt yogurt " +
  "judgement judgment ageing aging manoeuvre maneuver manoeuvres maneuvers enrol enroll enrols enrolls enrolment enrollment fulfil fulfill " +
  "fulfils fulfills fulfilment fulfillment skilful skillful skilfully skillfully wilful willful instalment installment jewellery jewelry " +
  "analyse analyze analyses analyzes analysed analyzed analysing analyzing paralyse paralyze paralysed paralyzed")
  .split(" ").forEach((w, i, a) => { if (i % 2 === 0) SPELL[w] = a[i + 1]; });
const SP_OUR_RE = new RegExp(`^(${SP_OUR.join("|")})(.*)$`), SP_RE_RE = new RegExp(`^(${SP_RE.replace(/ /g, "|")})re(s|d)?$`);
const SP_ISE_RE = new RegExp(`^(${SP_ISE.replace(/ /g, "|")})is(e|es|ed|ing|ation|ations|er|ers)$`);
const SP_LL_RE = new RegExp(`^(${SP_LL.replace(/ /g, "|")})l(ed|ing|er|ers|or|ors|ous)$`);
export function spellFold(w) {
  if (SPELL[w]) return SPELL[w];
  let m;
  if ((m = w.match(SP_OUR_RE))) return m[1].slice(0, -3) + "or" + m[2];
  if ((m = w.match(SP_RE_RE))) return m[1] + "er" + (m[2] === "d" ? "ed" : m[2] || "");
  if ((m = w.match(SP_ISE_RE))) return m[1] + "iz" + m[2];
  if ((m = w.match(SP_LL_RE))) return m[1] + m[2];
  return w;
}
// Całe zdanie (słowa rozdzielone pojedynczą spacją, po normalize()).
export const spellFoldStr = (s) => s.split(" ").map(spellFold).join(" ");
