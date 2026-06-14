import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  CURRENT_USER_ID,
  MOCK_APPRECIATIONS,
  MOCK_CONVERSATIONS,
  MOCK_MATCHES,
  MOCK_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_PROFILES,
} from "@/data/mockData";

import type {
  AppAppreciation,
  AppBlock,
  AppConversation,
  AppMatch,
  AppMessage,
  AppNotification,
  AppProfile,
  AppReport,
} from "@/types/app";

import supabase from "@/lib/supabase"; // ✅ FIX 1: default import (no curly braces)

const STORAGE_KEY = "druze_uae_state_v1";

/* ---------------------- TYPES ---------------------- */

interface PersistedState {
  isAuthenticated: boolean;
  onboardingStep: number;
  onboardingCompleted: boolean;
  currentUser: AppProfile;
  profiles: AppProfile[];
  appreciations: AppAppreciation[];
  matches: AppMatch[];
  conversations: AppConversation[];
  messages: AppMessage[];
  notifications: AppNotification[];
  savedUserIds: string[];
  blocks: AppBlock[];
  reports: AppReport[];
  appreciationsSentToday: number;
}

interface AppContextValue extends PersistedState {
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (email: string, password: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  updateCurrentUser: (patch: Partial<AppProfile>) => void;
  appreciateUser: (userId: string, message?: string) => { matched: boolean };
  saveUser: (userId: string) => void;
  unsaveUser: (userId: string) => void;
  sendMessage: (
    conversationId: string,
    msg: Omit<AppMessage, "id" | "createdAt" | "conversationId">
  ) => void;
  markConversationRead: (conversationId: string) => void;
  acceptMessageRequest: (conversationId: string) => void;
  declineMessageRequest: (conversationId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unmatchUser: (matchId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  reportUser: (userId: string, category: AppReport["category"], details?: string) => void;
  setReaction: (messageId: string, emoji: string) => void;
  adminSetAccountStatus: (userId: string, status: AppProfile["accountStatus"]) => void;
  adminVerify: (userId: string, field: "phoneVerified" | "photoVerified" | "premiumVerified") => void;
  adminResolveReport: (reportId: string, status: AppReport["status"]) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/* ---------------------- LOAD STATE ---------------------- */

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedState;
    }
  } catch {
    // ignore corrupted state
  }
  const currentUser = MOCK_PROFILES.find((p) => p.id === CURRENT_USER_ID)!;
  return {
    isAuthenticated: false,
    onboardingStep: 1,
    onboardingCompleted: false,
    currentUser,
    profiles: MOCK_PROFILES,
    appreciations: MOCK_APPRECIATIONS,
    matches: MOCK_MATCHES,
    conversations: MOCK_CONVERSATIONS,
    messages: MOCK_MESSAGES,
    notifications: MOCK_NOTIFICATIONS,
    savedUserIds: [],
    blocks: [],
    reports: [],
    appreciationsSentToday: 0,
  };
}

/* ---------------------- PROVIDER ---------------------- */

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /* ---------------- SUPABASE AUTH LISTENER ---------------- */

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setState((s) => ({ ...s, isAuthenticated: true }));
        }
      } catch {
        // Supabase not configured (no .env) — fall back to local mock auth state
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState((s) => ({ ...s, isAuthenticated: true }));
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ---------------- AUTH FUNCTIONS ---------------- */

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState((s) => ({ ...s, isAuthenticated: false }));
  };

  /* ---------------- EXISTING FUNCTIONS ---------------- */

  const setOnboardingStep = (step: number) =>
    setState((s) => ({ ...s, onboardingStep: step }));

  const completeOnboarding = () =>
    setState((s) => ({
      ...s,
      onboardingCompleted: true,
      isAuthenticated: true,
      currentUser: { ...s.currentUser, onlineStatus: "online" },
      profiles: s.profiles.map((p) =>
        p.id === s.currentUser.id ? { ...p, ...s.currentUser } : p
      ),
    }));

  const updateCurrentUser = (patch: Partial<AppProfile>) =>
    setState((s) => {
      const updated = { ...s.currentUser, ...patch };
      return {
        ...s,
        currentUser: updated,
        profiles: s.profiles.map((p) => (p.id === updated.id ? updated : p)),
      };
    });

  const appreciateUser = (userId: string, message?: string): { matched: boolean } => {
    let matched = false;
    setState((s) => {
      const reciprocal = s.appreciations.find(
        (a) => a.fromUserId === userId && a.toUserId === s.currentUser.id
      );
      const newAppreciation: AppAppreciation = {
        id: `ap-${Date.now()}`,
        fromUserId: s.currentUser.id,
        toUserId: userId,
        status: reciprocal ? "matched" : "pending",
        message,
        createdAt: new Date().toISOString(),
      };

      let appreciations = [...s.appreciations, newAppreciation];
      let matches = s.matches;
      let conversations = s.conversations;
      let notifications = s.notifications;

      if (reciprocal) {
        matched = true;
        appreciations = appreciations.map((a) =>
          (a.fromUserId === userId && a.toUserId === s.currentUser.id) ||
          (a.fromUserId === s.currentUser.id && a.toUserId === userId)
            ? { ...a, status: "matched" }
            : a
        );

        const shared = sharedInterestCount(s.currentUser, s.profiles.find((p) => p.id === userId)!);
        const compat = Math.min(100, shared * 8 + 35);

        const matchId = `m-${Date.now()}`;
        matches = [
          ...matches,
          {
            id: matchId,
            userAId: s.currentUser.id,
            userBId: userId,
            compatibilityScore: compat,
            status: "active",
            matchedAt: new Date().toISOString(),
          },
        ];

        const existingConv = conversations.find(
          (c) =>
            (c.userAId === s.currentUser.id && c.userBId === userId) ||
            (c.userAId === userId && c.userBId === s.currentUser.id)
        );

        if (existingConv) {
          conversations = conversations.map((c) =>
            c.id === existingConv.id ? { ...c, status: "matched", matchId } : c
          );
        } else {
          conversations = [
            ...conversations,
            {
              id: `c-${Date.now()}`,
              userAId: s.currentUser.id,
              userBId: userId,
              matchId,
              status: "matched",
              lastMessageAt: new Date().toISOString(),
              lastMessagePreview: undefined,
            },
          ];
        }

        notifications = [
          {
            id: `n-${Date.now()}`,
            userId: s.currentUser.id,
            type: "new_match",
            title: "New Match!",
            titleAr: "تطابق جديد!",
            relatedUserId: userId,
            relatedEntityId: matchId,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...notifications,
        ];
      }

      return {
        ...s,
        appreciations,
        matches,
        conversations,
        notifications,
        appreciationsSentToday: s.appreciationsSentToday + 1,
      };
    });
    return { matched };
  };

  const saveUser = (userId: string) =>
    setState((s) => ({
      ...s,
      savedUserIds: Array.from(new Set([...s.savedUserIds, userId])),
    }));

  const unsaveUser = (userId: string) =>
    setState((s) => ({
      ...s,
      savedUserIds: s.savedUserIds.filter((id) => id !== userId),
    }));

  const sendMessage = (
    conversationId: string,
    msg: Omit<AppMessage, "id" | "createdAt" | "conversationId">
  ) =>
    setState((s) => {
      const newMsg: AppMessage = {
        ...msg,
        id: `msg-${Date.now()}`,
        conversationId,
        createdAt: new Date().toISOString(),
      };
      const preview =
        msg.type === "text" ? msg.content?.slice(0, 120) : msg.type === "photo" ? "📷 Photo" : "🎤 Voice note";
      return {
        ...s,
        messages: [...s.messages, newMsg],
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? { ...c, lastMessageAt: newMsg.createdAt, lastMessagePreview: preview } : c
        ),
      };
    });

  const markConversationRead = (conversationId: string) =>
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.conversationId === conversationId && m.senderId !== s.currentUser.id && !m.readAt
          ? { ...m, readAt: new Date().toISOString() }
          : m
      ),
    }));

  const acceptMessageRequest = (conversationId: string) =>
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, status: "matched" } : c
      ),
    }));

  const declineMessageRequest = (conversationId: string) =>
    setState((s) => ({
      ...s,
      conversations: s.conversations.filter((c) => c.id !== conversationId),
    }));

  const markNotificationRead = (id: string) =>
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));

  const markAllNotificationsRead = () =>
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    }));

  const unmatchUser = (matchId: string) =>
    setState((s) => {
      const match = s.matches.find((m) => m.id === matchId);
      return {
        ...s,
        matches: s.matches.map((m) => (m.id === matchId ? { ...m, status: "unmatched" } : m)),
        conversations: match
          ? s.conversations.filter(
              (c) =>
                !(
                  (c.userAId === match.userAId && c.userBId === match.userBId) ||
                  (c.userAId === match.userBId && c.userBId === match.userAId)
                )
            )
          : s.conversations,
      };
    });

  const blockUser = (userId: string) =>
    setState((s) => ({
      ...s,
      blocks: [
        ...s.blocks,
        {
          id: `b-${Date.now()}`, // ✅ FIX 3: proper backtick template literal
          blockerId: s.currentUser.id,
          blockedId: userId,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

  const unblockUser = (userId: string) =>
    setState((s) => ({
      ...s,
      blocks: s.blocks.filter((b) => b.blockedId !== userId),
    }));

  const reportUser = (
    userId: string,
    category: AppReport["category"],
    details?: string
  ) =>
    setState((s) => ({
      ...s,
      reports: [
        ...s.reports,
        {
          id: `r-${Date.now()}`, // ✅ FIX 3: proper backtick template literal
          reporterId: s.currentUser.id,
          reportedUserId: userId,
          category,
          details,
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ],
    }));

  const setReaction = (messageId: string, emoji: string) =>
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              reaction: {
                ...(m.reaction || {}),
                [s.currentUser.id]: emoji,
              },
            }
          : m
      ),
    }));

  const adminSetAccountStatus = (
    userId: string,
    status: AppProfile["accountStatus"]
  ) =>
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === userId ? { ...p, accountStatus: status } : p
      ),
    }));

  const adminVerify = (
    userId: string,
    field: "phoneVerified" | "photoVerified" | "premiumVerified"
  ) =>
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === userId ? { ...p, [field]: true } : p
      ),
    }));

  const adminResolveReport = (reportId: string, status: AppReport["status"]) =>
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) =>
        r.id === reportId ? { ...r, status } : r
      ),
    }));

  /* ---------------- VALUE ---------------- */

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      setOnboardingStep,
      completeOnboarding,
      updateCurrentUser,
      appreciateUser,
      saveUser,
      unsaveUser,
      sendMessage,
      markConversationRead,
      acceptMessageRequest,
      declineMessageRequest,
      markNotificationRead,
      markAllNotificationsRead,
      unmatchUser,
      blockUser,
      unblockUser,
      reportUser,
      setReaction,
      adminSetAccountStatus,
      adminVerify,
      adminResolveReport,
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ---------------- HOOK ---------------- */

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/* ---------------- UTIL ---------------- */

export function sharedInterestCount(a: AppProfile, b: AppProfile): number {
  const setB = new Set(b.interestIds);
  return a.interestIds.filter((i) => setB.has(i)).length;
}