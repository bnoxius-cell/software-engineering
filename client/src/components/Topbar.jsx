import React, { useState, useEffect } from "react";
import styles from "./Topbar.module.css";
import { getAvatarUrl } from '../utils/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BRAND_MARK = '/assets/images/artisanLogoOnly.png';

const Topbar = ({ title }) => {
    const [avatar, setAvatar] = useState(() => {
        const storedAvatar = localStorage.getItem('avatar');
        return storedAvatar ? getAvatarUrl(storedAvatar) : '/assets/images/profile_icon.png';
    });
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.ok ? res.json() : null)
                .then((data) => {
                    if (data) {
                        if (data.avatar) {
                            const resolved = getAvatarUrl(data.avatar);
                            setAvatar(resolved);
                            localStorage.setItem('avatar', data.avatar);
                        }
                        if (data.name) {
                            setUserName(data.name);
                        }
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
        <header className={styles.stickyHeader}>
            <div className={styles.brand}>
                <img src={BRAND_MARK} alt="Artisan Logo" className={styles.brandImg} />
                <h1>{title}</h1>
            </div>
            <div className={styles.userInfo}>
                <span className={styles.userName}>{userName || 'Admin'}</span>
                <img
                    className={styles.avatar}
                    src={avatar}
                    alt="Profile"
                    onError={(e) => {
                        e.target.src = '/assets/images/profile_icon.png';
                    }}
                />
            </div>
        </header>
    );
};

export default Topbar;
