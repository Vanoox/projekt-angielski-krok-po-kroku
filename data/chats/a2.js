window.CHATS = window.CHATS || [];
window.CHATS.push(
  {
    id: "missing-suitcase", title: "My suitcase hasn't arrived", titlePl: "Zgubiona walizka", level: "A2", after: "future-will", topic: "Podróże",
    setting: "Właśnie wylądował twój samolot w Edynburgu, ale twojej walizki nie ma na taśmie. Idziesz do biura bagażu zagubionego.",
    goal: "Zgłoś zgubioną walizkę: powiedz, skąd był lot, opisz walizkę i poproś, żeby przywieziono ją do twojego hotelu.",
    partner: { name: "Pracownica lotniska", g: "f" },
    glossary: { "I'm sorry to hear that": "przykro mi to słyszeć", "flight": "lot", "describe": "opisać" },
    start: "n1",
    nodes: {
      n1: {
        say: "Hello. Can I help you?", pl: "Dzień dobry. W czym mogę pomóc?",
        options: [
          { en: "Hello. My suitcase hasn't arrived.", pl: "Dzień dobry. Moja walizka nie przyleciała.", ok: true, next: "n2" },
          { en: "Hello. My suitcase didn't arrived.", feedback: "Po „didn't” czasownik jest w formie podstawowej: didn't arrive. A jeszcze lepiej pasuje tu Present Perfect: My suitcase hasn't arrived – walizki wciąż nie ma." },
          { en: "Hello. Where is the toilet?", feedback: "Nie na temat – jesteś tu, żeby zgłosić zgubioną walizkę." },
        ],
      },
      n2: {
        say: "I'm sorry to hear that. Which flight were you on?", pl: "Przykro mi to słyszeć. Jakim lotem pan (pani) leciał(a)?",
        options: [
          { en: "The flight from Warsaw. It landed an hour ago.", pl: "Lotem z Warszawy. Wylądował godzinę temu.", ok: true, next: "n3" },
          { en: "The flight from Warsaw. It has landed an hour ago.", feedback: "Z „ago” (temu) używamy Past Simple, nie Present Perfect: It landed an hour ago." },
          { en: "I'm fine, thank you.", feedback: "Nie na temat – pracownica pyta o twój lot." },
        ],
      },
      n3: {
        say: "Can you describe your suitcase?", pl: "Może pan (pani) opisać swoją walizkę?",
        options: [
          { en: "It's a big black suitcase, and my name is on it.", pl: "To duża czarna walizka i jest na niej moje nazwisko.", ok: true, next: "n4" },
          { en: "It's a suitcase big and black.", feedback: "Po angielsku przymiotnik stoi przed rzeczownikiem: a big black suitcase." },
          { en: "Yes, I can.", feedback: "„Can you…?” to tutaj grzeczna prośba, a nie pytanie o umiejętność. Pracownica czeka na opis walizki." },
        ],
      },
      n4: {
        say: "OK. What's in it?", pl: "Dobrze. Co jest w środku?",
        options: [
          { en: "Clothes, shoes and some presents for my family.", pl: "Ubrania, buty i kilka prezentów dla rodziny.", ok: true, next: "n5" },
          { en: "Clothes, shoes and some present for my family.", feedback: "„Some” z rzeczownikiem policzalnym łączy się z liczbą mnogą: some presents." },
          { en: "Why do you ask? I'm really tired!", next: "w1", feedback: "Pracownica pyta, żeby łatwiej rozpoznać walizkę – a twój ton był niemiły. Zobacz, jak zareaguje." },
        ],
      },
      w1: {
        say: "I'm only trying to help you. We need this information. What's in your suitcase?", pl: "Próbuję tylko panu (pani) pomóc. Potrzebujemy tej informacji. Co jest w walizce?",
        options: [
          { en: "Sorry. Clothes, shoes and some presents for my family.", pl: "Przepraszam. Ubrania, buty i kilka prezentów dla rodziny.", ok: true, next: "n5" },
          { en: "It isn't important.", feedback: "Bez opisu zawartości trudniej znaleźć walizkę. Odpowiedz na pytanie." },
        ],
      },
      n5: {
        say: "Thank you. I think it's still in Warsaw. It will arrive on the next flight tonight.", pl: "Dziękuję. Myślę, że jest jeszcze w Warszawie. Przyleci następnym lotem, dziś wieczorem.",
        options: [
          { en: "Can you send it to my hotel, please?", pl: "Czy możecie przesłać ją do mojego hotelu?", ok: true, next: "n6" },
          { en: "Tonight? Fantastic, thank you! Goodbye.", feedback: "Za wcześnie na pożegnanie – nie wiesz jeszcze, jak walizka do ciebie trafi." },
        ],
      },
      n6: {
        say: "Yes, of course. What's the name of your hotel?", pl: "Tak, oczywiście. Jak nazywa się hotel?",
        options: [
          { en: "The Castle Hotel, on Queen Street.", pl: "Hotel Castle, przy Queen Street.", ok: true, next: "n7" },
          { en: "It's a five-star hotel.", feedback: "Pracownica pyta o nazwę hotelu, a nie o to, ile ma gwiazdek." },
        ],
      },
      n7: {
        say: "And your phone number, please?", pl: "A numer telefonu, poproszę?",
        options: [
          { en: "Sure. It's oh seven seven, four five two, nine one eight.", pl: "Jasne. To 077 452 918.", ok: true, next: "end" },
          { en: "Yes, I've got a phone.", feedback: "Pracownica prosi o numer telefonu, a nie pyta, czy masz telefon." },
        ],
      },
      end: { say: "Thank you. We'll call you tonight. I'm sorry about this.", pl: "Dziękuję. Zadzwonimy dziś wieczorem. Przepraszamy za kłopot.", end: "ok" },
    },
  },
  {
    id: "booking-a-table", title: "Booking a table", titlePl: "Rezerwacja stolika", level: "A2", after: "going-to", topic: "Jedzenie",
    setting: "W sobotę są urodziny twojej mamy. Dzwonisz do restauracji, żeby zarezerwować stolik.",
    goal: "Zarezerwuj stolik dla czterech osób na sobotni wieczór i dowiedz się, czy są dania wegetariańskie (mama nie je mięsa).",
    partner: { name: "Pracownik restauracji", g: "m" },
    glossary: { "book": "zarezerwować", "half past seven": "wpół do ósmej (7:30)" },
    start: "n1",
    nodes: {
      n1: {
        say: "Good evening, Bella's Restaurant. How can I help you?", pl: "Dobry wieczór, restauracja Bella. W czym mogę pomóc?",
        options: [
          { en: "Good evening. I'd like to book a table for Saturday, please.", pl: "Dobry wieczór. Chciał(a)bym zarezerwować stolik na sobotę.", ok: true, next: "n2" },
          { en: "Good evening. I'd like booking a table for Saturday, please.", feedback: "Po „I'd like” czasownik ma przed sobą „to”: I'd like to book…" },
          { en: "Hi. I want food.", feedback: "Za krótko i niegrzecznie – nie wiadomo, czego chcesz. Powiedz uprzejmie, po co dzwonisz." },
        ],
      },
      n2: {
        say: "Of course. For how many people?", pl: "Oczywiście. Dla ilu osób?",
        options: [
          { en: "For four people, please.", pl: "Dla czterech osób, poproszę.", ok: true, next: "n3" },
          { en: "For four peoples, please.", feedback: "„People” to już liczba mnoga (ludzie, osoby) – bez -s: four people." },
          { en: "On Saturday.", feedback: "Pracownik pyta, dla ilu osób ma być stolik, a nie o dzień." },
        ],
      },
      n3: {
        say: "And what time would you like?", pl: "A na którą godzinę?",
        options: [
          { en: "At eight o'clock, please.", pl: "Na ósmą, poproszę.", ok: true, next: "n4" },
          { en: "In eight o'clock, please.", feedback: "Z godzinami używamy „at”: at eight o'clock, at half past six." },
        ],
      },
      n4: {
        say: "I'm sorry, we're full at eight. Is half past seven OK?", pl: "Przykro mi, o ósmej nie mamy miejsc. Czy wpół do ósmej pasuje?",
        options: [
          { en: "Yes, half past seven is fine.", pl: "Tak, wpół do ósmej mi pasuje.", ok: true, next: "n5" },
          { en: "What? That's terrible! Your restaurant is very bad.", next: "w1", feedback: "To nie wina restauracji, że ma komplet gości – to było niegrzeczne. Zobacz, jak zareaguje pracownik." },
        ],
      },
      w1: {
        say: "I'm sorry, but we're full. Do you want the table at half past seven or not?", pl: "Przykro mi, ale nie mamy miejsc. Chce pan (pani) stolik na wpół do ósmej czy nie?",
        options: [
          { en: "Yes, please. I'm sorry about that.", pl: "Tak, poproszę. Przepraszam za tamto.", ok: true, next: "n5" },
          { en: "No. I'm going to find another restaurant.", next: "end-fail", feedback: "Rozłączasz się bez rezerwacji – a urodziny mamy są już w sobotę." },
        ],
      },
      n5: {
        say: "Lovely. Can I have your name, please?", pl: "Świetnie. Mogę prosić o nazwisko?",
        options: [
          { en: "Yes, it's Nowak. N-O-W-A-K.", pl: "Tak, Nowak. N-O-W-A-K.", ok: true, next: "n6" },
          { en: "Yes, you can.", feedback: "„Can I have your name?” to grzeczna prośba o nazwisko, a nie pytanie o pozwolenie. Podaj nazwisko." },
        ],
      },
      n6: {
        say: "Thank you. Is there anything else?", pl: "Dziękuję. Czy coś jeszcze?",
        options: [
          { en: "Yes. My mother is vegetarian. Have you got any vegetarian dishes?", pl: "Tak. Moja mama jest wegetarianką. Macie jakieś dania wegetariańskie?", ok: true, next: "n7" },
          { en: "Yes. My mother are vegetarian. Have you got any vegetarian dishes?", feedback: "„My mother” to ona (she), więc: my mother is, nie are." },
          { en: "Yes. My mother is vegetarian. Have you got any meat?", feedback: "Wegetarianka nie je mięsa (meat) – zapytaj o dania wegetariańskie." },
        ],
      },
      n7: {
        say: "Yes, we've got a lot of vegetarian dishes – pasta, soups and salads.", pl: "Tak, mamy dużo dań wegetariańskich – makarony, zupy i sałatki.",
        options: [
          { en: "Perfect. It's her birthday, so I'm going to bring a cake. Is that OK?", pl: "Świetnie. To jej urodziny, więc przyniosę tort. Czy to nie problem?", ok: true, next: "end" },
          { en: "Perfect. It's her birthday, so I'm going bring a cake. Is that OK?", feedback: "W „going to” nie może zabraknąć „to”: I'm going to bring…" },
        ],
      },
      end: { say: "Of course! We'll put it in the fridge. See you on Saturday at half past seven.", pl: "Oczywiście! Włożymy go do lodówki. Do zobaczenia w sobotę o wpół do ósmej.", end: "ok" },
      "end-fail": { say: "OK. Goodbye, then.", pl: "Dobrze. W takim razie do widzenia.", end: "fail",
        note: "Nie masz stolika na urodziny mamy. Spróbuj jeszcze raz – i spokojnie przyjmij inną godzinę." },
    },
  }
);
