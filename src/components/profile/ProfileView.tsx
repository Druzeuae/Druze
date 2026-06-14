import { useTranslation } from "react-i18next";
import { Briefcase, Globe2, MapPin, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntentBadges, VerificationBadges } from "@/components/common/IntentBadges";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { INTERESTS } from "@/data/interests";
import { calculateAge } from "@/lib/utils";
import { cityLabel, lifestyleLabel, nationalityLabel, observanceLabel } from "@/lib/profileLabels";
import type { AppProfile } from "@/types/app";

export function ProfileView({ profile, children }: { profile: AppProfile; children?: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const age = calculateAge(profile.dateOfBirth);

  return (
    <div className="space-y-5">
      {/* Photos */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {profile.photos.map((photo, idx) => (
          <div key={idx} className={`overflow-hidden rounded-2xl ${idx === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : ""}`}>
            <img src={photo} alt={`${profile.displayName} ${idx + 1}`} className="aspect-square h-full w-full object-cover" />
          </div>
        ))}
        {profile.introVideoUrl && (
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-primary-900 text-white">
            <PlayCircle className="h-10 w-10" />
            <span className="absolute bottom-2 text-xs font-semibold">{t("profile.introVideo")}</span>
          </div>
        )}
      </div>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold">
                {profile.displayName}, {age}
              </h1>
              <TrustScoreBadge score={profile.trustScore} size="sm" />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {cityLabel(t, profile.city)}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> {profile.occupation}
              </span>
              <span className="flex items-center gap-1">
                <Globe2 className="h-4 w-4" /> {profile.languages.join(", ")}
              </span>
            </div>
            <Badge variant="outline" className="mt-2">
              {nationalityLabel(t, profile.nationality)}
            </Badge>
          </div>
          {children}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase text-muted-foreground">{t("profile.connectionIntent")}</p>
            <IntentBadges intents={profile.intents} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase text-muted-foreground">{t("profile.verificationBadges")}</p>
            <VerificationBadges
              phoneVerified={profile.phoneVerified}
              photoVerified={profile.photoVerified}
              premiumVerified={profile.premiumVerified}
            />
            {!profile.phoneVerified && !profile.photoVerified && !profile.premiumVerified && (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.aboutMe")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm leading-relaxed">{profile.aboutMe}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">{t("profile.personalValues")}</p>
              <p className="text-sm">{profile.personalValues}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">{t("profile.lifestyleSection")}</p>
              <p className="text-sm">{profile.lifestyleText}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">{t("profile.hobbies")}</p>
              <p className="text-sm">{profile.hobbiesText}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alignment */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.alignment")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">{t("profile.religiousObservance")}</p>
            <Badge variant="secondary">{observanceLabel(t, profile.religiousObservance)}</Badge>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">{t("profile.lifestyleType")}</p>
            <Badge variant="secondary">{lifestyleLabel(t, profile.lifestyle)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.interests")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {profile.interestIds.map((id) => {
            const interest = INTERESTS.find((i) => i.id === id);
            if (!interest) return null;
            return (
              <Badge key={id} variant="outline">
                {isAr ? interest.nameAr : interest.name}
              </Badge>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
