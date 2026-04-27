import React, { useState, useEffect, useRef } from 'react';
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
    const [collections, setCollections] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDesc, setNewCollectionDesc] = useState('');

    // Social links editing
    const [editingSocials, setEditingSocials] = useState(false);
    const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', website: '' });

    // More options menu
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const moreMenuRef = useRef(null);

    // Collection management state
    const [editingCollection, setEditingCollection] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showAddArtworkModal, setShowAddArtworkModal] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [availableArtworks, setAvailableArtworks] = useState([]);
    const [selectedArtworkIds, setSelectedArtworkIds] = useState([]);
    const [addingArtworks, setAddingArtworks] = useState(false);

    // Avatar upload
    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Close more menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            let targetId = userId;

            if (!targetId) {
                if (currentUser) {
                    targetId = currentUser._id || currentUser.id;
                } else {
                    const token = localStorage.getItem('token');
                    if (token) {
                        try {
                            const meRes = await axios.get(`${API_BASE}/api/auth/me`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            targetId = meRes.data._id || meRes.data.id;
                        } catch (meErr) {
                            navigate('/login');
                            return;
                        }
                    } else {
                        navigate('/login');
                        return;
                    }
                }
            }

            if (!targetId) {
                setError('Profile not found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE}/api/artworks/profile/${targetId}`);
                setProfileUser({
                    ...res.data.user,
                    privacy: res.data.user.privacy || { hideFollowers: false, hideFollowing: false }
                });
                setArtworks(res.data.artworks);
                setBioText(res.data.user.bio || '');
                setSocialLinks(res.data.user.socials || { twitter: '', instagram: '', website: '' });

                const currentUserId = currentUser?._id || currentUser?.id;
                const token = localStorage.getItem('token');
                
                if (currentUserId && currentUserId === targetId) {
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

                const collectionsRes = await axios.get(`${API_BASE}/api/collections/user/${targetId}`);
                setCollections(collectionsRes.data);

                if (currentUserId && currentUserId !== targetId && token) {
                    const currentUserData = await axios.get(`${API_BASE}/api/auth/following/${currentUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setIsFollowing(currentUserData.data.following.some(user => user._id === targetId));
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

    // Pre-fetch available artworks for the "add to collection" modal (only user's own artworks)
    useEffect(() => {
        const currentUserId = currentUser?._id || currentUser?.id;
        
        if (showAddArtworkModal && selectedCollection && currentUserId === profileUser?._id) {
            const fetchAvailableArtworks = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_BASE}/api/artworks/user/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const alreadyInCollection = selectedCollection.artworks.map(aw => aw._id || aw);
                    const available = res.data.filter(aw => !alreadyInCollection.includes(aw._id) && aw.status === 'published');
                    setAvailableArtworks(available);
                } catch (err) {
                    console.error('Failed to fetch artworks', err);
                    // Fallback to already loaded artworks if the user/me endpoint fails
                    const alreadyInCollection = selectedCollection.artworks.map(aw => aw._id || aw);
                    const available = artworks.filter(aw => !alreadyInCollection.includes(aw._id) && aw.status === 'published');
                    setAvailableArtworks(available);
                }
            };
            fetchAvailableArtworks();
        }
    }, [showAddArtworkModal, selectedCollection, currentUser, profileUser, artworks]);

    // Collection CRUD handlers
    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/collections`, {
                name: newCollectionName,
                description: newCollectionDesc
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCollections(prev => [...prev, res.data]);
            setNewCollectionName('');
            setNewCollectionDesc('');
            setShowCreateCollection(false);
        } catch (error) {
            console.error('Collection creation error:', error);
        }
    };

    const handleEditCollection = (collection) => {
        setEditingCollection(collection);
        setEditName(collection.name);
        setEditDesc(collection.description || '');
        setShowEditModal(true);
    };

    const handleUpdateCollection = async () => {
        if (!editName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_BASE}/api/collections/${editingCollection._id}`, {
                name: editName,
                description: editDesc
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCollections(prev => prev.map(c => c._id === editingCollection._id ? res.data : c));
            setShowEditModal(false);
            setEditingCollection(null);
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleDeleteCollection = async (collectionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/collections/${collectionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCollections(prev => prev.filter(c => c._id !== collectionId));
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const toggleArtworkSelection = (id) => {
        setSelectedArtworkIds(prev => 
            prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
        );
    };

    const handleSelectAllAvailableArtworks = (e) => {
        if (e.target.checked) {
            setSelectedArtworkIds(availableArtworks.map(aw => aw._id));
        } else {
            setSelectedArtworkIds([]);
        }
    };

    const handleAddSelectedArtworksToCollection = async () => {
        if (selectedArtworkIds.length === 0) return;
        setAddingArtworks(true);
        try {
            const token = localStorage.getItem('token');
            let latestCollectionData;
            for (const artworkId of selectedArtworkIds) {
                const res = await axios.post(`${API_BASE}/api/collections/${selectedCollection._id}/add`, { artworkId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                latestCollectionData = res.data;
            }
            if (latestCollectionData) {
                setCollections(prev => prev.map(c => c._id === selectedCollection._id ? latestCollectionData : c));
            }
            setShowAddArtworkModal(false);
            setSelectedCollection(null);
            setSelectedArtworkIds([]);
        } catch (error) {
            console.error('Add artworks error:', error);
            alert('Failed to add some artworks. Please try again.');
        } finally {
            setAddingArtworks(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/auth/follow/${profileUser._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsFollowing(res.data.following);
            setProfileUser(prev => ({
                ...prev,
                followerCount: res.data.followerCount
            }));
            if (activeTab === 'following' || activeTab === 'followers') {
                fetchFollowingFollowers(activeTab);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const handleBioSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/api/auth/bio`, { bio: bioText }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfileUser(prev => ({ ...prev, bio: bioText }));
            setEditingBio(false);
        } catch (error) {
            console.error('Bio update error:', error);
            alert('Failed to update bio. Please try again.');
        }
    };

    const handleSocialSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/api/auth/socials`, { socials: socialLinks }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfileUser(prev => ({ ...prev, socials: socialLinks }));
            setEditingSocials(false);
        } catch (error) {
            console.error('Social update error:', error);
            alert('Failed to update social links. Please try again.');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            alert('Profile link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleAvatarClick = () => {
        if (isOwnProfile && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await axios.post(`${API_BASE}/api/auth/avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfileUser(prev => ({ ...prev, avatar: res.data.avatar }));
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('Failed to upload avatar. Please try again.');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handlePrivacyUpdate = async (setting, value) => {
        try {
            const token = localStorage.getItem('token');
            const privacy = { ...profileUser.privacy, [setting]: value };
            await axios.put(`${API_BASE}/api/auth/privacy`, { privacy }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfileUser(prev => ({ ...prev, privacy }));
        } catch (error) {
            console.error('Privacy update error:', error);
        }
    };

    const fetchFollowingFollowers = async (tab) => {
        try {
            const token = localStorage.getItem('token');
            if (tab === 'following') {
                const res = await axios.get(`${API_BASE}/api/auth/following/${profileUser._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowing(res.data.following);
            } else if (tab === 'followers') {
                const res = await axios.get(`${API_BASE}/api/auth/followers/${profileUser._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowers(res.data.followers);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'following' || activeTab === 'followers') {
            fetchFollowingFollowers(activeTab);
        }
    }, [activeTab, profileUser]);
    
    if (loading) return <div className={styles.pageWrapper}><Navbar /><div style={{color:'white', textAlign:'center', marginTop: '10vh'}}>Loading The Aether...</div></div>;
    if (error) return <div className={styles.pageWrapper}><Navbar /><div style={{color:'white', textAlign:'center', marginTop: '10vh'}}>{error}</div></div>;
    if (!profileUser) return null;

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return "/assets/images/profile_icon.png";
        if (avatarPath.startsWith('/avatars/')) return `${API_BASE}${avatarPath}`;
        return avatarPath;
    };

    const displayAvatar = getAvatarUrl(profileUser.avatar);
    const displayName = profileUser.name || profileUser.username || "Unknown Artist";
    const displayBio = profileUser.bio || "No bio available.";
    const currentUserId = currentUser?._id || currentUser?.id;
    const profileUserId = profileUser._id || userId;
    const isOwnProfile = !!currentUserId && !!profileUserId && currentUserId === profileUserId;
    const visibleWorks = activeTab === 'bookmarks' ? savedArtworks : artworks;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.neonRainBg}></div>
            <Navbar />
            <div className={styles.profileContainer}>
                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.topRow}>
                        <div className={styles.userInfo}>
                            <div
                                className={`${styles.avatarWrapper} ${isOwnProfile ? styles.avatarClickable : ''} ${uploadingAvatar ? styles.avatarUploading : ''}`}
                                onClick={handleAvatarClick}
                                title={isOwnProfile ? 'Click to change avatar' : ''}
                            >
                                <img src={displayAvatar} alt="Profile Avatar" className={styles.avatar} />
                                {isOwnProfile && !uploadingAvatar && (
                                    <div className={styles.avatarOverlay}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                    </div>
                                )}
                                {uploadingAvatar && (
                                    <div className={styles.avatarOverlay}>
                                        <span className={styles.avatarSpinner}></span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div className={styles.nameBlock}>
                                <h1>{displayName}</h1>
                                <div className={styles.stats}>
                                    <span><strong>{profileUser.followingCount || 0}</strong> Following</span>
                                    <span><strong>{profileUser.followerCount || 0}</strong> Followers</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.actionBlock}>
                            {!isOwnProfile && (
                                <button className={styles.followBtn} onClick={handleFollow}>
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            )}
                            <button className={styles.iconBtn} title="Share" onClick={handleShare}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            </button>
                            {isOwnProfile && (
                                <div className={styles.moreMenuContainer} ref={moreMenuRef}>
                                    <button className={styles.iconBtn} title="More" onClick={() => setShowMoreMenu(!showMoreMenu)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                    </button>
                                    {showMoreMenu && (
                                        <div className={styles.moreMenu}>
                                            <button onClick={() => { navigate('/settings'); setShowMoreMenu(false); }}>Go to Settings</button>
                                            <button onClick={() => { handlePrivacyUpdate('hideFollowers', !profileUser.privacy?.hideFollowers); setShowMoreMenu(false); }}>
                                                {profileUser.privacy?.hideFollowers ? 'Show' : 'Hide'} Followers
                                            </button>
                                            <button onClick={() => { handlePrivacyUpdate('hideFollowing', !profileUser.privacy?.hideFollowing); setShowMoreMenu(false); }}>
                                                {profileUser.privacy?.hideFollowing ? 'Show' : 'Hide'} Following
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.socialRow}>
                        {editingSocials ? (
                            <div className={styles.socialEditContainer}>
                                <input
                                    type="text"
                                    placeholder="Twitter/X URL"
                                    value={socialLinks.twitter}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                                    className={styles.socialInput}
                                />
                                <input
                                    type="text"
                                    placeholder="Instagram URL"
                                    value={socialLinks.instagram}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                                    className={styles.socialInput}
                                />
                                <input
                                    type="text"
                                    placeholder="Website/Other URL"
                                    value={socialLinks.website}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
                                    className={styles.socialInput}
                                />
                                <div className={styles.socialActions}>
                                    <button onClick={handleSocialSave} className={styles.saveBtn}>Save</button>
                                    <button onClick={() => { setEditingSocials(false); setSocialLinks(profileUser.socials || { twitter: '', instagram: '', website: '' }); }} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {profileUser.socials?.twitter && (
                                    <a href={profileUser.socials.twitter} className={styles.socialIcon} title="X / Twitter" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                )}
                                {profileUser.socials?.instagram && (
                                    <a href={profileUser.socials.instagram} className={styles.socialIcon} title="Instagram" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    </a>
                                )}
                                {profileUser.socials?.website && (
                                    <a href={profileUser.socials.website} className={styles.socialIcon} title="Website" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    </a>
                                )}
                                {isOwnProfile && (!profileUser.socials?.twitter && !profileUser.socials?.instagram && !profileUser.socials?.website) && (
                                    <button onClick={() => setEditingSocials(true)} className={styles.addSocialBtn} title="Add social links">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className={styles.bioBlock}>
                        {editingBio ? (
                            <div>
                                <textarea
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    maxLength={500}
                                    className={styles.bioTextarea}
                                />
                                <div className={styles.bioActions}>
                                    <button onClick={handleBioSave} className={styles.saveBtn}>Save</button>
                                    <button onClick={() => { setEditingBio(false); setBioText(profileUser.bio || ''); }} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <p onClick={isOwnProfile ? () => setEditingBio(true) : undefined} style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}>
                                {displayBio || (isOwnProfile ? 'Click to add a bio...' : 'No bio available.')}
                                {isOwnProfile && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', opacity: 0.6, verticalAlign: 'middle' }}>
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <button className={`${styles.tab} ${activeTab === 'portfolio' ? styles.activeTab : ''}`} onClick={() => setActiveTab('portfolio')}>Works</button>
                    <button className={`${styles.tab} ${activeTab === 'collections' ? styles.activeTab : ''}`} onClick={() => setActiveTab('collections')}>Collections</button>
                    {(!profileUser.privacy?.hideFollowing || isOwnProfile) && (
                        <button className={`${styles.tab} ${activeTab === 'following' ? styles.activeTab : ''}`} onClick={() => setActiveTab('following')}>Following ({profileUser?.followingCount || 0})</button>
                    )}
                    {(!profileUser.privacy?.hideFollowers || isOwnProfile) && (
                        <button className={`${styles.tab} ${activeTab === 'followers' ? styles.activeTab : ''}`} onClick={() => setActiveTab('followers')}>Followers ({profileUser?.followerCount || 0})</button>
                    )}
                    {isOwnProfile && <button className={`${styles.tab} ${activeTab === 'bookmarks' ? styles.activeTab : ''}`} onClick={() => setActiveTab('bookmarks')}>Bookmarks</button>}
                </div>

                {/* Content area */}
                <div className={styles.portfolioSection}>
                    <div className={styles.sectionHeader}>
                        <h3>
                            {activeTab === 'portfolio' && 'Illustrations and Projects'}
                            {activeTab === 'collections' && 'Collections'}
                            {activeTab === 'following' && 'Following'}
                            {activeTab === 'followers' && 'Followers'}
                            {activeTab === 'bookmarks' && 'Bookmarks'}
                        </h3>
                        {activeTab === 'collections' && isOwnProfile && (
                            <button className={styles.createBtn} onClick={() => setShowCreateCollection(true)}>Create Collection</button>
                        )}
                    </div>

                    {/* Create Collection Modal */}
                    {showCreateCollection && (
                        <div className={styles.modalOverlay} onClick={() => setShowCreateCollection(false)}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h4>Create New Collection</h4>
                                <input
                                    type="text"
                                    placeholder="Collection name"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    className={styles.collectionInput}
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={newCollectionDesc}
                                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                                    className={styles.collectionTextarea}
                                />
                                <div className={styles.modalActions}>
                                    <button onClick={handleCreateCollection} className={styles.saveBtn}>Create</button>
                                    <button onClick={() => setShowCreateCollection(false)} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Collection Modal */}
                    {showEditModal && (
                        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h4>Edit Collection</h4>
                                <input
                                    type="text"
                                    placeholder="Collection name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className={styles.collectionInput}
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className={styles.collectionTextarea}
                                />
                                <div className={styles.modalActions}>
                                    <button onClick={handleUpdateCollection} className={styles.saveBtn}>Save</button>
                                    <button onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(null)}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h4>Delete Collection?</h4>
                                <p>This action cannot be undone. The collection will be permanently removed.</p>
                                <div className={styles.modalActions}>
                                    <button onClick={() => handleDeleteCollection(showDeleteConfirm)} className={styles.saveBtn}>Delete</button>
                                    <button onClick={() => setShowDeleteConfirm(null)} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Artwork to Collection Modal */}
                    {showAddArtworkModal && selectedCollection && (
                        <div className={styles.modalOverlay} onClick={() => { setShowAddArtworkModal(false); setSelectedArtworkIds([]); }}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h4>Add Artwork to "{selectedCollection.name}"</h4>
                                {availableArtworks.length === 0 ? (
                                    <p>No artworks available to add.</p>
                                ) : (
                                    <>
                                        <div className={styles.selectAllContainer}>
                                            <label className={styles.selectAllLabel}>
                                                <div className={`${styles.customCheckbox} ${styles.customCheckboxSquare} ${selectedArtworkIds.length === availableArtworks.length && availableArtworks.length > 0 ? styles.customCheckboxActive : ''}`}>
                                                    {(selectedArtworkIds.length === availableArtworks.length && availableArtworks.length > 0) && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    )}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedArtworkIds.length === availableArtworks.length && availableArtworks.length > 0}
                                                    onChange={handleSelectAllAvailableArtworks}
                                                    className={styles.hiddenCheckbox}
                                                /> 
                                                Select All
                                            </label>
                                            <span className={styles.selectedCount}>
                                                {selectedArtworkIds.length} selected
                                            </span>
                                        </div>
                                        <div className={styles.artworkList}>
                                            {availableArtworks.map(aw => {
                                                const isSelected = selectedArtworkIds.includes(aw._id);
                                                return (
                                                <div 
                                                    key={aw._id} 
                                                    className={`${styles.artworkItem} ${isSelected ? styles.artworkItemSelected : ''}`} 
                                                    onClick={() => toggleArtworkSelection(aw._id)}
                                                >
                                                    <div className={`${styles.customCheckbox} ${styles.customCheckboxCircle} ${isSelected ? styles.customCheckboxActive : ''}`}>
                                                        {isSelected && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        readOnly 
                                                        className={styles.hiddenCheckbox}
                                                    />
                                                    <img 
                                                        src={isVideoArtwork(aw) && aw.thumbnail ? `${API_BASE}${aw.thumbnail}` : `${API_BASE}${aw.image}`} 
                                                        alt={aw.title} 
                                                        className={styles.artworkThumb} 
                                                    />
                                                    <div className={styles.artworkInfo}>
                                                        <strong>{aw.title}</strong>
                                                        <span>{aw.medium?.replace('_', ' ') || 'Artwork'}</span>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                                <div className={styles.modalActions}>
                                    {availableArtworks.length > 0 && (
                                        <button 
                                            onClick={handleAddSelectedArtworksToCollection} 
                                            className={styles.saveBtn} 
                                            disabled={selectedArtworkIds.length === 0 || addingArtworks}
                                        >
                                            {addingArtworks ? 'Adding...' : `Add Selected (${selectedArtworkIds.length})`}
                                        </button>
                                    )}
                                    <button onClick={() => { setShowAddArtworkModal(false); setSelectedArtworkIds([]); }} className={styles.cancelBtn}>Close</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.portfolioGrid}>
                        {/* Portfolio / Bookmarks content */}
                        {(activeTab === 'portfolio' || activeTab === 'bookmarks') && visibleWorks.map((work) => (
                            <div key={work._id} className={styles.artCard} onClick={() => navigate(`/gallery/${work._id}`)} style={{ cursor: 'pointer' }}>
                                <div className={styles.imageWrapper}>
                                    {isVideoArtwork(work) ? (
                                        <video src={`${API_BASE}${work.image}`} poster={work.thumbnail ? `${API_BASE}${work.thumbnail}` : undefined} className={styles.artImage} muted playsInline preload="metadata" />
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

                        {/* Collections Tab */}
                        {activeTab === 'collections' && collections.map((collection) => (
                            <div key={collection._id} className={styles.collectionCard}>
                                <h4>{collection.name}</h4>
                                <p>{collection.description || 'No description'}</p>
                                <span className={styles.artworkCount}>{collection.artworks.length} artworks</span>
                                {isOwnProfile && (
                                    <div className={styles.collectionActions}>
                                        <button onClick={() => handleEditCollection(collection)} className={styles.iconBtnSmall} title="Edit">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => { setSelectedCollection(collection); setShowAddArtworkModal(true); }} className={styles.iconBtnSmall} title="Add Artwork">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(collection._id)} className={styles.iconBtnSmall} title="Delete">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 3h6" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Following / Followers */}
                        {(activeTab === 'following' || activeTab === 'followers') && 
                            (activeTab === 'following' ? following : followers).map((user) => (
                                <div key={user._id} className={styles.userCard} onClick={() => navigate(`/profile/${user._id}`)} style={{ cursor: 'pointer' }}>
                                    <img src={getAvatarUrl(user.avatar)} alt={user.name} className={styles.userAvatar} />
                                    <div className={styles.userInfo}>
                                        <h4>{user.name || user.username}</h4>
                                        <p>{user.bio || 'No bio'}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;