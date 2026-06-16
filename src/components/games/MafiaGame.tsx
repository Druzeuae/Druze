import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Eye, Minus, Plus, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAFIA_ROLES, MAFIA_SCRIPT, rolesForCount, type MafiaRoleId } from "@/data/gamesData";

type Phase = "setup" | "deal" | "play";

const MIN = 5;
const MAX = 16;

/** Non-random breakdown for the setup preview. */
function breakdown(n: number): Record<MafiaRoleId, number> {
  const mafia = n <= 6 ? 1 : n <= 9 ? 2 : n <= 12 ? 3 : 4;
  const doctor = n >= 6 ? 1 : 0;
  return { mafia, detective: 1, doctor, civilian: Math.max(0, n - mafia - 1 - doctor) };
}

export function MafiaGame() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(7);
  const [roles, setRoles] = useState<MafiaRoleId[]>([]);
  const [dealIndex, setDealIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState(0);
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());

  const counts = useMemo(() => breakdown(count), [count]);

  const start = () => {
    setRoles(rolesForCount(count));
    setDealIndex(0);
    setRevealed(false);
    setPhase("deal");
  };

  const nextPlayer = () => {
    if (dealIndex + 1 >= count) {
      setStep(0);
      setEliminated(new Set());
      setPhase("play");
    } else {
      setDealIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const toggleEliminated = (i: number) =>
    setEliminated((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const reset = () => {
    setPhase("setup");
    setRoles([]);
    setEliminated(new Set());
  };

  /* ------------------------------- SETUP ------------------------------- */
  if (phase === "setup") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl gradient-crimson p-5 text-center text-white">
          <p className="text-4xl">🎭</p>
          <h3 className="mt-1 text-xl font-extrabold">{t("mafia.title")}</h3>
          <p className="mt-1 text-sm text-white/85">{t("mafia.tagline")}</p>
        </div>

        <p className="text-sm text-muted-foreground">{t("mafia.howTo")}</p>

        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCount((c) => Math.max(MIN, c - 1))} disabled={count <= MIN}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-4xl font-extrabold">{count}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {t("mafia.players")}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCount((c) => Math.min(MAX, c + 1))} disabled={count >= MAX}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(counts) as MafiaRoleId[]).filter((r) => counts[r] > 0).map((r) => (
            <div key={r} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <span className="text-xl">{MAFIA_ROLES[r].emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold">{t(`mafia.roles.${r}.name`)}</p>
              </div>
              <span className="font-extrabold text-primary">×{counts[r]}</span>
            </div>
          ))}
        </div>

        <Button className="w-full gradient-crimson text-white" size="lg" onClick={start}>
          {t("mafia.deal")}
        </Button>
      </div>
    );
  }

  /* -------------------------------- DEAL ------------------------------- */
  if (phase === "deal") {
    const role = roles[dealIndex];
    const meta = MAFIA_ROLES[role];
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {t("mafia.passTo", { n: dealIndex + 1 })}
        </p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex aspect-[3/4] w-full max-w-xs mx-auto flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary"
          >
            <Eye className="h-10 w-10 text-primary" />
            <span className="text-lg font-bold">{t("mafia.tapReveal")}</span>
            <span className="text-sm text-muted-foreground">{t("mafia.playerN", { n: dealIndex + 1 })}</span>
          </button>
        ) : (
          <div className={cn("mx-auto flex aspect-[3/4] w-full max-w-xs flex-col items-center justify-center gap-2 rounded-3xl p-6 text-white shadow-xl animate-pop", meta.gradient)}>
            <span className="text-6xl">{meta.emoji}</span>
            <h3 className="text-2xl font-extrabold">{t(`mafia.roles.${role}.name`)}</h3>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase">
              {t(`mafia.team.${meta.team}`)}
            </span>
            <p className="mt-1 text-sm text-white/90">{t(`mafia.roles.${role}.desc`)}</p>
          </div>
        )}

        {revealed && (
          <Button className="w-full" size="lg" onClick={nextPlayer}>
            {dealIndex + 1 >= count ? t("mafia.startGame") : t("mafia.gotItPass")}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">{t("mafia.secretNote")}</p>
      </div>
    );
  }

  /* -------------------------------- PLAY ------------------------------- */
  const phaseKey = MAFIA_SCRIPT[step % MAFIA_SCRIPT.length];
  const aliveCount = count - eliminated.size;
  return (
    <div className="space-y-5">
      {/* Narrator panel */}
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("mafia.narrator")}</p>
        <p className="my-3 text-2xl font-extrabold">{t(`mafia.script.${phaseKey}`)}</p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="text-sm font-semibold text-muted-foreground">{(step % MAFIA_SCRIPT.length) + 1}/{MAFIA_SCRIPT.length}</span>
          <Button size="icon" onClick={() => setStep((s) => s + 1)}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      {/* Alive tracker */}
      <div>
        <p className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>{t("mafia.aliveTracker")}</span>
          <span className="text-muted-foreground">{t("mafia.aliveCount", { count: aliveCount })}</span>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: count }, (_, i) => {
            const dead = eliminated.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleEliminated(i)}
                className={cn(
                  "rounded-xl border-2 px-2 py-3 text-sm font-bold transition-all",
                  dead ? "border-border bg-secondary/40 text-muted-foreground line-through opacity-60" : "border-primary/40 hover:border-primary"
                )}
              >
                {t("mafia.playerN", { n: i + 1 })}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("mafia.tapEliminate")}</p>
      </div>

      <Button variant="outline" className="w-full" onClick={reset}>
        <RotateCcw className="h-4 w-4" /> {t("mafia.newGame")}
      </Button>
    </div>
  );
}
