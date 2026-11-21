window.CHATS = window.CHATS || [];
window.CHATS.push(
  {
    id: "flat-to-rent", title: "A flat to rent", titlePl: "Mieszkanie do wynajęcia", level: "B1", after: "future-arrangements", topic: "Dom",
    setting: "Szukasz mieszkania do wynajęcia w Bristolu. W internecie jest ogłoszenie, które ci się podoba – dzwonisz do właściciela.",
    goal: "Dowiedz się, ile kosztuje mieszkanie i czy prąd i woda są w cenie, zapytaj, czy możesz mieszkać z kotem, i umów się na obejrzenie mieszkania.",
    partner: { name: "Pan Harris", g: "m" },
    glossary: { "rent": "czynsz (opłata za wynajem)", "available": "wolny, dostępny", "extra": "dodatkowo płatny", "I see": "rozumiem" },
    start: "n1",
    nodes: {
      n1: {
        say: "Hello, Tom Harris speaking.", pl: "Halo, Tom Harris, słucham.",
        options: [
          { en: "Hello, I'm calling about the flat on Park Road. Is it still available?", pl: "Dzień dobry, dzwonię w sprawie mieszkania przy Park Road. Czy jest jeszcze wolne?", ok: true, next: "n2" },
          { en: "Hello, I call about the flat on Park Road. Is it still available?", feedback: "O tym, co robisz właśnie teraz, mówimy w Present Continuous: I'm calling about… (dzwonię w sprawie…)." },
          { en: "Hello, who are you?", feedback: "Pan Harris już się przedstawił. Powiedz, w jakiej sprawie dzwonisz." },
        ],
      },
      n2: {
        say: "Yes, it is, but a lot of people have called about it today.", pl: "Tak, jest, ale dzisiaj dzwoniło w tej sprawie dużo osób.",
        options: [
          { en: "I see. How much is the rent?", pl: "Rozumiem. Ile wynosi czynsz?", ok: true, next: "n3" },
          { en: "I see. How much is costing the rent?", feedback: "Pytamy „How much is…?” albo „How much does it cost?”. Czasownika „cost” nie używamy w Present Continuous." },
        ],
      },
      n3: {
        say: "It's nine hundred pounds a month.", pl: "Dziewięćset funtów miesięcznie.",
        options: [
          { en: "Is that with electricity and water?", pl: "Czy to razem z prądem i wodą?", ok: true, next: "n4" },
          { en: "Nine hundred? That's terrible! I'm not going to pay that much.", next: "w1", feedback: "O cenę można zapytać albo negocjować, ale nie w ten sposób – właściciel ma wielu chętnych. Zobacz, jak zareaguje." },
        ],
      },
      w1: {
        say: "Well, that's the price, and other people are interested. Do you want to know more or not?", pl: "No cóż, taka jest cena, a inni są zainteresowani. Chce pan (pani) wiedzieć coś więcej czy nie?",
        options: [
          { en: "Sorry, you're right. Is that with electricity and water?", pl: "Przepraszam, ma pan rację. Czy to razem z prądem i wodą?", ok: true, next: "n4" },
          { en: "No, thanks. Goodbye.", next: "end-fail", feedback: "Kończysz rozmowę – nie dowiesz się niczego więcej o mieszkaniu." },
        ],
      },
      n4: {
        say: "No, those are extra – about a hundred pounds a month.", pl: "Nie, za to płaci się osobno – około stu funtów miesięcznie.",
        options: [
          { en: "OK, that's fine. I've got a cat. Can I keep it in the flat?", pl: "Dobrze, to mi pasuje. Mam kota. Czy mogę go trzymać w mieszkaniu?", ok: true, next: "n5" },
          { en: "OK, that's fine. I've got a cat. Do I can keep it in the flat?", feedback: "Pytania z „can” tworzymy bez „do”: Can I keep…?" },
        ],
      },
      n5: {
        say: "A cat is fine, but no dogs, I'm afraid.", pl: "Kot może być, ale psy niestety nie.",
        options: [
          { en: "Great. When can I come and see the flat?", pl: "Świetnie. Kiedy mogę przyjść obejrzeć mieszkanie?", ok: true, next: "n6" },
          { en: "Why not? Dogs are better than cats.", feedback: "Nie na temat – masz kota, a nie psa. Wróć do celu rozmowy." },
        ],
      },
      n6: {
        say: "I'm showing the flat to someone on Saturday morning. Are you free on Saturday afternoon?", pl: "W sobotę rano pokazuję mieszkanie komuś innemu. Ma pan (pani) czas w sobotę po południu?",
        options: [
          { en: "I'm meeting a friend at two, but I'm free after four. Is five o'clock OK?", pl: "O drugiej spotykam się ze znajomym, ale po czwartej mam czas. Czy piąta pasuje?", ok: true, next: "n7" },
          { en: "I meet a friend at two, but I'm free after four. Is five o'clock OK?", feedback: "O planach umówionych na konkretny czas mówimy w Present Continuous: I'm meeting a friend at two." },
          { en: "I will meet a friend at two, but I'm free after four. Is five o'clock OK?", feedback: "Do umówionego spotkania o konkretnej godzinie najlepiej pasuje Present Continuous: I'm meeting… „Will” brzmi tu jak decyzja podjęta w tej chwili." },
        ],
      },
      n7: {
        say: "Five o'clock is perfect. I'll text you the address.", pl: "Piąta jest idealna. Wyślę panu (pani) adres SMS-em.",
        options: [
          { en: "Thank you. See you on Saturday, then.", pl: "Dziękuję. W takim razie do zobaczenia w sobotę.", ok: true, next: "end" },
          { en: "Thank you. See you on Saturday at four, then.", feedback: "Uważaj na godzinę – umówiliście się na piątą (five o'clock)." },
        ],
      },
      end: { say: "See you then. Bye!", pl: "Do zobaczenia. Do widzenia!", end: "ok" },
      "end-fail": { say: "OK. Goodbye.", pl: "Dobrze. Do widzenia.", end: "fail",
        note: "Nie obejrzysz tego mieszkania. Spróbuj jeszcze raz – o cenę też można zapytać spokojnie." },
    },
  }
);
