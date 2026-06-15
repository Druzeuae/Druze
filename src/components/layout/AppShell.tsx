import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, CalendarDays, CalendarHeart, Gamepad2, Users2, Heart, MessageCircle, Bell, User, Shield, Moon, Sun, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/common/CoverImage";
import { useApp } from "@/context/AppContext";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { cn, initials } from "@/lib/utils";

const ux = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=70`;

const NAV_ITEMS = [
  { to: "/discover", icon: Compass, labelKey: "nav.discover", gradient: "gradient-violet", image: ux("1519671482749-fd09be7ccebf") },
  { to: "/community", icon: Users2, labelKey: "nav.community", gradient: "gradient-indigo", image: ux("1414235077428-338989a2e8c0") },
  { to: "/activities", icon: CalendarDays, labelKey: "nav.activities", gradient: "gradient-emerald", image: ux("1506905925346-21bda4d32df4") },
  { to: "/games", icon: Gamepad2, labelKey: "nav.games", gradient: "gradient-rose", image: ux("1611996575749-79a3a250f948") },
  { to: "/events", icon: CalendarHeart, labelKey: "nav.events", gradient: "gradient-amber2", image: ux("1467810563316-b5476525c0f9") },
  // Members only — hidden for guests until they create a profile.
  { to: "/matches", icon: Heart, labelKey: "nav.matches", gradient: "gradient-pink", image: ux("1522098635833-216c03d81fbe"), memberOnly: true },
  { to: "/chat", icon: MessageCircle, labelKey: "nav.chat", gradient: "gradient-sky", image: ux("1611606063065-ee7946f0787a"), memberOnly: true },
  { to: "/notifications", icon: Bell, labelKey: "nav.notifications", gradient: "gradient-orange", memberOnly: true },
  { to: "/profile", icon: User, labelKey: "nav.profile", gradient: "gradient-violet", memberOnly: true },
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

          <nav className="hidden items-end gap-1.5 lg:flex">
            {navItems.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group relative flex flex-col items-center gap-1 rounded-2xl px-2 py-1"
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{ animationDelay: `${i * 0.25}s` }}
                      className={cn(
                        "animate-nav-float relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_14px_30px_-8px_rgba(37,99,235,0.7)]",
                        item.gradient,
                        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                    >
                      <item.icon className="h-7 w-7" strokeWidth={2.25} />
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
                    <span className={cn("text-xs font-bold", isActive ? "text-primary" : "text-muted-foreground")}>
                      {t(item.labelKey)}
                    </span>

                    {/* Hover preview */}
                    <div className="pointer-events-none absolute top-full start-1/2 z-50 mt-2 w-60 -translate-x-1/2 scale-90 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 rtl:translate-x-1/2">
                      <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
                        <CoverImage src={item.image} gradient={item.gradient} className="h-24">
                          <div className="absolute bottom-0 start-0 end-0 flex items-center gap-2 p-2.5 text-white">
                            <item.icon className="h-5 w-5 shrink-0 drop-shadow" />
                            <span className="text-base font-extrabold drop-shadow">{t(item.labelKey)}</span>
                          </div>
                        </CoverImage>
                        <p className="p-3 text-sm text-muted-foreground">{t(`nav.previews.${item.to.slice(1)}`)}</p>
                      </div>
                    </div>
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
        {navItems.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group relative flex min-w-[4.75rem] flex-1 flex-col items-center gap-1 rounded-xl py-1"
          >
            {({ isActive }) => (
              <>
                <span
                  style={{ animationDelay: `${i * 0.25}s` }}
                  className={cn(
                    "animate-nav-float relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 active:scale-110",
                    item.gradient,
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)]"
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
