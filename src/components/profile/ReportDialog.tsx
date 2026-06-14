import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ReportCategory } from "@/types/database";

const CATEGORIES: ReportCategory[] = ["fake_profile", "harassment", "spam", "inappropriate_content", "other"];

export function ReportDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}) {
  const { t } = useTranslation();
  const { reportUser } = useApp();
  const { toast } = useToast();
  const [category, setCategory] = useState<ReportCategory>("fake_profile");
  const [details, setDetails] = useState("");

  const submit = () => {
    reportUser(userId, category, details);
    onOpenChange(false);
    setDetails("");
    toast({ description: t("settings.reportUser") + " ✓" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.reportUser")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-2 block">{t("settings.reportCategory")}</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium",
                    category === c ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {t(`settings.categories.${c}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">{t("settings.reportDetails")}</Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={submit}>
            {t("common.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
