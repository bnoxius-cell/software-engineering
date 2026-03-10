import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { useEffect, useState } from 'react'

function App() {
    const [ user, setUser ] = useState(null);
    const [ error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
        }

    }, [])

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    )
}

export default App