import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarClock, MapPin, Users, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { initials } from "@/lib/utils";

export default function MatteCirclesPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { currentUser, profiles, matteCircles, joinMatteCircle, leaveMatteCircle } = useApp();

  const host = (id: string) => profiles.find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/community" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("community.backToHub")}
      </Link>

      <div className="mb-5">
        <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">🧉 {t("community.sections.matte.name")}</h1>
        <p className="text-muted-foreground">{t("community.sections.matte.long")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {matteCircles.map((c) => {
          const joined = c.memberIds.includes(currentUser.id);
          const h = host(c.hostId);
          const members = c.memberIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
          return (
            <Card key={c.id} className="overflow-hidden">
              <div className="gradient-gold h-1.5 w-full" />
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold leading-tight">{isAr && c.nameAr ? c.nameAr : c.name}</h3>
                  <Badge variant={c.mode === "online" ? "teal" : "gold"}>
                    {c.mode === "online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {t(`matte.mode.${c.mode}`)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{isAr && c.blurbAr ? c.blurbAr : c.blurb}</p>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="h-4 w-4 text-gold-500" />
                    {isAr && c.scheduleAr ? c.scheduleAr : c.schedule}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-gold-500" />
                    {isAr && c.locationAr ? c.locationAr : c.location}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
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
                      <Users className="h-3.5 w-3.5" /> {t("matte.members", { count: c.memberIds.length })}
                    </span>
                  </div>
                  {joined ? (
                    <Button size="sm" variant="outline" onClick={() => leaveMatteCircle(c.id)}>
                      {t("matte.leave")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => joinMatteCircle(c.id)}>
                      {t("matte.join")}
                    </Button>
                  )}
                </div>

                {h && <p className="text-xs text-muted-foreground">{t("matte.hostedBy", { name: h.displayName })}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
