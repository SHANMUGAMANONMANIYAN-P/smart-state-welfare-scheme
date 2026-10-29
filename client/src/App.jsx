import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import SchemeChatbot from './components/SchemeChatbot';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Citizen Pages (Inside AppLayout)
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import ProfilePage from './pages/ProfilePage';
import CheckEligibilityPage from './pages/CheckEligibilityPage';
import RecommendedSchemesPage from './pages/RecommendedSchemesPage';
import { ExploreSchemesPage } from './pages/ExploreSchemesPage';
import { SavedSchemesPage } from './pages/SavedSchemesPage';
import EvaluationHistoryPage from './pages/EvaluationHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import HelpPage from './pages/HelpPage';

// Administrator Pages (Inside AppLayout)
import AdminDashboardOverview from './pages/admin/AdminDashboardOverview';
import AdminSchemesPage from './pages/admin/AdminSchemesPage';
import AdminImportPage from './pages/admin/AdminImportPage';
import AdminCriteriaPage from './pages/admin/AdminCriteriaPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminCitizensPage from './pages/admin/AdminCitizensPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Public Home & Authentication Entry Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Authenticated Application with Left Sidebar & Top Navbar */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['citizen', 'admin']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Citizen Routes */}
          <Route path="/dashboard" element={<CitizenDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/check-eligibility" element={<CheckEligibilityPage />} />
          <Route path="/recommended" element={<RecommendedSchemesPage />} />
          <Route path="/schemes" element={<ExploreSchemesPage />} />
          <Route path="/saved-schemes" element={<SavedSchemesPage />} />
          <Route path="/history" element={<EvaluationHistoryPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<HelpPage />} />

          {/* Administrator Protected Routes (Role: admin only) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schemes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSchemesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/criteria"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCriteriaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/citizens"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCitizensPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Floating Scheme Assistant Chatbot across the application */}
      <SchemeChatbot />
    </AuthProvider>
    </LanguageProvider>
  );
}
