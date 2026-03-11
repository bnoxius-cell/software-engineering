import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Index from './pages/Index/Index'
import Login from './pages/Login/Login'
import UserManagement from './pages/admin/UserManagement'
import axios from 'axios'
import { useEffect, useState } from 'react'

function App() {
    const [ user, setUser ] = useState(null);
    const [ error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const res = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setUser(res.data);
                } catch (err) {
                    console.error("Failed to fetch user:", err);
                    setError("Failed to fetch user data");
                    localStorage.removeItem('token');
                }  
            }
        }
        fetchUser();
    }, [])

    return (
        <Router>
            <Routes>

                <Route element={<MainLayout />}>
                    <Route path="/" element={<Index />} />
                </Route>

                <Route path="/login" element={<Login setUser={setUser}  />} />

                <Route element={<AdminLayout />} >
                    <Route path="/user" element={<UserManagement />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App