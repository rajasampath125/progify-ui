/**
 * RecruiterCandidateActivityPage
 *
 * PURPOSE:
 * Shows day-wise job assignment & application activity
 * for ONE candidate.
 *
 * Helps recruiter understand:
 * - On which dates jobs were created for this candidate
 * - How many were applied vs pending
 * - Follow-up & workload clarity
 */
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getRecruiterJobs, getJobCandidates } from "../../api/recruiterApi";

const RecruiterCandidateActivityPage = () => {
  // const { email } = useParams(); // REAL email now

  const navigate = useNavigate();
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);

  const [jobs, setJobs] = useState([]);
  const [jobCandidatesMap, setJobCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [noResponseDays, setNoResponseDays] = useState(7);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const jobsRes = await getRecruiterJobs();
      const jobsData = jobsRes.data || [];
      setJobs(jobsData);

      const map = {};
      for (const job of jobsData) {
        try {
          const res = await getJobCandidates(job.id);
          map[job.id] = res.data || [];
        } catch {
          map[job.id] = [];
        }
      }
      setJobCandidatesMap(map);
    } finally {
      setLoading(false);
    }
  };


  const getLastAppliedDate = (activity) => {
    const appliedDays = activity
      .filter((d) => d.applied > 0)
      .map((d) => new Date(d.date));

    if (appliedDays.length === 0) return null;

    return new Date(Math.max(...appliedDays.map(d => d.getTime())));
  };

  /* =========================
     DAILY ACTIVITY (CORE LOGIC)
  ========================= */

  const dailyActivity = useMemo(() => {
    const map = {};

    Object.entries(jobCandidatesMap).forEach(([jobId, candidates]) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      candidates
        .filter((c) => c.candidateEmail === decodedEmail)
        .forEach((c) => {
          const date = new Date(job.createdAt)
            .toISOString()
            .split("T")[0];

          if (!map[date]) {
            map[date] = {
              date,
              assigned: 0,
              applied: 0,
            };
          }

          map[date].assigned += 1;
          if (c.applicationStatus === "APPLIED") {
            map[date].applied += 1;
          }
        });
    });

    return Object.values(map).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [jobCandidatesMap, jobs, decodedEmail]);

  const hasEverApplied = dailyActivity.some(d => d.applied > 0);


  // last day the candidate applied to ANY job
  const lastAppliedDate = useMemo(() => {
    const appliedDates = dailyActivity
      .filter(d => d.applied > 0)
      .map(d => new Date(d.date));

    if (appliedDates.length === 0) return null;

    return new Date(Math.max(...appliedDates.map(d => d.getTime())));
  }, [dailyActivity]);

  const daysSinceLastResponse = useMemo(() => {
    if (!lastAppliedDate) return null;

    const diff =
      (new Date() - lastAppliedDate) / (1000 * 60 * 60 * 24);

    return Math.floor(diff);
  }, [lastAppliedDate]);

  const showNoResponseBadge =
    daysSinceLastResponse !== null &&
    daysSinceLastResponse >= noResponseDays;


  if (loading) {
    return <div style={{ padding: "40px" }}>Loading candidate activity…</div>;
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/recruiter/analytics")}
        style={{
          marginBottom: "12px",
          fontSize: "13px",
          color: "#2563eb",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Back to Analytics
      </button>
      <h1>Candidate Activity</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        This view helps you track how many jobs you created for this candidate
        per day, and how many they responded to.
      </p>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        Day-wise job assignment & application activity for
        &nbsp;
        <b style={{ color: "#f13a3a" }}>"{decodedEmail}"</b>
      </p>

      {/* FOLLOW-UP STATUS BADGE */}
      {dailyActivity.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          {!hasEverApplied ? (
            <span
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "6px 10px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              🚨 Never applied to any assigned job. Follow up with candidate required!!
            </span> 
          ) : daysSinceLastResponse !== null &&
            daysSinceLastResponse >= noResponseDays ? (
            <span
              style={{
                background: "#fff7ed",
                color: "#9a3412",
                padding: "6px 10px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              ⏱ No response in last 7 days
            </span>
          ) : null}
        </div>
      )}

      {dailyActivity.length === 0 && (
        <p>No jobs have been assigned to this candidate yet.</p>
      )}
      {dailyActivity.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            <span style={{ color: "#2563eb", fontWeight: "bold" }}>Blue</span> = jobs assigned by you<br />
            <span style={{ color: "#22c55e", fontWeight: "bold" }}>Green</span> = jobs applied by the candidate
          </p>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dailyActivity}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="assigned" fill="#2563eb" name="Assigned" />
              <Bar dataKey="applied" fill="#22c55e" name="Applied" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidateActivityPage;
