import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConnectionIntent } from "@/types/database";

interface Props {
  selected: ConnectionIntent[];
  onToggle: (intent: ConnectionIntent) => void;
}

const OPTIONS: { id: ConnectionIntent; icon: string; titleKey: string; descKey: string }[] = [
  { id: "marriage", icon: "💍", titleKey: "onboarding.step5.marriage", descKey: "onboarding.step5.marriageDesc" },
  { id: "friendship", icon: "🤝", titleKey: "onboarding.step5.friendship", descKey: "onboarding.step5.friendshipDesc" },
  { id: "professional", icon: "💼", titleKey: "onboarding.step5.professional", descKey: "onboarding.step5.professionalDesc" },
];

export function IntentPicker({ selected, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3">
      {OPTIONS.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <Card
            key={opt.id}
            role="button"
            onClick={() => onToggle(opt.id)}
            className={cn(
              "cursor-pointer p-4 transition-all hover:shadow-md",
              isSelected ? "border-2 border-primary bg-primary-50" : "border-border"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-brand text-2xl">
                {opt.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold">{t(opt.titleKey)}</p>
                <p className="text-sm text-muted-foreground">{t(opt.descKey)}</p>
              </div>
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected ? "border-primary bg-primary text-white" : "border-border"
                )}
              >
                {isSelected && "✓"}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
