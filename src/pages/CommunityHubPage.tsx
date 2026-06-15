import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Crown,
  HandHeart,
  Heart,
  MapPin,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { cn, initials } from "@/lib/utils";
import { CONTRIBUTION_ACTIONS, contributionOf, progressToNext, standingOf } from "@/lib/reputation";
import { StandingBadge } from "@/components/community/StandingBadge";

const SECTIONS = [
  { to: "/community/majlis", icon: MessagesSquare, key: "majlis", gradient: "gradient-brand" },
  { to: "/community/moments", icon: Heart, key: "moments", gradient: "gradient-coral" },
  { to: "/community/villages", icon: MapPin, key: "villages", gradient: "gradient-teal" },
  { to: "/community/matte", icon: Sparkles, key: "matte", gradient: "gradient-gold" },
];

export default function CommunityHubPage() {
  const { t } = useTranslation();
  const { currentUser, profiles } = useApp();

  const myPoints = contributionOf(currentUser);
  const meta = standingOf(myPoints);
  const progress = progressToNext(myPoints);

  const topContributors = useMemo(
    () =>
      [...profiles]
        .map((p) => ({ p, pts: contributionOf(p) }))
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 5),
    [profiles]
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("community.title")}</h1>
        <p className="text-muted-foreground">{t("community.subtitle")}</p>
      </div>

      {/* Standing card — Saf Al-Ikhwan */}
      <Card className="mb-6 overflow-hidden">
        <div className={cn("p-5 text-white", meta.gradient)}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                {t("community.standing.title")}
              </p>
              <p className="mt-1 text-3xl font-extrabold">{t(`community.standing.levels.${meta.level}`)}</p>
            </div>
            <div className="text-end">
              <p className="text-4xl font-extrabold leading-none">{myPoints}</p>
              <p className="text-sm opacity-90">{t("community.standing.points")}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs opacity-90">
              {meta.next === null
                ? t("community.standing.maxLevel")
                : t("community.standing.toNext", { points: meta.next - myPoints })}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          <p className="mb-2 text-sm font-bold text-muted-foreground">{t("community.standing.earnTitle")}</p>
          <div className="flex flex-wrap gap-2">
            {CONTRIBUTION_ACTIONS.map((a) => (
              <span
                key={a.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-semibold"
              >
                <HandHeart className="h-3.5 w-3.5 text-primary" />
                {t(`community.standing.actions.${a.key}`)}
                <span className="text-emerald-600">+{a.points}</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.to} to={s.to}>
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white", s.gradient)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{t(`community.sections.${s.key}.name`)}</h3>
                    <p className="truncate text-sm text-muted-foreground">{t(`community.sections.${s.key}.desc`)}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Saf Al-Ikhwan leaderboard */}
      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
        <Crown className="h-4 w-4 text-gold-500" /> {t("community.topContributors")}
      </p>
      <Card>
        <CardContent className="space-y-1 p-3">
          {topContributors.map(({ p, pts }, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span className="w-5 text-center font-bold text-muted-foreground">{i + 1}</span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={p.photos[0]} />
                <AvatarFallback>{initials(p.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {p.displayName}
                  {p.id === currentUser.id && (
                    <span className="ms-1 text-xs text-muted-foreground">({t("community.you")})</span>
                  )}
                </p>
                <StandingBadge points={pts} />
              </div>
              <span className="font-extrabold text-primary">{pts}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
