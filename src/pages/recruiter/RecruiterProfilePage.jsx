import { useEffect, useState } from "react";
import { getCurrentRecruiter } from "../../api/recruiterApi";

const RecruiterProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getCurrentRecruiter();
      setProfile(res.data);
    } catch (err) {
      setError("Failed to load recruiter profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Recruiter Account</h2>

        {/* NAME */}
        <div style={{ marginBottom: "16px" }}>
          <label>Name</label>
          <input
            value={profile?.name || ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* EMAIL */}
        <div style={{ marginBottom: "16px" }}>
          <label>Email</label>
          <input
            value={profile?.email || ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* ROLE */}
        <div style={{ marginBottom: "16px" }}>
          <label>Role</label>
          <input
            value={profile?.role || ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          Contact an administrator to update your account details.
        </p>
      </div>
    </div>
  );
};

export default RecruiterProfilePage;
