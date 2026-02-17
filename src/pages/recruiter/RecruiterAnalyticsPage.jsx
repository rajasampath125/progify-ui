/**
 * RecruiterAnalyticsPage
 *
 * Purpose:
 * - High-level performance overview for recruiters
 * - Answers "How am I doing?" not "Show me all jobs"
 *
 * Shows:
 * - Jobs created over time
 * - Candidate response behavior
 * - Application success rate
 *
 * Navigation:
 * - Drill-downs redirect to Jobs page for details
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getRecruiterJobs, getJobCandidates } from "../../api/recruiterApi";

const RecruiterAnalyticsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [jobCandidatesMap, setJobCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState("ALL"); // ALL | 7 | 30
  const [selectedCandidate, setSelectedCandidate] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const navigate = useNavigate();

  const handleBarClick = (data) => {
      console.log("BAR CLICK DATA:", data);
    if (!data || !data.date) return;

    // YYYY-MM-DD already
    navigate(`/recruiter/jobs?date=${data.date}`);
  };
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const jobsRes = await getRecruiterJobs();
      const jobsData = jobsRes.data || [];
      setJobs(jobsData);

      const candidateMap = {};
      for (const job of jobsData) {
        try {
          const res = await getJobCandidates(job.id);
          candidateMap[job.id] = res.data || [];
        } catch {
          candidateMap[job.id] = [];
        }
      }
      setJobCandidatesMap(candidateMap);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    const now = new Date();

    return jobs.filter((job) => {
      // Date filter
      if (dateRange !== "ALL") {
        const days =
          (now - new Date(job.createdAt)) /
          (1000 * 60 * 60 * 24);
        if (days > Number(dateRange)) return false;
      }

      // Category filter
      if (
        selectedCategory !== "ALL" &&
        job.categoryName !== selectedCategory
      ) {
        return false;
      }

      return true;
    });
  }, [jobs, dateRange, selectedCategory]);

  /* =========================
     METRICS
  ========================= */

  const now = new Date();

  const jobsToday = filteredJobs.filter(
    (j) =>
      new Date(j.createdAt).toDateString() ===
      new Date().toDateString()
  ).length;

  const jobsLast7Days = filteredJobs.filter(
    (j) =>
      (new Date() - new Date(j.createdAt)) /
      (1000 * 60 * 60 * 24) <=
      7
  ).length;

  const activeJobs = filteredJobs.filter((j) => j.active).length;
  const inactiveJobs = filteredJobs.length - activeJobs;

  const applicationBreakdown = useMemo(() => {
    let applied = 0;
    let pending = 0;

    Object.entries(jobCandidatesMap).forEach(
      ([jobId, candidates]) => {
        const job = filteredJobs.find((j) => j.id === jobId);
        if (!job) return;

        // Respect date filter
        if (dateRange !== "ALL") {
          const days =
            (new Date() - new Date(job.createdAt)) /
            (1000 * 60 * 60 * 24);
          if (days > Number(dateRange)) return;
        }

        // Respect category filter
        if (
          selectedCategory !== "ALL" &&
          job.categoryName !== selectedCategory
        )
          return;

        candidates.forEach((c) => {
          // Respect candidate filter
          if (
            selectedCandidate !== "ALL" &&
            c.candidateEmail !== selectedCandidate
          )
            return;

          if (c.applicationStatus === "APPLIED") applied++;
          else pending++;
        });
      }
    );

    return { applied, pending };
  }, [
    jobCandidatesMap,
    jobs,
    dateRange,
    selectedCategory,
    selectedCandidate,
  ]);


  /* =========================
     CHART DATA
  ========================= */

  const jobsAssignedByDate = useMemo(() => {
    const map = {};

    filteredJobs.forEach((job) => {
      //const date = new Date(job.createdAt).toLocaleDateString();
      const date = new Date(job.createdAt).toISOString().split("T")[0]; // YYYY-MM-DD
      map[date] = (map[date] || 0) + 1;
    });

    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredJobs]);

  const candidateSummary = useMemo(() => {
    const map = {};

    Object.entries(jobCandidatesMap).forEach(
      ([jobId, candidates]) => {
        const job = jobs.find((j) => j.id === jobId);
        if (!job) return;

        if (
          selectedCategory !== "ALL" &&
          job.categoryName !== selectedCategory
        )
          return;

        candidates.forEach((c) => {
          if (
            selectedCandidate !== "ALL" &&
            c.candidateEmail !== selectedCandidate
          )
            return;

          const email = c.candidateEmail;

          if (!map[email]) {
            map[email] = { assigned: 0, applied: 0 };
          }

          map[email].assigned += 1;
          if (c.applicationStatus === "APPLIED") {
            map[email].applied += 1;
          }
        });
      }
    );

    return Object.entries(map).map(([email, stats]) => ({
      email,
      assigned: stats.assigned,
      applied: stats.applied,
      pending: stats.assigned - stats.applied,
      rate:
        stats.assigned === 0
          ? "0%"
          : `${Math.round(
            (stats.applied / stats.assigned) * 100
          )}%`,
    }));
  }, [
    jobCandidatesMap,
    jobs,
    selectedCandidate,
    selectedCategory,
  ]);


  const renderPieLabel = ({ name, percent }) =>
    `${name} (${Math.round(percent * 100)}%)`;

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "8px" }}>
        Recruiter Analytics
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "3px" }}>
        Performance & reporting overview
      </p>
      
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        This page gives you a high-level overview of your recruiting activity.
        It helps you understand how often jobs are assigned, how candidates respond,
        and which candidates or time periods need follow-up or attention.
      </p>
      {/* KPI CARDS */}
      <div style={kpiGrid}>
        <KPI title="Total Jobs" value={jobs.length} />
        <KPI title="Jobs Today" value={jobsToday} />
        <KPI title="Jobs (Last 7 Days)" value={jobsLast7Days} />
        <KPI
          title={
            <span>
              Application Rate{" "}
              <span
                title="Calculated as: (Total Applied Jobs ÷ Total Assigned Jobs) × 100"
                style={{ cursor: "help", color: "#1465f0" }}
              >
                ⓘ
              </span>
            </span>
          }
          value={
            applicationBreakdown.applied +
              applicationBreakdown.pending === 0
              ? "0%"
              : `${Math.round(
                (applicationBreakdown.applied /
                  (applicationBreakdown.applied +
                    applicationBreakdown.pending)) *
                100
              )}%`
          }
        />
      </div>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* LEFT: Context filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <label style={{ fontSize: "13px", color: "#6b7280" }}>
            🗂️ Job Category
          </label>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Job Categories</option>
            {[...new Set(jobs.map((j) => j.categoryName))].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* RIGHT: Global time filter */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <label style={{ fontSize: "13px", color: "#6b7280" }}>
              🕒 Time Range
          </label>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          <button
            onClick={() => {
              setDateRange("ALL");
              setSelectedCategory("ALL");
              setSelectedCandidate("ALL");
              setCandidateSearch("");
            }}
            style={{
              fontSize: "12px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>

      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        Analytics are based on <strong>jobs assigned</strong>.
        Candidates appear only if they have at least one job.
      </p>

      {/* CHARTS */}
      <div style={chartGrid}>
        <ChartCard title="Jobs Assigned to Candidates (Daily)">
          {jobs.length === 0 && (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              No data available yet
            </p>
          )}
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            Total number of jobs <strong>assigned by you</strong> per day
            <br />
            <span style={{ fontStyle: "italic" }}>
              (Across all candidates · filtered by category & time range)
            </span>
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={jobsAssignedByDate}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />

              <Bar
                dataKey="count"
                fill="#2563eb"
                cursor="pointer"
                onClick={(data) => handleBarClick(data)}
              />
            </BarChart>
          </ResponsiveContainer>

        </ChartCard>


        <ChartCard title="Application Status Overview">
            {/* Candidate filter INSIDE card */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#6b7280",
                display: "block",
                marginBottom: "4px",
              }}
            >
              👤 Candidate (Application Status)
            </label>

            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              <option value="ALL">All Candidates</option>
              {[...new Set(
                Object.values(jobCandidatesMap)
                  .flat()
                  .map((c) => c.candidateEmail)
              )].map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          {jobs.length === 0 && (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              No data available yet
            </p>
          )}

          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            Candidate application progress
          </p>
          {applicationBreakdown.applied + applicationBreakdown.pending === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              No application activity for the selected filters.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Applied", value: applicationBreakdown.applied },
                    { name: "Pending", value: applicationBreakdown.pending },
                  ]}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  label={renderPieLabel}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#facc15" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          
        </ChartCard>
      </div>


      {/* CANDIDATE PERFORMANCE SUMMARY */}
      <div style={{ marginTop: "48px" }}>
        <h2 style={{ marginBottom: "6px" }}>
          Candidate Performance Summary
        </h2>

        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
          Breakdown of how each candidate responded to jobs assigned by you.
          <br />
          Helps identify follow-ups, inactive candidates, and overall response quality.
        </p>

        <input
          type="text"
          placeholder="🔍 Search by candidate email"
          value={candidateSearch}
          onChange={(e) => setCandidateSearch(e.target.value)}
          style={{
            marginBottom: "12px",
            padding: "8px 10px",
            width: "260px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
          Sorted implicitly by engagement (high response → low response)
        </p>

        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Candidate</th>
                <th style={th}>Jobs Assigned</th>
                <th style={th}>Applied</th>
                <th style={th}>Pending</th>
                <th style={th}>Application Rate</th>
              </tr>
            </thead>
            <tbody>
              {candidateSummary.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...td, textAlign: "center", color: "#6b7280" }}>
                    No candidates match the selected filters
                  </td>
                </tr>
              )}

              {candidateSummary
                .filter((c) =>
                  c.email.toLowerCase().includes(candidateSearch.toLowerCase())
                )
                .map((c) => (
                  <tr key={c.email}>
                    {/* <td style={td}>{c.email}</td> */}
                    <td
                      style={{ ...td, cursor: "pointer", color: "#2563eb" }}
                      onClick={() =>
                        navigate(
                          `/recruiter/candidates/${encodeURIComponent(c.email)}/activity`
                        )
                      }
                    >
                      {c.email}
                    </td>
                    <td style={td}>{c.assigned}</td>
                    <td style={td}>{c.applied}</td>
                    <td style={td}>{c.pending}</td>
                    <td style={td}>{c.rate}</td>
                  </tr>
                ))}

            </tbody>

          </table>
        </div>
      </div>


    </div>

  );
};

/* =========================
   UI HELPERS
========================= */

const KPI = ({ title, value }) => (
  <div style={kpiCard}>
    <div style={{ fontSize: "14px", color: "#6b7280" }}>
      {title}
    </div>
    <div
      style={{
        fontSize: "32px",
        fontWeight: 600,
        marginTop: "8px",
      }}
    >
      {value}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={chartCard}>
    <h3 style={{ marginBottom: "12px" }}>{title}</h3>
    {children}
  </div>
);

/* =========================
   STYLES
========================= */

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "40px",
};

const kpiCard = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "24px",
  textAlign: "center",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: "24px",
};

const chartCard = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
};

const tableWrapper = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  overflow: "hidden",
  background: "#ffffff",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "14px",
  background: "#f9fafb",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: 600,
};

const td = {
  padding: "12px 14px",
  borderTop: "1px solid #e5e7eb",
  fontSize: "14px",
};

export default RecruiterAnalyticsPage;
