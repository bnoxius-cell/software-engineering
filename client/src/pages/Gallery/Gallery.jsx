import React, { useEffect, useState } from "react";
import Navbar from '../../components/Navbar';
import styles from './Gallery.module.css';

// Dummy data using Unsplash placeholders with random heights for the masonry effect

const Index = () => {
    const [artworks, setArtworks] = useState([]);
    
      useEffect(() => {
        fetch("http://localhost:5000/api/artworks")
          .then((res) => res.json())
          .then((data) => setArtworks(data))
          .catch((err) => console.error("Could not load artworks", err));
      }, []);


    return (
        <>
            {/* Keeping your global dark background effect */}
            <div className="background-fx"></div>

            <Navbar />

            <div className={styles.pageContainer}>
                <header className={styles.feedHeader}>
                    <h1>Discover Art</h1>
                    <p>Curated works from our top students</p>
                </header>

                <main className={styles.masonryGrid}>
                    {artworks.length === 0 && <p style={{ color: 'white', textAlign: 'center' }}>Loading artworks...</p>}
                    
                    {artworks.map((art) => (
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

export default Index;