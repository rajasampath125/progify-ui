/*WHY THIS EXISTS??
Single place for auth checks later
Prevents rewriting routes
Keeps routing declarative

ProtectedRoute now accepts allowedRoles
Blocks users with wrong role
Redirects to /unauthorized
Still no JWT parsing
Still no API calls
*/

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute({ allowedRoles }) {
  const { auth, loading } = useAuth();

  // Wait until auth is loaded
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!auth) {
    if ( allowedRoles?.includes("CANDIDATE") ) {
      return <Navigate to="/login/candidate" replace />;
    }else if( allowedRoles?.includes("ADMIN") || allowedRoles?.includes("RECRUITER") ){
      return <Navigate to="/login/internal" replace />;
    }else
    // return <Navigate to="/login/internal" replace />;
    return <Navigate to="/" replace />;
  }

  // Logged in but role not allowed
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // REQUIRED FOR NESTED ROUTES -- for changes in AppRoutes
  return <Outlet />;
}





/* 
- Your current version:
export function ProtectedRoute({ children, allowedRoles }) {
  ...
  return children;
}

- this works when we use AppRoutes_bkp.jsx style

This only works when you use it like this:
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardPage />
    </ProtectedRoute>
  }
/>

import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute({ children, allowedRoles }) {
  const { auth, loading } = useAuth();

  // Wait until auth is loaded
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in → redirect based on expected role
  if (!auth) {
    if (allowedRoles && allowedRoles.includes("CANDIDATE")) {
      return <Navigate to="/login/candidate" replace />;
    }
    return <Navigate to="/login/internal" replace />;
  }

  // Logged in but role not allowed
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

*/

