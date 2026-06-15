import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, CalendarDays, CalendarHeart, Gamepad2, Users2, Heart, MessageCircle, Bell, User, Shield, Moon, Sun, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { cn, initials } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/discover", icon: Compass, labelKey: "nav.discover", gradient: "gradient-social" },
  { to: "/community", icon: Users2, labelKey: "nav.community", gradient: "gradient-brand" },
  { to: "/activities", icon: CalendarDays, labelKey: "nav.activities", gradient: "gradient-teal" },
  { to: "/games", icon: Gamepad2, labelKey: "nav.games", gradient: "gradient-coral" },
  { to: "/events", icon: CalendarHeart, labelKey: "nav.events", gradient: "gradient-gold" },
  // Members only — hidden for guests until they create a profile.
  { to: "/matches", icon: Heart, labelKey: "nav.matches", gradient: "gradient-coral", memberOnly: true },
  { to: "/chat", icon: MessageCircle, labelKey: "nav.chat", gradient: "gradient-teal", memberOnly: true },
  { to: "/notifications", icon: Bell, labelKey: "nav.notifications", gradient: "gradient-brand", memberOnly: true },
  { to: "/profile", icon: User, labelKey: "nav.profile", gradient: "gradient-social", memberOnly: true },
];

export function AppShell() {
  const { t } = useTranslation();
  const { currentUser, notifications, conversations, isGuest } = useApp();
  const { isDark, toggle } = useDarkMode();

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = conversations.filter(
    (c) => c.status === "matched" && c.lastMessagePreview && c.userBId !== currentUser.id
  ).length;

  // Guests only see the explore tabs; member-only tabs appear after they register.
  const navItems = NAV_ITEMS.filter((item) => !item.memberOnly || !isGuest);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-20 items-center justify-between gap-4">
          <NavLink to="/events">
            <Logo size="md" />
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-all",
                    isActive ? "bg-secondary" : "hover:bg-secondary/60"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 group-hover:-translate-y-0.5",
                        item.gradient,
                        isActive
                          ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-[0_8px_20px_-6px_rgba(139,92,246,0.6)]"
                          : "opacity-90 group-hover:opacity-100"
                      )}
                    >
                      <item.icon className="h-6 w-6" strokeWidth={2.25} />
                      {item.to === "/notifications" && unreadNotifications > 0 && (
                        <Badge variant="gold" className="absolute -end-1.5 -top-1.5 h-5 min-w-5 justify-center px-1">
                          {unreadNotifications}
                        </Badge>
                      )}
                      {item.to === "/chat" && unreadMessages > 0 && (
                        <Badge variant="gold" className="absolute -end-1.5 -top-1.5 h-5 min-w-5 justify-center px-1">
                          {unreadMessages}
                        </Badge>
                      )}
                    </span>
                    <span className={cn("text-xs font-bold", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {t(item.labelKey)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher className="hidden sm:flex" />
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isGuest ? (
              <NavLink to="/auth">
                <Button size="sm" className="gradient-gold text-gold-foreground">
                  {t("guest.signUp")}
                </Button>
              </NavLink>
            ) : (
              <>
                {currentUser.isAdmin && (
                  <NavLink to="/admin">
                    <Button variant="ghost" size="icon" aria-label="Admin panel">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </NavLink>
                )}
                <NavLink to="/profile">
                  <Avatar className="h-9 w-9 ring-2 ring-primary-100">
                    <AvatarImage src={currentUser.photos[0]} alt={currentUser.displayName} />
                    <AvatarFallback>{initials(currentUser.displayName)}</AvatarFallback>
                  </Avatar>
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Guest banner */}
        {isGuest && (
          <NavLink to="/auth" className="block gradient-brand">
            <div className="container flex items-center justify-center gap-2 py-1.5 text-center text-xs font-semibold text-white sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t("guest.banner")}</span>
              <span className="hidden rounded-full bg-white/20 px-2 py-0.5 sm:inline">{t("guest.bannerCta")}</span>
            </div>
          </NavLink>
        )}
      </header>

      {/* Page content */}
      <main className="container py-6 pb-28 lg:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav — big iconic tiles */}
      <nav className="scrollbar-hide fixed bottom-0 start-0 end-0 z-40 flex items-center gap-1 overflow-x-auto border-t border-border bg-background/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group relative flex min-w-[4.75rem] flex-1 flex-col items-center gap-1 rounded-xl py-1"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300",
                    item.gradient,
                    isActive
                      ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-[0_8px_20px_-6px_rgba(139,92,246,0.6)] -translate-y-0.5"
                      : "opacity-90"
                  )}
                >
                  <item.icon className="h-6 w-6" strokeWidth={2.25} />
                  {item.to === "/notifications" && unreadNotifications > 0 && (
                    <span className="absolute -end-1 -top-1 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
                  )}
                  {item.to === "/chat" && unreadMessages > 0 && (
                    <span className="absolute -end-1 -top-1 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
                  )}
                </span>
                <span className={cn("text-[11px] font-bold", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {t(item.labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
