import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Brain, Check, Crown, Loader2, Trophy, Users, Wifi, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import { TRIVIA_QUESTIONS } from "@/data/gamesData";
import { useRealtimeRoom, usePlayerIdentity, type PresencePlayer } from "@/hooks/useRealtimeRoom";

const ROUND_SIZE = 6;

type Phase = "lobby" | "question" | "reveal" | "finished";

interface TriviaState {
  phase: Phase;
  qIndex: number;
  questionIds: number[];
  answers: Record<string, number>; // playerId -> option (current question only)
  scores: Record<string, number>;
}

function pickQuestions(): number[] {
  const ids = TRIVIA_QUESTIONS.map((_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, ROUND_SIZE);
}

export function RealtimeTrivia({
  roomId,
  self,
}: {
  roomId: string;
  self: PresencePlayer;
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const playerId = usePlayerIdentity(roomId);
  const me: PresencePlayer = { ...self, playerId };

  const [state, setState] = useState<TriviaState | null>(null);
  const stateRef = useRef<TriviaState | null>(null);
  stateRef.current = state;

  const isHostRef = useRef(false);

  // Host broadcasts authoritative state to everyone.
  const broadcastRef = useRef<((type: string, data: unknown) => void) | null>(null);
  const pushState = useCallback((next: TriviaState) => {
    setState(next);
    broadcastRef.current?.("state", next);
  }, []);

  const handleEvent = useCallback(
    (type: string, data: unknown, from: string) => {
      if (type === "state") {
        // Non-hosts adopt the host's state.
        if (!isHostRef.current) setState(data as TriviaState);
        return;
      }
      if (type === "hello") {
        // A player joined — host re-sends current state so they sync.
        if (isHostRef.current && stateRef.current) broadcastRef.current?.("state", stateRef.current);
        return;
      }
      if (type === "answer") {
        if (!isHostRef.current) return;
        const cur = stateRef.current;
        if (!cur || cur.phase !== "question") return;
        if (cur.answers[from] !== undefined) return;
        const next = { ...cur, answers: { ...cur.answers, [from]: (data as { option: number }).option } };
        setState(next);
        broadcastRef.current?.("state", next);
      }
    },
    []
  );

  const { players, connected, send, hostId, isHost } = useRealtimeRoom({
    roomId,
    self: me,
    onEvent: handleEvent,
  });
  broadcastRef.current = send;
  isHostRef.current = isHost;

  // On connect, ask host for current state.
  useEffect(() => {
    if (connected) send("hello", {});
  }, [connected, send]);

  // Surface a friendly error if the realtime socket can't connect (e.g. a
  // network/firewall blocking WebSockets) instead of spinning forever.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (connected) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [connected]);

  // Host seeds an initial lobby state once it knows it's host.
  useEffect(() => {
    if (isHost && connected && !stateRef.current) {
      pushState({ phase: "lobby", qIndex: 0, questionIds: [], answers: {}, scores: {} });
    }
  }, [isHost, connected, pushState]);

  /* ----------------------------- Host actions ----------------------------- */
  const startGame = () => {
    const scores: Record<string, number> = {};
    players.forEach((p) => (scores[p.playerId] = 0));
    pushState({ phase: "question", qIndex: 0, questionIds: pickQuestions(), answers: {}, scores });
  };

  const reveal = () => {
    const cur = stateRef.current;
    if (!cur) return;
    const q = TRIVIA_QUESTIONS[cur.questionIds[cur.qIndex]];
    const scores = { ...cur.scores };
    Object.entries(cur.answers).forEach(([pid, opt]) => {
      if (opt === q.answer) scores[pid] = (scores[pid] ?? 0) + 1;
    });
    pushState({ ...cur, phase: "reveal", scores });
  };

  const next = () => {
    const cur = stateRef.current;
    if (!cur) return;
    if (cur.qIndex + 1 >= cur.questionIds.length) {
      pushState({ ...cur, phase: "finished" });
    } else {
      pushState({ ...cur, phase: "question", qIndex: cur.qIndex + 1, answers: {} });
    }
  };

  const playAgain = () => {
    const scores: Record<string, number> = {};
    players.forEach((p) => (scores[p.playerId] = 0));
    pushState({ phase: "question", qIndex: 0, questionIds: pickQuestions(), answers: {}, scores });
  };

  /* ----------------------------- Player action ---------------------------- */
  const answer = (option: number) => {
    const cur = stateRef.current;
    if (!cur || cur.phase !== "question") return;
    if (cur.answers[playerId] !== undefined) return;
    if (isHost) {
      setState({ ...cur, answers: { ...cur.answers, [playerId]: option } });
      send("state", { ...cur, answers: { ...cur.answers, [playerId]: option } });
    } else {
      // optimistic local mark, host is authoritative
      setState({ ...cur, answers: { ...cur.answers, [playerId]: option } });
      send("answer", { option });
    }
  };

  const nameOf = (pid: string) => players.find((p) => p.playerId === pid)?.name ?? "Player";

  /* -------------------------------- Render -------------------------------- */
  if (!connected || !state) {
    if (timedOut && !connected) {
      return (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <WifiOff className="h-8 w-8 text-destructive" />
          <p className="font-semibold">{t("games.realtime.connectFailed")}</p>
          <p className="max-w-xs text-sm">{t("games.realtime.connectFailedHint")}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("games.realtime.retry")}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-semibold">{t("games.realtime.connecting")}</p>
      </div>
    );
  }

  const PlayersBar = () => (
    <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Wifi className="h-4 w-4 text-emerald-500" /> {t("games.realtime.live")}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2 rtl:space-x-reverse">
          {players.slice(0, 5).map((p) => (
            <Avatar key={p.playerId} className="h-7 w-7 ring-2 ring-background">
              <AvatarFallback className="text-[10px]">
                {p.playerId === hostId ? "👑" : initials(p.name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> {players.length}
        </span>
      </div>
    </div>
  );

  const Leaderboard = () => {
    const ranked = [...players].sort((a, b) => (state.scores[b.playerId] ?? 0) - (state.scores[a.playerId] ?? 0));
    return (
      <div className="space-y-1.5">
        {ranked.map((p, i) => (
          <div
            key={p.playerId}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 py-2",
              i === 0 ? "border-gold-300 bg-gold-50" : "border-border"
            )}
          >
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-5 text-center text-muted-foreground">{i + 1}</span>
              {i === 0 && <Crown className="h-4 w-4 text-gold-500" />}
              {p.name}
              {p.playerId === playerId && <span className="text-xs text-muted-foreground">({t("games.realtime.you")})</span>}
            </span>
            <span className="font-extrabold text-primary">{state.scores[p.playerId] ?? 0}</span>
          </div>
        ))}
      </div>
    );
  };

  // LOBBY
  if (state.phase === "lobby") {
    return (
      <div className="space-y-4">
        <PlayersBar />
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Brain className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-bold">{t("games.realtime.lobbyTitle")}</h3>
          <p className="text-muted-foreground">{t("games.realtime.lobbyDesc")}</p>
        </div>
        <div className="grid gap-2">
          {players.map((p) => (
            <div key={p.playerId} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback></Avatar>
              <span className="font-semibold">{p.name}</span>
              {p.playerId === hostId && <Crown className="h-4 w-4 text-gold-500" />}
            </div>
          ))}
        </div>
        {isHost ? (
          <Button className="w-full" onClick={startGame}>
            {t("games.realtime.startGame")}
          </Button>
        ) : (
          <p className="text-center text-sm font-semibold text-muted-foreground">
            {t("games.realtime.waitingHost")}
          </p>
        )}
      </div>
    );
  }

  // FINISHED
  if (state.phase === "finished") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-gold">
            <Trophy className="h-8 w-8 text-gold-foreground" />
          </div>
          <h3 className="text-2xl font-extrabold">{t("games.realtime.finalScores")}</h3>
        </div>
        <Leaderboard />
        {isHost ? (
          <Button className="w-full" onClick={playAgain}>{t("games.playAgain")}</Button>
        ) : (
          <p className="text-center text-sm font-semibold text-muted-foreground">{t("games.realtime.waitingHost")}</p>
        )}
      </div>
    );
  }

  // QUESTION / REVEAL
  const q = TRIVIA_QUESTIONS[state.questionIds[state.qIndex]];
  const options = isAr ? q.optionsAr : q.options;
  const myAnswer = state.answers[playerId];
  const answeredCount = Object.keys(state.answers).length;
  const isReveal = state.phase === "reveal";

  return (
    <div className="space-y-4">
      <PlayersBar />

      <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Brain className="h-4 w-4 text-primary" />
          {t("games.trivia.question", { current: state.qIndex + 1, total: state.questionIds.length })}
        </span>
        <span>{t("games.realtime.answered", { count: answeredCount, total: players.length })}</span>
      </div>

      <h3 className="text-xl font-bold leading-snug">{isAr ? q.questionAr : q.question}</h3>

      <div className="grid gap-2.5">
        {options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === myAnswer;
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={myAnswer !== undefined || isReveal}
              className={cn(
                "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-start font-semibold transition-all",
                !isReveal && myAnswer === undefined && "border-border hover:border-primary-300 hover:bg-secondary",
                !isReveal && isPicked && "border-primary bg-primary-50",
                isReveal && isAnswer && "border-emerald-500 bg-emerald-50 text-emerald-800",
                isReveal && isPicked && !isAnswer && "border-destructive bg-red-50 text-destructive",
                isReveal && !isAnswer && !isPicked && "border-border opacity-60"
              )}
            >
              {opt}
              {isReveal && isAnswer && <Check className="h-5 w-5 text-emerald-600" />}
              {isReveal && isPicked && !isAnswer && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>

      {isReveal && (
        <>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-sm font-bold text-muted-foreground">{t("games.realtime.leaderboard")}</p>
            <Leaderboard />
          </div>
          {isHost ? (
            <Button className="w-full" onClick={next}>
              {state.qIndex + 1 >= state.questionIds.length ? t("games.trivia.seeResults") : t("common.next")}
            </Button>
          ) : (
            <p className="text-center text-sm font-semibold text-muted-foreground">{t("games.realtime.waitingHost")}</p>
          )}
        </>
      )}

      {!isReveal && isHost && (
        <Button variant="outline" className="w-full" onClick={reveal}>
          {t("games.realtime.reveal")}
        </Button>
      )}
      {!isReveal && !isHost && myAnswer !== undefined && (
        <p className="text-center text-sm font-semibold text-muted-foreground">{t("games.realtime.waitingOthers")}</p>
      )}
    </div>
  );
}
