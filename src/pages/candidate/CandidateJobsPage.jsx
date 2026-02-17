import { useEffect, useState } from "react";
import {
    getAvailableJobs,
    applyToJob,
    downloadResume,
} from "../../api/candidateApi";
import { useSearchParams } from "react-router-dom";

const CandidateJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTitle, setSearchTitle] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        setLoading(true);
        getAvailableJobs()
            .then((res) => setJobs(res.data))
            .finally(() => setLoading(false));
    }, []);


    const handleApply = async (jobId) => {
        await applyToJob(jobId);
        const res = await getAvailableJobs();
        setJobs(res.data);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            getAvailableJobs().then((res) => setJobs(res.data));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 5);

    const filteredJobs = jobs.filter((job) => {
        const matchesTitle =
            !searchTitle ||
            job.title?.toLowerCase().includes(searchTitle.toLowerCase());

        const matchesDate =
            !dateFilter ||
            job.createdAt?.startsWith(dateFilter);

        return matchesTitle && matchesDate;
    });
    const totalJobs = filteredJobs.length;
    const totalPages = Math.ceil(totalJobs / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalJobs);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setSearchParams({ page: newPage, pageSize });
    };

    const changePageSize = (newSize) => {
        setSearchParams({ page: 1, pageSize: newSize });
    };

    const handleDownload = async (jobId) => {
        try {
            const response = await downloadResume(jobId);

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const contentDisposition = response.headers["content-disposition"];
            let fileName = "resume.docx";

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match?.length === 2) {
                    fileName = match[1];
                }
            }

            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            if (error.response?.status === 410) {
                alert("Resume expired. Please contact recruiter.");
            } else {
                alert("Failed to download resume");
            }
        }
    };


    return (
        <div
            style={{
                padding: "40px 24px",
                maxWidth: "1100px",
                margin: "0 auto",
            }}
        >
            {loading && (
                <div style={{ padding: "24px", color: "#9ca3af" }}>
                    Loading available jobs…
                </div>
            )}

            {/* <a href="/candidate/dashboard">← Back to Dashboard</a> */}
            <h1 style={{ marginBottom: "24px" }}>Available Jobs</h1>

            {/* FILTER BAR */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <input
                    placeholder="Search by job title"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    style={{
                        padding: "8px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "220px",
                    }}
                />

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                        padding: "8px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                    }}
                />

                <button
                    onClick={() => {
                        setSearchTitle("");
                        setDateFilter("");
                    }}
                    style={{
                        padding: "8px 14px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        cursor: "pointer",
                    }}
                >
                    Clear
                </button>
            </div>

            {jobs.length === 0 && (
                <div
                    style={{
                        marginTop: "40px",
                        padding: "40px",
                        textAlign: "center",
                        borderRadius: "12px",
                        color: "#d44848",
                        background: "#fafafa",
                        fontSize: "15px",
                    }}
                >
                    <strong>No Available Jobs found today</strong>
                    <div style={{ marginTop: "8px", fontSize: "13px" }}>
                        Please check back later — new opportunities are added regularly.
                    </div>
                </div>
            )}

            {jobs.length > 0 && (
                <>

                    <div
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            overflow: "hidden",
                            background: "#ffffff",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: "#f9fafb",
                                        textAlign: "left",
                                    }}
                                >
                                    <th style={th}>Job Title</th>
                                    <th style={th}>Links</th>
                                    <th style={th}>Resume</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Created At</th>
                                    <th style={th}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedJobs.map((job) => (
                                    <tr
                                        key={job.jobId}
                                        style={{
                                            borderTop: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <td style={td}>{job.title}</td>

                                        <td style={td}>
                                            <a
                                                href={job.jobLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={link}
                                            >
                                                Job Link
                                            </a>
                                        </td>

                                        <td style={td}>
                                            <button
                                                onClick={() => handleDownload(job.jobId)}
                                                style={secondaryBtn}
                                            ><i className="fa fa-download" style={{ marginRight: 6 }} />Resume
                                            </button>
                                        </td>

                                        <td style={td}>
                                            <StatusPill status={job.applied} />
                                        </td>

                                        <td style={td}>
                                            {job.createdAt
                                                ? new Date(job.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td style={td}>
                                            {!job.applied ? (
                                                <button
                                                    onClick={() => handleApply(job.jobId)}
                                                    style={primaryBtn}
                                                >
                                                    Apply
                                                </button>
                                            ) : (
                                                <span style={{ color: "#16a34a", fontWeight: 500 }}>
                                                    Applied
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "20px",
                            gap: "12px",
                            flexWrap: "wrap",
                        }}
                    >
                        {/* LEFT — COUNT */}
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            Showing {totalJobs === 0 ? 0 : startIndex + 1}–{endIndex} of {totalJobs} jobs
                        </div>

                        {/* CENTER — PAGINATION */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                                disabled={page === 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                Prev
                            </button>

                            <span style={{ fontSize: "13px" }}>
                                Page {page} of {totalPages || 1}
                            </span>

                            <button
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => goToPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>

                        {/* RIGHT — PAGE JUMP + PAGE SIZE */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px" }}>Go to</span>

                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={page}
                                onChange={(e) => goToPage(Number(e.target.value))}
                                style={{ width: "60px", padding: "4px" }}
                            />

                            <select
                                value={pageSize}
                                onChange={(e) => changePageSize(Number(e.target.value))}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ===================== */
/* Styles (local only)   */
/* ===================== */
const th = {
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
};

const td = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#111827",
    verticalAlign: "middle",
};

const link = {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
};

const primaryBtn = {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
};

const secondaryBtn = {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
};

function StatusPill({ applied }) {

    return (
        <span
            style={{
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                background: applied ? "#dcfce7" : "#fef3c7",
                color: applied ? "#166534" : "#92400e",
            }}
        >
            {applied ? "APPLIED" : "NOT APPLIED"}
        </span>
    );
}




export default CandidateJobsPage;