import React from 'react'
import styles from './Sidebar.module.css'
import { Link, useNavigate } from 'react-router-dom'

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className={styles["sidebar"]}>
        <h2 className={styles["brand"]}>Admin Panel</h2>
        <ul className={styles["sidebar-menu"]}>
            <li className={styles["menu-item"]}>
                <a href="/pages/admin/dashboard.html" className={styles["menu-link"]}>Dashboard</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/pages/admin/user.html" className={styles["menu-link"]}>Users</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/pages/admin/portfolios.html" className={styles["menu-link"]}>Works</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/pages/admin/requests.html" className={styles["menu-link"]}>Requests</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/pages/admin/settings.html" className={styles["menu-link"]}>Settings</a>
            </li>
            <li className={styles["menu-item logout-item"]}>
                <a href="/pages/login.html" className={styles["logout-link"]}>Logout</a>
            </li>
        </ul>
    </div>
    )
    }

export default Sidebar