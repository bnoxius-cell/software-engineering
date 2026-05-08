import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { getAvatarUrl } from '../../utils/avatar';
import { isVideoArtwork } from '../../utils/artworkMedia';

// Import our Reusable Components
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Badge from '../../components/ui/Badge/Badge';

const Dashboard = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalArtworks, setTotalArtworks] = useState(0);
    const [recentWorks, setRecentWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role');
    const isFaculty = role && role.toLowerCase().trim() === 'faculty';
    const userName = user?.name || localStorage.getItem('name') || 'User';

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch users
                const usersRes = await fetch("http://localhost:5000/api/auth/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const usersData = await usersRes.json();
                setUsers(usersData.users || []);
                setTotalUsers(usersData.total || usersData.users?.length || 0);

                // 2. Fetch all published artworks (for total count and recent list)
                const artworksRes = await fetch("http://localhost:5000/api/artworks?status=published", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const artworksData = await artworksRes.json();
                const publishedArtworks = Array.isArray(artworksData) ? artworksData : [];
                setTotalArtworks(publishedArtworks.length);

                // 3. Get 5 most recent artworks
                const sorted = [...publishedArtworks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentWorks(sorted.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setTotalArtworks(0);
                setRecentWorks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const pendingUsers = users.filter((u) => u.status === 'pending' || !u.status).length;
    const recentUsers = [...users].reverse().slice(0, 5);

    return (
        <>
            {/* Background Effect */}
            <div className="background-fx"></div>

            <div className="admin-layout">
                <Sidebar activePage="dashboard" />

                <main className="main-view">
                    <Topbar title={isFaculty ? "Faculty Dashboard Overview" : "Dashboard Overview"} />

                    {/* Welcome Banner */}
                    <section className={styles.welcomeBanner}>
                        <h2>Welcome, {userName}!</h2>
                        <p>
                            {isFaculty
                                ? "Here's an overview of student activity and platform metrics."
                                : "Here's your admin overview. Manage users, artworks, and requests from the sidebar."}
                        </p>
                    </section>

                    {/* Stats Cards */}
                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Users</h3>
                            <p className={styles.statNumber}>{totalUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Uploaded Works</h3>
                            <p className={styles.statNumber}>{totalArtworks}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Signup Requests</h3>
                            <p className={styles.statNumber}>{pendingUsers}</p>
                        </div>
                    </section>

                    {/* Recent Users Table */}
                    <section className={styles.panel}>
                        <h2 className={styles.panelTitle}>Recent User Activity</h2>
                        <div style={{ overflowX: "auto" }}>
                            <table className="userTable">
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Date Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "gray" }}>No recent users</td>
                                        </tr>
                                    ) : (
                                        recentUsers.map((user) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <img
                                                        src={getAvatarUrl(user.avatar)}
                                                        alt={user.name}
                                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                </td>
                                                <td>{user.name}</td>
                                                <td>{user.role}</td>
                                                <td>
                                                    <Badge variant={user.status || "pending"}>
                                                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Pending"}
                                                    </Badge>
                                                </td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* NEW: Recent Works Table */}
                    <section className={styles.panel}>
                        <h2 className={styles.panelTitle}>Recent Artwork Submissions</h2>
                        <div style={{ overflowX: "auto" }}>
                            <table className="userTable">
                                <thead>
                                    <tr>
                                        <th>Thumbnail</th>
                                        <th>Title</th>
                                        <th>Artist</th>
                                        <th>Medium</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentWorks.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "gray" }}>
                                                No recent artworks found.
                                             </td>
                                        </tr>
                                    ) : (
                                        recentWorks.map((work) => (
                                            <tr key={work._id}>
                                                <td>
                                                    {isVideoArtwork(work) ? (
                                                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#000' }}>
                                                            <video
                                                                src={`http://localhost:5000${work.image}`}
                                                                poster={work.thumbnail ? `http://localhost:5000${work.thumbnail}` : undefined}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                muted
                                                                preload="metadata"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={`http://localhost:5000${work.image}`}
                                                            alt={work.title}
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                                                        />
                                                    )}
                                                 </td>
                                                <td>{work.title}</td>
                                                <td>{work.artistName || 'Unknown Artist'}</td>
                                                <td>{work.medium || 'Not specified'}</td>
                                                <td>
                                                    <Badge variant={work.status}>
                                                        {work.status ? work.status.charAt(0).toUpperCase() + work.status.slice(1) : "Published"}
                                                    </Badge>
                                                 </td>
                                                <td>{new Date(work.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

export default Dashboard;