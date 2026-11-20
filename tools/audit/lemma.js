const IRR = `be was were been;have had had;do did done;go went gone;get got got gotten;make made made;take took taken;see saw seen;come came come;know knew known;think thought thought;give gave given;find found found;tell told told;say said said;leave left left;feel felt felt;bring brought brought;buy bought bought;begin began begun;keep kept kept;hold held held;write wrote written;stand stood stood;hear heard heard;let let let;mean meant meant;set set set;meet met met;run ran run;pay paid paid;sit sat sat;speak spoke spoken;lie lay lain;lead led led;read read read;grow grew grown;lose lost lost;fall fell fallen;send sent sent;build built built;understand understood understood;draw drew drawn;break broke broken;spend spent spent;cut cut cut;rise rose risen;drive drove driven;wear wore worn;choose chose chosen;eat ate eaten;drink drank drunk;sleep slept slept;swim swam swum;sing sang sung;fly flew flown;forget forgot forgotten;teach taught taught;catch caught caught;win won won;steal stole stolen;wake woke woken;ring rang rung;throw threw thrown;hide hid hidden;shake shook shaken;fight fought fought;sell sold sold;put put put;hit hit hit;hurt hurt hurt;cost cost cost;shut shut shut;become became become;blow blew blown;bite bit bitten;ride rode ridden;feed fed fed;lend lent lent;light lit lit;show showed shown;forgive forgave forgiven;freeze froze frozen;dig dug dug;hang hung hung;stick stuck stuck;sweep swept swept;bend bent bent;burn burnt burnt;dream dreamt dreamt;learn learnt learnt;smell smelt smelt;spell spelt spelt;spill spilt spilt;deal dealt dealt;quit quit quit;seek sought sought;tear tore torn;bet bet bet;bleed bled bled;arise arose arisen;undo undid undone;overcome overcame overcome;oversleep overslept overslept;mistake mistook mistaken;withdraw withdrew withdrawn;upset upset upset;shoot shot shot;shine shone shone;sink sank sunk;slide slid slid;split split split;spread spread spread;strike struck struck;swear swore sworn;lay laid laid;can could;will would;shall should;may might;fit fit fit;forbid forbade forbidden;bear bore born;prove proved proven`
  .split(';').map((l) => l.split(' '));
const IRRMAP = {};
IRR.forEach(([b, ...f]) => f.forEach((x) => (IRRMAP[x] = IRRMAP[x] || b)));
const SPECIAL = { children: 'child', people: 'person', men: 'man', women: 'woman', feet: 'foot', teeth: 'tooth', mice: 'mouse', geese: 'goose', knives: 'knife', wives: 'wife', lives: 'life', leaves: 'leaf', shelves: 'shelf', wolves: 'wolf', halves: 'half', thieves: 'thief', loaves: 'loaf', potatoes: 'potato', tomatoes: 'tomato', heroes: 'hero', better: 'good', best: 'good', worse: 'bad', worst: 'bad', further: 'far', farther: 'far', is: 'be', am: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be', has: 'have', does: 'do' };
function lem(w) {
  w = w.toLowerCase().replace(/’/g, "'").replace(/'s$|'$/, '');
  return SPECIAL[w] || IRRMAP[w] || w;
}
function cands(w) {
  w = lem(w);
  const c = new Set([w]);
  const add = (x) => { if (x && x.length > 1) { c.add(x); if (IRRMAP[x]) c.add(IRRMAP[x]); } };
  if (/ies$/.test(w)) add(w.slice(0, -3) + 'y');
  if (/es$/.test(w)) add(w.slice(0, -2));
  if (/s$/.test(w)) add(w.slice(0, -1));
  if (/ied$/.test(w)) add(w.slice(0, -3) + 'y');
  if (/ed$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/(.)\1ed$/.test(w)) add(w.slice(0, -3)); }
  if (/ing$/.test(w)) { const s = w.slice(0, -3); add(s); add(s + 'e'); if (/(.)\1$/.test(s)) add(s.slice(0, -1)); if (w.endsWith('ying')) add(s.slice(0, -1) + 'ie'); }
  if (/ier$/.test(w)) add(w.slice(0, -3) + 'y');
  if (/iest$/.test(w)) add(w.slice(0, -4) + 'y');
  if (/er$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); add(w.slice(0, -2) + 'e'); if (/(.)\1er$/.test(w)) add(w.slice(0, -3)); }
  if (/est$/.test(w)) { add(w.slice(0, -3)); add(w.slice(0, -2)); add(w.slice(0, -3) + 'e'); if (/(.)\1est$/.test(w)) add(w.slice(0, -4)); }
  if (/ily$/.test(w)) add(w.slice(0, -3) + 'y');
  if (/ly$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -2) + 'le'); }
  if (/n't$/.test(w)) add(w.slice(0, -3));
  return [...c];
}
// words taught as grammar (pronouns, articles, modals, prepositions, numbers...) – not expected in vocab lists
const FUNC = new Set(`a an the i you he she it we they me him her us them my your his its our their mine yours hers ours theirs myself yourself himself herself itself ourselves yourselves themselves be have do not no yes and or but so because if when while than then that this these those there here what who whom whose which where why how to of in on at for with from by about into onto out up down off over under after before since until till during through between among without within against around above below near across along behind beside beyond inside outside past per some any every each all both either neither none much many more most few little less lot lots one ones other another such own same very too also just only even still already yet ever never always often usually sometimes rarely seldom hardly else as like n't s ll d ve re m t o'clock ok okay mr mrs ms dr hi hello bye goodbye please thank thanks sorry oh well zero two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million first second third fourth fifth tenth somebody someone something somewhere anybody anyone anything anywhere everybody everyone everything everywhere nobody nothing nowhere let can could will would shall should may might must ought`.split(/\s+/));
module.exports = { lem, cands, FUNC, IRRMAP };
