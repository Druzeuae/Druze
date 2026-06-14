import type { ReactNode } from "react";
import LoginPage from "./pages/LoginPage";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/AppShell";

import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DiscoverPage from "@/pages/DiscoverPage";
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

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, onboardingCompleted } = useApp();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();

  if (!currentUser?.isAdmin) return <Navigate to="/discover" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, onboardingCompleted } = useApp();

  return (
    <Routes>
      {/* 🟢 الصفحة الرئيسية */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            onboardingCompleted ? (
              <Navigate to="/discover" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          ) : (
            <AuthPage />
          )
        }
      />

      {/* 🟢 Login page (NEW) */}
      <Route path="/login" element={<LoginPage />} />

      {/* 🟢 Onboarding */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* 🟢 Protected App */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/premium" element={<PremiumPage />} />

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
      <Toaster />
    </AppProvider>
  );
}