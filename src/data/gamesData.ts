import { Brain, Scale, Sparkles, UserSearch, type LucideIcon } from "lucide-react";
import type { GameType } from "@/types/app";

/* ----------------------------- Game catalog ----------------------------- */

export interface GameMeta {
  id: GameType;
  icon: LucideIcon;
  /** tailwind gradient utility class for the card header */
  gradient: string;
  badgeVariant: "intent" | "teal" | "coral" | "gold";
  minPlayers: number;
}

export const GAMES: GameMeta[] = [
  { id: "trivia", icon: Brain, gradient: "gradient-brand", badgeVariant: "intent", minPlayers: 1 },
  { id: "would_you_rather", icon: Scale, gradient: "gradient-teal", badgeVariant: "teal", minPlayers: 2 },
  { id: "never_have_i_ever", icon: Sparkles, gradient: "gradient-coral", badgeVariant: "coral", minPlayers: 2 },
  { id: "two_truths", icon: UserSearch, gradient: "gradient-gold", badgeVariant: "gold", minPlayers: 2 },
];

/* ------------------------------- Trivia -------------------------------- */

export interface TriviaQuestion {
  question: string;
  questionAr: string;
  options: string[];
  optionsAr: string[];
  answer: number; // index into options
  category: "general" | "culture" | "uae" | "science";
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: "Which mountain range is historically home to many Druze communities?",
    questionAr: "أي سلسلة جبال هي موطن تاريخي للعديد من المجتمعات الدرزية؟",
    options: ["The Alps", "Mount Lebanon", "The Andes", "Mount Fuji"],
    optionsAr: ["جبال الألب", "جبل لبنان", "جبال الأنديز", "جبل فوجي"],
    answer: 1,
    category: "culture",
  },
  {
    question: "What is the capital of the United Arab Emirates?",
    questionAr: "ما هي عاصمة دولة الإمارات العربية المتحدة؟",
    options: ["Dubai", "Sharjah", "Abu Dhabi", "Ajman"],
    optionsAr: ["دبي", "الشارقة", "أبوظبي", "عجمان"],
    answer: 2,
    category: "uae",
  },
  {
    question: "The five-colored Druze star represents five cosmic principles. How many colors?",
    questionAr: "النجمة الدرزية الملونة تمثل خمسة مبادئ كونية. كم عدد ألوانها؟",
    options: ["Three", "Four", "Five", "Seven"],
    optionsAr: ["ثلاثة", "أربعة", "خمسة", "سبعة"],
    answer: 2,
    category: "culture",
  },
  {
    question: "Which traditional Levantine dish is made from cracked wheat and parsley?",
    questionAr: "أي طبق شامي تقليدي يُصنع من البرغل والبقدونس؟",
    options: ["Hummus", "Tabbouleh", "Falafel", "Shawarma"],
    optionsAr: ["حمص", "تبولة", "فلافل", "شاورما"],
    answer: 1,
    category: "culture",
  },
  {
    question: "What is the tallest building in the world, located in Dubai?",
    questionAr: "ما هو أطول مبنى في العالم، الموجود في دبي؟",
    options: ["Burj Al Arab", "Burj Khalifa", "The Shard", "Empire State"],
    optionsAr: ["برج العرب", "برج خليفة", "ذا شارد", "إمباير ستيت"],
    answer: 1,
    category: "uae",
  },
  {
    question: "Which planet is known as the Red Planet?",
    questionAr: "أي كوكب يُعرف بالكوكب الأحمر؟",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    optionsAr: ["الزهرة", "المشتري", "المريخ", "زحل"],
    answer: 2,
    category: "science",
  },
  {
    question: "In which month is UAE National Day celebrated?",
    questionAr: "في أي شهر يُحتفل باليوم الوطني للإمارات؟",
    options: ["November", "December", "January", "February"],
    optionsAr: ["نوفمبر", "ديسمبر", "يناير", "فبراير"],
    answer: 1,
    category: "uae",
  },
  {
    question: "What is the largest ocean on Earth?",
    questionAr: "ما هو أكبر محيط على الأرض؟",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    optionsAr: ["الأطلسي", "الهندي", "المتجمد الشمالي", "الهادئ"],
    answer: 3,
    category: "general",
  },
  {
    question: "Which language is most widely spoken across the Druze community?",
    questionAr: "ما هي اللغة الأكثر انتشاراً بين أبناء الطائفة الدرزية؟",
    options: ["Turkish", "Arabic", "Persian", "Greek"],
    optionsAr: ["التركية", "العربية", "الفارسية", "اليونانية"],
    answer: 1,
    category: "culture",
  },
  {
    question: "How many emirates make up the UAE?",
    questionAr: "كم عدد الإمارات التي تتكون منها دولة الإمارات؟",
    options: ["Five", "Six", "Seven", "Eight"],
    optionsAr: ["خمس", "ست", "سبع", "ثماني"],
    answer: 2,
    category: "uae",
  },
  {
    question: "What gas do plants primarily absorb from the air?",
    questionAr: "ما الغاز الذي تمتصه النباتات بشكل أساسي من الهواء؟",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    optionsAr: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"],
    answer: 2,
    category: "science",
  },
  {
    question: "Which body of water borders Dubai?",
    questionAr: "أي مسطح مائي يحاذي دبي؟",
    options: ["Red Sea", "Mediterranean Sea", "Arabian Gulf", "Black Sea"],
    optionsAr: ["البحر الأحمر", "البحر المتوسط", "الخليج العربي", "البحر الأسود"],
    answer: 2,
    category: "uae",
  },
];

