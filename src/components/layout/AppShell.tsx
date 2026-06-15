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
  { to: "/discover", icon: Compass, labelKey: "nav.discover" },
  { to: "/community", icon: Users2, labelKey: "nav.community" },
  { to: "/activities", icon: CalendarDays, labelKey: "nav.activities" },
  { to: "/games", icon: Gamepad2, labelKey: "nav.games" },
  { to: "/events", icon: CalendarHeart, labelKey: "nav.events" },
  // Members only — hidden for guests until they create a profile.
  { to: "/matches", icon: Heart, labelKey: "nav.matches", memberOnly: true },
  { to: "/chat", icon: MessageCircle, labelKey: "nav.chat", memberOnly: true },
  { to: "/notifications", icon: Bell, labelKey: "nav.notifications", memberOnly: true },
  { to: "/profile", icon: User, labelKey: "nav.profile", memberOnly: true },
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
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to="/events">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
                {item.to === "/notifications" && unreadNotifications > 0 && (
                  <Badge variant="gold" className="absolute -end-1 -top-1 h-5 min-w-5 justify-center px-1">
                    {unreadNotifications}
                  </Badge>
                )}
                {item.to === "/chat" && unreadMessages > 0 && (
                  <Badge variant="gold" className="absolute -end-1 -top-1 h-5 min-w-5 justify-center px-1">
                    {unreadMessages}
                  </Badge>
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
      <main className="container py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="scrollbar-hide fixed bottom-0 start-0 end-0 z-40 flex items-center gap-0.5 overflow-x-auto border-t border-border bg-background/95 px-1 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex min-w-[4.25rem] flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.labelKey)}
            {item.to === "/notifications" && unreadNotifications > 0 && (
              <span className="absolute end-4 top-0 h-2 w-2 rounded-full bg-gold" />
            )}
            {item.to === "/chat" && unreadMessages > 0 && (
              <span className="absolute end-4 top-0 h-2 w-2 rounded-full bg-gold" />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
