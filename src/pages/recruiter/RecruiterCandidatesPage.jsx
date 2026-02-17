import { useEffect, useState } from "react";
import { getAllCandidatesForRecruiter } from "../../api/recruiterApi";
import { useNavigate, useSearchParams } from "react-router-dom";

const RecruiterCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("size")) || 5
  );

  useEffect(() => {
    getAllCandidatesForRecruiter().then((res) => {
      setCandidates(res.data);
    });
  }, []);

  const categories = [
    ...new Set(candidates.map((c) => c.category).filter(Boolean)),
  ];

  const filteredCandidates = candidates.filter((c) => {
    const matchesCategory =
      categoryFilter === "ALL" || c.category === categoryFilter;

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  useEffect(() => {
    setSearchParams({
      page: currentPage,
      size: pageSize,
    });
  }, [currentPage, pageSize, setSearchParams]);

  const totalCandidates = filteredCandidates.length;
  const totalPages = Math.ceil(totalCandidates / pageSize);

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "8px" }}>Candidate Directory</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Browse and view candidates in the system.
      </p>

      {/* FILTER BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          padding: "16px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={input}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={select}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("ALL");
            }}
            style={clearBtn}
          >
            Clear
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCandidates.map((c) => (
              <tr
                key={c.id}
                style={{ transition: "background 0.15s ease" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.category || "-"}</td>
                <td style={tdStyle}>
                  <button
                    style={secondaryBtn}
                    onClick={() =>
                      navigate(`/recruiter/candidates/${c.id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "13px", color: "#6b7280" }}>
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, totalCandidates)} of{" "}
          {totalCandidates} candidates
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span style={{ fontSize: "13px" }}>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
      </div>

      {filteredCandidates.length === 0 && (
        <p style={{ marginTop: "24px" }}>No candidates found.</p>
      )}
    </div>
  );
};

/* ===================== */
/* Styles */
/* ===================== */

const input = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  minWidth: "220px",
};

const select = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  background: "#fff",
};

const clearBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  fontSize: "14px",
  cursor: "pointer",
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

const thStyle = {
  padding: "14px",
  textAlign: "left",
  background: "#f9fafb",
  fontSize: "14px",
  fontWeight: 600,
  color: "#374151",
};

const tdStyle = {
  padding: "12px 14px",
  fontSize: "14px",
  borderTop: "1px solid #e5e7eb",
};

const secondaryBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  fontSize: "13px",
  cursor: "pointer",
};

export default RecruiterCandidatesPage;
