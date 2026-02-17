import React, { useEffect, useState } from "react";
import {
  getAllCategories,
  createCategory,
  activateCategory,
  deactivateCategory,
} from "../../api/adminApi";

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
    return (
      <p className="p-10 text-gray-600 text-lg">Loading categories...</p>
    );
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
    <div className="max-w-5xl mx-auto p-10">
      <a
        href="/admin/dashboard"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </a>

      <h1 className="text-2xl font-semibold my-6">
        Category Management
      </h1>

      {/* =======================
          CREATE CATEGORY
      ======================= */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
        <div className="flex justify-between items-center">
          <strong className="text-gray-800">Create Category</strong>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-xl font-semibold text-gray-600 hover:text-black"
          >
            {showCreate ? "×" : "+"}
          </button>
        </div>

        {showCreate && (
          <div className="mt-4 flex gap-2">
            <input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
        <div className="mb-4 text-green-600 font-medium">
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 text-red-600 font-medium">
          {errorMsg}
        </div>
      )}

      {/* =======================
          FILTERS
      ======================= */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          placeholder="Search category"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2"
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
          className="px-3 py-2 border rounded hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {/* =======================
          TABLE
      ======================= */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border">Name</th>
              <th className="text-left px-4 py-2 border">Status</th>
              <th className="text-left px-4 py-2 border w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedCategories.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500"
                >
                  No categories found
                </td>
              </tr>
            )}

            {pagedCategories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{c.name}</td>
                <td className="px-4 py-2 border">
                  {c.active ? (
                    <span className="text-green-600 font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-500 font-medium">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {c.active ? (
                    <button
                      onClick={() =>
                        deactivateCategory(c.id).then(loadCategories)
                      }
                      className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        activateCategory(c.id).then(loadCategories)
                      }
                      className="px-3 py-1 text-sm border rounded text-green-600 hover:bg-green-50"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =======================
          PAGINATION
      ======================= */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="text-gray-600">
          Showing{" "}
          {filteredCategories.length === 0
            ? 0
            : (page - 1) * pageSize + 1}
          –
          {Math.min(page * pageSize, filteredCategories.length)} of{" "}
          {filteredCategories.length}
        </div>

        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1"
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
