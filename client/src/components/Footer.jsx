import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Footer.module.css'

const Footer = () => {
    const location = useLocation();
    const currentYear = new Date().getFullYear();

    // Don't render footer on login/register pages? (Optional)
    const hideOnPages = ['/login', '/register'];
    if (hideOnPages.includes(location.pathname)) {
        return null;
    }

    return (
        <footer className={styles.footer} role="contentinfo">
            <div className={styles["footer-content"]}>
                <h3>EMC Artisan</h3>
                <p>
                    A student-developed e-portfolio platform showcasing creative works
                    from Entertainment & Multimedia Computing students of
                    Our Lady of Fatima University.
                </p>

                <div className={styles["footer-links"]}>
                    <Link to="/" className={styles.footerLink} aria-label="Go to Home page">Home</Link>
                    <Link to="/gallery" className={styles.footerLink} aria-label="Browse Gallery">Gallery</Link>
                    <Link to="/about" className={styles.footerLink} aria-label="Learn About Us">About</Link>
                    <Link to="/contact" className={styles.footerLink} aria-label="Contact Us">Contact</Link>
                </div>

                <div className={styles.copyright}>
                    <span>© {currentYear} EMC Artisan | BSCS – SOFE311</span>
                    <span className={styles.separator}>•</span>
                    <span>All Rights Reserved</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
