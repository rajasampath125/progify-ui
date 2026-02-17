import React, { useEffect, useState } from "react";
import { getAllUsers, activateUser, deactivateUser, createUser } from "../../api/adminApi";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = JSON.parse(localStorage.getItem("auth"));
    const loggedInEmail = auth?.email;

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "RECRUITER",
        password: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);


    const refreshUsers = () => {
        const auth = JSON.parse(localStorage.getItem("auth"));
        if (!auth?.token) {
            return;
        }

        setLoading(true);
        getAllUsers()
            .then((res) => setUsers(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refreshUsers();
    }, []);


    if (loading && users.length === 0) {
        return (
            <div style={{ padding: "40px" }}>
                <a href="/admin/dashboard">← Back to Dashboard</a>
                <p>Loading users...</p>
            </div>
        );
    }

    const activeAdminsCount = users.filter(
        (u) => u.role === "ADMIN" && u.active
    ).length;

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase());

        const matchesRole =
            roleFilter === "ALL" || user.role === roleFilter;

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && user.active) ||
            (statusFilter === "INACTIVE" && !user.active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / pageSize);
    const paginatedUsers = users.slice(
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
            {/* Back navigation */}
            <a
                href="/admin/dashboard"
                style={{
                    display: "inline-block",
                    marginBottom: "24px",
                    textDecoration: "none",
                    color: "#2563eb",
                }}
            >
                ← Back to Dashboard
            </a>

            <h1 style={{ marginBottom: "24px" }}>User Management</h1>

            {/* Create User Section */}
            <div
                style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "32px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                    }}
                >
                    <h3 style={{ margin: 0 }}>
                        {showCreateForm ? "New User Details" : "Create User"}
                    </h3>


                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "1px solid #d1d5db",
                            background: "#ffffff",
                            fontSize: "20px",
                            lineHeight: "0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        title={showCreateForm ? "Close" : "Add User"}
                    >
                        {showCreateForm ? "×" : "+"}
                    </button>

                </div>
                {showCreateForm && (
                    <div
                        style={{
                            marginTop: "16px",
                            paddingTop: "16px",
                            borderTop: "1px solid #e5e7eb",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                        }}
                    >
                        {/* Name */}
                        <div>
                            <input
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                style={inputStyle}
                            />
                            {submitted && !formData.name && (
                                <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                    Name is required
                                </div>
                            )}

                        </div>

                        {/* Email */}
                        <div>
                            <input
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                style={inputStyle}
                            />
                            {submitted && !formData.email && (
                                <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                    Email is required
                                </div>
                            )}

                        </div>

                        {/* Role */}
                        <div>
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                                style={inputStyle}
                            >
                                <option value="ADMIN">ADMIN</option>
                                <option value="RECRUITER">RECRUITER</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                style={inputStyle}
                            />
                            {submitted && !formData.password && (
                                <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                    Password is required
                                </div>
                            )}

                        </div>

                        {/* Action */}
                        <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
                            <button
                                disabled={submitting}
                                onClick={async () => {

                                    setSubmitted(true);

                                    setFormError("");
                                    setFormSuccess("");

                                    if (!formData.name || !formData.email || !formData.password) {
                                        setFormError("All fields are required");
                                        return;
                                    }

                                    try {
                                        setSubmitting(true);
                                        await createUser(formData);

                                        setFormSuccess("User created successfully");

                                        setSubmitted(false);

                                        setFormData({
                                            name: "",
                                            email: "",
                                            role: "RECRUITER",
                                            password: "",
                                        });

                                        refreshUsers();

                                        setTimeout(() => {
                                            setShowCreateForm(false);
                                            setFormSuccess("");
                                        }, 1000);
                                    } catch (err) {
                                        setFormError("Failed to create user");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                style={{
                                    padding: "8px 16px",
                                    cursor: submitting ? "not-allowed" : "pointer",
                                    opacity: submitting ? 0.6 : 1,
                                }}
                            >
                                {submitting ? "Creating..." : "Create"}
                            </button>
                            {formError && (
                                <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>
                                    {formError}
                                </div>
                            )}

                            {formSuccess && (
                                <div style={{ color: "#16a34a", fontSize: "13px", marginTop: "8px" }}>
                                    {formSuccess}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>


            {formError && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "10px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "6px",
                    }}
                >
                    {formError}
                </div>
            )}

            {formSuccess && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "10px",
                        background: "#dcfce7",
                        color: "#166534",
                        borderRadius: "6px",
                    }}
                >
                    {formSuccess}
                </div>
            )}

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px",
                    alignItems: "center",
                }}
            >
                <input
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...inputStyle, width: "240px" }}
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={inputStyle}
                >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="CANDIDATE">CANDIDATE</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={inputStyle}
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

                <button
                    onClick={() => {
                        setSearch("");
                        setRoleFilter("ALL");
                        setStatusFilter("ALL");
                    }}
                    style={{
                        padding: "8px 14px",
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        cursor: "pointer",
                    }}
                >
                    Clear
                </button>

            </div>


            {/* Users Table */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#ffffff",
                }}
            >
                <thead>
                    <tr>
                        <th style={th}>Name</th>
                        <th style={th}>Email</th>
                        <th style={th}>Role</th>
                        <th style={th}>Status</th>
                        <th style={th}>Category</th>
                        <th style={th}>Last Login</th>
                        <th style={th}>Actions</th>

                    </tr>
                </thead>
                <tbody>
                    {paginatedUsers.map((user) => (
                        <tr key={user.id}>
                            <td style={td}>{user.name}</td>
                            <td style={td}>{user.email}</td>
                            <td style={td}>{user.role}</td>
                            <td style={td}>
                                {user.active ? "Active" : "Inactive"}
                            </td>
                            <td style={td}>{user.categoryName ?? "-"}</td>
                            <td style={td}>{formatDateTime(user.lastLogin)}</td>
                            <td style={td}>
                                {user.active ? (() => {
                                    // const isSelf = user.email === loggedInEmail;
                                    const isSelf = false;
                                    const isLastAdmin =
                                        user.role === "ADMIN" &&
                                        user.active &&
                                        activeAdminsCount === 1;

                                    return (
                                        <button
                                            disabled={isSelf || isLastAdmin}
                                            onClick={async () => {
                                                setFormError("");
                                                setFormSuccess("");

                                                try {
                                                    await deactivateUser(user.id);
                                                    setFormSuccess("User deactivated successfully");
                                                    refreshUsers();
                                                } catch {
                                                    setFormError("Failed to deactivate user");
                                                }
                                            }}

                                            style={{
                                                opacity: isSelf || isLastAdmin ? 0.5 : 1,
                                                cursor: isSelf || isLastAdmin ? "not-allowed" : "pointer",
                                            }}
                                            title={
                                                isSelf
                                                    ? "You cannot deactivate yourself"
                                                    : isLastAdmin
                                                        ? "At least one active admin is required"
                                                        : ""
                                            }
                                        >
                                            Deactivate
                                        </button>
                                    );
                                })() : (
                                    <button
                                        onClick={async () => {
                                            setFormError("");
                                            setFormSuccess("");

                                            try {
                                                await activateUser(user.id);
                                                setFormSuccess("User activated successfully");
                                                refreshUsers();
                                            } catch {
                                                setFormError("Failed to activate user");
                                            }
                                        }}
                                    >
                                        Activate
                                    </button>
                                )}
                            </td>


                        </tr>
                    ))}
                </tbody>
            </table>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                }}
            >
                {/* Page info */}
                <div style={{ fontSize: "14px", color: "#374151" }}>
                    Showing {(currentPage - 1) * pageSize + 1}
                    –
                    {Math.min(currentPage * pageSize, totalUsers)}
                    {" "}of {totalUsers} users
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Prev
                    </button>

                    <span style={{ fontSize: "14px" }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                    </button>

                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

        </div>
    );
};

