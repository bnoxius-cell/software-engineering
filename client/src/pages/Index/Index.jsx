import React, { useState, useEffect, useMemo } from 'react'
import styles from './Index.module.css'
import { Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/homeBackgroundImg.png'
import { isVideoArtwork } from '../../utils/artworkMedia';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_ARTWORK = '/assets/images/placeholder-artwork.svg';
const MAX_CAROUSEL_ITEMS = 6;

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
  const [showWelcome, setShowWelcome] = useState(false);
  const userName = user?.name || localStorage.getItem('name');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoDurations, setVideoDurations] = useState({});
  const visibleWorks = useMemo(
    () => recentWorks.slice(0, MAX_CAROUSEL_ITEMS),
    [recentWorks]
  );
  const slideCount = visibleWorks.length;
  const heroStars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
      })),
    []
  );
  const recentStars = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.2 + 0.8,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 3,
      })),
    []
  );

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

  const handleImageError = (e) => {
    if (e.target.dataset.fallbackApplied === 'true') return;
    e.target.dataset.fallbackApplied = 'true';
    e.target.src = PLACEHOLDER_ARTWORK;
  };

  const handleVideoMetadataLoaded = (artworkId, duration) => {
    setVideoDurations(prev => ({ ...prev, [artworkId]: duration }));
  };

  useEffect(() => {
    if (slideCount === 0) return;
    setCurrentSlide(prev => (prev >= slideCount ? 0 : prev));
  }, [slideCount]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (slideCount <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideCount);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slideCount]);

  // Handle previous slide
  const handlePrevSlide = () => {
    if (slideCount <= 1) return;
    setCurrentSlide(prev => (prev - 1 + slideCount) % slideCount);
  };

  // Handle next slide
  const handleNextSlide = () => {
    if (slideCount <= 1) return;
    setCurrentSlide(prev => (prev + 1) % slideCount);
  };

  const getArtworkImageUrl = (work) => {
    const imagePath = work?.poster || work?.thumbnail || work?.image;
    return imagePath ? `${API_BASE}${imagePath}` : PLACEHOLDER_ARTWORK;
  };

  const getArtworkVideoUrl = (work) => {
    const videoPath = work?.videoFile || work?.image;
    if (!videoPath) return '';
    return `${API_BASE}${videoPath}${work?.thumbnail || work?.poster ? '' : '#t=0.05'}`;
  };

  const getArtworkThumbUrl = (work) => {
    const thumbPath = work?.thumbnail || work?.poster || work?.image;
    return thumbPath ? `${API_BASE}${thumbPath}` : PLACEHOLDER_ARTWORK;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ===== HERO SECTION WITH CSS STARFIELD ===== */}
      <section className={styles.hero}>
        {/* Pure CSS stars – generated once, no canvas flicker */}
        <div className={styles.stars}>
          {heroStars.map((star) => {
            return (
              <div
                key={star.id}
                className={styles.star}
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDelay: `${star.delay}s`,
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
        <div className={styles.recentStars} aria-hidden="true">
          {recentStars.map((star) => (
            <span
              key={star.id}
              className={styles.recentStar}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
        <div className={styles.perspectiveGridFloor}></div>
        <div className={styles.perspectiveGridCeiling}></div>
        <div className={styles.horizonGlow}></div>
        <div className={styles.spaceDust}></div>
        <div className={styles.satelliteAccent} aria-hidden="true">
          <span className={styles.satelliteBody}></span>
          <span className={styles.satellitePanelLeft}></span>
          <span className={styles.satellitePanelRight}></span>
          <span className={styles.satelliteSignal}></span>
        </div>
        <div className={styles.creativeOrbit} aria-hidden="true"></div>
        <div className={styles.paletteAccent} aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className={styles.frameAccent} aria-hidden="true"></div>

        {/* ===== ROCKET ACCENT (green themed, stable exhaust) ===== */}
        <div className={styles.rocketOrbit} aria-hidden="true">
          <div className={styles.rocket}>
            <div className={styles.rocketWindow}></div>
            <div className={styles.rocketFire}></div>
            <div className={styles.rocketGas}></div>
            <div className={styles.rocketGas}></div>
            <div className={styles.rocketGas}></div>
            <div className={styles.rocketGas}></div>
            <div className={styles.rocketGas}></div>
            <div className={styles.rocketGas}></div>
            <div className={styles.rocketGas}></div>
          </div>
        </div>

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
            <div className={styles.carousel} aria-roledescription="carousel" aria-label="Recent artworks">
              <div className={styles.carouselStage}>
                {/* Previous Button */}
                {slideCount > 1 && (
                  <button
                    className={styles.navButtonPrev}
                    onClick={handlePrevSlide}
                    aria-label="Previous artwork"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                )}

                {/* Main slide */}
                <div className={styles.mainSlideWrapper}>
                  {visibleWorks.map((work, idx) => {
                    const isVideo = isVideoArtwork(work);
                    return (
                      <div
                        key={work._id}
                        className={`${styles.carouselSlide} ${currentSlide === idx ? styles.activeSlide : ''}`}
                        aria-hidden={currentSlide !== idx}
                      >
                        <Link
                          to={`/gallery/${work._id}`}
                          className={styles.carouselLink}
                        >
                          {isVideo ? (
                            <video
                              src={getArtworkVideoUrl(work)}
                              poster={work.thumbnail || work.poster ? getArtworkImageUrl(work) : undefined}
                              muted
                              playsInline
                              preload="metadata"
                              className={styles.carouselVideo}
                              onLoadedMetadata={(e) => handleVideoMetadataLoaded(work._id, e.target.duration)}
                            />
                          ) : (
                            <img
                              src={getArtworkImageUrl(work)}
                              alt={work.title}
                              onError={handleImageError}
                            />
                          )}
                          {isVideo && (
                            <div className={styles.videoBadgeCarousel}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                              <span>{formatDuration(videoDurations[work._id] || work.duration)}</span>
                            </div>
                          )}
                          <div className={styles.artworkDetailsOverlay}>
                            work by: {work.artistName || 'Unknown Artist'}
                          </div>
                        </Link>
                        <div className={styles.carouselCaption}>
                          {work.title}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Next Button */}
                {slideCount > 1 && (
                  <button
                    className={styles.navButtonNext}
                    onClick={handleNextSlide}
                    aria-label="Next artwork"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              <ul className={styles.carouselThumbnails}>
                {visibleWorks.map((work, idx) => {
                  const thumbUrl = getArtworkThumbUrl(work);
                  const isVideo = isVideoArtwork(work);
                  const hasPosterThumb = Boolean(work.thumbnail || work.poster);
                  return (
                    <li key={work._id}>
                      <button
                        className={`${styles.thumbButton} ${currentSlide === idx ? styles.activeThumb : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Show ${work.title}`}
                        aria-current={currentSlide === idx}
                      >
                        {isVideo && !hasPosterThumb ? (
                          <video
                            src={getArtworkVideoUrl(work)}
                            muted
                            playsInline
                            preload="metadata"
                            className={styles.thumbVideo}
                            onLoadedMetadata={(e) => {
                              if (e.currentTarget.readyState > 0) {
                                e.currentTarget.currentTime = Math.min(0.05, e.currentTarget.duration || 0.05);
                              }
                            }}
                          />
                        ) : (
                          <img src={thumbUrl} alt={`Thumbnail for ${work.title}`} onError={handleImageError} />
                        )}
                        {isVideo && (
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
