import React, { useState } from 'react'
import styles from './UserManagement.module.css'
import Topbar from "../../components/Topbar";
import axios from 'axios'

const UserManagement = () => {
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
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    {/* Password */}
                    <div className={styles["form-group"]}>
                        <label htmlFor="password">Initial Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter initial password" value={formData.password} onChange={handleChange} required />
                    </div>

                    {/* Form Buttons */}
                    <div className={styles["form-actions"]}>
                        <button onClick={resetForm} className={styles["btn btn-secondary"]}>Clear Form</button>
                        <button className={styles["btn btn-primary"]}>Create User</button>
                    </div>
                </form>
            </div>

            {/*<!-- Current Users Table -->*/}
            <section className={styles["users-section"]}>
                <div className={styles["section-header"]}>
                    <h2>Current Users (45 Total)</h2>
                    <div>
                        <select className={styles["search-input"]}  disabled title="Filter (Disabled for UI)">
                            <option value="all">All Users</option>
                            <option value="admin">Admin Users</option>
                            <option value="student">Student Users</option>
                            <option value="faculty">Faculty Users</option>
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
                    <tbody>
                        <tr>
                            <td>#001</td>
                            <td>Admin User</td>
                            <td>admin@emcartisan.com</td>
                            <td><span className={styles["role-badge role-admin"]}>Administrator</span></td>
                            <td><span className={styles["status-badge status-active"]}>Active</span></td>
                            <td>2024-12-01</td>
                            <td>
                                <div className={styles["action-btns"]}>
                                    <a href="#">Edit</a>
                                    <a href="#">View</a>
                                    <a href="#">Suspend</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#002</td>
                            <td>Maria Santos</td>
                            <td>maria.s@student.com</td>
                            <td><span className={styles["role-badge role-student"]}>Student</span></td>
                            <td><span className={styles["status-badge status-active"]}>Active</span></td>
                            <td>2025-01-12</td>
                            <td>
                                <div className={styles["action-btns"]}>
                                    <a href="#">Edit</a>
                                    <a href="#">View</a>
                                    <a href="#">Suspend</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#003</td>
                            <td>Juan Dela Cruz</td>
                            <td>juan.d@student.com</td>
                            <td><span className={styles["role-badge role-student"]}>Student</span></td>
                            <td><span className={styles["status-badge status-active"]}>Active</span></td>
                            <td>2025-01-10</td>
                            <td>
                                <div className={styles["action-btns"]}>
                                    <a href="#">Edit</a>
                                    <a href="#">View</a>
                                    <a href="#">Suspend</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#004</td>
                            <td>Dr. Carlos Reyes</td>
                            <td>c.reyes@faculty.com</td>
                            <td><span className={styles["role-badge role-faculty"]}>Faculty</span></td>
                            <td><span className={styles["status-badge status-pending"]}>Pending</span></td>
                            <td>2024-11-25</td>
                            <td>
                                <div className={styles["action-btns"]}>
                                    <a href="#">Edit</a>
                                    <a href="#">View</a>
                                    <a href="#">Approve</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#005</td>
                            <td>Michael Tan</td>
                            <td>m.tan@student.com</td>
                            <td><span className={styles["role-badge role-student"]}>Student</span></td>
                            <td><span className={styles["status-badge status-suspended"]}>Suspended</span></td>
                            <td>2024-10-15</td>
                            <td>
                                <div className={styles["action-btns"]}>
                                    <a href="#">Edit</a>
                                    <a href="#">View</a>
                                    <a href="#">Activate</a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/*<!-- Additional User Actions Section -->*/}
            <section className={styles["users-section"]}>
                <div className={styles["section-header"]}>
                    <h2>Additional User Actions</h2>
                </div>
                
                <div className={styles["additional-actions"]}>
                    <div className={styles["action-card"]}>
                        <h3>Export User List</h3>
                        <p>Download all user data in CSV or Excel format for reporting and analysis.</p>
                        <button className={styles["action-btn"]} disabled>Export Data</button>
                    </div>
                    
                    <div className={styles["action-card"]}>
                        <h3>Import Users</h3>
                        <p>Upload a CSV file to create multiple users at once. Template available for download.</p>
                        <button className={styles["action-btn"]} disabled>Import File</button>
                    </div>
                    
                    <div className={styles["action-card"]}>
                        <h3>View Activity Logs</h3>
                        <p>Monitor user login activity, changes made, and system interactions.</p>
                        <button className={styles["action-btn"]} disabled>View Logs</button>
                    </div>
                    
                    <div className={styles["action-card"]}>
                        <h3>Bulk Password Reset</h3>
                        <p>Reset passwords for selected users. They'll receive email instructions.</p>
                        <button className={styles["action-btn"]} disabled>Reset Passwords</button>
                    </div>
                </div>
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
                
                    <form action="#" method="post">
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminFullName">Administrator Full Name</label>
                            <input type="text" id="adminFullName" name="adminFullName" placeholder="Enter admin's full name" required />
                        </div>
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminEmail">Admin Email Address</label>
                            <input type="email" id="adminEmail" name="adminEmail" placeholder="Enter admin email" required />
                        </div>
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
                        <div className={styles["form-group"]}>
                            <label htmlFor="adminPassword">Administrator Password</label>
                            <input type="password" id="adminPassword" name="adminPassword" placeholder="Enter strong admin password" required />
                        </div>
                        <div className={styles["form-actions"]}>
                            <button type="reset" className={styles["btn btn-secondary"]}>Clear Form</button>
                            <button type="submit" className={styles["btn btn-primary"]}>Create Administrator</button>
                        </div>
                    </form>
                </div>
            </details>
        </main>
    </div>
    </>
  )
}

export default UserManagement