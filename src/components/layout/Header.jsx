import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentCandidate } from "../../api/candidateApi";
import { useAuth } from "../../auth/useAuth";
import { getCurrentAdmin } from "../../api/adminApi";
import { getCurrentRecruiter } from "../../api/recruiterApi";

/* ===================== */
/* HeaderNavLink (CUSTOM) */
/* ===================== */
const HeaderNavLink = ({ to, children }) => {
    return (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                color: isActive ? "#a1b7e7" : "#e5e7eb",
                textDecoration: isActive ? "underline" : "none",
                fontSize: "14px",
                fontWeight: 500,
                transition: "color 0.2s ease",
            })}
            onMouseEnter={(e) => {
                e.target.style.color = "#7195e2";
            }}
            onMouseLeave={(e) => {
                if (!e.target.getAttribute("aria-current")) {
                    e.target.style.color = "#e5e7eb";
                }
            }}
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
    ],
    RECRUITER: [
        { label: "Dashboard", path: "/recruiter/dashboard" },
        { label: "Jobs", path: "/recruiter/jobs" },
        { label: "Candidates", path: "/recruiter/candidates" },
        { label: "Analytics", path: "/recruiter/analytics" },
        // { label: "CandidateActivityPage", path: "/recruiter/candidates/:email/activity" },
        
    ],
    ADMIN: [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Jobs", path: "/admin/jobs" },
        { label: "Create Job", path: "/admin/jobs/create" },
        { label: "Job Assignment Report", path: "/admin/job-assignments" },
        { label: "Analytics", path: "/admin/analytics" },
    ],
};

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    /* ===================== */
    /* AUTH + ROLE DETECTION */
    /* ===================== */
    // const authRaw = localStorage.getItem("auth");
    // const auth = authRaw ? JSON.parse(authRaw) : null;
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

    const isAuthPage =
        location.pathname.startsWith("/login")
    //location.pathname.startsWith("/register");

    /* ===================== */
    /* PROFILE (CANDIDATE) */
    /* ===================== */
    const [profile, setProfile] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!role) return;

        const loadProfile = async () => {
            try {
                // ===== CANDIDATE (UNCHANGED) =====
                if (role === "CANDIDATE") {
                    const cached = localStorage.getItem("candidateProfile");
                    if (cached) {
                        setProfile(JSON.parse(cached));
                        return;
                    }
                    const res = await getCurrentCandidate();
                    localStorage.setItem("candidateProfile", JSON.stringify(res.data));
                    setProfile(res.data);
                }
                // ===== ADMIN =====
                if (role === "ADMIN") {
                    const cached = localStorage.getItem("adminProfile");
                    if (cached) {
                        setProfile(JSON.parse(cached));
                        return;
                    }
                    const res = await getCurrentAdmin();
                    localStorage.setItem("adminProfile", JSON.stringify(res.data));
                    setProfile(res.data);
                }
                // ===== RECRUITER (FUTURE-READY) =====
                if (role === "RECRUITER") {
                    const cached = localStorage.getItem("recruiterProfile");
                    if (cached) {
                        setProfile(JSON.parse(cached));
                        return;
                    }
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


    /* ===================== */
    /* LOGOUT */
    /* ===================== */
    const { setAuth } = useAuth();
    const logout = () => {
        // 🔥 CLEAR AUTH CONTEXT (THIS WAS MISSING)
        setAuth(null);

        // clear storage
        localStorage.removeItem("auth");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("candidateProfile");
        localStorage.removeItem("adminProfile");
        localStorage.removeItem("recruiterProfile");

        // redirect to HOME (not login page)
        navigate("/");
    };

    return (
        <header
            style={{
                background: "#5e6a83",
                color: "#fff",
                padding: "14px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            {/* LEFT */}
            <Link
                to="https://www.progifytech.com"
                style={{ display: "flex", alignItems: "center" }}
            >
                <img
                    src="https://www.progifytech.com/assets/images/logo.png"
                    alt="ProgifyTech Logo"
                    style={{ height: "46px" }}
                />
            </Link>

            {/* CENTER NAV */}
            <nav style={{ display: "flex", gap: "16px" }}>
                {!isAuthPage && !loading && auth && role &&
                    MENU_CONFIG[role]?.map((item) => (
                        <HeaderNavLink key={item.path} to={item.path}>
                            {item.label}
                        </HeaderNavLink>
                    ))}
            </nav>


            {/* RIGHT (USER DROPDOWN) */}
            {!isAuthPage && auth && (
                <div style={{ position: "relative" }}>
                    <div
                        onClick={() => setOpen((prev) => !prev)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#facc15",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#1f2937",
                        }}
                    >
                        <div
                            style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "#ffffff",
                                color: "#111827",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                            }}
                        >
                            {profile?.name
                                ? profile.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "U"}
                        </div>
                        <span style={{ fontSize: "13px" }}>
                            {profile?.name || auth?.email || "User"}
                        </span>
                    </div>

                    {open && (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "44px",
                                background: "#3d3d3d",
                                borderRadius: "8px",
                                boxShadow: "0 10px 15px rgba(0,0,0,0.15)",
                                width: "160px",
                                zIndex: 100,
                            }}
                        >
                            {role === "CANDIDATE" && (
                                <div
                                    style={{
                                        padding: "10px 14px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #fafafa",
                                    }}
                                    onClick={() => navigate("/candidate/profile")}
                                >
                                    My Profile
                                </div>
                            )}
                            {role === "ADMIN" && (
                                <div
                                    style={{
                                        padding: "10px 14px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #fafafa",
                                    }}
                                    onClick={() => navigate("/admin/profile")}
                                >
                                    My Profile
                                </div>
                            )}
                            {role === "RECRUITER" && (
                                <div
                                    style={{
                                        padding: "10px 14px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #fafafa",
                                    }}
                                    onClick={() => navigate("/recruiter/profile")}
                                >
                                    My Profile
                                </div>
                            )}

                            <div
                                style={{
                                    padding: "10px 14px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    color: "#fafafa",
                                }}
                                onClick={logout}
                            >
                                Log out
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
