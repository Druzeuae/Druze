import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeartHandshake, Lock, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "@/components/discovery/ProfileCard";
import { FilterPanel } from "@/components/discovery/FilterPanel";
import { useApp, sharedInterestCount } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { calculateAge, cn } from "@/lib/utils";
import { computeCompatibility, hasCompletedQuiz } from "@/lib/compatibility";
import type { DiscoveryFilters } from "@/types/app";

const DEFAULT_FILTERS: DiscoveryFilters = {
  city: "all",
  intent: "all",
  interestIds: [],
  verifiedOnly: false,
  gender: "all",
  ageRange: [18, 60],
  nationality: "all",
};

const DAILY_FREE_LIMIT = 10;

export default function DiscoverPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentUser,
    profiles,
    appreciations,
    savedUserIds,
    blocks,
    appreciateUser,
    saveUser,
    unsaveUser,
    appreciationsSentToday,
    isGuest,
    promptRegister,
  } = useApp();

  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const blockedIds = new Set(blocks.map((b) => b.blockedId));
  const quizDone = hasCompletedQuiz(currentUser);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (p.id === currentUser.id) return false;
      if (p.accountStatus !== "active") return false;
      if (p.visibility === "hidden") return false;
      if (blockedIds.has(p.id)) return false;

      if (filters.city !== "all" && p.city !== filters.city) return false;
      if (filters.intent !== "all" && !p.intents.includes(filters.intent)) return false;
      if (filters.nationality !== "all" && p.nationality !== filters.nationality) return false;
      if (filters.gender !== "all" && p.gender !== filters.gender) return false;
      if (filters.verifiedOnly && !(p.phoneVerified && p.photoVerified)) return false;
      if (filters.interestIds.length > 0 && !filters.interestIds.some((id) => p.interestIds.includes(id))) return false;

      const age = calculateAge(p.dateOfBirth);
      if (age < filters.ageRange[0] || age > filters.ageRange[1]) return false;

      return true;
    });
  }, [profiles, filters, currentUser.id, blockedIds]);

  const activeFilterCount =
    (filters.city !== "all" ? 1 : 0) +
    (filters.intent !== "all" ? 1 : 0) +
    (filters.nationality !== "all" ? 1 : 0) +
    (filters.gender !== "all" ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    filters.interestIds.length +
    (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60 ? 1 : 0);

  const handleAppreciate = (userId: string) => {
    const alreadyAppreciated = appreciations.some((a) => a.fromUserId === currentUser.id && a.toUserId === userId);
    if (alreadyAppreciated) return;

    if (!currentUser.isPremium && appreciationsSentToday >= DAILY_FREE_LIMIT) {
      toast({ description: t("discovery.dailyLimitReached"), variant: "destructive" });
      return;
    }

    const profile = profiles.find((p) => p.id === userId);
    const { matched } = appreciateUser(userId);
    if (matched && profile) {
      toast({
        variant: "brand",
        title: t("matches.newMatch"),
        description: t("matches.newMatchSubtitle", { name: profile.displayName }),
      });
    } else {
      toast({ description: t("discovery.appreciated") });
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t("discovery.title")}</h1>
          <p className="text-muted-foreground">{t("discovery.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={() => setFilterOpen(true)} className="relative">
          <SlidersHorizontal className="h-4 w-4" /> {t("discovery.filters")}
          {activeFilterCount > 0 && (
            <Badge variant="gold" className="absolute -end-2 -top-2 h-5 min-w-5 justify-center px-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Compatibility quiz CTA */}
      {!quizDone && (
        <button
          onClick={() => navigate("/quiz")}
          className="mb-5 flex w-full items-center gap-4 overflow-hidden rounded-2xl gradient-brand p-4 text-start text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold">{t("compatibility.ctaTitle")}</p>
            <p className="text-sm text-white/85">{t("compatibility.ctaBody")}</p>
          </div>
          <Sparkles className="h-5 w-5 shrink-0" />
        </button>
      )}

      {filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
          <p className="text-lg font-semibold">{t("discovery.noResults")}</p>
        </div>
      ) : (
        <div className="relative">
          <div
            className={cn(
              "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
              isGuest && "pointer-events-none select-none blur-[7px]"
            )}
            aria-hidden={isGuest}
          >
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                sharedInterests={sharedInterestCount(currentUser, profile)}
                compatibility={quizDone ? computeCompatibility(currentUser, profile) : null}
                isSaved={savedUserIds.includes(profile.id)}
                isAppreciated={appreciations.some((a) => a.fromUserId === currentUser.id && a.toUserId === profile.id)}
                onAppreciate={() => handleAppreciate(profile.id)}
                onSave={() => (savedUserIds.includes(profile.id) ? unsaveUser(profile.id) : saveUser(profile.id))}
              />
            ))}
          </div>

          {isGuest && (
            <div className="absolute inset-0 flex items-start justify-center pt-10 sm:pt-16">
              <div className="mx-4 max-w-sm rounded-2xl border border-border bg-background/95 p-6 text-center shadow-xl backdrop-blur">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-extrabold">{t("guest.discoverLockTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("guest.discoverLockBody")}</p>
                <Button className="mt-4 w-full" size="lg" onClick={promptRegister}>
                  <Sparkles className="h-4 w-4" /> {t("guest.createProfile")}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">{t("guest.freeNoEmail")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <FilterPanel
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onChange={setFilters}
        isPremium={currentUser.isPremium}
      />
    </div>
  );
}
