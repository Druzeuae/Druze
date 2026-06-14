export interface InterestDef {
  id: string;
  category: string;
  name: string;
  nameAr: string;
}

export const INTEREST_CATEGORIES = [
  "Sports",
  "Creative",
  "Intellectual",
  "Social",
  "Outdoor",
  "Cultural",
  "Druze Heritage",
] as const;

export const INTERESTS: InterestDef[] = [
  { id: "football", category: "Sports", name: "Football", nameAr: "كرة القدم" },
  { id: "gym", category: "Sports", name: "Gym", nameAr: "النادي الرياضي" },
  { id: "running", category: "Sports", name: "Running", nameAr: "الركض" },
  { id: "cycling", category: "Sports", name: "Cycling", nameAr: "ركوب الدراجات" },
  { id: "swimming", category: "Sports", name: "Swimming", nameAr: "السباحة" },

  { id: "photography", category: "Creative", name: "Photography", nameAr: "التصوير" },
  { id: "art", category: "Creative", name: "Art", nameAr: "الفن" },
  { id: "music", category: "Creative", name: "Music", nameAr: "الموسيقى" },
  { id: "design", category: "Creative", name: "Design", nameAr: "التصميم" },

  { id: "reading", category: "Intellectual", name: "Reading", nameAr: "القراءة" },
  { id: "business", category: "Intellectual", name: "Business", nameAr: "الأعمال" },
  { id: "technology", category: "Intellectual", name: "Technology", nameAr: "التكنولوجيا" },
  { id: "history", category: "Intellectual", name: "History", nameAr: "التاريخ" },

  { id: "coffee_meetups", category: "Social", name: "Coffee Meetups", nameAr: "لقاءات القهوة" },
  { id: "board_games", category: "Social", name: "Board Games", nameAr: "ألعاب الطاولة" },
  { id: "volunteering", category: "Social", name: "Volunteering", nameAr: "التطوع" },

  { id: "hiking", category: "Outdoor", name: "Hiking", nameAr: "المشي لمسافات طويلة" },
  { id: "desert_trips", category: "Outdoor", name: "Desert Trips", nameAr: "رحلات الصحراء" },
  { id: "camping", category: "Outdoor", name: "Camping", nameAr: "التخييم" },
  { id: "beach", category: "Outdoor", name: "Beach", nameAr: "الشاطئ" },

  { id: "language_exchange", category: "Cultural", name: "Language Exchange", nameAr: "تبادل اللغات" },
  { id: "book_club", category: "Cultural", name: "Book Club", nameAr: "نادي الكتاب" },
  { id: "cooking", category: "Cultural", name: "Cooking", nameAr: "الطبخ" },

  { id: "cultural_events", category: "Druze Heritage", name: "Cultural Events", nameAr: "فعاليات ثقافية" },
  { id: "community_gatherings", category: "Druze Heritage", name: "Community Gatherings", nameAr: "تجمعات المجتمع" },
  { id: "traditions", category: "Druze Heritage", name: "Traditions", nameAr: "التقاليد" },
];

export function getInterest(id: string): InterestDef | undefined {
  return INTERESTS.find((i) => i.id === id);
}
