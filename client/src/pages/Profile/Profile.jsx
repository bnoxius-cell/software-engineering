import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from './Profile.module.css';
import { isVideoArtwork } from '../../utils/artworkMedia';
import ArtworkVideoPlayer from '../../components/media/ArtworkVideoPlayer';
import { getAvatarUrl } from '../../utils/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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
    const [profileMessage, setProfileMessage] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
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
    const [showViewCollectionModal, setShowViewCollectionModal] = useState(false);
    const [activeArtworkIndex, setActiveArtworkIndex] = useState(null);
    const [selectedArtworkIdsToRemove, setSelectedArtworkIdsToRemove] = useState([]);
    const [removingArtworks, setRemovingArtworks] = useState(false);

    // Artwork editing / deletion
    const [editingArtwork, setEditingArtwork] = useState(null);
    const [editArtworkForm, setEditArtworkForm] = useState({
        title: '',
        medium: 'digital_2d',
        description: '',
        tags: ''
    });
    const [editArtworkFile, setEditArtworkFile] = useState(null);
    const [editArtworkThumbnailFile, setEditArtworkThumbnailFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [editThumbnailPreviewUrl, setEditThumbnailPreviewUrl] = useState(null);
    const [editMediaType, setEditMediaType] = useState('image');
    const [isUpdatingArtwork, setIsUpdatingArtwork] = useState(false);
    const [showEditArtworkModal, setShowEditArtworkModal] = useState(false);
    const [showDeleteArtworkConfirm, setShowDeleteArtworkConfirm] = useState(null);

    // Avatar upload
    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState('');

    // Video player state
    const videoRefs = useRef({});
    const [videoDurations, setVideoDurations] = useState({});

    const handleVideoMetadataLoaded = (artworkId, duration) => {
        setVideoDurations(prev => ({ ...prev, [artworkId]: duration }));
    };

    // Lock background scrolling when any modal popup is open
    useEffect(() => {
        if (showCreateCollection || showEditModal || showDeleteConfirm || showAddArtworkModal || showViewCollectionModal || showEditArtworkModal || showDeleteArtworkConfirm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showCreateCollection, showEditModal, showDeleteConfirm, showAddArtworkModal, showViewCollectionModal, showEditArtworkModal, showDeleteArtworkConfirm]);

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

    // Auto-dismiss avatar success message after 3 seconds
    useEffect(() => {
        if (!avatarSuccess) return;
        const timer = setTimeout(() => setAvatarSuccess(''), 3000);
        return () => clearTimeout(timer);
    }, [avatarSuccess]);

    // Auto-dismiss profile action messages after 3 seconds
    useEffect(() => {
        if (!profileMessage) return;
        const timer = setTimeout(() => setProfileMessage(null), 3000);
        return () => clearTimeout(timer);
    }, [profileMessage]);

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
                        } catch {
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
                
                if (currentUserId && String(currentUserId) === String(targetId)) {
                    if (token) {
                        try {
                            const savedRes = await axios.get(`${API_BASE}/api/auth/saved`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            setSavedArtworks(savedRes.data.savedArtworks || []);
                        } catch {
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

                if (currentUserId && String(currentUserId) !== String(targetId) && token) {
                    const currentUserData = await axios.get(`${API_BASE}/api/auth/following/${currentUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setIsFollowing(currentUserData.data.following.some(user => String(user._id) === String(targetId)));
                } else {
                    setIsFollowing(false);
                }

                setError('');
            } catch {
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

    const toggleArtworkToRemoveSelection = (id) => {
        setSelectedArtworkIdsToRemove(prev => 
            prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
        );
    };

    const handleSelectAllToRemove = (e) => {
        if (e.target.checked && selectedCollection) {
            setSelectedArtworkIdsToRemove(selectedCollection.artworks.map(aw => aw._id));
        } else {
            setSelectedArtworkIdsToRemove([]);
        }
    };

    const handleRemoveSelectedArtworksFromCollection = async () => {
        if (selectedArtworkIdsToRemove.length === 0) return;
        setRemovingArtworks(true);
        try {
            const token = localStorage.getItem('token');
            let latestCollectionData;
            for (const artworkId of selectedArtworkIdsToRemove) {
                const res = await axios.post(`${API_BASE}/api/collections/${selectedCollection._id}/remove`, { artworkId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                latestCollectionData = res.data;
            }
            if (latestCollectionData) {
                setCollections(prev => prev.map(c => c._id === selectedCollection._id ? latestCollectionData : c));
                setSelectedCollection(latestCollectionData);
            }
            setSelectedArtworkIdsToRemove([]);
        } catch (error) {
            console.error('Remove artworks error:', error);
            alert('Failed to remove some artworks. Please try again.');
        } finally {
            setRemovingArtworks(false);
        }
    };

    // ---- Artwork edit/delete handlers ----
    const getArtworkOwnerId = (artwork) => {
        const owner = artwork?.uploadedBy;
        if (!owner) return '';
        return typeof owner === 'object' ? owner._id || owner.id || '' : owner;
    };

    const userOwnsArtwork = (artwork) => {
        const currentUserId = currentUser?._id || currentUser?.id;
        return !!currentUserId && String(getArtworkOwnerId(artwork)) === String(currentUserId);
    };

    const closeEditArtworkModal = () => {
        setShowEditArtworkModal(false);
        setEditingArtwork(null);
        setEditArtworkFile(null);
        setEditArtworkThumbnailFile(null);
        if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(editPreviewUrl);
        if (editThumbnailPreviewUrl && editThumbnailPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(editThumbnailPreviewUrl);
        setEditPreviewUrl(null);
        setEditThumbnailPreviewUrl(null);
    };

    const openEditArtworkModal = (artwork) => {
        if (!userOwnsArtwork(artwork)) {
            setProfileMessage({ type: 'error', text: "You can't edit another user's artwork." });
            return;
        }
        setEditingArtwork(artwork);
        setEditArtworkForm({
            title: artwork.title || '',
            medium: artwork.medium || 'digital_2d',
            description: artwork.description || '',
            tags: artwork.tags || ''
        });
        setEditPreviewUrl(`${API_BASE}${artwork.image}`);
        setEditMediaType(isVideoArtwork(artwork) ? 'video' : 'image');
        setEditArtworkFile(null);
        setEditArtworkThumbnailFile(null);
        setEditThumbnailPreviewUrl(artwork.thumbnail ? `${API_BASE}${artwork.thumbnail}` : null);
        setShowEditArtworkModal(true);
    };

    const handleEditArtworkChange = (e) => {
        const { name, value } = e.target;
        setEditArtworkForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditArtworkFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(editPreviewUrl);
        setEditArtworkFile(file);
        setEditMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        const url = URL.createObjectURL(file);
        setEditPreviewUrl(url);
    };

    const handleEditThumbnailSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        if (editThumbnailPreviewUrl && editThumbnailPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(editThumbnailPreviewUrl);
        setEditArtworkThumbnailFile(file);
        const url = URL.createObjectURL(file);
        setEditThumbnailPreviewUrl(url);
    };

    const handleUpdateArtwork = async () => {
        if (!editingArtwork || !userOwnsArtwork(editingArtwork)) {
            setProfileMessage({ type: 'error', text: "You can't edit another user's artwork." });
            closeEditArtworkModal();
            return;
        }
        if (!editArtworkForm.title.trim()) {
            alert('Title is required.');
            return;
        }
        if (!editArtworkForm.description.trim()) {
            alert('Description is required.');
            return;
        }
        if (!editArtworkForm.tags.trim()) {
            alert('Tags are required.');
            return;
        }

        setIsUpdatingArtwork(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', editArtworkForm.title.trim());
            formData.append('medium', editArtworkForm.medium);
            formData.append('description', editArtworkForm.description.trim());
            formData.append('tags', editArtworkForm.tags.trim());
            if (editArtworkFile) {
                formData.append('artworkImage', editArtworkFile);
            }
            if (editArtworkThumbnailFile) {
                formData.append('thumbnailImage', editArtworkThumbnailFile);
            }

            const res = await fetch(`${API_BASE}/api/artworks/${editingArtwork._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const updatedArtwork = await res.json();
                setArtworks(prev => prev.map(artwork => artwork._id === updatedArtwork._id ? updatedArtwork : artwork));
                setCollections(prev => prev.map(collection => ({
                    ...collection,
                    artworks: collection.artworks?.map(artwork => artwork._id === updatedArtwork._id ? updatedArtwork : artwork) || []
                })));
                closeEditArtworkModal();
                setProfileMessage({ type: 'success', text: 'Artwork successfully updated.' });
            } else {
                const err = await res.json();
                setProfileMessage({ type: 'error', text: err.message || 'Failed to update artwork.' });
            }
        } catch (error) {
            console.error(error);
            setProfileMessage({ type: 'error', text: 'Server error. Could not update artwork.' });
        } finally {
            setIsUpdatingArtwork(false);
        }
    };

    const handleDeleteArtwork = async (artworkId) => {
        const artwork = artworks.find(item => item._id === artworkId);
        if (artwork && !userOwnsArtwork(artwork)) {
            setProfileMessage({ type: 'error', text: "You can't delete another user's artwork." });
            setShowDeleteArtworkConfirm(null);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/artworks/${artworkId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setArtworks(prev => prev.filter(a => a._id !== artworkId));
                setCollections(prev => prev.map(collection => ({
                    ...collection,
                    artworks: collection.artworks?.filter(artwork => artwork._id !== artworkId) || []
                })));
                setShowDeleteArtworkConfirm(null);
                setProfileMessage({ type: 'success', text: 'Artwork successfully removed.' });
            } else {
                const err = await res.json().catch(() => ({}));
                setProfileMessage({ type: 'error', text: err.message || 'Failed to delete artwork.' });
            }
        } catch (error) {
            console.error(error);
            setProfileMessage({ type: 'error', text: 'Server error. Could not delete artwork.' });
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (!profileUser?._id || followLoading) return;

        setFollowLoading(true);
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
            setProfileMessage({
                type: 'success',
                text: res.data.following ? `You are now following ${displayName}.` : `You unfollowed ${displayName}.`
            });
            if (activeTab === 'following' || activeTab === 'followers') {
                fetchFollowingFollowers(activeTab);
            }
        } catch (error) {
            console.error('Follow error:', error);
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update follow status.' });
        } finally {
            setFollowLoading(false);
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
            setAvatarSuccess('');
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
            setAvatarSuccess('Profile picture successfully updated!');
            localStorage.setItem('avatar', res.data.avatar);
            window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: res.data.avatar }));
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
            if (!token) {
                navigate('/login');
                return;
            }
            const privacy = { ...profileUser.privacy, [setting]: value };
            const res = await axios.put(`${API_BASE}/api/auth/privacy`, { privacy }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedPrivacy = res.data.privacy || privacy;
            setProfileUser(prev => ({ ...prev, privacy: updatedPrivacy }));

            const fieldLabel = setting === 'hideFollowers' ? 'Followers' : 'Following';
            setProfileMessage({
                type: 'success',
                text: value
                    ? `${fieldLabel} has been hidden from other users.`
                    : `${fieldLabel} is now visible to other users.`
            });
        } catch (error) {
            console.error('Privacy update error:', error);
            setProfileMessage({
                type: 'error',
                text: error.response?.data?.message || 'Unable to update privacy settings.'
            });
        }
    };

    const fetchFollowingFollowers = useCallback(async (tab) => {
        if (!profileUser?._id) return;
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
    }, [profileUser?._id]);

    useEffect(() => {
        if (activeTab === 'following' || activeTab === 'followers') {
            fetchFollowingFollowers(activeTab);
        }
    }, [activeTab, fetchFollowingFollowers]);
    
    if (loading) return <div className={styles.pageWrapper}><Navbar /><div style={{color:'white', textAlign:'center', marginTop: '10vh'}}>Loading The Aether...</div></div>;
    if (error) return <div className={styles.pageWrapper}><Navbar /><div style={{color:'white', textAlign:'center', marginTop: '10vh'}}>{error}</div></div>;
    if (!profileUser) return null;

    const displayAvatar = getAvatarUrl(profileUser.avatar);
    const displayName = profileUser.name || profileUser.username || "Unknown Artist";
    const displayBio = profileUser.bio || "No bio available.";
    const currentUserId = currentUser?._id || currentUser?.id;
    const profileUserId = profileUser._id || userId;
    const isOwnProfile = !!currentUserId && !!profileUserId && String(currentUserId) === String(profileUserId);
    const canViewFollowing = isOwnProfile || !profileUser.privacy?.hideFollowing;
    const canViewFollowers = isOwnProfile || !profileUser.privacy?.hideFollowers;
    const visibleWorks = activeTab === 'bookmarks' ? savedArtworks : artworks;

    return (
        <div className={styles.pageWrapper}>
            <div className="background-fx"></div>
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
                                    {canViewFollowing && <span><strong>{profileUser.followingCount || 0}</strong> Following</span>}
                                    {canViewFollowers && <span><strong>{profileUser.followerCount || 0}</strong> Followers</span>}
                                </div>
                            </div>
                        </div>
                        <div className={styles.actionBlock}>
                            {!isOwnProfile && (
                                <button className={`${styles.followBtn} ${isFollowing ? styles.followingBtn : ''}`} onClick={handleFollow} disabled={followLoading}>
                                    {followLoading ? 'Updating...' : isFollowing ? 'Unfollow' : 'Follow'}
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
                                {isOwnProfile && !profileUser.socials?.twitter && !profileUser.socials?.instagram && !profileUser.socials?.website && (
                                    <button onClick={() => setEditingSocials(true)} className={styles.addSocialBtn} title="Add social links">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <button 
                                        onClick={() => {
                                            setEditingSocials(true);
                                            setSocialLinks(profileUser.socials || { twitter: '', instagram: '', website: '' });
                                        }} 
                                        className={styles.editSocialBtn} 
                                        title="Edit social links"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9"></path>
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                        </svg>
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

                {avatarSuccess && (
                    <div style={{ background: '#238636', color: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'center', fontWeight: 500 }}>
                        {avatarSuccess}
                    </div>
                )}

                {profileMessage && (
                    <div className={`${styles.profileNotice} ${profileMessage.type === 'error' ? styles.profileNoticeError : styles.profileNoticeSuccess}`}>
                        {profileMessage.text}
                    </div>
                )}

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <button className={`${styles.tab} ${activeTab === 'portfolio' ? styles.activeTab : ''}`} onClick={() => setActiveTab('portfolio')}>Works</button>
                    <button className={`${styles.tab} ${activeTab === 'collections' ? styles.activeTab : ''}`} onClick={() => setActiveTab('collections')}>Collections</button>
                    {canViewFollowing && (
                        <button className={`${styles.tab} ${activeTab === 'following' ? styles.activeTab : ''}`} onClick={() => setActiveTab('following')}>Following ({profileUser?.followingCount || 0})</button>
                    )}
                    {canViewFollowers && (
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

                    {/* Delete Collection Confirmation Modal */}
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
                                                    {isVideoArtwork(aw) ? (
                                                        <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                                            <video 
                                                                ref={el => videoRefs.current[`addModal_${aw._id}`] = el}
                                                                src={`${API_BASE}${aw.image}${!aw.thumbnail ? '#t=0.05' : ''}`} 
                                                                poster={aw.thumbnail ? `${API_BASE}${aw.thumbnail}` : undefined}
                                                                className={styles.artworkThumb} 
                                                                style={{ width: '100%', height: '100%', margin: 0 }}
                                                                muted loop playsInline preload="metadata"
                                                                onMouseEnter={() => videoRefs.current[`addModal_${aw._id}`]?.play()}
                                                                onMouseLeave={() => {
                                                                    const vid = videoRefs.current[`addModal_${aw._id}`];
                                                                    if (vid) {
                                                                        vid.pause();
                                                                        vid.currentTime = 0;
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            src={`${API_BASE}${aw.image}`} 
                                                            alt={aw.title} 
                                                            className={styles.artworkThumb} 
                                                        />
                                                    )}
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

                    {/* Modal A: View Collection Grid */}
                    {showViewCollectionModal && selectedCollection && activeArtworkIndex === null && (
                        <div className={styles.modalOverlay} onClick={() => { setShowViewCollectionModal(false); setSelectedArtworkIdsToRemove([]); }}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90vw' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{selectedCollection.name}</h3>
                                        {selectedCollection.description && <p style={{ color: '#8b949e', margin: '0.5rem 0 0 0' }}>{selectedCollection.description}</p>}
                                    </div>
                                    <button className={styles.carouselClose} onClick={() => { setShowViewCollectionModal(false); setSelectedArtworkIdsToRemove([]); }}>&times;</button>
                                </div>

                                {isOwnProfile && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(55, 65, 81, 0.5)', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => { setShowViewCollectionModal(false); handleEditCollection(selectedCollection); }} className={styles.cancelBtn}>Edit Details</button>
                                            <button onClick={() => { setShowViewCollectionModal(false); setShowAddArtworkModal(true); }} className={styles.saveBtn}>Add Artwork</button>
                                        </div>
                                        
                                        {selectedCollection.artworks && selectedCollection.artworks.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <label className={styles.selectAllLabel}>
                                                    <div className={`${styles.customCheckbox} ${styles.customCheckboxSquare} ${selectedArtworkIdsToRemove.length === selectedCollection.artworks.length ? styles.customCheckboxActive : ''}`}>
                                                        {selectedArtworkIdsToRemove.length === selectedCollection.artworks.length && (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedArtworkIdsToRemove.length === selectedCollection.artworks.length}
                                                        onChange={handleSelectAllToRemove}
                                                        className={styles.hiddenCheckbox}
                                                    /> 
                                                    Select All
                                                </label>
                                                {selectedArtworkIdsToRemove.length > 0 && (
                                                    <button 
                                                        onClick={handleRemoveSelectedArtworksFromCollection} 
                                                        className={styles.cancelBtn} 
                                                        disabled={removingArtworks}
                                                        style={{ color: '#ff6b6b', borderColor: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)' }}
                                                    >
                                                        {removingArtworks ? 'Removing...' : `Remove (${selectedArtworkIdsToRemove.length})`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {(!selectedCollection.artworks || selectedCollection.artworks.length === 0) ? (
                                    <p style={{ color: '#8b949e', textAlign: 'center', padding: '3rem 0' }}>This collection is empty.</p>
                                ) : (
                                    <div className={styles.collectionGrid}>
                                        {selectedCollection.artworks.map((aw, index) => {
                                            const isSelected = selectedArtworkIdsToRemove.includes(aw._id);
                                            return (
                                            <div key={aw._id || index} className={`${styles.compactCard} ${isSelected ? styles.artworkItemSelected : ''}`} onClick={() => setActiveArtworkIndex(index)} style={{ position: 'relative' }}>
                                                {isOwnProfile && (
                                                    <div 
                                                        style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, padding: '4px' }}
                                                        onClick={(e) => { e.stopPropagation(); toggleArtworkToRemoveSelection(aw._id); }}
                                                    >
                                                        <div className={`${styles.customCheckbox} ${styles.customCheckboxCircle} ${isSelected ? styles.customCheckboxActive : ''}`} style={{ background: isSelected ? '#a1ff14' : 'rgba(0,0,0,0.6)', borderColor: isSelected ? '#a1ff14' : 'rgba(255,255,255,0.7)' }}>
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
                                                    </div>
                                                )}
                                                {isVideoArtwork(aw) ? (
                                                    <div className={styles.videoCardWrapper}>
                                                        <video 
                                                            ref={el => videoRefs.current[`modalA_${aw._id || index}`] = el}
                                                            src={`${API_BASE}${aw.image}${!aw.thumbnail ? '#t=0.05' : ''}`} 
                                                            poster={aw.thumbnail ? `${API_BASE}${aw.thumbnail}` : undefined}
                                                            className={styles.compactThumb} 
                                                            muted loop playsInline preload="metadata"
                                                            onLoadedMetadata={(e) => handleVideoMetadataLoaded(`modalA_${aw._id || index}`, e.target.duration)}
                                                            onMouseEnter={() => videoRefs.current[`modalA_${aw._id || index}`]?.play()}
                                                            onMouseLeave={() => {
                                                                const vid = videoRefs.current[`modalA_${aw._id || index}`];
                                                                if (vid) {
                                                                    vid.pause();
                                                                    vid.currentTime = 0;
                                                                }
                                                            }}
                                                        />
                                                        <div className={styles.videoBadge} style={{ bottom: '4px', right: '4px', padding: '2px 4px', fontSize: '0.65rem' }}>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                <polygon points="5 3 19 12 5 21 5 3" />
                                                            </svg>
                                                            <span className={styles.videoDuration}>
                                                                {formatDuration(videoDurations[`modalA_${aw._id || index}`] || aw.duration)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img src={`${API_BASE}${aw.image}`} alt={aw.title} className={styles.compactThumb} />
                                                )}
                                                <div className={styles.compactInfo}>
                                                    <div className={styles.compactTitle}>{aw.title}</div>
                                                    <span className={styles.compactBadge}>{aw.medium?.replace('_', ' ').toUpperCase() || 'ARTWORK'}</span>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Modal B: Detailed Carousel Modal */}
                    {showViewCollectionModal && selectedCollection && activeArtworkIndex !== null && (
                        <div className={styles.carouselOverlay} onClick={() => setActiveArtworkIndex(null)}>
                            <div className={styles.carouselModal} onClick={e => e.stopPropagation()}>
                                <div className={styles.carouselImageWrapper}>
                                    <button 
                                        className={`${styles.carouselArrow} ${styles.arrowLeft}`}
                                        disabled={activeArtworkIndex === 0}
                                        onClick={() => setActiveArtworkIndex(i => i - 1)}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    </button>
                                    
                                    {isVideoArtwork(selectedCollection.artworks[activeArtworkIndex]) ? (
                                        <ArtworkVideoPlayer
                                            src={`${API_BASE}${selectedCollection.artworks[activeArtworkIndex].image}${!selectedCollection.artworks[activeArtworkIndex].thumbnail ? '#t=0.05' : ''}`}
                                            poster={selectedCollection.artworks[activeArtworkIndex].thumbnail ? `${API_BASE}${selectedCollection.artworks[activeArtworkIndex].thumbnail}` : undefined}
                                            alt={selectedCollection.artworks[activeArtworkIndex].title}
                                            keyboardActive={showViewCollectionModal && activeArtworkIndex !== null}
                                        />
                                    ) : (
                                        <img 
                                            src={`${API_BASE}${selectedCollection.artworks[activeArtworkIndex].image}`} 
                                            alt={selectedCollection.artworks[activeArtworkIndex].title} 
                                            className={styles.carouselImage} 
                                        />
                                    )}

                                    <button 
                                        className={`${styles.carouselArrow} ${styles.arrowRight}`}
                                        disabled={activeArtworkIndex === selectedCollection.artworks.length - 1}
                                        onClick={() => setActiveArtworkIndex(i => i + 1)}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                </div>
                                
                                <div className={styles.carouselDetails}>
                                    <div className={styles.carouselHeader}>
                                        <div>
                                            <h2 className={styles.carouselTitle}>{selectedCollection.artworks[activeArtworkIndex].title}</h2>
                                            <p className={styles.carouselArtist}>by {selectedCollection.artworks[activeArtworkIndex].artistName || 'Unknown Artist'}</p>
                                        </div>
                                        <button className={styles.carouselClose} onClick={() => setActiveArtworkIndex(null)}>&times;</button>
                                    </div>
                                    <div className={styles.carouselScrollArea}>
                                        <div className={styles.carouselMeta}>
                                            <span className={styles.compactBadge}>{selectedCollection.artworks[activeArtworkIndex].medium?.replace('_', ' ').toUpperCase() || 'ARTWORK'}</span>
                                            <div className={styles.carouselMetaItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                {new Date(selectedCollection.artworks[activeArtworkIndex].createdAt).toLocaleDateString()}
                                            </div>
                                            <div className={styles.carouselMetaItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                {selectedCollection.artworks[activeArtworkIndex].likes || 0}
                                            </div>
                                        </div>
                                        
                                        {selectedCollection.artworks[activeArtworkIndex].description && (
                                            <p style={{ color: '#c9d1d9', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                                                {selectedCollection.artworks[activeArtworkIndex].description}
                                            </p>
                                        )}

                                        <div className={styles.carouselComments}>
                                            <h4>Comments ({selectedCollection.artworks[activeArtworkIndex].comments?.length || 0})</h4>
                                            <div className={styles.carouselCommentList}>
                                                {!selectedCollection.artworks[activeArtworkIndex].comments || selectedCollection.artworks[activeArtworkIndex].comments.length === 0 ? (
                                                    <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>No comments yet.</p>
                                                ) : (
                                                    selectedCollection.artworks[activeArtworkIndex].comments.map((comment, idx) => (
                                                        <div key={comment._id || idx} className={styles.carouselComment}>
                                                            <div className={styles.carouselCommentUser}>{comment.user?.name || comment.user?.username || 'User'}</div>
                                                            <p className={styles.carouselCommentText}>{comment.content}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Portfolio Grid */}
                    <div className={styles.portfolioGrid}>
                        {(activeTab === 'portfolio' || activeTab === 'bookmarks') && visibleWorks.map((work) => (
                            <div key={work._id} className={styles.artCard}>
                                <div className={styles.imageWrapper} onClick={() => navigate(`/gallery/${work._id}`)} style={{ cursor: 'pointer' }}>
                                    {isVideoArtwork(work) ? (
                                        <div className={styles.videoCardWrapper}>
                                            <video 
                                                ref={el => videoRefs.current[work._id] = el}
                                                src={`${API_BASE}${work.image}${!work.thumbnail ? '#t=0.05' : ''}`} 
                                                poster={work.thumbnail ? `${API_BASE}${work.thumbnail}` : undefined}
                                                className={styles.artImage} 
                                                muted loop playsInline preload="metadata"
                                                onLoadedMetadata={(e) => handleVideoMetadataLoaded(work._id, e.target.duration)}
                                                onMouseEnter={() => videoRefs.current[work._id]?.play()}
                                                onMouseLeave={() => {
                                                    const vid = videoRefs.current[work._id];
                                                    if (vid) {
                                                        vid.pause();
                                                        vid.currentTime = 0;
                                                    }
                                                }}
                                            />
                                            <div className={styles.videoBadge}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                                <span className={styles.videoDuration}>
                                                    {formatDuration(videoDurations[work._id] || work.duration)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={`${API_BASE}${work.image}`} alt={work.title} className={styles.artImage} />
                                    )}
                                    <div className={styles.likeOverlay}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                        <span>{work.likes || 0}</span>
                                    </div>
                                </div>
                                <div className={styles.artworkMeta}>
                                    <h4 className={styles.artTitle} onClick={() => navigate(`/gallery/${work._id}`)} style={{ cursor: 'pointer' }}>{work.title}</h4>
                                    {isOwnProfile && userOwnsArtwork(work) && (
                                        <div className={styles.artworkActions}>
                                            <button onClick={() => openEditArtworkModal(work)} className={styles.iconBtnSmall} title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => setShowDeleteArtworkConfirm(work._id)} className={styles.iconBtnSmall} title="Delete">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 3h6" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Collections Tab */}
                        {activeTab === 'collections' && collections.map((collection) => (
                            <div key={collection._id} className={styles.collectionCard} onClick={() => { setSelectedCollection(collection); setShowViewCollectionModal(true); setActiveArtworkIndex(null); }} style={{ cursor: 'pointer' }}>
                                <h4>{collection.name}</h4>
                                <p>{collection.description || 'No description'}</p>
                                <span className={styles.artworkCount}>{collection.artworks.length} artworks</span>
                                {isOwnProfile && (
                                    <div className={styles.collectionActions}>
                                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(collection._id); }} className={styles.iconBtnSmall} title="Delete">
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
                                    <div className={styles.textContainer}>
                                        <h4 className={styles.userName}>{user.name || user.username}</h4>
                                        <p className={styles.userBio}>{user.bio || 'No bio'}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {/* Edit Artwork Modal */}
                    {showEditArtworkModal && editingArtwork && (
                        <div className={styles.modalOverlay} onClick={closeEditArtworkModal}>
                            <div className={styles.editArtworkModal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h3 className={styles.modalTitle}>Edit Artwork</h3>
                                    <button type="button" className={styles.modalClose} onClick={closeEditArtworkModal}>×</button>
                                </div>
                                <div className={styles.editArtworkContent}>
                                    {/* Left side – media preview */}
                                    <div className={styles.editMediaSection}>
                                        <div className={styles.editDropZone}>
                                            {editPreviewUrl ? (
                                                <>
                                                    {editMediaType === 'video' ? (
                                                        <video src={editPreviewUrl} className={styles.editPreviewImage} controls />
                                                    ) : (
                                                        <img src={editPreviewUrl} alt="Preview" className={styles.editPreviewImage} />
                                                    )}
                                                    <button 
                                                        type="button"
                                                        className={styles.changeImageBtn}
                                                        onClick={() => document.getElementById('edit-artwork-file').click()}
                                                    >
                                                        Replace Media
                                                    </button>
                                                </>
                                            ) : (
                                                <div className={styles.editDropZonePlaceholder} onClick={() => document.getElementById('edit-artwork-file').click()}>
                                                    <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                                                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                                                    </svg>
                                                    <p>Click or drag to replace artwork</p>
                                                </div>
                                            )}
                                            <input 
                                                id="edit-artwork-file"
                                                type="file" 
                                                accept="image/*,video/*" 
                                                onChange={handleEditArtworkFileSelect}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        {editMediaType === 'video' && (
                                            <div className={styles.editThumbnailSection}>
                                                <label>Thumbnail (optional)</label>
                                                <div className={styles.editThumbnailDropZone} onClick={() => document.getElementById('edit-thumbnail-file').click()}>
                                                    {editThumbnailPreviewUrl ? (
                                                        <img src={editThumbnailPreviewUrl} alt="Thumbnail" className={styles.editPreviewImage} />
                                                    ) : (
                                                        <div className={styles.editDropZonePlaceholder}>
                                                            <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                                                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                                                            </svg>
                                                            <p>Add a custom thumbnail</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input 
                                                    id="edit-thumbnail-file"
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleEditThumbnailSelect}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side – edit form */}
                                    <div className={styles.editFormSection}>
                                        <div className={styles.inputGroup}>
                                            <label>Title *</label>
                                            <input type="text" name="title" value={editArtworkForm.title} onChange={handleEditArtworkChange} className={styles.input} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Medium / Category</label>
                                            <select name="medium" value={editArtworkForm.medium} onChange={handleEditArtworkChange} className={styles.select}>
                                                <option value="digital_2d">Digital 2D Illustration</option>
                                                <option value="3d_model">3D Modeling & Render</option>
                                                <option value="traditional">Traditional (Paint, Ink, Pencil)</option>
                                                <option value="animation">Animation / Motion Graphics</option>
                                                <option value="ui_ux">UI/UX & Web Design</option>
                                                <option value="photography">Photography</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Description *</label>
                                            <textarea name="description" value={editArtworkForm.description} onChange={handleEditArtworkChange} className={styles.textarea} rows="4" />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Tags (comma separated) *</label>
                                            <input type="text" name="tags" value={editArtworkForm.tags} onChange={handleEditArtworkChange} className={styles.input} />
                                        </div>
                                        <div className={styles.modalActions}>
                                            <button className={styles.cancelBtn} onClick={closeEditArtworkModal}>Cancel</button>
                                            <button className={styles.saveBtn} onClick={handleUpdateArtwork} disabled={isUpdatingArtwork}>
                                                {isUpdatingArtwork ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Artwork Confirmation Modal */}
                    {showDeleteArtworkConfirm && (
                        <div className={styles.modalOverlay} onClick={() => setShowDeleteArtworkConfirm(null)}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h4>Delete Artwork?</h4>
                                <p>This action cannot be undone. The artwork will be permanently removed from your portfolio.</p>
                                <div className={styles.modalActions}>
                                    <button onClick={() => handleDeleteArtwork(showDeleteArtworkConfirm)} className={styles.saveBtn}>Delete</button>
                                    <button onClick={() => setShowDeleteArtworkConfirm(null)} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
