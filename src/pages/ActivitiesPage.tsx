import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { cn, initials } from "@/lib/utils";
import { cityLabel } from "@/lib/profileLabels";
import { ACTIVITY_CATEGORIES } from "@/data/activityCategories";
import type { ActivityCategory, AppActivity } from "@/types/app";
import type { City } from "@/types/database";

export default function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { toast } = useToast();
  const { currentUser, profiles, activities, joinActivity, leaveActivity, createActivity } = useApp();

  const [activeCategory, setActiveCategory] = useState<ActivityCategory | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...activities]
        .filter((a) => activeCategory === "all" || a.category === activeCategory)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [activities, activeCategory]
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(isAr ? "ar-AE" : "en-AE", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleCreate = (activity: Omit<AppActivity, "id" | "createdBy" | "createdAt" | "participantIds">) => {
    createActivity(activity);
    setCreateOpen(false);
    toast({ variant: "brand", title: t("activities.form.success") });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("activities.title")}</h1>
          <p className="text-muted-foreground">{t("activities.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-social text-white shrink-0">
          <Plus className="h-4 w-4" /> {t("activities.createActivity")}
        </Button>
      </div>

      {/* Category filter chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
            activeCategory === "all"
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-secondary"
          )}
        >
          {t("activities.allCategories")}
        </button>
        {ACTIVITY_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                activeCategory === cat.id
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(`activities.categories.${cat.id}`)}
            </button>
          );
        })}
      </div>

      {/* Activity cards */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
          <CalendarDays className="mb-2 h-10 w-10 text-primary-200" />
          <p className="text-lg font-semibold">{t("activities.noActivities")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((activity) => {
            const meta = ACTIVITY_CATEGORIES.find((c) => c.id === activity.category) ?? ACTIVITY_CATEGORIES[8];
            const Icon = meta.icon;
            const host = profiles.find((p) => p.id === activity.createdBy);
            const isJoined = activity.participantIds.includes(currentUser.id);
            const spotsLeft = activity.capacity ? activity.capacity - activity.participantIds.length : null;
            const isFull = spotsLeft !== null && spotsLeft <= 0;

            return (
              <Card key={activity.id} className="overflow-hidden">
                <div className="gradient-social h-2 w-full" />
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant={meta.badgeVariant} className="mb-1.5">
                        <Icon className="h-3 w-3" /> {t(`activities.categories.${activity.category}`)}
                      </Badge>
                      <h3 className="text-lg font-bold leading-tight">
                        {isAr && activity.titleAr ? activity.titleAr : activity.title}
                      </h3>
                    </div>
                  </div>

                  {(activity.description || activity.descriptionAr) && (
                    <p className="text-sm text-muted-foreground">
                      {isAr && activity.descriptionAr ? activity.descriptionAr : activity.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary-400" />
                      {formatDate(activity.startsAt)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary-400" />
                      {activity.location} · {cityLabel(t, activity.city)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {activity.participantIds.slice(0, 4).map((id) => {
                          const p = profiles.find((pr) => pr.id === id);
                          if (!p) return null;
                          return (
                            <Avatar key={id} className="h-7 w-7 ring-2 ring-background">
                              <AvatarImage src={p.photos[0]} />
                              <AvatarFallback className="text-[10px]">{initials(p.displayName)}</AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {spotsLeft !== null
                          ? isFull
                            ? t("activities.full")
                            : t("activities.spotsLeft", { count: spotsLeft })
                          : t("activities.going", { count: activity.participantIds.length })}
                      </span>
                    </div>

                    {isJoined ? (
                      <Button size="sm" variant="outline" onClick={() => leaveActivity(activity.id)}>
                        {t("activities.leave")}
                      </Button>
                    ) : (
                      <Button size="sm" disabled={isFull} onClick={() => joinActivity(activity.id)}>
                        {t("activities.join")}
                      </Button>
                    )}
                  </div>

                  {host && (
                    <p className="text-xs text-muted-foreground">
                      {t("activities.createdBy", { name: host.displayName })}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateActivityDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
    </div>
  );
}

function CreateActivityDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (activity: Omit<AppActivity, "id" | "createdBy" | "createdAt" | "participantIds">) => void;
}) {
  const { t } = useTranslation();
  const { currentUser } = useApp();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("hangout");
  const [city, setCity] = useState<City>(currentUser.city);
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");

  const reset = () => {
    setTitle("");
    setCategory("hangout");
    setCity(currentUser.city);
    setLocation("");
    setStartsAt("");
    setDescription("");
    setCapacity("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !location.trim() || !startsAt) return;
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      city,
      location: location.trim(),
      startsAt: new Date(startsAt).toISOString(),
      capacity: capacity ? Number(capacity) : undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("activities.createActivity")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("activities.form.title")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("activities.form.titlePlaceholder")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("activities.category")}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ActivityCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {t(`activities.categories.${cat.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("profile.city")}</Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dubai">{t("profile.dubai")}</SelectItem>
                  <SelectItem value="abu_dhabi">{t("profile.abuDhabi")}</SelectItem>
                  <SelectItem value="sharjah">{t("profile.sharjah")}</SelectItem>
                  <SelectItem value="other">{t("profile.otherCity")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("activities.location")}</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("activities.form.locationPlaceholder")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("activities.date")}</Label>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("activities.capacity")}</Label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("activities.description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("activities.form.descriptionPlaceholder")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !location.trim() || !startsAt}>
            {t("activities.form.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
