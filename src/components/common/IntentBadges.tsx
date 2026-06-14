import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { ConnectionIntent } from "@/types/database";

const ICONS: Record<ConnectionIntent, string> = {
  marriage: "💍",
  friendship: "🤝",
  professional: "💼",
};

const LABEL_KEYS: Record<ConnectionIntent, string> = {
  marriage: "badges.openToMarriage",
  friendship: "badges.lookingForFriendship",
  professional: "badges.professionalNetworking",
};

export function IntentBadges({ intents, className }: { intents: ConnectionIntent[]; className?: string }) {
  const { t } = useTranslation();
  if (!intents?.length) return null;
  return (
    <div className={className ?? "flex flex-wrap gap-1.5"}>
      {intents.map((intent) => (
        <Badge key={intent} variant="intent">
          <span>{ICONS[intent]}</span>
          {t(LABEL_KEYS[intent])}
        </Badge>
      ))}
    </div>
  );
}

export function VerificationBadges({
  phoneVerified,
  photoVerified,
  premiumVerified,
  className,
}: {
  phoneVerified?: boolean;
  photoVerified?: boolean;
  premiumVerified?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  if (!phoneVerified && !photoVerified && !premiumVerified) return null;
  return (
    <div className={className ?? "flex flex-wrap gap-1.5"}>
      {phoneVerified && (
        <Badge variant="success">
          ✅ {t("badges.phoneVerified")}
        </Badge>
      )}
      {photoVerified && (
        <Badge variant="success">
          🔵 {t("badges.photoVerified")}
        </Badge>
      )}
      {premiumVerified && (
        <Badge variant="gold">
          ⭐ {t("badges.premiumVerified")}
        </Badge>
      )}
    </div>
  );
}
