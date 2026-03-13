import React, { useEffect, useState } from "react";
import styles from './Gallery.module.css';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/artworks")
      .then((res) => res.json())
      .then((data) => setArtworks(data))
      .catch((err) => console.error("Could not load artworks", err));
  }, []);

  return (
    <>
      <div className={styles["background-animation"]}></div>
      <section className={styles["gallery"]}>
        <div className={styles["container"]}>
          {/* Gallery Header */}
          <div className={styles["gallery-header"]}>
            <h1>Gallery</h1>
          </div>

          {/* Artworks Grid */}
          <div className={styles["artwork-grid"]} id="gallery-container">
            {artworks.length === 0 && <p>Loading artworks...</p>}
            {artworks.map((art) => (
              <div key={art._id} className={styles["artwork-card"]}>
                <img
                  src={`http://localhost:5000/${art.image}`} 
                  alt={art.title}
                  onError={(e) => e.target.src = "/fallback.png"} // optional fallback
                />
                <div className={styles["artwork-info"]}>
                  <h3>{art.title}</h3>
                  <p>by {art.artistName}</p>
                  <p>Genre: {art.genre}</p>
                  <p>{art.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;