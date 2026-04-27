import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import styles from './AdminSettings.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistration: true,
        siteName: 'Artisan',
        maxUploadSize: 10 // MB
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/admin/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data) setSettings(res.data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/admin/settings`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Settings updated successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Failed to update settings.', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    if (loading) {
        return (
            <>
                <div className="background-fx"></div>
                <div className="admin-layout">
                    <Sidebar activePage="settings" />
                    <main className="main-view">
                        <Topbar title="System Configurations" />
                        <div className={styles.loadingState}>Loading configurations...</div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="background-fx"></div>
            <div className="admin-layout">
                <Sidebar activePage="settings" />
                <main className="main-view">
                    <Topbar title="System Configurations" />

                    {message.text && (
                        <div className={`${styles.alert} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2 className={styles.panelTitle}>Global Settings</h2>
                                <p className={styles.panelText}>
                                    Configure platform behaviour, limits, and access controls.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.settingsForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="siteName">Platform Name</label>
                                <input
                                    type="text"
                                    id="siteName"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleChange}
                                    placeholder="Enter site name"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="maxUploadSize">Max Upload Size (MB)</label>
                                <input
                                    type="number"
                                    id="maxUploadSize"
                                    name="maxUploadSize"
                                    value={settings.maxUploadSize}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.checkboxGroup}>
                                <label className={styles.iosCheckbox}>
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange}
                                    />
                                    <div className={styles.checkboxWrapper}>
                                        <div className={styles.checkboxBg}></div>
                                        <svg className={styles.checkboxIcon} viewBox="0 0 24 24" fill="none">
                                            <path
                                                className={styles.checkPath}
                                                d="M4 12L10 18L20 6"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <span>Enable Maintenance Mode</span>
                                </label>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <label className={styles.iosCheckbox}>
                                    <input
                                        type="checkbox"
                                        name="allowRegistration"
                                        checked={settings.allowRegistration}
                                        onChange={handleChange}
                                    />
                                    <div className={styles.checkboxWrapper}>
                                        <div className={styles.checkboxBg}></div>
                                        <svg className={styles.checkboxIcon} viewBox="0 0 24 24" fill="none">
                                            <path
                                                className={styles.checkPath}
                                                d="M4 12L10 18L20 6"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <span>Allow New User Registrations</span>
                                </label>
                            </div>

                            <div className={styles.formActions}>
                                <button type="submit" className={styles.saveBtn}>
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        </>
    );
};

export default AdminSettings;