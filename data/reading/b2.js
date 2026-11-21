window.READING = window.READING || [];
window.READING.push(
  {
    id: "job-interview", title: "The job interview", titlePl: "Rozmowa o pracę", level: "B2", after: "modals-deduction", topic: "Praca",
    text: [
      "When Ola walked into the room, three people were already sitting at a long table. She had been preparing for this interview for weeks, but her hands were shaking. “Relax,” she told herself. “They must have read your CV, so they know you've got the right experience.”",
      "The interview started well. The manager, a tall man in a grey suit, asked her about her previous job and why she wanted to leave. Ola explained that she had been working for the same company for six years and that she was ready for a new challenge.",
      "Then the woman on the left asked a question that Ola hadn't expected: “Where do you see yourself in five years' time?” Ola smiled. “By then, I'll have finished my master's degree, and I hope I'll be leading a small team,” she answered.",
      "The third person, a young man, hadn't said a word. He was writing notes all the time. “He can't be very important,” Ola thought. “He might be an assistant.”",
      "At the end, the manager thanked her and said they would contact her within a week. As Ola was leaving, the young man stood up and shook her hand. “It was a pleasure to meet you,” he said. “I'm the company's director. I'll be your boss if you get the job.” Ola went red. She must have looked very surprised, because he laughed. “Don't worry. Everyone thinks I'm the assistant.”",
      "Two days later, Ola's phone rang. She had got the job.",
    ],
    glossary: { "CV": "CV, życiorys", "manager": "kierownik, menedżer", "previous": "poprzedni", "suit": "garnitur", "challenge": "wyzwanie", "master's degree": "tytuł magistra, studia magisterskie", "lead": "kierować, prowadzić (lead a team = kierować zespołem)", "note": "notatka", "assistant": "asystent, asystentka", "director": "dyrektor", "pleasure": "przyjemność (it was a pleasure to meet you = miło było pana / panią poznać)", "go red": "zaczerwienić się" },
    questions: [
      { type: "choice", q: "How did Ola feel at the start of the interview?", options: ["relaxed", "nervous", "bored"], answer: 1,
        explain: "„Her hands were shaking.” i „Relax,” she told herself. – denerwowała się." },
      { type: "gap", q: "Before the interview, Ola had been working for the same company for ___ years.", answers: ["six", "6"],
        explain: "„She had been working for the same company for six years” – Past Perfect Continuous w mowie zależnej." },
      { type: "choice", q: "What does Ola hope she will be doing in five years' time?", options: ["working for the same company", "leading a small team", "studying abroad"], answer: 1,
        explain: "„I hope I'll be leading a small team” – Future Continuous: co będzie w trakcie w przyszłości." },
      { type: "choice", q: "What did Ola think about the young man during the interview?", options: ["He must be the director.", "He might be an assistant.", "He can't be from the company."], answer: 1,
        explain: "„He can't be very important. He might be an assistant.” – zgadywała, że to asystent." },
      { type: "choice", q: "Who was the young man really?", options: ["an assistant", "the manager's son", "the company's director"], answer: 2,
        explain: "„I'm the company's director. I'll be your boss if you get the job.”" },
      { type: "write", q: "Przekształć zdanie, używając must have: „I'm sure they read my CV.”", answers: ["They must have read my CV.", "They must've read my CV."],
        explain: "Pewność co do przeszłości: must have + III forma (read – read – read)." },
    ],
  },
  {
    id: "old-house", title: "Our old house", titlePl: "Nasz stary dom", level: "B2", after: "causative", topic: "Dom",
    text: [
      "Last spring, my husband and I bought an old house in the countryside. It was cheap because nobody had lived there for years, and we had big plans. We decided to do most of the work ourselves to save money. Looking back, that wasn't our best idea.",
      "The first problem was the roof. We noticed it when it started raining and water was coming through the bedroom ceiling. We had to have the whole roof repaired, which cost almost twice as much as we had expected. Then we found out that the wiring was dangerous, so we had an electrician check the whole house. He told us that if we hadn't called him, there could have been a fire.",
      "We did manage to do some things ourselves. We painted all the walls, and I put down a new carpet in the living room. My husband tried to fit the new kitchen himself, but after two weekends of shouting at the cupboards, we had it installed by professionals.",
      "Now, a year later, the house looks lovely. We've had all the windows replaced, and next month we're having a new bathroom fitted. Sometimes I wish we had bought a newer house. It would have been much easier and probably cheaper. But when I sit in our garden on a summer evening, I'm glad we didn't. If only we had known how much work it would be, though!",
    ],
    glossary: { "looking back": "z perspektywy czasu", "glad": "zadowolony, rad", "wiring": "instalacja elektryczna", "put down": "położyć (np. wykładzinę)", "fit": "zamontować, wstawić", "professional": "fachowiec, profesjonalista" },
    questions: [
      { type: "choice", q: "Why was the house cheap?", options: ["It was very small.", "Nobody had lived there for years.", "It was far from the city."], answer: 1,
        explain: "„It was cheap because nobody had lived there for years” – Past Perfect: coś trwało do chwili w przeszłości." },
      { type: "choice", q: "What happened when it started raining?", options: ["Water came through the bedroom ceiling.", "The garden was flooded.", "A window broke."], answer: 0,
        explain: "„Water was coming through the bedroom ceiling.” – woda ciekła przez sufit sypialni." },
      { type: "gap", q: "They had the whole roof ___ (repair).", answers: ["repaired"],
        explain: "Konstrukcja have something done: had + the whole roof + repaired (ktoś to zrobił za nich)." },
      { type: "choice", q: "What did the electrician tell them?", options: ["The wiring was almost new.", "There could have been a fire if they hadn't called him.", "The house was safe."], answer: 1,
        explain: "„If we hadn't called him, there could have been a fire.” – trzeci tryb warunkowy." },
      { type: "choice", q: "Who installed the new kitchen in the end?", options: ["the writer's husband", "the writer", "professionals"], answer: 2,
        explain: "„We had it installed by professionals.” Mąż próbował sam, ale się nie udało." },
      { type: "write", q: "Napisz po angielsku, używając have something done: W przyszłym miesiącu zamontują nam nową łazienkę.", answers: ["Next month(,) we're having a new bathroom {fitted|installed}.", "We're having a new bathroom {fitted|installed} next month.", "Next month(,) we're going to have a new bathroom {fitted|installed}.", "We're going to have a new bathroom {fitted|installed} next month.", "Next month(,) we'll have a new bathroom {fitted|installed}.", "We'll have a new bathroom {fitted|installed} next month."],
        explain: "have + rzecz + III forma: we're having a new bathroom fitted (ustalony plan – Present Continuous)." },
    ],
  }
);
