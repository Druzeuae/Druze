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
import { Button } from "@/components/ui/button";
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
  const { currentUser, profiles, isGuest, promptRegister } = useApp();

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
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-3xl gradient-brand p-7 text-white sm:p-9">
        <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -start-8 h-44 w-44 rounded-full bg-gold/20 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Crown className="h-3.5 w-3.5 text-gold-300" /> {t("community.heroTag")}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{t("community.title")}</h1>
          <p className="mt-2 max-w-xl text-white/85">{t("community.subtitle")}</p>
        </div>
      </div>

      {/* Standing */}
      {isGuest ? (
        <Card className="mb-6 overflow-hidden border-gold-500/30">
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold text-gold-foreground">
              <HandHeart className="h-7 w-7" />
            </div>
            <p className="text-xl font-extrabold">{t("guest.standingTitle")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("guest.standingBody")}</p>
            <Button className="mt-2 gradient-gold text-gold-foreground" onClick={promptRegister}>
              {t("guest.createProfile")}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mb-6 overflow-hidden">
          <div className={cn("p-5 text-white", meta.gradient)}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{t("community.standing.title")}</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
                  <Crown className="h-6 w-6 text-gold-300" />
                  {t(`community.standing.levels.${meta.level}`)}
                </p>
              </div>
              <div className="text-end">
                <p className="text-4xl font-extrabold leading-none">{myPoints}</p>
                <p className="text-xs opacity-90">{t("community.standing.points")}</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-gold-300 transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs opacity-90">
              {meta.next === null ? t("community.standing.maxLevel") : t("community.standing.toNext", { points: meta.next - myPoints })}
            </p>
          </div>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {CONTRIBUTION_ACTIONS.map((a) => (
              <span key={a.key} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                <HandHeart className="h-3.5 w-3.5 text-primary" />
                {t(`community.standing.actions.${a.key}`)}
                <span className="text-emerald-500">+{a.points}</span>
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section tiles — bold gradient cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.to}
              to={s.to}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl",
                s.gradient
              )}
            >
              <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-125" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-extrabold">{t(`community.sections.${s.key}.name`)}</h3>
                  <p className="mt-0.5 text-sm text-white/85">{t(`community.sections.${s.key}.desc`)}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-gold-500" />
        <h2 className="text-lg font-extrabold">{t("community.topContributors")}</h2>
      </div>
      <Card className="mt-2">
        <CardContent className="space-y-1 p-3">
          {topContributors.map(({ p, pts }, i) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                i === 0 && "bg-gold-500/10"
              )}
            >
              <span className={cn("w-6 text-center text-lg font-extrabold", i === 0 ? "text-gold-500" : "text-muted-foreground")}>
                {i + 1}
              </span>
              <Avatar className="h-10 w-10 ring-2 ring-background">
                <AvatarImage src={p.photos[0]} />
                <AvatarFallback>{initials(p.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {p.displayName}
                  {p.id === currentUser.id && <span className="ms-1 text-xs font-normal text-muted-foreground">({t("community.you")})</span>}
                </p>
                <StandingBadge points={pts} />
              </div>
              <span className="text-lg font-extrabold text-primary">{pts}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
