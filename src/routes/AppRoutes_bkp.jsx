//Working for CANDIDATE ROLE V1.0--have this in git 

//import { Routes, Route, Navigate } from "react-router-dom";
// import { ProtectedRoute } from "./ProtectedRoute";

// import CandidateLoginPage from "../pages/CandidateLoginPage";
// import InternalLoginPage from "../pages/InternalLoginPage";

// import CandidateJobsPage from "../pages/candidate/CandidateJobsPage";
// import CandidateJobHistoryPage from "../pages/candidate/CandidateJobHistoryPage";
// import CandidateDashboardPage from "../pages/candidate/CandidateDashboardPage";
// import CandidateProfilePage from "../pages/candidate/CandidateProfilePage";

// import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
// import AdminJobsPage from "../pages/admin/AdminJobsPage";
// import AdminJobCreatePage from "../pages/admin/AdminJobCreatePage";
// import AdminUsersPage from "../pages/admin/AdminUsersPage";
// import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";

// import RecruiterDashboardPage from "../pages/recruiter/RecruiterDashboardPage";
// import RecruiterJobCreatePage from "../pages/recruiter/RecruiterJobCreatePage";
// import RecruiterJobsPage from "../pages/recruiter/RecruiterJobsPage";
// import RecruiterJobCandidatesPage from "../pages/recruiter/RecruiterJobCandidatesPage";

// import MainLayout from "../components/layout/MainLayout";

// export function AppRoutes() {
//   return (
//     <Routes>

//       {/* ======================= ROOT ======================= */}
      
//       <Route path="/" element={<Navigate to="/login/candidate" replace />} />

//       {/* ======================= LOGIN ======================= */}
//       <Route path="/login/candidate" element={<CandidateLoginPage />} />
//       <Route path="/login/internal" element={<InternalLoginPage />} />

//       {/* ======================= CANDIDATE (WITH LAYOUT) ======================= */}
//       <Route
//         path="/candidate"
//         element={
//           <ProtectedRoute role="CANDIDATE">
//             <MainLayout />
//           </ProtectedRoute>
//         }
//       >
//         <Route path="profile" element={<CandidateProfilePage />} />
//         <Route path="dashboard" element={<CandidateDashboardPage />} />
//         <Route path="jobs" element={<CandidateJobsPage />} />
//         <Route path="jobs/history" element={<CandidateJobHistoryPage />} />
//       </Route>

//       {/* ======================= ADMIN ======================= */}
//       <Route
//         path="/admin/dashboard"
//         element={
//           <ProtectedRoute role="ADMIN">
//             <AdminDashboardPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/jobs"
//         element={
//           <ProtectedRoute role="ADMIN">
//             <AdminJobsPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/jobs/create"
//         element={
//           <ProtectedRoute role="ADMIN">
//             <AdminJobCreatePage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/users"
//         element={
//           <ProtectedRoute role="ADMIN">
//             <AdminUsersPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/categories"
//         element={
//           <ProtectedRoute role="ADMIN">
//             <AdminCategoriesPage />
//           </ProtectedRoute>
//         }
//       />

//       {/* ======================= RECRUITER ======================= */}
//       <Route
//         path="/recruiter/dashboard"
//         element={
//           <ProtectedRoute role="RECRUITER">
//             <RecruiterDashboardPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/recruiter/jobs"
//         element={
//           <ProtectedRoute role="RECRUITER">
//             <RecruiterJobsPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/recruiter/jobs/create"
//         element={
//           <ProtectedRoute role="RECRUITER">
//             <RecruiterJobCreatePage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/recruiter/jobs/:id/candidates"
//         element={
//           <ProtectedRoute role="RECRUITER">
//             <RecruiterJobCandidatesPage />
//           </ProtectedRoute>
//         }
//       />

//       {/* ======================= FALLBACKS ======================= */}
//       <Route path="/unauthorized" element={<div>Unauthorized</div>} />
//       <Route path="*" element={<div>Not Found</div>} />

//     </Routes>
//   );
// }
