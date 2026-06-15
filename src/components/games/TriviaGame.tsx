import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Brain, Check, RotateCcw, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TRIVIA_QUESTIONS } from "@/data/gamesData";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROUND_SIZE = 6;

export function TriviaGame() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => shuffle(TRIVIA_QUESTIONS).slice(0, ROUND_SIZE), [seed]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-gold">
          <Trophy className="h-10 w-10 text-gold-foreground" />
        </div>
        <h3 className="text-2xl font-extrabold">{t("games.trivia.finished")}</h3>
        <p className="text-4xl font-extrabold text-gradient-brand">
          {score} / {questions.length}
        </p>
        <p className="text-muted-foreground">{t("games.trivia.scorePct", { pct })}</p>
        <Button onClick={restart} className="mt-2">
          <RotateCcw className="h-4 w-4" /> {t("games.playAgain")}
        </Button>
      </div>
    );
  }

  const options = isAr ? q.optionsAr : q.options;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Brain className="h-4 w-4 text-primary" />
          {t("games.trivia.question", { current: index + 1, total: questions.length })}
        </span>
        <span>{t("games.trivia.score", { score })}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full gradient-brand transition-all"
          style={{ width: `${((index + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <h3 className="text-xl font-bold leading-snug">{isAr ? q.questionAr : q.question}</h3>

      <div className="grid gap-2.5">
        {options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === selected;
          const reveal = selected !== null;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={reveal}
              className={cn(
                "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-start font-semibold transition-all",
                !reveal && "border-border hover:border-primary-300 hover:bg-secondary",
                reveal && isAnswer && "border-emerald-500 bg-emerald-50 text-emerald-800",
                reveal && isPicked && !isAnswer && "border-destructive bg-red-50 text-destructive",
                reveal && !isAnswer && !isPicked && "border-border opacity-60"
              )}
            >
              {opt}
              {reveal && isAnswer && <Check className="h-5 w-5 text-emerald-600" />}
              {reveal && isPicked && !isAnswer && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <Button onClick={handleNext} className="w-full">
          {index + 1 >= questions.length ? t("games.trivia.seeResults") : t("common.next")}
        </Button>
      )}
    </div>
  );
}
