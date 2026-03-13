import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'

import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

import Index from './pages/Index/Index'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Gallery from './pages/Gallery/Gallery'

import Login from './pages/Login/Login'

import UserManagement from './pages/User_Admin/UserManagement'
import Dashboard from './pages/Dashboard_Admin/Dashboard'
import Portfolios from './pages/Portfolios/Portfolios'


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
                    <Route path="/" element={<Index user={user} error={error} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/gallery" element={<Gallery />} />
                </Route>

                <Route path="/login" element={<Login setUser={setUser}  />} />

                <Route element={<AdminLayout />} >
                    <Route path="/user" element={ <UserManagement setUser={setUser} />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolios" element={<Portfolios />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App