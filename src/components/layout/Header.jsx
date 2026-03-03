import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCurrentCandidate } from "../../api/candidateApi";
import { useAuth } from "../../auth/useAuth";
import { getCurrentAdmin } from "../../api/adminApi";
import { getCurrentRecruiter } from "../../api/recruiterApi";
import { LogOut, User, ChevronDown, AlertCircle } from "lucide-react";
import { logoutAndClear } from "../../api/axios";
import clouvrLogo from "../../images/clouvr-logo1.webp";

// ── Nav link ──────────────────────────────────────────────────────────────────
const HeaderNavLink = ({ to, children, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `text-[15px] font-semibold transition-all px-4 py-2 rounded-xl flex items-center justify-center ${isActive
        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`
    }
  >
    {children}
  </NavLink>
);

// ── Role-based nav config ─────────────────────────────────────────────────────
const MENU_CONFIG = {
  CANDIDATE: [
    { label: "Dashboard", path: "/candidate/dashboard", end: true },
    { label: "Available Jobs", path: "/candidate/jobs", end: true },
    { label: "All Jobs", path: "/candidate/jobs/history", end: false },
    { label: "Calendar", path: "/candidate/calendar", end: true },
  ],
  RECRUITER: [
    { label: "Dashboard", path: "/recruiter/dashboard" },
    { label: "Jobs", path: "/recruiter/jobs" },
    { label: "Candidates", path: "/recruiter/candidates" },
    { label: "Analytics", path: "/recruiter/analytics" },
    { label: "Calendar", path: "/recruiter/calendar" },
  ],
  ADMIN: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Analytics", path: "/admin/analytics" },
    { label: "Jobs", path: "/admin/jobs" },
    { label: "Create Job", path: "/admin/jobs/create" },
    { label: "Assignments", path: "/admin/job-assignments" },
    { label: "Calendar", path: "/admin/calendar" },
    { label: "Expenses", path: "/admin/expenses" },
  ],
};

// ── Role badge colours ────────────────────────────────────────────────────────
const ROLE_BADGE = {
  ADMIN: "bg-red-100 text-red-700",
  RECRUITER: "bg-violet-100 text-violet-700",
  CANDIDATE: "bg-indigo-100 text-indigo-700",
};

// ─────────────────────────────────────────────────────────────────────────────
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const { auth, loading, setAuth } = useAuth();

  const roleFromPath = location.pathname.startsWith("/candidate")
    ? "CANDIDATE"
    : location.pathname.startsWith("/recruiter")
      ? "RECRUITER"
      : location.pathname.startsWith("/admin")
        ? "ADMIN"
        : null;

  const role = auth?.role || roleFromPath;
  const isAuthPage = location.pathname.startsWith("/login");

  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!role) return;
    const loadProfile = async () => {
      try {
        const cacheKey = `${role.toLowerCase()}Profile`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return setProfile(JSON.parse(cached));

        let res;
        if (role === "CANDIDATE") res = await getCurrentCandidate();
        if (role === "ADMIN") res = await getCurrentAdmin();
        if (role === "RECRUITER") res = await getCurrentRecruiter();
        if (res) {
          localStorage.setItem(cacheKey, JSON.stringify(res.data));
          setProfile(res.data);
        }
      } catch (e) {
        console.error("Header profile load failed", e);
      }
    };
    loadProfile();
  }, [role]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = () => {
    logoutAndClear();
    setAuth(null);
  };

  const userInitials = profile?.name
    ? profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : (auth?.email?.[0]?.toUpperCase() ?? "U");

  const userName = profile?.name || auth?.email?.split("@")[0] || "User";

  return (
    <>
      <header className="bg-slate-900 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to={!isAuthPage && role ? `/${role.toLowerCase()}/dashboard` : "/"}
                className="flex items-center gap-2 group transition-opacity hover:opacity-90"
              >
                <img
                  src={clouvrLogo}
                  alt="ClouVR Logo"
                  className="h-8 w-auto sm:h-9 drop-shadow-sm group-hover:scale-105 transition-transform"
                />
              </Link>
            </div>

            {/* Center Nav */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-1.5">
              {!isAuthPage &&
                !loading &&
                auth &&
                role &&
                MENU_CONFIG[role]?.map((item) => (
                  <HeaderNavLink key={item.path} to={item.path} end={item.end}>
                    {item.label}
                  </HeaderNavLink>
                ))}
              {!isAuthPage && !auth && (
                <HeaderNavLink to="/contact">Contact Us</HeaderNavLink>
              )}
            </nav>

            {/* Right: user dropdown */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {!isAuthPage && auth && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen((p) => !p)}
                    className="flex items-center justify-between min-w-[140px] max-w-[200px] bg-slate-800 hover:bg-slate-700 border border-slate-700 pl-1.5 pr-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        {userInitials}
                      </div>
                      <span className="text-sm font-semibold text-slate-200 truncate hidden sm:block">
                        {userName}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 ml-1.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-white" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                      {/* User info card */}
                      <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                            {userInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {userName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {auth?.email}
                            </p>
                          </div>
                        </div>
                        {role && (
                          <span
                            className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_BADGE[role] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {role}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate(`/${role?.toLowerCase()}/profile`);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        My Profile
                      </button>

                      <div className="h-px bg-slate-100 my-1 mx-3" />

                      <button
                        onClick={() => {
                          setOpen(false);
                          setShowLogoutPopup(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Logout confirmation modal ─────────────────────────────── */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowLogoutPopup(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Sign out?
              </h3>
              <p className="text-sm text-slate-500 mb-7">
                You'll be logged out of your account and redirected to the home
                page.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutPopup(false);
                    logout();
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
