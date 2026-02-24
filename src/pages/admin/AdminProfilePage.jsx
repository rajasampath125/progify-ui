import { useEffect, useState } from "react";
import { getCurrentAdmin, updateAdminProfile } from "../../api/adminApi";
import { User, Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";

const AdminProfilePage = () => {
    const [original, setOriginal] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await getCurrentAdmin();
            setOriginal(res.data);
            setName(res.data.name || "");
            setEmail(res.data.email || "");
            setRole(res.data.role || "");
        } catch (err) {
            if (err?.response?.status !== 401)
                setMessage({ type: "error", text: "Failed to load profile" });
        } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true); setMessage(null);
            await updateAdminProfile({ name });
            setOriginal({ ...original, name });
            setMessage({ type: "success", text: "Profile updated successfully" });
        } catch { setMessage({ type: "error", text: "Failed to update profile" }); }
        finally { setSaving(false); }
    };

    const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "A";

    return (
        <div className="max-w-lg mx-auto py-10 px-4 sm:px-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
                {/* Avatar row */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {loading ? "…" : initials}
                    </div>
                    <div>
                        <p className="text-base font-semibold text-gray-900">{loading ? "Loading…" : name}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/20 mt-1">
                            <ShieldCheck className="w-3 h-3" />{role}
                        </span>
                    </div>
                </div>

                {/* Status message */}
                {message && (
                    <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message.type === "success"
                            ? <CheckCircle2 className="w-4 h-4" />
                            : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}

                {/* Skeleton */}
                {loading && (
                    <div className="space-y-3">
                        <div className="skeleton h-4 w-32 rounded" />
                        <div className="skeleton h-9 w-full rounded-lg" />
                        <div className="skeleton h-4 w-32 rounded mt-4" />
                        <div className="skeleton h-9 w-full rounded-lg" />
                    </div>
                )}

                {/* Fields */}
                {!loading && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text" value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Email <span className="normal-case font-normal text-gray-400">(read-only)</span>
                            </label>
                            <input type="email" value={email} disabled
                                className="block w-full rounded-lg border-0 py-2 px-3 text-gray-400 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || name === original?.name}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfilePage;
