import React, { useEffect, useState } from "react";
import Navbar from '../../components/Navbar';
import styles from './Gallery.module.css';

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all'); // New state for the filter
    
    useEffect(() => {
        // Fetching only published works to keep the gallery safe
        fetch("http://localhost:5000/api/artworks?status=published")
            .then((res) => res.json())
            .then((data) => setArtworks(data))
            .catch((err) => console.error("Could not load artworks", err));
    }, []);

    // Filter logic based on the 'medium' field from your Artwork Model
    const filteredArtworks = activeFilter === 'all' 
        ? artworks 
        : artworks.filter(art => art.medium === activeFilter);

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

                    {filteredArtworks.map((art) => (
                        <div key={art._id} className={styles.artCard}>
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
            </div>
        </>
    );
};

export default Gallery;