/* ===== Table Styles ===== */

const th = {
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    color: "#374151",
};

const td = {
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    fontSize: "14px",
};

const inputStyle = {
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "14px",
};


const formatDateTime = (isoString) => {
    if (!isoString) return "-";

    const d = new Date(isoString);

    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};



export default AdminUsersPage;




// import React, { useEffect, useState } from "react";
// import { getAllCategories, getAllUsers, activateUser, deactivateUser, createUser } from "../../api/adminApi";

// const AdminUsersPage = () => {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);

//     //const auth = JSON.parse(localStorage.getItem("auth"));
//     const adminProfileRaw = localStorage.getItem("adminProfile");
//     const adminProfile = adminProfileRaw ? JSON.parse(adminProfileRaw) : null;
//     const loggedInEmail = adminProfile?.email;

//     const [editingUser, setEditingUser] = useState(null);
//     const [editData, setEditData] = useState({
//         name: "",
//         role: "",
//         password: ""
//     });

//     const [showCreateForm, setShowCreateForm] = useState(false);
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         role: "RECRUITER",
//         password: "",
//     });

//     const [submitting, setSubmitting] = useState(false);
//     const [formError, setFormError] = useState("");
//     const [formSuccess, setFormSuccess] = useState("");
//     const [submitted, setSubmitted] = useState(false);

