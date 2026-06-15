import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Hand, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NEVER_HAVE_I_EVER } from "@/data/gamesData";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function NeverHaveIEverGame() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [seed, setSeed] = useState(0);
  const prompts = useMemo(() => shuffle(NEVER_HAVE_I_EVER), [seed]);
  const [index, setIndex] = useState(0);
  const [haveCount, setHaveCount] = useState(0);
  const [neverCount, setNeverCount] = useState(0);
  const [answered, setAnswered] = useState(false);

  const prompt = prompts[index];

  const answer = (have: boolean) => {
    if (answered) return;
    if (have) setHaveCount((c) => c + 1);
    else setNeverCount((c) => c + 1);
    setAnswered(true);
  };

  const next = () => {
    setAnswered(false);
    setIndex((i) => (i + 1) % prompts.length);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setHaveCount(0);
    setNeverCount(0);
    setAnswered(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl gradient-coral p-6 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
          {t("games.neverHaveIEver.title")}
        </p>
        <p className="mt-2 text-2xl font-extrabold leading-snug">
          {isAr ? prompt.textAr : prompt.text}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto flex-col gap-1 py-4 text-base"
          onClick={() => answer(true)}
          disabled={answered}
        >
          <Hand className="h-6 w-6 text-coral-500" />
          {t("games.neverHaveIEver.iHave")}
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-1 py-4 text-base"
          onClick={() => answer(false)}
          disabled={answered}
        >
          <ShieldCheck className="h-6 w-6 text-teal-500" />
          {t("games.neverHaveIEver.iNever")}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm font-semibold text-muted-foreground">
        <span>✋ {t("games.neverHaveIEver.iHave")}: {haveCount}</span>
        <span>🙅 {t("games.neverHaveIEver.iNever")}: {neverCount}</span>
      </div>

      {answered && (
        <div className="flex gap-2">
          <Button onClick={next} className="flex-1 gradient-coral text-white">
            {t("common.next")}
          </Button>
          <Button variant="outline" size="icon" onClick={restart} aria-label={t("games.playAgain")}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
