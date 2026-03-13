import React from "react";
import styles from "./Topbar.module.css"; // adjust if needed

const Topbar = ({ title }) => {
  return (
    <>
    <header className={styles["topbar"]}>
      <h1>{title}</h1>

      <a href="/" className={styles["admin-profile-link"]}>
        <div className={styles["admin-profile"]}>
          <img
            src="/assets/images/profile_icon.png" alt="Admin Profile" />
        </div>
      </a>
    </header>
    <section className={styles["action-section"]}>
      <div className={styles["action-buttons"]}>
        <a href="#create-user-form" className={styles["btn btn-primary"]}>
          <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create New User
        </a>
        <a href="#create-admin-form" className={styles["btn btn-secondary"]}>
          <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Create Admin User
        </a>
        <button className={styles["btn btn-secondary"]} disabled title="Bulk Actions (Disabled for UI)">
          <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Bulk Actions
        </button>
      </div>
      <div className={styles["search-container"]}>
        <input type="text" className={styles["search-input"]} placeholder="Search users..." disabled />
        <button className={styles["btn btn-secondary"]} disabled title="Search (Disabled for UI)">
          <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          Search
        </button>
      </div>
    </section>
    </>
    
  );
};

export default Topbar;