//     const [search, setSearch] = useState("");
//     const [roleFilter, setRoleFilter] = useState("ALL");
//     const [statusFilter, setStatusFilter] = useState("ALL");

//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);
//     const [categories, setCategories] = useState([]);
//     const [categoryId, setCategoryId] = useState("");

//     // useEffect(() => {
//     //     getAllCategories()
//     //         .then((res) => setCategories(res.data))
//     //         .catch((err) => {
//     //             console.error("Failed to load categories", err);
//     //         });
//     // }, []);

// const refreshUsers = () => {
//     setLoading(true);

//     getAllUsers()
//         .then((res) => setUsers(res.data))
//         .finally(() => setLoading(false));
// };
//     // const refreshUsers = () => {
//     //     const auth = JSON.parse(localStorage.getItem("auth"));
//     //     if (!auth?.token) {
//     //         return;
//     //     }

//     //     setLoading(true);
//     //     getAllUsers()
//     //         .then((res) => setUsers(res.data))
//     //         .finally(() => setLoading(false));
//     // };
// useEffect(() => {
//     getAllCategories()
//         .then((res) => setCategories(res.data));
// }, []);


//     useEffect(() => {
//         refreshUsers();
//     }, []);


//     if (loading && users.length === 0) {
//         return (
//             <div style={{ padding: "40px" }}>
//                 <a href="/admin/dashboard">← Back to Dashboard</a>
//                 <p>Loading users...</p>
//             </div>
//         );
//     }

//     const activeAdminsCount = users.filter(
//         (u) => u.role === "ADMIN" && u.active
//     ).length;

//     const filteredUsers = users.filter((user) => {
//         const matchesSearch =
//             user.name?.toLowerCase().includes(search.toLowerCase()) ||
//             user.email?.toLowerCase().includes(search.toLowerCase());

//         const matchesRole =
//             roleFilter === "ALL" || user.role === roleFilter;

//         const matchesStatus =
//             statusFilter === "ALL" ||
//             (statusFilter === "ACTIVE" && user.active) ||
//             (statusFilter === "INACTIVE" && !user.active);

//         return matchesSearch && matchesRole && matchesStatus;
//     });

//     const totalUsers = filteredUsers.length;
//     const totalPages = Math.ceil(totalUsers / pageSize);
//     const paginatedUsers = filteredUsers.slice(
//         (currentPage - 1) * pageSize,
//         currentPage * pageSize
//     );


//     return (
//         <div
//             style={{
//                 padding: "40px 24px",
//                 maxWidth: "1100px",
//                 margin: "0 auto",
//             }}
//         >
//             {/* Back navigation */}
//             <a
//                 href="/admin/dashboard"
//                 style={{
//                     display: "inline-block",
//                     marginBottom: "24px",
//                     textDecoration: "none",
//                     color: "#2563eb",
//                 }}
//             >
//                 ← Back to Dashboard
//             </a>

//             <h1 style={{ marginBottom: "24px" }}>User Management</h1>

//             {/* Create User Section */}
//             <div
//                 style={{
//                     background: "#f9fafb",
//                     border: "1px solid #e5e7eb",
//                     borderRadius: "8px",
//                     padding: "20px",
//                     marginBottom: "32px",
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginBottom: "16px",
//                     }}
//                 >
//                     <h3 style={{ margin: 0 }}>
//                         {showCreateForm ? "New User Details" : "Create User"}
//                     </h3>


