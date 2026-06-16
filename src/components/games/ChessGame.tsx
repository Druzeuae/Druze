import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Crown, RotateCcw, Undo2 } from "lucide-react";
import { Chess, type Square } from "chess.js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GLYPH: Record<string, string> = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export function ChessGame() {
  const { t } = useTranslation();
  const gameRef = useRef(new Chess());
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const refresh = () => setTick((n) => n + 1);
  const game = gameRef.current;

  const targets = useMemo<Square[]>(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map((m) => m.to as Square);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, gameRef.current.fen()]);

  const handleSquare = (sq: Square) => {
    if (game.isGameOver()) return;
    const piece = game.get(sq);
    if (selected && targets.includes(sq)) {
      game.move({ from: selected, to: sq, promotion: "q" });
      setLastMove({ from: selected, to: sq });
      setSelected(null);
      refresh();
      return;
    }
    if (piece && piece.color === game.turn()) {
      setSelected(sq);
    } else {
      setSelected(null);
    }
  };

  const reset = () => {
    gameRef.current = new Chess();
    setSelected(null);
    setLastMove(null);
    refresh();
  };

  const undo = () => {
    game.undo();
    setSelected(null);
    setLastMove(null);
    refresh();
  };

  const turnWhite = game.turn() === "w";
  let status: string;
  if (game.isCheckmate()) status = t("chess.checkmate", { winner: turnWhite ? t("chess.black") : t("chess.white") });
  else if (game.isStalemate()) status = t("chess.stalemate");
  else if (game.isDraw()) status = t("chess.draw");
  else status = `${turnWhite ? t("chess.white") : t("chess.black")} ${t("chess.toMove")}${game.isCheck() ? " · " + t("chess.check") : ""}`;

  const board = game.board();

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center font-bold",
          game.isGameOver() ? "gradient-gold text-gold-foreground" : "bg-secondary"
        )}
      >
        {game.isCheckmate() && <Crown className="h-5 w-5" />}
        {status}
      </div>

      <div className="mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border-2 border-border shadow-lg">
        <div className="grid h-full grid-cols-8">
          {RANKS.map((rank, r) =>
            FILES.map((file, f) => {
              const sq = `${file}${rank}` as Square;
              const cell = board[r][f];
              const dark = (r + f) % 2 === 1;
              const isSel = selected === sq;
              const isTarget = targets.includes(sq);
              const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
              return (
                <button
                  key={sq}
                  onClick={() => handleSquare(sq)}
                  className={cn(
                    "relative flex items-center justify-center text-3xl sm:text-4xl",
                    dark ? "bg-primary-700" : "bg-primary-100",
                    isSel && "ring-4 ring-inset ring-gold-400",
                    isLast && "bg-gold-300/40"
                  )}
                >
                  {cell && (
                    <span
                      className={cn(
                        "leading-none drop-shadow",
                        cell.color === "w" ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]" : "text-neutral-900"
                      )}
                    >
                      {GLYPH[cell.type]}
                    </span>
                  )}
                  {isTarget && !cell && <span className="absolute h-3 w-3 rounded-full bg-gold-500/70" />}
                  {isTarget && cell && <span className="absolute inset-1 rounded-full ring-4 ring-gold-500/70" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={undo} disabled={game.history().length === 0}>
          <Undo2 className="h-4 w-4" /> {t("chess.undo")}
        </Button>
        <Button variant="outline" className="flex-1" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> {t("chess.newGame")}
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">{t("chess.passHint")}</p>
    </div>
  );
}
