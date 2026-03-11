import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import styles from './Gallery.module.css'

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // read query params for search
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('search') || '';
  const searchType = params.get('type') || 'all';


  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/artworks');
        setArtworks(res.data);
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    }
    fetchArtworks();
  }, [])

  // Get unique genres for filtering
  const categories = ['all', 'Digital Art', 'Illustration', 'Photography', 'Abstract', 'Animation', 'Portrait'];

  // first apply dropdown filter (category)
  let filteredArtworks = filter === 'all' 
    ? artworks 
    : artworks.filter(art => art.genre === filter);

  // then apply search from query based on type
  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    filteredArtworks = filteredArtworks.filter(art => {
      let target = '';
      if (searchType === 'all') {
        target = `${art.title} ${art.artist} ${art.genre}`;
      } else if (searchType === 'student') {
        target = art.artist;
      } else if (searchType === 'artwork') {
        target = art.title;
      } else if (searchType === 'category') {
        target = art.genre;
      }
      return target.toLowerCase().includes(lower);
    });
  }

  if (loading) {
    return (
      <section className={styles.gallery}>
        <div className={styles.galleryHeader}>
          <h1>Gallery</h1>
        </div>
        <p style={{ textAlign: 'center', color: '#aaa' }}>Loading artworks...</p>
      </section>
    );
  }

  return (
    <section className={styles.gallery}>
      {/* Background Animation */}
      <div className={styles.backgroundAnimation}></div>

      <div className={styles.container}>
        {/* Gallery Header with Filter Button */}
        <div className={styles.galleryHeader}>
          <h1>Gallery</h1>
          <div className={styles.filterContainer}>
            <button 
              title="filter" 
              className={styles.filter}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <svg viewBox="0 0 512 512" height="1em">
                <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
              </svg>
            </button>

            {/* Filter Dropdown Menu */}
            {showFilterMenu && (
              <div className={styles.filterDropdown}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`${styles.filterOption} ${filter === category ? styles.active : ''}`}
                    onClick={() => {
                      setFilter(category);
                      setShowFilterMenu(false);
                    }}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {/* Artwork Grid */}
        <div className={styles.artworkGrid}>
          {filteredArtworks.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#aaa' }}>
              No artworks available in this category.
            </p>
          ) : (
            filteredArtworks.map((artwork) => (
              <div key={artwork._id} className={styles.artworkCard}>
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title}
                  className={styles.artworkImage}
                />
                <div className={styles.artworkInfo}>
                  <h3>{artwork.title}</h3>
                  <p className={styles.artist}>by {artwork.artist}</p>
                  <p className={styles.genre}>{artwork.medium} • {artwork.year}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredArtworks.length > 0 && (
          <div className={styles.paginationContainer}>
            <div className={styles.tabs}>
              {[1, 2, 3, 4, 5].map((page) => (
                <div key={page} className={styles.tabGroup}>
                  <input 
                    type="radio" 
                    name="tab" 
                    id={`tab-${page}`}
                    defaultChecked={page === 1}
                  />
                  <label htmlFor={`tab-${page}`}>{page}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
