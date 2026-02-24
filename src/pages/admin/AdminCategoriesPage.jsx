import React, { useEffect, useState } from "react";
import {
  getAllCategories,
  createCategory,
  activateCategory,
  deactivateCategory,
  updateCategory,
  deleteCategory,
} from "../../api/adminApi";
import {
  Plus,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

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

  useEffect(() => { loadCategories(); }, []);

  const filteredCategories = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.active) ||
      (statusFilter === "INACTIVE" && !c.active);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const pagedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  const handleCreate = async () => {
    setErrorMsg(""); setStatusMsg("");
    if (!name.trim()) { setErrorMsg("Category name is required"); return; }
    try {
      setCreating(true);
      await createCategory(name);
      setName(""); setShowCreate(false);
      setStatusMsg("Category created successfully");
      loadCategories();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = (category) => {
    setEditCategory(category.id);
    setEditName(category.name);
    setErrorMsg("");
    setStatusMsg("");
  };

  const cancelEdit = () => {
    setEditCategory(null);
    setEditName("");
  };

  const handleUpdate = async (id) => {
    setErrorMsg(""); setStatusMsg("");
    if (!editName.trim()) { setErrorMsg("Category name is required"); return; }
    try {
      setSavingEdit(true);
      await updateCategory(id, editName);
      setEditCategory(null);
      setEditName("");
      setStatusMsg("Category updated successfully");
      loadCategories();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update category");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) return;
    try {
      setErrorMsg(""); setStatusMsg("");
      await deleteCategory(id);
      setStatusMsg("Category deleted successfully");
      loadCategories();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to delete category. It might be in use.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* PAGE HEADER */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Category Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage job categories across the platform.</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setErrorMsg(""); }}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? "Cancel" : "New Category"}
        </button>
      </div>

      {/* STATUS / ERROR */}
      {statusMsg && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* CREATE PANEL */}
      {showCreate && (
        <div className="mb-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            Create New Category
          </h2>
          <div className="flex gap-3">
            <input
              autoFocus
              placeholder="e.g. Software Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="block flex-1 rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="mb-5 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            placeholder="Search categories…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-lg border-0 py-1.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="block w-full sm:w-40 rounded-lg border-0 py-1.5 px-3 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button
          onClick={() => { setSearch(""); setStatusFilter("ALL"); setPage(1); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-0">
                    <TableSkeleton cols={3} rows={6} />
                  </td>
                </tr>
              ) : pagedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      icon="search"
                      title="No categories found"
                      description="Try adjusting your search or create a new category."
                      action={{ label: "New Category", onClick: () => setShowCreate(true) }}
                    />
                  </td>
                </tr>
              ) : (
                pagedCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-md">
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        {editCategory === c.id ? (
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(c.id)}
                            className="block w-full max-w-xs rounded-lg border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          />
                        ) : (
                          c.name
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {c.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/20">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                      {editCategory === c.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            disabled={savingEdit}
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-300 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdate(c.id)}
                            disabled={savingEdit}
                            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(c)}
                            title="Edit Category"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {c.active ? (
                            <button
                              onClick={() => deactivateCategory(c.id).then(loadCategories)}
                              title="Deactivate Category"
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => activateCategory(c.id).then(loadCategories)}
                              title="Activate Category"
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Delete Category"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && filteredCategories.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 bg-white">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredCategories.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> –{" "}
              <span className="font-medium">{Math.min(page * pageSize, filteredCategories.length)}</span> of{" "}
              <span className="font-medium">{filteredCategories.length}</span>
            </p>
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-md border-0 py-1 px-2 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} / page</option>)}
              </select>
              <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 bg-white select-none">
                  {page} / {totalPages || 1}
                </span>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage(p => p + 1)}
                  className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
