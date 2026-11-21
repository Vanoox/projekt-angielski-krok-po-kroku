window.READING = window.READING || [];
window.READING.push(
  {
    id: "party-shopping", title: "Shopping for a party", titlePl: "Zakupy na przyjęcie", level: "A2", after: "indefinite-pronouns", topic: "Zakupy",
    text: [
      "It's Saturday morning and Tom is at the supermarket. His son, Jack, is ten today, and there's a birthday party at their house this afternoon. Tom has got a long shopping list: bread, cheese, some fruit, juice and a lot of sweets.",
      "First, he goes to the bakery, but there isn't any bread left. Somebody has bought all of it! So he buys a few packets of biscuits. Then he looks for juice. There's plenty of orange juice, but Jack doesn't like it. He only drinks apple juice. Tom can't find any apple juice anywhere. He asks a shop assistant. “Sorry, we haven't got any apple juice today,” she says.",
      "Tom is worried. The party starts at three o'clock and he has only got two hours. He has already spent a lot of money, but he hasn't found everything.",
      "At home, Tom's wife, Ewa, is preparing the living room. The cake is ready. Ewa made it last night. When Tom comes home, he looks really unhappy. Ewa smiles. “Don't worry. I was at the market this morning and I bought some apple juice.” Now everything is ready for the party.",
    ],
    glossary: { "shopping list": "lista zakupów", "left": "pozostały (there isn't any … left = nic już nie zostało)", "shop assistant": "sprzedawca, sprzedawczyni", "unhappy": "nieszczęśliwy, smutny" },
    questions: [
      { type: "choice", q: "Why is there a party at Tom's house?", options: ["It's Tom's birthday.", "It's Jack's birthday.", "It's Ewa's birthday."], answer: 1,
        explain: "„His son, Jack, is ten today” – Jack ma dziś urodziny (kończy dziesięć lat)." },
      { type: "choice", q: "What problem does Tom have at the bakery?", options: ["There isn't any bread left.", "He hasn't got any money.", "There are a lot of people."], answer: 0,
        explain: "„There isn't any bread left. Somebody has bought all of it!” – chleba już nie było." },
      { type: "gap", q: "Jack only drinks ___ juice.", answers: ["apple"],
        explain: "„He only drinks apple juice.” Soku pomarańczowego Jack nie lubi." },
      { type: "choice", q: "When does the party start?", options: ["at two o'clock", "at three o'clock", "this evening"], answer: 1,
        explain: "„The party starts at three o'clock” – przyjęcie zaczyna się o trzeciej." },
      { type: "choice", q: "Who made the cake?", options: ["Tom", "Jack", "Ewa"], answer: 2,
        explain: "„The cake is ready. Ewa made it last night.” – tort upiekła Ewa wczoraj wieczorem." },
      { type: "write", q: "Odpowiedz pełnym zdaniem po angielsku: Where did Ewa buy the apple juice?", answers: ["She bought it at the market.", "{She|Ewa} bought {the|some} apple juice at the market.", "At the market."],
        explain: "„I was at the market this morning and I bought some apple juice.” – kupiła sok na targu." },
    ],
  },
  {
    id: "weekend-edinburgh", title: "A weekend in Edinburgh", titlePl: "Weekend w Edynburgu", level: "A2", after: "comparatives-superlatives", topic: "Podróże",
    text: [
      "Next month, my friend Ola and I are going to visit Edinburgh, the capital of Scotland. We've never been to Scotland before, so we're really excited.",
      "We're going to fly from Kraków on Friday evening and come back on Sunday night. The plane tickets were cheaper than the train tickets to Gdańsk! We've already booked a room in a small hotel in the old town. It isn't the cheapest hotel in the city, but it's very close to the castle.",
      "On Saturday, we're going to visit the castle and then walk up Arthur's Seat. It's a big hill in the middle of the city. People say that the view from the top is the most beautiful in Edinburgh. If the weather is good, we'll take a lot of photos. But the weather in Scotland is often worse than in Poland. It's colder and wetter, and it rains a lot. So I'll probably take my warmest sweater and an umbrella!",
      "On Sunday, we're going to try some Scottish food. Ola wants to try haggis, but I'm not sure. I think I'll just order fish and chips!",
    ],
    glossary: { "come back": "wrócić", "book": "zarezerwować (book a room = zarezerwować pokój)", "old town": "stare miasto", "walk up": "wejść pieszo (na górę)", "Arthur's Seat": "Arthur's Seat – wzgórze w środku Edynburga", "haggis": "haggis – szkocka potrawa z podrobów", "fish and chips": "ryba z frytkami", "Scottish": "szkocki" },
    questions: [
      { type: "choice", q: "Has the writer been to Scotland before?", options: ["Yes, many times.", "Yes, once.", "No, never."], answer: 2,
        explain: "„We've never been to Scotland before” – nigdy wcześniej nie były w Szkocji." },
      { type: "choice", q: "How are they going to travel to Edinburgh?", options: ["by train", "by plane", "by car"], answer: 1,
        explain: "„We're going to fly from Kraków” – polecą samolotem." },
      { type: "gap", q: "The plane tickets were ___ than the train tickets to Gdańsk.", answers: ["cheaper"],
        explain: "„The plane tickets were cheaper than the train tickets” – stopień wyższy: cheap → cheaper than." },
      { type: "choice", q: "What are they going to do on Saturday?", options: ["go shopping in the old town", "visit the castle and walk up a hill", "try Scottish food"], answer: 1,
        explain: "„On Saturday, we're going to visit the castle and then walk up Arthur's Seat.” Szkockie jedzenie – w niedzielę." },
      { type: "gap", q: "If the weather is good, they'll take a lot of ___.", answers: ["photos", "pictures"],
        explain: "„If the weather is good, we'll take a lot of photos.” – zdanie z if (pierwszy tryb warunkowy)." },
      { type: "choice", q: "What is the weather in Scotland often like?", options: ["warmer and drier than in Poland", "colder and wetter than in Poland", "the same as in Poland"], answer: 1,
        explain: "„It's colder and wetter, and it rains a lot.” – zimniej i bardziej mokro niż w Polsce." },
    ],
  }
);
