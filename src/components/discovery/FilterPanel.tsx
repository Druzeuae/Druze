import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INTERESTS, INTEREST_CATEGORIES } from "@/data/interests";
import { cn } from "@/lib/utils";
import type { DiscoveryFilters } from "@/types/app";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DiscoveryFilters;
  onChange: (filters: DiscoveryFilters) => void;
  isPremium: boolean;
}

export function FilterPanel({ open, onOpenChange, filters, onChange, isPremium }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const set = <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleInterest = (id: string) =>
    set("interestIds", filters.interestIds.includes(id) ? filters.interestIds.filter((i) => i !== id) : [...filters.interestIds, id]);

  const reset = () =>
    onChange({
      city: "all",
      intent: "all",
      interestIds: [],
      verifiedOnly: false,
      gender: "all",
      ageRange: [18, 60],
      nationality: "all",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("discovery.filters")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("discovery.filterLocation")}</Label>
              <Select value={filters.city} onValueChange={(v) => set("city", v as DiscoveryFilters["city"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="dubai">{t("profile.dubai")}</SelectItem>
                  <SelectItem value="abu_dhabi">{t("profile.abuDhabi")}</SelectItem>
                  <SelectItem value="sharjah">{t("profile.sharjah")}</SelectItem>
                  <SelectItem value="other">{t("profile.otherCity")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("discovery.filterIntent")}</Label>
              <Select value={filters.intent} onValueChange={(v) => set("intent", v as DiscoveryFilters["intent"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="marriage">💍 {t("badges.openToMarriage")}</SelectItem>
                  <SelectItem value="friendship">🤝 {t("badges.lookingForFriendship")}</SelectItem>
                  <SelectItem value="professional">💼 {t("badges.professionalNetworking")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("discovery.filterNationality")}</Label>
              <Select value={filters.nationality} onValueChange={(v) => set("nationality", v as DiscoveryFilters["nationality"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="druze">{t("profile.druze")}</SelectItem>
                  <SelectItem value="friend_ally">{t("profile.friendAlly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={cn("space-y-1.5", !isPremium && "opacity-60")}>
              <Label className="flex items-center gap-1.5">
                {t("discovery.filterGender")}
                {!isPremium && <Lock className="h-3 w-3" />}
              </Label>
              <Select
                value={filters.gender}
                onValueChange={(v) => set("gender", v as DiscoveryFilters["gender"])}
                disabled={!isPremium}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="male">{t("profile.male")}</SelectItem>
                  <SelectItem value="female">{t("profile.female")}</SelectItem>
                  <SelectItem value="other">{t("profile.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={cn("space-y-2", !isPremium && "opacity-60")}>
            <Label className="flex items-center gap-1.5">
              {t("discovery.filterAge")}: {filters.ageRange[0]} - {filters.ageRange[1]}
              {!isPremium && <Lock className="h-3 w-3" />}
            </Label>
            <Slider
              min={18}
              max={70}
              step={1}
              value={filters.ageRange}
              onValueChange={(v) => isPremium && set("ageRange", v as [number, number])}
              disabled={!isPremium}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
            <Label htmlFor="verified-only">{t("discovery.filterVerified")}</Label>
            <Switch id="verified-only" checked={filters.verifiedOnly} onCheckedChange={(v) => set("verifiedOnly", v)} />
          </div>

          <div className={cn("space-y-2", !isPremium && "opacity-60")}>
            <Label className="flex items-center gap-1.5">
              {t("discovery.filterInterests")}
              {!isPremium && <Lock className="h-3 w-3" />}
            </Label>
            <div className="max-h-40 space-y-3 overflow-y-auto pe-1">
              {INTEREST_CATEGORIES.map((category) => (
                <div key={category}>
                  <p className="mb-1 text-xs font-bold text-muted-foreground">{t(`interestCategories.${category}`)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {INTERESTS.filter((i) => i.category === category).map((interest) => {
                      const isSelected = filters.interestIds.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          type="button"
                          disabled={!isPremium}
                          onClick={() => toggleInterest(interest.id)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
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
          </div>

          {!isPremium && <p className="text-xs text-muted-foreground">{t("discovery.premiumFiltersLocked")}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={reset}>
            {t("common.reset")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{t("common.apply")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
