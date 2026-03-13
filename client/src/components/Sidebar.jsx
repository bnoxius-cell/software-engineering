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
                <a href="/dashboard" className={styles["menu-link"]}>Dashboard</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/user" className={styles["menu-link"]}>Users</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/upload" className={styles["menu-link"]}>Upload</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="/requests" className={styles["menu-link"]}>Requests</a>
            </li>
            <li className={styles["menu-item"]}>
                <a href="settings" className={styles["menu-link"]}>Settings</a>
            </li>
            <li className={styles["menu-item logout-item"]}>
                <a href="/login" className={styles["logout-link"]} onClick={handleLogout}>Logout</a>
            </li>
        </ul>
    </div>
    )
}

export default Sidebar