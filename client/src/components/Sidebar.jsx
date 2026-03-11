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
    <div className="sidebar">
        <h2 className="brand">Admin Panel</h2>
        <ul className="sidebar-menu">
            <li className="menu-item">
                <Link to="/user" className="menu-link">Users</Link>
            </li>
            <li className="menu-item">
                <Link to="/user" className="menu-link">Works</Link>
            </li>
            <li className="menu-item">
                <Link to="/user" className="menu-link">Requests</Link>
            </li>
            <li className="menu-item logout-item">
                <button onClick={handleLogout} className="logout-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>Logout</button>
            </li>
        </ul>
    </div>
    )
    }

export default Sidebar