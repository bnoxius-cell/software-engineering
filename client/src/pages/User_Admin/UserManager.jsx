import React, { useState, useEffect } from "react";
import axios from 'axios';
import { getAvatarUrl } from '../../utils/avatar';

// Import our new UI Components
import Card from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';

// Import CSS Module
import styles from './UserManager.module.css';

import Topbar from "../../components/Topbar";
import Sidebar from '../../components/Sidebar';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [error, setError] = useState('');
    const [adminError, setAdminError] = useState('');
    const role = localStorage.getItem("role");
    const normalizedRole = role ? role.toLowerCase().trim() : "";
    const isAdmin = normalizedRole === "admin";
    const isFaculty = normalizedRole === "faculty";

    // ===== THE RESTORED WORKING FETCH LOGIC =====
    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:5000/api/auth/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!res.ok) throw new Error("Unauthorized or failed to fetch users");
            
            const data = await res.json();
            
            // Correctly mapping data.users and data.total from your backend
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch (err) {
            console.error("Failed to load users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [formData, setFormData] = useState({
        name: "", email: "", password: "", role: ""
    });
    const [adminFormData, setAdminFormData] = useState({
        name: "", email: "", password: ""
    });
    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        if (error) setError('');
    };

    const handleAdminChange = (e) => {
        setAdminFormData({ ...adminFormData, [e.target.name]: e.target.value });
        if (adminError) setAdminError('');
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", role: "" });
    };

    const resetAdminForm = () => {
        setAdminFormData({ name: "", email: "", password: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Admin created accounts are instantly active
            const payload = { ...formData, status: 'Active' };
            await axios.post('http://localhost:5000/api/auth/register', payload);
            resetForm();
            
            // Refresh the user table using the restored fetch function
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Register failed.");
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            await axios.post(
                'http://localhost:5000/api/auth/register/admin',
                { ...adminFormData, status: 'active' },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            resetAdminForm();
            fetchUsers();
        } catch (err) {
            setAdminError(err.response?.data?.message || "Admin account creation failed.");
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        const token = localStorage.getItem("token");
        try {
            // 👇 CHANGED 'users' TO 'auth' HERE 👇
            const res = await fetch(`http://localhost:5000/api/auth/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchUsers(); // Refresh table to show updated status
            } else {
                alert("Failed to update user status.");
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    return (
        <>
            <div className="background-fx"></div>

            <div className="admin-layout">
                <Sidebar activePage="users" />

                <main className="main-view">
                    <Topbar title="User Manager" />

                    <section className={styles.toolbar}>
                        <div className={styles.toolbarActions}>
                            <a href="#create-user-form" className={`${styles.btn} ${styles.btnPrimary}`}>
                                <svg className={styles.icon} viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                                Create New User
                            </a>
                            {isAdmin ? (
                                <a href="#create-admin-form" className={`${styles.btn} ${styles.btnSecondary}`}>
                                    <svg className={styles.icon} viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                    Create Admin User
                                </a>
                            ) : (
                                <div className={styles.permissionNote}>
                                    <strong>Admin accounts:</strong> Only admins can create admin accounts.
                                </div>
                            )}
                            <button className={`${styles.btn} ${styles.btnSecondary}`} disabled title="Bulk Actions (Disabled for UI)">
                                <svg className={styles.icon} viewBox="0 0 24 24">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                                Bulk Actions
                            </button>
                        </div>
                        
                        <div className={styles.searchBar}>
                            <input type="text" className={styles.inputField} placeholder="Search users..." disabled />
                            <button className={`${styles.btn} ${styles.btnSecondary}`} disabled title="Search (Disabled for UI)">
                                <svg className={styles.icon} viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                                Search
                            </button>
                        </div>
                    </section>

                    {/* Create User Form */}
                    <section id="create-user-form" className={styles.panel}>
                        <h2 className={styles.panelTitle}>Create New User</h2>
                        {error && <p style={{color: '#f85149', marginBottom: '1rem'}}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <fieldset className={styles.fieldGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input 
                                    type="text" id="name" name="name" 
                                    className={styles.inputField}
                                    placeholder="Enter user's full name" 
                                    value={formData.name} onChange={handleChange} required 
                                />
                            </fieldset>

                            <fieldset className={styles.fieldGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" id="email" name="email" 
                                    className={styles.inputField}
                                    placeholder="Enter user's email" 
                                    value={formData.email} onChange={handleChange} required 
                                />
                            </fieldset>

                            <fieldset className={styles.fieldGroup}>
                                <label htmlFor="role">User Role</label>
                                <select 
                                    id="role" name="role" 
                                    className={styles.inputField}
                                    value={formData.role} onChange={handleChange} required
                                >
                                    <option value="">Select a role</option>
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </fieldset>

                            <fieldset className={styles.fieldGroup}>
                                <label htmlFor="password">Initial Password</label>
                                <input 
                                    type="password" id="password" name="password" 
                                    className={styles.inputField}
                                    placeholder="Enter initial password" 
                                    value={formData.password} onChange={handleChange} required 
                                />
                            </fieldset>

                            <div className={styles.formActions}>
                                <button type="button" onClick={resetForm} className={`${styles.btn} ${styles.btnSecondary}`}>Clear Form</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create User</button>
                            </div>
                        </form>
                    </section>

                    <section id="create-admin-form" className={styles.panel}>
                        <h2 className={styles.panelTitle}>Admin Account Access</h2>

                        {isAdmin ? (
                            <>
                                {adminError && <p style={{color: '#f85149', marginBottom: '1rem'}}>{adminError}</p>}
                                <form onSubmit={handleAdminSubmit}>
                                    <fieldset className={styles.fieldGroup}>
                                        <label htmlFor="admin-name">Full Name</label>
                                        <input
                                            type="text"
                                            id="admin-name"
                                            name="name"
                                            className={styles.inputField}
                                            placeholder="Enter admin's full name"
                                            value={adminFormData.name}
                                            onChange={handleAdminChange}
                                            required
                                        />
                                    </fieldset>

                                    <fieldset className={styles.fieldGroup}>
                                        <label htmlFor="admin-email">Email Address</label>
                                        <input
                                            type="email"
                                            id="admin-email"
                                            name="email"
                                            className={styles.inputField}
                                            placeholder="Enter admin's email"
                                            value={adminFormData.email}
                                            onChange={handleAdminChange}
                                            required
                                        />
                                    </fieldset>

                                    <fieldset className={styles.fieldGroup}>
                                        <label htmlFor="admin-password">Initial Password</label>
                                        <input
                                            type="password"
                                            id="admin-password"
                                            name="password"
                                            className={styles.inputField}
                                            placeholder="Enter initial password"
                                            value={adminFormData.password}
                                            onChange={handleAdminChange}
                                            required
                                        />
                                    </fieldset>

                                    <div className={styles.formActions}>
                                        <button type="button" onClick={resetAdminForm} className={`${styles.btn} ${styles.btnSecondary}`}>Clear Form</button>
                                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Admin</button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <p className={styles.panelMessage}>
                                Only admins can create admin accounts. Faculty can still manage student and faculty users from this dashboard.
                            </p>
                        )}
                    </section>

                    {/* Current Users Table */}
                    <section className={styles.panel}>
                        <header className={styles.panelHeader}>
                            <h2 className={styles.panelTitle}>Current Users ({totalUsers} Total)</h2>
                            <select className={styles.inputField} style={{ width: "auto" }}>
                                <option value="all">All Users</option>
                                <option value="admin">Admin Users</option>
                                <option value="student">Student Users</option>
                                <option value="faculty">Faculty Users</option>
                            </select>
                        </header>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Avatar</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>ID</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Name</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Email</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Role</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Status</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Joined Date</th>
                                        <th style={{ padding: "1rem", borderBottom: "1px solid #30363d", color: "#8b949e" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{textAlign: 'center', padding: '2rem', color: '#8b949e'}}>
                                                No users found or loading...
                                            </td>
                                        </tr>
                                    ) : users.map((user) => {
                                        const currentStatus = user.status ? user.status.toLowerCase() : 'pending';
                                        
                                        return (
                                        <tr key={user._id} style={{ borderBottom: "1px solid #21262d" }}>
                                            <td style={{ padding: "1rem" }}>
                                                <img
                                                    src={getAvatarUrl(user.avatar)}
                                                    alt={user.name}
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle' }}
                                                />
                                            </td>
                                            <td style={{ padding: "1rem", color: "#8b949e" }}>{user._id.substring(0, 8)}...</td>
                                            <td style={{ padding: "1rem", fontWeight: "600" }}>{user.name}</td>
                                            <td style={{ padding: "1rem" }}>{user.email}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <Badge variant={user.role}>{user.role || 'Student'}</Badge>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <Badge variant={currentStatus === 'pending' ? 'Pending' : currentStatus === 'active' ? 'Active' : 'Suspended'}>
                                                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: "1rem", color: "#8b949e" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <div className={styles.rowActions}>
                                                    
                                                    {currentStatus === 'pending' && user.role !== 'Admin' && (
                                                        <button 
                                                            className={`${styles.btnLink} ${styles.btnApprove}`}
                                                            onClick={() => handleStatusChange(user._id, 'Active')}
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {currentStatus === 'active' && user.role !== 'Admin' && (
                                                        <button 
                                                            className={`${styles.btnLink} ${styles.btnSuspend}`}
                                                            onClick={() => handleStatusChange(user._id, 'Suspended')}
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}

                                                    {currentStatus === 'suspended' && user.role !== 'Admin' && (
                                                        <button 
                                                            className={`${styles.btnLink} ${styles.btnRestore}`}
                                                            onClick={() => handleStatusChange(user._id, 'Active')}
                                                        >
                                                            Restore
                                                        </button>
                                                    )}

                                                    <button className={styles.btnLink} disabled={isFaculty && user.role === 'Admin'}>Edit</button>
                                                    <button className={`${styles.btnLink} ${styles.btnDelete}`} disabled={isFaculty && user.role === 'Admin'}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Additional User Actions Section */}
                    <section className={styles.panel}>
                        <h2 className={styles.panelTitle}>Additional User Actions</h2>
                        <div className={styles.gridCards}>
                            <Card 
                                title="Export User List" 
                                description="Download all user data in CSV or Excel format for reporting and analysis."
                            >
                                <button className={styles.btnLink} disabled>Export Data</button>
                            </Card>
                            
                            <Card 
                                title="Import Users" 
                                description="Upload a CSV file to create multiple users at once. Template available for download."
                            >
                                <button className={styles.btnLink} disabled>Import File</button>
                            </Card>
                            
                            <Card 
                                title="View Activity Logs" 
                                description="Monitor user login activity, changes made, and system interactions."
                            >
                                <button className={styles.btnLink} disabled>View Logs</button>
                            </Card>
                            
                            <Card 
                                title="Bulk Password Reset" 
                                description="Reset passwords for selected users. They'll receive email instructions."
                            >
                                <button className={styles.btnLink} disabled>Reset Passwords</button>
                            </Card>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

export default UserManager;
