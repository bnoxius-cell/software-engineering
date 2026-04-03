import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import styles from './Gallery.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likedStates, setLikedStates] = useState({});
    const [savedStates, setSavedStates] = useState({});

    // Pagination and Search State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    
    const navigate = useNavigate();
    const location = useLocation();
    const carouselRef = useRef(null);

    // Extract search query from URL
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';
    const searchType = queryParams.get('type') || 'all';

    // Mocking matchedUsers for the UI - in a real app, you'd fetch this
    const [matchedUsers, setMatchedUsers] = useState([]);
    
    const modalRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
        }
    };

    // Fetch artworks with abort controller
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
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchArtworks();
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

    // Filter and Search Logic
    const processedArtworks = artworks.filter(art => {
        const matchesFilter = activeFilter === 'all' || (art.medium || 'uncategorized') === activeFilter;
        const matchesSearch = !searchQuery || 
            (searchType === 'artwork' && art.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (searchType === 'user' && art.artistName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (searchType === 'all' && (art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.artistName.toLowerCase().includes(searchQuery.toLowerCase())));
        
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(processedArtworks.length / itemsPerPage);
    const filteredArtworks = processedArtworks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    const openModal = (artwork) => {
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
        // Focus modal for accessibility (optional)
        setTimeout(() => modalRef.current?.focus(), 10);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedArtwork(null);
        document.body.style.overflow = 'auto';
    };

    const handleLike = async (artworkId) => {
        const token = localStorage.getItem('token');
        const newLiked = !likedStates[artworkId];
        setLikedStates(prev => ({ ...prev, [artworkId]: newLiked }));
        try {
            await fetch(`${API_BASE}/api/artworks/${artworkId}/like`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ liked: newLiked }),
            });
        } catch (err) {
            console.error('Failed to update like status', err);
            // Optionally revert UI state
            setLikedStates(prev => ({ ...prev, [artworkId]: !newLiked }));
        }
    };

    const handleSave = async (artworkId) => {
        const token = localStorage.getItem('token');
        const newSaved = !savedStates[artworkId];
        setSavedStates(prev => ({ ...prev, [artworkId]: newSaved }));
        try {
            await fetch(`${API_BASE}/api/users/saved`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ artworkId, saved: newSaved }),
            });
        } catch (err) {
            console.error('Failed to update saved status', err);
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
        e.target.src = '/assets/images/placeholder-image.png';
    };

    return (
        <>
            <div className="background-fx"></div>
            <Navbar />

            <div className={styles.pageContainer}>
                {/* ===== HORIZONTAL USER SEARCH CAROUSEL ===== */}
                {searchQuery && matchedUsers.length > 0 && (
                    <div className={styles.userSearchSection}>
                        <h2 className={styles.userSearchHeader}>Matching Artists</h2>
                        <div className={styles.carouselContainer}>
                            <button className={styles.carouselBtn} onClick={() => scrollCarousel(-1)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <div className={styles.carouselTrack} ref={carouselRef}>
                                {matchedUsers.map((user, idx) => (
                                    <div 
                                        key={idx} 
                                        className={styles.userCard}
                                        onClick={() => navigate(`/gallery?search=${encodeURIComponent(user.name)}&type=user`)}
                                    >
                                        <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                                        <span className={styles.userName} title={user.name}>{user.name}</span>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.carouselBtn} onClick={() => scrollCarousel(1)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== HORIZONTAL USER SEARCH CAROUSEL ===== */}
                {searchQuery && matchedUsers.length > 0 && (
                    <div className={styles.userSearchSection}>
                        <h2 className={styles.userSearchHeader}>Matching Artists</h2>
                        <div className={styles.carouselContainer}>
                            <button className={styles.carouselBtn} onClick={() => scrollCarousel(-1)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <div className={styles.carouselTrack} ref={carouselRef}>
                                {matchedUsers.map((user, idx) => (
                                    <div 
                                        key={idx} 
                                        className={styles.userCard}
                                        onClick={() => navigate(`/gallery?search=${encodeURIComponent(user.name)}&type=user`)}
                                    >
                                        <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                                        <span className={styles.userName} title={user.name}>{user.name}</span>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.carouselBtn} onClick={() => scrollCarousel(1)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

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
                    {loading && (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Loading masterpieces...</p>
                        </div>
                    )}
                    {error && (
                        <div className={styles.errorState}>
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
                        </div>
                    )}
                    {!loading && !error && filteredArtworks.length === 0 && (
                        <p className={styles.emptyState}>No artworks found in this category.</p>
                    )}
                    {!loading && !error && filteredArtworks.map((art) => (
                        <div key={art._id} className={styles.artCard} onClick={() => openModal(art)}>
                            <img
                                src={`${API_BASE}${art.image}`}
                                alt={art.title}
                                className={styles.artImage}
                                loading="lazy"
                                onError={handleImageError}
                            />
                            <div className={styles.cardOverlay}>
                                <div>
                                    <h3 className={styles.artTitle}>{art.title}</h3>
                                    <p className={styles.artistName}>by {art.artistName}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>

                {/* ===== NEW PAGINATION DESIGN ===== */}
                {totalPages > 1 && (
                    <nav className={styles.paginationNav} aria-label="Pagination Navigation">
                        {/* PREVIOUS BUTTON */}
                        <button 
                            className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous Page"
                        >
                            <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        {/* PAGE NUMBERS AND DOTS */}
                        {getPageNumbers().map((page, index) => {
                            if (page === '...') {
                                return (
                                    <span key={`ellipsis-${index}`} className={`${styles.pageItem} ${styles.ellipsis}`}>
                                        &hellip;
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    className={`${styles.pageItem} ${currentPage === page ? styles.activePage : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                    aria-current={currentPage === page ? "true" : "false"}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* NEXT BUTTON */}
                        <button 
                            className={`${styles.pageItem} ${currentPage === totalPages ? styles.disabled : ''}`}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            aria-label="Next Page"
                        >
                            <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </nav>
                )}

                {/* ===== NEW PAGINATION DESIGN ===== */}
                {totalPages > 1 && (
                    <nav className={styles.paginationNav} aria-label="Pagination Navigation">
                        {/* PREVIOUS BUTTON */}
                        <button 
                            className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous Page"
                        >
                            <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        {/* PAGE NUMBERS AND DOTS */}
                        {getPageNumbers().map((page, index) => {
                            if (page === '...') {
                                return (
                                    <span key={`ellipsis-${index}`} className={`${styles.pageItem} ${styles.ellipsis}`}>
                                        &hellip;
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    className={`${styles.pageItem} ${currentPage === page ? styles.activePage : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                    aria-current={currentPage === page ? "true" : "false"}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* NEXT BUTTON */}
                        <button 
                            className={`${styles.pageItem} ${currentPage === totalPages ? styles.disabled : ''}`}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            aria-label="Next Page"
                        >
                            <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </nav>
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
                                <img
                                    src={`${API_BASE}${selectedArtwork.image}`}
                                    alt={selectedArtwork.title}
                                    className={styles.modalArtImage}
                                    onError={handleImageError}
                                />
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
                                                <svg viewBox="0 0 24 24" className={styles.svgOutline} xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
                                                </svg>
                                                <svg viewBox="0 0 24 24" className={styles.svgFilled} xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
                                                </svg>
                                                <svg className={styles.svgCelebrate} width="100" height="100" xmlns="http://www.w3.org/2000/svg">
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
                                            <svg viewBox="0 -0.5 25 25" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" d="M18.507 19.853V6.034C18.5116 5.49905 18.3034 4.98422 17.9283 4.60277C17.5532 4.22131 17.042 4.00449 16.507 4H8.50705C7.9721 4.00449 7.46085 4.22131 7.08577 4.60277C6.7107 4.98422 6.50252 5.49905 6.50705 6.034V19.853C6.45951 20.252 6.65541 20.6407 7.00441 20.8399C7.35342 21.039 7.78773 21.0099 8.10705 20.766L11.907 17.485C12.2496 17.1758 12.7705 17.1758 13.113 17.485L16.9071 20.767C17.2265 21.0111 17.6611 21.0402 18.0102 20.8407C18.3593 20.6413 18.5551 20.2522 18.507 19.853Z" clipRule="evenodd" fillRule="evenodd"></path>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                            <line x1="8" y1="21" x2="16" y2="21"></line>
                                            <line x1="12" y1="17" x2="12" y2="21"></line>
                                        </svg>
                                        <span>{formatDate(selectedArtwork.createdAt)}</span>
                                    </div>
                                </div>

                                <div className={styles.modalArtist}>
                                    <img
                                        src={selectedArtwork.artistAvatar || "/assets/images/profile_icon.png"}
                                        alt={`${selectedArtwork.artistName}'s avatar`}
                                        className={styles.artistAvatar}
                                        onError={handleImageError}
                                    />
                                    <div>
                                        <p className={styles.artistNameModal}>{selectedArtwork.artistName}</p>
                                        <p className={styles.artistRole}>Artist</p>
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
export default Gallery;