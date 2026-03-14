import React from 'react';
import styles from './Dashboard.module.css';

// Import our Reusable Components
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Badge from '../../components/ui/Badge/Badge';

const Dashboard = () => {
    return (
        <>
            {/* Background Effect (from Admin.css) */}
            <div className="background-fx"></div>

            <div className="admin-layout">
                {/* Sidebar automatically sets the active page */}
                <Sidebar activePage="dashboard" />

                <main className="main-view">
                    {/* Topbar automatically handles the sticky header and search/actions */}
                    <Topbar title="Dashboard Overview" />

                    {/* Stats Cards Section */}
                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Users</h3>
                            <p className={styles.statNumber}>1,245</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Uploaded Works</h3>
                            <p className={styles.statNumber}>892</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Signup Requests</h3>
                            <p className={styles.statNumber}>12</p>
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
                                <tr>
                                    <td>Juan Dela Cruz</td>
                                    <td>Student</td>
                                    <td><Badge variant="active">Active</Badge></td>
                                    <td>2025-01-10</td>
                                </tr>
                                <tr>
                                    <td>Maria Santos</td>
                                    <td>Student</td>
                                    <td><Badge variant="pending">Pending</Badge></td>
                                    <td>2025-01-12</td>
                                </tr>
                                <tr>
                                    <td>Admin User</td>
                                    <td>Administrator</td>
                                    <td><Badge variant="admin">Active</Badge></td>
                                    <td>2024-12-01</td>
                                </tr>
                                <tr>
                                    <td>Carlos Reyes</td>
                                    <td>Student</td>
                                    <td><Badge variant="active">Active</Badge></td>
                                    <td>2024-11-25</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
};

export default Dashboard;