import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import '../styles/Admin.css';

const AdminLayout = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const normalizedRole = role ? role.toLowerCase().trim() : "";

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!["admin", "faculty"].includes(normalizedRole)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-theme-root">
            <Outlet />
        </div>
    );
};

export default AdminLayout;
