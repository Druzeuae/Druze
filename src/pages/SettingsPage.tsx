import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Download, LogOut, Moon, Sun, Trash2, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { setLanguage } from "@/i18n";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { cn, initials } from "@/lib/utils";
import type { Visibility } from "@/types/database";

const VISIBILITY_OPTIONS: { value: Visibility; labelKey: string }[] = [
  { value: "public", labelKey: "settings.public" },
  { value: "community_only", labelKey: "settings.communityOnly" },
  { value: "hidden", labelKey: "settings.hiddenVisibility" },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggle } = useDarkMode();
  const { currentUser, profiles, blocks, updateCurrentUser, unblockUser, logout } = useApp();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const blockedProfiles = blocks
    .filter((b) => b.blockerId === currentUser.id)
    .map((b) => profiles.find((p) => p.id === b.blockedId))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const handleExportData = () => {
    const data = JSON.stringify(currentUser, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "druze-uae-data.json";
    link.click();
    URL.revokeObjectURL(url);
    toast({ description: t("settings.exportDataDesc") });
  };

  const handleDeleteAccount = () => {
    setDeleteOpen(false);
    setDeleteConfirm("");
    logout();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t("settings.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={i18n.language === "en" ? "default" : "outline"}
            onClick={() => setLanguage("en")}
          >
            {t("settings.english")}
          </Button>
          <Button
            variant={i18n.language === "ar" ? "default" : "outline"}
            onClick={() => setLanguage("ar")}
          >
            {t("settings.arabic")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="font-medium">{t("settings.darkMode")}</span>
            </div>
            <Switch checked={isDark} onCheckedChange={toggle} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.privacy")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-2 font-medium">{t("settings.profileVisibility")}</p>
            <div className="flex flex-wrap gap-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateCurrentUser({ visibility: opt.value })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    currentUser.visibility === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.blockedUsers")}</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("settings.noBlockedUsers")}</p>
          ) : (
            <div className="space-y-2">
              {blockedProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={p.photos[0]} />
                      <AvatarFallback>{initials(p.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.displayName}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => unblockUser(p.id)}>
                    <UserX className="h-4 w-4" /> {t("settings.unblock")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.account")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{t("settings.exportData")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.exportDataDesc")}</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4" /> {t("settings.exportData")}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{t("nav.logout")}</p>
            </div>
            <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4" /> {t("nav.logout")}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <div>
              <p className="font-medium text-destructive">{t("settings.deleteAccount")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.deleteAccountWarning")}</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> {t("settings.deleteAccount")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{t("settings.deleteAccount")}</DialogTitle>
            <DialogDescription>{t("settings.deleteAccountWarning")}</DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={t("settings.confirmDelete")}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" disabled={deleteConfirm !== "DELETE"} onClick={handleDeleteAccount}>
              {t("settings.deleteAccount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
