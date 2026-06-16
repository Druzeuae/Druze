import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeartHandshake, Pencil, Settings, Sparkles } from "lucide-react";
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

      <button
        onClick={() => navigate("/quiz")}
        className="mb-4 flex w-full items-center gap-3 rounded-2xl gradient-brand p-4 text-start text-white shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <HeartHandshake className="h-6 w-6 shrink-0" />
        <div className="flex-1">
          <p className="font-bold">{t("compatibility.ctaTitle")}</p>
          <p className="text-sm text-white/85">{t("compatibility.ctaBody")}</p>
        </div>
        <Sparkles className="h-5 w-5 shrink-0" />
      </button>

      <ProfileView profile={currentUser} />
    </div>
  );
}