/* -------------------------- Would You Rather --------------------------- */

export interface WouldYouRather {
  a: string;
  aAr: string;
  b: string;
  bAr: string;
}

export const WOULD_YOU_RATHER: WouldYouRather[] = [
  {
    a: "Hike a mountain at sunrise",
    aAr: "تتسلق جبلاً عند شروق الشمس",
    b: "Relax on the beach at sunset",
    bAr: "تسترخي على الشاطئ عند الغروب",
  },
  {
    a: "Have dinner with a historical figure",
    aAr: "تتعشى مع شخصية تاريخية",
    b: "Travel 100 years into the future",
    bAr: "تسافر 100 عام إلى المستقبل",
  },
  {
    a: "Always speak only Arabic",
    aAr: "تتحدث العربية فقط دائماً",
    b: "Always speak only English",
    bAr: "تتحدث الإنجليزية فقط دائماً",
  },
  {
    a: "Be able to fly",
    aAr: "تستطيع الطيران",
    b: "Be able to become invisible",
    bAr: "تستطيع أن تصبح خفياً",
  },
  {
    a: "Live in Dubai forever",
    aAr: "تعيش في دبي للأبد",
    b: "Travel the world with no home",
    bAr: "تسافر حول العالم بلا منزل",
  },
  {
    a: "Give up coffee for a year",
    aAr: "تتخلى عن القهوة لمدة عام",
    b: "Give up social media for a year",
    bAr: "تتخلى عن وسائل التواصل لمدة عام",
  },
  {
    a: "Host a big family gathering",
    aAr: "تستضيف تجمعاً عائلياً كبيراً",
    b: "Have a quiet evening with one close friend",
    bAr: "تقضي أمسية هادئة مع صديق مقرب",
  },
  {
    a: "Be famous but have no privacy",
    aAr: "تكون مشهوراً لكن بلا خصوصية",
    b: "Be unknown but completely free",
    bAr: "تكون مجهولاً لكن حراً تماماً",
  },
  {
    a: "Always know the truth",
    aAr: "تعرف الحقيقة دائماً",
    b: "Always stay blissfully unaware",
    bAr: "تبقى في سعادة الجهل",
  },
  {
    a: "Master every musical instrument",
    aAr: "تتقن كل آلة موسيقية",
    b: "Speak every language fluently",
    bAr: "تتحدث كل لغة بطلاقة",
  },
];

/* -------------------------- Never Have I Ever -------------------------- */

export interface NeverHaveIEver {
  text: string;
  textAr: string;
}

export const NEVER_HAVE_I_EVER: NeverHaveIEver[] = [
  { text: "...climbed a mountain", textAr: "...تسلقت جبلاً" },
  { text: "...visited all seven emirates", textAr: "...زرت الإمارات السبع كلها" },
  { text: "...cooked a full Levantine feast", textAr: "...طبخت وليمة شامية كاملة" },
  { text: "...stayed up all night talking with friends", textAr: "...سهرت الليل كله أتحدث مع الأصدقاء" },
  { text: "...learned a third language", textAr: "...تعلمت لغة ثالثة" },
  { text: "...gone camping in the desert", textAr: "...خيمت في الصحراء" },
  { text: "...won a board game tournament", textAr: "...فزت ببطولة ألعاب طاولة" },
  { text: "...sung karaoke in public", textAr: "...غنيت كاريوكي أمام الناس" },
  { text: "...met someone new through this app", textAr: "...تعرفت على شخص جديد عبر هذا التطبيق" },
  { text: "...traveled somewhere completely alone", textAr: "...سافرت إلى مكان بمفردي تماماً" },
  { text: "...volunteered for a community event", textAr: "...تطوعت في فعالية مجتمعية" },
  { text: "...woken up before sunrise to watch it", textAr: "...استيقظت قبل الفجر لمشاهدة الشروق" },
];
