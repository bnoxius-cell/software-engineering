import React, { useState, useEffect } from 'react'
import styles from './Index.module.css'
import { Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/homeBackgroundImg.png'
import { isVideoArtwork } from '../../utils/artworkMedia';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_ARTWORK = '/assets/images/placeholder-artwork.svg';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Index = ({ user }) => {
  const [recentWorks, setRecentWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoDurations, setVideoDurations] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const userName = user?.name || localStorage.getItem('name');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Show toast only when user just logged in (flag set)
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true' && userName) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      sessionStorage.removeItem('justLoggedIn');
      return () => clearTimeout(timer);
    }
  }, [userName]);

  useEffect(() => {
    const fetchRecentWorks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE}/api/artworks?status=published`);
        if (response.ok) {
          const data = await response.json();
          const publishedOnly = data.filter(work => work.status === 'published');
          const latest = publishedOnly
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
          setRecentWorks(latest);
        } else {
          setError('Failed to load artworks');
        }
      } catch {
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

  const duplicateWorks = recentWorks.length > 0 ? [...recentWorks, ...recentWorks] : [];

  return (
    <div className={styles.pageWrapper}>
      {/* ===== HERO SECTION WITH CSS STARFIELD ===== */}
      <section className={styles.hero}>
        {/* Pure CSS stars – generated once, no canvas flicker */}
        <div className={styles.stars}>
          {[...Array(80)].map((_, i) => {
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = Math.random() * 2 + 1;
            const delay = Math.random() * 5;
            return (
              <div
                key={i}
                className={styles.star}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        <div className={styles["hero-box"]}>
          {/* Welcome toast – appears only once after login */}
          {showWelcome && userName && (
            <div className={styles.welcomeToast}>
              <div className={styles.toastContent}>
                <span className={styles.toastIcon}>👨‍🚀</span>
                <span className={styles.toastText}>Welcome back, {userName}!</span>
                <button
                  className={styles.toastClose}
                  onClick={() => setShowWelcome(false)}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

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

{/* ===== RECENT WORKS – REACT CAROUSEL (state-driven, fully clickable) ===== */}
<section className={styles.galleryPreviewSection}>
  <div className={styles.perspectiveGridFloor}></div>
  <div className={styles.perspectiveGridCeiling}></div>
  <div className={styles.horizonGlow}></div>

  <div className={styles.sectionHeader}>
    <span className={styles.neonLabel}>Artisan Archive</span>
    <h2>Recent Submissions</h2>
    <div className={styles.neonDivider}></div>
  </div>

  {loading ? (
    <div className={styles.archiveStatus}>
      <div className={styles.loader}>Accessing Database...</div>
    </div>
  ) : error ? (
    <div className={styles.archiveStatus}>
      <div className={styles.errorMessage}>{error}</div>
    </div>
  ) : recentWorks.length === 0 ? (
    <div className={styles.archiveStatus}>
      <div className={styles.emptyState}>No artworks available yet. Check back soon!</div>
    </div>
  ) : (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        {/* Main slide */}
        <div className={styles.mainSlideWrapper}>
          {recentWorks.slice(0, 6).map((work, idx) => (
            <div
              key={work._id}
              className={`${styles.carouselSlide} ${currentSlide === idx ? styles.activeSlide : ''}`}
            >
<Link to={`/gallery/${work._id}`} className={styles.carouselLink}>
  <img
    src={work.poster ? `${API_BASE}${work.poster}` : `${API_BASE}${work.image}`}
    alt={work.title}
    onError={handleImageError}
  />
  {isVideoArtwork(work) && (
    <div className={styles.videoBadgeCarousel}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </div>
  )}
  <div className={styles.artworkDetailsOverlay}>
    work by: {work.artistName}
  </div>
</Link>
              <div className={styles.carouselCaption}>
                {work.title}
              </div>
            </div>
          ))}
        </div>

        {/* Thumbnails */}
        <ul className={styles.carouselThumbnails}>
          {recentWorks.slice(0, 6).map((work, idx) => {
            const thumbUrl = work.thumbnail
              ? `${API_BASE}${work.thumbnail}`
              : work.poster
              ? `${API_BASE}${work.poster}`
              : `${API_BASE}${work.image}`;
            return (
              <li key={work._id}>
                <button
                  className={`${styles.thumbButton} ${currentSlide === idx ? styles.activeThumb : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                >
                  <img src={thumbUrl} alt={`Thumbnail for ${work.title}`} onError={handleImageError} />
                  {isVideoArtwork(work) && (
                    <div className={styles.thumbVideoBadge}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* "See more" button */}
      <div className={styles.viewGalleryWrapper}>
        <Link to="/gallery" className={styles.seeMoreBtn}>
          <strong>SEE MORE</strong>
          <div className={styles.btnStarsContainer}>
            <div className={styles.btnStars}></div>
          </div>
          <div className={styles.btnGlow}>
            <div className={styles.btnGlowCircle}></div>
            <div className={styles.btnGlowCircle}></div>
          </div>
        </Link>
      </div>
    </div>
  )}
</section>
    </div>
  );
};

export default Index;