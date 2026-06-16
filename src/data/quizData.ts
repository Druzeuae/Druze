import { BookHeart, Home, Sparkles, Compass, Sprout, type LucideIcon } from "lucide-react";

export type QuizCategory = "faith" | "family" | "lifestyle" | "future" | "values";

export interface QuizOption {
  value: string;
  label: string;
  labelAr: string;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  questionAr: string;
  options: QuizOption[];
  /** Weight in compatibility scoring (higher = matters more). */
  weight: number;
}

export const QUIZ_CATEGORY_META: Record<QuizCategory, { icon: LucideIcon; gradient: string }> = {
  faith: { icon: BookHeart, gradient: "gradient-brand" },
  family: { icon: Home, gradient: "gradient-coral" },
  lifestyle: { icon: Sparkles, gradient: "gradient-teal" },
  future: { icon: Compass, gradient: "gradient-gold" },
  values: { icon: Sprout, gradient: "gradient-social" },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "observance",
    category: "faith",
    question: "How would you describe your religious observance?",
    questionAr: "كيف تصف التزامك الديني؟",
    weight: 3,
    options: [
      { value: "practicing", label: "Practicing", labelAr: "ملتزم" },
      { value: "moderate", label: "Moderately practicing", labelAr: "ملتزم باعتدال" },
      { value: "cultural", label: "Cultural", labelAr: "ثقافي" },
      { value: "private", label: "Prefer to keep it private", labelAr: "أفضل الخصوصية" },
    ],
  },
  {
    id: "tradition",
    category: "faith",
    question: "How important is preserving Druze traditions to you?",
    questionAr: "ما مدى أهمية الحفاظ على التقاليد الدرزية بالنسبة لك؟",
    weight: 3,
    options: [
      { value: "very", label: "Very important", labelAr: "مهم جداً" },
      { value: "somewhat", label: "Somewhat important", labelAr: "مهم نوعاً ما" },
      { value: "open", label: "Open-minded & modern", labelAr: "منفتح وعصري" },
    ],
  },
  {
    id: "family_role",
    category: "family",
    question: "What role does family play in your life?",
    questionAr: "ما الدور الذي تلعبه العائلة في حياتك؟",
    weight: 3,
    options: [
      { value: "central", label: "Central — family first", labelAr: "محوري — العائلة أولاً" },
      { value: "important", label: "Important but balanced", labelAr: "مهمة لكن بتوازن" },
      { value: "independent", label: "I value independence", labelAr: "أقدّر الاستقلالية" },
    ],
  },
  {
    id: "children",
    category: "future",
    question: "Do you hope to have children one day?",
    questionAr: "هل تأمل في إنجاب أطفال يوماً ما؟",
    weight: 3,
    options: [
      { value: "yes", label: "Yes, definitely", labelAr: "نعم، بالتأكيد" },
      { value: "open", label: "Open to it", labelAr: "منفتح على الفكرة" },
      { value: "unsure", label: "Not sure yet", labelAr: "غير متأكد بعد" },
      { value: "no", label: "Prefer not to", labelAr: "أفضّل عدم ذلك" },
    ],
  },
  {
    id: "settle",
    category: "future",
    question: "Where would you ideally like to settle?",
    questionAr: "أين تفضّل أن تستقر بشكل مثالي؟",
    weight: 2,
    options: [
      { value: "uae", label: "Here in the UAE", labelAr: "هنا في الإمارات" },
      { value: "homeland", label: "Back in the homeland", labelAr: "في الوطن الأم" },
      { value: "anywhere", label: "Anywhere with the right person", labelAr: "أي مكان مع الشخص المناسب" },
      { value: "undecided", label: "Still undecided", labelAr: "لم أقرر بعد" },
    ],
  },
  {
    id: "weekend",
    category: "lifestyle",
    question: "Your ideal weekend looks like...",
    questionAr: "عطلة نهاية الأسبوع المثالية لك تبدو...",
    weight: 1,
    options: [
      { value: "family", label: "A warm family gathering", labelAr: "تجمّع عائلي دافئ" },
      { value: "outdoors", label: "An outdoor adventure", labelAr: "مغامرة في الهواء الطلق" },
      { value: "quiet", label: "Quiet time at home", labelAr: "وقت هادئ في المنزل" },
      { value: "social", label: "Out with friends", labelAr: "مع الأصدقاء" },
    ],
  },
  {
    id: "community",
    category: "values",
    question: "How involved do you want to be in the community?",
    questionAr: "ما مدى رغبتك في المشاركة المجتمعية؟",
    weight: 2,
    options: [
      { value: "very", label: "Very involved", labelAr: "مشارك بفعالية" },
      { value: "some", label: "Somewhat", labelAr: "إلى حد ما" },
      { value: "little", label: "I keep to my close circle", labelAr: "أكتفي بدائرتي القريبة" },
    ],
  },
  {
    id: "value",
    category: "values",
    question: "Which value matters most to you in a partner?",
    questionAr: "أي قيمة تهمّك أكثر في الشريك؟",
    weight: 3,
    options: [
      { value: "faith", label: "Faith", labelAr: "الإيمان" },
      { value: "family", label: "Family devotion", labelAr: "التفاني العائلي" },
      { value: "ambition", label: "Ambition", labelAr: "الطموح" },
      { value: "kindness", label: "Kindness", labelAr: "اللطف" },
      { value: "honesty", label: "Honesty", labelAr: "الصدق" },
    ],
  },
  {
    id: "lifestyle_pace",
    category: "lifestyle",
    question: "Which best describes your lifestyle?",
    questionAr: "أي وصف يناسب نمط حياتك؟",
    weight: 1,
    options: [
      { value: "homebody", label: "Homebody", labelAr: "بيتوتي" },
      { value: "balanced", label: "Balanced", labelAr: "متوازن" },
      { value: "social", label: "Social butterfly", labelAr: "اجتماعي" },
      { value: "adventurous", label: "Adventurous", labelAr: "مغامر" },
    ],
  },
];

/** Showcase quiz answers for the mock members, so compatibility shows immediately. */
export const QUIZ_ANSWERS_BY_ID: Record<string, Record<string, string>> = {
  "u-you": { observance: "moderate", tradition: "somewhat", family_role: "important", children: "open", settle: "uae", weekend: "outdoors", community: "very", value: "kindness", lifestyle_pace: "balanced" },
  "u-2": { observance: "moderate", tradition: "somewhat", family_role: "important", children: "yes", settle: "uae", weekend: "outdoors", community: "very", value: "kindness", lifestyle_pace: "adventurous" },
  "u-3": { observance: "practicing", tradition: "very", family_role: "central", children: "yes", settle: "homeland", weekend: "family", community: "some", value: "family", lifestyle_pace: "homebody" },
  "u-4": { observance: "cultural", tradition: "open", family_role: "independent", children: "unsure", settle: "anywhere", weekend: "social", community: "little", value: "ambition", lifestyle_pace: "social" },
  "u-5": { observance: "moderate", tradition: "somewhat", family_role: "important", children: "open", settle: "uae", weekend: "quiet", community: "very", value: "kindness", lifestyle_pace: "balanced" },
  "u-6": { observance: "practicing", tradition: "very", family_role: "central", children: "yes", settle: "uae", weekend: "family", community: "some", value: "faith", lifestyle_pace: "balanced" },
  "u-7": { observance: "moderate", tradition: "open", family_role: "important", children: "open", settle: "anywhere", weekend: "outdoors", community: "some", value: "honesty", lifestyle_pace: "adventurous" },
};
