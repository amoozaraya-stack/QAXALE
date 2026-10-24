import { CodeChallenge } from "../types";

export interface CodeLessonUnit {
  id: string;
  language: "python" | "javascript" | "html";
  title: {
    om: string;
    en: string;
  };
  oromoExplanation: string;
  logicConcept: {
    om: string;
    en: string;
  };
  starterCode: string;
  expectedOutput: string;
  hints: {
    om: string[];
    en: string[];
  };
}

export const CODING_CURRICULUM: CodeLessonUnit[] = [
  {
    id: "py-lesson-1",
    language: "python",
    title: {
      om: "1. Python: Simannaa & Maxxansuu (Print & Variables)",
      en: "1. Python: Output & Variables",
    },
    oromoExplanation: "Afaan Python keessatti ajajni 'print()' wanta mallattoo waraabbii keessa jiru gara iskiriiniitti baasuuf oola. Koodiin kun maqaa fi simannaa Afaan Oromootiin maxxansa.",
    logicConcept: {
      om: "1. Jijjiiramaa 'maqaa' jedhu uumuu -> 2. Gatii kennuufi -> 3. 'print()' fayyadamuun iskiriinii irratti baasuu.",
      en: "1. Declare variable 'name' -> 2. Assign text value -> 3. Output to terminal using print().",
    },
    starterCode: `# QAXALE Python Lab 01
maqaa = "Bilisummaa"
magaalaa = "Finfinnee"

print("Akkam, maqaan koo " + maqaa + " dha!")
print("Bakki jireenya koo: " + magaalaa)`,
    expectedOutput: `Akkam, maqaan koo Bilisummaa dha!\nBakki jireenya koo: Finfinnee`,
    hints: {
      om: [
        "Mallattoo waraabbii (\" \") cufuu hin dagatinaa.",
        "Jijjiiramaa haaraa 'umurii = 22' dabaluu dandeessa.",
      ],
      en: [
        "Ensure quotation marks match.",
        "You can define additional variables like age.",
      ],
    },
  },
  {
    id: "py-lesson-2",
    language: "python",
    title: {
      om: "2. Python: Haalawwan Murtee (If / Else Logic)",
      en: "2. Python: Conditional Logic (If / Else)",
    },
    oromoExplanation: "Murtoon koodii keessatti akka filannootti hojjeta. 'If' jechuun 'Yoo ta'e' dha; 'Else' jechuun 'Yoo hin taane' dha. Koodiin kun qabxii barataa ilaalee dabarsee ykn kufe jedha.",
    logicConcept: {
      om: "Qabxii > 50 yoo ta'e -> 'Dabarteetta!' maxxansi. Yoo kana hin taane -> 'Irra deebi'ii yaali' jedhi.",
      en: "If score >= 50 -> Output Passed! Otherwise -> Output Try Again.",
    },
    starterCode: `# Murtee If/Else
qabxii = 85

if qabxii >= 50:
    print("Magaalaa Barumsaa: BAGA GAMMADDE, DABARTEETTA!")
    print("Sadarkaa: Qabxii Gaarii")
else:
    print("Gadi aanaadha, irra deebi'ii jabaadhu.")`,
    expectedOutput: `Magaalaa Barumsaa: BAGA GAMMADDE, DABARTEETTA!\nSadarkaa: Qabxii Gaarii`,
    hints: {
      om: ["Tuqaa lamaan (:) dhuma sarara 'if' fi 'else' irratti barbaachisaadha."],
      en: ["Don't forget the colon (:) at the end of conditional lines."],
    },
  },
  {
    id: "py-lesson-3",
    language: "python",
    title: {
      om: "3. Python: Geengoo Marroo (For Loops)",
      en: "3. Python: Iteration & For Loops",
    },
    oromoExplanation: "Hojii tokko irra deddeebiin raawwachuuf geengoo 'for loop' fayyadamna. Koodiin kun tarree teeknolojiiwwan adda addaa tokko tokkoon dubbisa.",
    logicConcept: {
      om: "Tarree teeknolojii keessaa tokko tokkoon fuudhuun 'print()' godha.",
      en: "Iterates through each element of a list sequentially and prints it.",
    },
    starterCode: `# Tarree fi Geengoo Marroo
meeshaalee = ["AI", "Kompiitara", "Moobaayila", "Kuusaa Daataa"]

for meeshaa in meeshaalee:
    print("-> Teeknolojii Qaxalee: " + meeshaa)`,
    expectedOutput: `-> Teeknolojii Qaxalee: AI\n-> Teeknolojii Qaxalee: Kompiitara\n-> Teeknolojii Qaxalee: Moobaayila\n-> Teeknolojii Qaxalee: Kuusaa Daataa`,
    hints: {
      om: ["Indentation (siqiqaa) sarara itti aanuuf barbaachisaadha."],
      en: ["Indentation defines the loop block."],
    },
  },
  {
    id: "js-lesson-1",
    language: "javascript",
    title: {
      om: "4. JavaScript: Dalagaalee & Herrega (Functions)",
      en: "4. JavaScript: Functions & Math",
    },
    oromoExplanation: "JavaScript afaan marsariitii fi app sochoosudha. Dalagaan (function) akka maashina nyaata daakuuti: wanta itti kennitu fuudhee hojjetee bu'aa deebisa.",
    logicConcept: {
      om: "Lakkoofsota lama walitti idauuf dalagaa 'ida'i(a, b)' uumuu.",
      en: "Define function add(a, b) that returns the sum of two integers.",
    },
    starterCode: `// Dalagaa Walitti Ida'uu
function idaHi(a, b) {
  return a + b;
}

let gatii1 = 15;
let gatii2 = 35;
let ida'ama = idaHi(gatii1, gatii2);

console.log("Ida'amni lakkoofsota lamaanii: " + ida'ama);`,
    expectedOutput: `Ida'amni lakkoofsota lamaanii: 50`,
    hints: {
      om: ["'console.log()' galtee gara sararaatti baasa."],
      en: ["console.log prints to the browser console."],
    },
  },
  {
    id: "html-lesson-1",
    language: "html",
    title: {
      om: "5. HTML & CSS: Kaardii Marsariitii Miidhagaa",
      en: "5. HTML & CSS: Modern UI Card",
    },
    oromoExplanation: "HTML fi CSS fayyadamuun fuula weebii miidhagaa fi qulqulluu qopheessuu dandeenya. Koodiin kun kaardii simannaa Qaxale uuma.",
    logicConcept: {
      om: "HTML caasaa qopheessa, CSS immoo halluu fi boca kenna.",
      en: "HTML provides structure, CSS provides colors and rounded borders.",
    },
    starterCode: `<div style="background: #0F172A; color: #F8FAFC; padding: 20px; border-radius: 16px; font-family: sans-serif; border: 1px solid #E5A93B;">
  <h2 style="color: #E5A93B; margin-top: 0;">QAXALE AI</h2>
  <p style="color: #94A3B8;">Afaan Oromoo • Teeknolojii • Barnoota</p>
  <button style="background: #E5A93B; color: #000; padding: 10px 18px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">
    Jalqabi
  </button>
</div>`,
    expectedOutput: `[Rendered HTML Element Preview]`,
    hints: {
      om: ["Tag hunda eeggannoon cufaa."],
      en: ["Make sure closing tags correspond."],
    },
  },
];

