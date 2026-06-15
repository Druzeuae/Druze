import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Eye, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Phase = "write" | "guess" | "reveal";

export function TwoTruthsGame() {
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>("write");
  const [statements, setStatements] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);

  const canStart = statements.every((s) => s.trim().length > 0);

  const reset = () => {
    setPhase("write");
    setStatements(["", "", ""]);
    setLieIndex(0);
    setGuess(null);
  };

  if (phase === "write") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gold-50 p-3 text-sm text-gold-800">
          {t("games.twoTruths.writeHint")}
        </div>
        {statements.map((s, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{t("games.twoTruths.statement", { n: i + 1 })}</Label>
              <button
                type="button"
                onClick={() => setLieIndex(i)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors",
                  lieIndex === i
                    ? "gradient-gold text-gold-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {lieIndex === i ? t("games.twoTruths.thisIsLie") : t("games.twoTruths.markLie")}
              </button>
            </div>
            <Input
              value={s}
              onChange={(e) => setStatements((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder={t("games.twoTruths.placeholder")}
            />
          </div>
        ))}
        <Button className="w-full" disabled={!canStart} onClick={() => setPhase("guess")}>
          <Eye className="h-4 w-4" /> {t("games.twoTruths.startGuessing")}
        </Button>
      </div>
    );
  }

  if (phase === "guess") {
    return (
      <div className="space-y-4">
        <p className="text-center font-semibold text-muted-foreground">
          {t("games.twoTruths.guessPrompt")}
        </p>
        {statements.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setGuess(i);
              setPhase("reveal");
            }}
            className="w-full rounded-xl border-2 border-border px-4 py-3 text-start font-semibold transition-all hover:border-gold-400 hover:bg-gold-50"
          >
            {s}
          </button>
        ))}
      </div>
    );
  }

  // reveal
  const correct = guess === lieIndex;
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-2xl p-5 text-center text-white",
          correct ? "bg-emerald-500" : "bg-destructive"
        )}
      >
        <p className="text-xl font-extrabold">
          {correct ? t("games.twoTruths.correct") : t("games.twoTruths.wrong")}
        </p>
      </div>
      {statements.map((s, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between rounded-xl border-2 px-4 py-3 font-semibold",
            i === lieIndex ? "border-destructive bg-red-50" : "border-emerald-400 bg-emerald-50"
          )}
        >
          <span>{s}</span>
          {i === lieIndex ? (
            <span className="flex items-center gap-1 text-sm text-destructive">
              <X className="h-4 w-4" /> {t("games.twoTruths.lie")}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> {t("games.twoTruths.truth")}
            </span>
          )}
        </div>
      ))}
      <Button className="w-full" onClick={reset}>
        <RotateCcw className="h-4 w-4" /> {t("games.twoTruths.newRound")}
      </Button>
    </div>
  );
}
