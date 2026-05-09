import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { getAvatarUrl } from '../../utils/avatar';
import Badge from '../../components/ui/Badge/Badge';
import styles from './UserManager.module.css';
import Topbar from "../../components/Topbar";
import Sidebar from '../../components/Sidebar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [error, setError] = useState('');
    const [adminError, setAdminError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
    });
    const [isCreateCollapsed, setIsCreateCollapsed] = useState(true);
    const [isCreateAdminCollapsed, setIsCreateAdminCollapsed] = useState(true);
    const [successMessage, setSuccessMessage] = useState(''); // NEW: for undo feedback
    const ITEMS_PER_PAGE = 10;

    // UNDO state: track last status change
    const [lastAction, setLastAction] = useState(null);

    // Create user form state
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", role: "Student"
    });

    // Create admin user form state (only for admins)
    const [adminFormData, setAdminFormData] = useState({
        name: "", email: "", password: ""
    });

    // Edit user modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: '',
        password: ''
    });
    const [editAvatarFile, setEditAvatarFile] = useState(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState('');
    const [updatingUser, setUpdatingUser] = useState(false);
    const [editError, setEditError] = useState('');

    const role = localStorage.getItem("role");
    const normalizedRole = role ? role.toLowerCase().trim() : "";
    const isAdmin = normalizedRole === "admin";
    const isFaculty = normalizedRole === "faculty";

    const createUserRef = useRef(null);

    // Auto-clear success message after 4 seconds
    useEffect(() => {
        if (!successMessage) return;
        const timer = setTimeout(() => setSuccessMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [successMessage]);

    // Fetch users
    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/auth/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Unauthorized");
            const data = await res.json();
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch (err) {
            console.error("Failed to load users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Stats calculations
    const activeUsers = users.filter(u => u.status?.toLowerCase() === 'active').length;
    const pendingUsers = users.filter(u => u.status?.toLowerCase() === 'pending').length;
    const suspendedUsers = users.filter(u => u.status?.toLowerCase() === 'suspended').length;

    // Filter and pagination
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ---- Create user handlers ----
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", role: "Student" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const payload = { ...formData, status: 'pending' };
            await axios.post(`${API_BASE}/api/auth/register`, payload);
            resetForm();
            fetchUsers();
            setError('');
            setIsCreateCollapsed(true);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        }
    };

    // ---- Create admin user handlers ----
    const handleAdminChange = (e) => {
        setAdminFormData({ ...adminFormData, [e.target.name]: e.target.value });
        if (adminError) setAdminError('');
    };

    const resetAdminForm = () => {
        setAdminFormData({ name: "", email: "", password: "" });
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `${API_BASE}/api/auth/register/admin`,
                { ...adminFormData, status: 'active' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            resetAdminForm();
            fetchUsers();
            setAdminError('');
            setIsCreateAdminCollapsed(true);
        } catch (err) {
            setAdminError(err.response?.data?.message || "Admin account creation failed.");
        }
    };

    // ---- Status change handlers (with confirmation) ----
    const handleStatusChange = async (userId, newStatus, actionName) => {
        const token = localStorage.getItem("token");
        // Find current user to get previous status
        const user = users.find(u => u._id === userId);
        if (!user) return;

        const previousStatus = user.status;

        try {
            const res = await fetch(`${API_BASE}/api/auth/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchUsers();
                // Store last action for undo
                setLastAction({
                    userId,
                    previousStatus,
                    newStatus,
                    userName: user.name,
                    actionName
                });
                setSuccessMessage(`Action "${actionName}" completed. You can undo it.`);
            } else {
                alert(`Failed to ${actionName} user.`);
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    // UNDO last action
    const undoLastAction = async () => {
        if (!lastAction) return;

        const { userId, previousStatus, userName, actionName } = lastAction;
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/api/auth/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: previousStatus })
            });

            if (res.ok) {
                await fetchUsers();
                setLastAction(null);
                setSuccessMessage(`Undo successful: "${userName}" reverted to ${previousStatus}.`);
            } else {
                setError(`Failed to undo ${actionName}.`);
            }
        } catch (err) {
            console.error("Undo error:", err);
            setError("Could not undo last action.");
        }
    };

    const confirmStatusChange = (userId, newStatus, actionName, message) => {
        confirmAction(
            `${actionName} User`,
            message,
            () => handleStatusChange(userId, newStatus, actionName)
        );
    };

    // ---- Edit user handlers ----
    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'Student',
            password: ''
        });
        setEditAvatarPreview(getAvatarUrl(user.avatar));
        setEditAvatarFile(null);
        setEditError('');
        setShowEditModal(true);
    };

    const handleEditAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setEditAvatarFile(file);
            setEditAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateUser = async () => {
        if (!editForm.name.trim()) {
            setEditError("Name is required.");
            return;
        }
        if (!editForm.email.trim()) {
            setEditError("Email is required.");
            return;
        }
        setUpdatingUser(true);
        setEditError('');
        const token = localStorage.getItem("token");
        try {
            const updateData = {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                role: editForm.role
            };
            if (editForm.password.trim()) {
                updateData.password = editForm.password.trim();
            }
            const updateRes = await fetch(`${API_BASE}/api/auth/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
            if (!updateRes.ok) {
                const errData = await updateRes.json();
                throw new Error(errData.message || "Failed to update user");
            }

            if (editAvatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', editAvatarFile);
                await fetch(`${API_BASE}/api/auth/avatar`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: avatarFormData
                });
            }

            setShowEditModal(false);
            fetchUsers();
        } catch (err) {
            setEditError(err.message);
        } finally {
            setUpdatingUser(false);
        }
    };

    // ---- CSV export with confirmation ----
    const exportCSV = () => {
        confirmAction(
            "Export filtered users?",
            `This will export ${filteredUsers.length} user(s) as a CSV file.`,
            () => {
                const headers = ["ID", "Name", "Email", "Role", "Status", "Joined Date"];
                const rows = filteredUsers.map((u) => [
                    u._id,
                    u.name,
                    u.email,
                    u.role || "Student",
                    u.status || "Pending",
                    new Date(u.createdAt).toLocaleDateString(),
                ]);
                const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `users_${new Date().toISOString().slice(0, 19)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }
        );
    };

    // ---- Confirmation dialog ----
    const confirmAction = (title, message, onConfirm) => {
        setConfirmDialog({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
    };

    // Scroll to create user form
    const scrollToCreateUser = () => {
        setIsCreateCollapsed(false);
        createUserRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <div className="background-fx"></div>
            <div className="admin-layout">
                <Sidebar activePage="users" />
                <main className="main-view">
                    <Topbar title="User Manager" />

                    {/* Success / Error Messages */}
                    {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    {/* Stats Cards */}
                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Users</h3>
                            <p className={styles.statNumber}>{totalUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Active Users</h3>
                            <p className={styles.statNumber}>{activeUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Pending Requests</h3>
                            <p className={styles.statNumber}>{pendingUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Suspended Users</h3>
                            <p className={styles.statNumber}>{suspendedUsers}</p>
                        </div>
                    </section>

                    {/* Create New User Button (above search/filter) */}
                    <section className={styles.createUserButtonRow}>
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={scrollToCreateUser}>
                            ➕ Create New User
                        </button>
                    </section>

                    {/* Search / Filter / Refresh / Undo */}
                    <section className={styles.actionSection}>
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <select
                                className={styles.filterSelect}
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={fetchUsers}>
                                Refresh
                            </button>
                            {/* Undo Last Action Button */}
                            <button
                                className={`${styles.btn} ${styles.btnUndo}`}
                                onClick={() => {
                                    if (lastAction) {
                                        confirmAction(
                                            "Undo Last Action",
                                            `Revert "${lastAction.actionName}" for ${lastAction.userName}?`,
                                            undoLastAction
                                        );
                                    } else {
                                        alert("No action to undo.");
                                    }
                                }}
                                disabled={!lastAction}
                            >
                                ↩️ Undo Last Action
                            </button>
                        </div>
                    </section>

                    {/* User Table */}
                    <section className={styles.panel}>
                        <div className={styles.tableHeader}>
                            <h2 className={styles.panelTitle}>All Users ({filteredUsers.length} / {totalUsers})</h2>
                            <div className={styles.tableActionsHelp}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1ff14" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                                <span>Actions: Approve ✅ | Suspend ⚠️ | Restore 🔄 | Edit ✏️</span>
                            </div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table className={styles.userTable}>
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#8b949e" }}>
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map((user) => {
                                            const currentStatus = user.status ? user.status.toLowerCase() : 'pending';
                                            const canEdit = isAdmin || (isFaculty && user.role === 'Student');
                                            return (
                                                <tr
                                                    key={user._id}
                                                    onClick={() => canEdit && openEditModal(user)}
                                                    style={{ cursor: canEdit ? 'pointer' : 'default' }}
                                                    className={styles.clickableRow}
                                                >
                                                    <td>
                                                        <img src={getAvatarUrl(user.avatar)} alt={user.name} className={styles.avatarImg} />
                                                    </td>
                                                    <td className={styles.userId}>{user._id.substring(0, 8)}...</td>
                                                    <td className={styles.userName}>{user.name}</td>
                                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
                                                    <td><Badge variant={user.role}>{user.role || 'Student'}</Badge></td>
                                                    <td>
                                                        <Badge variant={currentStatus === 'pending' ? 'Pending' : currentStatus === 'active' ? 'Active' : 'Suspended'}>
                                                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                                        </Badge>
                                                    </td>
                                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td className={styles.actionTd} onClick={(e) => e.stopPropagation()}>
                                                        <div className={styles.rowActions}>
                                                            {currentStatus === 'pending' && user.role !== 'Admin' && (
                                                                <button
                                                                    className={`${styles.btnLink} ${styles.btnApprove}`}
                                                                    onClick={() => confirmStatusChange(user._id, 'Active', 'Approve', `Are you sure you want to approve "${user.name}"?`)}
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {currentStatus === 'active' && user.role !== 'Admin' && (
                                                                <button
                                                                    className={`${styles.btnLink} ${styles.btnSuspend}`}
                                                                    onClick={() => confirmStatusChange(user._id, 'Suspended', 'Suspend', `Suspending "${user.name}" will prevent them from logging in. Are you sure?`)}
                                                                >
                                                                    Suspend
                                                                </button>
                                                            )}
                                                            {currentStatus === 'suspended' && user.role !== 'Admin' && (
                                                                <button
                                                                    className={`${styles.btnLink} ${styles.btnRestore}`}
                                                                    onClick={() => confirmStatusChange(user._id, 'Active', 'Restore', `Restore "${user.name}"?`)}
                                                                >
                                                                    Restore
                                                                </button>
                                                            )}
                                                            {canEdit && (
                                                                <button className={styles.btnLink} onClick={() => openEditModal(user)}>Edit</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination + CSV export */}
                        <div className={styles.paginationBar}>
                            <div className={styles.paginationButtons}>
                                <button
                                    className={`${styles.paginationBtn} ${currentPage === 1 ? styles.disabled : ''}`}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                                <button
                                    className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                            <div className={styles.exportWrapper}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={exportCSV}>
                                    Export CSV
                                </button>
                                <span className={styles.exportNote}>Exports filtered users as CSV</span>
                            </div>
                        </div>
                    </section>

                    {/* Collapsible Create User Form (regular) */}
                    <div className={styles.createCollapsible} ref={createUserRef}>
                        <button
                            className={styles.createToggle}
                            onClick={() => setIsCreateCollapsed(!isCreateCollapsed)}
                        >
                            {isCreateCollapsed ? "➕ Create New User" : "➖ Hide Create User Form"}
                        </button>
                        {!isCreateCollapsed && (
                            <div className={styles.formContainer}>
                                <h2 className={styles.formHeader}>Create New User</h2>
                                {error && <p className={styles.errorMsg}>{error}</p>}
                                <form onSubmit={handleSubmit}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.inputField} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.inputField} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Role</label>
                                        <select name="role" value={formData.role} onChange={handleChange} className={styles.inputField} required>
                                            <option value="Student">Student</option>
                                            <option value="Faculty">Faculty</option>
                                            {isAdmin && <option value="Admin">Admin</option>}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Initial Password</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.inputField} required />
                                    </div>
                                    <div className={styles.formActions}>
                                        <button type="button" onClick={resetForm} className={`${styles.btn} ${styles.btnSecondary}`}>Clear</button>
                                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create User</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Collapsible Create Admin Form (only for admins) */}
                    {isAdmin && (
                        <div className={styles.createCollapsible}>
                            <button
                                className={styles.createToggle}
                                onClick={() => setIsCreateAdminCollapsed(!isCreateAdminCollapsed)}
                            >
                                {isCreateAdminCollapsed ? "👑 Create New Admin User" : "➖ Hide Create Admin Form"}
                            </button>
                            {!isCreateAdminCollapsed && (
                                <div className={styles.formContainer}>
                                    <h2 className={styles.formHeader}>Create New Admin Account</h2>
                                    {adminError && <p className={styles.errorMsg}>{adminError}</p>}
                                    <form onSubmit={handleAdminSubmit}>
                                        <div className={styles.formGroup}>
                                            <label>Full Name</label>
                                            <input type="text" name="name" value={adminFormData.name} onChange={handleAdminChange} className={styles.inputField} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Email</label>
                                            <input type="email" name="email" value={adminFormData.email} onChange={handleAdminChange} className={styles.inputField} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Initial Password</label>
                                            <input type="password" name="password" value={adminFormData.password} onChange={handleAdminChange} className={styles.inputField} required />
                                        </div>
                                        <div className={styles.formActions}>
                                            <button type="button" onClick={resetAdminForm} className={`${styles.btn} ${styles.btnSecondary}`}>Clear</button>
                                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Admin</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Edit User Modal (unchanged) */}
            {showEditModal && editingUser && (
                <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.editUserModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Edit User</h3>
                            <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>&times;</button>
                        </div>
                        {editError && <div className={styles.modalError}>{editError}</div>}
                        <div className={styles.editUserContent}>
                            <div className={styles.avatarSection}>
                                <img src={editAvatarPreview} alt="Avatar" className={styles.editAvatar} />
                                <label className={styles.uploadAvatarBtn}>
                                    Change Avatar
                                    <input type="file" accept="image/*" onChange={handleEditAvatarChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className={`${styles.inputField} ${styles.selectWithArrow}`}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                    {isAdmin && <option value="Admin">Admin</option>}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>New Password (leave empty to keep unchanged)</label>
                                <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className={styles.inputField} />
                            </div>
                            <div className={styles.modalActions}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleUpdateUser} disabled={updatingUser}>
                                    {updatingUser ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmDialog.isOpen && (
                <div className={styles.modalOverlay} onClick={closeConfirm}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>{confirmDialog.title}</h3>
                        <p>{confirmDialog.message}</p>
                        <div className={styles.confirmActions}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeConfirm}>Cancel</button>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManager;