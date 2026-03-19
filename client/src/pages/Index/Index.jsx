import React, { useState, useEffect } from 'react'
import styles from './Index.module.css'
import { Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/homeBackgroundImg.png'

const Index = () => {
  const [recentWorks, setRecentWorks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch latest artworks
  useEffect(() => {
    const fetchRecentWorks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/artworks');
        if (response.ok) {
          const data = await response.json();
          const latest = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
          setRecentWorks(latest);
        }
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
      }
    };
    fetchRecentWorks();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (recentWorks.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentWorks.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [recentWorks]);

  return (
    <>
    <section className={styles.hero}>
        <div className={styles["hero-box"]}>
            <div className={styles["hero-text"]}>
                <h1>Welcome to EMC Artisan E-Portfolio</h1>
                <p>Explore the artistic creations of EMC students.</p>
                {/* Gallery Preview */}             
                <Link to="/gallery" className={styles["button-link"]}>
                    <button className={styles.button}>
                        <svg className={styles.svgIcon} viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
                        </svg>
                        Explore
                    </button>
                </Link>
            </div>
            <div className={styles["hero-image"]}>
                <img src={backgroundImage} alt="Featured Art"/>
            </div>
        </div>
    </section>

    <section className={styles["carousel-section"]}>
        <div className={styles["carousel-header"]}>
            <h2>Recent Uploads</h2>
            <p>Discover the latest creations from our talented students.</p>
        </div>
        
        {recentWorks.length > 0 ? (
            <div className={styles["carousel-container"]}>
                <div className={styles["carousel-track"]} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {recentWorks.map((work) => (
                        <div key={work._id} className={styles["carousel-slide"]}>
                            <img src={`http://localhost:5000${work.image}`} alt={work.title} className={styles["carousel-image"]} />
                            <div className={styles["carousel-info"]}>
                                <h3>{work.title}</h3>
                                <p>By {work.artistName}</p>
                                <Link to="/gallery" className={styles["carousel-btn"]}>View Gallery</Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles["carousel-indicators"]}>
                    {recentWorks.map((_, idx) => (
                        <button key={idx} className={`${styles["indicator"]} ${idx === currentIndex ? styles["active"] : ""}`} onClick={() => setCurrentIndex(idx)} aria-label={`Go to slide ${idx + 1}`}></button>
                    ))}
                </div>
            </div>
        ) : (
            <p className={styles["loading-text"]}>Loading recent artworks...</p>
        )}
    </section>
    </>
  )
}

export default Index
