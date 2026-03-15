import React from "react";
import styles from "./Topbar.module.css";

const Topbar = ({ title }) => {
  return (
    <>
        <header className={styles.stickyHeader}>
            <h1>{title}</h1>
            <a href="/" className={styles.profileLink}>
            <img className={styles.avatar} src="/assets/images/profile_icon.png" alt="Admin Profile" />
            </a>
        </header>
    </>
  );
};

export default Topbar;