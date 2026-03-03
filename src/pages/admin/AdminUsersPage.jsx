import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    getAllUsers,
    getAllCategories,
    activateUser,
    deactivateUser,
    createUser,
    updateUser,
    deleteUser,
    kickoutUser,
    changeUserPassword,
    resetUserPassword,
    getActiveUsers,
} from "../../api/adminApi";
import {
    Search,
    UserPlus,
    Edit2,
    UserX,
    Trash2,
    AlertTriangle,
    Shield,
    X,
    CheckCircle2,
    XCircle,
    Mail,
    KeyRound,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    // =======================
    // TABLE FILTERS
    // =======================
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("q") || "";
    const roleFilter = searchParams.get("role") || "ALL";
    const statusFilter = searchParams.get("status") || "ALL";
    const page = Number(searchParams.get("page")) || 1;

    const updateFilters = (updates) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "ALL" || value === "") {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        if (!updates.page) newParams.delete("page");
        setSearchParams(newParams);
    };

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
        email: "",
        role: "",
        password: "",
    });

    /* =======================
       DELETE USER STATE
    ======================= */
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToKickout, setUserToKickout] = useState(null);

    /* =======================
       CHANGE EMAIL STATE
    ======================= */
    const [emailChangeUser, setEmailChangeUser] = useState(null);
    const [newEmail, setNewEmail] = useState("");
    const [emailChangeError, setEmailChangeError] = useState("");
    const [emailChangeSuccess, setEmailChangeSuccess] = useState("");

    /* =======================
       CHANGE PASSWORD STATE
    ======================= */
    const [passwordChangeUser, setPasswordChangeUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [passwordChangeError, setPasswordChangeError] = useState("");
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

    /* =======================
       RESET PASSWORD STATE
    ======================= */
    const [resetPasswordUser, setResetPasswordUser] = useState(null);
    const [resetPasswordError, setResetPasswordError] = useState("");
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState("");
    const [isResetting, setIsResetting] = useState(false);

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


    // Add state for the Online toggle
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        setLoading(true);
        setError("");

        // Fetch either ALL users or ONLINE users based on the toggle!
        const usersPromise = showOnlineOnly ? getActiveUsers() : getAllUsers();

        Promise.all([usersPromise, getAllCategories()])
            .then(([u, c]) => {
                setUsers(u.data);
                setCategories(c.data);
            })
            .catch((err) => {
                console.error("Fetch Error:", err);
                if (!err.response) {
                    setError("Network Error: Backend server is unreachable.");
                } else {
                    setError("Failed to load data.");
                }
            })
            .finally(() => setLoading(false));
    }, [showOnlineOnly]); // Re-fetch when the toggle changes

    // Pagination Derived State
    const totalRecords = filteredUsers.length;
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );


    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="skeleton h-7 w-48 mb-2 rounded-md" />
                    <div className="skeleton h-4 w-72 rounded-md" />
                </div>
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                    <TableSkeleton cols={5} rows={8} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and control user access across the platform.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                            <p className="text-sm font-bold text-red-800">Connection Failed</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* ACTION BAR */} <div className="mt-4 sm:ml-4 sm:mt-0 flex gap-3">
                    {showCreate && (
                        <button
                            onClick={() => setShowCreate(false)}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New User
                    </button>
                </div>
            </div>

            {/* =======================
         CREATE USER CARD
      ======================= */}
            {showCreate && (
                <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    <div className="border-b border-gray-900/10 px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Create New User</h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {createError && (
                            <div className="mb-4 rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">{createError}</p>
                            </div>
                        )}
                        {createSuccess && (
                            <div className="mb-4 rounded-md bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">{createSuccess}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Name</label>
                                <input
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Jane Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Email</label>
                                <input
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Role</label>
                                <select
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="RECRUITER">Recruiter</option>
                                    <option value="CANDIDATE">Candidate</option>
                                </select>
                            </div>

                            {formData.role !== "CANDIDATE" && (
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                                    <div className="relative mt-2">
                                        <input
                                            type={showCreatePassword ? "text" : "password"}
                                            className="block w-full rounded-md border-0 py-1.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {formData.role === "CANDIDATE" && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Candidate Category</label>
                                    <select
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Select Category...</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-end border-t border-gray-900/10 pt-6">
                            <button
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                                onClick={async () => {
                                    try {
                                        setCreateError("");
                                        setCreateSuccess("");

                                        const payload = formData.role === "CANDIDATE"
                                            ? {
                                                name: formData.name.trim(),
                                                email: formData.email.trim().toLowerCase(),
                                                role: "CANDIDATE",
                                                categoryId,
                                            }
                                            : {
                                                name: formData.name.trim(),
                                                email: formData.email.trim().toLowerCase(),
                                                role: formData.role,
                                                password: formData.password.trim(),
                                            };

                                        await createUser(payload);

                                        setCreateSuccess("User created successfully");
                                        setFormData({ name: "", email: "", role: "RECRUITER", password: "" });
                                        setCategoryId("");
                                        refreshUsers();
                                    } catch (err) {
                                        setCreateError(err?.response?.data?.message || "Failed to create user");
                                    }
                                }}
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =======================
            TABLE FILTERS
            ======================= */}
            <div className="mb-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => updateFilters({ q: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => updateFilters({ role: e.target.value })}
                        className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="CANDIDATE">Candidate</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => updateFilters({ status: e.target.value })}
                        className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors border ${showOnlineOnly
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${showOnlineOnly ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                        Online Now
                    </button>
                    {/* Clear Filters Button */}
                    <button
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                        onClick={() => updateFilters({ q: "", role: "ALL", status: "ALL" })}
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                </div>
            </div>


            {/* =======================
             USERS TABLE
            ======================= */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            icon="users"
                                            title="No users found"
                                            description="Try adjusting your search or filter criteria."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{u.name || '-'}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {u.email}
                                            {u.email === loggedInEmail && (
                                                <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">You</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {u.active ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-right flex justify-end gap-3">

                                            {/* Edit */}
                                            <button
                                                disabled={u.email === loggedInEmail}
                                                className={`text-indigo-600 hover:text-indigo-900 transition-colors p-1.5 rounded-md hover:bg-indigo-50 ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                onClick={() => {
                                                    if (u.email === loggedInEmail) return;
                                                    setEditingUser(u);
                                                    setEditData({ name: u.name || "", email: u.email || "", role: u.role, password: "" });
                                                    setEditError("");
                                                    setEditSuccess("");
                                                }}
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            {/* Change Email */}
                                            <button
                                                disabled={u.email === loggedInEmail}
                                                className={`text-sky-600 hover:text-sky-900 transition-colors p-1.5 rounded-md hover:bg-sky-50 ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                onClick={() => {
                                                    if (u.email === loggedInEmail) return;
                                                    setEmailChangeUser(u);
                                                    setNewEmail(u.email || "");
                                                    setEmailChangeError("");
                                                    setEmailChangeSuccess("");
                                                }}
                                                title="Change Email"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>

                                            {/* Change Password (Not for Candidates, they use OTP) */}
                                            {u.role !== "CANDIDATE" && (
                                                <button
                                                    disabled={u.email === loggedInEmail}
                                                    className={`text-violet-600 hover:text-violet-900 transition-colors p-1.5 rounded-md hover:bg-violet-50 ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                    onClick={() => {
                                                        if (u.email === loggedInEmail) return;
                                                        setPasswordChangeUser(u);
                                                        setNewPassword("");
                                                        setPasswordChangeError("");
                                                        setPasswordChangeSuccess("");
                                                    }}
                                                    title="Change Password"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Reset Password (Not for Candidates, they use OTP) */}
                                            {u.role !== "CANDIDATE" && (
                                                <button
                                                    disabled={u.email === loggedInEmail}
                                                    className={`text-amber-500 hover:text-amber-700 transition-colors p-1.5 rounded-md hover:bg-amber-50 ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                    onClick={() => {
                                                        if (u.email === loggedInEmail) return;
                                                        setResetPasswordUser(u);
                                                        setResetPasswordError("");
                                                        setResetPasswordSuccess("");
                                                    }}
                                                    title="Reset Password (email temp password)"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}

                                            {u.active ? (
                                                <button
                                                    disabled={u.email === loggedInEmail}
                                                    className={`text-amber-600 hover:text-amber-900 transition-colors font-semibold ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed" : ""}`}
                                                    onClick={() => {
                                                        if (u.email === loggedInEmail) return;
                                                        deactivateUser(u.id).then(refreshUsers);
                                                    }}
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-green-600 hover:text-green-900 transition-colors font-semibold"
                                                    onClick={() => activateUser(u.id).then(refreshUsers)}
                                                >
                                                    Activate
                                                </button>
                                            )}

                                            {u.role === "CANDIDATE" && !showOnlineOnly && (
                                                <button
                                                    disabled={u.email === loggedInEmail}
                                                    className={`text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                    onClick={() => {
                                                        if (u.email === loggedInEmail) return;
                                                        setUserToDelete(u);
                                                    }}
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {u.role === "CANDIDATE" && showOnlineOnly && (
                                                <button
                                                    disabled={u.email === loggedInEmail}
                                                    className={`text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 ${u.email === loggedInEmail ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                    onClick={() => {
                                                        if (u.email === loggedInEmail) return;
                                                        setUserToKickout(u);
                                                    }}
                                                    title="Kickout Candidate"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium">{Math.min(page * PAGE_SIZE, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => updateFilters({ page: page - 1 })}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => updateFilters({ page: page + 1 })}
                                    disabled={page === totalPages || totalPages === 0}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* =======================
             EDIT USER MODAL
            ======================= */}
            {editingUser && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Edit User</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Update name and role. To change password or email address, use the dedicated action icons in the table.
                                                </p>

                                                {editError && (
                                                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                                        {editError}
                                                    </div>
                                                )}
                                                {editSuccess && (
                                                    <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                                                        {editSuccess}
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Name</label>
                                                        <input
                                                            className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                            value={editData.name}
                                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
                                                        <input
                                                            type="email"
                                                            disabled
                                                            className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-500 bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-0 sm:text-sm sm:leading-6 cursor-not-allowed"
                                                            value={editData.email}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Role</label>
                                                        <select
                                                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                            value={editData.role}
                                                            disabled={editingUser.role === "CANDIDATE"}
                                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                        >
                                                            <option value="ADMIN">Admin</option>
                                                            <option value="RECRUITER">Recruiter</option>
                                                            {editingUser.role === "CANDIDATE" && (
                                                                <option value="CANDIDATE">Candidate</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto transition-colors"
                                        onClick={async () => {
                                            try {
                                                setEditError("");
                                                setEditSuccess("");

                                                const payload = editingUser.role === "CANDIDATE"
                                                    ? { name: editData.name }
                                                    : {
                                                        name: editData.name,
                                                        role: editData.role,
                                                    };

                                                await updateUser(editingUser.id, payload);

                                                setEditSuccess("User updated successfully");
                                                refreshUsers();
                                                setTimeout(() => setEditingUser(null), 500);
                                            } catch (err) {
                                                setEditError(err?.response?.data?.message || "Failed to update user");
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                                        onClick={() => setEditingUser(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* =======================
             DELETE CONFIRMATION MODAL
            ======================= */}
            {userToDelete && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Delete User</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to delete <span className="font-semibold">{userToDelete.email}</span>? This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        onClick={async () => {
                                            try {
                                                await deleteUser(userToDelete.id);
                                                setUserToDelete(null);
                                                refreshUsers();
                                            } catch (err) {
                                                alert(err?.response?.data?.message || "Failed to delete user");
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setUserToDelete(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* =======================
             KICKOUT CONFIRMATION MODAL
            ======================= */}
            {userToKickout && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <UserX className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Kickout User</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to kickout <span className="font-semibold">{userToKickout.email}</span>? This will revoke their session and force them to login again.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        onClick={async () => {
                                            try {
                                                await kickoutUser(userToKickout.id);
                                                setUserToKickout(null);
                                                refreshUsers();
                                            } catch (err) {
                                                alert(err?.response?.data?.message || "Failed to kickout user");
                                            }
                                        }}
                                    >
                                        Kickout
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setUserToKickout(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* =======================
             CHANGE EMAIL MODAL
            ======================= */}
            {emailChangeUser && (
                <div className="relative z-50" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                                            <Mail className="w-5 h-5 text-sky-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">Change Email Address</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Update the email address for <span className="font-semibold">{emailChangeUser.name || emailChangeUser.email}</span>.</p>

                                    {emailChangeError && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{emailChangeError}</div>}
                                    {emailChangeSuccess && <div className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{emailChangeSuccess}</div>}

                                    <label className="block text-sm font-medium text-gray-900 mb-1">New Email Address</label>
                                    <input
                                        type="email"
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="new@email.com"
                                    />
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                    <button
                                        className="inline-flex w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto"
                                        onClick={async () => {
                                            try {
                                                setEmailChangeError(""); setEmailChangeSuccess("");
                                                await changeUserEmail(emailChangeUser.id, newEmail.trim());
                                                setEmailChangeSuccess("Email updated successfully.");
                                                refreshUsers();
                                                setTimeout(() => setEmailChangeUser(null), 800);
                                            } catch (err) {
                                                setEmailChangeError(err?.response?.data?.message || "Failed to update email.");
                                            }
                                        }}
                                    >Save Email</button>
                                    <button
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setEmailChangeUser(null)}
                                    >Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =======================
             CHANGE PASSWORD MODAL
            ======================= */}
            {passwordChangeUser && (
                <div className="relative z-50" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                                            <KeyRound className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Set a new password for <span className="font-semibold">{passwordChangeUser.name || passwordChangeUser.email}</span>.</p>

                                    {passwordChangeError && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{passwordChangeError}</div>}
                                    {passwordChangeSuccess && <div className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{passwordChangeSuccess}</div>}

                                    <label className="block text-sm font-medium text-gray-900 mb-1">New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showResetPassword ? "text" : "password"}
                                            className="block w-full rounded-md border-0 py-1.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowResetPassword(!showResetPassword)}
                                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                    <button
                                        className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 sm:ml-3 sm:w-auto"
                                        onClick={async () => {
                                            try {
                                                setPasswordChangeError(""); setPasswordChangeSuccess("");
                                                await changeUserPassword(passwordChangeUser.id, newPassword);
                                                setPasswordChangeSuccess("Password updated successfully.");
                                                setTimeout(() => setPasswordChangeUser(null), 800);
                                            } catch (err) {
                                                setPasswordChangeError(err?.response?.data?.message || "Failed to update password.");
                                            }
                                        }}
                                    >Save Password</button>
                                    <button
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setPasswordChangeUser(null)}
                                    >Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =======================
             RESET PASSWORD CONFIRM
            ======================= */}
            {resetPasswordUser && (
                <div className="relative z-50" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                            <RotateCcw className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">Reset Password</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        This will send a temporary password to <span className="font-semibold">{resetPasswordUser.email}</span>. They will be required to change it on next login.
                                    </p>

                                    {resetPasswordError && <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{resetPasswordError}</div>}
                                    {resetPasswordSuccess && <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{resetPasswordSuccess}</div>}
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                    <button
                                        disabled={isResetting}
                                        className="inline-flex w-full justify-center rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-400 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={async () => {
                                            try {
                                                setIsResetting(true);
                                                setResetPasswordError(""); setResetPasswordSuccess("");
                                                await resetUserPassword(resetPasswordUser.id);
                                                setResetPasswordSuccess("Temporary password sent to user's email.");
                                                setTimeout(() => setResetPasswordUser(null), 1500);
                                            } catch (err) {
                                                setResetPasswordError(err?.response?.data?.message || "Failed to send reset email.");
                                            } finally {
                                                setIsResetting(false);
                                            }
                                        }}
                                    >
                                        {isResetting ? "Sending..." : "Send Reset Email"}
                                    </button>
                                    <button
                                        disabled={isResetting}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setResetPasswordUser(null)}
                                    >Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
