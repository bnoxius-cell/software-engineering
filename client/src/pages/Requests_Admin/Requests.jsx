import React, { useEffect, useState } from "react";
import styles from "./Requests.module.css";
import uploadStyles from "../Upload/Upload.module.css";
import registerStyles from "../Register/Register.module.css";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Badge from "../../components/ui/Badge/Badge";
import { isVideoArtwork } from "../../utils/artworkMedia";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialArtworkForm = {
  title: "",
  artistName: "",
  medium: "digital_2d",
  description: "",
  tags: "",
  image: "",
};

const initialAccountForm = {
  name: "",
  email: "",
  role: "Student",
  password: "",
  confirmPassword: "",
};

const initialConfirmDialog = {
  isOpen: false,
  title: "",
  description: "",
  confirmLabel: "",
  confirmClassName: "",
  onConfirm: null,
};

const formatLabel = (value, fallback = "Pending") => {
  if (!value) return fallback;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const storageKeyByType = {
  artworks: "requests-auto-approve-artworks",
  accounts: "requests-auto-approve-accounts",
};

const Requests = () => {
  const [activeView, setActiveView] = useState("artworks");
  const [artworkRequests, setArtworkRequests] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [autoApproveArtworks, setAutoApproveArtworks] = useState(() => {
    const saved = localStorage.getItem(storageKeyByType.artworks);
    return saved === null ? true : saved === "true";
  });
  const [autoApproveAccounts, setAutoApproveAccounts] = useState(() => {
    const saved = localStorage.getItem(storageKeyByType.accounts);
    return saved === null ? true : saved === "true";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewType, setReviewType] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [artworkForm, setArtworkForm] = useState(initialArtworkForm);
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [lastAction, setLastAction] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(initialConfirmDialog);

  const getToken = () => localStorage.getItem("token");

  const fetchRequests = async () => {
    const token = getToken();
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const [artworksRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/artworks/admin/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/auth/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!artworksRes.ok || !usersRes.ok) {
        throw new Error("Failed to load request data.");
      }

      const artworksData = await artworksRes.json();
      const usersData = await usersRes.json();

      setArtworkRequests(Array.isArray(artworksData) ? artworksData : []);
      setAccountRequests(
        (usersData.users || []).filter(
          (user) => (user.status || "pending").toLowerCase() === "pending"
        )
      );
    } catch (requestError) {
      console.error("Failed to fetch requests:", requestError);
      setError("Unable to load requests right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKeyByType.artworks, String(autoApproveArtworks));
  }, [autoApproveArtworks]);

  useEffect(() => {
    localStorage.setItem(storageKeyByType.accounts, String(autoApproveAccounts));
  }, [autoApproveAccounts]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    setSelectedArtworkIds((current) =>
      current.filter((id) => artworkRequests.some((request) => request._id === id))
    );
  }, [artworkRequests]);

  useEffect(() => {
    setSelectedAccountIds((current) =>
      current.filter((id) => accountRequests.some((request) => request._id === id))
    );
  }, [accountRequests]);

  const closeReview = () => {
    setReviewType(null);
    setSelectedArtwork(null);
    setSelectedAccount(null);
    setArtworkForm(initialArtworkForm);
    setAccountForm(initialAccountForm);
    setReviewError("");
    setIsSubmitting(false);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(initialConfirmDialog);
  };

  const openConfirmDialog = ({
    title,
    description,
    confirmLabel,
    confirmClassName = styles.confirmPrimary,
    onConfirm,
  }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      confirmLabel,
      confirmClassName,
      onConfirm,
    });
  };

  const executeConfirmDialog = async () => {
    if (!confirmDialog.onConfirm) return;

    const action = confirmDialog.onConfirm;
    closeConfirmDialog();
    await action();
  };

  const openArtworkReview = (request) => {
    setReviewType("artwork");
    setSelectedArtwork(request);
    setSelectedAccount(null);
    setReviewError("");
    setArtworkForm({
      title: request.title || "",
      artistName: request.artistName || "",
      medium: request.medium || "digital_2d",
      description: request.description || "",
      tags: request.tags || "",
      image: request.image || "",
    });
  };

  const openAccountReview = (request) => {
    setReviewType("account");
    setSelectedAccount(request);
    setSelectedArtwork(null);
    setReviewError("");
    setAccountForm({
      name: request.name || "",
      email: request.email || "",
      role: request.role || "Student",
      password: "",
      confirmPassword: "",
    });
  };

  const handleArtworkFormChange = (e) => {
    const { name, value } = e.target;
    setArtworkForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountFormChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateArtworkRequest = async (requestId, payload, nextStatus) => {
    const token = getToken();
    if (!token) {
      throw new Error("Missing admin session.");
    }

    const updateRes = await fetch(`${API_BASE_URL}/api/artworks/${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!updateRes.ok) {
      const updateError = await updateRes.json();
      throw new Error(updateError.message || "Failed to update artwork request.");
    }

    const statusRes = await fetch(`${API_BASE_URL}/api/artworks/${requestId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!statusRes.ok) {
      const statusError = await statusRes.json();
      throw new Error(statusError.message || "Failed to update artwork status.");
    }
  };

  const revertArtworkRequest = async (requestId, payload, previousStatus) => {
    await updateArtworkRequest(requestId, payload, previousStatus);
  };

  const handleArtworkDecision = async (nextStatus) => {
    if (!selectedArtwork) return;

    setIsSubmitting(true);
    setReviewError("");

    try {
      await updateArtworkRequest(
        selectedArtwork._id,
        {
          title: artworkForm.title,
          artistName: artworkForm.artistName,
          medium: artworkForm.medium,
          description: artworkForm.description,
          tags: artworkForm.tags,
        },
        nextStatus
      );

      await fetchRequests();
      closeReview();
    } catch (submitError) {
      console.error("Artwork review failed:", submitError);
      setReviewError(submitError.message || "Unable to process artwork request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAccountRequest = async (requestId, payload, nextStatus) => {
    const token = getToken();
    if (!token) {
      throw new Error("Missing admin session.");
    }

    const updateRes = await fetch(`${API_BASE_URL}/api/auth/${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!updateRes.ok) {
      const updateError = await updateRes.json();
      throw new Error(updateError.message || "Failed to update account request.");
    }

    const statusRes = await fetch(`${API_BASE_URL}/api/auth/${requestId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!statusRes.ok) {
      const statusError = await statusRes.json();
      throw new Error(statusError.message || "Failed to update account status.");
    }
  };

  const revertAccountRequest = async (requestId, payload, previousStatus) => {
    await updateAccountRequest(requestId, payload, previousStatus);
  };

  const handleAccountDecision = async (nextStatus) => {
    if (!selectedAccount) return;

    if (accountForm.password || accountForm.confirmPassword) {
      if (accountForm.password.length < 6) {
        setReviewError("Password must be at least 6 characters.");
        return;
      }

      if (accountForm.password !== accountForm.confirmPassword) {
        setReviewError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    setReviewError("");

    try {
      const updatePayload = {
        name: accountForm.name,
        email: accountForm.email,
        role: accountForm.role,
      };

      if (accountForm.password) {
        updatePayload.password = accountForm.password;
      }

      await updateAccountRequest(selectedAccount._id, updatePayload, nextStatus);

      await fetchRequests();
      closeReview();
    } catch (submitError) {
      console.error("Account review failed:", submitError);
      setReviewError(submitError.message || "Unable to process account request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArtworkSelection = (requestId) => {
    setSelectedArtworkIds((current) =>
      current.includes(requestId)
        ? current.filter((id) => id !== requestId)
        : [...current, requestId]
    );
  };

  const toggleAccountSelection = (requestId) => {
    setSelectedAccountIds((current) =>
      current.includes(requestId)
        ? current.filter((id) => id !== requestId)
        : [...current, requestId]
    );
  };

  const toggleSelectAllCurrentView = () => {
    if (activeView === "artworks") {
      setSelectedArtworkIds((current) =>
        current.length === artworkRequests.length ? [] : artworkRequests.map((request) => request._id)
      );
      return;
    }

    setSelectedAccountIds((current) =>
      current.length === accountRequests.length ? [] : accountRequests.map((request) => request._id)
    );
  };

  const processArtworkBatch = async (requests) => {
    await Promise.all(
      requests.map((request) =>
        updateArtworkRequest(
          request._id,
          {
            title: request.title,
            artistName: request.artistName,
            medium: request.medium,
            description: request.description,
            tags: request.tags,
          },
          "published"
        )
      )
    );
  };

  const processAccountBatch = async (requests) => {
    await Promise.all(
      requests.map((request) =>
        updateAccountRequest(
          request._id,
          {
            name: request.name,
            email: request.email,
            role: request.role,
          },
          "active"
        )
      )
    );
  };

  const buildActionSnapshot = (requests, type, label) => ({
    type,
    label,
    items: requests.map((request) => ({
      id: request._id,
      previousStatus: request.status || "pending",
      payload:
        type === "artworks"
          ? {
              title: request.title || "",
              artistName: request.artistName || "",
              medium: request.medium || "digital_2d",
              description: request.description || "",
              tags: request.tags || "",
            }
          : {
              name: request.name || "",
              email: request.email || "",
              role: request.role || "Student",
            },
    })),
    createdAt: Date.now(),
    count: requests.length,
  });

  const runUndoLastAction = async () => {
    if (!lastAction) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (lastAction.type === "artworks") {
        await Promise.all(
          lastAction.items.map((item) =>
            revertArtworkRequest(item.id, item.payload, item.previousStatus)
          )
        );
        setSelectedArtworkIds([]);
      } else {
        await Promise.all(
          lastAction.items.map((item) =>
            revertAccountRequest(item.id, item.payload, item.previousStatus)
          )
        );
        setSelectedAccountIds([]);
      }

      setLastAction(null);
      await fetchRequests();
    } catch (undoError) {
      console.error("Undo failed:", undoError);
      setError(undoError.message || "Unable to undo the last action.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveSelected = async () => {
    const selectedRequests =
      activeView === "artworks"
        ? artworkRequests.filter((request) => selectedArtworkIds.includes(request._id))
        : accountRequests.filter((request) => selectedAccountIds.includes(request._id));

    if (selectedRequests.length === 0) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (activeView === "artworks") {
        setLastAction(buildActionSnapshot(selectedRequests, "artworks", "selected artwork approvals"));
        await processArtworkBatch(selectedRequests);
        setSelectedArtworkIds([]);
      } else {
        setLastAction(buildActionSnapshot(selectedRequests, "accounts", "selected account approvals"));
        await processAccountBatch(selectedRequests);
        setSelectedAccountIds([]);
      }

      await fetchRequests();
    } catch (batchError) {
      console.error("Bulk approval failed:", batchError);
      setError(batchError.message || "Unable to approve the selected requests.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAll = async () => {
    const allRequests = activeView === "artworks" ? artworkRequests : accountRequests;
    if (allRequests.length === 0) return;

    setIsSubmitting(true);
    setError("");

    try {
      if (activeView === "artworks") {
        setLastAction(buildActionSnapshot(allRequests, "artworks", "all artwork approvals"));
        await processArtworkBatch(allRequests);
        setSelectedArtworkIds([]);
      } else {
        setLastAction(buildActionSnapshot(allRequests, "accounts", "all account approvals"));
        await processAccountBatch(allRequests);
        setSelectedAccountIds([]);
      }

      await fetchRequests();
    } catch (batchError) {
      console.error("Approve all failed:", batchError);
      setError(batchError.message || "Unable to approve all pending requests.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const runAutoApprove = async () => {
      if (isLoading || isSubmitting) return;

      if (autoApproveArtworks && artworkRequests.length > 0) {
        setIsSubmitting(true);
        try {
          const approvedCount = artworkRequests.length;
          setLastAction(buildActionSnapshot(artworkRequests, "artworks", "auto-approved artworks"));
          await processArtworkBatch(artworkRequests);
          setSelectedArtworkIds([]);
          setSuccessMessage(
            approvedCount === 1
              ? "Artwork successfully added and published."
              : `${approvedCount} artworks successfully added and published.`
          );
          await fetchRequests();
        } catch (autoError) {
          console.error("Auto-approve artworks failed:", autoError);
          setError(autoError.message || "Artwork auto-approve failed.");
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      if (autoApproveAccounts && accountRequests.length > 0) {
        setIsSubmitting(true);
        try {
          setLastAction(buildActionSnapshot(accountRequests, "accounts", "auto-approved accounts"));
          await processAccountBatch(accountRequests);
          setSelectedAccountIds([]);
          await fetchRequests();
        } catch (autoError) {
          console.error("Auto-approve accounts failed:", autoError);
          setError(autoError.message || "Account auto-approve failed.");
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    runAutoApprove();
  }, [
    artworkRequests,
    accountRequests,
    autoApproveArtworks,
    autoApproveAccounts,
    isLoading,
    isSubmitting,
  ]);

  const currentSelectionCount =
    activeView === "artworks" ? selectedArtworkIds.length : selectedAccountIds.length;

  const allVisibleSelected =
    activeView === "artworks"
      ? artworkRequests.length > 0 && selectedArtworkIds.length === artworkRequests.length
      : accountRequests.length > 0 && selectedAccountIds.length === accountRequests.length;

  const currentAutoApproveEnabled =
    activeView === "artworks" ? autoApproveArtworks : autoApproveAccounts;

  const toggleAutoApproveCurrentView = () => {
    const isArtworkView = activeView === "artworks";
    const currentlyEnabled = isArtworkView ? autoApproveArtworks : autoApproveAccounts;
    const targetLabel = isArtworkView ? "artwork requests" : "account requests";

    openConfirmDialog({
      title: currentlyEnabled ? "Disable auto approve?" : "Enable auto approve?",
      description: currentlyEnabled
        ? `This will stop automatic approval for future ${targetLabel}.`
        : `Future pending ${targetLabel} will be automatically approved after they are loaded.`,
      confirmLabel: currentlyEnabled ? "Disable" : "Enable",
      confirmClassName: currentlyEnabled ? styles.confirmSecondary : styles.confirmPrimary,
      onConfirm: async () => {
        if (isArtworkView) {
          setAutoApproveArtworks((current) => !current);
          return;
        }

        setAutoApproveAccounts((current) => !current);
      },
    });
  };

  return (
    <>
      <div className="background-fx"></div>

      <div className="admin-layout">
        <Sidebar activePage="requests" />

        <main className="main-view">
          <Topbar title="Requests" />

          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Artwork Upload Requests</span>
              <strong className={styles.statNumber}>{artworkRequests.length}</strong>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Account Creation Requests</span>
              <strong className={styles.statNumber}>{accountRequests.length}</strong>
            </article>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Request Queue</h2>
                <p className={styles.panelText}>
                  Click any request to open its full review GUI, edit the details, and then approve it.
                </p>
              </div>

              <button className={styles.refreshButton} onClick={fetchRequests} type="button">
                Refresh
              </button>
            </div>

            <div className={styles.viewToggle}>
              <button
                type="button"
                className={`${styles.toggleButton} ${
                  activeView === "artworks" ? styles.toggleButtonActive : ""
                }`}
                onClick={() => setActiveView("artworks")}
              >
                Artwork Upload Requests
              </button>
              <button
                type="button"
                className={`${styles.toggleButton} ${
                  activeView === "accounts" ? styles.toggleButtonActive : ""
                }`}
                onClick={() => setActiveView("accounts")}
              >
                Account Creation Requests
              </button>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.bulkToolbar}>
<label className={styles.selectAllToggle}>
  <label className={`${styles["ios-checkbox"]} ${styles.green}`}>
    <input
      type="checkbox"
      checked={allVisibleSelected}
      onChange={toggleSelectAllCurrentView}
      disabled={isSubmitting || isLoading}
    />
    <div className={styles["checkbox-wrapper"]}>
      <div className={styles["checkbox-bg"]}></div>
      <svg className={styles["checkbox-icon"]} viewBox="0 0 24 24" fill="none">
        <path
          className={styles["check-path"]}
          d="M4 12L10 18L20 6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </label>
  <span>Select all</span>
</label>

              <div className={styles.bulkInfo}>
                <span>{currentSelectionCount} selected</span>
              </div>

              <div className={styles.bulkActions}>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() =>
                    openConfirmDialog({
                      title: "Approve selected requests?",
                      description: `This will approve the ${currentSelectionCount} selected ${
                        activeView === "artworks" ? "request(s) for artwork uploads" : "account request(s)"
                      }.`,
                      confirmLabel: "Approve Selected",
                      onConfirm: handleApproveSelected,
                    })
                  }
                  disabled={currentSelectionCount === 0 || isSubmitting || isLoading}
                >
                  {isSubmitting ? "Working..." : "Approve Selected"}
                </button>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() =>
                    openConfirmDialog({
                      title: "Approve all pending requests?",
                      description:
                        activeView === "artworks"
                          ? `This will approve all ${artworkRequests.length} pending artwork request(s).`
                          : `This will approve all ${accountRequests.length} pending account request(s).`,
                      confirmLabel: "Approve All",
                      onConfirm: handleApproveAll,
                    })
                  }
                  disabled={
                    (activeView === "artworks" ? artworkRequests.length === 0 : accountRequests.length === 0) ||
                    isSubmitting ||
                    isLoading
                  }
                >
                  Approve All
                </button>
                <button
                  type="button"
                  className={`${styles.inlineAction} ${
                    currentAutoApproveEnabled ? styles.autoApproveActive : ""
                  }`}
                  onClick={toggleAutoApproveCurrentView}
                  disabled={isSubmitting}
                >
                  {currentAutoApproveEnabled ? "Auto Approve On" : "Auto Approve Off"}
                </button>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() =>
                    openConfirmDialog({
                      title: "Undo last action?",
                      description: lastAction
                        ? `This will restore the last batch action for ${lastAction.count} item(s) from ${lastAction.label}.`
                        : "There is no recent action to undo.",
                      confirmLabel: "Undo",
                      confirmClassName: styles.confirmSecondary,
                      onConfirm: runUndoLastAction,
                    })
                  }
                  disabled={!lastAction || isSubmitting}
                >
                  Undo Last Action
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={styles.emptyState}>Loading requests...</div>
            ) : activeView === "artworks" ? (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Artwork Title</th>
                      <th>Artist</th>
                      <th>Medium</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artworkRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.tableEmptyCell}>
                          No pending artwork upload requests.
                        </td>
                      </tr>
                    ) : (
                      artworkRequests.map((request) => (
                        <tr
                          key={request._id}
                          className={styles.clickableRow}
                          onClick={() => openArtworkReview(request)}
                        >
<td onClick={(e) => e.stopPropagation()}>
  <label className={`${styles["ios-checkbox"]} ${styles.red} ${styles.tableCheckbox}`}>
    <input
      type="checkbox"
      checked={selectedArtworkIds.includes(request._id)}
      onChange={() => toggleArtworkSelection(request._id)}
    />
    <div className={styles["checkbox-wrapper"]}>
      <div className={styles["checkbox-bg"]}></div>
      <svg className={styles["checkbox-icon"]} viewBox="0 0 24 24" fill="none">
        <path
          className={styles["check-path"]}
          d="M4 12L10 18L20 6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </label>
</td>
                          <td>{request.title}</td>
                          <td>{request.artistName || "Unknown Artist"}</td>
                          <td>{request.medium || "Not provided"}</td>
                          <td>
                            <Badge variant={request.status || "pending"}>
                              {formatLabel(request.status)}
                            </Badge>
                          </td>
                          <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.inlineAction}
                              onClick={(e) => {
                                e.stopPropagation();
                                openArtworkReview(request);
                              }}
                            >
                              Open Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.tableEmptyCell}>
                          No pending account creation requests.
                        </td>
                      </tr>
                    ) : (
                      accountRequests.map((request) => (
                        <tr
                          key={request._id}
                          className={styles.clickableRow}
                          onClick={() => openAccountReview(request)}
                        >
<td onClick={(e) => e.stopPropagation()}>
  <label className={`${styles["ios-checkbox"]} ${styles.red} ${styles.tableCheckbox}`}>
    <input
      type="checkbox"
      checked={selectedAccountIds.includes(request._id)}
      onChange={() => toggleAccountSelection(request._id)}
    />
    <div className={styles["checkbox-wrapper"]}>
      <div className={styles["checkbox-bg"]}></div>
      <svg className={styles["checkbox-icon"]} viewBox="0 0 24 24" fill="none">
        <path
          className={styles["check-path"]}
          d="M4 12L10 18L20 6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </label>
</td>
                          <td>{request.name}</td>
                          <td>{request.email}</td>
                          <td>
                            <Badge variant={request.role || "student"}>
                              {request.role || "Student"}
                            </Badge>
                          </td>
                          <td>
                            <Badge variant={request.status || "pending"}>
                              {formatLabel(request.status)}
                            </Badge>
                          </td>
                          <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.inlineAction}
                              onClick={(e) => {
                                e.stopPropagation();
                                openAccountReview(request);
                              }}
                            >
                              Open Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {reviewType === "artwork" && selectedArtwork && (
        <div className={styles.modalOverlay} onClick={closeReview}>
          <div className={styles.modalShell} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Artwork Request Review</h2>
                <p className={styles.modalText}>
                  This uses the upload artwork layout so the admin can inspect and edit before approval.
                </p>
              </div>
              <button type="button" className={styles.closeButton} onClick={closeReview}>
                &times;
              </button>
            </div>

            {reviewError && <p className={styles.modalError}>{reviewError}</p>}

            <div className={`${uploadStyles.uploadWrapper} ${styles.reviewUploadWrapper}`}>
              <div className={uploadStyles.imageSection}>
                <div className={`${uploadStyles.dropZone} ${styles.reviewDropZone}`}>
                  {artworkForm.image ? (
                    isVideoArtwork(selectedArtwork) ? (
                      <video
                        src={`${API_BASE_URL}${artworkForm.image}`}
                        className={uploadStyles.previewImage}
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={`${API_BASE_URL}${artworkForm.image}`}
                        alt={artworkForm.title}
                        className={uploadStyles.previewImage}
                      />
                    )
                  ) : (
                    <div className={uploadStyles.dropZoneContent}>
                      <h3>No preview media available</h3>
                    </div>
                  )}
                </div>
                <div className={styles.reviewMeta}>
                  <span>
                    Submitted on {new Date(selectedArtwork.createdAt).toLocaleDateString()}
                  </span>
                  <Badge variant={selectedArtwork.status || "pending"}>
                    {formatLabel(selectedArtwork.status)}
                  </Badge>
                </div>
              </div>

              <div className={uploadStyles.formSection}>
                <div className={uploadStyles.formHeader}>
                  <h2>Review Artwork Submission</h2>
                  <p>Edit the submission details before publishing or rejecting it.</p>
                </div>

                <div className={uploadStyles.inputGroup}>
                  <label htmlFor="review-title">Title</label>
                  <input
                    id="review-title"
                    name="title"
                    type="text"
                    className={uploadStyles.input}
                    value={artworkForm.title}
                    onChange={handleArtworkFormChange}
                  />
                </div>

                <div className={uploadStyles.inputGroup}>
                  <label htmlFor="review-artist">Artist Name</label>
                  <input
                    id="review-artist"
                    name="artistName"
                    type="text"
                    className={uploadStyles.input}
                    value={artworkForm.artistName}
                    onChange={handleArtworkFormChange}
                  />
                </div>

                <div className={uploadStyles.inputGroup}>
                  <label htmlFor="review-medium">Medium / Category</label>
                  <select
                    id="review-medium"
                    name="medium"
                    className={uploadStyles.select}
                    value={artworkForm.medium}
                    onChange={handleArtworkFormChange}
                  >
                    <option value="digital_2d">Digital 2D Illustration</option>
                    <option value="3d_model">3D Modeling & Render</option>
                    <option value="traditional">Traditional (Paint, Ink, Pencil)</option>
                    <option value="animation">Animation / Motion Graphics</option>
                    <option value="ui_ux">UI/UX & Web Design</option>
                    <option value="photography">Photography</option>
                  </select>
                </div>

                <div className={uploadStyles.inputGroup}>
                  <label htmlFor="review-description">Description & Tools Used</label>
                  <textarea
                    id="review-description"
                    name="description"
                    className={uploadStyles.textarea}
                    value={artworkForm.description}
                    onChange={handleArtworkFormChange}
                  />
                </div>

                <div className={uploadStyles.inputGroup}>
                  <label htmlFor="review-tags">Tags</label>
                  <input
                    id="review-tags"
                    name="tags"
                    type="text"
                    className={uploadStyles.input}
                    value={artworkForm.tags}
                    onChange={handleArtworkFormChange}
                  />
                </div>

                <div className={styles.reviewActions}>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => handleArtworkDecision("rejected")}
                    disabled={isSubmitting}
                  >
                    Reject Request
                  </button>
                  <button
                    type="button"
                    className={uploadStyles.submitBtn}
                    onClick={() => handleArtworkDecision("published")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Approve and Publish"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewType === "account" && selectedAccount && (
        <div className={styles.modalOverlay} onClick={closeReview}>
          <div className={styles.accountModalShell} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Account Request Review</h2>
                <p className={styles.modalText}>
                  This follows the signup-style form so the admin can review and edit the request before approval.
                </p>
              </div>
              <button type="button" className={styles.closeButton} onClick={closeReview}>
                &times;
              </button>
            </div>

            {reviewError && <p className={styles.modalError}>{reviewError}</p>}

            <div className={styles.reviewCard}>
              <p className={registerStyles.title}>Create Account</p>

              <form className={registerStyles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={registerStyles["input-group"]}>
                  <label htmlFor="account-name">Full Name</label>
                  <input
                    id="account-name"
                    type="text"
                    name="name"
                    value={accountForm.name}
                    onChange={handleAccountFormChange}
                  />
                </div>

                <div className={registerStyles["input-group"]}>
                  <label htmlFor="account-email">E-mail</label>
                  <input
                    id="account-email"
                    type="email"
                    name="email"
                    value={accountForm.email}
                    onChange={handleAccountFormChange}
                  />
                </div>

                <div className={registerStyles["input-group"]}>
                  <label htmlFor="account-role">Role</label>
                  <select
                    id="account-role"
                    name="role"
                    className={styles.signupSelect}
                    value={accountForm.role}
                    onChange={handleAccountFormChange}
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className={registerStyles["input-group"]}>
                  <label htmlFor="account-password">New Password (Optional)</label>
                  <input
                    id="account-password"
                    type="password"
                    name="password"
                    placeholder="Set a new password before approval"
                    value={accountForm.password}
                    onChange={handleAccountFormChange}
                  />
                </div>

                <div className={registerStyles["input-group"]}>
                  <label htmlFor="account-confirm-password">Confirm Password</label>
                  <input
                    id="account-confirm-password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat the new password"
                    value={accountForm.confirmPassword}
                    onChange={handleAccountFormChange}
                  />
                </div>
              </form>

              <div className={styles.accountMeta}>
                <span>
                  Requested on {new Date(selectedAccount.createdAt).toLocaleDateString()}
                </span>
                <Badge variant={selectedAccount.status || "pending"}>
                  {formatLabel(selectedAccount.status)}
                </Badge>
              </div>

              <div className={styles.reviewActions}>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => handleAccountDecision("suspended")}
                  disabled={isSubmitting}
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  className={registerStyles.sign}
                  onClick={() => handleAccountDecision("active")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Approve Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className={styles.confirmOverlay} onClick={closeConfirmDialog}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmContent}>
              <p className={styles.confirmHeading}>{confirmDialog.title}</p>
              <p className={styles.confirmDescription}>{confirmDialog.description}</p>
            </div>
            <div className={styles.confirmButtonWrapper}>
              <button className={`${styles.confirmButton} ${styles.confirmCancel}`} onClick={closeConfirmDialog}>
                Cancel
              </button>
              <button
                className={`${styles.confirmButton} ${confirmDialog.confirmClassName}`}
                onClick={executeConfirmDialog}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
            <button className={styles.confirmExitButton} onClick={closeConfirmDialog}>
              <svg height="20px" viewBox="0 0 384 512">
                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Requests;
