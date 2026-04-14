import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from './Profile.module.css';
import { isVideoArtwork } from '../../utils/artworkMedia';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = ({ currentUser }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('portfolio');
    const [profileUser, setProfileUser] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [savedArtworks, setSavedArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            let targetId = userId;
            
            // If no user ID in URL, we want to show the current logged-in user
            if (!targetId) {
                if (currentUser) {
                    targetId = currentUser._id || currentUser.id;
                } else if (localStorage.getItem('token')) {
                    // Current user fetch is likely still pending in App.jsx
                    return;
                } else {
                    navigate('/login');
                    return;
                }
            }

            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE}/api/artworks/profile/${targetId}`);
                setProfileUser(res.data.user);
                setArtworks(res.data.artworks);

                const currentUserId = currentUser?._id || currentUser?.id;
                if (currentUserId && currentUserId === targetId) {
                    const token = localStorage.getItem('token');
                    if (token) {
                        try {
                            const savedRes = await axios.get(`${API_BASE}/api/auth/saved`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            setSavedArtworks(savedRes.data.savedArtworks || []);
                        } catch (savedError) {

                            setSavedArtworks([]);
                        }
                    } else {
                        setSavedArtworks([]);
                    }
                } else {
                    setSavedArtworks([]);
                    setActiveTab('portfolio');
                }

                setError('');
            } catch (err) {

                setError("Profile not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, currentUser, navigate]);

    if (loading) return <div className={styles.pageWrapper}><Navbar /><div style={{color:'white', textAlign:'center', marginTop: '10vh'}}>Loading The Aether...</div></div>;
    if (error) return <div className={styles.pageWrapper}><Navbar /><div style={{color:'white', textAlign:'center', marginTop: '10vh'}}>{error}</div></div>;
    if (!profileUser) return null;

    const displayAvatar = profileUser.avatar || "/assets/images/profile_icon.png";
    const displayName = profileUser.name || profileUser.username || "Unknown Artist";
    const displayBio = profileUser.bio || "No bio available.";
    const currentUserId = currentUser?._id || currentUser?.id;
    const profileUserId = profileUser._id || userId;
    const isOwnProfile = !!currentUserId && !!profileUserId && currentUserId === profileUserId;
    const visibleWorks = activeTab === 'bookmarks' ? savedArtworks : artworks;

    return (
        <div className={styles.pageWrapper}>
            
            {/* ===== UIVERSE NEON RAIN BACKGROUND ===== */}
            <div className={styles.neonRainBg}></div>

            <Navbar />

            <div className={styles.profileContainer}>
                
                {/* ===== PROFILE CARD ===== */}
                <div className={styles.profileCard}>
                    <div className={styles.topRow}>
                        <div className={styles.userInfo}>
                            <img src={displayAvatar} alt="Profile Avatar" className={styles.avatar} />
                            <div className={styles.nameBlock}>
                                <h1>{displayName}</h1>
                                <div className={styles.stats}>
                                    <span><strong>{profileUser.followingCount || 0}</strong> Following</span>
                                    <span><strong>{profileUser.followerCount || 0}</strong> Followers</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.actionBlock}>
                            <button className={styles.followBtn}>Follow</button>
                            <button className={styles.iconBtn} title="Share">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            </button>
                            <button className={styles.iconBtn} title="More">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                            </button>
                        </div>
                    </div>

                    {/* Social Links Row */}
                    <div className={styles.socialRow}>
                        <a href={profileUser.socials?.twitter || "#"} className={styles.socialIcon} title="X / Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href={profileUser.socials?.instagram || "#"} className={styles.socialIcon} title="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href={profileUser.socials?.website || "#"} className={styles.socialIcon} title="Website">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </a>
                    </div>

                    {/* Bio Paragraph */}
                    <div className={styles.bioBlock}>
                        <p>{displayBio}</p>
                    </div>
                </div>

                {/* ===== CONTENT TABS ===== */}
                <div className={styles.tabsContainer}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'portfolio' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('portfolio')}
                    >
                        Works
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'collections' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('collections')}
                    >
                        Collections
                    </button>
                    {isOwnProfile && (
                        <button 
                            className={`${styles.tab} ${activeTab === 'bookmarks' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('bookmarks')}
                        >
                            Bookmarks
                        </button>
                    )}
                </div>

                {/* ===== PORTFOLIO GRID ===== */}
                <div className={styles.portfolioSection}>
                    <div className={styles.sectionHeader}>
                        <h3>Illustrations and Projects</h3>
                    </div>

                    <div className={styles.portfolioGrid}>
                        {activeTab === 'portfolio' && artworks.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>No artworks published yet.</p>
                            </div>
                        )}

                        {activeTab === 'bookmarks' && savedArtworks.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>Private vault of saved inspirations.</p>
                            </div>
                        )}

                        {(activeTab === 'portfolio' || activeTab === 'bookmarks') && visibleWorks.map((work) => (
                            <div key={work._id} className={styles.artCard}>
                                <div className={styles.imageWrapper}>
                                    {isVideoArtwork(work) ? (
                                        <video
                                            src={`${API_BASE}${work.image}`}
                                            className={styles.artImage}
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img src={`${API_BASE}${work.image}`} alt={work.title} className={styles.artImage} />
                                    )}
                                    <div className={styles.likeOverlay}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                        <span>{work.likes || 0}</span>
                                    </div>
                                </div>
                                <h4 className={styles.artTitle}>{work.title}</h4>
                            </div>
                        ))}
                        
                        {activeTab === 'collections' && (
                            <div className={styles.emptyState}>
                                <p>No collections created yet.</p>
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Profile;
