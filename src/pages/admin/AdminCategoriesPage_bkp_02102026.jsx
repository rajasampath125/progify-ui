import React, { useEffect, useState } from "react";
import { getAllCategories, createCategory, activateCategory, deactivateCategory } from "../../api/adminApi";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  // Feedback
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

const loadCategories = () => {
  setLoading(true);

  getAllCategories()
    .then((res) => setCategories(res.data))
    .finally(() => setLoading(false));
};

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading categories...</p>;
  }

  /* =======================
     FILTER + PAGINATION
  ======================= */

  const filteredCategories = categories.filter((c) => {
    const matchSearch = c.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.active) ||
      (statusFilter === "INACTIVE" && !c.active);

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(
    filteredCategories.length / pageSize
  );

  const pagedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <a href="/admin/dashboard">← Back to Dashboard</a>

      <h1 style={{ margin: "24px 0" }}>Category Management</h1>

      {/* =======================
          CREATE CATEGORY
      ======================= */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>Create Category</strong>
          <button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "×" : "+"}
          </button>
        </div>

        {showCreate && (
          <div style={{ marginTop: "12px" }}>
            <input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "8px", marginRight: "8px" }}
            />
            <button
              onClick={async () => {
                setErrorMsg("");
                setStatusMsg("");

                if (!name.trim()) {
                  setErrorMsg("Category name is required");
                  return;
                }

                try {
                  await createCategory(name);
                  setName("");
                  setShowCreate(false);
                  setStatusMsg("Category created successfully");
                  loadCategories();
                } catch (err) {
                  const msg =
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    "Failed to create category";
                  setErrorMsg(msg);
                }
              }}
            >
              Create
            </button>
          </div>
        )}
      </div>

      {/* =======================
          STATUS / ERROR
      ======================= */}
      {statusMsg && (
        <div style={{ marginBottom: "16px", color: "green" }}>
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ marginBottom: "16px", color: "#dc2626" }}>
          {errorMsg}
        </div>
      )}

      {/* =======================
          FILTERS (FIXED PLACEMENT)
      ======================= */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Search category"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ padding: "8px" }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{ padding: "8px" }}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("ALL");
            setPage(1);
          }}
        >
          Clear
        </button>
      </div>

      {/* =======================
          TABLE
      ======================= */}
      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th style={{ width: "160px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedCategories.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No categories found
              </td>
            </tr>
          )}

          {pagedCategories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.active ? "Active" : "Inactive"}</td>
              <td>
                {c.active ? (
                  <button
                    onClick={() =>
                      deactivateCategory(c.id).then(loadCategories)
                    }
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      activateCategory(c.id).then(loadCategories)
                    }
                  >
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* =======================
          PAGINATION
      ======================= */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          Showing{" "}
          {filteredCategories.length === 0
            ? 0
            : (page - 1) * pageSize + 1}
          –
          {Math.min(page * pageSize, filteredCategories.length)} of{" "}
          {filteredCategories.length}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