//                     <button
//                         onClick={() => setShowCreateForm(!showCreateForm)}
//                         style={{
//                             width: "32px",
//                             height: "32px",
//                             borderRadius: "50%",
//                             border: "1px solid #d1d5db",
//                             background: "#ffffff",
//                             fontSize: "20px",
//                             lineHeight: "0",
//                             cursor: "pointer",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                         }}
//                         title={showCreateForm ? "Close" : "Add User"}
//                     >
//                         {showCreateForm ? "×" : "+"}
//                     </button>

//                 </div>
//                 {showCreateForm && (
//                     <div
//                         style={{
//                             marginTop: "16px",
//                             paddingTop: "16px",
//                             borderTop: "1px solid #e5e7eb",
//                             display: "grid",
//                             gridTemplateColumns: "1fr 1fr",
//                             gap: "16px",
//                         }}
//                     >
//                         {/* Name */}
//                         <div>
//                             <input
//                                 placeholder="Name"
//                                 value={formData.name}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, name: e.target.value })
//                                 }
//                                 style={inputStyle}
//                             />
//                             {submitted && !formData.name && (
//                                 <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
//                                     Name is required
//                                 </div>
//                             )}

//                         </div>

//                         {/* Email */}
//                         <div>
//                             <input
//                                 placeholder="Email"
//                                 value={formData.email}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, email: e.target.value })
//                                 }
//                                 style={inputStyle}
//                             />
//                             {submitted && !formData.email && (
//                                 <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
//                                     Email is required
//                                 </div>
//                             )}

//                         </div>

//                         {/* Role */}
//                         <div>
//                             <select
//                                 value={formData.role}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, role: e.target.value })
//                                 }
//                                 style={inputStyle}
//                             >
//                                 <option value="ADMIN">ADMIN</option>
//                                 <option value="RECRUITER">RECRUITER</option>
//                                 <option value="CANDIDATE">CANDIDATE</option>
//                             </select>
//                         </div>

//                         {/* Password */}
//                         {formData.role !== "CANDIDATE" && (
//                             <div>
//                                 <input
//                                     type="password"
//                                     placeholder="Password"
//                                     value={formData.password}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, password: e.target.value })
//                                     }
//                                     style={inputStyle}
//                                 />
//                                 {submitted && !formData.password && (
//                                     <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
//                                         Password is required
//                                     </div>
//                                 )}

//                             </div>
//                         )}

//                         {/* CATEGORY (ONLY FOR CANDIDATE) */}
//                         {formData.role === "CANDIDATE" && (
//                             <div>
//                                 <select
//                                     value={categoryId}
//                                     onChange={(e) => setCategoryId(e.target.value)}
//                                     style={inputStyle}
//                                 >
//                                     <option value="">Select Category</option>
//                                     {categories.map((cat) => (
//                                         <option key={cat.id} value={cat.id}>
//                                             {cat.name}
//                                         </option>
//                                     ))}
//                                 </select>

//                                 {submitted && !categoryId && (
//                                     <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
//                                         Category is required for candidates
//                                     </div>
//                                 )}
//                             </div>
//                         )}


//                         {/* Action */}
//                         {/* Action */}
//                         <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
//                             <button
//                                 disabled={submitting}
//                                 onClick={async () => {
//                                     setSubmitted(true);
//                                     setFormError("");
//                                     setFormSuccess("");

//                                     // ✅ Validation rules
//                                     if (!formData.name || !formData.email) {
//                                         setFormError("Name and Email are required");
//                                         return;
//                                     }

//                                     if (formData.role !== "CANDIDATE" && !formData.password) {
//                                         setFormError("Password is required for Admin or Recruiter");
//                                         return;
//                                     }

//                                     if (formData.role === "CANDIDATE" && !categoryId) {
//                                         setFormError("Category is required for candidates");
//                                         return;
//                                     }

//                                     try {
//                                         setSubmitting(true);

