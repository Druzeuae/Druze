import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Star, Eye, UserPlus, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { cn, initials, timeAgo } from "@/lib/utils";
import type { AppNotification } from "@/types/app";

const ICONS: Record<AppNotification["type"], typeof Heart> = {
  new_match: Heart,
  new_message: MessageCircle,
  appreciation: Star,
  profile_view: Eye,
  connection_request: UserPlus,
  system: Info,
  event_reminder: Calendar,
};

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const { notifications, profiles, markNotificationRead, markAllNotificationsRead } = useApp();

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleClick = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.type === "new_match" || n.type === "appreciation" || n.type === "connection_request" || n.type === "profile_view") {
      navigate("/matches");
    } else if (n.type === "new_message") {
      navigate("/chat");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t("notifications.title")}</h1>
        {hasUnread && (
          <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
          <Bell className="mb-2 h-10 w-10 text-primary-200" />
          <p className="text-lg font-semibold">{t("notifications.noNotifications")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => {
            const Icon = ICONS[n.type];
            const relatedProfile = n.relatedUserId ? profiles.find((p) => p.id === n.relatedUserId) : undefined;
            const title = lang === "ar" ? n.titleAr : n.title;
            const body = lang === "ar" ? n.bodyAr : n.body;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-start transition-colors hover:bg-secondary",
                  !n.isRead && "bg-primary-50/60 dark:bg-primary-900/10"
                )}
              >
                {relatedProfile ? (
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={relatedProfile.photos[0]} />
                    <AvatarFallback>{initials(relatedProfile.displayName)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold">{title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.createdAt, lang)}</span>
                  </div>
                  {body && <p className="truncate text-sm text-muted-foreground">{body}</p>}
                </div>
                {!n.isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
