/*
Purpose:
Shows candidates for ONE specific job
One row = one candidate
*/

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobCandidates } from "../../api/recruiterApi";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import { ArrowLeft } from "lucide-react";

const RecruiterJobCandidatesPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getJobCandidates(jobId);
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to load job candidates", err);
      setError("Failed to load candidates for this job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/recruiter/jobs")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
            Job Candidates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Candidates assigned to this job
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <TableSkeleton cols={3} rows={5} />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5">
          <EmptyState
            icon="users"
            title="No candidates assigned"
            description="No candidates have been assigned to this job yet."
          />
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {candidates.map((c) => (
                  <tr
                    key={c.candidateId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {c.candidateEmail}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${c.applicationStatus === "APPLIED"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : c.applicationStatus === "NOT_APPLIED"
                            ? "bg-gray-50 text-gray-600 ring-gray-500/10"
                            : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                          }`}
                      >
                        {c.applicationStatus === "NOT_APPLIED"
                          ? "NO RESPONSE"
                          : c.applicationStatus}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {c.appliedAt
                        ? new Date(c.appliedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobCandidatesPage;
