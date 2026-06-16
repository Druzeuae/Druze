import type { AppProfile } from "@/types/app";
import { QUIZ_QUESTIONS } from "@/data/quizData";

const QUESTION_WEIGHT = new Map(QUIZ_QUESTIONS.map((q) => [q.id, q.weight]));

/**
 * Values-based compatibility (0-100) between two members, driven by the
 * quiz answers (weighted), shared interests, and shared connection intents.
 * Returns null when there isn't enough data to be meaningful.
 */
export function computeCompatibility(a: AppProfile, b: AppProfile): number | null {
  const ansA = a.quizAnswers ?? {};
  const ansB = b.quizAnswers ?? {};

  // Quiz component (weighted agreement over commonly answered questions).
  let weightSum = 0;
  let matchSum = 0;
  for (const q of QUIZ_QUESTIONS) {
    const va = ansA[q.id];
    const vb = ansB[q.id];
    if (va === undefined || vb === undefined) continue;
    weightSum += q.weight;
    if (va === vb) matchSum += q.weight;
  }
  const quizScore = weightSum > 0 ? matchSum / weightSum : null;

  // Shared interests component.
  const setB = new Set(b.interestIds);
  const sharedInterests = a.interestIds.filter((i) => setB.has(i)).length;
  const interestScore = Math.min(1, sharedInterests / 5);

  // Shared intents component.
  const intentsB = new Set(b.intents);
  const sharedIntents = a.intents.filter((i) => intentsB.has(i)).length;
  const intentScore = a.intents.length > 0 ? sharedIntents / a.intents.length : 0;

  if (quizScore === null && sharedInterests === 0) return null;

  // Weighted blend; quiz dominates when present.
  const score =
    quizScore !== null
      ? 0.65 * quizScore + 0.2 * interestScore + 0.15 * intentScore
      : 0.6 * interestScore + 0.4 * intentScore;

  // Gentle floor so matches never look discouraging.
  return Math.round(Math.max(40, Math.min(99, score * 100)));
}

export function quizCompletion(profile: AppProfile): number {
  const answered = Object.keys(profile.quizAnswers ?? {}).length;
  return Math.round((answered / QUIZ_QUESTIONS.length) * 100);
}

export function hasCompletedQuiz(profile: AppProfile): boolean {
  return Object.keys(profile.quizAnswers ?? {}).length >= QUIZ_QUESTIONS.length;
}

/** Tier label suffix for i18n: compatibility.tiers.<tier> */
export function compatibilityTier(score: number): "soulmate" | "great" | "good" | "potential" {
  if (score >= 85) return "soulmate";
  if (score >= 70) return "great";
  if (score >= 55) return "good";
  return "potential";
}
