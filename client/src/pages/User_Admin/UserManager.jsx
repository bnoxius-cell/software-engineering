import React, { useState, useEffect } from 'react';
import styles from './UserManager.module.css'
import Topbar from "../../components/Topbar";
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
    <div className={styles["dashboard"]}>
        <Topbar title="User Management" />

        <main className={styles["main-content"]}>
            <div id="create-user-form" className={styles["form-container"]}>
                <h2 className={styles["form-header"]}>Create New User</h2>

                {/*<!-- Create User Form -->*/}
                <form onSubmit={handleSubmit}>

                    {/* Full Name */}
                    <div className={styles["form-group"]}>
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" placeholder="Enter user's full name" value={formData.name} onChange={handleChange} required />
                    </div>

                    {/* Email */}
                    <div className={styles["form-group"]}>
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Enter user's email" value={formData.email} onChange={handleChange} required />
                    </div>

                    {/* Role */}
                    <div className={styles["form-group"]}>
                        <label htmlFor="role">User Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                            <option value="">Select a role</option>
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                        </select>
                    </div>

                    {/* Password */}
                    <div className={styles["form-group"]}>
                        <label htmlFor="password">Initial Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter initial password" value={formData.password} onChange={handleChange} required />
                    </div>

                    {/* Action Buttons */}
                    <div className={styles["form-actions"]}>
                        <button onClick={resetForm} className={`${styles["btn"]} ${styles["btn-secondary"]}`}>Clear Form</button>
                        <button className={styles["btn btn-primary"]}>Create User</button>
                    </div>
                </form>
            </div>

            {/*<!-- Current Users Table -->*/}
            <section className={styles["users-section"]}>
                <div className={styles["section-header"]}>
                    <h2>Current Users ({totalUsers})</h2>
                    <div>
                        <select className={styles["search-input"]} title="Filter (Disabled for UI)">
                            <option value="all">All Users</option>
                            <option value="admin">Admins</option>
                            <option value="student">Students</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>
                </div>
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
                    {users.map((user) => (
                        <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.status || "active"}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button>Edit</button>
                            <button>Delete</button>
                        </td>
                        </tr>
                    ))}
                </table>    
            </section>

            {/*<!-- Create Admin User Form (Collapsed by default) -->*/}
            <details className={styles["form-container"]} id="create-admin-form">
                <summary className={styles["form-header"]}>
                    <span>
                        <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Create Administrator User (Advanced)
                    </span>
                </summary>
                <div className={styles["form1"]}>

                    {/* Admin Admin Form */}
                    <form action="#" method="post">

                        {/* Name */}
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminFullName">Administrator Full Name</label>
                            <input type="text" id="adminFullName" name="adminFullName" placeholder="Enter admin's full name" required />
                        </div>

                        {/* Email */}
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminEmail">Admin Email Address</label>
                            <input type="email" id="adminEmail" name="adminEmail" placeholder="Enter admin email" required />
                        </div>

                        {/* Admin Permissions */}
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminPermissions">Admin Permissions Level</label>
                            <select id="adminPermissions" name="adminPermissions" required>
                                <option value="">Select permission level</option>
                                <option value="full">Full Administrator</option>
                                <option value="user_management">User Management Only</option>
                                <option value="content_management">Content Management Only</option>
                                <option value="view_only">View Only Access</option>
                            </select>
                        </div>
                        
                        {/* Password */}
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminPassword">Administrator Password</label>
                            <input type="password" id="adminPassword" name="adminPassword" placeholder="Enter strong admin password" required />
                        </div>

                        {/* Action Buttons */}
                        <div className={styles["form-actions"]}>
                            <button type="reset" className={`${styles["btn"]} ${styles["btn-secondary"]}`}>Clear Form</button>
                            <button type="submit" className={`${styles["btn"]} ${styles["btn-primary"]}`}>Create Administrator</button>
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