import React, { useState, useEffect, useRef } from 'react'
import styles from './Navbar.module.css'
import { Link, useNavigate } from 'react-router-dom'
import artisanLogo from '../assets/images/artisanLogo.png'
import loginBtn from '../assets/images/profile_icon.png'

const Navbar = () => {
    const [open, setOpen] = useState(false)

    const [searchTerm, setSearchTerm] = useState('')
    const [searchType, setSearchType] = useState('all')

    const dropdownRef = useRef(null)

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            navigate(`/gallery?search=${encodeURIComponent(searchTerm.trim())}&type=${searchType}`)
        } else {
            navigate('/gallery')
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

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

            <ul className={styles["nav-links"]}>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>

                <li ref={dropdownRef} className={styles["profile-container"]}>
                    <button
                        type="button"
                        className={styles["profile-btn"]}
                        onClick={() => setOpen(!open)}
                    >
                        <img src={loginBtn} alt="Profile" className={styles["nav-profile"]}/>
                    </button>

                    {open && (
                        <div className={styles["profile-dropdown"]}>
                            <Link to="/login" className={styles["profile-item"]}>
                                <img src="/assets/images/icons/signupsymbol.png" className={styles["profile-icon"]}/>
                                Signup
                            </Link>

                            <button type="button" className={styles["profile-item"]}>
                                <img src="/assets/images/icons/setting.png" className={styles["profile-icon"]}/>
                                Settings
                            </button>

                            <button type="button" className={styles["profile-item"]}>
                                <img src="/assets/images/icons/accessibility.png" className={styles["profile-icon"]}/>
                                Accessibility
                            </button>
                        </div>
                    )}
                </li>

            </ul>
        </header>
    )
}

export default Navbar