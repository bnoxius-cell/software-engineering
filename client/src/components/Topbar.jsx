import React from "react";
import styles from "./Topbar.module.css";
import artisanLogo from "../assets/images/artisanLogo.png";

const Topbar = ({ title }) => {
  return (
    <>
        <header className={styles.stickyHeader}>
            <div className={styles.brand}>
                <img src={artisanLogo} alt="Artisan Logo" className={styles.brandImg} />
                <h1>{title}</h1>
            </div>
            <a href="/" className={styles.profileLink}>
            <img className={styles.avatar} src="/assets/images/profile_icon.png" alt="Admin Profile" />
            </a>
        </header>
    </>
  );
};

export default Topbar;
