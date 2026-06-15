import type { AppProfile } from "@/types/app";

/**
 * Saf Al-Ikhwan reputation — rewards meaningful contribution (mutual support,
 * mentorship, hosting, knowledge sharing, showing up) rather than vanity
 * metrics like followers. Levels are earned, not bought.
 */

export type StandingLevel = "newcomer" | "neighbor" | "pillar" | "guardian";

export interface StandingMeta {
  level: StandingLevel;
  /** i18n key suffix, e.g. community.standing.levels.<level> */
  min: number;
  next: number | null;
  /** tailwind gradient utility for the badge */
  gradient: string;
}

const LADDER: StandingMeta[] = [
  { level: "newcomer", min: 0, next: 60, gradient: "gradient-teal" },
  { level: "neighbor", min: 60, next: 180, gradient: "gradient-social" },
  { level: "pillar", min: 180, next: 400, gradient: "gradient-brand" },
  { level: "guardian", min: 400, next: null, gradient: "gradient-gold" },
];

/** Contribution points for a profile (defaults derived from trust + events if unset). */
export function contributionOf(p: Pick<AppProfile, "contributionPoints" | "trustScore" | "communityEventsAttended">): number {
  if (typeof p.contributionPoints === "number") return p.contributionPoints;
  return Math.round((p.trustScore ?? 0) * 1.2 + (p.communityEventsAttended ?? 0) * 12);
}

export function standingOf(points: number): StandingMeta {
  let current = LADDER[0];
  for (const tier of LADDER) {
    if (points >= tier.min) current = tier;
  }
  return current;
}

/** Progress (0..1) toward the next level. Guardian (max) returns 1. */
export function progressToNext(points: number): number {
  const s = standingOf(points);
  if (s.next === null) return 1;
  return Math.min(1, Math.max(0, (points - s.min) / (s.next - s.min)));
}

export interface ContributionAction {
  key: "support" | "mentorship" | "hosting" | "knowledge" | "volunteering" | "presence";
  points: number;
}

/** How many points each meaningful action grants — surfaced in the UI to set expectations. */
export const CONTRIBUTION_ACTIONS: ContributionAction[] = [
  { key: "support", points: 10 },
  { key: "mentorship", points: 25 },
  { key: "hosting", points: 20 },
  { key: "knowledge", points: 15 },
  { key: "volunteering", points: 30 },
  { key: "presence", points: 8 },
];
