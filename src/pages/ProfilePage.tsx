import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/profile/ProfileView";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t("nav.profile")}</h1>
        <div className="flex gap-2">
          {!currentUser.isPremium && (
            <Button variant="gold" size="sm" onClick={() => navigate("/premium")}>
              <Sparkles className="h-4 w-4" /> {t("common.premium")}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4" /> {t("nav.settings")}
          </Button>
          <Button size="sm" onClick={() => navigate("/profile/edit")}>
            <Pencil className="h-4 w-4" /> {t("profile.editProfile")}
          </Button>
        </div>
      </div>

      <ProfileView profile={currentUser} />
    </div>
  );
}
