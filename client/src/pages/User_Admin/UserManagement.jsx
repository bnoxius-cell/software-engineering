import React from 'react'

const UserManagement = () => {
  return (
    <>
    {/*<!-- Background Effect -->*/}
    <div className="admin-bg"></div>

    <div className="dashboard">
    <div id="sidebar"></div>        

        {/*<!-- Main Content -->*/}
        <main className="main-content">
            {/*<!-- Top Bar -->*/}
            <header className="topbar">
                <h1>User Management</h1>
                <a href="home.html" className="admin-profile-link">
                    <div className="admin-profile">
                        <img src="/assets/images/profile_icon.png" alt="Admin Profile" />
                    </div>
                </a>
            </header>

            {/*<!-- Action Buttons -->*/}
            <section className="action-section">
                <div className="action-buttons">
                    <a href="#create-user-form" className="btn btn-primary">
                        <svg className="menu-icon" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Create New User
                    </a>
                    <a href="#create-admin-form" className="btn btn-secondary">
                        <svg className="menu-icon" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Create Admin User
                    </a>
                    <button className="btn btn-secondary" disabled title="Bulk Actions (Disabled for UI)">
                        <svg className="menu-icon" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Bulk Actions
                    </button>
                </div>
                <div className="search-container">
                    <input type="text" className="search-input" placeholder="Search users..." disabled />
                    <button className="btn btn-secondary" disabled title="Search (Disabled for UI)">
                        <svg className="menu-icon" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        Search
                    </button>
                </div>
            </section>

            {/*<!-- Create User Form -->*/}
            <div id="create-user-form" className="form-container">
                <h2 className="form-header">Create New User</h2>
                <form action="#" method="post" id="">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input type="text" id="fullName" name="fullName" placeholder="Enter user's full name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Enter user's email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">User Role</label>
                        <select id="role" name="role" required>
                            <option value="">Select a role</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Initial Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter initial password" required />
                    </div>
                    <div className="form-actions">
                        <button type="reset" className="btn btn-secondary">Clear Form</button>
                        <button type="submit" className="btn btn-primary">Create User</button>
                    </div>
                </form>
            </div>

            {/*<!-- Current Users Table -->*/}
            <section className="users-section">
                <div className="section-header">
                    <h2>Current Users (45 Total)</h2>
                    <div>
                        <select className="search-input" style={{ width: 'auto' }} disabled title="Filter (Disabled for UI)">
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
                            <td><span className="role-badge role-admin">Administrator</span></td>
                            <td><span className="status-badge status-active">Active</span></td>
                            <td>2024-12-01</td>
                            <td>
                                <div className="action-btns">
                                    <a href="#" className="action-btn">Edit</a>
                                    <a href="#" className="action-btn">View</a>
                                    <a href="#" className="action-btn">Suspend</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#002</td>
                            <td>Maria Santos</td>
                            <td>maria.s@student.com</td>
                            <td><span className="role-badge role-student">Student</span></td>
                            <td><span className="status-badge status-active">Active</span></td>
                            <td>2025-01-12</td>
                            <td>
                                <div className="action-btns">
                                    <a href="#" className="action-btn">Edit</a>
                                    <a href="#" className="action-btn">View</a>
                                    <a href="#" className="action-btn">Suspend</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#003</td>
                            <td>Juan Dela Cruz</td>
                            <td>juan.d@student.com</td>
                            <td><span className="role-badge role-student">Student</span></td>
                            <td><span className="status-badge status-active">Active</span></td>
                            <td>2025-01-10</td>
                            <td>
                                <div className="action-btns">
                                    <a href="#" className="action-btn">Edit</a>
                                    <a href="#" className="action-btn">View</a>
                                    <a href="#" className="action-btn">Suspend</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#004</td>
                            <td>Dr. Carlos Reyes</td>
                            <td>c.reyes@faculty.com</td>
                            <td><span className="role-badge role-faculty">Faculty</span></td>
                            <td><span className="status-badge status-pending">Pending</span></td>
                            <td>2024-11-25</td>
                            <td>
                                <div className="action-btns">
                                    <a href="#" className="action-btn">Edit</a>
                                    <a href="#" className="action-btn">View</a>
                                    <a href="#" className="action-btn">Approve</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#005</td>
                            <td>Michael Tan</td>
                            <td>m.tan@student.com</td>
                            <td><span className="role-badge role-student">Student</span></td>
                            <td><span className="status-badge status-suspended">Suspended</span></td>
                            <td>2024-10-15</td>
                            <td>
                                <div className="action-btns">
                                    <a href="#" className="action-btn">Edit</a>
                                    <a href="#" className="action-btn">View</a>
                                    <a href="#" className="action-btn">Activate</a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/*<!-- Additional User Actions Section -->*/}
            <section className="users-section">
                <div className="section-header">
                    <h2>Additional User Actions</h2>
                </div>
                
                <div className="additional-actions">
                    <div className="action-card">
                        <h3>Export User List</h3>
                        <p>Download all user data in CSV or Excel format for reporting and analysis.</p>
                        <button className="action-btn" style="margin-top: 0.5rem;" disabled>Export Data</button>
                    </div>
                    
                    <div className="action-card">
                        <h3>Import Users</h3>
                        <p>Upload a CSV file to create multiple users at once. Template available for download.</p>
                        <button className="action-btn" style="margin-top: 0.5rem;" disabled>Import File</button>
                    </div>
                    
                    <div className="action-card">
                        <h3>View Activity Logs</h3>
                        <p>Monitor user login activity, changes made, and system interactions.</p>
                        <button className="action-btn" style="margin-top: 0.5rem;" disabled>View Logs</button>
                    </div>
                    
                    <div className="action-card">
                        <h3>Bulk Password Reset</h3>
                        <p>Reset passwords for selected users. They'll receive email instructions.</p>
                        <button className="action-btn" style="margin-top: 0.5rem;" disabled>Reset Passwords</button>
                    </div>
                </div>
            </section>

            {/*<!-- Create Admin User Form (Collapsed by default) -->*/}
            <details className="form-container" id="create-admin-form">
                <summary className="form-header" style="cursor: pointer; list-style: none;">
                    <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
                        <svg className="menu-icon" viewBox="0 0 24 24" style="width: 1rem; height: 1rem;">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Create Administrator User (Advanced)
                    </span>
                </summary>
                <div style="margin-top: 1.5rem;">
                    <form action="#" method="post">
                        <div className="form-group">
                            <label for="adminFullName">Administrator Full Name</label>
                            <input type="text" id="adminFullName" name="adminFullName" placeholder="Enter admin's full name" required />
                        </div>
                        <div className="form-group">
                            <label for="adminEmail">Admin Email Address</label>
                            <input type="email" id="adminEmail" name="adminEmail" placeholder="Enter admin email" required />
                        </div>
                        <div className="form-group">
                            <label for="adminPermissions">Admin Permissions Level</label>
                            <select id="adminPermissions" name="adminPermissions" required>
                                <option value="">Select permission level</option>
                                <option value="full">Full Administrator</option>
                                <option value="user_management">User Management Only</option>
                                <option value="content_management">Content Management Only</option>
                                <option value="view_only">View Only Access</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label for="adminPassword">Administrator Password</label>
                            <input type="password" id="adminPassword" name="adminPassword" placeholder="Enter strong admin password" required />
                        </div>
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

export default UserManagement