//                                         // ✅ Payload: do NOT send password for CANDIDATE
//                                         const payload =
//                                             formData.role === "CANDIDATE"
//                                                 ? {
//                                                     name: formData.name,
//                                                     email: formData.email,
//                                                     role: formData.role,
//                                                     categoryId,
//                                                 }
//                                                 : formData;

//                                         await createUser(payload);

//                                         setFormSuccess("User created successfully");
//                                         setSubmitted(false);

//                                         setFormData({
//                                             name: "",
//                                             email: "",
//                                             role: "RECRUITER",
//                                             password: "",
//                                         });
//                                         setCategoryId(""); //Reset category after success

//                                         refreshUsers();

//                                         setTimeout(() => {
//                                             setShowCreateForm(false);
//                                             setFormSuccess("");
//                                         }, 1000);
//                                     } catch (err) {
//                                         setFormError("Failed to create user");
//                                     } finally {
//                                         setSubmitting(false);
//                                     }
//                                 }}
//                                 style={{
//                                     padding: "8px 16px",
//                                     cursor: submitting ? "not-allowed" : "pointer",
//                                     opacity: submitting ? 0.6 : 1,
//                                 }}
//                             >
//                                 {submitting ? "Creating..." : "Create"}
//                             </button>

//                             {formError && (
//                                 <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>
//                                     {formError}
//                                 </div>
//                             )}

//                             {formSuccess && (
//                                 <div style={{ color: "#16a34a", fontSize: "13px", marginTop: "8px" }}>
//                                     {formSuccess}
//                                 </div>
//                             )}
//                         </div>

//                     </div>
//                 )}
//             </div>


//             {formError && (
//                 <div
//                     style={{
//                         marginBottom: "16px",
//                         padding: "10px",
//                         background: "#fee2e2",
//                         color: "#991b1b",
//                         borderRadius: "6px",
//                     }}
//                 >
//                     {formError}
//                 </div>
//             )}

//             {formSuccess && (
//                 <div
//                     style={{
//                         marginBottom: "16px",
//                         padding: "10px",
//                         background: "#dcfce7",
//                         color: "#166534",
//                         borderRadius: "6px",
//                     }}
//                 >
//                     {formSuccess}
//                 </div>
//             )}

//             {/* Filters */}
//             <div
//                 style={{
//                     display: "flex",
//                     gap: "12px",
//                     marginBottom: "16px",
//                     alignItems: "center",
//                 }}
//             >
//                 <input
//                     placeholder="Search by name or email"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     style={{ ...inputStyle, width: "240px" }}
//                 />

//                 <select
//                     value={roleFilter}
//                     onChange={(e) => setRoleFilter(e.target.value)}
//                     style={inputStyle}
//                 >
//                     <option value="ALL">All Roles</option>
//                     <option value="ADMIN">ADMIN</option>
//                     <option value="RECRUITER">RECRUITER</option>
//                     <option value="CANDIDATE">CANDIDATE</option>
//                 </select>

//                 <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     style={inputStyle}
//                 >
//                     <option value="ALL">All Status</option>
//                     <option value="ACTIVE">Active</option>
//                     <option value="INACTIVE">Inactive</option>
//                 </select>

//                 <button
//                     onClick={() => {
//                         setSearch("");
//                         setRoleFilter("ALL");
//                         setStatusFilter("ALL");
//                     }}
//                     style={{
//                         padding: "8px 14px",
//                         border: "1px solid #d1d5db",
//                         background: "#ffffff",
//                         cursor: "pointer",
//                     }}
//                 >
//                     Clear
//                 </button>

//             </div>


//             {/* Users Table */}
//             <table
//                 style={{
//                     width: "100%",
//                     borderCollapse: "collapse",
//                     background: "#ffffff",
//                 }}
//             >
//                 <thead>
//                     <tr>
//                         <th style={th}>Name</th>
//                         <th style={th}>Email</th>
//                         <th style={th}>Role</th>
//                         <th style={th}>Status</th>
//                         <th style={th}>Category</th>
//                         <th style={th}>Last Login</th>
//                         <th style={th}>Actions</th>

