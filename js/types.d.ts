// Typy danych kursu i stanu ucznia – tylko dla sprawdzania typów (npm run typecheck = tsc --noEmit), nie trafiają na stronę.
// Plik globalny (bez import/export): nazwy typów są dostępne w JSDoc wszystkich modułów js/, np. /** @param {Lesson} l */.
// Format danych opisują tools/FORMAT.md (lekcje, czytanki, dialogi, rozmowy) i tools/PRACTICE-FORMAT.md (ćwiczenia,
// słownictwo). Pola dopisywane przy starcie (js/data.js) są opisane przy typach z dopiskiem „(data.js)”.

type Level = "A1" | "A2" | "B1" | "B2";
type Dict<T> = Record<string, T>;

// ---------- Lekcje: sekcje teorii (tools/FORMAT.md, „Typy sekcji”) ----------
interface FormulaRow { label: string; formula: string; example?: string; examplePl?: string }
interface ExampleItem { en: string; pl?: string; note?: string }
interface MistakeItem { wrong: string; right: string; why?: string; fix?: string[] }
/** Przykład w porównaniu: sam angielski albo { en, pl }. */
type CompareExample = string | { en: string; pl?: string };
interface CompareItem { label: string; html?: string; examples?: CompareExample[] }
type SectionType = "text" | "formula" | "examples" | "table" | "tip" | "warning" | "mistakes" | "compare";
/** Sekcja teorii. Jeden typ z polami opcjonalnymi – kod czyta pola zależnie od `type` (formula → rows, table → headers + rows…). */
interface Section {
  type: SectionType;
  title?: string;
  /** text / tip / warning */
  html?: string;
  /** formula: wiersze z budową; table: wiersze komórek. */
  rows?: any[];
  /** table */
  headers?: string[];
  /** examples: ExampleItem, mistakes: MistakeItem, compare: CompareItem. */
  items?: any[];
}

// ---------- Zadania (tools/FORMAT.md „Ćwiczenia”, tools/PRACTICE-FORMAT.md „Typy zadań”) ----------
type ExerciseType = "choice" | "gap" | "write" | "order" | "dictation" | "finderr";
/** Odpowiedzi w składni z (opcjonalne) i {a|b}; luka z kilkoma miejscami – tablica wariantów dla każdej luki. */
type Answers = string[] | string[][];
/**
 * Zadanie dowolnego typu. Kod (sprawdzanie, „Moje błędy”, trening) obsługuje wszystkie typy razem, więc pola są
 * opcjonalne; dokładny kształt każdego typu – ChoiceExercise, GapExercise, WriteExercise, OrderExercise, DictationTask,
 * FindErrTask niżej.
 */
interface Exercise {
  type: ExerciseType;
  q?: string;
  /** choice */
  options?: string[];
  /** choice: indeks poprawnej opcji (od 0). */
  answer?: number;
  /** gap / write / order / dictation / finderr */
  answers?: Answers;
  explain?: string;
  hint?: string;
  /** Krótka etykieta polecenia („Przetłumacz”); trening dopisuje też nazwę zestawu (withTask). */
  task?: string;
  /** order: dodatkowe kafelki-pułapki. */
  extra?: string[];
  /** order: nie zmieniaj pierwszej litery na małą. */
  keepCase?: boolean;
  /** order: gotowe kafelki zamiast podziału answers[0] (trener odmiany). */
  words?: string[];
  /** dictation: zdanie czytane przez lektora. */
  say?: string;
  /** dictation: tłumaczenie. */
  pl?: string;
  /** finderr: wyjaśnienie z sekcji „mistakes”. */
  why?: string;
  /** finderr: HTML zdania z błędnym miejscem w <b>. */
  html?: string;
  note?: string;
  model?: string;
  wrongHtml?: string;
  rightHtml?: string;
  /** finderr: zdanie bez błędu („Tu nie ma błędu”). */
  ok?: boolean;
  /** finderr: wynik feIsStrict zapamiętany w zadaniu (js/check.js). */
  strict?: boolean;
  [extra: string]: any;
}
interface ChoiceExercise extends Exercise { type: "choice"; q: string; options: string[]; answer: number }
interface GapExercise extends Exercise { type: "gap"; q: string; answers: Answers }
interface WriteExercise extends Exercise { type: "write"; q: string; answers: string[] }
interface OrderExercise extends Exercise { type: "order"; q: string; answers: string[] }
/** Zdanie do dyktanda (data.js: z przykładów lekcji i kwestii dialogów). */
interface DictationTask extends Exercise { type: "dictation"; say: string; answers: string[]; pl: string; explain: string }
/** Znajdź błąd (js/tasks.js, buildFinds). */
interface FindErrTask extends Exercise { type: "finderr"; q: string; html: string; answers: string[]; model: string; why: string; note: string }
interface FindPair { bad: FindErrTask; good: FindErrTask }

// ---------- Słownictwo ----------
interface VocabItem { en: string; pl: string; ex?: string; exPl?: string; note?: string; /** część mowy (rzadko) */ pos?: string }
/** Słówka „znam” jednej talii: słowo (en bez znaczników) → 1 / true (zapisywane jako 1). */
type KnownWords = Dict<boolean | number>;
interface LessonVocab { intro?: string; items: VocabItem[] }
interface PracticeSet { title: string; instruction?: string; items: Exercise[] }
/** data/practice/<id>.js → window.PRACTICE[id] */
interface Practice { requires?: string[]; vocab?: LessonVocab; practice?: PracticeSet[]; test?: Exercise[] }
/** data/vocab/*.js → window.VOCAB */
interface VocabTopic {
  id: string; title: string; titlePl: string; level: Level; icon?: string; intro?: string;
  groups: { title: string; intro?: string; items: VocabItem[] }[];
}

