import { useTranslation } from "react-i18next";
import { Eye, Heart, SlidersHorizontal, Crown, CheckCheck, Zap, Sparkles, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

const FEATURES = [
  { icon: Eye, key: "profileViews" },
  { icon: Heart, key: "unlimitedAppreciations" },
  { icon: SlidersHorizontal, key: "advancedFilters" },
  { icon: Crown, key: "priorityPlacement" },
  { icon: CheckCheck, key: "readReceipts" },
  { icon: Zap, key: "profileBoost" },
] as const;

export default function PremiumPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentUser, updateCurrentUser } = useApp();

  const handleUpgrade = () => {
    updateCurrentUser({ isPremium: true, premiumVerified: true });
    toast({ variant: "brand", title: t("premium.title"), description: t("common.comingSoon") });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="gradient-gold mb-6 rounded-2xl p-6 text-center text-white shadow-lg sm:p-10">
        <Sparkles className="mx-auto mb-3 h-10 w-10" />
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t("premium.title")}</h1>
        <p className="mt-1 opacity-90">{t("premium.subtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, key }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-medium">{t(`premium.features.${key}`)}</p>
              {currentUser.isPremium && <Check className="ms-auto h-5 w-5 shrink-0 text-emerald-500" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        {currentUser.isPremium ? (
          <Badge variant="gold" className="px-4 py-2 text-base">
            <Crown className="h-4 w-4" /> {t("common.premium")}
          </Badge>
        ) : (
          <Button variant="gold" size="lg" onClick={handleUpgrade}>
            <Sparkles className="h-4 w-4" /> {t("premium.upgrade")}
          </Button>
        )}
        <p className="mt-3 text-sm text-muted-foreground">{t("premium.comingSoonNote")}</p>
      </div>
    </div>
  );
}
