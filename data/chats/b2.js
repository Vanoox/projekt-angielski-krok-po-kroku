window.CHATS = window.CHATS || [];
window.CHATS.push(
  {
    id: "cancelled-flight", title: "A cancelled flight", titlePl: "Odwołany lot", level: "B2", after: "wish-if-only", topic: "Podróże",
    setting: "Jesteś na lotnisku w Dublinie. Twój wieczorny lot do Krakowa właśnie odwołano. Przy stanowisku linii lotniczej stoi długa kolejka – w końcu przychodzi twoja kolej.",
    goal: "Zachowaj spokój i załatw dwie rzeczy: miejsce w pierwszym porannym samolocie i darmowy nocleg w hotelu.",
    partner: { name: "Pracownica linii lotniczej", g: "f" },
    glossary: { "airline": "linia lotnicza", "properly": "porządnie, jak należy", "boarding pass": "karta pokładowa", "fault": "wina", "voucher": "bon (talon)", "compensation": "odszkodowanie", "receipt": "paragon", "terminal": "terminal (budynek lotniska)" },
    start: "n1",
    nodes: {
      n1: {
        say: "Next, please. I'm sorry about the wait. How can I help?", pl: "Następna osoba, proszę. Przepraszam za czekanie. W czym mogę pomóc?",
        options: [
          { en: "Hi. My flight to Kraków has just been cancelled, and I need to get home as soon as possible.", pl: "Dzień dobry. Mój lot do Krakowa właśnie odwołano, a muszę jak najszybciej wrócić do domu.", ok: true, next: "n2" },
          { en: "Hi. My flight to Kraków has just cancelled, and I need to get home as soon as possible.", feedback: "Lot nie odwołał się sam – ktoś go odwołał, więc potrzebna jest strona bierna: has just been cancelled." },
          { en: "Finally! I've been standing here for an hour! Your airline is a joke!", next: "w1", feedback: "Złość jest zrozumiała, ale to nie ta pracownica odwołała lot – a od niej zależy, co dostaniesz. Zobacz, jak zareaguje." },
        ],
      },
      w1: {
        say: "I understand you're upset, but please don't shout. I'm trying to help you.", pl: "Rozumiem, że jest pan (pani) zdenerwowany(-a), ale proszę nie krzyczeć. Próbuję panu (pani) pomóc.",
        options: [
          { en: "You're right, I'm sorry. It's been a long day. My flight to Kraków has been cancelled.", pl: "Ma pani rację, przepraszam. To był długi dzień. Mój lot do Krakowa odwołano.", ok: true, next: "n2" },
          { en: "If you did your job properly, I wouldn't have to shout!", next: "end-fail", feedback: "Znów atakujesz pracownicę – a ona nie musi tego słuchać." },
        ],
      },
      n2: {
        say: "Let me check… The first flight with free seats leaves at six fifteen tomorrow morning.", pl: "Sprawdzę… Pierwszy lot z wolnymi miejscami odlatuje jutro o szóstej piętnaście rano.",
        options: [
          { en: "That would be great. Could you book me on it, please?", pl: "Byłoby świetnie. Czy może mnie pani na niego zapisać?", ok: true, next: "n3" },
          { en: "That would be great. Would you mind to book me on it?", feedback: "Po „Would you mind” czasownik ma końcówkę -ing: Would you mind booking me on it?" },
          { en: "Six fifteen? I wish I didn't come to Ireland at all.", feedback: "Żal dotyczący przeszłości wyrażamy przez „I wish” + Past Perfect: I wish I hadn't come… Poza tym to nie na temat – lot o 6:15 to dobra wiadomość." },
        ],
      },
      n3: {
        say: "Done. You're on the six fifteen. Here's your new boarding pass.", pl: "Gotowe. Ma pan (pani) miejsce w samolocie o 6:15. Oto nowa karta pokładowa.",
        options: [
          { en: "Thanks. As it wasn't my fault, the airline will pay for a hotel tonight, won't it?", pl: "Dzięki. Skoro to nie moja wina, linia zapłaci za hotel na dzisiejszą noc, prawda?", ok: true, next: "n4" },
          { en: "Thanks. Now give me a hotel.", feedback: "Za ostro – to rozkaz, a nie prośba. To samo możesz powiedzieć uprzejmie, ale stanowczo." },
          { en: "Thanks. The airline will pay for a hotel tonight, will it?", feedback: "Po zdaniu twierdzącym pytanie doczepiane jest przeczące: The airline will pay…, won't it?" },
        ],
      },
      n4: {
        say: "Yes, of course. Here's a voucher for the airport hotel and another one for dinner.", pl: "Tak, oczywiście. Oto bon na hotel przy lotnisku i drugi na kolację.",
        options: [
          { en: "Thank you. Is there a bus to the hotel, or do I have to take a taxi?", pl: "Dziękuję. Czy do hotelu jeździ autobus, czy muszę wziąć taksówkę?", ok: true, next: "n5" },
          { en: "Thank you. If you told us earlier, I would have booked a train.", feedback: "O przeszłości, której nie da się zmienić, mówimy w trzecim trybie: If you had told us earlier, I would have… A poza tym to już nic nie zmieni – zapytaj, jak dojechać do hotelu." },
        ],
      },
      n5: {
        say: "There's a free bus every twenty minutes from outside the terminal.", pl: "Sprzed terminalu co dwadzieścia minut jeździ darmowy autobus.",
        options: [
          { en: "Great, thanks. Will I get any compensation for this?", pl: "Świetnie, dzięki. Czy dostanę za to jakieś odszkodowanie?", ok: true, next: "n6" },
          { en: "Great. Then I must have missed it.", feedback: "„I must have missed it” znaczy „na pewno mi uciekł” (wniosek o przeszłości). Bez sensu – autobus jeździ co dwadzieścia minut." },
        ],
      },
      n6: {
        say: "You might. Fill in the form on our website, and keep all your receipts.", pl: "Możliwe. Proszę wypełnić formularz na naszej stronie i zachować wszystkie paragony.",
        options: [
          { en: "I will. Thank you for your help – I know it's been a difficult evening for you too.", pl: "Dobrze. Dziękuję za pomoc – wiem, że dla pani to też był trudny wieczór.", ok: true, next: "end" },
          { en: "I will. If only I hadn't took this flight.", feedback: "Po „If only” o przeszłości używamy Past Perfect z trzecią formą czasownika: If only I hadn't taken… (taken, nie took)." },
        ],
      },
      end: { say: "That's very kind of you. Have a good night, and a safe flight tomorrow.", pl: "To bardzo miłe z pana (pani) strony. Dobrej nocy i bezpiecznego lotu jutro.", end: "ok" },
      "end-fail": { say: "I'm sorry, but I'm not going to talk to you like this. Please wait for my manager.", pl: "Przykro mi, ale nie będę z panem (panią) tak rozmawiać. Proszę zaczekać na kierownika.", end: "fail",
        note: "Krzyk niczego nie załatwił – zamiast nowego biletu i hotelu masz dalsze czekanie. Spróbuj jeszcze raz: spokojnie, ale stanowczo." },
    },
  }
);
