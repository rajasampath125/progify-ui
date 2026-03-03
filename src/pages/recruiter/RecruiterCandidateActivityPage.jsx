/**
 * RecruiterCandidateActivityPage
 * Shows day-wise job assignment & application activity for ONE candidate.
 */
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getRecruiterJobs, getAllJobsCandidates } from "../../api/recruiterApi";
import { useRecruiterData } from "../../context/RecruiterDataContext";
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2, BarChart2, User,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";

const RecruiterCandidateActivityPage = () => {
  const navigate = useNavigate();
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);

  const { jobs, jobCandidatesMap, loading, ensureLoaded } = useRecruiterData();
  const [noResponseDays] = useState(7);

  useEffect(() => { ensureLoaded(); }, [ensureLoaded]);

  const dailyActivity = useMemo(() => {
    const map = {};
    Object.entries(jobCandidatesMap).forEach(([jobId, candidates]) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;
      candidates
        .filter((c) => c.candidateEmail === decodedEmail)
        .forEach((c) => {
          const date = new Date(job.createdAt).toISOString().split("T")[0];
          if (!map[date]) map[date] = { date, assigned: 0, applied: 0 };
          map[date].assigned += 1;
          if (c.applicationStatus === "APPLIED") map[date].applied += 1;
        });
    });
    return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [jobCandidatesMap, jobs, decodedEmail]);

  const hasEverApplied = dailyActivity.some(d => d.applied > 0);

  const lastAppliedDate = useMemo(() => {
    const appliedDates = dailyActivity.filter(d => d.applied > 0).map(d => new Date(d.date));
    if (appliedDates.length === 0) return null;
    return new Date(Math.max(...appliedDates.map(d => d.getTime())));
  }, [dailyActivity]);

  const daysSinceLastResponse = useMemo(() => {
    if (!lastAppliedDate) return null;
    return Math.floor((new Date() - lastAppliedDate) / (1000 * 60 * 60 * 24));
  }, [lastAppliedDate]);

  const totalAssigned = dailyActivity.reduce((s, d) => s + d.assigned, 0);
  const totalApplied = dailyActivity.reduce((s, d) => s + d.applied, 0);
  const responseRate = totalAssigned > 0 ? Math.round((totalApplied / totalAssigned) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="skeleton h-5 w-32 mb-6 rounded" />
        <div className="skeleton h-7 w-72 mb-2 rounded" />
        <div className="skeleton h-4 w-96 mb-8 rounded" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
        <div className="skeleton h-60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* BACK */}
      <button
        onClick={() => navigate("/recruiter/analytics")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analytics
      </button>

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidate Activity</h1>
        </div>
        <p className="text-sm text-gray-500">
          Day-wise job assignment &amp; application activity for{" "}
          <span className="font-semibold text-indigo-600">{decodedEmail}</span>
        </p>
      </div>

      {/* ALERT BADGES */}
      {dailyActivity.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {!hasEverApplied ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200">
              <AlertTriangle className="w-4 h-4" />
              Never applied — follow-up required!
            </div>
          ) : daysSinceLastResponse !== null && daysSinceLastResponse >= noResponseDays ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              <Clock className="w-4 h-4" />
              No response in last {daysSinceLastResponse} days
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              Actively responding
            </div>
          )}
        </div>
      )}

      {/* STAT CARDS */}
      {dailyActivity.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Assigned</p>
            <p className="text-3xl font-bold text-gray-900">{totalAssigned}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Applied</p>
            <p className="text-3xl font-bold text-emerald-600">{totalApplied}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Response Rate</p>
            <p className="text-3xl font-bold text-indigo-600">{responseRate}%</p>
          </div>
        </div>
      )}

      {/* CHART / EMPTY */}
      {dailyActivity.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5">
          <EmptyState
            icon="inbox"
            title="No jobs assigned yet"
            description="No jobs have been assigned to this candidate. Assign a job to start tracking activity."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Daily Activity</h2>
            <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" /> Assigned</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> Applied</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyActivity} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
              />
              <Bar dataKey="assigned" fill="#6366f1" name="Assigned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="applied" fill="#10b981" name="Applied" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidateActivityPage;