//                     </tr>
//                 </thead>
//                 <tbody>
//                     {paginatedUsers.map((user) => (
//                         <tr key={user.id}>
//                             <td style={td}>{user.name}</td>
//                             <td style={td}>
//                                 {user.email}
//                                 {user.email === loggedInEmail && (
//                                     <span style={{ fontSize: "13px", color: "#0038a7" }}> (You)</span>
//                                 )}
//                             </td>
//                             <td style={td}>{user.role}</td>
//                             <td style={td}>
//                                 {user.active ? "Active" : "Inactive"}
//                             </td>
//                             <td style={td}>{user.categoryName ?? "-"}</td>
//                             <td style={td}>{formatDateTime(user.lastLogin)}</td>
//                             <td style={td}>

//                                 {/* EDIT BUTTON */}
//                                 <button
//                                     disabled={
//                                         user.email === loggedInEmail || user.role === "CANDIDATE"
//                                     }
//                                     onClick={() => {
//                                         setEditingUser(user);
//                                         setEditData({
//                                             name: user.name,
//                                             role: user.role,
//                                             password: ""
//                                         });
//                                     }}
//                                     title={
//                                         user.email === loggedInEmail
//                                             ? "You cannot edit yourself"
//                                             : user.role === "CANDIDATE"
//                                                 ? "Candidate edit disabled"
//                                                 : "Edit user"
//                                     }
//                                 >
//                                     Edit
//                                 </button> &nbsp;&nbsp;

//                                 {/* ACTIVATE / DEACTIVATE USER LOGIC */}
//                                 {user.active ? (() => {
//                                     const isSelf = user.email === loggedInEmail;
//                                     //const isSelf = false;
//                                     const isLastAdmin =
//                                         user.role === "ADMIN" &&
//                                         user.active &&
//                                         activeAdminsCount === 1;

//                                     return (
//                                         <button
//                                             disabled={isSelf || isLastAdmin}
//                                             onClick={async () => {
//                                                 setFormError("");
//                                                 setFormSuccess("");

//                                                 try {
//                                                     await deactivateUser(user.id);
//                                                     setFormSuccess("User deactivated successfully");
//                                                     refreshUsers();
//                                                 } catch {
//                                                     setFormError("Failed to deactivate user");
//                                                 }
//                                             }}

//                                             style={{
//                                                 opacity: isSelf || isLastAdmin ? 0.5 : 1,
//                                                 cursor: isSelf || isLastAdmin ? "not-allowed" : "pointer",
//                                             }}
//                                             title={
//                                                 isSelf
//                                                     ? "You cannot deactivate yourself"
//                                                     : isLastAdmin
//                                                         ? "At least one active admin is required"
//                                                         : ""
//                                             }
//                                         >
//                                             Deactivate
//                                         </button>
//                                     );
//                                 })() : (
//                                     <button
//                                         onClick={async () => {
//                                             setFormError("");
//                                             setFormSuccess("");

//                                             try {
//                                                 await activateUser(user.id);
//                                                 setFormSuccess("User activated successfully");
//                                                 refreshUsers();
//                                             } catch {
//                                                 setFormError("Failed to activate user");
//                                             }
//                                         }}
//                                     >
//                                         Activate
//                                     </button>
//                                 )}
//                             </td>


//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginTop: "16px",
//                 }}
//             >
//                 {/* Page info */}
//                 <div style={{ fontSize: "14px", color: "#374151" }}>
//                     Showing {(currentPage - 1) * pageSize + 1}
//                     –
//                     {Math.min(currentPage * pageSize, totalUsers)}
//                     {" "}of {totalUsers} users
//                 </div>

//                 {/* Controls */}
//                 <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//                     <button
//                         disabled={currentPage === 1}
//                         onClick={() => setCurrentPage((p) => p - 1)}
//                     >
//                         Prev
//                     </button>

//                     <span style={{ fontSize: "14px" }}>
//                         Page {currentPage} of {totalPages}
//                     </span>

//                     <button
//                         disabled={currentPage === totalPages}
//                         onClick={() => setCurrentPage((p) => p + 1)}
//                     >
//                         Next
//                     </button>

//                     <select
//                         value={pageSize}
//                         onChange={(e) => {
//                             setPageSize(Number(e.target.value));
//                             setCurrentPage(1);
//                         }}
//                     >
//                         <option value={10}>10</option>
//                         <option value={25}>25</option>
//                         <option value={50}>50</option>
//                     </select>
//                 </div>
//             </div>

