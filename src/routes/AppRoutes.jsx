import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import CandidateLoginPage from "../pages/CandidateLoginPage";
import InternalLoginPage from "../pages/InternalLoginPage";

import CandidateJobsPage from "../pages/candidate/CandidateJobsPage";
import CandidateJobHistoryPage from "../pages/candidate/CandidateJobHistoryPage";
import CandidateDashboardPage from "../pages/candidate/CandidateDashboardPage";
import CandidateProfilePage from "../pages/candidate/CandidateProfilePage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminJobsPage from "../pages/admin/AdminJobsPage";
import AdminJobCreatePage from "../pages/admin/AdminJobCreatePage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminJobAssigmentReportPage from "../pages/admin/AdminJobAssigmentReportPage";
import AdminAnalyticsDashboardPage from "../pages/admin/AdminAnalyticsDashboardPage";
import AdminExpensesPage from "../pages/admin/AdminExpensesPage";

import RecruiterDashboardPage from "../pages/recruiter/RecruiterDashboardPage";
import RecruiterJobCreatePage from "../pages/recruiter/RecruiterJobCreatePage";
import RecruiterJobsPage from "../pages/recruiter/RecruiterJobsPage";
import RecruiterJobCandidatesPage from "../pages/recruiter/RecruiterJobCandidatesPage";
import RecruiterProfilePage from "../pages/recruiter/RecruiterProfilePage";
import RecruiterCandidatesPage from "../pages/recruiter/RecruiterCandidatesPage";
import RecruiterCandidateViewPage from "../pages/recruiter/RecruiterCandidateViewPage";
import RecruiterAnalyticsPage from "../pages/recruiter/RecruiterAnalyticsPage";
import RecruiterCandidateActivityPage from "../pages/recruiter/RecruiterCandidateActivityPage";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";

import CalendarPage from "../pages/shared/CalendarPage";

export function AppRoutes() {
  return (
    <Routes>

      {/* ======================= ROOT ======================= */}

      {/* <Route path="/" element={<Navigate to="/login/candidate" replace />} /> */}
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login/candidate" element={<HomePage />} />

      {/* ======================= LOGIN ======================= */}
      {/* <Route path="/login/candidate" element={<CandidateLoginPage />} /> */}
      <Route path="/login/internal" element={<InternalLoginPage />} />




      {/* ======================= APP (WITH LAYOUT) ======================= */}
      <Route element={<MainLayout />}>

        {/* -------- CANDIDATE -------- */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute role="CANDIDATE" />
          }
        >
          <Route path="dashboard" element={<CandidateDashboardPage />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="jobs" element={<CandidateJobsPage />} />
          <Route path="jobs/history" element={<CandidateJobHistoryPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>

        {/* -------- ADMIN -------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN" />
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="jobs/create" element={<AdminJobCreatePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="job-assignments" element={<AdminJobAssigmentReportPage />} />
          <Route path="analytics" element={<AdminAnalyticsDashboardPage />} />
          <Route path="expenses" element={<AdminExpensesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>

        {/* -------- RECRUITER -------- */}
        {/* RecruiterDataProvider uses a module-level singleton cache - all instances share data */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="RECRUITER" />
          }
        >
          <Route path="dashboard" element={<RecruiterDashboardPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="jobs/create" element={<RecruiterJobCreatePage />} />
          <Route path="profile" element={<RecruiterProfilePage />} />
          <Route path="candidates" element={<RecruiterCandidatesPage />} />
          <Route path="candidates/:id/view" element={<RecruiterCandidateViewPage />} />
          <Route path="candidates/:id/activity" element={<RecruiterCandidateActivityPage />} />
          <Route path="analytics" element={<RecruiterAnalyticsPage />} />
          <Route path="jobs/:id/candidates" element={<RecruiterJobCandidatesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>

      </Route>

      {/* ======================= FALLBACKS ======================= */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-6">You don't have permission to view this page.</p>
          <a href="/" className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">Go Home</a>
        </div>
      } />
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
          <a href="/" className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">Go Home</a>
        </div>
      } />

    </Routes>
  );
}
