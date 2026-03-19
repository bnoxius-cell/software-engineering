import React, { useState, useEffect } from "react";
import styles from "./RequestManager.module.css";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";

const UploadManager = () => {
  const [works, setWorks] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [totalWorks, setTotalWorks] = useState(0);

  // 1. Fetch ONLY pending works
  const fetchWorks = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/artworks/admin/pending", {
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then((res) => res.json())
      .then((data) => {
        setWorks(data);
        setTotalWorks(data.length);
      })
      .catch((err) => console.error("Failed to load works:", err));
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // 2. The Approval Function (Updates status in the database)
  const handleStatusChange = async (workId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/artworks/${workId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh the table to show the new status
        fetchWorks(); 
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 3. Edit functionality (Populates top form)
  const handleEdit = (work) => {
    const formPanel = document.getElementById("upload-work-form");
    if (formPanel) {
      formPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    const titleField = document.getElementById("workTitle");
    const descField = document.getElementById("workDescription");
    const tagsField = document.getElementById("workTags");
    const categoryField = document.getElementById("workCategory");

    if (titleField) titleField.value = work.title || "";
    if (descField) descField.value = work.description || "";
    if (tagsField) tagsField.value = work.tags ? work.tags.join(", ") : "";
    if (categoryField) categoryField.value = work.category || "";
  };

  const toggleSelectWork = (workId) => {
    setSelectedWorks((prev) =>
      prev.includes(workId)
        ? prev.filter((id) => id !== workId)
        : [...prev, workId]
    );
  };

  const selectAllWorks = () => {
    setSelectedWorks(works.map((w) => w._id));
  };

  const deselectAllWorks = () => setSelectedWorks([]);

  const toggleBulkActions = () => {
    const panel = document.getElementById("bulk-actions-panel");
    if (panel) panel.open = !panel.open;
  };

  const refreshWorks = () => {
    console.log("Refresh works...");
  };

  return (
    <div className="admin-layout">
      <Sidebar activePage="requests" />
      <main className="main-view">
        <Topbar title="Request Manager" />

        {/* 1. UPLOAD FORM IS NOW AT THE TOP */}
        <div id="upload-work-form" className={styles["form-container"]} style={{ marginTop: "1rem" }}>
          <h2 className={styles["form-header"]}>Upload an artwork</h2>
          <form>
            <div className={styles["form-group"]}>
              <label htmlFor="workTitle">Work Title</label>
              <input type="text" id="workTitle" name="workTitle" placeholder="Enter work title" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className={styles["form-group"]}>
                <label htmlFor="workAuthor">Author/Creator</label>
                <select id="workAuthor" name="workAuthor" required>
                  <option value="">Select author</option>
                  {works.map((work) => (
                    <option key={work._id} value={work._id}>
                      {work.authorName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="workCategory">Category</label>
                <select id="workCategory" name="workCategory" required>
                  <option value="">Select category</option>
                  <option value="design">Digital Art</option>
                  <option value="development">Illustration</option>
                  <option value="art">Photography</option>
                  <option value="writing">Abstract</option>
                  <option value="photography">Animation</option>
                  <option value="music">Portrait</option>
                </select>
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="workDescription">Description</label>
              <textarea id="workDescription" name="workDescription" placeholder="Describe the work..." required />
            </div>

            <div className={styles["form-group"]}>
              <label>Upload Files</label>
              <div className={styles["file-upload"]}>
                <label className={styles["file-upload-label"]} htmlFor="workFiles">
                  <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#a1ff14" }}>Click to browse or drag files here</span>
                  <span style={{ fontSize: "0.85rem", color: "gray" }}>(Images, PDF, DOC, ZIP)</span>
                </label>
                <input type="file" id="workFiles" name="workFiles" multiple accept="image/*,.pdf,.doc,.zip" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className={styles["form-group"]}>
                <label htmlFor="workStatus">Status</label>
                <select id="workStatus" name="workStatus" required>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="workTags">Tags (comma separated)</label>
                <input type="text" id="workTags" name="workTags" placeholder="e.g., digital art, anime" />
              </div>
            </div>

            <div className={styles["form-actions"]}>
              <button type="reset" className={`${styles.btn} ${styles["btn-secondary"]}`}>Clear Form</button>
              <button type="submit" className={`${styles.btn} ${styles["btn-primary"]}`}>Upload Work</button>
            </div>
          </form>
        </div>

        {/* 2. STATS OVERVIEW MOVED BELOW THE FORM */}
        <section className={styles["stats-grid"]}>
          <div className={styles["stat-card"]}>
            <h3>Total Works</h3>
            <p className={styles["stat-number"]}>{totalWorks}</p>
          </div>
          <div className={styles["stat-card"]}>
            <h3>Published Works</h3>
            <p className={styles["stat-number"]}>{works.filter(w => w.status === "published").length}</p>
          </div>
          <div className={styles["stat-card"]}>
            <h3>Drafts</h3>
            <p className={styles["stat-number"]}>{works.filter(w => w.status === "draft").length}</p>
          </div>
          <div className={styles["stat-card"]}>
            <h3>This Month Uploads</h3>
            <p className={styles["stat-number"]}>{works.filter(w => {
              const date = new Date(w.createdAt);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}</p>
          </div>
        </section>

        {/* 3. SEARCH AND ACTIONS */}
        <section className={styles["action-section"]}>
          <div className={styles["action-buttons"]}>
            <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={toggleBulkActions}>
              Bulk Actions
            </button>
            <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={refreshWorks}>
              Refresh Data
            </button>
          </div>

          <div className={styles["search-container"]}>
            <input
              type="text"
              className={styles["search-input"]}
              placeholder="Search existing works..."
            />
            <button className={`${styles.btn} ${styles["btn-secondary"]}`}>Search</button>
          </div>
        </section>

        {/* Bulk Actions Panel (Hidden by default) */}
        <details className={styles["form-container"]} id="bulk-actions-panel" style={{ marginBottom: "1rem" }}>
          <summary style={{ color: "#a1ff14", cursor: "pointer", fontWeight: "bold" }}>Bulk Actions Settings</summary>
          <div className={styles["form-group"]} style={{ marginTop: "1rem" }}>
            <label>Select Action</label>
            <select className={styles["search-input"]}>
              <option value="">Choose bulk action...</option>
              <option value="publish">Publish Selected</option>
              <option value="draft">Move to Draft</option>
              <option value="archive">Archive Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
          </div>
          <div className={styles["form-actions"]}>
            <button type="button" className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={toggleBulkActions}>Cancel</button>
            <button type="button" className={`${styles.btn} ${styles["btn-primary"]}`}>Apply Bulk Action</button>
          </div>
        </details>

        {/* 4. CURRENT WORKS TABLE AT THE BOTTOM */}
        <section className={styles["works-section"]}>
          <div className={styles["section-header"]} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Pending Approvals ({totalWorks} Total)</h2>
            <select className={styles["search-input"]} style={{ width: "auto" }}>
              <option value="all">All Works</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Work</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {works.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "gray" }}>
                      No pending artworks at the moment.
                    </td>
                  </tr>
                ) : (
                  works.map((work) => (
                    <tr key={work._id}>
                      <td>{work._id}</td>
                      <td>{work.title}</td>
                      <td>{work.authorName}</td>
                      <td>{work.category}</td>
                      <td><span className={`${styles["status-badge"]} ${styles[`status-${work.status}`]}`}>{work.status}</span></td>
                      <td>{new Date(work.createdAt).toLocaleDateString()}</td>
                      <td>{work.views || 0}</td>
                      <td className={styles["action-btns"]}>
                        <button 
                            className={`${styles["action-btn"]} ${styles["btn-primary"]}`}
                            onClick={() => handleStatusChange(work._id, 'published')}
                        >
                            Approve
                        </button>
                        <button 
                            className={styles["action-btn"]}
                            onClick={() => handleEdit(work)}
                        >
                            Edit
                        </button>
                        <button 
                            className={styles["action-btn"]}
                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                            onClick={() => handleStatusChange(work._id, 'rejected')}
                        >
                            Reject
                        </button>
                        <button 
                            className={styles["action-btn"]}
                            onClick={() => handleStatusChange(work._id, 'archived')}
                        >
                            Archive
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default UploadManager;