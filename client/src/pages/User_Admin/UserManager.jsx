import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import our new UI Components
import Card from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';

// Import CSS Module (We no longer import Admin.css here, the Layout handles it)
import styles from './UserManager.module.css';

// Assuming Topbar and Sidebar stay the same for now
import Topbar from "../../components/Topbar";
import Sidebar from '../../components/Sidebar';

const UserManager = () => {
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", role: ""
    });
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]); 
    const [totalUsers, setTotalUsers] = useState(0);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", role: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/register', formData);
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || "Register failed.");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:5000/api/auth/", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (!res.ok) throw new Error("Unauthorized or failed to fetch users");
            return res.json();
        })
        .then((data) => {
            setUsers(data.users);
            setTotalUsers(data.total);
        })
        .catch((err) => console.error(err));
    }, []);

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
                            <a href="#create-admin-form" className={`${styles.btn} ${styles.btnSecondary}`}>
                                <svg className={styles.icon} viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                                Create Admin User
                            </a>
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

                        <table>
                            <thead>
                                <tr>
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
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user._id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge variant={user.role}>{user.role}</Badge>
                                        </td>
                                        <td>
                                            <Badge variant="active">{user.status || "Active"}</Badge>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <button className={styles.btnLink}>Edit</button>
                                                <button className={styles.btnLink}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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