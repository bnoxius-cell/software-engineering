import React, { useState, useEffect } from 'react';
import './UserManager.css'
import '../../styles/Admin.css'
import Topbar from "../../components/Topbar";
import Sidebar from '../../components/Sidebar'
import axios from 'axios'

const UserManager = () => {
    const [ formData, setFormData ] = useState({
        name: "",
        email: "",
        password: "",
        role: ""
    })

    // eslint-disable-next-line no-unused-vars
    const [ error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: ""
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        try {
            const res = await axios.post('/api/auth/register', formData);
            console.log(res)
            
            resetForm()
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.message || "Register failed.") 
        }
    }

    const [users, setUsers] = useState([]); // state to hold users
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token"); // token stored after login
        if (!token) return;

        fetch("http://localhost:5000/api/auth/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => {
            if (!res.ok) throw new Error("Unauthorized or failed to fetch users");
            return res.json();
        })
        .then((data) => {
            setUsers(data.users)
            setTotalUsers(data.total)
        })
        .catch((err) => console.error(err));
    }, []);

    return (
        <>
            {/* Background Effect */}
            <div className="background-fx"></div>

            <div className="admin-layout">
                {/* Sidebar */}
                <Sidebar activePage="users" />

                {/* Main Content */}
                <main className="main-view">

                    {/* Top Bar */}
                    <Topbar title="User Manager" />

                    {/* Create User Form */}
                    <section id="create-user-form" className="panel">
                        <h2>Create New User</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                <label htmlFor="name">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    className="input-field"
                                    placeholder="Enter user's full name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </fieldset>

                            {/* Email */}
                            <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    className="input-field"
                                    placeholder="Enter user's email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </fieldset>

                            {/* Role */}
                            <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                <label htmlFor="role">User Role</label>
                                <select 
                                    id="role" 
                                    name="role" 
                                    className="input-field"
                                    value={formData.role} 
                                    onChange={handleChange} 
                                    required
                                >
                                    <option value="">Select a role</option>
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </fieldset>

                            {/* Password */}
                            <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                <label htmlFor="password">Initial Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    className="input-field"
                                    placeholder="Enter initial password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </fieldset>

                            {/* Form Buttons */}
                            <div className="form-actions">
                                <button type="button" onClick={resetForm} className="btn btn-secondary">Clear Form</button>
                                <button type="submit" className="btn btn-primary">Create User</button>
                            </div>
                        </form>
                    </section>

                    {/* Current Users Table */}
                    <section className="panel">
                        <header className="panel-header">
                            <h2>Current Users ({totalUsers} Total)</h2>
                            <select className="input-field" style={{ width: "auto" }}>
                                <option value="all">All Users</option>
                                <option value="admin">Admin Users</option>
                                <option value="student">Student Users</option>
                                <option value="faculty">Faculty Users</option>
                            </select>
                        </header>

                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user._id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge badge-${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-active">
                                                {user.status || "Active"}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="btn-link">Edit</button>
                                                <button className="btn-link">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Additional User Actions Section */}
                    <section className="panel">
                        <h2>Additional User Actions</h2>
                        <div className="grid-cards">
                            <div className="card">
                                <h3>Export User List</h3>
                                <p>Download all user data in CSV or Excel format for reporting and analysis.</p>
                                <button className="btn-link" style={{ marginTop: '0.5rem' }} disabled>Export Data</button>
                            </div>
                            
                            <div className="card">
                                <h3>Import Users</h3>
                                <p>Upload a CSV file to create multiple users at once. Template available for download.</p>
                                <button className="btn-link" style={{ marginTop: '0.5rem' }} disabled>Import File</button>
                            </div>
                            
                            <div className="card">
                                <h3>View Activity Logs</h3>
                                <p>Monitor user login activity, changes made, and system interactions.</p>
                                <button className="btn-link" style={{ marginTop: '0.5rem' }} disabled>View Logs</button>
                            </div>
                            
                            <div className="card">
                                <h3>Bulk Password Reset</h3>
                                <p>Reset passwords for selected users. They'll receive email instructions.</p>
                                <button className="btn-link" style={{ marginTop: '0.5rem' }} disabled>Reset Passwords</button>
                            </div>
                        </div>
                    </section>

                    {/* Create Admin User Form (Collapsed by default) */}
                    <details className="panel" id="create-admin-form">
                        <summary className="panel-header" style={{ cursor: "pointer", listStyle: "none", marginBottom: 0 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <svg className="icon" viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                                Create Administrator User (Advanced)
                            </span>
                        </summary>
                        <div style={{ marginTop: "1.5rem" }}>
                            <form action="#" method="post">
                                <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                    <label htmlFor="adminFullName">Administrator Full Name</label>
                                    <input type="text" id="adminFullName" name="adminFullName" className="input-field" placeholder="Enter admin's full name" required />
                                </fieldset>
                                
                                <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                    <label htmlFor="adminEmail">Admin Email Address</label>
                                    <input type="email" id="adminEmail" name="adminEmail" className="input-field" placeholder="Enter admin email" required />
                                </fieldset>
                                
                                <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                    <label htmlFor="adminPermissions">Admin Permissions Level</label>
                                    <select id="adminPermissions" name="adminPermissions" className="input-field" required>
                                        <option value="">Select permission level</option>
                                        <option value="full">Full Administrator</option>
                                        <option value="user_management">User Management Only</option>
                                        <option value="content_management">Content Management Only</option>
                                        <option value="view_only">View Only Access</option>
                                    </select>
                                </fieldset>
                                
                                <fieldset className="field-group" style={{ border: 'none', padding: 0 }}>
                                    <label htmlFor="adminPassword">Administrator Password</label>
                                    <input type="password" id="adminPassword" name="adminPassword" className="input-field" placeholder="Enter strong admin password" required />
                                </fieldset>
                                
                                <div className="form-actions">
                                    <button type="reset" className="btn btn-secondary">Clear Form</button>
                                    <button type="submit" className="btn btn-primary">Create Administrator</button>
                                </div>
                            </form>
                        </div>
                    </details>

                </main>
            </div>
        </>
    )
}

export default UserManager