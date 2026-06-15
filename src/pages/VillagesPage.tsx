import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { initials } from "@/lib/utils";

export default function VillagesPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { currentUser, profiles, villages, joinVillage, leaveVillage } = useApp();

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/community" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("community.backToHub")}
      </Link>

      <div className="mb-5">
        <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("community.sections.villages.name")}</h1>
        <p className="text-muted-foreground">{t("community.sections.villages.long")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {villages.map((v) => {
          const joined = v.memberIds.includes(currentUser.id);
          const members = v.memberIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
          return (
            <Card key={v.id} className="overflow-hidden">
              <div className="gradient-teal flex items-center gap-2 px-4 py-3 text-white">
                <MapPin className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-bold leading-tight">{isAr ? v.nameAr : v.name}</h3>
                  <p className="text-xs opacity-90">
                    {isAr ? v.regionAr : v.region} · {isAr ? v.countryAr : v.country}
                  </p>
                </div>
              </div>
              <CardContent className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">{isAr ? v.blurbAr : v.blurb}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {members.slice(0, 4).map((p) => (
                        <Avatar key={p!.id} className="h-7 w-7 ring-2 ring-background">
                          <AvatarImage src={p!.photos[0]} />
                          <AvatarFallback className="text-[10px]">{initials(p!.displayName)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {t("villages.members", { count: v.memberIds.length })}
                    </span>
                  </div>
                  {joined ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="teal">{t("villages.yourRoots")}</Badge>
                      <Button size="sm" variant="outline" onClick={() => leaveVillage(v.id)}>
                        {t("villages.leave")}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => joinVillage(v.id)}>
                      {t("villages.claimRoots")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
