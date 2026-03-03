import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCurrentCandidate } from "../../api/candidateApi";
import { useAuth } from "../../auth/useAuth";
import { getCurrentAdmin } from "../../api/adminApi";
import { getCurrentRecruiter } from "../../api/recruiterApi";
import { LogOut, User, ChevronDown } from "lucide-react";
import { logoutAndClear } from "../../api/axios";
import clouvrLogo from "../../images/clouvr-logo1.webp";

/* ===================== */
/* HeaderNavLink (CUSTOM) */
/* ===================== */
const HeaderNavLink = ({ to, children }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `text-sm font-medium transition-colors px-3 py-2 rounded-md ${isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
            }
        >
            {children}
        </NavLink>
    );
};

/* ===================== */
/* MENU CONFIG (ROLE BASED) */
/* ===================== */
const MENU_CONFIG = {
    CANDIDATE: [
        { label: "Dashboard", path: "/candidate/dashboard" },
        { label: "Available Jobs", path: "/candidate/jobs" },
        { label: "All Jobs", path: "/candidate/jobs/history" },
        { label: "Calendar", path: "/candidate/calendar" },
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
        { label: "Jobs", path: "/admin/jobs" },
        { label: "Create Job", path: "/admin/jobs/create" },
        { label: "Job Assignment Report", path: "/admin/job-assignments" },
        { label: "Analytics", path: "/admin/analytics" },
        { label: "Calendar", path: "/admin/calendar" },
    ],
};

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    /* ===================== */
    /* AUTH + ROLE DETECTION */
    /* ===================== */
    const { auth, loading } = useAuth();

    const roleFromPath =
        location.pathname.startsWith("/candidate")
            ? "CANDIDATE"
            : location.pathname.startsWith("/recruiter")
                ? "RECRUITER"
                : location.pathname.startsWith("/admin")
                    ? "ADMIN"
                    : null;

    const role = auth?.role || roleFromPath;

    const isAuthPage = location.pathname.startsWith("/login");

    /* ===================== */
    /* PROFILE LOADING      */
    /* ===================== */
    const [profile, setProfile] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!role) return;

        const loadProfile = async () => {
            try {
                if (role === "CANDIDATE") {
                    const cached = localStorage.getItem("candidateProfile");
                    if (cached) return setProfile(JSON.parse(cached));
                    const res = await getCurrentCandidate();
                    localStorage.setItem("candidateProfile", JSON.stringify(res.data));
                    setProfile(res.data);
                }
                if (role === "ADMIN") {
                    const cached = localStorage.getItem("adminProfile");
                    if (cached) return setProfile(JSON.parse(cached));
                    const res = await getCurrentAdmin();
                    localStorage.setItem("adminProfile", JSON.stringify(res.data));
                    setProfile(res.data);
                }
                if (role === "RECRUITER") {
                    const cached = localStorage.getItem("recruiterProfile");
                    if (cached) return setProfile(JSON.parse(cached));
                    const res = await getCurrentRecruiter();
                    localStorage.setItem("recruiterProfile", JSON.stringify(res.data));
                    setProfile(res.data);
                }
            } catch (err) {
                console.error("Failed to load header profile", err);
            }
        };
        loadProfile();
    }, [role]);

    // Close dropdown on route change
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ===================== */
    /* LOGOUT */
    /* ===================== */
    const { setAuth } = useAuth();
    const logout = () => {
        // Revokes the refresh token server-side, then clears storage & redirects
        logoutAndClear();
        setAuth(null);
    };

    const userInitials = profile?.name
        ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
        : "U";

    const userName = profile?.name || auth?.email?.split('@')[0] || "User";

    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    return (
        <>
            <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* LEFT: LOGO */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="https://www.clouvr.com" className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl shadow-inner hover:bg-slate-800 transition-colors">
                                <img
                                    src={clouvrLogo}
                                    alt="Clouvr Logo"
                                    className="h-8 w-auto sm:h-10"
                                />
                            </Link>
                        </div>

                        {/* CENTER NAV */}
                        <nav className="hidden md:flex flex-1 justify-center space-x-2">
                            {!isAuthPage && !loading && auth && role &&
                                MENU_CONFIG[role]?.map((item) => (
                                    <HeaderNavLink key={item.path} to={item.path}>
                                        {item.label}
                                    </HeaderNavLink>
                                ))}

                            {/* Global Links — only for non-authenticated visitors */}
                            {!isAuthPage && !auth && (
                                <HeaderNavLink to="/contact">
                                    Contact Us
                                </HeaderNavLink>
                            )}
                        </nav>

                        {/* RIGHT: USER DROPDOWN */}
                        <div className="flex items-center gap-4">
                            {!isAuthPage && auth && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setOpen((prev) => !prev)}
                                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition px-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                                            {userInitials}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                                            {userName}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                                    </button>

                                    {open && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm text-gray-500">Signed in as</p>
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {auth?.email || userName}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setOpen(false);
                                                    navigate(`/${role.toLowerCase()}/profile`);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                            >
                                                <User className="w-4 h-4 text-gray-400" />
                                                My Profile
                                            </button>

                                            <button
                                                onClick={() => setShowLogoutPopup(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 text-red-500" />
                                                Log out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutPopup && (
                <div className="relative z-[100]">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <LogOut className="h-6 w-6 text-red-500" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Sign out</h3>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>Are you sure you want to sign out?</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        onClick={() => {
                                            setShowLogoutPopup(false);
                                            logout();
                                        }}
                                    >
                                        Yes, sign out
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setShowLogoutPopup(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
