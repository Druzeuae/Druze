import { useTranslation } from "react-i18next";
import { INTERESTS, INTEREST_CATEGORIES } from "@/data/interests";
import { cn } from "@/lib/utils";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export function InterestPicker({ selected, onToggle }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <div className="space-y-5">
      {INTEREST_CATEGORIES.map((category) => (
        <div key={category}>
          <h4 className="mb-2 text-sm font-bold text-muted-foreground">{t(`interestCategories.${category}`)}</h4>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.filter((i) => i.category === category).map((interest) => {
              const isSelected = selected.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => onToggle(interest.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:border-primary-300 hover:bg-primary-50"
                  )}
                >
                  {isAr ? interest.nameAr : interest.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
