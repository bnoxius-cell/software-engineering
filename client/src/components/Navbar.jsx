import React from 'react'
import styles from './Navbar.module.css'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import artisanLogo from '../assets/images/artisanLogo.png'
import loginBtn from '../assets/images/profile_icon.png'

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/gallery?search=${encodeURIComponent(searchTerm.trim())}&type=${searchType}`);
        } else {
            navigate('/gallery');
        }
    };

  return (
    <header className={styles.navbar}>
        <div className={styles.logo}>
            <Link to="/">
                <img src={artisanLogo} alt="EMC Artisan Logo" />
            </Link>
        </div>
        <form onSubmit={handleSubmit} className={styles["search-container"]}>
            <input
              type="text"
              placeholder="Search artworks"
              className={styles["search-bar"]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className={styles["search-select"]}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
                <option value="all">All</option>
                <option value="student">Student Name</option>
                <option value="artwork">Artwork Name</option>
                <option value="category">Category</option>
            </select>
            <button type="submit" className={styles["search-btn"]}>Search</button>
        </form>  

        {/*<!-- Navigation Links -->*/}
        <ul className={styles["nav-links"]}>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>

            {/*<!-- TODO: dropdown-container img should be expandable -->*/}
            <li className={styles["dropdown-container"]} 
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <Link to="/login" className={styles["dropdown-trigger"]}>
                    <img src={loginBtn} alt="Profile" className={styles["nav-profile"]} />
                </Link>

                {open && (
                    <div className={styles["dropdown-menu"]}>
                        <div className={styles["dropdown-content"]}>
                            <a href="#"><img src="/" alt="Profile" />Profile</a>
                            <a href="#"><img src="/assets/images/icons/account.png" alt="Account" />Account</a>
                            <a href="#"><img src="/assets/images/icons/setting.png" alt="Settings" />Settings</a>
                            <a href="#"><img src="/assets/images/icons/accessibility.png" alt="Accessibility" />Accessibility</a>
                            <a href="#"><img src="/assets/images/icons/notification.png" alt="Notifications" />Notifications</a>
                        </div>
                    </div>
                )}
            </li>
        </ul>
    </header>
  )
}

export default Navbar