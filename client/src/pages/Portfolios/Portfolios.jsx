import React from "react";
import styles from "./Portfolios.module.css";

const Portfolios = () => {
  // Example handlers (replace with your logic)
  const toggleBulkActions = () => {
    console.log("Toggle bulk actions");
  };

  const refreshWorks = () => {
    console.log("Refresh works");
  };

  const selectAllWorks = () => {
    console.log("Select all works");
  };

  const deselectAllWorks = () => {
    console.log("Deselect all works");
  };

  return (
    <>
      {/* Background Effect */}
      <div className={styles["admin-bg"]}></div>

      <div className={styles.dashboard}>
        {/* Sidebar */}
        <div id="sidebar"></div>

        {/* Main Content */}
        <main className={styles["main-content"]}>
          {/* Top Bar */}
          <header className={styles.topbar}>
            <h1>Works Management</h1>
            <a href="home.html" className={styles["admin-profile-link"]}>
              <div className={styles["admin-profile"]}>
                <img
                  src="/assets/images/profile_icon.png"
                  alt="Admin Profile"
                />
              </div>
            </a>
          </header>

          {/* Stats Overview */}
          <section className={styles["stats-grid"]}>
            <div className={styles["stat-card"]}>
              <h3>Total Works</h3>
              <p className={styles["stat-number"]}>892</p>
            </div>
            <div className={styles["stat-card"]}>
              <h3>Published Works</h3>
              <p className={styles["stat-number"]}>745</p>
            </div>
            <div className={styles["stat-card"]}>
              <h3>Drafts</h3>
              <p className={styles["stat-number"]}>42</p>
            </div>
            <div className={styles["stat-card"]}>
              <h3>This Month Uploads</h3>
              <p className={styles["stat-number"]}>28</p>
            </div>
          </section>

          {/* Action Buttons */}
          <section className={styles["action-section"]}>
            <div className={styles["action-buttons"]}>
              <a href="#upload-work-form" className={`${styles.btn} ${styles["btn-primary"]}`}>
                <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Upload New Work
              </a>

              <button
                className={`${styles.btn} ${styles["btn-secondary"]}`}
                onClick={toggleBulkActions}
              >
                <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Bulk Actions
              </button>

              <button
                className={`${styles.btn} ${styles["btn-secondary"]}`}
                onClick={refreshWorks}
              >
                <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                </svg>
                Refresh
              </button>
            </div>

            <div className={styles["search-container"]}>
              <input
                type="text"
                className={styles["search-input"]}
                placeholder="Search works by title, author, or category..."
              />
              <button className={`${styles.btn} ${styles["btn-secondary"]}`}>
                <svg className={styles["menu-icon"]} viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                Search
              </button>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default Portfolios;