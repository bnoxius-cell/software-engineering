import React from 'react'
import styles from './Sidebar.module.css'

const Sidebar = () => {
  return (
    <div className="sidebar">
        <h2 className="brand">Admin Panel</h2>
        <ul className="sidebar-menu">
            <li className="menu-item">
                <a href="/pages/admin/dashboard.html" className="menu-link">Dashboard</a>
            </li>
            <li className="menu-item">
                <a href="/pages/admin/user.html" className="menu-link">Users</a>
            </li>
            <li className="menu-item">
                <a href="/pages/admin/portfolios.html" className="menu-link">Works</a>
            </li>
            <li className="menu-item">
                <a href="/pages/admin/requests.html" className="menu-link">Requests</a>
            </li>
            <li className="menu-item">
                <a href="/pages/admin/settings.html" className="menu-link">Settings</a>
            </li>
            <li className="menu-item logout-item">
                <a href="/pages/login.html" className="logout-link">Logout</a>
            </li>
        </ul>
    </div>
    )
    }

export default Sidebar