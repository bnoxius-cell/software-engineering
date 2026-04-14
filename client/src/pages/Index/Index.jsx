import React, { useState, useEffect } from 'react'
import styles from './Index.module.css'
import { Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/homeBackgroundImg.png'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_ARTWORK = '/assets/images/placeholder-artwork.svg';

const Index = () => {
  const [recentWorks, setRecentWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentWorks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE}/api/artworks?status=published`);
        if (response.ok) {
          const data = await response.json();
          
          // Filter only published works
          const publishedOnly = data.filter(work => work.status === 'published');
          
          // Sort by newest first, then take the top 10 for the infinite slider
          const latest = publishedOnly
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
            
          setRecentWorks(latest);
        } else {
          setError('Failed to load artworks');
        }
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
        setError('Unable to connect to the gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentWorks();
  }, []);

  // Create duplicate array for infinite scroll effect (only if we have at least 1 artwork)
  const duplicateWorks = recentWorks.length > 0 ? [...recentWorks, ...recentWorks] : [];

  const handleArtworkImageError = (e) => {
    if (e.target.dataset.fallbackApplied === 'true') {
      return;
    }

    e.target.dataset.fallbackApplied = 'true';
    e.target.src = PLACEHOLDER_ARTWORK;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ===== ENHANCED HERO SECTION ===== */}
      <section className={styles.hero}>
        <div className={styles["hero-box"]}>
          <div className={styles["hero-text"]}>
            <span className={styles.heroSubtitle}>Digital Portfolio Showcase</span>
            <h1>Welcome to <br /><span>EMC Artisan</span></h1>
            <p>
              The definitive digital archive for Entertainment & Multimedia Computing students. 
              Explore a curated collection of student mastery and digital innovation.
            </p>
            
            <Link to="/gallery" className={styles["button-link"]}>
              <button className={styles.button}>
                <svg className={styles.svgIcon} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
                </svg>
                <span>Explore</span>
              </button>
            </Link>
          </div>
          <div className={styles["hero-image"]}>
            <img src={backgroundImage} alt="Featured Art" />
          </div>
        </div>
      </section>

      {/* ===== RECENT WORKS GALLERY (3D VAULT) ===== */}
      <section className={styles.galleryPreviewSection}>
        <div className={styles.perspectiveGridFloor}></div>
        <div className={styles.perspectiveGridCeiling}></div>
        <div className={styles.horizonGlow}></div>

        <div className={styles.sectionHeader}>
            <span className={styles.neonLabel}>Museum Archive</span>
            <h2>Recent Submissions</h2>
            <div className={styles.neonDivider}></div>
        </div>

        <div className={styles.slider}>
          <div className={styles.slideTrack}>
            {loading ? (
              <div className={styles.loader}>Accessing Database...</div>
            ) : error ? (
              <div className={styles.errorMessage}>{error}</div>
            ) : recentWorks.length === 0 ? (
              <div className={styles.emptyState}>No artworks available yet. Check back soon!</div>
            ) : (
              duplicateWorks.map((work, idx) => (
                <div key={`${work._id}-${idx}`} className={styles.slide}>
                  <Link to={`/gallery/${work._id}`} className={styles.cardLink}>
                    <div className={styles.cardFrame}>
                        <div className={styles.holographicOverlay}></div>
                        <img
                          src={`${API_BASE}${work.image}`}
                          alt={work.title}
                          loading="lazy"
                          onError={handleArtworkImageError}
                        />
                        <div className={styles.cardInfo}>
                            <h4>{work.title}</h4>
                            <span>{work.artistName}</span>
                        </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index;
