import React, { useEffect, useState } from "react";
import Navbar from '../../components/Navbar';
import styles from './Gallery.module.css';

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all'); // New state for the filter
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedArtwork, setSelectedArtwork] = useState(null); // State for the popup modal
    const ITEMS_PER_PAGE = 10;
    
    useEffect(() => {
        // Fetching only published works to keep the gallery safe
        fetch("http://localhost:5000/api/artworks?status=published")
            .then((res) => res.json())
            .then((data) => setArtworks(data))
            .catch((err) => console.error("Could not load artworks", err));
    }, []);

    // Reset page to 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    // Filter logic based on the 'medium' field from your Artwork Model
    const filteredArtworks = activeFilter === 'all' 
        ? artworks 
        : artworks.filter(art => art.medium === activeFilter);

    // SORTING FIX: Ensure consistent order (newest first) before paginating
    const sortedArtworks = [...filteredArtworks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // PAGINATION LOGIC
    const totalPages = Math.ceil(sortedArtworks.length / ITEMS_PER_PAGE);
    const paginatedArtworks = sortedArtworks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            <div className="background-fx"></div>

            <Navbar />

            <div className={styles.pageContainer}>
                <header className={styles.feedHeader}>
                    <h1>Discover Art</h1>
                    <p>Curated works from our top students</p>
                </header>

                {/* ===== NEW FILTER NAVIGATION ===== */}
                <nav className={styles.filterContainer}>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Works
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === 'digital_2d' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('digital_2d')}
                    >
                        Digital 2D
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === '3d_model' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('3d_model')}
                    >
                        3D Models
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === 'traditional' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('traditional')}
                    >
                        Traditional
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === 'animation' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('animation')}
                    >
                        Animation
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === 'ui_ux' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('ui_ux')}
                    >
                        UI/UX
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${activeFilter === 'photography' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('photography')}
                    >
                        Photography
                    </button>
                </nav>

                <main className={styles.masonryGrid}>
                    {artworks.length === 0 && <p style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>Loading artworks...</p>}
                    
                    {filteredArtworks.length === 0 && artworks.length > 0 && (
                        <p style={{ color: '#8b949e', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                            No artworks found in this category.
                        </p>
                    )}

                    {paginatedArtworks.map((art) => (
                        <div key={art._id} className={styles.artCard} onClick={() => setSelectedArtwork(art)}>
                            <img 
                                src={`http://localhost:5000${art.image}`} 
                                alt={art.title}
                                className={styles.artImage} 
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

                {/* ===== PAGINATION ===== */}
                {totalPages > 1 && (
                    <div className={styles.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1rem', paddingBottom: '1rem' }}>
                        <button
                            className={styles["page-btn"]}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ backgroundColor: 'rgba(55, 65, 81, 0.5)', color: '#d5d9e1', padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(156, 163, 175, 0.2)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1, fontWeight: 600 }}
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`${styles["page-dot"]} ${currentPage === page ? styles.active : ""}`}
                                onClick={() => setCurrentPage(page)}
                                aria-label={`Go to page ${page}`}
                                style={{ width: '10px', height: '10px', borderRadius: '50%', padding: 0, border: 'none', cursor: 'pointer', backgroundColor: currentPage === page ? 'rgb(161, 255, 20)' : 'rgba(55, 65, 81, 1)', transform: currentPage === page ? 'scale(1.2)' : 'none', transition: 'all 0.3s ease' }}
                            />
                        ))}
                        <button
                            className={styles["page-btn"]}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{ backgroundColor: 'rgba(55, 65, 81, 0.5)', color: '#d5d9e1', padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(156, 163, 175, 0.2)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1, fontWeight: 600 }}
                        >
                            Next
                        </button>
                    </div>
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