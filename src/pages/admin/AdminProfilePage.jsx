import { useEffect, useState } from "react";
import { getCurrentAdmin, updateAdminProfile } from "../../api/adminApi";

const AdminProfilePage = () => {
    const [original, setOriginal] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await getCurrentAdmin();

            setOriginal(res.data);
            setName(res.data.name || "");
            setEmail(res.data.email || "");
            setRole(res.data.role || "");
        } catch (err) {
            if (err?.response?.status !== 401) {
                setMessage({
                    type: "error",
                    text: "Failed to load admin profile",
                });
            }
        }
        finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            await updateAdminProfile({ name });

            setOriginal({ ...original, name });
            setMessage({ type: "success", text: "Profile updated successfully" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(original?.name || "");
        setMessage(null);
    };

    if (loading) {
        return <p>Loading profile...</p>;
    }

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
                <h2 style={{ marginBottom: "20px" }}>Admin Account</h2>

                {/* MESSAGE */}
                {message && (
                    <div
                        style={{
                            marginBottom: "16px",
                            color: message.type === "error" ? "red" : "green",
                        }}
                    >
                        {message.text}
                    </div>
                )}

                {/* NAME */}
                <div style={{ marginBottom: "16px" }}>
                    <label>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                {/* EMAIL */}
                <div style={{ marginBottom: "16px" }}>
                    <label>Email</label>
                    <input
                        value={email}
                        disabled
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                {/* ROLE */}
                <div style={{ marginBottom: "24px" }}>
                    <label>Role</label>
                    <input
                        value={role}
                        disabled
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                {/* ACTIONS */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>

                    <button onClick={handleCancel} disabled={saving}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
