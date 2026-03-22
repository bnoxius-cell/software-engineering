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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingWork, setViewingWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchWorks = () => {
    const token = localStorage.getItem("token");
    // CHANGED: Now points to /all so the admin sees Pending and Drafts!
    fetch("http://localhost:5000/api/artworks/all", {
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

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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

  const handleView = (work) => {
    setViewingWork(work);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingWork(null);
  };

  // ===== NEW: FUNCTIONAL EDIT SUBMIT =====
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // FormData automatically grabs all inputs with a 'name' attribute
    const formData = new FormData(e.target);

    try {
      const res = await fetch(`http://localhost:5000/api/artworks/${editingWork._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: DO NOT set 'Content-Type' when sending FormData. 
          // The browser sets it automatically with the correct boundaries!
        },
        body: formData
      });

      if (res.ok) {
        closeEditModal();
        fetchWorks(); // Refresh the table
      } else {
        const errData = await res.json();
        alert(`Failed to update artwork: ${errData.message}`);
      }
    } catch (error) {
      console.error("Error updating artwork:", error);
    }
  };

  const filteredWorks = works.filter((work) => {
    // Completely hide pending works from this page
    if (work.status === 'pending') return false;
    
    const matchesSearch = work.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          work.artistName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || work.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredWorks.length / ITEMS_PER_PAGE);
  const paginatedWorks = filteredWorks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderRow = (work) => (
    <tr key={work._id} onClick={() => handleView(work)} className={styles.tableRow} style={{ cursor: "pointer" }}>
      <td style={{ color: "#8b949e" }}>{work._id.substring(0,8)}...</td>
      <td style={{ fontWeight: "600" }}>{work.title}</td>
      <td>{work.artistName}</td>
      <td>{work.medium}</td>
      <td><span className={`${styles["status-badge"]} ${styles[`status-${work.status}`]}`}>{work.status}</span></td>
      <td style={{ color: "#8b949e" }}>{new Date(work.createdAt).toLocaleDateString()}</td>
      <td>{work.views || 0}</td>
      <td className={styles["action-btns"]} onClick={(e) => e.stopPropagation()}>
        {/* 1. APPROVE / RESTORE ACTIONS */}
        {(work.status === 'archived' || work.status === 'rejected') && (
          <button className={styles["action-btn"]} style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }} onClick={() => handleStatusChange(work._id, 'published')}>
            Restore
          </button>
        )}
        {work.status === 'draft' && (
          <button className={`${styles["action-btn"]} ${styles["btn-primary"]}`} onClick={() => handleStatusChange(work._id, 'published')}>
            Publish
          </button>
        )}
        
        {/* 2. EDIT ACTION */}
        <button className={styles["action-btn"]} onClick={() => handleEdit(work)}>
            Edit
        </button>

        {/* 3. ARCHIVE ACTION */}
        {(work.status === 'published' || work.status === 'draft') && (
          <button className={styles["action-btn"]} onClick={() => handleStatusChange(work._id, 'archived')}>
            Archive
          </button>
        )}

        {/* 4. REMOVE ACTION */}
        <button className={styles["action-btn"]} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }} onClick={() => handleStatusChange(work._id, 'rejected')} title="Artwork will be permanently deleted after 30 days">
          Remove
        </button>
      </td>
    </tr>
  );

  return (
    <div className="admin-layout">
      <Sidebar activePage="works" />
      <main className="main-view">
        <Topbar title="Works Manager" />

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

        {/* ... [KEEP YOUR EXISTING UPLOAD FORM HERE] ... */}

        <section className={styles["action-section"]} style={{ marginTop: '2rem' }}>
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
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={fetchWorks}>Refresh</button>
          </div>
        </section>

        {/* ===== ALL OTHER ARTWORKS TABLE ===== */}
        <section className={styles["works-section"]}>
          <div className={styles["section-header"]} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>All Artworks ({filteredWorks.length})</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Medium</th>
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
                      No additional artworks found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedWorks.map(renderRow)
                )}
              </tbody>
            </table>
          </div>
          
          {/* ===== PAGINATION DOTS ===== */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles["page-dot"]} ${currentPage === page ? styles.active : ""}`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                />
              ))}
            </div>
          )}
        </section>


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
      </main>

      {/* ===== VIEW ARTWORK MODAL ===== */}
      {isViewModalOpen && viewingWork && (
        <div className={styles.modalOverlay} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className={styles["form-header"]} style={{ margin: 0 }}>Artwork Details</h2>
              <button className={styles.closeBtn} onClick={closeViewModal}>&times;</button>
            </div>
            
            <div className={styles.modalGrid}>
              {/* Left Column: Image Preview */}
              <div className={styles.modalImageCol}>
                <img src={`http://localhost:5000${viewingWork.image}`} alt={viewingWork.title} className={styles.previewImage} />
              </div>
              
              {/* Right Column: Details */}
              <div className={styles.modalFormCol} style={{ color: "#e5e7eb" }}>
                <h3 style={{ fontSize: "1.75rem", color: "rgb(161, 255, 20)", marginTop: 0, marginBottom: "0.5rem" }}>{viewingWork.title}</h3>
                <p style={{ margin: "0.5rem 0" }}><strong>Author:</strong> {viewingWork.artistName}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Medium:</strong> {viewingWork.medium}</p>
                <p style={{ margin: "0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong>Status:</strong> 
                  <span className={`${styles["status-badge"]} ${styles[`status-${viewingWork.status}`]}`}>{viewingWork.status}</span>
                </p>
                <p style={{ margin: "0.5rem 0" }}><strong>Upload Date:</strong> {new Date(viewingWork.createdAt).toLocaleDateString()}</p>
                
                <div style={{ marginTop: "1.5rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.5rem", color: "rgba(156, 163, 175, 1)" }}>Description</strong>
                  <div style={{ backgroundColor: "rgba(55, 65, 81, 0.3)", padding: "1rem", borderRadius: "8px", minHeight: "100px", lineHeight: "1.6" }}>
                    {viewingWork.description || <span style={{ color: "gray", fontStyle: "italic" }}>No description provided.</span>}
                  </div>
                </div>
                
                <div className={styles["form-actions"]} style={{ marginTop: "2rem", borderTop: "1px solid rgba(55, 65, 81, 1)", paddingTop: "1.5rem" }}>
                  <button type="button" className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={closeViewModal}>Close</button>
                  <button type="button" className={`${styles.btn} ${styles["btn-primary"]}`} onClick={() => { closeViewModal(); handleEdit(viewingWork); }}>Edit Artwork</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    {/* ADDED: name="artworkImage" to match multer setup */}
                    <input type="file" name="artworkImage" style={{ width: '100%' }} accept="image/*" />
                  </div>
                </div>
                
                {/* Right Column: Form Fields */}
                <div className={styles.modalFormCol}>
                  <div className={styles["form-group"]}>
                    <label>Title</label>
                    <input type="text" name="title" defaultValue={editingWork.title} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className={styles["form-group"]}>
                      <label>Medium</label>
                      <input type="text" name="medium" defaultValue={editingWork.medium || editingWork.category} required />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Status</label>
                      <select name="status" defaultValue={editingWork.status} required>
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
                    <textarea name="description" defaultValue={editingWork.description} style={{ minHeight: '100px' }}></textarea>
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