import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { QUIZ_QUESTIONS, QUIZ_CATEGORY_META } from "@/data/quizData";

export default function QuizPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const { currentUser, saveQuizAnswers, isGuest, promptRegister } = useApp();

  const [answers, setAnswers] = useState<Record<string, string>>(currentUser.quizAnswers ?? {});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ_QUESTIONS[index];
  const total = QUIZ_QUESTIONS.length;
  const meta = QUIZ_CATEGORY_META[q.category];
  const Icon = meta.icon;

  const progress = useMemo(() => ((index + (answers[q.id] ? 1 : 0)) / total) * 100, [index, answers, q.id, total]);

  const choose = (value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    setTimeout(() => {
      if (index + 1 >= total) {
        finish(next);
      } else {
        setIndex((i) => i + 1);
      }
    }, 220);
  };

  const finish = (final: Record<string, string>) => {
    if (isGuest) {
      promptRegister();
      return;
    }
    saveQuizAnswers(final);
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-brand text-white shadow-lg">
          <HeartHandshake className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-extrabold">{t("quiz.doneTitle")}</h1>
        <p className="text-muted-foreground">{t("quiz.doneBody")}</p>
        <Button size="lg" className="mt-2" onClick={() => navigate("/discover")}>
          <Sparkles className="h-4 w-4" /> {t("quiz.seeMatches")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <button
        onClick={() => (index === 0 ? navigate(-1) : setIndex((i) => i - 1))}
        className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("common.back")}
      </button>

      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-muted-foreground">
          <span>{t("quiz.title")}</span>
          <span>{index + 1} / {total}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full gradient-brand transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="animate-slide-up rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow", meta.gradient)}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t(`quiz.categories.${q.category}`)}
          </span>
        </div>

        <h2 className="mb-6 text-2xl font-extrabold leading-snug">{isAr ? q.questionAr : q.question}</h2>

        <div className="grid gap-3">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => choose(opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-start text-lg font-semibold transition-all hover:-translate-y-0.5",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-secondary"
                )}
              >
                {isAr ? opt.labelAr : opt.label}
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {selected && <Check className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">{t("quiz.privacyNote")}</p>
    </div>
  );
}
