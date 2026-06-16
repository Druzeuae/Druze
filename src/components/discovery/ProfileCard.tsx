import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Bookmark, CalendarPlus, MapPin, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntentBadges } from "@/components/common/IntentBadges";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { INTERESTS } from "@/data/interests";
import { calculateAge, cn } from "@/lib/utils";
import { cityLabel } from "@/lib/profileLabels";
import type { AppProfile } from "@/types/app";

interface Props {
  profile: AppProfile;
  sharedInterests: number;
  compatibility?: number | null;
  isSaved: boolean;
  isAppreciated: boolean;
  onAppreciate: () => void;
  onSave: () => void;
}

export function ProfileCard({ profile, sharedInterests, compatibility, isSaved, isAppreciated, onAppreciate, onSave }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const age = calculateAge(profile.dateOfBirth);

  const topInterests = profile.interestIds
    .slice(0, 3)
    .map((id) => INTERESTS.find((i) => i.id === id))
    .filter(Boolean);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div
        className="relative aspect-[4/5] cursor-pointer overflow-hidden"
        onClick={() => navigate(`/profile/${profile.id}`)}
      >
        <img
          src={profile.photos[0]}
          alt={profile.displayName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold drop-shadow">
              {profile.displayName}, {age}
            </h3>
            <TrustScoreBadge score={profile.trustScore} size="sm" />
          </div>
          <p className="flex items-center gap-1 text-sm text-white/90">
            <MapPin className="h-3.5 w-3.5" /> {cityLabel(t, profile.city)}
          </p>
        </div>
        {profile.isPremium && (
          <Badge variant="gold" className="absolute start-2 top-2">
            ⭐ {t("common.premium")}
          </Badge>
        )}
        {typeof compatibility === "number" && (
          <div className="absolute end-2 top-2 flex items-center gap-1 rounded-full gradient-brand px-2.5 py-1 text-xs font-extrabold text-white shadow-lg">
            <Heart className="h-3.5 w-3.5 fill-current" />
            {t("compatibility.percent", { percent: compatibility })}
          </div>
        )}
      </div>

      <CardContent className="space-y-2.5 p-3">
        <IntentBadges intents={profile.intents} className="flex flex-wrap gap-1" />

        <div className="flex flex-wrap gap-1">
          {topInterests.map((interest) => (
            <Badge key={interest!.id} variant="outline" className="text-[11px]">
              {isAr ? interest!.nameAr : interest!.name}
            </Badge>
          ))}
        </div>

        {sharedInterests > 0 && (
          <p className="text-xs font-semibold text-primary">
            {t("profile.sharedInterests", { count: sharedInterests })}
          </p>
        )}

        <div className="flex gap-1.5 pt-1">
          <Button
            size="sm"
            variant={isAppreciated ? "secondary" : "default"}
            className="flex-1"
            onClick={onAppreciate}
            disabled={isAppreciated}
          >
            <Star className={cn("h-4 w-4", isAppreciated && "fill-current")} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn("flex-1", isSaved && "border-gold text-gold-600")}
            onClick={onSave}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-gold-500")} />
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/profile/${profile.id}`)}>
            <CalendarPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
