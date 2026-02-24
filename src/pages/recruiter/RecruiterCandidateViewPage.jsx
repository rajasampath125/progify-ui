import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCandidateById } from "../../api/recruiterApi";
import { ArrowLeft, User, Mail, Tag } from "lucide-react";

const RecruiterCandidateViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCandidateById(id)
      .then((res) => setCandidate(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const initials = candidate?.name
    ? candidate.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidate Details</h1>
        <p className="mt-1 text-sm text-gray-500">View candidate information and contact details.</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
        {/* Avatar Banner */}
        <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="px-6 pb-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {loading ? "…" : initials}
            </div>
            {!loading && candidate && (
              <div className="mb-1">
                <p className="text-lg font-semibold text-gray-900">{candidate.name}</p>
                <span className="text-sm text-gray-500">{candidate.email}</span>
              </div>
            )}
          </div>

          {/* SKELETON */}
          {loading && (
            <div className="space-y-4">
              <div className="skeleton h-5 w-40 rounded-md" />
              <div className="skeleton h-10 w-full rounded-md" />
              <div className="skeleton h-5 w-40 rounded-md" />
              <div className="skeleton h-10 w-full rounded-md" />
            </div>
          )}

          {/* DETAILS */}
          {!loading && candidate && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={candidate.name || "-"}
                  disabled
                  className="block w-full rounded-lg border-0 py-2 px-3 text-gray-700 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={candidate.email || "-"}
                  disabled
                  className="block w-full rounded-lg border-0 py-2 px-3 text-gray-700 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Tag className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Category
                </label>
                <input
                  type="text"
                  value={candidate.category || "-"}
                  disabled
                  className="block w-full rounded-lg border-0 py-2 px-3 text-gray-700 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterCandidateViewPage;
