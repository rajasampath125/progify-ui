import { useAuth } from "../auth/useAuth";

function PublicHeader({ onLoginClick }) {
  const { auth } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.logo}>ProgifyTech</div>

      <div style={styles.actions}>
        <a href="/contact" style={styles.link}>Contact Us</a>

        {!auth?.token ? (
          <button style={styles.loginBtn} onClick={onLoginClick}>
            Login
          </button>
        ) : (
          <a href="/candidate/dashboard" style={styles.dashboardBtn}>
            Return to Dashboard
          </a>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: "64px",
    background: "#3b5ccc",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
  },
  logo: { fontSize: "20px", fontWeight: 600 },
  actions: { display: "flex", gap: "16px", alignItems: "center" },
  link: { color: "#fff", textDecoration: "none" },
  loginBtn: {
    background: "#facc15",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
  },
  dashboardBtn: {
    background: "#facc15",
    color: "#000",
    padding: "8px 16px",
    borderRadius: "20px",
    textDecoration: "none",
  },
};

export default PublicHeader;
