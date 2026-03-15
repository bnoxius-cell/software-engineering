import React from 'react'
import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
        <div className={styles["footer-content"]}>
            <h3>EMC Artisan</h3>
            <p>
                A student-developed e-portfolio platform showcasing creative works
                from Entertainment & Multimedia Computing students of
                Our Lady of Fatima University.
            </p>

            <div className={styles["footer-links"]}>
                <a href="home.html">Home</a>
                <a href="gallery.html">Gallery</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
            </div>

            <span>
                © 2025 EMC Artisan | BSCS – SOFE311
            </span>
        </div>
    </footer>
  )
}

export default Footer