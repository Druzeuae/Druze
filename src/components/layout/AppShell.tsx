import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, Heart, MessageCircle, Bell, User, Shield, Moon, Sun } from "lucide-react";
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
  { to: "/matches", icon: Heart, labelKey: "nav.matches" },
  { to: "/chat", icon: MessageCircle, labelKey: "nav.chat" },
  { to: "/notifications", icon: Bell, labelKey: "nav.notifications" },
  { to: "/profile", icon: User, labelKey: "nav.profile" },
];

export function AppShell() {
  const { t } = useTranslation();
  const { currentUser, notifications, conversations } = useApp();
  const { isDark, toggle } = useDarkMode();

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = conversations.filter(
    (c) => c.status === "matched" && c.lastMessagePreview && c.userBId !== currentUser.id
  ).length;

  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to="/discover">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
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
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="container py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 start-0 end-0 z-40 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors",
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
