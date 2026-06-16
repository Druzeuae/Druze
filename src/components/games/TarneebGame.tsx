import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  botBid,
  botPlay,
  deal,
  legalPlays,
  longestSuit,
  rankLabel,
  sameCard,
  SUIT_RED,
  SUIT_SYMBOL,
  SUITS,
  teamOf,
  trickWinner,
  type Card,
  type Play,
  type Suit,
} from "@/lib/tarneeb";

type Phase = "bid" | "trump" | "play" | "round" | "match";

interface GS {
  hands: Card[][];
  dealer: number;
  phase: Phase;
  turn: number;
  bids: (number | null | undefined)[];
  contract: { player: number; amount: number } | null;
  trump: Suit | null;
  trick: Play[];
  tricks: [number, number];
  scores: [number, number];
}

const partnerOf = (p: number) => (p + 2) % 4;
const highBid = (bids: (number | null | undefined)[]) => {
  const nums = bids.filter((b): b is number => typeof b === "number");
  return nums.length ? Math.max(...nums) : 6;
};

function newRound(dealer: number, scores: [number, number]): GS {
  return {
    hands: deal(),
    dealer,
    phase: "bid",
    turn: (dealer + 1) % 4,
    bids: [undefined, undefined, undefined, undefined],
    contract: null,
    trump: null,
    trick: [],
    tricks: [0, 0],
    scores,
  };
}

function startPlay(s: GS, trump: Suit): GS {
  return { ...s, trump, phase: "play", turn: s.contract!.player, trick: [] };
}

function applyBid(s: GS, player: number, bid: number | null): GS {
  const bids = [...s.bids];
  bids[player] = bid;
  if (bids.some((b) => b === undefined)) return { ...s, bids, turn: (player + 1) % 4 };
  // resolve bidding
  let hp = -1;
  let hv = -1;
  bids.forEach((b, i) => {
    if (typeof b === "number" && b > hv) {
      hv = b;
      hp = i;
    }
  });
  const contract = hp < 0 ? { player: s.dealer, amount: 7 } : { player: hp, amount: hv };
  const ns = { ...s, bids, contract };
  if (contract.player === 0) return { ...ns, phase: "trump", turn: 0 };
  return startPlay(ns, longestSuit(s.hands[contract.player]));
}

function applyPlay(s: GS, player: number, card: Card): GS {
  const hands = s.hands.map((h, i) => (i === player ? h.filter((c) => !sameCard(c, card)) : h));
  const trick = [...s.trick, { player, card }];
  if (trick.length < 4) return { ...s, hands, trick, turn: (player + 1) % 4 };
  return { ...s, hands, trick };
}

function resolveTrick(s: GS): GS {
  const winner = trickWinner(s.trick, s.trump!);
  const tricks: [number, number] = [...s.tricks];
  tricks[teamOf(winner)]++;
  if (tricks[0] + tricks[1] >= 13) return resolveRound({ ...s, tricks, trick: [] });
  return { ...s, tricks, trick: [], turn: winner };
}

function resolveRound(s: GS): GS {
  const ct = teamOf(s.contract!.player);
  const made = s.tricks[ct] >= s.contract!.amount;
  const wt = made ? ct : ((1 - ct) as 0 | 1);
  const scores: [number, number] = [...s.scores];
  scores[wt] += s.contract!.amount;
  return { ...s, scores, phase: scores[wt] >= 31 ? "match" : "round" };
}

function CardView({ card, className, onClick, disabled, dim }: { card: Card; className?: string; onClick?: () => void; disabled?: boolean; dim?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-border bg-white font-extrabold shadow transition-transform",
        !disabled && onClick && "hover:-translate-y-1",
        dim && "opacity-40",
        SUIT_RED[card.suit] ? "text-red-600" : "text-neutral-900",
        className
      )}
    >
      <span className="text-base leading-none">{rankLabel(card.rank)}</span>
      <span className="text-xl leading-none">{SUIT_SYMBOL[card.suit]}</span>
    </button>
  );
}

