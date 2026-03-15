import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import artisanLogo from '../assets/images/artisanLogo.png';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    
    // NEW: State to control the popup visibility
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 
    const userAvatar = localStorage.getItem('avatar') || '/assets/images/profile_icon.png';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault(); 
        if (searchQuery.trim() !== '') {
            navigate(`/gallery?search=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`);
        } else {
            navigate('/gallery');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <Link to="/" className={styles.brand}>
                    <img src={artisanLogo} alt="Artisan Logo" className={styles.brandImg} />
                </Link>
            </div>

            <form onSubmit={handleSearch} className={styles.searchContainer}>
                <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                    className={styles.searchSelect}
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="student">Student Name</option>
                    <option value="artwork">Artwork Name</option>
                    <option value="category">Category</option>
                </select>

                <button type="submit" className={styles.searchBtn}>Search</button>
            </form>

            <ul className={styles.navLinks}>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                
                {/* CHANGED: Upload Button with Upward Pointing Arrows */}
                <li>
                    {token ? (
                        <Link to="/upload" className={styles.animatedButton}>
                            <svg viewBox="0 0 24 24" className={styles.arr2} xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.9999 7.82843L18.364 13.1925L19.7782 11.7783L11.9999 4L4.22168 11.7783L5.63589 13.1925L10.9999 7.82843V20H12.9999V7.82843Z"></path>
                            </svg>
                            <span className={styles.text}>Upload</span>
                            <span className={styles.circle}></span>
                            <svg viewBox="0 0 24 24" className={styles.arr1} xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.9999 7.82843L18.364 13.1925L19.7782 11.7783L11.9999 4L4.22168 11.7783L5.63589 13.1925L10.9999 7.82843V20H12.9999V7.82843Z"></path>
                            </svg>
                        </Link>
                    ) : (
                        <button 
                            type="button" 
                            className={styles.animatedButton} 
                            onClick={() => setShowAuthModal(true)}
                        >
                            <svg viewBox="0 0 24 24" className={styles.arr2} xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.9999 7.82843L18.364 13.1925L19.7782 11.7783L11.9999 4L4.22168 11.7783L5.63589 13.1925L10.9999 7.82843V20H12.9999V7.82843Z"></path>
                            </svg>
                            <span className={styles.text}>Upload</span>
                            <span className={styles.circle}></span>
                            <svg viewBox="0 0 24 24" className={styles.arr1} xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.9999 7.82843L18.364 13.1925L19.7782 11.7783L11.9999 4L4.22168 11.7783L5.63589 13.1925L10.9999 7.82843V20H12.9999V7.82843Z"></path>
                            </svg>
                        </button>
                    )}
                </li>

                <li ref={menuRef} className={styles.menuContainer}>
                    <button type="button" className={styles.profileBtn} onClick={toggleMenu}>
                        <img src={userAvatar} alt="Profile" className={styles.avatar} />
                    </button>

                    {isMenuOpen && (
                        <div className={styles.dropdown}>
                            {token ? (
                                <>
                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                        <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        My Profile
                                    </Link>
                                    
                                    {role && role.toLowerCase().trim() === 'admin' && (
                                        <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                            <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    
                                    <Link to="/settings" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                        <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                                        Settings
                                    </Link>
                                    
                                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                                        <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                        <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
                                        Log In
                                    </Link>
                                    <Link to="/register" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                        <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </li>
            </ul>

            {/* NEW: The Auth Required Modal */}
            {showAuthModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Authentication Required</h3>
                        <p>You need an account to upload artwork to the gallery.</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowAuthModal(false)} className={styles.modalCancelBtn}>Cancel</button>
                            <Link to="/login" className={styles.modalLoginBtn} onClick={() => setShowAuthModal(false)}>Log In</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;