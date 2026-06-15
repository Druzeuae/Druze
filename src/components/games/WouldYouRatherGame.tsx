import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WOULD_YOU_RATHER } from "@/data/gamesData";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function WouldYouRatherGame() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => shuffle(WOULD_YOU_RATHER), [seed]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  // a stable mock "community" split per round, so it feels social
  const [splitA] = useState(() => 30 + Math.floor(Math.random() * 40));

  const round = rounds[index];
  const aShare = picked ? Math.min(95, Math.max(5, splitA + (picked === "a" ? 8 : -8))) : splitA;
  const bShare = 100 - aShare;

  const choose = (side: "a" | "b") => {
    if (picked) return;
    setPicked(side);
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => (i + 1) % rounds.length);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setPicked(null);
  };

  const Side = ({ side, text }: { side: "a" | "b"; text: string }) => {
    const share = side === "a" ? aShare : bShare;
    const isPicked = picked === side;
    return (
      <button
        onClick={() => choose(side)}
        disabled={!!picked}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border-2 p-5 text-center transition-all",
          !picked && "border-border hover:border-teal-400 hover:bg-teal-50",
          picked && isPicked && "border-teal-500",
          picked && !isPicked && "border-border opacity-80"
        )}
      >
        {picked && (
          <div
            className="absolute inset-0 -z-0 bg-teal-100 transition-all duration-500"
            style={{ width: `${share}%` }}
          />
        )}
        <div className="relative z-10">
          <p className="text-lg font-bold">{text}</p>
          {picked && <p className="mt-1 text-2xl font-extrabold text-teal-700">{share}%</p>}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("games.wouldYouRather.prompt")}
      </p>

      <Side side="a" text={isAr ? round.aAr : round.a} />
      <div className="flex items-center justify-center">
        <span className="rounded-full gradient-teal px-4 py-1 text-sm font-extrabold text-white">
          {t("games.wouldYouRather.or")}
        </span>
      </div>
      <Side side="b" text={isAr ? round.bAr : round.b} />

      {picked && (
        <div className="flex gap-2 pt-1">
          <Button onClick={next} className="flex-1">
            {t("games.wouldYouRather.next")}
          </Button>
          <Button variant="outline" size="icon" onClick={restart} aria-label={t("games.playAgain")}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