export function TarneebGame() {
  const { t } = useTranslation();
  const [s, setS] = useState<GS>(() => newRound(Math.floor(Math.random() * 4), [0, 0]));

  // Bot + trick driver
  useEffect(() => {
    if (s.phase === "play" && s.trick.length === 4) {
      const id = setTimeout(() => setS((cur) => resolveTrick(cur)), 950);
      return () => clearTimeout(id);
    }
    if (s.phase === "bid" && s.turn !== 0) {
      const id = setTimeout(() => setS((cur) => applyBid(cur, cur.turn, botBid(cur.hands[cur.turn], highBid(cur.bids)))), 650);
      return () => clearTimeout(id);
    }
    if (s.phase === "play" && s.turn !== 0 && s.trick.length < 4) {
      const id = setTimeout(
        () => setS((cur) => applyPlay(cur, cur.turn, botPlay(cur.hands[cur.turn], cur.trick, cur.trump!, partnerOf(cur.turn)))),
        650
      );
      return () => clearTimeout(id);
    }
  }, [s]);

  const pname = (p: number) => t(`tarneeb.seats.${["you", "west", "north", "east"][p]}`);
  const myLegal = s.phase === "play" && s.turn === 0 ? legalPlays(s.hands[0], s.trick.length ? s.trick[0].card.suit : null) : [];
  const isLegal = (c: Card) => myLegal.some((l) => sameCard(l, c));

  const playCard = (c: Card) => {
    if (s.phase !== "play" || s.turn !== 0 || !isLegal(c)) return;
    setS((cur) => applyPlay(cur, 0, c));
  };

  const minBid = Math.max(7, highBid(s.bids) + 1);

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-2 text-sm font-bold">
        <span>{t("tarneeb.youTeam")}: {s.scores[0]}</span>
        {s.trump && (
          <span className={cn("flex items-center gap-1", SUIT_RED[s.trump] ? "text-red-500" : "")}>
            {t("tarneeb.trump")}: {SUIT_SYMBOL[s.trump]}
          </span>
        )}
        <span>{t("tarneeb.themTeam")}: {s.scores[1]}</span>
      </div>

      {s.phase === "play" && (
        <p className="text-center text-xs font-semibold text-muted-foreground">
          {t("tarneeb.tricks")}: {t("tarneeb.youTeam")} {s.tricks[0]} · {t("tarneeb.themTeam")} {s.tricks[1]}
          {s.contract && ` · ${t("tarneeb.contract")}: ${pname(s.contract.player)} ${s.contract.amount}`}
        </p>
      )}

      {/* Table — current trick */}
      <div className="mx-auto grid h-48 max-w-sm grid-cols-3 grid-rows-3 items-center justify-items-center rounded-2xl border border-border bg-card/60 p-2">
        {[0, 1, 2, 3].map((p) => {
          const pos = ["col-start-2 row-start-3", "col-start-1 row-start-2", "col-start-2 row-start-1", "col-start-3 row-start-2"][p];
          const played = s.trick.find((tp) => tp.player === p);
          const active = s.phase === "play" && s.turn === p && !played;
          return (
            <div key={p} className={cn("flex flex-col items-center gap-1", pos)}>
              {played ? (
                <CardView card={played.card} />
              ) : (
                <div className={cn("h-16 w-12 rounded-lg border border-dashed", active ? "border-primary" : "border-border/40")} />
              )}
              <span className={cn("text-[11px] font-bold", p === 0 ? "text-primary" : "text-muted-foreground")}>{pname(p)}</span>
            </div>
          );
        })}
        <span className="col-start-2 row-start-2 text-center text-xl">♠♥♦♣</span>
      </div>

      {/* Bidding */}
      {s.phase === "bid" && (
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            {s.turn === 0 ? t("tarneeb.yourBid") : t("tarneeb.waitingBid", { name: pname(s.turn) })}
          </p>
          {s.turn === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setS((cur) => applyBid(cur, 0, null))}>
                {t("tarneeb.pass")}
              </Button>
              {Array.from({ length: 13 - minBid + 1 }, (_, i) => minBid + i).map((n) => (
                <Button key={n} size="sm" onClick={() => setS((cur) => applyBid(cur, 0, n))}>
                  {n}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trump pick */}
      {s.phase === "trump" && (
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold">{t("tarneeb.chooseTrump")}</p>
          <div className="flex justify-center gap-2">
            {SUITS.map((su) => (
              <Button key={su} variant="outline" size="lg" className={cn("text-2xl", SUIT_RED[su] && "text-red-600")} onClick={() => setS((cur) => startPlay(cur, su))}>
                {SUIT_SYMBOL[su]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Round / match result */}
      {(s.phase === "round" || s.phase === "match") && (
        <div className="space-y-3 rounded-2xl gradient-gold p-5 text-center text-gold-foreground">
          <p className="text-lg font-extrabold">
            {s.phase === "match"
              ? t("tarneeb.matchWinner", { team: s.scores[0] >= 31 ? t("tarneeb.youTeam") : t("tarneeb.themTeam") })
              : teamOf(s.contract!.player) === 0
              ? s.tricks[0] >= s.contract!.amount
                ? t("tarneeb.youMade")
                : t("tarneeb.youSet")
              : s.tricks[1] >= s.contract!.amount
              ? t("tarneeb.themMade")
              : t("tarneeb.themSet")}
          </p>
          <Button
            onClick={() =>
              setS(s.phase === "match" ? newRound(Math.floor(Math.random() * 4), [0, 0]) : newRound((s.dealer + 1) % 4, s.scores))
            }
          >
            {s.phase === "match" ? t("tarneeb.newMatch") : t("tarneeb.nextRound")}
          </Button>
        </div>
      )}

      {/* Your hand */}
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">{t("tarneeb.yourHand")}</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {s.hands[0].map((c) => (
            <CardView
              key={`${c.suit}${c.rank}`}
              card={c}
              onClick={() => playCard(c)}
              disabled={s.phase !== "play" || s.turn !== 0 || !isLegal(c)}
              dim={s.phase === "play" && s.turn === 0 && !isLegal(c)}
            />
          ))}
        </div>
      </div>

      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setS(newRound(Math.floor(Math.random() * 4), [0, 0]))}>
        <RotateCcw className="h-4 w-4" /> {t("tarneeb.restart")}
      </Button>
    </div>
  );
}
