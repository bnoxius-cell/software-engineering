import React, { useState } from 'react';
import styles from './Navbar.module.css';
import artisanLogo from '../assets/images/artisanLogo.png'
import { Link } from 'react-router-dom';

const Navbar = () => {
    // State to track if the hamburger menu is open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 

    return (
        <nav className={styles.glassPill}>
            <div className={styles.leftSection}>
                <a href="/" className={styles.brand}>
                    <img src={artisanLogo} alt="Artisan Logo" className={styles.brandImg} />
                    <span>artisan</span>
                </a>
            </div>

            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Search by medium, style, or artist..." 
                />
            </div>

            <div className={styles.actions}>
                <Link to="/upload" className={styles.uploadBtn}>
                    + Upload
                </Link>
                
                {/* The new Airbnb-style Menu Button */}
                <div className={styles.menuContainer}>
                    <button className={styles.menuBtn} onClick={toggleMenu}>
                        <svg className={styles.hamburgerIcon} viewBox="0 0 24 24">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                        </svg>
                        <img 
                            src="/assets/images/profile_icon.png" 
                            alt="User Profile" 
                            className={styles.avatar} 
                        />
                    </button>

                    {isMenuOpen && (
                        <div className={styles.dropdown}>
                            {/* Public Links (Everyone sees these) */}
                            <a href="/about" className={styles.dropdownItem}>About Us</a>
                            <a href="/contact" className={styles.dropdownItem}>Contact Us</a>
                            
                            <div style={{ height: '1px', backgroundColor: 'rgba(55, 65, 81, 1)', margin: '4px 0' }}></div>
                            
                            {/* Conditional Rendering Based on Auth State */}
                            {token ? (
                                <>
                                    {/* Standard Logged-In User Links */}
                                    <a href="/profile" className={styles.dropdownItem}>My Profile</a>
                                    
                                    {/* Strict Admin-Only Link */}
                                    {role && role.toLowerCase().trim() === 'admin' && (
                                        <a href="/dashboard" className={styles.dropdownItem}>Admin Dashboard</a>
                                    )}
                                    
                                    <a href="/settings" className={styles.dropdownItem}>Settings</a>
                                    
                                    {/* Logout */}
                                    <button 
                                        onClick={() => {
                                            localStorage.clear();
                                            window.location.href = '/login';
                                        }} 
                                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                                        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Guest Links */}
                                    <a href="/login" className={styles.dropdownItem}>Log In</a>
                                    <a href="/register" className={styles.dropdownItem}>Create Account</a>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;