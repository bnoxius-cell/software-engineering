import React from 'react';
import styles from './Badge.module.css';

const Badge = ({ children, variant = 'active' }) => {
    return (
        <span className={`${styles.badge} ${styles[variant.toLowerCase()] || styles.active}`}>
            {children}
        </span>
    );
};

export default Badge;