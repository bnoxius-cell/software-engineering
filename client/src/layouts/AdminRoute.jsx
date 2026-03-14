import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!role || role.toLowerCase().trim() !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;