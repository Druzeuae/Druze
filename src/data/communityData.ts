import type {
  CommunityMoment,
  MajlisTopic,
  MatteCircle,
  Village,
} from "@/types/app";
import { CURRENT_USER_ID } from "@/data/mockData";

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

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
    memberIds: ["u-5", "u-7"],
  },
];
