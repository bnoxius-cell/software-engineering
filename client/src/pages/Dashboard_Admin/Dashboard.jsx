import React from 'react'
import styles from "./Dashboard.module.css"
import Topbar from "../../components/Topbar";

const Dashboard = () => {
  return (
    <>
    <div className={styles["dashboard"]}>
        <Topbar title="Admin Dashboard" />
        
        {/* <!-- Main Content --> */}
        <main className={styles["main-content"]}>

            {/* <!-- TODO -->
            <!-- Stats Cards --> */}
            <section className={styles["stats-grid"]}>
                <div className={styles["stat-card"]}>
                    <h3>Total Users</h3>
                    <p className={styles["stat-number"]}>1,245</p>
                </div>
                <div className={styles["stat-card"]}>
                    <h3>Uploaded Works</h3>
                    <p className={styles["stat-number"]}>892</p>
                </div>
                <div className={styles["stat-card"]}>
                    <h3>Signup Requests</h3>
                    <p className={styles["stat-number"]}>12</p>
                </div>
                <div className={styles["stat-card"]}>
                    <h3>Drafts</h3>
                    <p className={styles["stat-number"]}>12</p>
                </div>
            </section>
            {/* <!-- TODO -->
            <!-- Recent Users Table --> */}
            <section className={styles["table-section"]}>
                <h2>Recent User Activity</h2>
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
                            <td><span className={`${styles["status-badge"]} ${styles["status-active"]}`}>Active</span></td>
                            <td>2025-01-10</td>
                        </tr>
                        <tr>
                            <td>Maria Santos</td>
                            <td>Student</td>
                            <td><span className={`${styles["status-badge"]} ${styles["status-pending"]}`}>Pending</span></td>
                            <td>2025-01-12</td>
                        </tr>
                        <tr>
                            <td>Admin User</td>
                            <td>Administrator</td>
                            <td><span className={`${styles["status-badge"]} ${styles["status-active"]}`}>Active</span></td>
                            <td>2024-12-01</td>
                        </tr>
                        <tr>
                            <td>Carlos Reyes</td>
                            <td>Student</td>
                            <td><span className={`${styles["status-badge"]} ${styles["status-active"]}`}>Active</span></td>
                            <td>2024-11-25</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </main>
    </div>
    </>
  )
}

export default Dashboard