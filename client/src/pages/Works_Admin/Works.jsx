import React, { useState, useEffect } from "react";
import styles from "./Works.module.css";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";

const Works = () => {
  const [works, setWorks] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [totalWorks, setTotalWorks] = useState(0);

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);

  const fetchWorks = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/artworks", {
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

  const handleEdit = (work) => {
    setEditingWork(work);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWork(null);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Placeholder for actual update logic (PUT/PATCH to backend)
    // Once successful, you would call fetchWorks() to update the table
    alert("Artwork updated successfully! (Hook this up to your API)");
    closeEditModal();
    fetchWorks();
  };

  // Derived state for filtering the table dynamically
  const filteredWorks = works.filter((work) => {
    const matchesSearch = work.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          work.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || work.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-layout">
      <Sidebar activePage="works" />
      <main className="main-view">
        <Topbar title="Works Manager" />

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

        

        <section className={styles["action-section"]}>
          <div className={styles["search-container"]} style={{ maxWidth: '100%', justifyContent: 'flex-start' }}>
            <input
              type="text"
              className={styles["search-input"]}
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <select 
              className={styles["search-input"]} 
              style={{ width: "auto" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={fetchWorks}>Refresh</button>
          </div>
        </section>

        <section className={styles["works-section"]}>
          <div className={styles["section-header"]} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>All Artworks ({filteredWorks.length})</h2>
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
                {filteredWorks.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "gray" }}>
                      No artworks found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWorks.map((work) => (
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

      {/* ===== EDIT ARTWORK MODAL ===== */}
      {isEditModalOpen && editingWork && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className={styles["form-header"]} style={{ margin: 0 }}>Edit Artwork</h2>
              <button className={styles.closeBtn} onClick={closeEditModal}>&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalGrid}>
                {/* Left Column: Image Preview */}
                <div className={styles.modalImageCol}>
                  <img src={`http://localhost:5000${editingWork.image}`} alt={editingWork.title} className={styles.previewImage} />
                  <div className={styles["form-group"]} style={{ marginTop: '1rem' }}>
                    <label>Update Image (Optional)</label>
                    <input type="file" style={{ width: '100%' }} accept="image/*" />
                  </div>
                </div>
                
                {/* Right Column: Form Fields */}
                <div className={styles.modalFormCol}>
                  <div className={styles["form-group"]}>
                    <label>Title</label>
                    <input type="text" defaultValue={editingWork.title} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className={styles["form-group"]}>
                      <label>Category / Medium</label>
                      <input type="text" defaultValue={editingWork.category || editingWork.medium} required />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Status</label>
                      <select defaultValue={editingWork.status} required>
                        <option value="pending">Pending</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <textarea defaultValue={editingWork.description} style={{ minHeight: '100px' }}></textarea>
                  </div>
                  <div className={styles["form-actions"]}>
                    <button type="button" className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={closeEditModal}>Cancel</button>
                    <button type="submit" className={`${styles.btn} ${styles["btn-primary"]}`}>Save Changes</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Works;