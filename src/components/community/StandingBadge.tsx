import { useTranslation } from "react-i18next";
import { Award, Heart, Shield, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { standingOf, type StandingLevel } from "@/lib/reputation";

const LEVEL_ICON: Record<StandingLevel, typeof Award> = {
  newcomer: Sprout,
  neighbor: Heart,
  pillar: Shield,
  guardian: Award,
};

export function StandingBadge({ points, className }: { points: number; className?: string }) {
  const { t } = useTranslation();
  const meta = standingOf(points);
  const Icon = LEVEL_ICON[meta.level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white",
        meta.gradient,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(`community.standing.levels.${meta.level}`)}
    </span>
  );
}
