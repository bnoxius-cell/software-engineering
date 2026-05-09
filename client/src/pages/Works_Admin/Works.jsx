import React, { useState, useEffect, useRef } from "react";
import styles from "./Works.module.css";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import { isVideoArtwork } from "../../utils/artworkMedia";
import ArtworkVideoPlayer from "../../components/media/ArtworkVideoPlayer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Works = () => {
  const [works, setWorks] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalWorks, setTotalWorks] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingWork, setViewingWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadCollapsed, setIsUploadCollapsed] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const ITEMS_PER_PAGE = 10;

  // Comments for the viewed artwork
  const [currentComments, setCurrentComments] = useState([]);

  // Author search dropdown state
  const [authorSearch, setAuthorSearch] = useState("");
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [selectedAuthorName, setSelectedAuthorName] = useState("");
  const authorDropdownRef = useRef(null);

  const filteredUsers = authorSearch.trim() === ""
    ? []
    : users.filter(user =>
        user.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(authorSearch.toLowerCase())
      );

  const searchInputRef = useRef(null);
  const uploadToggleRef = useRef(null);

  // Fetch artworks
  const fetchWorks = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/artworks/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setWorks(data);
        setTotalWorks(data.length);
      })
      .catch((err) => console.error("Failed to load works:", err));
  };

  // Fetch all users for the author dropdown
  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/auth/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  };

  useEffect(() => {
    fetchWorks();
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
        setAuthorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        uploadToggleRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to check if current user is admin
  const isAdmin = () => {
    const role = localStorage.getItem("role");
    return role && role.toLowerCase().trim() === "admin";
  };

  // Fetch comments for a single artwork
  const fetchCommentsForArtwork = async (artworkId) => {
    try {
      const res = await fetch(`${API_BASE}/api/artworks/${artworkId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCurrentComments(data);
      } else {
        setCurrentComments([]);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setCurrentComments([]);
    }
  };

  // Status changes
  const handleStatusChange = async (workId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/artworks/${workId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchWorks();
      else alert("Failed to update status.");
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
    fetchCommentsForArtwork(work._id);
  };
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingWork(null);
    setCurrentComments([]);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`${API_BASE}/api/artworks/${editingWork._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        closeEditModal();
        fetchWorks();
      } else {
        const errData = await res.json();
        alert(`Failed to update artwork: ${errData.message}`);
      }
    } catch (error) {
      console.error("Error updating artwork:", error);
    }
  };

  // Upload new artwork (always published)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(e.target);
    if (!selectedAuthorId) {
      alert("Please select an author.");
      return;
    }
    formData.append("authorId", selectedAuthorId);
    formData.append("status", "published");

    try {
      const res = await fetch(`${API_BASE}/api/artworks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        e.target.reset();
        setAuthorSearch("");
        setSelectedAuthorId("");
        setSelectedAuthorName("");
        fetchWorks();
        alert("Artwork uploaded successfully.");
      } else {
        const err = await res.json();
        alert(err.message || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Server error while uploading.");
    }
  };

  // Delete comment (admin only)
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    confirmAction(
      "Delete Comment",
      "Are you sure you want to permanently delete this comment? This action cannot be undone.",
      async () => {
        try {
          const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            // Refresh comments list for the current artwork
            if (viewingWork) fetchCommentsForArtwork(viewingWork._id);
          } else {
            const err = await res.json();
            alert(err.message || "Failed to delete comment.");
          }
        } catch (error) {
          console.error("Delete comment error:", error);
          alert("Server error while deleting comment.");
        }
      }
    );
  };

  // Filter logic
  const filteredWorks = works.filter((work) => {
    if (work.status === "pending") return false;
    const matchesSearch =
      work.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.artistName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || work.status === filterStatus;
    let matchesDate = true;
    const createdDate = new Date(work.createdAt);
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (createdDate < fromDate) matchesDate = false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (createdDate > toDate) matchesDate = false;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredWorks.length / ITEMS_PER_PAGE);
  const paginatedWorks = filteredWorks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmAction = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };
  const closeConfirm = () => {
    setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  const exportCSV = () => {
    confirmAction(
      "Export filtered artworks?",
      `This will export ${filteredWorks.length} artwork(s) as a CSV file.`,
      () => {
        const headers = ["ID", "Title", "Artist", "Medium", "Status", "Upload Date", "Views"];
        const rows = filteredWorks.map((w) => [
          w._id,
          w.title,
          w.artistName,
          w.medium,
          w.status,
          new Date(w.createdAt).toLocaleDateString(),
          w.views || 0,
        ]);
        const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artworks_${new Date().toISOString().slice(0, 19)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    );
  };

  const handleSingleRemove = (workId) => {
    confirmAction(
      "Remove Artwork",
      "This artwork will be marked as rejected and hidden from public view. It can be restored by an admin at any time. Are you sure?",
      () => handleStatusChange(workId, "rejected")
    );
  };

  const renderRow = (work) => (
    <tr key={work._id} className={styles.tableRow}>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer" }}>
        {isVideoArtwork(work) ? (
          <div className={styles.thumbnailVideo}>
            <video
              src={`${API_BASE}${work.image}`}
              poster={work.thumbnail ? `${API_BASE}${work.thumbnail}` : undefined}
              muted
              preload="metadata"
            />
          </div>
        ) : (
          <img
            src={`${API_BASE}${work.image}`}
            alt={work.title}
            className={styles.thumbnailImg}
          />
        )}
      </td>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer", fontWeight: "600" }}>
        {work.title}
      </td>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer" }}>{work.artistName}</td>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer" }}>{work.medium}</td>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer" }}>
        <span className={`${styles["status-badge"]} ${styles[`status-${work.status}`]}`}>
          {work.status}
        </span>
      </td>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer" }}>
        {new Date(work.createdAt).toLocaleDateString()}
      </td>
      <td onClick={() => handleView(work)} style={{ cursor: "pointer" }}>{work.views || 0}</td>
      <td className={styles["action-btns"]} onClick={(e) => e.stopPropagation()}>
        {(work.status === "archived" || work.status === "rejected") && (
          <button
            className={styles["action-btn"]}
            style={{ backgroundColor: "#28a745", color: "white", border: "none" }}
            onClick={() => handleStatusChange(work._id, "published")}
          >
            Restore
          </button>
        )}
        {work.status === "draft" && (
          <button
            className={`${styles["action-btn"]} ${styles["btn-primary"]}`}
            onClick={() => handleStatusChange(work._id, "published")}
          >
            Publish
          </button>
        )}
        <button className={styles["action-btn"]} onClick={() => handleEdit(work)}>
          Edit
        </button>
        <button
          className={styles["action-btn"]}
          style={{ backgroundColor: "#dc3545", color: "white", border: "none" }}
          onClick={() => handleSingleRemove(work._id)}
          title="Artwork can be restored later"
        >
          Remove
        </button>
      </td>
    </tr>
  );

  const publishedCount = works.filter((w) => w.status === "published").length;
  const monthlyCount = works.filter((w) => {
    const date = new Date(w.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <>
      <div className="background-fx"></div>
      <div className="admin-layout">
        <Sidebar activePage="works" />
        <main className="main-view">
          <Topbar title="Works Manager" />

          {/* Stats Cards */}
          <section className={styles["stats-grid"]}>
            <div className={styles["stat-card"]}>
              <h3>Total Works</h3>
              <p className={styles["stat-number"]}>{totalWorks}</p>
            </div>
            <div className={styles["stat-card"]}>
              <h3>Published Works</h3>
              <p className={styles["stat-number"]}>{publishedCount}</p>
            </div>
            <div className={styles["stat-card"]}>
              <h3>This Month Uploads</h3>
              <p className={styles["stat-number"]}>{monthlyCount}</p>
            </div>
          </section>

          {/* Search, Filters, Refresh */}
          <section className={styles["action-section"]}>
            <div className={styles["search-container"]}>
              <input
                ref={searchInputRef}
                type="text"
                className={styles["search-input"]}
                placeholder="Search by title or author (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <select
                className={styles["search-input"]}
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="date"
                className={styles["search-input"]}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From date"
              />
              <span className={styles["date-separator"]}>to</span>
              <input
                type="date"
                className={styles["search-input"]}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To date"
              />
              <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={fetchWorks}>
                Refresh
              </button>
            </div>
          </section>

          {/* Collapsible Upload Form */}
          <div className={styles["upload-collapsible"]}>
            <button
              ref={uploadToggleRef}
              className={styles["upload-toggle"]}
              onClick={() => setIsUploadCollapsed(!isUploadCollapsed)}
            >
              {isUploadCollapsed ? "➕ Upload New Artwork (Ctrl+U)" : "➖ Hide Upload Form"}
            </button>
            {!isUploadCollapsed && (
              <div className={styles["form-container"]}>
                <h2 className={styles["form-header"]}>Upload an artwork</h2>
                <form onSubmit={handleUploadSubmit} encType="multipart/form-data">
                  <div className={styles["form-group"]}>
                    <label>Work Title</label>
                    <input type="text" name="title" required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className={styles["form-group"]}>
                      <label>Author/Creator</label>
                      <div ref={authorDropdownRef} style={{ position: "relative" }}>
                        <input
                          type="text"
                          className={styles["search-input"]}
                          placeholder="Type to search users..."
                          value={authorSearch}
                          onChange={(e) => {
                            setAuthorSearch(e.target.value);
                            setAuthorDropdownOpen(true);
                            if (e.target.value === "") {
                              setSelectedAuthorId("");
                              setSelectedAuthorName("");
                            }
                          }}
                          onFocus={() => {
                            if (authorSearch.trim() !== "") setAuthorDropdownOpen(true);
                          }}
                          autoComplete="off"
                        />
                        <input type="hidden" name="authorId" value={selectedAuthorId} />
                        {authorDropdownOpen && filteredUsers.length > 0 && (
                          <div className={styles.authorDropdown}>
                            {filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className={styles.authorDropdownItem}
                                onClick={() => {
                                  setSelectedAuthorId(user._id);
                                  setSelectedAuthorName(user.name);
                                  setAuthorSearch(user.name);
                                  setAuthorDropdownOpen(false);
                                }}
                              >
                                <strong>{user.name}</strong> <span style={{ color: "#8b949e" }}>({user.role})</span>
                                <br />
                                <small>{user.email}</small>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedAuthorName && (
                          <div className={styles.selectedAuthorBadge}>
                            Selected: {selectedAuthorName}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAuthorId("");
                                setSelectedAuthorName("");
                                setAuthorSearch("");
                              }}
                              className={styles.clearAuthorBtn}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Category</label>
                      <select name="medium" required>
                        <option value="">Select category</option>
                        <option value="digital_2d">Digital 2D Illustration</option>
                        <option value="3d_model">3D Modeling</option>
                        <option value="traditional">Traditional Art</option>
                        <option value="animation">Animation</option>
                        <option value="photography">Photography</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <textarea name="description" required />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Upload Files</label>
                    <div
                      className={styles["file-upload"]}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files);
                        const input = document.getElementById("workFiles");
                        const dt = new DataTransfer();
                        for (let file of files) dt.items.add(file);
                        input.files = dt.files;
                      }}
                    >
                      <label className={styles["file-upload-label"]} htmlFor="workFiles">
                        <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#a1ff14" }}>
                          Click to browse or drag files here
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "gray" }}>(Images and videos)</span>
                      </label>
                      <input type="file" id="workFiles" name="artworkImage" multiple accept="image/*,video/*" />
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Tags (comma separated)</label>
                    <input type="text" name="tags" placeholder="e.g., digital art, anime" />
                  </div>
                  <div className={styles["form-actions"]}>
                    <button type="reset" className={`${styles.btn} ${styles["btn-secondary"]}`}>
                      Clear Form
                    </button>
                    <button type="submit" className={`${styles.btn} ${styles["btn-primary"]}`}>
                      Upload Work
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Works Table */}
          <section className={styles["works-section"]}>
            <div className={styles["section-header"]}>
              <h2>All Artworks ({filteredWorks.length})</h2>
              <div className={styles["table-actions-help"]}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1ff14" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>Actions: Edit ✏️ | Publish ✅ | Restore 🔄 | Remove 🗑️ (can be restored later)</span>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className={styles.worksTable}>
                <thead>
                  <tr>
                    <th>Work</th>
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
                  {paginatedWorks.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "gray" }}>
                        No artworks found.
                      </td>
                    </tr>
                  ) : (
                    paginatedWorks.map(renderRow)
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination + CSV export */}
            <div className={styles["pagination-bar"]}>
              <div className={styles["pagination-buttons"]}>
                <button
                  className={`${styles["pagination-btn"]} ${currentPage === 1 ? styles.disabled : ""}`}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className={styles["page-info"]}>
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  className={`${styles["pagination-btn"]} ${currentPage === totalPages || totalPages === 0 ? styles.disabled : ""}`}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
              <div className={styles["export-wrapper"]}>
                <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={exportCSV}>
                  Export CSV
                </button>
                <span className={styles["export-note"]}>Exports filtered artworks as CSV</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* View Modal (with comments) */}
      {isViewModalOpen && viewingWork && (
        <div className={styles.modalOverlay} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles["form-header"]} style={{ margin: 0 }}>Artwork Details</h2>
              <button className={styles.closeBtn} onClick={closeViewModal}>&times;</button>
            </div>
            <div className={styles.modalGrid}>
              <div className={styles.modalImageCol}>
                {isVideoArtwork(viewingWork) ? (
                  <ArtworkVideoPlayer
                    src={`${API_BASE}${viewingWork.image}`}
                    poster={viewingWork.poster ? `${API_BASE}${viewingWork.poster}` : null}
                    alt={viewingWork.title}
                  />
                ) : (
                  <img
                    src={`${API_BASE}${viewingWork.image}`}
                    alt={viewingWork.title}
                    className={styles.previewImage}
                  />
                )}
              </div>
              <div className={styles.modalFormCol}>
                <h3 style={{ fontSize: "1.75rem", color: "#a1ff14", marginTop: 0 }}>{viewingWork.title}</h3>
                <p><strong>Author:</strong> {viewingWork.artistName}</p>
                <p><strong>Medium:</strong> {viewingWork.medium}</p>
                <p><strong>Status:</strong> <span className={`${styles["status-badge"]} ${styles[`status-${viewingWork.status}`]}`}>{viewingWork.status}</span></p>
                <p><strong>Upload Date:</strong> {new Date(viewingWork.createdAt).toLocaleDateString()}</p>
                <div style={{ marginTop: "1.5rem" }}>
                  <strong>Description</strong>
                  <div style={{ background: "rgba(55,65,81,0.3)", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
                    {viewingWork.description || <span style={{ color: "gray", fontStyle: "italic" }}>No description provided.</span>}
                  </div>
                </div>

                {/* Comments Section */}
                <div className={styles.modalCommentsSection}>
                  <h4>Comments ({currentComments.length})</h4>
                  <div className={styles.modalCommentsList}>
                    {currentComments.length === 0 ? (
                      <p className={styles.noModalComments}>No comments yet.</p>
                    ) : (
                      currentComments.map((comment) => (
                        <div key={comment._id} className={styles.modalCommentItem}>
                          <div className={styles.modalCommentHeader}>
                            <strong>{comment.user?.name || "Anonymous"}</strong>
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            {isAdmin() && (
                              <button
                                type="button"
                                className={styles.deleteCommentBtn}
                                onClick={() => handleDeleteComment(comment._id)}
                                title="Delete comment"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          <p className={styles.modalCommentText}>{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles["form-actions"]} style={{ marginTop: "2rem" }}>
                  <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={closeViewModal}>Close</button>
                  <button
                    className={`${styles.btn} ${styles["btn-primary"]}`}
                    onClick={() => {
                      closeViewModal();
                      handleEdit(viewingWork);
                    }}
                  >
                    Edit Artwork
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingWork && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles["form-header"]} style={{ margin: 0 }}>Edit Artwork</h2>
              <button className={styles.closeBtn} onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalGrid}>
                <div className={styles.modalImageCol}>
                  {isVideoArtwork(editingWork) ? (
                    <ArtworkVideoPlayer
                      src={`${API_BASE}${editingWork.image}`}
                      poster={editingWork.poster ? `${API_BASE}${editingWork.poster}` : null}
                      alt={editingWork.title}
                    />
                  ) : (
                    <img
                      src={`${API_BASE}${editingWork.image}`}
                      alt={editingWork.title}
                      className={styles.previewImage}
                    />
                  )}
                  <div className={styles["form-group"]} style={{ marginTop: "1rem" }}>
                    <label>Update Media (Optional)</label>
                    <input type="file" name="artworkImage" accept="image/*,video/*" />
                  </div>
                </div>
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
                      <select name="status" defaultValue={editingWork.status}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <textarea name="description" defaultValue={editingWork.description} style={{ minHeight: "100px" }} />
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

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className={styles.modalOverlay} onClick={closeConfirm}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className={styles["confirm-actions"]}>
              <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={closeConfirm}>Cancel</button>
              <button className={`${styles.btn} ${styles["btn-primary"]}`} onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Works;