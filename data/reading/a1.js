window.READING = window.READING || [];
window.READING.push(
  {
    id: "anna-flat", title: "Anna's new flat", titlePl: "Nowe mieszkanie Anny", level: "A1", after: "there-is-are", topic: "Dom",
    text: [
      "My name is Anna. I'm twenty-six years old and I'm a nurse. I live in a small flat in the city centre. It isn't very big, but it's new and really nice.",
      "There are three rooms: a living room, a bedroom and a kitchen. There's also a small bathroom. In the living room, there's a big sofa and a desk with my laptop. There's a lamp next to the sofa and there are a lot of books on the shelves.",
      "My kitchen is small, but there's a big fridge. I usually have breakfast at the table near the window. At weekends, I often cook dinner for my friends.",
      "The flat has got a balcony, too. There's a park opposite my building and there's a supermarket on the corner. My neighbours are quiet and nice. I love my new flat!",
    ],
    glossary: {},
    questions: [
      { type: "choice", q: "What is Anna's job?", options: ["She's a teacher.", "She's a nurse.", "She's a cook."], answer: 1,
        explain: "W tekście: „I'm a nurse.” – jestem pielęgniarką." },
      { type: "gap", q: "There are ___ rooms in Anna's flat and a small bathroom.", answers: ["three", "3"],
        explain: "„There are three rooms: a living room, a bedroom and a kitchen.” – trzy pokoje (salon, sypialnia, kuchnia) i do tego łazienka." },
      { type: "choice", q: "Where does Anna usually have breakfast?", options: ["on the balcony", "on the sofa", "at the table near the window"], answer: 2,
        explain: "„I usually have breakfast at the table near the window.” – przy stole obok okna." },
      { type: "gap", q: "There's a lamp next to the ___.", answers: ["sofa"],
        explain: "„There's a lamp next to the sofa.” – lampa stoi obok kanapy." },
      { type: "choice", q: "What is opposite Anna's building?", options: ["a supermarket", "a park", "a bank"], answer: 1,
        explain: "„There's a park opposite my building.” Supermarket jest na rogu (on the corner)." },
      { type: "write", q: "Odpowiedz pełnym zdaniem po angielsku: Has Anna's flat got a balcony?", answers: ["Yes, it has.", "Yes, it's got a balcony.", "Yes, it has got a balcony.", "Yes, {her|Anna's|the} flat has got a balcony."],
        explain: "„The flat has got a balcony, too.” Krótka odpowiedź na pytanie z has got: Yes, it has." },
    ],
  },
  {
    id: "postcard-spain", title: "A postcard from Spain", titlePl: "Pocztówka z Hiszpanii", level: "A1", after: "past-simple", topic: "Podróże",
    text: [
      "Dear Grandma,",
      "We're on holiday in Spain! We're staying in a small hotel near the sea. The weather is great. It's hot and the sun is shining every day.",
      "Right now, I'm sitting on the balcony and Tom is reading a book. The children are in the hotel swimming pool. They love it!",
      "Yesterday we visited an old castle on a hill. It was beautiful, but there were a lot of people. In the evening, we had dinner in a small restaurant. I ate fish and Tom had pizza. The food was delicious! After that, we went for a walk near the sea.",
      "We miss you! Lots of love, Kasia",
    ],
    glossary: { "dear": "drogi, droga (na początku listu)", "lots of love": "ściskam serdecznie (na końcu listu)" },
    questions: [
      { type: "choice", q: "Where is Kasia's family on holiday?", options: ["in Poland", "in Spain", "in England"], answer: 1,
        explain: "„We're on holiday in Spain!” – są na wakacjach w Hiszpanii." },
      { type: "choice", q: "What is Tom doing right now?", options: ["He's swimming.", "He's sleeping.", "He's reading a book."], answer: 2,
        explain: "„Tom is reading a book.” – Present Continuous: to, co dzieje się teraz." },
      { type: "gap", q: "Yesterday they visited an old ___ on a hill.", answers: ["castle"],
        explain: "„Yesterday we visited an old castle on a hill.” – stary zamek na wzgórzu." },
      { type: "choice", q: "What did Kasia eat in the restaurant?", options: ["fish", "pizza", "salad"], answer: 0,
        explain: "„I ate fish and Tom had pizza.” – Kasia jadła rybę, pizzę jadł Tom." },
      { type: "choice", q: "What did they do after dinner?", options: ["They went for a walk.", "They watched TV.", "They went to the castle."], answer: 0,
        explain: "„After that, we went for a walk near the sea.” – po kolacji poszli na spacer." },
      { type: "write", q: "Odpowiedz pełnym zdaniem po angielsku: Was the food good?", answers: ["Yes, it was.", "Yes, it was delicious.", "Yes, the food was {delicious|good|great}."],
        explain: "„The food was delicious!” Krótka odpowiedź w Past Simple: Yes, it was." },
    ],
  }
);