/** Lekcja z data/lessons/<id>.js (window.LESSONS). */
interface LessonData {
  id: string; title: string; titlePl: string; level: Level; category: string; summary: string;
  sections: Section[]; exercises: Exercise[];
  vocab?: LessonVocab | null; practice?: PracticeSet[]; test?: Exercise[]; requires?: string[];
}
/** Lekcja po połączeniu z ćwiczeniami (data.js: PATH, BY_ID). */
interface Lesson extends LessonData {
  vocab: LessonVocab | null; practice: PracticeSet[]; test: Exercise[]; requires: string[];
  /** Kolejność w window.LESSONS. */
  _i: number;
  /** Zdania do dyktanda (data.js). */
  dict: DictationTask[];
  /** Pary „Znajdź błąd” (data.js). */
  finds: FindPair[];
}

/** data/checkpoints.js → window.CHECKPOINTS */
interface CheckpointData { id: string; title: string; after: string; [extra: string]: any }
/** Sprawdzian po przygotowaniu (data.js). */
interface Checkpoint extends CheckpointData { n: number; lessons: Lesson[]; prior: Lesson[]; level: Level }

// ---------- Czytanki, dialogi, rozmowy ----------
interface UnitData { id: string; title: string; titlePl: string; level: Level; after: string; topic?: string; glossary?: Dict<string> }
interface ReadingData extends UnitData { text: string[]; questions?: Exercise[] }
interface Reading extends ReadingData { lesson: Lesson; glossary: Dict<string>; questions: Exercise[]; _i: number; /** Tekst podzielony na zdania i słowa (views/reading.js, rdParse). */ _parsed?: RdParsed }
/** Czytanka podzielona na akapity → zdania → kawałki (interpunkcja p albo numer słowa w); words – słowa: t – z tekstu, n – do szukania, s – nr zdania. */
interface RdParsed {
  paras: { s: number; text: string; toks: ({ p: string; w?: undefined } | { w: number; p?: undefined })[] }[][];
  words: { t: string; n: string; s: number }[];
}
interface Person { name: string; g?: "m" | "f" }
interface DialogueLine { who: string; en: string; pl?: string }
interface DialogueData extends UnitData { setting?: string; people?: Dict<Person>; lines: DialogueLine[]; questions?: Exercise[] }
interface Dialogue extends DialogueData { lesson: Lesson; people: Dict<Person>; glossary: Dict<string>; questions: Exercise[]; dict: DictationTask[]; _i: number }
interface ChatOption { en: string; pl?: string; ok?: boolean; next?: string; feedback?: string }
interface ChatNode { say: string; pl?: string; options?: ChatOption[]; end?: "ok" | "fail"; note?: string }
interface ChatData extends UnitData { setting?: string; goal?: string; partner?: Person; start: string; nodes: Dict<ChatNode> }
interface Chat extends ChatData { lesson: Lesson; partner: Partial<Person>; glossary: Dict<string>; _i: number; steps: number }

// ---------- Rejestry z data.js ----------
/** Wpis rejestru zadań do „Moich błędów” (TASKS). */
interface TaskRef { ex: Exercise; lesson: Lesson; src: string; instr: string; reading?: Reading; dialogue?: Dialogue }
/** Talia fiszek: słownictwo lekcji, dział słownictwa albo „Słówka z czytanek”. */
interface Deck {
  id: string; items: VocabItem[]; title: string; level: string; href: string;
  lesson?: Lesson;
  /** Słowa trafiają do powtórek tylko przez „Dodaj do fiszek”. */
  manual?: boolean;
  /** Klucze słów (dopisywane w data.js po zbudowaniu talii). */
  keys: string[];
}

// ---------- Stan ucznia (localStorage eng-*, js/storage.js) ----------
interface Score { correct: number; total: number }
/** eng-mistakes: pudełko zadania z błędem (js/srs.js). */
interface MistakeEntry { box: number; due: string; wrong?: number; lastSeen?: string }
/** eng-srs: pudełko słówka (js/srs.js). */
interface WordEntry { box: number; due: string; deck?: string; first?: string; lastSeen?: string }
/** eng-activity: jeden dzień dziennika (js/activity.js). */
interface ActivityDay { t?: number; ok?: number; w?: number; a?: number }
interface AppState {
  done: Dict<boolean>;
  scores: Dict<Score>;
  levels: string[];
  showPl: boolean;
  /** Talia → słowo → „znam”. */
  known: Dict<KnownWords>;
  mistakes: Dict<MistakeEntry>;
  srs: Dict<WordEntry>;
  srsNew: number;
  activity: Dict<ActivityDay>;
  goal: number;
}
/** eng-voice */
interface VoiceCfg { accent: "GB" | "US"; voice: string; rate: number }

// ---------- Widoki i router ----------
/** Widok zwracany przez views/*.js; mount może zwrócić funkcję sprzątającą (router woła ją przy zmianie strony). */
interface View { html: string; title: string; mount?: (el: HTMLElement) => void | (() => void) }
interface Route { match: RegExp; view: (h: string) => View }

// ---------- Globalne ----------
interface Window {
  LESSONS?: LessonData[];
  PRACTICE?: Dict<Practice>;
  VOCAB?: VocabTopic[];
  CHECKPOINTS?: CheckpointData[];
  READING?: ReadingData[];
  DIALOGUES?: DialogueData[];
  CHATS?: ChatData[];
  /** Funkcje i dane dla testów w przeglądarce (js/app.js). */
  __ENG?: any;
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
