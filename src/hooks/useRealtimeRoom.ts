import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";

export interface PresencePlayer {
  playerId: string;
  name: string;
  avatar?: string;
}

interface Options {
  roomId: string;
  self: PresencePlayer;
  /** Called for every broadcast game event (including our own echoes are filtered out). */
  onEvent?: (type: string, data: unknown, from: string) => void;
}

/**
 * Realtime presence + broadcast for a game room, built on Supabase Realtime.
 *
 * - `players` is the live roster (presence) in the room.
 * - `hostId` is elected deterministically as the smallest playerId present, so
 *   every client agrees on the host with no server. The host owns authoritative
 *   game state and broadcasts it; others send actions back to the host.
 * - `send(type, data)` broadcasts a game event to everyone in the room.
 */
export function useRealtimeRoom({ roomId, self, onEvent }: Options) {
  const [players, setPlayers] = useState<PresencePlayer[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const teardownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const selfRef = useRef(self);
  selfRef.current = self;

  useEffect(() => {
    // Cancel any pending teardown from StrictMode's simulated unmount so we
    // reuse the live channel instead of churning it.
    if (teardownRef.current) {
      clearTimeout(teardownRef.current);
      teardownRef.current = null;
    }

    if (!channelRef.current) {
      const channel = supabase.channel(`game-room:${roomId}`, {
        config: { presence: { key: self.playerId } },
      });

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresencePlayer>();
        const list = Object.values(state)
          .map((entries) => entries[0])
          .filter(Boolean)
          .sort((a, b) => a.playerId.localeCompare(b.playerId));
        setPlayers(list);
      });

      channel.on("broadcast", { event: "game" }, ({ payload }) => {
        const { type, data, from } = payload as { type: string; data: unknown; from: string };
        if (from === selfRef.current.playerId) return; // ignore our own echo
        onEventRef.current?.(type, data, from);
      });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(selfRef.current);
          setConnected(true);
        }
      });

      channelRef.current = channel;
    }

    return () => {
      // Defer teardown so a StrictMode/HMR remount can cancel it above.
      teardownRef.current = setTimeout(() => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        teardownRef.current = null;
        setConnected(false);
      }, 200);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, self.playerId]);

  const send = useCallback(
    (type: string, data: unknown) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "game",
        payload: { type, data, from: self.playerId },
      });
    },
    [self.playerId]
  );

  const hostId = players.length > 0 ? players[0].playerId : self.playerId;
  const isHost = hostId === self.playerId;

  return { players, connected, send, hostId, isHost };
}

/** Stable per-tab identity for a room, so reconnects keep the same player. */
export function usePlayerIdentity(roomId: string): string {
  const ref = useRef<string>("");
  if (!ref.current) {
    const key = `druze_player_${roomId}`;
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      sessionStorage.setItem(key, id);
    }
    ref.current = id;
  }
  return ref.current;
}
