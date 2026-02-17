import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    getAllUsers,
    getAllCategories,
    activateUser,
    deactivateUser,
    createUser,
    updateUser,
} from "../../api/adminApi";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // =======================
    // TABLE FILTERS
    // =======================
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "ALL");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

    const statusParam = searchParams.get("status") || "ALL";

    /* =======================
       CREATE USER STATE
    ======================= */
    const [showCreate, setShowCreate] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "RECRUITER",
        password: "",
    });

    /* =======================
       EDIT USER STATE
    ======================= */
    const [editingUser, setEditingUser] = useState(null);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    const [editData, setEditData] = useState({
        name: "",
        role: "",
        password: "",
    });

    const adminProfile = JSON.parse(localStorage.getItem("adminProfile"));
    const loggedInEmail = adminProfile?.email;

    const refreshUsers = () =>
        getAllUsers().then((res) => setUsers(res.data));
    const PAGE_SIZE = 10;

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase());

            const matchesRole =
                roleFilter === "ALL" || u.role === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && u.active) ||
                (statusFilter === "INACTIVE" && !u.active);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    useEffect(() => {
        const params = {};

        if (statusFilter !== "ALL") params.status = statusFilter;
        if (roleFilter !== "ALL") params.role = roleFilter;
        if (search) params.q = search;
        if (page !== 1) params.page = page;

        setSearchParams(params, { replace: true });
    }, [statusFilter, roleFilter, search, page]);

    useEffect(() => {
        const status = searchParams.get("status") || "ALL";
        const role = searchParams.get("role") || "ALL";
        const q = searchParams.get("q") || "";
        const pageParam = Number(searchParams.get("page")) || 1;

        setStatusFilter(status);
        setRoleFilter(role);
        setSearch(q);
        setPage(pageParam);
    }, []);


    const totalRecords = filteredUsers.length;
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    useEffect(() => {
        Promise.all([getAllUsers(), getAllCategories()])
            .then(([u, c]) => {
                setUsers(u.data);
                setCategories(c.data);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (statusParam === "ACTIVE") {
            setStatusFilter("ACTIVE");
        } else if (statusParam === "INACTIVE") {
            setStatusFilter("INACTIVE");
        } else {
            setStatusFilter("ALL");
        }
    }, [statusParam]);

    useEffect(() => {
        setPage(1);
    }, [search, roleFilter, statusFilter]);

    useEffect(() => {
        setSearch(searchParams.get("q") || "");
        setRoleFilter(searchParams.get("role") || "ALL");
        setStatusFilter(searchParams.get("status") || "ALL");
        setPage(Number(searchParams.get("page")) || 1);
    }, [searchParams]);

    useEffect(() => {
        const params = {};

        if (search) params.q = search;
        if (roleFilter !== "ALL") params.role = roleFilter;
        if (statusFilter !== "ALL") params.status = statusFilter;
        if (page > 1) params.page = page;

        setSearchParams(params);
    }, [search, roleFilter, statusFilter, page]);


    if (loading) {
        return <div className="p-6 text-gray-500">Loading users…</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">User Management</h1>

            {/* =======================
         CREATE USER CARD
      ======================= */}
            <div className="mb-6 rounded-xl border bg-white p-4 shadow">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Create User</h3>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="rounded-full border px-3 py-1"
                    >
                        {showCreate ? "×" : "+"}
                    </button>
                </div>

                {showCreate && (
                    <div className="mt-4 space-y-3">
                        {createError && (
                            <div className="rounded bg-red-100 p-2 text-sm text-red-700">
                                {createError}
                            </div>
                        )}
                        {createSuccess && (
                            <div className="rounded bg-green-100 p-2 text-sm text-green-700">
                                {createSuccess}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="border rounded px-3 py-2"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />

                            <input
                                className="border rounded px-3 py-2"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />

                            <select
                                className="border rounded px-3 py-2"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                            >
                                <option value="ADMIN">ADMIN</option>
                                <option value="RECRUITER">RECRUITER</option>
                                <option value="CANDIDATE">CANDIDATE</option>
                            </select>

                            {formData.role !== "CANDIDATE" && (
                                <input
                                    type="password"
                                    className="border rounded px-3 py-2"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                            )}

                            {formData.role === "CANDIDATE" && (
                                <select
                                    className="border rounded px-3 py-2 col-span-2"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="text-right">
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={async () => {
                                    try {
                                        setCreateError("");
                                        setCreateSuccess("");

                                        const payload =
                                            formData.role === "CANDIDATE"
                                                ? {
                                                    name: formData.name,
                                                    email: formData.email,
                                                    role: "CANDIDATE",
                                                    categoryId,
                                                }
                                                : {
                                                    name: formData.name,
                                                    email: formData.email,
                                                    role: formData.role,
                                                    password: formData.password,
                                                };

                                        await createUser(payload);

                                        setCreateSuccess("User created successfully");
                                        setFormData({
                                            name: "",
                                            email: "",
                                            role: "RECRUITER",
                                            password: "",
                                        });
                                        setCategoryId("");
                                        refreshUsers();
                                    } catch (err) {
                                        setCreateError(
                                            err?.response?.data?.message ||
                                            "Failed to create user"
                                        );
                                    }
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* =======================
        TABLE FILTERS
    ======================= */}
            <div className="mb-4 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1);}}
                    className="border rounded px-3 py-2 text-sm w-64"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1)}}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="CANDIDATE">CANDIDATE</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1)}}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                        setSearch("");
                        setRoleFilter("ALL");
                        setStatusFilter("ALL");
                    }}
                >
                    Clear
                </button>
            </div>


            {/* =======================
         USERS TABLE
      ======================= */}
            <div className="rounded-xl border bg-white shadow">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers
                            .filter((u) => {
                                const matchesSearch =
                                    u.name?.toLowerCase().includes(search.toLowerCase()) ||
                                    u.email?.toLowerCase().includes(search.toLowerCase());

                                const matchesRole =
                                    roleFilter === "ALL" || u.role === roleFilter;

                                const matchesStatus =
                                    statusFilter === "ALL" ||
                                    (statusFilter === "ACTIVE" && u.active) ||
                                    (statusFilter === "INACTIVE" && !u.active);

                                return matchesSearch && matchesRole && matchesStatus;
                            })
                            .map((u) => (
                                <tr key={u.id} className="border-t">
                                    <td className="p-3">{u.name}</td>
                                    <td className="p-3">
                                        {u.email}
                                        {u.email === loggedInEmail && (
                                            <span className="ml-1 text-xs text-blue-600">(You)</span>
                                        )}
                                    </td>
                                    <td className="p-3">{u.role}</td>
                                    <td className="p-3">{u.active ? "Active" : "Inactive"}</td>
                                    <td className="p-3 flex gap-3 justify-center">
                                        <div className="relative group">
                                            <button
                                                disabled={u.email === loggedInEmail}
                                                className={`text-blue-600 ${u.email === loggedInEmail
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                                    }`}
                                                onClick={() => {
                                                    if (u.email === loggedInEmail) return;

                                                    setEditingUser(u);
                                                    setEditData({
                                                        name: u.name,
                                                        role: u.role,
                                                        password: "",
                                                    });
                                                    setEditError("");
                                                    setEditSuccess("");
                                                }}
                                            >
                                                Edit
                                            </button>

                                            {u.email === loggedInEmail && (
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1
                    whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white
                    opacity-0 group-hover:opacity-100">
                                                    You can’t edit yourself
                                                </div>
                                            )}
                                        </div>
                                        {u.active ? (
                                            <div className="relative group">
                                                <button
                                                    disabled={u.email === loggedInEmail}
                                                    className={`text-red-600 ${u.email === loggedInEmail
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                    onClick={() => {
                                                        if (u.email === loggedInEmail) return;
                                                        deactivateUser(u.id).then(refreshUsers);
                                                    }}
                                                >
                                                    Deactivate
                                                </button>

                                                {u.email === loggedInEmail && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1
                    whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white
                    opacity-0 group-hover:opacity-100">
                                                        You can’t deactivate yourself
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                className="text-green-600"
                                                onClick={() => activateUser(u.id).then(refreshUsers)}
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

            <div className="flex justify-between items-center mt-4 text-sm">
                <span>
                    Showing {totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, totalRecords)} of {totalRecords} users
                </span>

                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* =======================
         EDIT USER MODAL
      ======================= */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="font-semibold text-lg">Edit / Update User</h3>
                        <p className="text-sm text-gray-500 mb-2">
                            Update name and role. Password is optional. Candidates can update name only.
                        </p>
                        {editError && (
                            <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
                                {editError}
                            </div>
                        )}
                        {editSuccess && (
                            <div className="mb-3 rounded bg-green-100 p-2 text-sm text-green-700">
                                {editSuccess}
                            </div>
                        )}

                        <input
                            className="w-full border rounded px-3 py-2 mt-2"
                            value={editData.name}
                            onChange={(e) =>
                                setEditData({ ...editData, name: e.target.value })
                            }
                        />
                        <select
                            className="w-full border rounded px-3 py-2 mt-3"
                            value={editData.role}
                            disabled={editingUser.role === "CANDIDATE"}
                            onChange={(e) =>
                                setEditData({ ...editData, role: e.target.value })
                            }
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="RECRUITER">RECRUITER</option>
                            {editingUser.role === "CANDIDATE" && (
                                <option value="CANDIDATE">CANDIDATE</option>
                            )}
                        </select>
                        {editingUser.role !== "CANDIDATE" && (
                            <input
                                type="password"
                                placeholder="Reset password (optional)"
                                className="w-full border rounded px-3 py-2 mt-3"
                                value={editData.password}
                                onChange={(e) =>
                                    setEditData({ ...editData, password: e.target.value })
                                }
                            />
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={async () => {
                                    try {
                                        setEditError("");
                                        setEditSuccess("");

                                        const payload =
                                            editingUser.role === "CANDIDATE"
                                                ? { name: editData.name } // candidate: name only
                                                : {
                                                    name: editData.name,
                                                    role: editData.role,
                                                    ...(editData.password ? { password: editData.password } : {}),
                                                };

                                        await updateUser(editingUser.id, payload);

                                        setEditSuccess("User updated successfully");
                                        refreshUsers();
                                        setTimeout(() => setEditingUser(null), 500);
                                    } catch (err) {
                                        setEditError(
                                            err?.response?.data?.message ||
                                            "Failed to update user"
                                        );
                                    }
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
