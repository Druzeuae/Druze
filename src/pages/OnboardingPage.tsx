import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/common/Logo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { InterestPicker } from "@/components/onboarding/InterestPicker";
import { IntentPicker } from "@/components/onboarding/IntentPicker";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { useApp } from "@/context/AppContext";
import type { ConnectionIntent } from "@/types/database";

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, currentUser, updateCurrentUser, completeOnboarding } = useApp();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [aboutMe, setAboutMe] = useState(currentUser.aboutMe);
  const [photos, setPhotos] = useState<string[]>(currentUser.photos);
  const [interestIds, setInterestIds] = useState<string[]>(currentUser.interestIds);
  const [intents, setIntents] = useState<ConnectionIntent[]>(currentUser.intents);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (onboardingCompleted) return <Navigate to="/discover" replace />;

  const toggleInterest = (id: string) =>
    setInterestIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleIntent = (intent: ConnectionIntent) =>
    setIntents((prev) => (prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent]));

  const next = () => {
    if (step === 3) {
      updateCurrentUser({ fullName, displayName, aboutMe, photos });
    }
    if (step === 4) {
      updateCurrentUser({ interestIds });
    }
    if (step === 5) {
      updateCurrentUser({ intents });
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const back = () => step > 1 && setStep(step - 1);

  const finish = () => {
    completeOnboarding();
    navigate("/discover");
  };

  const canProceed = () => {
    switch (step) {
      case 3:
        return fullName.trim().length > 1 && displayName.trim().length > 0 && photos.length > 0;
      case 4:
        return interestIds.length > 0;
      case 5:
        return intents.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <Logo />
        <LanguageSwitcher />
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            {t("onboarding.step", { current: step, total: TOTAL_STEPS })}
          </p>
          <Progress value={(step / TOTAL_STEPS) * 100} />
        </div>

        <Card className="animate-slide-up">
          <CardContent className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-primary">{t("onboarding.step1.title")}</h2>
                <p className="text-muted-foreground">{t("onboarding.step1.subtitle")}</p>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label>{t("auth.phone")}</Label>
                    <Input placeholder="+971 50 123 4567" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-primary">{t("onboarding.step2.title")}</h2>
                <p className="text-muted-foreground">
                  {t("onboarding.step2.subtitle", { phone: "+971 50 123 4567" })}
                </p>
                <div className="space-y-1.5 pt-2">
                  <Label>{t("onboarding.step2.otpLabel")}</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl tracking-[0.5em]"
                  />
                </div>
                <Button variant="link" className="px-0">
                  {t("onboarding.step2.resend")}
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-primary">{t("onboarding.step3.title")}</h2>
                <p className="text-muted-foreground">{t("onboarding.step3.subtitle")}</p>

                <div className="space-y-1.5">
                  <Label>{t("profile.photos")}</Label>
                  <PhotoUploader photos={photos} onChange={setPhotos} />
                  <p className="text-xs text-muted-foreground">{t("profile.facePhotoHint")}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{t("onboarding.step3.fullName")}</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("onboarding.step3.displayName")}</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{t("onboarding.step3.bio")}</Label>
                  <Textarea
                    maxLength={500}
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder={t("onboarding.step3.bioPlaceholder")}
                  />
                  <p className="text-end text-xs text-muted-foreground">{aboutMe.length}/500</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-primary">{t("onboarding.step4.title")}</h2>
                <p className="text-muted-foreground">{t("onboarding.step4.subtitle")}</p>
                <InterestPicker selected={interestIds} onToggle={toggleInterest} />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-primary">{t("onboarding.step5.title")}</h2>
                <p className="text-muted-foreground">{t("onboarding.step5.subtitle")}</p>
                <IntentPicker selected={intents} onToggle={toggleIntent} />
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-gold text-3xl">
                  <PartyPopper className="h-8 w-8 text-gold-foreground" />
                </div>
                <h2 className="text-2xl font-extrabold text-primary">{t("onboarding.step6.title")}</h2>
                <p className="text-muted-foreground">{t("onboarding.step6.subtitle")}</p>
              </div>
            )}

            <div className="mt-8 flex justify-between gap-3">
              {step > 1 ? (
                <Button variant="outline" onClick={back}>
                  {t("common.back")}
                </Button>
              ) : (
                <div />
              )}
              {step < TOTAL_STEPS ? (
                <Button onClick={next} disabled={!canProceed()}>
                  {t("common.continue")}
                </Button>
              ) : (
                <Button variant="gold" onClick={finish} className="ms-auto">
                  {t("onboarding.step6.cta")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
