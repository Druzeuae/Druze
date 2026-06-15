import type { ReactNode } from "react";
import LoginPage from "./pages/LoginPage";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/AppShell";
import { RegisterWall, RegisterGate } from "@/components/common/RegisterPrompt";

import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DiscoverPage from "@/pages/DiscoverPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import GamesPage from "@/pages/GamesPage";
import CommunityHubPage from "@/pages/CommunityHubPage";
import MajlisPage from "@/pages/MajlisPage";
import MomentsPage from "@/pages/MomentsPage";
import VillagesPage from "@/pages/VillagesPage";
import MatteCirclesPage from "@/pages/MatteCirclesPage";
import MatchesPage from "@/pages/MatchesPage";
import ChatPage from "@/pages/ChatPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEditPage from "@/pages/ProfileEditPage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import PremiumPage from "@/pages/PremiumPage";
import AdminPage from "@/pages/admin/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";

/** Members-only: guests see an inline register gate (keeping the shell + nav). */
function RequireAuth({ children, titleKey, bodyKey }: { children: ReactNode; titleKey?: string; bodyKey?: string }) {
  const { isAuthenticated, onboardingCompleted } = useApp();

  if (!isAuthenticated) return <RegisterGate titleKey={titleKey} bodyKey={bodyKey} />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser, isAuthenticated } = useApp();

  if (!isAuthenticated || !currentUser?.isAdmin) return <Navigate to="/discover" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, onboardingCompleted } = useApp();

  return (
    <Routes>
      {/* 🟢 Landing → straight into the app (guests welcome) */}
      <Route
        path="/"
        element={
          isAuthenticated && !onboardingCompleted ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Navigate to="/discover" replace />
          )
        }
      />

      {/* 🟢 Sign up / Log in (only when the visitor chooses to) */}
      <Route
        path="/auth"
        element={
          isAuthenticated && onboardingCompleted ? <Navigate to="/discover" replace /> : <AuthPage />
        }
      />
      <Route path="/login" element={<LoginPage />} />

      {/* 🟢 Onboarding */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* 🟢 App shell — open to everyone; members-only pages gated inside */}
      <Route element={<AppShell />}>
        {/* Open to guests (explore freely) */}
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/community" element={<CommunityHubPage />} />
        <Route path="/community/majlis" element={<MajlisPage />} />
        <Route path="/community/moments" element={<MomentsPage />} />
        <Route path="/community/villages" element={<VillagesPage />} />
        <Route path="/community/matte" element={<MatteCirclesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Members only (guests see a register gate) */}
        <Route
          path="/matches"
          element={<RequireAuth titleKey="guest.gateMatchesTitle" bodyKey="guest.gateMatchesBody"><MatchesPage /></RequireAuth>}
        />
        <Route path="/chat" element={<RequireAuth titleKey="guest.gateChatTitle" bodyKey="guest.gateChatBody"><ChatPage /></RequireAuth>} />
        <Route path="/chat/:conversationId" element={<RequireAuth titleKey="guest.gateChatTitle" bodyKey="guest.gateChatBody"><ChatPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><ProfileEditPage /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth titleKey="guest.gateProfileTitle" bodyKey="guest.gateProfileBody"><PublicProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/premium" element={<RequireAuth><PremiumPage /></RequireAuth>} />

        {/* 🟢 Admin */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Route>

      {/* 🟢 Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
      <RegisterWall />
      <Toaster />
    </AppProvider>
  );
}