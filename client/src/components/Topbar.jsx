import React, { useState, useEffect } from "react";
import styles from "./Topbar.module.css";
import artisanLogo from "../assets/images/artisanLogo.png";
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_AVATAR = '/assets/images/profile_icon.png';

const getInitialAvatar = () => {
    const storedAvatar = localStorage.getItem('avatar');
    return storedAvatar ? getAvatarUrl(storedAvatar) : DEFAULT_AVATAR;
};

const Topbar = ({ title }) => {
    const [avatar, setAvatar] = useState(getInitialAvatar);

    useEffect(() => {
        const token = localStorage.getItem('token');
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

        const handleStorage = (e) => {
            if (e.key === 'avatar') {
                setAvatar(getAvatarUrl(e.newValue));
            }
        };
        const handleAvatarUpdate = (e) => {
            setAvatar(getAvatarUrl(e.detail));
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('avatarUpdated', handleAvatarUpdate);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('avatarUpdated', handleAvatarUpdate);
        };
    }, []);

    return (
        <>
            <header className={styles.stickyHeader}>
                <div className={styles.brand}>
                    <img src={artisanLogo} alt="Artisan Logo" className={styles.brandImg} />
                    <h1>{title}</h1>
                </div>
                <Link to="/profile" className={styles.profileLink}>
                    <img className={styles.avatar} src={avatar} alt="Admin Profile" onError={(e) => {
                        e.target.src = DEFAULT_AVATAR;
                    }} />
                </Link>
            </header>
        </>
    );
};

export default Topbar;

