import type {
  CommunityEvent,
  CommunityMoment,
  MajlisTopic,
  MatteCircle,
  Village,
} from "@/types/app";
import { CURRENT_USER_ID } from "@/data/mockData";

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const inDays = (days: number, hour = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
/** Unsplash cover image (graceful fallback to a gradient is handled in the UI). */
const ux = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=70`;

/** Hometown village per mock member (used until a real `village` is set on the profile). */
export const MEMBER_VILLAGE: Record<string, string> = {
  [CURRENT_USER_ID]: "vil-hasbaya",
  "u-2": "vil-baakleen",
  "u-3": "vil-choueifat",
  "u-4": "vil-hasbaya",
  "u-5": "vil-suwayda",
  "u-6": "vil-baakleen",
  "u-7": "vil-choueifat",
};

/** Showcase contribution points per mock member. */
export const MEMBER_POINTS: Record<string, number> = {
  [CURRENT_USER_ID]: 215,
  "u-2": 430,
  "u-3": 95,
  "u-4": 160,
  "u-5": 310,
  "u-6": 48,
  "u-7": 125,
};

export const VILLAGES: Village[] = [
  {
    id: "vil-hasbaya",
    name: "Hasbaya",
    nameAr: "حاصبيا",
    region: "Nabatieh",
    regionAr: "النبطية",
    country: "Lebanon",
    countryAr: "لبنان",
    blurb: "A historic town at the foot of Mount Hermon, known for its old souk and the Shihab citadel.",
    blurbAr: "بلدة تاريخية عند سفح جبل الشيخ، تشتهر بسوقها القديم وقلعة الشهاب.",
    image: ux("1506905925346-21bda4d32df4"),
    memberIds: [CURRENT_USER_ID, "u-4"],
  },
  {
    id: "vil-baakleen",
    name: "Baakleen",
    nameAr: "بعقلين",
    region: "Chouf",
    regionAr: "الشوف",
    country: "Lebanon",
    countryAr: "لبنان",
    blurb: "A cultural heart of the Chouf, home to historic palaces and the national library.",
    blurbAr: "قلب الشوف الثقافي، موطن القصور التاريخية والمكتبة الوطنية.",
    image: ux("1441974231531-c6227db76b6e"),
    memberIds: ["u-2", "u-6"],
  },
  {
    id: "vil-choueifat",
    name: "Choueifat",
    nameAr: "الشويفات",
    region: "Aley",
    regionAr: "عاليه",
    country: "Lebanon",
    countryAr: "لبنان",
    blurb: "A town near Beirut famed for its schools and strong diaspora ties.",
    blurbAr: "بلدة قرب بيروت تشتهر بمدارسها وروابطها القوية مع المغتربين.",
    image: ux("1519681393784-d120267933ba"),
    memberIds: ["u-3", "u-7"],
  },
  {
    id: "vil-suwayda",
    name: "As-Suwayda",
    nameAr: "السويداء",
    region: "Jabal al-Druze",
    regionAr: "جبل الدروز",
    country: "Syria",
    countryAr: "سوريا",
    blurb: "The capital of Jabal al-Druze, surrounded by volcanic hills and vineyards.",
    blurbAr: "عاصمة جبل الدروز، تحيط بها التلال البركانية والكروم.",
    image: ux("1470770841072-f978cf4d019e"),
    memberIds: ["u-5"],
  },
  {
    id: "vil-daliyat",
    name: "Daliyat al-Karmel",
    nameAr: "دالية الكرمل",
    region: "Mount Carmel",
    regionAr: "جبل الكرمل",
    country: "Palestine",
    countryAr: "فلسطين",
    blurb: "A vibrant town on Mount Carmel known for its markets and hospitality.",
    blurbAr: "بلدة نابضة بالحياة على جبل الكرمل تشتهر بأسواقها وكرم ضيافتها.",
    image: ux("1465146344425-f00d5f5c8f07"),
    memberIds: [],
  },
  {
    id: "vil-majdal",
    name: "Majdal Shams",
    nameAr: "مجدل شمس",
    region: "Golan Heights",
    regionAr: "الجولان",
    country: "Syria",
    countryAr: "سوريا",
    blurb: "The largest Druze town in the Golan, nestled on the slopes of Mount Hermon.",
    blurbAr: "أكبر بلدة درزية في الجولان، على سفوح جبل الشيخ.",
    image: ux("1470071459604-3b5ec3a7fe05"),
    memberIds: [],
  },
];

export const MAJLIS_TOPICS: MajlisTopic[] = [
  {
    id: "mj-1",
    authorId: "u-2",
    category: "heritage",
    title: "Stories our grandparents told about the mountain",
    titleAr: "حكايات أجدادنا عن الجبل",
    body: "Let's preserve them here. My grandfather used to tell us about the harvest seasons in the Chouf and how the whole village would gather. What stories did you grow up with?",
    bodyAr: "لنحفظها هنا. كان جدي يحدثنا عن مواسم الحصاد في الشوف وكيف كانت القرية كلها تجتمع. ما الحكايات التي كبرتم عليها؟",
    likeIds: [CURRENT_USER_ID, "u-4", "u-5"],
    replies: [
      { id: "mr-1", authorId: "u-5", body: "My grandmother kept the old recipes written by hand — I should scan them before they fade.", createdAt: hoursAgo(20) },
      { id: "mr-2", authorId: CURRENT_USER_ID, body: "Please do! We could start a shared heritage archive.", createdAt: hoursAgo(18) },
    ],
    createdAt: ago(2),
  },
  {
    id: "mj-2",
    authorId: "u-3",
    category: "advice",
    title: "Moving to Dubai — tips for newcomers?",
    titleAr: "الانتقال إلى دبي — نصائح للقادمين الجدد؟",
    body: "A cousin is relocating next month. What do you wish you knew when you first arrived — neighborhoods, community spots, anything?",
    bodyAr: "ابن عمي سينتقل الشهر القادم. ما الذي تتمنون لو عرفتموه عند وصولكم — الأحياء، أماكن تجمع المجتمع، أي شيء؟",
    likeIds: ["u-6", "u-7"],
    replies: [
      { id: "mr-3", authorId: "u-6", body: "Join an Activities hike first — fastest way to meet people here.", createdAt: hoursAgo(30) },
    ],
    createdAt: ago(4),
  },
  {
    id: "mj-3",
    authorId: "u-7",
    category: "question",
    title: "Best place to find good matte (متة) in the UAE?",
    titleAr: "أفضل مكان لإيجاد متة جيدة في الإمارات؟",
    body: "Craving a proper matte session. Where do you all get your yerba and bombilla locally?",
    bodyAr: "أشتاق لجلسة متة حقيقية. من أين تشترون اليربا والبمبيلا محلياً؟",
    likeIds: [CURRENT_USER_ID],
    replies: [],
    createdAt: hoursAgo(8),
  },
];

export const COMMUNITY_MOMENTS: CommunityMoment[] = [
  {
    id: "mo-1",
    authorId: "u-5",
    type: "celebration",
    title: "Engagement! 💍",
    titleAr: "خطوبة! 💍",
    body: "Alf mabrouk to my brother on his engagement this weekend. Surrounded by family and so much joy.",
    bodyAr: "ألف مبروك لأخي على خطوبته هذا الأسبوع. محاطون بالعائلة والكثير من الفرح.",
    supportIds: [CURRENT_USER_ID, "u-2", "u-4", "u-7"],
    createdAt: ago(1),
  },
  {
    id: "mo-2",
    authorId: "u-4",
    type: "milestone",
    title: "Graduated with honors 🎓",
    titleAr: "تخرجت بامتياز 🎓",
    body: "Finished my master's in civil engineering. Grateful for everyone in this community who supported me along the way.",
    bodyAr: "أنهيت الماجستير في الهندسة المدنية. ممتن لكل من دعمني في هذا المجتمع.",
    supportIds: [CURRENT_USER_ID, "u-3", "u-6"],
    createdAt: ago(3),
  },
  {
    id: "mo-3",
    authorId: "u-6",
    type: "condolence",
    title: "In loving memory",
    titleAr: "رحمة وذكرى طيبة",
    body: "We lost a dear elder of our village this week. May his memory be a blessing. Condolences to the family — we stand with you.",
    bodyAr: "فقدنا أحد كبار قريتنا هذا الأسبوع. لروحه الرحمة. التعازي للعائلة — نحن معكم.",
    supportIds: [CURRENT_USER_ID, "u-2", "u-3", "u-5", "u-7"],
    createdAt: ago(5),
  },
];

export const MATTE_CIRCLES: MatteCircle[] = [
  {
    id: "mt-1",
    name: "Friday Matte & Talk",
    nameAr: "متة وحديث الجمعة",
    hostId: "u-2",
    schedule: "Every Friday, 6:00 PM",
    scheduleAr: "كل جمعة، 6:00 مساءً",
    mode: "in_person",
    location: "Al Qudra, Dubai",
    locationAr: "القدرة، دبي",
    blurb: "Bring your termos and bombilla. We sit, sip, and catch up — newcomers always welcome.",
    blurbAr: "أحضروا الترمس والبمبيلا. نجلس ونحتسي المتة ونتسامر — القادمون الجدد مرحب بهم دائماً.",
    image: ux("1447933601403-0c6688de566e"),
    memberIds: [CURRENT_USER_ID, "u-2", "u-6"],
  },
  {
    id: "mt-2",
    name: "Online Matte Majlis (Diaspora)",
    nameAr: "مجلس المتة أونلاين (المغتربون)",
    hostId: "u-5",
    schedule: "Sundays, 8:00 PM (GST)",
    scheduleAr: "الأحد، 8:00 مساءً (بتوقيت الخليج)",
    mode: "online",
    location: "Video call",
    locationAr: "مكالمة فيديو",
    blurb: "For members far from home — pour your matte and join the video circle from anywhere in the world.",
    blurbAr: "للأعضاء البعيدين عن الوطن — اسكبوا متتكم وانضموا لدائرة الفيديو من أي مكان في العالم.",
    image: ux("1495474472287-4d71bcdd2085"),
    memberIds: ["u-5", "u-7"],
  },
  {
    id: "mt-3",
    name: "Sunset Matte by the Beach",
    nameAr: "متة الغروب على الشاطئ",
    hostId: "u-7",
    schedule: "Every Saturday, 5:00 PM",
    scheduleAr: "كل سبت، 5:00 مساءً",
    mode: "in_person",
    location: "Kite Beach, Dubai",
    locationAr: "كايت بيتش، دبي",
    blurb: "We gather on the sand, pass the matte around, and watch the sun go down together.",
    blurbAr: "نجتمع على الرمال، نمرر المتة، ونشاهد غروب الشمس معاً.",
    image: ux("1414235077428-338989a2e8c0"),
    memberIds: ["u-7", "u-3", "u-4"],
  },
];

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: "ev-1",
    title: "Ziyarat Nabi Shu'ayb",
    titleAr: "زيارة مقام النبي شعيب",
    description:
      "The most important Druze religious holiday — a community pilgrimage and gathering at the maqam, with prayers, food, and togetherness. All are welcome to attend.",
    descriptionAr:
      "أهم عيد ديني درزي — زيارة جماعية وتجمع عند المقام، مع الصلوات والطعام والتآلف. الجميع مدعوون للحضور.",
    category: "religious",
    date: inDays(12, 9),
    endDate: inDays(14, 18),
    location: "Maqam Nabi Shu'ayb, Hittin",
    locationAr: "مقام النبي شعيب، حطين",
    image: ux("1470071459604-3b5ec3a7fe05"),
    official: true,
    attendeeIds: ["u-2", "u-4", "u-5", "u-6"],
  },
  {
    id: "ev-2",
    title: "Eid al-Adha Community Gathering",
    titleAr: "تجمع عيد الأضحى",
    description:
      "Celebrate Eid al-Adha together with the whole community — a shared feast, sweets for the children, and warm wishes for all families.",
    descriptionAr:
      "نحتفل بعيد الأضحى معاً مع كل المجتمع — وليمة مشتركة، حلويات للأطفال، وأطيب التمنيات لكل العائلات.",
    category: "religious",
    date: inDays(5, 11),
    location: "Community Hall, Al Barsha, Dubai",
    locationAr: "القاعة المجتمعية، البرشاء، دبي",
    image: ux("1414235077428-338989a2e8c0"),
    official: true,
    attendeeIds: [CURRENT_USER_ID, "u-3", "u-7"],
  },
  {
    id: "ev-3",
    title: "DRUZE UAE 1-Year Anniversary 🎉",
    titleAr: "الذكرى السنوية الأولى لدروز الإمارات 🎉",
    description:
      "One year since our community came together! Join us for an evening of music, food, and celebration of everything we've built — together.",
    descriptionAr:
      "عام كامل منذ أن اجتمع مجتمعنا! انضموا إلينا لأمسية من الموسيقى والطعام والاحتفال بكل ما بنيناه معاً.",
    category: "anniversary",
    date: inDays(20, 19),
    location: "Dubai Marina",
    locationAr: "مرسى دبي",
    image: ux("1467810563316-b5476525c0f9"),
    official: true,
    attendeeIds: [CURRENT_USER_ID, "u-2", "u-4", "u-5", "u-6", "u-7"],
  },
  {
    id: "ev-4",
    title: "Heritage Night: Stories & Dabke",
    titleAr: "ليلة التراث: حكايات ودبكة",
    description:
      "A cultural evening celebrating our heritage — traditional storytelling, dabke dancing, and authentic Levantine food. Bring the whole family.",
    descriptionAr:
      "أمسية ثقافية تحتفي بتراثنا — حكايات تقليدية، رقص الدبكة، وطعام شامي أصيل. أحضروا العائلة كلها.",
    category: "cultural",
    date: inDays(9, 19),
    location: "Heritage Village, Abu Dhabi",
    locationAr: "القرية التراثية، أبوظبي",
    image: ux("1519671482749-fd09be7ccebf"),
    official: false,
    attendeeIds: ["u-5", "u-6"],
  },
];