//             {/* ===================== */}
//             {/* EDIT USER MODAL */}
//             {/* ===================== */}
//             {editingUser && (
//                 <div
//                     style={{
//                         position: "fixed",
//                         inset: 0,
//                         background: "rgba(0,0,0,0.4)",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         zIndex: 1000,
//                     }}
//                 >
//                     <div
//                         style={{
//                             width: "420px",
//                             background: "#ffffff",
//                             borderRadius: "12px",
//                             padding: "24px",
//                             boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
//                         }}
//                     >
//                         <h3 style={{ marginBottom: "20px" }}>Edit User</h3>
//                         <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
//                             Update user details and permissions
//                         </p>

//                         {/* NAME */}
//                         <div style={{ marginBottom: "12px" }}>
//                             <label>Name</label>
//                             <input
//                                 value={editData.name}
//                                 onChange={(e) =>
//                                     setEditData({ ...editData, name: e.target.value })
//                                 }
//                                 style={modalInput}
//                             />
//                         </div>

//                         {/* ROLE (ADMIN / RECRUITER ONLY) */}
//                         <div style={{ marginBottom: "12px" }}>
//                             <label>Role</label>
//                             <select
//                                 value={editData.role}
//                                 onChange={(e) =>
//                                     setEditData({ ...editData, role: e.target.value })
//                                 }
//                                 style={modalInput}
//                             >
//                                 <option value="ADMIN">ADMIN</option>
//                                 <option value="RECRUITER">RECRUITER</option>
//                             </select>
//                         </div>

//                         {/* PASSWORD RESET */}
//                         <div style={{ marginBottom: "16px" }}>
//                             <label>Reset Password (optional)</label>
//                             <input
//                                 type="password"
//                                 placeholder="Leave blank to keep current password"
//                                 value={editData.password}
//                                 onChange={(e) =>
//                                     setEditData({ ...editData, password: e.target.value })
//                                 }
//                                 style={modalInput}
//                             />
//                         </div>

//                         {/* ACTIONS */}
//                         <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
//                             <button
//                                 onClick={() => {
//                                     setEditingUser(null);
//                                     setEditData({ name: "", role: "", password: "" });
//                                 }}
//                             >
//                                 Cancel
//                             </button>

//                             <button
//                                 onClick={async () => {
//                                     try {
//                                         setFormError("");
//                                         setFormSuccess("");

//                                         // 🔒 Frontend validation
//                                         if (!editData.name) {
//                                             setFormError("Name is required");
//                                             return;
//                                         }

//                                         // REAL backend call
//                                         await updateUser(editingUser.id, editData);

//                                         // Only runs if backend returns 200
//                                         setFormSuccess("User updated successfully");
//                                         setEditingUser(null);
//                                         refreshUsers();

//                                     } catch (err) {
//                                         // Backend rejected (e.g. role change)
//                                         setFormError(
//                                             err?.response?.data || "Failed to update user"
//                                         );
//                                     }
//                                 }}
//                             >
//                                 Save
//                             </button>

//                         </div>
//                     </div>
//                 </div>
//             )}


//         </div>
//     );
// };

// /* ===== Table Styles ===== */

// const th = {
//     borderBottom: "1px solid #e5e7eb",
//     padding: "12px",
//     textAlign: "left",
//     fontSize: "14px",
//     color: "#374151",
// };

// const td = {
//     borderBottom: "1px solid #e5e7eb",
//     padding: "12px",
//     fontSize: "14px",
// };

// const inputStyle = {
//     padding: "8px",
//     border: "1px solid #d1d5db",
//     borderRadius: "4px",
//     fontSize: "14px",
// };


// const formatDateTime = (isoString) => {
//     if (!isoString) return "-";

//     const d = new Date(isoString);

//     return d.toLocaleString(undefined, {
//         year: "numeric",
//         month: "short",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//     });
// };

// const modalInput = {
//     width: "100%",
//     padding: "8px 10px",
//     border: "1px solid #d1d5db",
//     borderRadius: "6px",
//     fontSize: "14px",
// };


// export default AdminUsersPage;
