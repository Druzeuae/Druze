import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLanguage } from "@/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setLanguage(isAr ? "en" : "ar")}
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      {isAr ? "English" : "العربية"}
    </Button>
  );
}
