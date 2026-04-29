import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/')}
            aria-label="Back to Menu"
        >
            <span className={styles.arrow} aria-hidden="true">&larr;</span>
            <span>Back to Menu</span>
        </button>
    );
};

export default BackButton;
