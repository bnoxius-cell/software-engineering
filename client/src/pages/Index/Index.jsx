import React, { useState, useEffect } from 'react'
import styles from './Index.module.css'
import { Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/homeBackgroundImg.png'
import { isVideoArtwork } from '../../utils/artworkMedia';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_ARTWORK = '/assets/images/placeholder-artwork.svg';

// Helper to format seconds into MM:SS (same as gallery)
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Index = () => {
  const [recentWorks, setRecentWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoDurations, setVideoDurations] = useState({});

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

        setError('Unable to connect to the gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentWorks();
  }, []);

  const handleVideoMetadataLoaded = (artworkId, duration) => {
    setVideoDurations(prev => ({ ...prev, [artworkId]: duration }));
  };

  const handleImageError = (e) => {
    if (e.target.dataset.fallbackApplied === 'true') return;
    e.target.dataset.fallbackApplied = 'true';
    e.target.src = PLACEHOLDER_ARTWORK;
  };

  // Create duplicate array for infinite scroll effect (only if we have at least 1 artwork)
  const duplicateWorks = recentWorks.length > 0 ? [...recentWorks, ...recentWorks] : [];

  return (
    <div className={styles.pageWrapper}>
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
      <div className={styles.artworkCredit}>Artwork by: Jennah Casulla</div>
    </div>
  </div>
</section>

      {/* ===== RECENT WORKS GALLERY (3D VAULT) ===== */}
      <section className={styles.galleryPreviewSection}>
        <div className={styles.perspectiveGridFloor}></div>
        <div className={styles.perspectiveGridCeiling}></div>
        <div className={styles.horizonGlow}></div>

        <div className={styles.sectionHeader}>
            <span className={styles.neonLabel}>Artisan Archive</span>
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
              duplicateWorks.map((work, idx) => {
                // Create a stable key: original works get a "0", duplicates get "1"
                const duplicateFlag = idx >= recentWorks.length ? 1 : 0;
                const uniqueKey = `${work._id}-dup${duplicateFlag}`;
                return (
                  <div key={uniqueKey} className={styles.slide}>
                    <Link to={`/gallery/${work._id}`} className={styles.cardLink}>
                      <div className={styles.cardFrame}>
                        <div className={styles.holographicOverlay}></div>
{isVideoArtwork(work) ? (
  <>
    <video
      src={`${API_BASE}${work.image}`}
      poster={work.poster ? `${API_BASE}${work.poster}` : null}
      muted
      loop
      preload="metadata"
      onLoadedMetadata={(e) => handleVideoMetadataLoaded(work._id, e.target.duration)}
      onMouseEnter={(e) => e.target.play()}
      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
      aria-label={`Video preview: ${work.title}`}
      // removed pointerEvents: 'none' – now hover works
    />
    <div className={styles.videoBadge}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span className={styles.videoDuration}>
        {formatDuration(videoDurations[work._id] || work.duration)}
      </span>
    </div>
  </>
) : (
  <img
    src={`${API_BASE}${work.image}`}
    alt={work.title}
    loading="lazy"
    onError={handleImageError}
  />
)}
                        <div className={styles.cardInfo}>
                          <h4>{work.title}</h4>
                          <span>{work.artistName}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index;