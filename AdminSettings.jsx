import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminSettings.module.css';

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
                // Assuming an endpoint exists to fetch global settings
                const res = await axios.get('http://localhost:5000/api/admin/settings', {
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
            await axios.post('http://localhost:5000/api/admin/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Settings updated successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Failed to update settings.', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    if (loading) return <div className={styles.loading}>Loading Configurations...</div>;

    return (
        <div className={styles.settingsContainer}>
            <h1>System Configurations</h1>
            {message.text && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}
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
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    <input type="checkbox" id="maintenanceMode" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                    <label htmlFor="maintenanceMode">Enable Maintenance Mode</label>
                </div>

                <div className={styles.checkboxGroup}>
                    <input type="checkbox" id="allowRegistration" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} />
                    <label htmlFor="allowRegistration">Allow New User Registrations</label>
                </div>

                <button type="submit" className={styles.saveBtn}>Save Settings</button>
            </form>
        </div>
    );
};

export default AdminSettings;