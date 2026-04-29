import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Notifications.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const typeLabelMap = {
    account_created: 'Account Created',
    account_approved: 'Account Approved',
    artwork_approved: 'Artwork Approved',
    info_modified: 'Info Updated',
};

const typeClassMap = {
    account_created: styles.typePending,
    account_approved: styles.typeSuccess,
    artwork_approved: styles.typeSuccess,
    info_modified: styles.typeInfo,
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const abortController = new AbortController();

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`${API_BASE}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: abortController.signal,
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch notifications');
                }

                const data = await res.json();
                setNotifications(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.name !== 'AbortError') {

                    setError('Unable to load notifications right now.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        return () => abortController.abort();
    }, [navigate, token]);

    const unreadCount = useMemo(
        () => notifications.filter((note) => !note.isRead).length,
        [notifications]
    );

    const markAsRead = async (id) => {
        if (!token) return;

        setNotifications((current) =>
            current.map((note) => (note._id === id ? { ...note, isRead: true } : note))
        );

        try {
            await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            setNotifications((current) =>
                current.map((note) => (note._id === id ? { ...note, isRead: false } : note))
            );
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;

        const previousNotifications = notifications;
        setNotifications((current) => current.map((note) => ({ ...note, isRead: true })));

        try {
            await fetch(`${API_BASE}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            setNotifications(previousNotifications);
        }
    };

    return (
        <>
            <div className={styles.pageWrapper}>
                <section className={styles.heroCard}>
                    <div>
                        <p className={styles.eyebrow}>Activity Center</p>
                        <h1 className={styles.pageTitle}>Notifications</h1>
                        <p className={styles.pageSubtitle}>
                            Track approvals, account updates, and artwork review activity in one place.
                        </p>
                    </div>

                    <div className={styles.heroActions}>
                        <div className={styles.unreadPill}>
                            {unreadCount} unread
                        </div>
                        <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            Mark All Read
                        </button>
                    </div>
                </section>

                {loading ? (
                    <section className={styles.stateCard}>
                        <p>Loading notifications...</p>
                    </section>
                ) : error ? (
                    <section className={styles.stateCard}>
                        <p>{error}</p>
                    </section>
                ) : notifications.length === 0 ? (
                    <section className={styles.stateCard}>
                        <p>No notifications yet.</p>
                    </section>
                ) : (
                    <section className={styles.list}>
                        {notifications.map((note) => (
                            <article
                                key={note._id}
                                className={`${styles.notificationCard} ${!note.isRead ? styles.unread : ''}`}
                                onClick={() => !note.isRead && markAsRead(note._id)}
                            >
                                <div className={styles.noteHeader}>
                                    <span className={`${styles.typeChip} ${typeClassMap[note.type] || styles.typeInfo}`}>
                                        {typeLabelMap[note.type] || note.type}
                                    </span>
                                    <span className={styles.timestamp}>
                                        {new Date(note.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <p className={styles.message}>{note.message}</p>

                                {Array.isArray(note.details?.updatedFields) && note.details.updatedFields.length > 0 && (
                                    <div className={styles.detailsBox}>
                                        <p className={styles.detailsTitle}>Changes made</p>
                                        <ul className={styles.detailsList}>
                                            {note.details.updatedFields.map((field, index) => (
                                                <li key={`${field.field || field}-${index}`}>
                                                    <strong>{field.label || field}</strong>
                                                    {field.newValue ? `: ${field.newValue}` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {note.type === 'artwork_approved' && (
                                    <div className={styles.noteFooter}>
                                        <Link to="/gallery" className={styles.inlineLink}>
                                            View gallery
                                        </Link>
                                    </div>
                                )}
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </>
    );
};

export default Notifications;
