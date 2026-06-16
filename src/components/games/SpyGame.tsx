import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Minus, Plus, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pickSpyRound, type SpyWord } from "@/data/gamesData";

type Phase = "setup" | "deal" | "play" | "reveal";

const MIN = 3;
const MAX = 12;

export function SpyGame() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(5);
  const [round, setRound] = useState<{ word: SpyWord; spyIndex: number } | null>(null);
  const [dealIndex, setDealIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const start = () => {
    setRound(pickSpyRound(count));
    setDealIndex(0);
    setRevealed(false);
    setPhase("deal");
  };

  const nextPlayer = () => {
    if (dealIndex + 1 >= count) {
      setPhase("play");
    } else {
      setDealIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const reset = () => {
    setPhase("setup");
    setRound(null);
  };

  /* ------------------------------- SETUP ------------------------------- */
  if (phase === "setup") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl gradient-indigo p-5 text-center text-white">
          <p className="text-4xl">🕵️</p>
          <h3 className="mt-1 text-xl font-extrabold">{t("spy.title")}</h3>
          <p className="mt-1 text-sm text-white/85">{t("spy.tagline")}</p>
        </div>

        <p className="text-sm text-muted-foreground">{t("spy.howTo")}</p>

        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCount((c) => Math.max(MIN, c - 1))} disabled={count <= MIN}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-4xl font-extrabold">{count}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {t("spy.players")}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCount((c) => Math.min(MAX, c + 1))} disabled={count >= MAX}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button className="w-full gradient-indigo text-white" size="lg" onClick={start}>
          {t("spy.start")}
        </Button>
      </div>
    );
  }

  /* -------------------------------- DEAL ------------------------------- */
  if (phase === "deal" && round) {
    const isSpy = dealIndex === round.spyIndex;
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm font-semibold text-muted-foreground">{t("spy.passTo", { n: dealIndex + 1 })}</p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mx-auto flex aspect-[3/4] w-full max-w-xs flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary"
          >
            <Eye className="h-10 w-10 text-primary" />
            <span className="text-lg font-bold">{t("spy.tapReveal")}</span>
            <span className="text-sm text-muted-foreground">{t("spy.playerN", { n: dealIndex + 1 })}</span>
          </button>
        ) : (
          <div className={cn("mx-auto flex aspect-[3/4] w-full max-w-xs flex-col items-center justify-center gap-3 rounded-3xl p-6 text-white shadow-xl animate-pop", isSpy ? "gradient-crimson" : "gradient-indigo")}>
            {isSpy ? (
              <>
                <EyeOff className="h-12 w-12" />
                <h3 className="text-3xl font-extrabold">{t("spy.youAreSpy")}</h3>
                <p className="text-sm text-white/90">{t("spy.spyHint")}</p>
              </>
            ) : (
              <>
                <span className="text-xs font-bold uppercase tracking-wide text-white/80">{t("spy.secretWord")}</span>
                <h3 className="text-3xl font-extrabold">{isAr ? round.word.wordAr : round.word.word}</h3>
                <p className="text-sm text-white/90">{t("spy.wordHint")}</p>
              </>
            )}
          </div>
        )}

        {revealed && (
          <Button className="w-full" size="lg" onClick={nextPlayer}>
            {dealIndex + 1 >= count ? t("spy.everyoneSeen") : t("spy.gotItPass")}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">{t("spy.secretNote")}</p>
      </div>
    );
  }

  /* -------------------------------- PLAY ------------------------------- */
  if (phase === "play") {
    return (
      <div className="space-y-5 text-center">
        <div className="rounded-2xl gradient-indigo p-6 text-white">
          <p className="text-4xl">💬</p>
          <h3 className="mt-1 text-xl font-extrabold">{t("spy.discussTitle")}</h3>
          <p className="mt-1 text-sm text-white/85">{t("spy.discussBody")}</p>
        </div>
        <Button className="w-full" size="lg" onClick={() => setPhase("reveal")}>
          {t("spy.revealSpy")}
        </Button>
        <Button variant="outline" className="w-full" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> {t("spy.newRound")}
        </Button>
      </div>
    );
  }

  /* ------------------------------- REVEAL ------------------------------ */
  return (
    <div className="space-y-5 text-center">
      <div className="rounded-2xl gradient-crimson p-6 text-white">
        <p className="text-4xl">🕵️</p>
        <h3 className="mt-1 text-2xl font-extrabold">{t("spy.spyWas", { n: (round?.spyIndex ?? 0) + 1 })}</h3>
        <p className="mt-2 text-sm text-white/85">
          {t("spy.wordWas", { word: round ? (isAr ? round.word.wordAr : round.word.word) : "" })}
        </p>
      </div>
      <Button className="w-full gradient-indigo text-white" size="lg" onClick={start}>
        {t("spy.playAgain")}
      </Button>
      <Button variant="outline" className="w-full" onClick={reset}>
        <RotateCcw className="h-4 w-4" /> {t("spy.changePlayers")}
      </Button>
    </div>
  );
}
