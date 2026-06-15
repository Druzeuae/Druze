import type {
  AccountStatus,
  City,
  ConnectionIntent,
  Gender,
  LifestyleType,
  Nationality,
  Observance,
  ReportCategory,
  ReportStatus,
  Visibility,
} from "./database";

/** App-level profile shape used by the mock data layer & UI. */
export interface AppProfile {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  gender: Gender;
  dateOfBirth: string;
  nationality: Nationality;
  city: City;
  languages: string[];
  occupation: string;

  photos: string[];
  introVideoUrl?: string;

  aboutMe: string;
  personalValues: string;
  lifestyleText: string;
  hobbiesText: string;

  religiousObservance: Observance;
  lifestyle: LifestyleType;

  intents: ConnectionIntent[];
  interestIds: string[];

  phoneVerified: boolean;
  photoVerified: boolean;
  premiumVerified: boolean;

  trustScore: number;
  visibility: Visibility;
  accountStatus: AccountStatus;
  isPremium: boolean;
  isAdmin?: boolean;

  communityEventsAttended: number;
  createdAt: string;
  lastActiveAt: string;
  onlineStatus?: "online" | "offline";
}

export interface AppAppreciation {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "matched";
  message?: string;
  createdAt: string;
}

export interface AppMatch {
  id: string;
  userAId: string;
  userBId: string;
  compatibilityScore: number;
  status: "active" | "unmatched";
  matchedAt: string;
}

export interface AppConversation {
  id: string;
  userAId: string;
  userBId: string;
  matchId?: string;
  status: "matched" | "request";
  lastMessageAt: string;
  lastMessagePreview?: string;
}

export interface AppMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: "text" | "photo" | "voice" | "system";
  content?: string;
  mediaUrl?: string;
  mediaDurationSeconds?: number;
  reaction?: Record<string, string>;
  readAt?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type:
    | "new_match"
    | "new_message"
    | "appreciation"
    | "profile_view"
    | "connection_request"
    | "system"
    | "event_reminder";
  title: string;
  titleAr: string;
  body?: string;
  bodyAr?: string;
  relatedUserId?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: ReportCategory;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AppBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export type ActivityCategory =
  | "hiking"
  | "football"
  | "picnic"
  | "hangout"
  | "coffee"
  | "beach"
  | "game_night"
  | "volunteering"
  | "other";

export interface AppActivity {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  category: ActivityCategory;
  city: City;
  location: string;
  startsAt: string;
  endsAt?: string;
  capacity?: number;
  createdBy: string;
  participantIds: string[];
  createdAt: string;
}

export type GameType = "trivia" | "would_you_rather" | "never_have_i_ever" | "two_truths";

export interface AppGameRoom {
  id: string;
  name: string;
  nameAr?: string;
  gameType: GameType;
  hostId: string;
  playerIds: string[];
  createdAt: string;
}

export interface DiscoveryFilters {
  city: City | "all";
  intent: ConnectionIntent | "all";
  interestIds: string[];
  verifiedOnly: boolean;
  gender: Gender | "all";
  ageRange: [number, number];
  nationality: Nationality | "all";
}
