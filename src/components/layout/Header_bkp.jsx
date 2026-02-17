import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getCurrentCandidate } from "../../api/candidateApi";

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

const Header = () => {
    const navigate = useNavigate();

    const authRaw = localStorage.getItem("auth");
    const auth = authRaw ? JSON.parse(authRaw) : null;

    const location = useLocation();

    const roleFromPath =
        location.pathname.startsWith("/candidate")
            ? "CANDIDATE"
            : location.pathname.startsWith("/recruiter")
                ? "RECRUITER"
                : location.pathname.startsWith("/admin")
                    ? "ADMIN"
                    : null;

    const role = auth?.role || roleFromPath;

    const logout = () => {
        localStorage.removeItem("auth");
        localStorage.removeItem("currentUser");
        navigate("/login/candidate");
    };

    const [profile, setProfile] = useState(null);
    const [open, setOpen] = useState(false);

    // useEffect(() => {
    //     getCurrentCandidate()
    //         .then((res) => setProfile(res.data))
    //         .catch(() => { });
    // }, []);

    useEffect(() => {
        const cachedProfile = localStorage.getItem("candidateProfile");

        if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
            return;
        }

        getCurrentCandidate()
            .then((res) => {
                setProfile(res.data);
                localStorage.setItem(
                    "candidateProfile",
                    JSON.stringify(res.data)
                );
            })
            .catch(() => { });
    }, []);


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
                    style={{ height: "36px" }}
                />
            </Link>

            {/* CENTER NAV */}
            <nav style={{ display: "flex", gap: "16px" }}>
                {role === "CANDIDATE" && (
                    <>
                        <HeaderNavLink to="/candidate/dashboard">
                            Dashboard
                        </HeaderNavLink>
                        <HeaderNavLink to="/candidate/jobs">
                            Available Jobs
                        </HeaderNavLink>
                        <HeaderNavLink to="/candidate/jobs/history">
                            All Jobs
                        </HeaderNavLink>
                    </>
                )}

                {role === "RECRUITER" && (
                    <>
                        <HeaderNavLink to="/recruiter/dashboard">
                            Dashboard
                        </HeaderNavLink>
                        <HeaderNavLink to="/recruiter/jobs">
                            Jobs
                        </HeaderNavLink>
                    </>
                )}

                {role === "ADMIN" && (
                    <HeaderNavLink to="/admin/dashboard">
                        Admin
                    </HeaderNavLink>
                )}
            </nav>

            {/* RIGHT */}
            <div style={{ position: "relative" }}>
                <div
                    onClick={() =>
                        setOpen((prev) => !prev)
                    }
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
                        {profile?.name || "User"}
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
                        <div
                            style={{
                                padding: "10px 14px",
                                fontSize: "14px",
                                cursor: "pointer",
                                borderBottom: "1px solid #fafafa",
                            }}
                            onClick={() =>
                                navigate("/candidate/profile")
                            }
                        >
                            My Profile
                        </div>

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

        </header>
    );
};

export default Header;
