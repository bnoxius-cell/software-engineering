import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from '../../components/Navbar';
import styles from './Gallery.module.css';

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const ITEMS_PER_PAGE = 10;

    // Navigation & Query Logic
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const searchType = searchParams.get('type') || 'all';
    const carouselRef = useRef(null);
    
    useEffect(() => {
        fetch("http://localhost:5000/api/artworks?status=published")
            .then((res) => res.json())
            .then((data) => setArtworks(data))
            .catch((err) => console.error("Could not load artworks", err));
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery]);

    // Get matching users from artworks whenever a search happens
    const matchedUsers = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        const uniqueUsersMap = new Map();

        artworks.forEach(art => {
            const artist = art.artistName || "Unknown Artist";
            if (artist.toLowerCase().includes(query)) {
                if (!uniqueUsersMap.has(artist)) {
                    uniqueUsersMap.set(artist, {
                        name: artist,
                        avatar: '/assets/images/profile_icon.png' // Default icon, change if user avatars exist in db
                    });
                }
            }
        });

        // Sort: Exact matches first, then alphabetically
        return Array.from(uniqueUsersMap.values()).sort((a, b) => {
            const aExact = a.name.toLowerCase() === query;
            const bExact = b.name.toLowerCase() === query;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [artworks, searchQuery]);

    // Combined Text Search and Category Filter
    const baseFilteredArtworks = activeFilter === 'all' 
        ? artworks 
        : artworks.filter(art => art.medium === activeFilter);

    const searchFilteredArtworks = baseFilteredArtworks.filter(art => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        if (searchType === 'user') {
            return art.artistName?.toLowerCase().includes(query);
        } else if (searchType === 'artwork') {
            return art.title?.toLowerCase().includes(query);
        }
        return art.title?.toLowerCase().includes(query) || art.artistName?.toLowerCase().includes(query);
    });

    const sortedArtworks = [...searchFilteredArtworks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalPages = Math.ceil(sortedArtworks.length / ITEMS_PER_PAGE);
    const paginatedArtworks = sortedArtworks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // ===== SMART PAGINATION LOGIC =====
    const getPageNumbers = () => {
        const delta = 2; // How many pages to show around the current page
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const itemWidth = 150; // Width + gap
            carouselRef.current.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
        }
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

                <header className={styles.feedHeader}>
                    <h1>Discover Art</h1>
                    <p>Curated works from our top students</p>
                </header>

                <nav className={styles.filterContainer}>
                    <button className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`} onClick={() => setActiveFilter('all')}>All Works</button>
                    <button className={`${styles.filterBtn} ${activeFilter === 'digital_2d' ? styles.active : ''}`} onClick={() => setActiveFilter('digital_2d')}>Digital 2D</button>
                    <button className={`${styles.filterBtn} ${activeFilter === '3d_model' ? styles.active : ''}`} onClick={() => setActiveFilter('3d_model')}>3D Models</button>
                    <button className={`${styles.filterBtn} ${activeFilter === 'traditional' ? styles.active : ''}`} onClick={() => setActiveFilter('traditional')}>Traditional</button>
                    <button className={`${styles.filterBtn} ${activeFilter === 'animation' ? styles.active : ''}`} onClick={() => setActiveFilter('animation')}>Animation</button>
                    <button className={`${styles.filterBtn} ${activeFilter === 'ui_ux' ? styles.active : ''}`} onClick={() => setActiveFilter('ui_ux')}>UI/UX</button>
                    <button className={`${styles.filterBtn} ${activeFilter === 'photography' ? styles.active : ''}`} onClick={() => setActiveFilter('photography')}>Photography</button>
                </nav>

                <main className={styles.masonryGrid}>
                    {artworks.length === 0 && <p style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>Loading artworks...</p>}
                    
                    {searchFilteredArtworks.length === 0 && artworks.length > 0 && (
                        <p style={{ color: '#8b949e', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                            {searchType === 'user' && searchQuery
                                ? `User "${searchQuery}" not found, or they currently have no published artworks.`
                                : "No artworks found matching your criteria."}
                        </p>
                    )}

                    {paginatedArtworks.map((art) => (
                        <div key={art._id} className={styles.artCard} onClick={() => setSelectedArtwork(art)}>
                            <img src={`http://localhost:5000${art.image}`} alt={art.title} className={styles.artImage} />
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
            </div>

            {/* ===== POKEMON CARD STYLE POPUP MODAL ===== */}
            {selectedArtwork && (
                <div className={styles.modalOverlay} onClick={() => setSelectedArtwork(null)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedArtwork(null)}>
                            &times;
                        </button>
                        
                        <div className={styles.modalImageContainer}>
                            <img 
                                src={`http://localhost:5000${selectedArtwork.image}`} 
                                alt={selectedArtwork.title} 
                                className={styles.modalImage}
                            />
                        </div>

                        <div className={styles.modalInfo}>
                            <h2 className={styles.modalTitle}>{selectedArtwork.title}</h2>
                            <p className={styles.modalArtist}>by {selectedArtwork.artistName}</p>
                            
                            <div className={styles.modalBadges}>
                                <span className={styles.modalBadge}>{selectedArtwork.medium?.replace('_', ' ')}</span>
                            </div>
                            
                            <p className={styles.modalDesc}>{selectedArtwork.description || "No description provided for this artwork."}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;