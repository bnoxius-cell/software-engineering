import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import artisanLogo from '../assets/images/artisanLogo.png';
import { Link, useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [avatar, setAvatar] = useState('/assets/images/profile_icon.png');
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    
    const menuRef = useRef(null);
    const filterRef = useRef(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Load avatar from localStorage + fetch from API for accuracy
    useEffect(() => {
        const storedAvatar = localStorage.getItem('avatar');
        if (storedAvatar) {
            setAvatar(getAvatarUrl(storedAvatar));
        }

        // Fetch fresh user data if logged in
        if (token) {
            fetch(`${API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.ok ? res.json() : null)
                .then((data) => {
                    if (data?.avatar) {
                        const resolved = getAvatarUrl(data.avatar);
                        setAvatar(resolved);
                        localStorage.setItem('avatar', data.avatar);
                    }
                })
                .catch(() => {});
        }
    }, [token]);

    // Listen for avatar changes from other tabs/components
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'avatar') {
                setAvatar(getAvatarUrl(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Listen for custom avatar update event from same-tab uploads
    useEffect(() => {
        const handleAvatarUpdate = (e) => {
            setAvatar(getAvatarUrl(e.detail));
        };
        window.addEventListener('avatarUpdated', handleAvatarUpdate);
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

    useEffect(() => {
        if (!token) {
            setUnreadNotifications(0);
            return undefined;
        }

        let isMounted = true;

        const fetchNotificationSummary = async () => {
            try {
                const res = await fetch('/api/notifications/summary', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch notification summary');
                }

                const data = await res.json();
                if (isMounted) {
                    setUnreadNotifications(data.unreadCount || 0);
                }
            } catch (error) {
                console.error('Failed to fetch notification summary:', error);
            }
        };

        fetchNotificationSummary();
        window.addEventListener('focus', fetchNotificationSummary);

        // Poll every 10 seconds
        const interval = setInterval(fetchNotificationSummary, 10000);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', fetchNotificationSummary);
            clearInterval(interval);
        };
    }, [token, unreadNotifications]); // Refetch if count changes

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

    // Handle clicks outside of dropdowns to close them
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
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
        setIsFilterOpen(false);
    };

    const handleOptionSelect = (type, e) => {
        e.stopPropagation();
        setSearchType(type);
        setIsFilterOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const normalizedRole = role ? role.toLowerCase().trim() : '';
    const isAdmin = normalizedRole === 'admin';
    const isFaculty = normalizedRole === 'faculty';
    const canAccessDashboard = isAdmin || isFaculty;

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <Link to="/" className={styles.brand}>
                    <img src={artisanLogo} alt="Artisan Logo" className={styles.brandImg} />
                </Link>
            </div>

            {/* Premium Neon Search Bar */}
            <form onSubmit={handleSearch} className={styles.searchContainer}>
                <div className={styles.searchIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Query The Aether..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Custom Filter Dropdown */}
                <div className={styles.filterWrapper} title="Search Filter" ref={filterRef} onClick={toggleFilter}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="4.8 4.56 14.832 15.408" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"></path>
                    </svg>
                    
                    {isFilterOpen && (
                        <ul className={styles.customFilterMenu}>
                            <li 
                                className={`${styles.filterOption} ${searchType === 'all' ? styles.filterOptionActive : ''}`} 
                                onClick={(e) => handleOptionSelect('all', e)}
                            >
                                All Categories
                            </li>
                            <li 
                                className={`${styles.filterOption} ${searchType === 'student' ? styles.filterOptionActive : ''}`} 
                                onClick={(e) => handleOptionSelect('student', e)}
                            >
                                Student Name
                            </li>
                            <li 
                                className={`${styles.filterOption} ${searchType === 'artwork' ? styles.filterOptionActive : ''}`} 
                                onClick={(e) => handleOptionSelect('artwork', e)}
                            >
                                Artwork Name
                            </li>
                            <li 
                                className={`${styles.filterOption} ${searchType === 'category' ? styles.filterOptionActive : ''}`} 
                                onClick={(e) => handleOptionSelect('category', e)}
                            >
                                Medium / Tag
                            </li>
                        </ul>
                    )}
                </div>
            </form>

            <ul className={styles.navLinks}>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                
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

                {/* ===== NOTIFICATION BUTTON ===== */}
                <li>
                    {token ? (
                        <Link 
                            to="/notifications" 
                            className={styles.notificationBtn}
                            aria-label="Notifications"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className={styles.bellIcon}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                />
                            </svg>
                            {/* Replace `true` with actual condition (e.g., unreadCount > 0) */}
                            {unreadNotifications > 0 && (
                                <span className={styles.notificationBadge}>
                                    <span className={styles.badgePulse}></span>
                                </span>
                            )}
                        </Link>
                    ) : (
                        <button 
                            type="button" 
                            className={styles.notificationBtn}
                            onClick={() => setShowAuthModal(true)}
                            aria-label="Notifications"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className={styles.bellIcon}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                />
                            </svg>
                        </button>
                    )}
                </li>

                <li ref={menuRef} className={styles.menuContainer}>
                    <button type="button" className={styles.profileBtn} onClick={toggleMenu}>
                        <img src={avatar} alt="Profile" className={styles.avatar} onError={(e) => {
                            e.target.src = '/assets/images/profile_icon.png';
                        }} />
                    </button>

                    {isMenuOpen && (
                        <div className={styles.dropdown}>
                            {token ? (
                                <>
                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                        <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        My Profile
                                    </Link>
                                    
                                    {canAccessDashboard && (
                                        <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                            <svg className={styles.dropdownIcon} viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                                            {isAdmin ? 'Admin Dashboard' : 'Faculty Dashboard'}
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

            {/* Auth Required Modal */}
            {showAuthModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Authentication Required</h3>
                        <p>You need an account to upload artwork to the gallery.</p>
                        <div className={styles.modalButtons}>
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

