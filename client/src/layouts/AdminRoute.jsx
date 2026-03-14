import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Make sure you are saving this in Login.jsx!

    // 1. If there is no token, redirect to Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== "Admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;