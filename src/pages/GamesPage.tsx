import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Gamepad2, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { cn, initials } from "@/lib/utils";
import { GAMES } from "@/data/gamesData";
import type { GameType } from "@/types/app";
import { RealtimeTrivia } from "@/components/games/RealtimeTrivia";
import { WouldYouRatherGame } from "@/components/games/WouldYouRatherGame";
import { NeverHaveIEverGame } from "@/components/games/NeverHaveIEverGame";
import { TwoTruthsGame } from "@/components/games/TwoTruthsGame";
import { MafiaGame } from "@/components/games/MafiaGame";
import { SpyGame } from "@/components/games/SpyGame";
import { ChessGame } from "@/components/games/ChessGame";
import { TarneebGame } from "@/components/games/TarneebGame";

export default function GamesPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { currentUser, profiles, gameRooms, joinGameRoom, leaveGameRoom, createGameRoom } = useApp();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [quickGame, setQuickGame] = useState<GameType | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const activeRoom = gameRooms.find((r) => r.id === activeRoomId) ?? null;
  const playType: GameType | null = activeRoom?.gameType ?? quickGame;

  /* ----------------------- In-room play view ----------------------- */
  if (playType) {
    const meta = GAMES.find((g) => g.id === playType)!;
    const Icon = meta.icon;
    const title = activeRoom
      ? (isAr && activeRoom.nameAr ? activeRoom.nameAr : activeRoom.name)
      : t(`games.types.${playType}.name`);
    const exit = () => { setActiveRoomId(null); setQuickGame(null); };
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={exit}
          className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("games.backToLobby")}
        </button>

        <Card className="overflow-hidden">
          <div className={cn("flex items-center gap-3 p-4 text-white", meta.gradient)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold">{title}</h2>
              <p className="text-sm opacity-90">{t(`games.types.${playType}.name`)}</p>
            </div>
            {activeRoom && (
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Users className="h-4 w-4" /> {activeRoom.playerIds.length}
              </span>
            )}
          </div>

          <CardContent className="p-5 sm:p-6">
            {playType === "tarneeb" && <TarneebGame />}
            {playType === "chess" && <ChessGame />}
            {playType === "mafia" && <MafiaGame />}
            {playType === "spy" && <SpyGame />}
            {playType === "trivia" && (
              <RealtimeTrivia
                roomId={activeRoom?.id ?? `quick-trivia-${currentUser.id}`}
                self={{ playerId: currentUser.id, name: currentUser.displayName, avatar: currentUser.photos[0] }}
              />
            )}
            {playType === "would_you_rather" && <WouldYouRatherGame />}
            {playType === "never_have_i_ever" && <NeverHaveIEverGame />}
            {playType === "two_truths" && <TwoTruthsGame />}
          </CardContent>
        </Card>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("games.passPhoneHint")}
        </p>
      </div>
    );
  }

  /* --------------------------- Lobby view --------------------------- */
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("games.title")}</h1>
          <p className="text-muted-foreground">{t("games.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-social shrink-0 text-white">
          <Plus className="h-4 w-4" /> {t("games.createRoom")}
        </Button>
      </div>

      {/* Game type quick-play strip */}
      <p className="mb-2 text-sm font-bold text-muted-foreground">{t("games.quickPlay")}</p>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GAMES.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              onClick={() => setQuickGame(g.id)}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white", g.gradient)}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold leading-tight">{t(`games.types.${g.id}.name`)}</span>
            </button>
          );
        })}
      </div>

      {/* Open rooms */}
      <p className="mb-2 text-sm font-bold text-muted-foreground">{t("games.openRooms")}</p>
      {gameRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Gamepad2 className="mb-2 h-10 w-10 text-primary-200" />
          <p className="text-lg font-semibold">{t("games.noRooms")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {gameRooms.map((room) => {
            const meta = GAMES.find((g) => g.id === room.gameType)!;
            const Icon = meta.icon;
            const host = profiles.find((p) => p.id === room.hostId);
            const isJoined = room.playerIds.includes(currentUser.id);
            return (
              <Card key={room.id} className="overflow-hidden">
                <div className={cn("h-1.5 w-full", meta.gradient)} />
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white", meta.gradient)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold leading-tight">
                        {isAr && room.nameAr ? room.nameAr : room.name}
                      </h3>
                      <Badge variant={meta.badgeVariant} className="mt-1">
                        {t(`games.types.${room.gameType}.name`)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {room.playerIds.slice(0, 4).map((id) => {
                          const p = profiles.find((pr) => pr.id === id);
                          if (!p) return null;
                          return (
                            <Avatar key={id} className="h-7 w-7 ring-2 ring-background">
                              <AvatarImage src={p.photos[0]} />
                              <AvatarFallback className="text-[10px]">{initials(p.displayName)}</AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {t("games.playersCount", { count: room.playerIds.length })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isJoined ? (
                      <>
                        <Button size="sm" className="flex-1" onClick={() => setActiveRoomId(room.id)}>
                          {t("games.enterRoom")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => leaveGameRoom(room.id)}>
                          {t("games.leave")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          joinGameRoom(room.id);
                          setActiveRoomId(room.id);
                        }}
                      >
                        {t("games.joinPlay")}
                      </Button>
                    )}
                  </div>

                  {host && (
                    <p className="text-xs text-muted-foreground">
                      {t("games.hostedBy", { name: host.displayName })}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(name, type) => {
          createGameRoom(name, type);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateRoomDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, type: GameType) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [type, setType] = useState<GameType>("trivia");

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), type);
    setName("");
    setType("trivia");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setName(""); setType("trivia"); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("games.createRoom")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("games.roomName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("games.roomNamePlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <Label>{t("games.chooseGame")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setType(g.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 p-3 text-start transition-colors",
                      type === g.id ? "border-primary bg-primary-50" : "border-border hover:bg-secondary"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-white", g.gradient)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold leading-tight">{t(`games.types.${g.id}.name`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            {t("games.createRoom")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
