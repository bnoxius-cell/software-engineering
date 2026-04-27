import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from '../../components/Navbar';
import styles from './Gallery.module.css';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isVideoArtwork } from '../../utils/artworkMedia';
import ArtworkVideoPlayer from '../../components/media/ArtworkVideoPlayer';
import { getAvatarUrl } from '../../utils/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_ARTWORK = '/assets/images/placeholder-artwork.svg';
const PROFILE_PLACEHOLDER = '/assets/images/profile_icon.png';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const normalizeText = (value) =>
    (value || '')
        .toString()
        .toLowerCase()
        .replace(/[_/-]+/g, ' ')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const CATEGORY_MAP = {
    [normalizeText('digital_2d')]: 'digital_2d',
    [normalizeText('3d_model')]: '3d_model',
    [normalizeText('traditional')]: 'traditional',
    [normalizeText('animation')]: 'animation',
    [normalizeText('ui_ux')]: 'ui_ux',
    [normalizeText('photography')]: 'photography',
};

const Gallery = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { artworkId } = useParams();
    const [searchParams] = useSearchParams();
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likedStates, setLikedStates] = useState({});
    const [savedStates, setSavedStates] = useState({});
    const [videoDurations, setVideoDurations] = useState({});
    
    // Comment-related state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentLikeStates, setCommentLikeStates] = useState({});
    
    const modalRef = useRef(null);
    const videoRefs = useRef({});

    // Fetch artworks
    useEffect(() => {
        const abortController = new AbortController();
        const fetchArtworks = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_BASE}/api/artworks?status=published`, {
                    signal: abortController.signal,
                });
                if (!response.ok) throw new Error('Failed to fetch artworks');
                const data = await response.json();
                setArtworks(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError('Unable to load artworks. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchArtworks();
        return () => abortController.abort();
    }, []);

    // Fetch user interactions (likes/saves)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const abortController = new AbortController();

        const fetchInteractions = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/artworks/interactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: abortController.signal,
                });

                if (!response.ok) throw new Error('Failed to fetch interactions');

                const data = await response.json();
                setLikedStates(
                    (data.likedArtworkIds || []).reduce((acc, id) => ({ ...acc, [id]: true }), {})
                );
                setSavedStates(
                    (data.savedArtworkIds || []).reduce((acc, id) => ({ ...acc, [id]: true }), {})
                );
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err);
                }
            }
        };

        fetchInteractions();
        return () => abortController.abort();
    }, []);

    // Restore body overflow on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    // Search & filter logic
    const rawSearchQuery = searchParams.get('search')?.trim() || '';
    const searchQuery = normalizeText(rawSearchQuery);
    const searchType = searchParams.get('type') || 'all';

    useEffect(() => {
        if (searchType === 'category') {
            const requestedCategory = CATEGORY_MAP[searchQuery];
            if (requestedCategory) {
                setActiveFilter(requestedCategory);
                return;
            }
        }
        setActiveFilter('all');
    }, [searchQuery, searchType]);

    const filteredArtworks = (() => {
        let result = activeFilter === 'all'
            ? artworks
            : artworks.filter(art => (art.medium || 'uncategorized') === activeFilter);
        if (!searchQuery) return result;
        return result.filter((art) => {
            const title = normalizeText(art.title);
            const artist = normalizeText(art.artistName);
            const medium = normalizeText(art.medium);
            const tags = normalizeText(art.tags);
            const description = normalizeText(art.description);
            switch (searchType) {
                case 'student': return artist.includes(searchQuery);
                case 'artwork': return title.includes(searchQuery);
                case 'category': return medium.includes(searchQuery) || tags.includes(searchQuery);
                default: return [title, artist, medium, tags, description].some(v => v.includes(searchQuery));
            }
        });
    })();

    // URL direct artwork opening
    useEffect(() => {
        if (!artworkId || loading) return;
        setError('');
        const requestedArtwork = artworks.find((art) => art._id === artworkId);
        if (requestedArtwork) {
            setSelectedArtwork(requestedArtwork);
            setIsModalOpen(true);
            document.body.style.overflow = 'hidden';
            fetchComments(requestedArtwork._id);
            setTimeout(() => modalRef.current?.focus(), 10);
        } else if (!loading) {
            setError('The requested artwork could not be found.');
        }
    }, [artworkId, artworks, loading]);

    // --- Comment functions ---
    const fetchComments = useCallback(async (artworkId) => {
        try {
            const res = await fetch(`${API_BASE}/api/artworks/${artworkId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
                const token = localStorage.getItem('token');
                if (token) {
                    const likeRes = await fetch(`${API_BASE}/api/comments/likes`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (likeRes.ok) {
                        const likedIds = await likeRes.json();
                        const newLikes = {};
                        likedIds.forEach(id => { newLikes[id] = true; });
                        setCommentLikeStates(newLikes);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch comments', err);
        }
    }, []);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setSubmittingComment(true);
        try {
            const res = await fetch(`${API_BASE}/api/artworks/${selectedArtwork._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                const addedComment = await res.json();
                setComments(prev => [addedComment, ...prev]);
                setNewComment('');
            } else {
                console.error('Failed to post comment');
            }
        } catch (err) {
            console.error('Error posting comment', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleLikeComment = async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const isLiked = !!commentLikeStates[commentId];

        // Optimistically update UI for immediate feedback
        setCommentLikeStates(prev => ({ ...prev, [commentId]: !isLiked }));
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                return { ...c, likes: (c.likes || 0) + (!isLiked ? 1 : -1) };
            }
            return c;
        }));

        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Server request failed');

            // Sync with server state to be 100% accurate, handling any race conditions
            const data = await res.json();
            setComments(prev => prev.map(c => 
                c._id === commentId ? { ...c, likes: data.likes } : c
            ));
        } catch (err) {
            // Revert optimistic changes on any error
            setCommentLikeStates(prev => ({ ...prev, [commentId]: isLiked }));
            setComments(prev => prev.map(c => {
                if (c._id === commentId) {
                    // This reverses the optimistic increment/decrement
                    return { ...c, likes: (c.likes || 0) - (!isLiked ? 1 : -1) };
                }
                return c;
            }));
            console.error('Failed to like comment', err);
        }
    };

    const openModal = (artwork) => {
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
        navigate({ pathname: `/gallery/${artwork._id}`, search: location.search });
        fetchComments(artwork._id);
        setTimeout(() => modalRef.current?.focus(), 10);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedArtwork(null);
        document.body.style.overflow = 'auto';
        navigate({ pathname: '/gallery', search: location.search });
    };

    const handleLike = async (artworkId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const newLiked = !likedStates[artworkId];
        setLikedStates(prev => ({ ...prev, [artworkId]: newLiked }));
        setArtworks(prev => prev.map((art) => (
            art._id === artworkId
                ? { ...art, likes: Math.max(0, (art.likes || 0) + (newLiked ? 1 : -1)) }
                : art
        )));
        setSelectedArtwork(prev => (
            prev && prev._id === artworkId
                ? { ...prev, likes: Math.max(0, (prev.likes || 0) + (newLiked ? 1 : -1)) }
                : prev
        ));
        try {
            await fetch(`${API_BASE}/api/artworks/${artworkId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ liked: newLiked }),
            });
        } catch (err) {
            setLikedStates(prev => ({ ...prev, [artworkId]: !newLiked }));
            setArtworks(prev => prev.map((art) => (
                art._id === artworkId
                    ? { ...art, likes: Math.max(0, (art.likes || 0) + (newLiked ? -1 : 1)) }
                    : art
            )));
            setSelectedArtwork(prev => (
                prev && prev._id === artworkId
                    ? { ...prev, likes: Math.max(0, (prev.likes || 0) + (newLiked ? -1 : 1)) }
                    : prev
            ));
        }
    };

    const handleSave = async (artworkId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const newSaved = !savedStates[artworkId];
        setSavedStates(prev => ({ ...prev, [artworkId]: newSaved }));
        try {
            await fetch(`${API_BASE}/api/auth/saved`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ artworkId, saved: newSaved }),
            });
        } catch (err) {
            setSavedStates(prev => ({ ...prev, [artworkId]: !newSaved }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return 'Invalid date';
        }
    };

    const handleImageError = (e) => {
        if (e.target.dataset.fallbackApplied === 'true') return;
        e.target.dataset.fallbackApplied = 'true';
        e.target.src = PLACEHOLDER_ARTWORK;
    };

    const handleVideoMetadataLoaded = (artworkId, duration) => {
        setVideoDurations(prev => ({ ...prev, [artworkId]: duration }));
    };

    const goToArtistProfile = (artwork, event) => {
        event?.stopPropagation();
        if (!artwork?.uploadedBy) return;
        const artistId = typeof artwork.uploadedBy === 'object' ? artwork.uploadedBy._id : artwork.uploadedBy;
        closeModal();
        navigate(`/profile/${artistId}`);
    };

    // --- VIDEO CARD RENDERING ---
    const renderCardMedia = (artwork) => {
        if (!isVideoArtwork(artwork)) {
            return (
                <img
                    src={`${API_BASE}${artwork.image}`}
                    alt={artwork.title}
                    className={styles.artImage}
                    loading="lazy"
                    onError={handleImageError}
                />
            );
        }

        const posterUrl = artwork.thumbnail ? `${API_BASE}${artwork.thumbnail}` : undefined;
        const videoUrl = `${API_BASE}${artwork.image}${!artwork.thumbnail ? '#t=0.05' : ''}`;

        return (
            <div className={styles.videoCardWrapper}>
                <video
                    ref={el => videoRefs.current[artwork._id] = el}
                    src={videoUrl}
                    poster={posterUrl}
                    className={styles.artImage}
                    muted
                    loop
                    preload="metadata"
                    onLoadedMetadata={(e) => handleVideoMetadataLoaded(artwork._id, e.target.duration)}
                    onMouseEnter={() => videoRefs.current[artwork._id]?.play()}
                    onMouseLeave={() => {
                        const vid = videoRefs.current[artwork._id];
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
                        {formatDuration(videoDurations[artwork._id] || artwork.duration)}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="background-fx"></div>
            <Navbar />
            <div className={styles.pageContainer}>
                <header className={styles.feedHeader}>
                    <h1>Discover Art</h1>
                    <p>Curated works from our top students</p>
                </header>

                {/* Filter Navigation */}
                <nav className={styles.filterContainer}>
                    {['all', 'digital_2d', '3d_model', 'traditional', 'animation', 'ui_ux', 'photography'].map(filter => (
                        <button
                            key={filter}
                            className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter === 'all' ? 'All Works' : filter.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </nav>

                <main className={styles.masonryGrid}>
                    {!loading && !error && filteredArtworks.length === 0 && (
                        <div className={styles.emptyStateLoader}>
                            <div className={styles.emptyStateMessage}>
                                ⟡ No artworks found in this category ⟡
                            </div>
                        </div>
                    )}
                    {!loading && !error && filteredArtworks.map((art) => (
                        <div key={art._id} className={styles.artCard} onClick={() => openModal(art)}>
                            {renderCardMedia(art)}
                            <div className={styles.cardOverlay}>
                                <div>
                                    <h3 className={styles.artTitle}>{art.title}</h3>
                                    <button className={styles.artistLink} onClick={(event) => goToArtistProfile(art, event)} type="button">
                                        by {art.artistName}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>

                {/* Loading and error states */}
                {loading && (
                    <div className={styles.fullscreenOverlay}>
                        <div className={styles.hackerLoader}>
                            <div className={styles.loaderText}>
                                <span data-text="Loading Artworks..." className={styles.textGlitch}>Loading Artworks...</span>
                            </div>
                            <div className={styles.loaderBar}>
                                <div className={styles.barFill}></div>
                                <div className={styles.barGlitch}></div>
                            </div>
                            <div className={styles.particles}>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={styles.particle}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {error && (
                    <div className={styles.fullscreenOverlay}>
                        <div className={styles.errorState}>
                            <div className={styles.errorGlitch}>
                                <span className={styles.errorText}>⚠️ {error}</span>
                            </div>
                            <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                                ⟳ RETRY
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Popup */}
            {isModalOpen && selectedArtwork && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div
                        className={styles.modalContainer}
                        onClick={(e) => e.stopPropagation()}
                        ref={modalRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Artwork: ${selectedArtwork.title}`}
                    >
                        <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">×</button>
                        <div className={styles.modalContent}>
                            {/* Left Side - Artwork Display */}
                            <div className={styles.modalArtwork}>
                                {isVideoArtwork(selectedArtwork) ? (
                                    <ArtworkVideoPlayer
                                        src={`${API_BASE}${selectedArtwork.image}${!selectedArtwork.thumbnail ? '#t=0.05' : ''}`}
                                        poster={selectedArtwork.thumbnail ? `${API_BASE}${selectedArtwork.thumbnail}` : undefined}
                                        alt={selectedArtwork.title}
                                        keyboardActive={isModalOpen}
                                    />
                                ) : (
                                    <img
                                        src={`${API_BASE}${selectedArtwork.image}`}
                                        alt={selectedArtwork.title}
                                        className={styles.modalArtImage}
                                        onError={handleImageError}
                                    />
                                )}
                            </div>

                            {/* Right Side - Artwork Info */}
                            <div className={styles.modalInfo}>
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>{selectedArtwork.title}</h2>
                                    <div className={styles.modalHeaderActions}>
                                        {/* Heart Like Button */}
                                        <div className={styles.heartContainer} title="Like">
                                            <input
                                                type="checkbox"
                                                className={styles.checkbox}
                                                id={`like-${selectedArtwork._id}`}
                                                checked={likedStates[selectedArtwork._id] || false}
                                                onChange={() => handleLike(selectedArtwork._id)}
                                            />
                                            <div className={styles.svgContainer}>
                                                <svg viewBox="0 0 24 24" className={styles.svgOutline}>
                                                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"/>
                                                </svg>
                                                <svg viewBox="0 0 24 24" className={styles.svgFilled}>
                                                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"/>
                                                </svg>
                                                <svg className={styles.svgCelebrate} width="100" height="100">
                                                    <polygon points="10,10 20,20"></polygon>
                                                    <polygon points="10,50 20,50"></polygon>
                                                    <polygon points="20,80 30,70"></polygon>
                                                    <polygon points="90,10 80,20"></polygon>
                                                    <polygon points="90,50 80,50"></polygon>
                                                    <polygon points="80,80 70,70"></polygon>
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Save Button */}
                                        <button
                                            className={`${styles.saveBtn} ${savedStates[selectedArtwork._id] ? styles.savedActive : ''}`}
                                            onClick={() => handleSave(selectedArtwork._id)}
                                            title="Save"
                                        >
                                            <svg viewBox="0 -0.5 25 25" height="20px" width="20px">
                                                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" d="M18.507 19.853V6.034C18.5116 5.49905 18.3034 4.98422 17.9283 4.60277C17.5532 4.22131 17.042 4.00449 16.507 4H8.50705C7.9721 4.00449 7.46085 4.22131 7.08577 4.60277C6.7107 4.98422 6.50252 5.49905 6.50705 6.034V19.853C6.45951 20.252 6.65541 20.6407 7.00441 20.8399C7.35342 21.039 7.78773 21.0099 8.10705 20.766L11.907 17.485C12.2496 17.1758 12.7705 17.1758 13.113 17.485L16.9071 20.767C17.2265 21.0111 17.6611 21.0402 18.0102 20.8407C18.3593 20.6413 18.5551 20.2522 18.507 19.853Z" clipRule="evenodd" fillRule="evenodd"/>
                                            </svg>
                                            <span className={styles.saveText}>
                                                {savedStates[selectedArtwork._id] ? 'Saved' : 'Save Post'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.modalDescription}>
                                    <h4>Description</h4>
                                    <p>{selectedArtwork.description || "No description available for this artwork."}</p>
                                </div>
                                <div className={styles.modalTags}>
                                    <h4>Medium</h4>
                                    <span className={styles.tag}>
                                        {selectedArtwork.medium ? selectedArtwork.medium.replace('_', ' ').toUpperCase() : "Digital Art"}
                                    </span>
                                </div>
                                <div className={styles.modalStats}>
                                    <div className={styles.statItem}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                            <line x1="8" y1="21" x2="16" y2="21"></line>
                                            <line x1="12" y1="17" x2="12" y2="21"></line>
                                        </svg>
                                        <span>{formatDate(selectedArtwork.createdAt)}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span>{selectedArtwork.likes || 0} likes</span>
                                    </div>
                                </div>
                                <div
                                    className={styles.modalArtistLink}
                                    onClick={(event) => goToArtistProfile(selectedArtwork, event)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            goToArtistProfile(selectedArtwork, event);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className={styles.modalArtist}>
                                        <img
                                            src={getAvatarUrl(selectedArtwork.artistAvatar)}
                                            alt={`${selectedArtwork.artistName}'s avatar`}
                                            className={styles.artistAvatar}
                                            onError={(event) => {
                                                event.target.src = PROFILE_PLACEHOLDER;
                                            }}
                                        />
                                        <div>
                                            <p className={styles.artistNameModal}>{selectedArtwork.artistName}</p>
                                            <p className={styles.artistRole}>Artist</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ===== COMMENTS SECTION ===== */}
                                <div className={styles.commentsSection}>
                                    <div className={styles.commentsHeader}>
                                        <h4>Comments</h4>
                                        <span className={styles.commentCount}>{comments.length}</span>
                                    </div>

                                    <div className={styles.commentsList}>
                                        {comments.length === 0 && (
                                            <div className={styles.noComments}>No comments yet. Be the first to share your thoughts!</div>
                                        )}
                                        {comments.map(comment => (
                                            <div key={comment._id} className={styles.commentItem}>
                                                <div className={styles.commentAvatar}>
                                                    <img src={getAvatarUrl(comment.user?.avatar)} alt="" />
                                                </div>
                                                <div className={styles.commentContent}>
                                                    <div className={styles.commentMeta}>
                                                        <strong>{comment.user?.name || 'Anonymous'}</strong>
                                                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className={styles.commentText}>{comment.content}</p>
                                                    <div className={styles.commentActions}>
                                                        <button 
                                                            className={`${styles.commentLikeBtn} ${commentLikeStates[comment._id] ? styles.liked : ''}`}
                                                            onClick={() => handleLikeComment(comment._id)}
                                                        >
                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                            </svg>
                                                            <span>{comment.likes || 0}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.addCommentBox}>
                                        <textarea
                                            placeholder="Share your thoughts..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={2}
                                            className={styles.commentTextarea}
                                        />
                                        <div className={styles.commentActionsBar}>
                                            <button 
                                                className={styles.submitCommentBtn}
                                                onClick={handleAddComment}
                                                disabled={submittingComment || !newComment.trim()}
                                            >
                                                {submittingComment ? 'Posting...' : 'Post Comment'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;