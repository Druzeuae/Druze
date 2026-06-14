import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  Heart,
  MessageSquare,
  Search,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  BadgeCheck,
  Image as ImageIcon,
  Crown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { calculateAge, initials, timeAgo } from "@/lib/utils";
import type { AccountStatus } from "@/types/database";

const STATUS_VARIANT: Record<AccountStatus, "success" | "secondary" | "destructive" | "outline"> = {
  active: "success",
  suspended: "secondary",
  banned: "destructive",
  deleted: "outline",
};

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const { profiles, matches, messages, reports, adminSetAccountStatus, adminVerify, adminResolveReport } = useApp();

  const [search, setSearch] = useState("");

  const totalUsers = profiles.length;
  const activeUsers = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return profiles.filter((p) => new Date(p.lastActiveAt).getTime() >= cutoff).length;
  }, [profiles]);
  const matchesCreated = matches.length;
  const messagesSent = messages.length;

  const filteredProfiles = profiles.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.displayName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  const openReports = reports.filter((r) => r.status === "open" || r.status === "reviewing");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t("admin.title")}</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard icon={Users} label={t("admin.metrics.totalUsers")} value={totalUsers} />
        <MetricCard icon={Activity} label={t("admin.metrics.activeUsers")} value={activeUsers} />
        <MetricCard icon={Heart} label={t("admin.metrics.matchesCreated")} value={matchesCreated} />
        <MetricCard icon={MessageSquare} label={t("admin.metrics.messagesSent")} value={messagesSent} />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
          <TabsTrigger value="reports">
            {t("admin.reports")}
            {openReports.length > 0 && (
              <Badge variant="gold" className="ms-1">
                {openReports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchUsers")}
              className="ps-9"
            />
          </div>

          <div className="space-y-2">
            {filteredProfiles.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar className="h-11 w-11 cursor-pointer" onClick={() => navigate(`/profile/${p.id}`)}>
                    <AvatarImage src={p.photos[0]} />
                    <AvatarFallback>{initials(p.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">
                        {p.displayName}, {calculateAge(p.dateOfBirth)}
                      </p>
                      <Badge variant={STATUS_VARIANT[p.accountStatus]}>{p.accountStatus}</Badge>
                      {p.isPremium && (
                        <Badge variant="gold">
                          <Crown className="h-3 w-3" /> {t("common.premium")}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{p.email}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(p.lastActiveAt, lang)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={p.phoneVerified ? "secondary" : "outline"}
                      onClick={() => adminVerify(p.id, "phoneVerified")}
                      disabled={p.phoneVerified}
                    >
                      <BadgeCheck className="h-4 w-4" /> {t("admin.verify")}
                    </Button>
                    <Button
                      size="sm"
                      variant={p.photoVerified ? "secondary" : "outline"}
                      onClick={() => adminVerify(p.id, "photoVerified")}
                      disabled={p.photoVerified}
                    >
                      <ImageIcon className="h-4 w-4" /> {t("admin.verifyPhoto")}
                    </Button>
                    <Button
                      size="sm"
                      variant={p.premiumVerified ? "secondary" : "outline"}
                      onClick={() => adminVerify(p.id, "premiumVerified")}
                      disabled={p.premiumVerified}
                    >
                      <Crown className="h-4 w-4" /> {t("admin.verifyPremium")}
                    </Button>

                    {p.accountStatus !== "suspended" && (
                      <Button size="sm" variant="outline" onClick={() => adminSetAccountStatus(p.id, "suspended")}>
                        <ShieldAlert className="h-4 w-4" /> {t("admin.suspend")}
                      </Button>
                    )}
                    {p.accountStatus !== "banned" && (
                      <Button size="sm" variant="destructive" onClick={() => adminSetAccountStatus(p.id, "banned")}>
                        <ShieldOff className="h-4 w-4" /> {t("admin.ban")}
                      </Button>
                    )}
                    {p.accountStatus !== "active" && (
                      <Button size="sm" variant="default" onClick={() => adminSetAccountStatus(p.id, "active")}>
                        <ShieldCheck className="h-4 w-4" /> {t("admin.reactivate")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-2">
          {openReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <ShieldCheck className="mb-2 h-10 w-10 text-primary-200" />
              <p className="text-lg font-semibold">{t("admin.noReports")}</p>
            </div>
          ) : (
            openReports.map((r) => {
              const reported = profiles.find((p) => p.id === r.reportedUserId);
              const reporter = profiles.find((p) => p.id === r.reporterId);
              if (!reported) return null;
              return (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <Avatar className="h-11 w-11 cursor-pointer" onClick={() => navigate(`/profile/${reported.id}`)}>
                      <AvatarImage src={reported.photos[0]} />
                      <AvatarFallback>{initials(reported.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{reported.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`settings.categories.${r.category}`)} · {timeAgo(r.createdAt, lang)}
                      </p>
                      {r.details && <p className="mt-1 text-sm italic">"{r.details}"</p>}
                      {reporter && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("admin.users")}: {reporter.displayName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => adminResolveReport(r.id, "dismissed")}>
                        <XCircle className="h-4 w-4" /> {t("admin.dismiss")}
                      </Button>
                      <Button size="sm" onClick={() => adminResolveReport(r.id, "resolved")}>
                        <CheckCircle2 className="h-4 w-4" /> {t("admin.resolve")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
