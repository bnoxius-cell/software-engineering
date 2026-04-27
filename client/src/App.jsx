import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'

import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

import Index from './pages/Index/Index'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Gallery from './pages/Gallery/Gallery'
import Notifications from './pages/Notifications/Notifications'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Profile/Profile'
import Upload from './pages/Upload/Upload'

import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

import UserManager from './pages/User_Admin/UserManager'
import Dashboard from './pages/Dashboard_Admin/Dashboard'
import Works from './pages/Works_Admin/Works'
import Requests from './pages/Requests_Admin/Requests'
import AdminSettings from './pages/Settings_Admin/AdminSettings'
import Maintenance from './pages/Maintenance/Maintenance'

function App() {
    const [ user, setUser ] = useState(null);
    const [ error, setError] = useState('');
    const [ settings, setSettings ] = useState(null);

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

                    setError("Failed to fetch user data");
                    localStorage.removeItem('token');
                }  
            }
        }
        fetchUser();
    }, [])

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings/public');
                if (res.data) {
                    setSettings(res.data);
                }
            } catch (err) {
                // Silently fail — public endpoint may not exist yet
            }
        };
        fetchSettings();
    }, []);

    // Apply siteName to document title
    useEffect(() => {
        if (settings?.siteName) {
            document.title = settings.siteName;
        }
    }, [settings]);

    // Determine if maintenance mode should be shown
    const isAdmin = user?.role === 'Admin';
    const inMaintenance = settings?.maintenanceMode && !isAdmin;

    if (inMaintenance) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="*" element={<Maintenance />} />
                </Routes>
            </Router>
        );
    }

    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Index user={user} error={error} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/gallery/:artworkId" element={<Gallery />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/login" element={<Login setUser={setUser}  />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={user ? <Navigate to={`/profile/${user._id || user.id}`} replace /> : <Profile currentUser={user} />} />
                    <Route path="/profile/:userId" element={<Profile currentUser={user} />} />
                </Route>

                <Route element={<AdminLayout />}>
                    <Route path="/user" element={ <UserManager setUser={setUser} />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/works" element={<Works />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
