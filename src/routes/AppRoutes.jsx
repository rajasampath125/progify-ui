import { Routes, Route, Navigate } from "react-router-dom";
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

export function AppRoutes() {
  return (
    <Routes>

      {/* ======================= ROOT ======================= */}

      {/* <Route path="/" element={<Navigate to="/login/candidate" replace />} /> */}
      <Route path="/" element={<HomePage />} />
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
        </Route>

        {/* -------- RECRUITER -------- */}
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
          <Route path="candidates/:id" element={<RecruiterCandidateViewPage />} />
          <Route path="analytics" element={<RecruiterAnalyticsPage />} />
          <Route path="candidates/:email/activity" element={<RecruiterCandidateActivityPage />}
          />

          <Route
            path="jobs/:id/candidates"
            element={<RecruiterJobCandidatesPage />}
          />
        </Route>

      </Route>

      {/* ======================= FALLBACKS ======================= */}
      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      <Route path="*" element={<div>Not Found</div>} />

    </Routes>
  );
}
