import React from 'react';
import styles from './Card.module.css';

const Card = ({ title, description, children }) => {
    return (
        <div className={styles.card}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
            {children}
        </div>
    );
};

export default Card;