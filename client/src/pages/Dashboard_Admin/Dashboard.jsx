import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

// Import our Reusable Components
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Badge from '../../components/ui/Badge/Badge';

const Dashboard = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const role = localStorage.getItem('role');
    const isFaculty = role && role.toLowerCase().trim() === 'faculty';
    const userName = user?.name || localStorage.getItem('name') || 'User';

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:5000/api/auth/", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => {
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        })
        .catch((err) => console.error("Failed to fetch users:", err));
    }, []);

    const pendingUsers = users.filter((u) => u.status === 'pending' || !u.status).length;
    const recentUsers = [...users].reverse().slice(0, 5); // Gets the 5 most recent users

    return (
        <>
            {/* Background Effect (from Admin.css) */}
            <div className="background-fx"></div>

            <div className="admin-layout">
                {/* Sidebar automatically sets the active page */}
                <Sidebar activePage="dashboard" />

                <main className="main-view">
                    {/* Topbar automatically handles the sticky header and search/actions */}
                    <Topbar title={isFaculty ? "Faculty Dashboard Overview" : "Dashboard Overview"} />

                    {/* Welcome Banner */}
                    <section className={styles.welcomeBanner}>
                        <h2>Welcome, {userName}!</h2>
                        <p>
                            {isFaculty
                                ? "Here's an overview of student activity and platform metrics."
                                : "Here's your admin overview. Manage users, artworks, and requests from the sidebar."}
                        </p>
                    </section>

                    {/* Stats Cards Section */}
                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Users</h3>
                            <p className={styles.statNumber}>{totalUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Uploaded Works</h3>
                            <p className={styles.statNumber}>892</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Signup Requests</h3>
                            <p className={styles.statNumber}>{pendingUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Drafts</h3>
                            <p className={styles.statNumber}>12</p>
                        </div>
                    </section>

                    {/* Recent Users Table Section */}
                    <section className={styles.panel}>
                        <h2 className={styles.panelTitle}>Recent User Activity</h2>
                        {/* Table styles are globally scoped in Admin.css via the Layout wrapper */}
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Date Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "gray" }}>No recent users</td>
                                    </tr>
                                ) : (
                                    recentUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <Badge variant={user.status || "pending"}>{user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Pending"}</Badge>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
};

export default Dashboard;