export const CODING_CHALLENGES: CodeChallenge[] = [
  {
    id: "ch-1",
    title: {
      om: "Shallaggii Umurii (Age Calculator)",
      en: "Age Calculator in Python",
    },
    language: "python",
    difficulty: "Salphaa (Easy)",
    conceptTag: "Variables & Arithmetic",
    description: {
      om: "Bara dhalootaa (fkn: 2002) fi bara ammaa (2026) fayyadamuun umurii nama tokkoo shallagiitii maxxansi.",
      en: "Using birth year and current year, compute the age and print in Afaan Oromoo format.",
    },
    starterCode: `# Shallaggii Umurii
bara_ammaa = 2026
bara_dhalootaa = 2002

# Hojii kee asitti barreessi:
umurii = bara_ammaa - bara_dhalootaa
print("Umuriin kee waggaa " + str(umurii) + " dha.")`,
    solutionCode: `bara_ammaa = 2026\nbara_dhalootaa = 2002\numurii = bara_ammaa - bara_dhalootaa\nprint("Umuriin kee waggaa " + str(umurii) + " dha.")`,
    expectedOutput: `Umuriin kee waggaa 24 dha.`,
    explanation: {
      om: "Bara ammaa irraa bara dhalootaa hir'isuun umurii arganna.",
      en: "Subtracting birth year from current year calculates exact age.",
    },
  },
  {
    id: "ch-2",
    title: {
      om: "Filter Barattoota Darban (JS Filter)",
      en: "Filter Passing Students",
    },
    language: "javascript",
    difficulty: "Giddu-galeessa (Medium)",
    conceptTag: "Arrays & Filtering",
    description: {
      om: "Tarree qabxiiwwan barattootaa keessaa warra 50 fi isaa ol fidi.",
      en: "From an array of scores, filter and print scores greater than or equal to 50.",
    },
    starterCode: `const qabxiilee = [45, 78, 92, 33, 60, 88];

// Qabxiiwwan darban adda baasi (>= 50):
const darban = qabxiilee.filter(q => q >= 50);

console.log("Qabxiilee darban: " + darban.join(", "));`,
    solutionCode: `const qabxiilee = [45, 78, 92, 33, 60, 88];\nconst darban = qabxiilee.filter(q => q >= 50);\nconsole.log("Qabxiilee darban: " + darban.join(", "));`,
    expectedOutput: `Qabxiilee darban: 78, 92, 60, 88`,
    explanation: {
      om: "Dalagaan 'filter()' qabxiiwwan ulaagaa guutan qofa filata.",
      en: "Array filter evaluates condition for each element.",
    },
  },
];
