import React from 'react'
import styles from './Navbar.module.css'
import { useState } from 'react';
import artisanLogo from '../assets/images/artisanLogo.png'
import loginBtn from '../assets/images/profile_icon.png'

const Navbar = () => {
    const [open, setOpen] = useState(false);

  return (
    <header className={styles.navbar}>
        <div className={styles.logo}>
            <a href="/index.html">
                <img src={artisanLogo} alt="EMC Artisan Logo" />
            </a>
        </div>
        <div className={styles["search-container"]}>
            <input type="text" placeholder="Search" className={styles["search-bar"]} />
            <select className={styles["search-select"]}>
                <option value="all">All</option>
                <option value="student">Artwork Name</option>
                <option value="artwork">Student Name</option>
                <option value="genre">Genre</option>
            </select>
            <button type="button" className={styles["search-btn"]}>Search</button>
        </div>  

        {/*<!-- Navigation Links -->*/}
        <ul className={styles["nav-links"]}>
            <li><a href="/pages/about.html">About</a></li>
            <li><a href="/pages/contact.html">Contact Us</a></li>

            {/*<!-- TODO: dropdown-container img should be expandable -->*/}
            <li className={styles["dropdown-container"]} 
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <a href="/login" className={styles["dropdown-trigger"]}>
                    <img src={loginBtn} alt="Profile" className={styles["nav-profile"]} />
                </a>

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