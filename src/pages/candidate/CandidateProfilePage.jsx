import { useEffect, useState } from "react";
import { getCurrentCandidate } from "../../api/candidateApi";
import { ShieldCheck, AlertCircle } from "lucide-react";

const CandidateProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getCurrentCandidate();
      setProfile(res.data);
      // Fallback: also update localStorage if it was previously used
      if (res.data) {
        localStorage.setItem("candidateProfile", JSON.stringify(res.data));
      }
    } catch {
      // Fallback to local storage if API fails
      const localProfile = localStorage.getItem("candidateProfile");
      if (localProfile) {
        setProfile(JSON.parse(localProfile));
      } else {
        setError("Failed to load candidate profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const name = profile?.name && profile.name !== "null" ? profile.name : "";
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.charAt(0).toUpperCase() || "C";

  return (
    <div className="max-w-lg mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-sky-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {loading ? "…" : initials}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {loading ? "Loading…" : name || profile?.email || "Candidate Profile"}
            </p>
            {profile?.role && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-600/20 mt-1">
                <ShieldCheck className="w-3 h-3" />{profile.role}
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            <AlertCircle className="w-4 h-4" />{error}
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

        {/* Fields (read-only) */}
        {!loading && profile && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" value={name} disabled
                placeholder="Not provided"
                className="block w-full rounded-lg border-0 py-2 px-3 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email <span className="normal-case font-normal text-gray-400">(read-only)</span>
              </label>
              <input type="email" value={profile.email || ""} disabled
                className="block w-full rounded-lg border-0 py-2 px-3 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 pt-1">
              To update your details, contact the recruiting administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfilePage;
