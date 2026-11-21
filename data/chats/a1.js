window.CHATS = window.CHATS || [];
window.CHATS.push(
  {
    id: "new-classmate", title: "A new classmate", titlePl: "Nowa koleżanka z kursu", level: "A1", after: "imperatives-lets", topic: "Poznawanie ludzi",
    setting: "Pierwszy dzień kursu angielskiego w Londynie. Na przerwie zagaduje cię Lucy z twojej grupy.",
    goal: "Przedstaw się, powiedz kilka zdań o sobie i umów się z Lucy na kawę po lekcji.",
    partner: { name: "Lucy", g: "f" },
    glossary: { "nice to meet you": "miło cię poznać", "see you": "do zobaczenia" },
    start: "n1",
    nodes: {
      n1: {
        say: "Hi! I'm Lucy. Are you new here?", pl: "Cześć! Jestem Lucy. Jesteś tu nowy (nowa)?",
        options: [
          { en: "Yes, I am. Nice to meet you, Lucy.", pl: "Tak. Miło cię poznać, Lucy.", ok: true, next: "n2" },
          { en: "Yes, I new.", feedback: "Brakuje czasownika „be”: I'm new (jestem nowy / nowa). Krótka odpowiedź to: Yes, I am." },
          { en: "Yes, you are.", feedback: "„Yes, you are” znaczy „tak, ty jesteś”. Lucy pyta o ciebie, więc odpowiedz o sobie: Yes, I am." },
        ],
      },
      n2: {
        say: "Nice to meet you too. Where are you from?", pl: "Mnie też miło cię poznać. Skąd jesteś?",
        options: [
          { en: "I'm from Poland, from Gdańsk. And you?", pl: "Jestem z Polski, z Gdańska. A ty?", ok: true, next: "n3" },
          { en: "I'm from Polish.", feedback: "„Polish” to „polski” (przymiotnik albo język). Kraj to Poland: I'm from Poland – albo: I'm Polish." },
          { en: "I'm fine, thanks.", feedback: "Tak odpowiadamy na „How are you?” (Jak się masz?). Lucy pyta, skąd jesteś." },
        ],
      },
      n3: {
        say: "I'm from Manchester. What do you do?", pl: "Ja jestem z Manchesteru. Czym się zajmujesz?",
        options: [
          { en: "I'm a nurse. I work at a hospital.", pl: "Jestem pielęgniarką (pielęgniarzem). Pracuję w szpitalu.", ok: true, next: "n4" },
          { en: "I'm nurse. I work at a hospital.", feedback: "Przed nazwą zawodu potrzebny jest przedimek a / an: I'm a nurse, I'm an engineer." },
          { en: "I go to bed at ten.", feedback: "„What do you do?” to pytanie o pracę (czym się zajmujesz?), a nie o to, co robisz w ciągu dnia." },
        ],
      },
      n4: {
        say: "Oh, really? Do you need English at work?", pl: "O, naprawdę? Potrzebujesz angielskiego w pracy?",
        options: [
          { en: "Yes, I do. I often talk to people from other countries.", pl: "Tak. Często rozmawiam z ludźmi z innych krajów.", ok: true, next: "n5" },
          { en: "Yes, I need.", feedback: "Na pytanie „Do you…?” krótko odpowiadamy z „do”: Yes, I do / No, I don't – bez powtarzania czasownika." },
        ],
      },
      n5: {
        say: "Great! Are you hungry?", pl: "Super! Jesteś głodny (głodna)?",
        options: [
          { en: "Yes, I am! Why don't we go to the café after the lesson?", pl: "Tak! Może pójdziemy do kawiarni po lekcji?", ok: true, next: "n6" },
          { en: "Yes, I have hungry.", feedback: "Po angielsku głodnym się „jest”, a nie „ma”: I'm hungry (be + hungry). Krótko: Yes, I am." },
          { en: "No. Leave me alone!", next: "end-rude", feedback: "„Leave me alone!” (Zostaw mnie w spokoju!) jest bardzo niegrzeczne – a Lucy była dla ciebie miła." },
        ],
      },
      n6: {
        say: "Good idea! Do you know the café next to the bank?", pl: "Dobry pomysł! Znasz kawiarnię obok banku?",
        options: [
          { en: "No, I don't. Is it nice?", pl: "Nie. Jest fajna?", ok: true, next: "n7" },
          { en: "No, I not know.", feedback: "Przeczenie w Present Simple tworzymy z „don't”: I don't know. Krótko: No, I don't." },
        ],
      },
      n7: {
        say: "Yes, it's lovely, and it's cheap. See you there at three, then!", pl: "Tak, jest bardzo przyjemna i tania. To do zobaczenia tam o trzeciej!",
        options: [
          { en: "Great! See you at three.", pl: "Super! Do zobaczenia o trzeciej.", ok: true, next: "end" },
          { en: "Sorry, I'm busy at three.", next: "end-busy", feedback: "Grzecznie, ale odmawiasz – a twoim celem było umówić się z Lucy na kawę." },
        ],
      },
      end: { say: "Bye! And don't be late!", pl: "Pa! I nie spóźnij się!", end: "ok" },
      "end-busy": { say: "Oh, that's a pity. Maybe another day.", pl: "Och, szkoda. Może innego dnia.", end: "fail",
        note: "Rozmowa była miła, ale nie umówiliście się na kawę – a to był cel." },
      "end-rude": { say: "Oh! OK… Sorry.", pl: "Och! No dobrze… Przepraszam.", end: "fail",
        note: "Lucy odeszła i nie umówiliście się na kawę. Spróbuj jeszcze raz – tym razem miło." },
    },
  },
  {
    id: "train-ticket", title: "Buying a train ticket", titlePl: "Bilet na pociąg", level: "A1", after: "questions", topic: "Podróże",
    setting: "Jesteś na dworcu kolejowym w Londynie. Podchodzisz do kasy.",
    goal: "Kup bilet powrotny do Oksfordu na jutro rano i dowiedz się, z którego peronu odjeżdża pociąg.",
    partner: { name: "Kasjer", g: "m" },
    glossary: { "single": "bilet w jedną stronę", "return": "bilet powrotny (tam i z powrotem)", "platform": "peron", "you're welcome": "nie ma za co" },
    start: "n1",
    nodes: {
      n1: {
        say: "Good morning. How can I help you?", pl: "Dzień dobry. W czym mogę pomóc?",
        options: [
          { en: "Good morning. I'd like a ticket to Oxford, please.", pl: "Dzień dobry. Poproszę bilet do Oksfordu.", ok: true, next: "n2" },
          { en: "Good morning. I like a ticket to Oxford, please.", feedback: "„I like” znaczy „lubię”. Kiedy o coś prosisz, mów „I'd like…” (= poproszę, chciał(a)bym)." },
          { en: "Ticket. Oxford. Now.", feedback: "To brzmi jak rozkaz i jest niegrzeczne. Poproś pełnym zdaniem i dodaj „please”." },
        ],
      },
      n2: {
        say: "Single or return?", pl: "W jedną stronę czy powrotny?",
        options: [
          { en: "Return, please.", pl: "Powrotny, poproszę.", ok: true, next: "n3" },
          { en: "I'm single.", feedback: "„I'm single” znaczy „jestem singlem (nie mam męża ani żony)”! Kasjer pyta o bilet: w jedną stronę (single) czy powrotny (return)." },
          { en: "Yes, please.", feedback: "To pytanie „albo – albo”: single czy return. „Yes” nic tu nie znaczy – wybierz jedną z dwóch rzeczy." },
        ],
      },
      n3: {
        say: "For today?", pl: "Na dziś?",
        options: [
          { en: "No, for tomorrow morning, please.", pl: "Nie, na jutro rano, poproszę.", ok: true, next: "n4" },
          { en: "No, I'm from Poland.", feedback: "Nie na temat – kasjer pyta, na kiedy ma być bilet, a nie skąd jesteś." },
        ],
      },
      n4: {
        say: "There's a train at seven forty-five and one at nine fifteen.", pl: "Jest pociąg o siódmej czterdzieści pięć i drugi o dziewiątej piętnaście.",
        options: [
          { en: "The nine fifteen, please. How long does it take?", pl: "Ten o dziewiątej piętnaście, poproszę. Jak długo jedzie?", ok: true, next: "n5" },
          { en: "The nine fifteen, please. How long it takes?", feedback: "W pytaniu w Present Simple potrzebne jest „does” przed podmiotem: How long does it take?" },
        ],
      },
      n5: {
        say: "About an hour. That's twenty-four pounds fifty.", pl: "Około godziny. To będzie dwadzieścia cztery funty pięćdziesiąt.",
        options: [
          { en: "Can I pay by card?", pl: "Mogę zapłacić kartą?", ok: true, next: "n6" },
          { en: "Can I paying by card?", feedback: "Po „can” czasownik jest w formie podstawowej, bez -ing: Can I pay…?" },
          { en: "That's very expensive! Give me a cheap ticket.", next: "w1", feedback: "Kasjer nie ustala cen, a „Give me…” brzmi jak rozkaz. Zobacz, jak zareaguje." },
        ],
      },
      w1: {
        say: "I'm sorry, but that's the price. Do you want the ticket or not?", pl: "Przykro mi, ale taka jest cena. Chce pan (pani) ten bilet czy nie?",
        options: [
          { en: "Yes, sorry. Can I pay by card?", pl: "Tak, przepraszam. Mogę zapłacić kartą?", ok: true, next: "n6" },
          { en: "No. Goodbye.", next: "end-no", feedback: "Bez biletu nie pojedziesz do Oksfordu." },
        ],
      },
      n6: {
        say: "Of course. Here's your ticket. The train leaves from platform four.", pl: "Oczywiście. Proszę, oto bilet. Pociąg odjeżdża z peronu czwartego.",
        options: [
          { en: "Platform four. Thank you!", pl: "Peron czwarty. Dziękuję!", ok: true, next: "end" },
          { en: "No, thank you.", feedback: "„No, thank you” znaczy „nie, dziękuję” – tak odmawiamy. Kasjer podaje ci bilet, więc po prostu podziękuj." },
        ],
      },
      end: { say: "You're welcome. Have a good trip!", pl: "Nie ma za co. Miłej podróży!", end: "ok" },
      "end-no": { say: "OK. Next, please!", pl: "Dobrze. Następna osoba, proszę!", end: "fail",
        note: "Odchodzisz od kasy bez biletu. Spróbuj jeszcze raz – cena jest, jaka jest, ale można o nią zapytać grzecznie." },
    },
  }
);
