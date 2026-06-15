export type Gender = "male" | "female" | "other";
export type Nationality = "druze" | "friend_ally";
export type City = "dubai" | "abu_dhabi" | "sharjah" | "other";
export type Observance = "practicing" | "moderately_practicing" | "cultural" | "prefer_not_to_say";
export type LifestyleType = "family_oriented" | "career_oriented" | "balanced" | "adventurous";
export type Visibility = "public" | "community_only" | "hidden";
export type ConnectionIntent = "marriage" | "friendship" | "professional";
export type AppreciationStatus = "pending" | "matched";
export type MatchStatus = "active" | "unmatched";
export type MessageType = "text" | "photo" | "voice" | "system";
export type ConversationStatus = "matched" | "request" | "blocked";
export type ReportCategory = "fake_profile" | "harassment" | "spam" | "inappropriate_content" | "other";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type NotificationType =
  | "new_match"
  | "new_message"
  | "appreciation"
  | "profile_view"
  | "connection_request"
  | "system"
  | "event_reminder";
export type AccountStatus = "active" | "suspended" | "banned" | "deleted";
export type VerificationLevel = "none" | "phone" | "photo" | "premium";
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

export interface Profile {
  id: string;
  full_name: string;
  display_name: string;
  gender: Gender | null;
  date_of_birth: string | null;
  nationality: Nationality | null;
  city: City | null;
  languages: string[];
  occupation: string | null;

  photos: string[];
  intro_video_url: string | null;

  about_me: string | null;
  personal_values: string | null;
  lifestyle_text: string | null;
  hobbies_text: string | null;

  religious_observance: Observance;
  lifestyle: LifestyleType | null;

  intents: ConnectionIntent[];

  phone_verified: boolean;
  photo_verified: boolean;
  premium_verified: boolean;
  verification_level: VerificationLevel;

  trust_score: number;

  visibility: Visibility;
  account_status: AccountStatus;
  is_premium: boolean;
  premium_until: string | null;

  onboarding_step: number;
  onboarding_completed: boolean;

  pdpl_consent: boolean;
  pdpl_consent_at: string | null;
  age_confirmed: boolean;

  last_active_at: string;
  community_events_attended: number;

  is_admin: boolean;

  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  category: string;
  name: string;
  name_ar: string | null;
  sort_order: number;
}

export interface UserInterest {
  user_id: string;
  interest_id: string;
  created_at: string;
}

export interface Appreciation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: AppreciationStatus;
  message: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  compatibility_score: number;
  status: MatchStatus;
  matched_at: string;
  unmatched_at: string | null;
  unmatched_by: string | null;
}

export interface Conversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  match_id: string | null;
  status: ConversationStatus;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  content: string | null;
  media_url: string | null;
  media_duration_seconds: number | null;
  reaction: Record<string, string>;
  read_at: string | null;
  delivered_at: string;
  created_at: string;
}

export interface BlockRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  category: ReportCategory;
  details: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  admin_notes: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  title_ar: string | null;
  body: string | null;
  body_ar: string | null;
  related_user_id: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  category: ActivityCategory;
  city: City | null;
  location: string | null;
  cover_image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  created_by: string | null;
  created_at: string;
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  joined_at: string;
}

// Minimal Supabase Database type (hand-written; extend as needed for codegen)
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      interests: { Row: Interest; Insert: Partial<Interest>; Update: Partial<Interest> };
      user_interests: { Row: UserInterest; Insert: Partial<UserInterest>; Update: Partial<UserInterest> };
      appreciations: { Row: Appreciation; Insert: Partial<Appreciation>; Update: Partial<Appreciation> };
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> };
      conversations: { Row: Conversation; Insert: Partial<Conversation>; Update: Partial<Conversation> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      blocks: { Row: BlockRow; Insert: Partial<BlockRow>; Update: Partial<BlockRow> };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow> };
      events: { Row: EventRow; Insert: Partial<EventRow>; Update: Partial<EventRow> };
      event_participants: { Row: EventParticipant; Insert: Partial<EventParticipant>; Update: Partial<EventParticipant> };
    };
  };
}
