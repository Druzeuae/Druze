import {
  Mountain,
  Trophy,
  UtensilsCrossed,
  Users,
  Coffee,
  Waves,
  Gamepad2,
  HeartHandshake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ActivityCategory } from "@/types/app";

export interface ActivityCategoryMeta {
  id: ActivityCategory;
  icon: LucideIcon;
  badgeVariant: "intent" | "teal" | "coral" | "gold" | "secondary";
}

export const ACTIVITY_CATEGORIES: ActivityCategoryMeta[] = [
  { id: "hiking", icon: Mountain, badgeVariant: "teal" },
  { id: "football", icon: Trophy, badgeVariant: "coral" },
  { id: "picnic", icon: UtensilsCrossed, badgeVariant: "gold" },
  { id: "hangout", icon: Users, badgeVariant: "intent" },
  { id: "coffee", icon: Coffee, badgeVariant: "secondary" },
  { id: "beach", icon: Waves, badgeVariant: "teal" },
  { id: "game_night", icon: Gamepad2, badgeVariant: "coral" },
  { id: "volunteering", icon: HeartHandshake, badgeVariant: "intent" },
  { id: "other", icon: Sparkles, badgeVariant: "secondary" },
];
