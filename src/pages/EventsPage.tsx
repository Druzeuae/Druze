import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, CheckCircle2, MapPin, Moon, PartyPopper, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CoverImage } from "@/components/common/CoverImage";
import { useApp } from "@/context/AppContext";
import { cn, initials } from "@/lib/utils";
import type { EventCategory } from "@/types/app";

const CATEGORY_META: Record<EventCategory, { icon: typeof Moon; variant: "intent" | "teal" | "coral" | "gold" | "secondary" }> = {
  religious: { icon: Moon, variant: "intent" },
  national: { icon: Sparkles, variant: "teal" },
  social: { icon: Users, variant: "coral" },
  anniversary: { icon: PartyPopper, variant: "gold" },
  cultural: { icon: Sparkles, variant: "secondary" },
};

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { currentUser, profiles, communityEvents, joinEvent, leaveEvent } = useApp();
  const [filter, setFilter] = useState<EventCategory | "all">("all");

  const sorted = useMemo(
    () =>
      [...communityEvents]
        .filter((e) => filter === "all" || e.category === filter)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [communityEvents, filter]
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(isAr ? "ar-AE" : "en-AE", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const categories: (EventCategory | "all")[] = ["all", "religious", "anniversary", "cultural", "social", "national"];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("events.title")}</h1>
        <p className="text-muted-foreground">{t("events.subtitle")}</p>
      </div>

      {/* Category filter */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
              filter === c ? "border-transparent bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-secondary"
            )}
          >
            {c === "all" ? t("events.all") : t(`events.categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((e) => {
          const meta = CATEGORY_META[e.category];
          const Icon = meta.icon;
          const going = e.attendeeIds.includes(currentUser.id);
          const attendees = e.attendeeIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
          return (
            <Card key={e.id} className="overflow-hidden">
              <CoverImage src={e.image} gradient="gradient-brand" className="h-40">
                <div className="absolute start-3 top-3 flex gap-2">
                  <Badge variant={meta.variant}>
                    <Icon className="h-3 w-3" /> {t(`events.categories.${e.category}`)}
                  </Badge>
                  {e.official && (
                    <Badge variant="gold">
                      <CheckCircle2 className="h-3 w-3" /> {t("events.official")}
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-0 start-0 end-0 p-3">
                  <h3 className="text-xl font-extrabold leading-tight text-white drop-shadow">
                    {isAr ? e.titleAr : e.title}
                  </h3>
                </div>
              </CoverImage>

              <CardContent className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">{isAr ? e.descriptionAr : e.description}</p>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {formatDate(e.date)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {isAr ? e.locationAr : e.location}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {attendees.slice(0, 4).map((p) => (
                        <Avatar key={p!.id} className="h-7 w-7 ring-2 ring-background">
                          <AvatarImage src={p!.photos[0]} />
                          <AvatarFallback className="text-[10px]">{initials(p!.displayName)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {t("events.going", { count: e.attendeeIds.length })}
                    </span>
                  </div>
                  {going ? (
                    <Button size="sm" variant="outline" onClick={() => leaveEvent(e.id)}>
                      <CheckCircle2 className="h-4 w-4" /> {t("events.attending")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => joinEvent(e.id)}>
                      {t("events.join")}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t("events.optional")}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
