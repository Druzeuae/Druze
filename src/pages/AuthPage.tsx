import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Phone, Chrome, Apple, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Logo } from "@/components/common/Logo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, signup } = useApp();
  const { toast } = useToast();

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
  const [pdplConsent, setPdplConsent] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpCode, setSignupOtpCode] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const canContinue = pdplConsent;

  const handleSignup = async () => {
    if (!canContinue) {
      toast({ description: t("auth.agreeToContinue"), variant: "destructive" });
      return;
    }
    if (mode === "email") {
      if (!signupEmail || !signupPassword) {
        toast({ description: t("auth.agreeToContinue"), variant: "destructive" });
        return;
      }
      setSubmitting(true);
      const { error } = await signup(signupEmail, signupPassword);
      setSubmitting(false);
      if (error) {
        toast({ description: error.message, variant: "destructive" });
        return;
      }
      navigate("/onboarding");
      return;
    }

    // Phone mode
    if (!PHONE_REGEX.test(signupPhone)) {
      toast({ description: t("auth.phoneInvalid"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: signupPhone });
    setSubmitting(false);
    if (error) {
      toast({ description: error.message, variant: "destructive" });
      return;
    }
    setSignupOtpSent(true);
    toast({ description: t("auth.otpSentDesc", { phone: signupPhone }) });
  };

  const handleVerifySignupOtp = async () => {
    if (!signupOtpCode) return;
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: signupPhone,
      token: signupOtpCode,
      type: "sms",
    });
    setSubmitting(false);
    if (error) {
      toast({ description: error.message, variant: "destructive" });
      return;
    }
    navigate("/onboarding");
  };

  const handleLogin = async () => {
    if (loginMode === "email") {
      if (!loginEmail || !loginPassword) return;
      setSubmitting(true);
      const { error } = await login(loginEmail, loginPassword);
      setSubmitting(false);
      if (error) {
        toast({ description: error.message, variant: "destructive" });
        return;
      }
      navigate("/discover");
      return;
    }

    // Phone mode
    if (!PHONE_REGEX.test(loginPhone)) {
      toast({ description: t("auth.phoneInvalid"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: loginPhone,
      options: { shouldCreateUser: false },
    });
    setSubmitting(false);
    if (error) {
      toast({ description: error.message, variant: "destructive" });
      return;
    }
    setLoginOtpSent(true);
    toast({ description: t("auth.otpSentDesc", { phone: loginPhone }) });
  };

  const handleVerifyLoginOtp = async () => {
    if (!loginOtpCode) return;
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: loginPhone,
      token: loginOtpCode,
      type: "sms",
    });
    setSubmitting(false);
    if (error) {
      toast({ description: error.message, variant: "destructive" });
      return;
    }
    navigate("/discover");
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col gradient-brand">
      <div className="flex justify-end p-4">
        <LanguageSwitcher className="text-white hover:bg-white/10" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2 md:gap-12">
          {/* Hero */}
          <div className="hidden flex-col justify-center text-white md:flex">
            <Logo size="lg" className="text-white [&_span]:text-white" />
            <h1 className="mt-8 text-4xl font-extrabold leading-tight">
              {t("auth.welcome")}
            </h1>
            <p className="mt-4 text-lg text-white/85">{t("auth.subtitle")}</p>
            <div className="mt-8 flex gap-3 text-sm font-semibold text-white/90">
              <span className="rounded-full bg-white/10 px-4 py-2">💍 {t("badges.openToMarriage")}</span>
              <span className="rounded-full bg-white/10 px-4 py-2">🤝 {t("badges.lookingForFriendship")}</span>
              <span className="rounded-full bg-white/10 px-4 py-2">💼 {t("badges.professionalNetworking")}</span>
            </div>
          </div>

          {/* Card */}
          <Card className="w-full animate-slide-up shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex flex-col items-center gap-2 text-center md:hidden">
                <Logo size="md" />
                <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
              </div>

              <Tabs defaultValue="signup">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
                  <TabsTrigger value="login">{t("auth.logIn")}</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => { setMode("email"); setSignupOtpSent(false); }}
                      className={mode === "email" ? "border-primary text-primary" : ""}
                    >
                      <Mail className="h-4 w-4" /> {t("auth.email")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setMode("phone"); setSignupOtpSent(false); }}
                      className={mode === "phone" ? "border-primary text-primary" : ""}
                    >
                      <Phone className="h-4 w-4" /> {t("auth.phone")}
                    </Button>
                  </div>

                  {mode === "email" ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email">{t("auth.email")}</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-password">{t("auth.password")}</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-phone">{t("auth.phone")}</Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder={t("auth.phonePlaceholder")}
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          disabled={signupOtpSent}
                        />
                      </div>
                      {signupOtpSent && (
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-otp">{t("auth.otpCode")}</Label>
                          <Input
                            id="signup-otp"
                            type="text"
                            inputMode="numeric"
                            placeholder={t("auth.otpCodePlaceholder")}
                            value={signupOtpCode}
                            onChange={(e) => setSignupOtpCode(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {mode === "email" || !signupOtpSent ? (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                        pdplConsent
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={pdplConsent}
                        onChange={(e) => setPdplConsent(e.target.checked)}
                      />
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                          pdplConsent
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background"
                        }`}
                      >
                        {pdplConsent && <ShieldCheck className="h-3.5 w-3.5" />}
                      </span>
                      <span className="text-muted-foreground">{t("auth.pdplConsent")}</span>
                    </label>
                  ) : null}

                  {mode === "phone" && signupOtpSent ? (
                    <div className="space-y-2">
                      <Button className="w-full" size="lg" onClick={handleVerifySignupOtp} disabled={submitting}>
                        {t("auth.verifyCode")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => { setSignupOtpSent(false); setSignupOtpCode(""); }}
                        disabled={submitting}
                      >
                        {t("auth.changePhoneNumber")}
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" size="lg" onClick={handleSignup} disabled={submitting}>
                      {mode === "phone" ? t("auth.sendCode") : t("auth.createAccount")}
                    </Button>
                  )}

                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    {t("auth.or")}
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleOAuth("google")}>
                      <Chrome className="h-4 w-4" /> Google
                    </Button>
                    <Button variant="outline" onClick={() => handleOAuth("apple")}>
                      <Apple className="h-4 w-4" /> Apple
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => { setLoginMode("email"); setLoginOtpSent(false); }}
                      className={loginMode === "email" ? "border-primary text-primary" : ""}
                    >
                      <Mail className="h-4 w-4" /> {t("auth.email")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setLoginMode("phone"); setLoginOtpSent(false); }}
                      className={loginMode === "phone" ? "border-primary text-primary" : ""}
                    >
                      <Phone className="h-4 w-4" /> {t("auth.phone")}
                    </Button>
                  </div>

                  {loginMode === "email" ? (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email">{t("auth.email")}</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-password">{t("auth.password")}</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                      </div>
                      <Button className="w-full" size="lg" onClick={handleLogin} disabled={submitting}>
                        {t("auth.logIn")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-phone">{t("auth.phone")}</Label>
                        <Input
                          id="login-phone"
                          type="tel"
                          placeholder={t("auth.phonePlaceholder")}
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          disabled={loginOtpSent}
                        />
                      </div>
                      {loginOtpSent && (
                        <div className="space-y-1.5">
                          <Label htmlFor="login-otp">{t("auth.otpCode")}</Label>
                          <Input
                            id="login-otp"
                            type="text"
                            inputMode="numeric"
                            placeholder={t("auth.otpCodePlaceholder")}
                            value={loginOtpCode}
                            onChange={(e) => setLoginOtpCode(e.target.value)}
                          />
                        </div>
                      )}
                      {loginOtpSent ? (
                        <div className="space-y-2">
                          <Button className="w-full" size="lg" onClick={handleVerifyLoginOtp} disabled={submitting}>
                            {t("auth.verifyCode")}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => { setLoginOtpSent(false); setLoginOtpCode(""); }}
                            disabled={submitting}
                          >
                            {t("auth.changePhoneNumber")}
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" size="lg" onClick={handleLogin} disabled={submitting}>
                          {t("auth.sendCode")}
                        </Button>
                      )}
                    </>
                  )}

                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    {t("auth.or")}
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleOAuth("google")}>
                      <Chrome className="h-4 w-4" /> Google
                    </Button>
                    <Button variant="outline" onClick={() => handleOAuth("apple")}>
                      <Apple className="h-4 w-4" /> Apple
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
