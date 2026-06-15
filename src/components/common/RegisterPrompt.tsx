import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";

/** Global modal shown when a guest tries a members-only action. */
export function RegisterWall() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerPromptOpen, closeRegisterPrompt } = useApp();

  const go = () => {
    closeRegisterPrompt();
    navigate("/auth");
  };

  return (
    <Dialog open={registerPromptOpen} onOpenChange={(o) => !o && closeRegisterPrompt()}>
      <DialogContent className="max-w-sm overflow-hidden p-0">
        <div className="gradient-brand flex flex-col items-center gap-2 p-6 text-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold">{t("guest.wallTitle")}</h2>
          <p className="text-sm text-white/85">{t("guest.wallBody")}</p>
        </div>
        <div className="space-y-2 p-5">
          <Button className="w-full" size="lg" onClick={go}>
            {t("guest.createProfile")}
          </Button>
          <Button variant="ghost" className="w-full" onClick={closeRegisterPrompt}>
            {t("guest.keepBrowsing")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Inline gate that replaces a members-only page for guests (keeps the nav). */
export function RegisterGate({ titleKey, bodyKey }: { titleKey?: string; bodyKey?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-white">
        <Lock className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-extrabold">{t(titleKey ?? "guest.gateTitle")}</h1>
      <p className="text-muted-foreground">{t(bodyKey ?? "guest.gateBody")}</p>
      <Button size="lg" onClick={() => navigate("/auth")}>
        {t("guest.createProfile")}
      </Button>
      <p className="text-sm text-muted-foreground">{t("guest.freeNoEmail")}</p>
    </div>
  );
}
