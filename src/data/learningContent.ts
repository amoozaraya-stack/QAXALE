import { Course } from "../types";

export const COURSES_DATA: Course[] = [
  {
    id: "course-prog-101",
    title: {
      om: "Jalqaba Saganteessuu (Programming Basics)",
      en: "Introduction to Programming",
    },
    description: {
      om: "Bu'uuraalee koodingii, yaada herregaa fi akkamitti kompiitara waliin akka haasa'amu Afaan Oromootiin baradhaa.",
      en: "Learn core coding fundamentals, algorithmic thinking, and how to command computers with step-by-step guidance.",
    },
    category: "programming",
    iconName: "Code2",
    color: "#E5A93B",
    level: "Beginner / Jalqabaa",
    lessons: [
      {
        id: "les-prog-1",
        title: {
          om: "1. Koodingii Jechuun Maali?",
          en: "1. What is Programming?",
        },
        durationMin: 5,
        summary: {
          om: "Kompiitarri akkamitti akka hojjetu fi koodiin maaliif akka barbaachisu hubachuu.",
          en: "Understand how computers operate and why programming code is essential.",
        },
        content: {
          om: `### Saganteessuu (Programming) Jechuun Maali?

Kompiitarri maashina baay'ee saffisaa ta'us, ofiin yaaduu hin danda'u. Hojii tokko akka raawwatuuf **ajaja tartiibaan qophaa'e** isaaf kennuu qabna. 

Ajaja kanaanis **Sagantaa (Program)** jedhama. Namni ajaja kana barreessu immoo **Saganteessaa (Programmer)** jedhama.

#### Fakkeenya Jireenya Guyyaa Guyyaa:
Akkuma yeroo firaashii ykn nyaata wayii qopheessinu tartiiba hordofnu:
1. Bishaan danfisuu
2. Shaayee dabaluu
3. Sukkaara itti naquu

Koodingiin kompiitaraas akkuma kana: tartiiba qajeelfamoota ifa ta'an kompiitaraaf kennuudha.

#### Afaanota Saganteessuu Beekamoo:
- **Python**: Salphaa, qulqulluu, AI fi saayinsii daataaf kan oolu.
- **JavaScript**: Marsariitii fi app mobaayilaa sochoosuuf.
- **HTML & CSS**: Ijaarsa fuula weebii fi miidhagina isaaf.`,
          en: `### What is Programming?

Even though a computer is an incredibly fast machine, it cannot think independently. To perform any task, we must provide it with **step-by-step instructions**.

This sequence of instructions is called a **Program**, and the person writing them is a **Programmer**.

#### Real-Life Analogy:
Just like following a recipe to brew tea:
1. Boil the water
2. Add the tea leaves
3. Stir in sugar

Programming is giving explicit, step-by-step directions to a computer to achieve a clear goal.`,
        },
        keyTakeaways: {
          om: [
            "Kompiitarri ajaja qulqulluu fi tartiiba qabu barbaada.",
            "Saganteessaan nama rakkoo uummataa teeknolojiin furudha.",
            "Afaan Python barachuun jalqaba gaariidha.",
          ],
          en: [
            "Computers require clear, sequential instructions.",
            "Programmers use technology to solve real human challenges.",
            "Python is a beginner-friendly starting point.",
          ],
        },
        codeExample: {
          language: "python",
          code: `# Jalqaba koodingii - Hello World
maqaa = "Qaxalee"
print("Baga nagaan dhuftan " + maqaa + "!")`,
          explanation: {
            om: "Koodiin kun jijjiiramaa 'maqaa' jedhu uuma, ergasii 'print()' fayyadamee simannaa agarsiisa.",
            en: "This code creates a variable named 'maqaa' and uses print() to output a welcome message.",
          },
        },
        quiz: [
          {
            id: "q-1-1",
            question: {
              om: "Saganteessuu (Programming) jechuun maali?",
              en: "What is programming?",
            },
            options: {
              om: [
                "Kompiitara bishaan keessa buusuu",
                "Ajajawwan tartiiba qaban kompiitaraaf kennuu",
                "Suuraa qofa ilaaluu",
                "Kompiitara caccabsuu",
              ],
              en: [
                "Submerging a computer in water",
                "Giving step-by-step instructions to a computer",
                "Only viewing pictures",
                "Breaking hardware",
              ],
            },
            correctIndex: 1,
            explanation: {
              om: "Sirrii! Saganteessuun ajaja qulqulluu kompiitaraaf kennuudha.",
              en: "Correct! Programming is delivering explicit instructions to a computer system.",
            },
          },
        ],
      },
      {
        id: "les-prog-2",
        title: {
          om: "2. Jijjiiramoota (Variables) fi Daataa",
          en: "2. Variables and Data Types",
        },
        durationMin: 7,
        summary: {
          om: "Odeeffannoo koodii keessatti akkamitti akka kuusnu baradhaa.",
          en: "Learn how to store and handle information in computer programs.",
        },
        content: {
          om: `### Jijjiiramaa (Variable) Jechuun Maali?

Jijjiiramaa akka **saanduqa maqaa qabuutti** yaadaa. Saanduqa kana keessa wanta barbaadne (lakkoofsa, barruu, jecha) keessaa qabanna, booda maqaa saanduqaatiin waamna.

#### Gosoota Daataa Bu'uuraa:
1. **String (Barruu)**: Jechoota mallattoo waraabbii keessa jiran: \`maqaa = "Oromiyaa"\`
2. **Integer (Lakkoofsa Guutuu)**: Lakkoofsa qeenxee: \`umurii = 24\`
3. **Float (Lakkoofsa Tuqaa)**: Lakkoofsa kofoo: \`gatii = 99.50\`
4. **Boolean (Dhugaa/Soba)**: \`True\` ykn \`False\``,
          en: `### What is a Variable?

Think of a variable as a **labeled storage box**. Inside this container, you hold values (names, numbers, conditions) that you can reference anytime in your application.

#### Fundamental Data Types:
1. **String**: Text enclosed in quotes: \`name = "Oromia"\`
2. **Integer**: Whole numbers: \`age = 24\`
3. **Float**: Decimal numbers: \`price = 99.50\`
4. **Boolean**: Logical flags: \`True\` or \`False\``,
        },
        keyTakeaways: {
          om: [
            "Jijjiiramaan odeeffannoo yeroof qabata.",
            "String mallattoo waraabbii (\" \") keessa ta'a.",
            "Boolean gatii Dhugaa (True) ykn Soba (False) qaba.",
          ],
          en: [
            "Variables temporarily hold memory values.",
            "Strings are enclosed in quote marks.",
            "Booleans represent binary True / False values.",
          ],
        },
        codeExample: {
          language: "python",
          code: `# Fakkeenya Jijjiiramootaa
barataa = "Caalaa"
qabxii = 95
milkaa'e = True

print(f"Barataa: {barataa}, Qabxii: {qabxii}")`,
          explanation: {
            om: "Koodiin kun barataa, qabxii fi milkaa'e kuusee maxxansa.",
            en: "This code stores a student name, score, and passing status.",
          },
        },
      },
    ],
  },
  {
    id: "course-ai-101",
    title: {
      om: "Hubannoo Nam-tolchee (AI & ML Fundamentals)",
      en: "Artificial Intelligence & ML",
    },
    description: {
      om: "AI, Moodeela Afaanii (LLMs), fi Teeknolojii fuulduraa hubadhaa.",
      en: "Master AI mechanisms, machine learning models, and how intelligent systems function.",
    },
    category: "ai",
    iconName: "BrainCircuit",
    color: "#10B981",
    level: "Beginner / Jalqabaa",
    lessons: [
      {
        id: "les-ai-1",
        title: {
          om: "1. AI Akkamitti Hojjeta?",
          en: "1. How AI Actually Works",
        },
        durationMin: 6,
        summary: {
          om: "Daataa, leenjisa moodeelaa fi herrega AI duuba jiru.",
          en: "Data pipelines, neural networks, and training mechanics.",
        },
        content: {
          om: `### Hubannoon Nam-tolchee (AI) Akkamitti Hojjeta?

AI akkuma mucaa xiqqaa suuraa fi dubbii irraa baratuuti. Kompiitarri miliyoonaan daataa lakkoofsaa, suuraa, fi barruu erga ilaaltee booda **fakkeenyota (patterns)** adda baasa.

#### Moodeela Afaanii (LLMs) kan akka Qaxale/Gemini:
1. **Barruu hedduu dubbisuu**: Kitaabota, marsariitiiwwan, fi barruulee Afaan Oromoo fi addunyaa.
2. **Jecha itti aanu tilmaamuu**: Dandeettii jecha sirrii itti aanu herregaan tilmaamuu.
3. **Qajeelfama hordofuu**: Gaaffii namaa hubachuun deebii qulqulluu kennuu.`,
          en: `### How Artificial Intelligence Works

AI learns patterns similarly to how humans absorb language and images from experience. By analyzing millions of examples, neural network weights adjust to detect structures and predict outputs accurately.`,
        },
        keyTakeaways: {
          om: [
            "AI daataa guddaa (Big Data) irraa barata.",
            "LLMs jecha itti aanu herregaan tilmaamu.",
            "Qaxaleen Afaan Oromoo teeknolojii AI waliin walitti hidha.",
          ],
          en: [
            "AI trains on large data corpora.",
            "LLMs predict contextual token sequences.",
            "Qaxale connects Afaan Oromoo to modern intelligence pipelines.",
          ],
        },
      },
    ],
  },
  {
    id: "course-cs-101",
    title: {
      om: "Saayinsii Kompiitaraa & Algorizimoota",
      en: "Computer Science & Algorithms",
    },
    description: {
      om: "Ijaarsa kompiitaraa, binary, barbaacha (searching), fi caasaa daataa.",
      en: "Computer architecture, binary logic, searching algorithms, and data structures.",
    },
    category: "cs",
    iconName: "Cpu",
    color: "#6366F1",
    level: "Intermediate / Giddu-galeessa",
    lessons: [
      {
        id: "les-cs-1",
        title: {
          om: "1. Binary: Lakkoofsa 0 fi 1",
          en: "1. Binary Logic: 0 and 1",
        },
        durationMin: 6,
        summary: {
          om: "Kompiitarri elektirikii 0 fi 1 qofaan akkamitti akka yaadu baradhaa.",
          en: "How electrical switches translate into computation.",
        },
        content: {
          om: `### Sirna Lakkoofsa Binary (0 fi 1)

Kompiitara keessa wanti jiru hundi elektirikii dha.
- **0** = Dhaameera (Off / Low voltage)
- **1** = Qabateera (On / High voltage)

Mallattoon 0 ykn 1 kun **Bit** jedhama. Bit 8 walitti qabamee **Byte** 1 ta'a.`,
          en: `### Binary Number System

At the hardware level, computers operate via millions of microscopic transistors functioning as switches.
- **0** represents OFF (Low voltage)
- **1** represents ON (High voltage)

A single 0 or 1 is a **Bit**. 8 bits combine to form 1 **Byte**.`,
        },
        keyTakeaways: {
          om: [
            "Bit bu'uura daataa kompiitaraati.",
            "Byte 1 = Bit 8.",
            "Suuraan, sagaleen, fi vidiyoon hundi binary dha.",
          ],
          en: [
            "A bit is the atomic unit of digital computation.",
            "1 Byte contains 8 Bits.",
            "All media reduces to binary structures.",
          ],
        },
      },
    ],
  },
  {
    id: "course-web-101",
    title: {
      om: "Ijaarsa Marsariitii & Web (HTML, CSS, JS)",
      en: "Web Development (HTML, CSS, JS)",
    },
    description: {
      om: "Fuula weebii ammayyaa ijaaruu fi miidhagsuu baradhaa.",
      en: "Create modern, responsive web pages from layout to styling and reactivity.",
    },
    category: "digital-tech",
    iconName: "Globe",
    color: "#EC4899",
    level: "Beginner / Jalqabaa",
    lessons: [
      {
        id: "les-web-1",
        title: {
          om: "1. HTML: Lafaa Fuula Weebii",
          en: "1. HTML: Web Structure",
        },
        durationMin: 5,
        summary: {
          om: "HTML akkamitti mata-duree, barruu fi suuraa akka ijaaru baradhaa.",
          en: "Learn how tags, headers, and containers define document structure.",
        },
        content: {
          om: `### HTML Jechuun Maali?

HTML (HyperText Markup Language) lafee ykn ijaarsa gamoo fuula marsariitiiti.
- \`<h1>\`: Mata-duree guddaa
- \`<p>\`: Keeyyata (Paragraph)
- \`<button>\`: Qabduu (Button)
- \`<a>\`: Geessituu (Link)`,
          en: `### What is HTML?

HTML provides the raw structure and skeleton of a web page using semantic tags.`,
        },
        keyTakeaways: {
          om: [
            "HTML lafee marsariitiiti.",
            "Tag hundi banamee cufamuu qaba.",
          ],
          en: [
            "HTML creates the semantic layout.",
            "Tags wrap text content.",
          ],
        },
      },
    ],
  },
  {
    id: "course-biz-101",
    title: {
      om: "Daldala Dijitaalaa & Kalaqa (Digital Business)",
      en: "Digital Business & Innovation",
    },
    description: {
      om: "Gurgurtaa online, kaffaltii mobaayilaa, fi e-commerce baradhaa.",
      en: "Digital payments, online product distribution, and entrepreneurship.",
    },
    category: "business",
    iconName: "Briefcase",
    color: "#F59E0B",
    level: "Beginner / Jalqabaa",
    lessons: [
      {
        id: "les-biz-1",
        title: {
          om: "1. Daldala Dijitaalaa Jalqabuu",
          en: "1. Launching a Digital Business",
        },
        durationMin: 6,
        summary: {
          om: "Mobaayila fi intarneetii fayyadamuun akkamitti tajaajila dhiyeessan.",
          en: "Leveraging mobile tools and internet distribution to create value.",
        },
        content: {
          om: `### Daldala Dijitaalaa

Daldalli dijitaalaa iddoo fi daangaa malee tajaajila ykn meeshaalee addunyaa guutuutti dhiyeessuuf carraa kenna.`,
          en: `### Digital Entrepreneurship

Digital businesses enable global distribution without physical geographical limits.`,
        },
        keyTakeaways: {
          om: [
            "Intarneetiin gabaa addunyaa bana.",
            "Kaffaltiin mobaayilaa saffisa daldalaa dabala.",
          ],
          en: [
            "The internet creates global market access.",
            "Mobile money accelerates micro-transactions.",
          ],
        },
      },
    ],
  },
];
