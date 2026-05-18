import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Settings.module.css';
import { getAvatarUrl } from '../../utils/avatar';

// ==================== TOGGLE SWITCH COMPONENT ====================
const ToggleSwitch = ({ checked, onChange, disabled }) => {
    return (
        <label className={styles.switch}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div className={styles.slider}>
                <div className={styles.circle}>
                    <svg
                        className={styles.cross}
                        viewBox="0 0 365.696 365.696"
                        height="6"
                        width="6"
                    >
                        <path
                            fill="currentColor"
                            d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25z"
                        />
                    </svg>
                    <svg
                        className={styles.checkmark}
                        viewBox="0 0 24 24"
                        height="10"
                        width="10"
                    >
                        <path
                            fill="currentColor"
                            d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                        />
                    </svg>
                </div>
            </div>
        </label>
    );
};

// ==================== MAIN SETTINGS COMPONENT ====================
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Profile data
    const [profileForm, setProfileForm] = useState({
        name: '',
        bio: '',
        socialLink: ''
    });

    // Password change
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification preferences
    const [notificationArtworkAdded, setNotificationArtworkAdded] = useState(true);

    // Accessibility – font size
    const [fontSize, setFontSize] = useState('medium');

    // Privacy settings
    const [privacy, setPrivacy] = useState({
        hideFollowers: false,
        hideFollowing: false,
    });

    useEffect(() => {
        fetchUserData();
        loadPrivacySettings();
        loadAccessibilityPrefs();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setProfileForm({
                name: response.data.name || '',
                bio: response.data.bio || '',
                socialLink: response.data.socials?.portfolio || ''
            });
            setNotificationArtworkAdded(response.data.notifications?.artworkAdded ?? true);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPrivacySettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrivacy({
                hideFollowers: res.data.privacy?.hideFollowers || false,
                hideFollowing: res.data.privacy?.hideFollowing || false,
            });
        } catch (err) {
            console.error('Failed to load privacy settings', err);
        }
    };

    const loadAccessibilityPrefs = () => {
        const stored = localStorage.getItem('userFontSize');
        if (stored) {
            setFontSize(stored);
            applyFontSize(stored);
        }
    };

    const applyFontSize = (size) => {
        const root = document.documentElement;
        if (size === 'small') root.style.fontSize = '14px';
        else if (size === 'large') root.style.fontSize = '18px';
        else root.style.fontSize = '';
    };

    const handleFontSizeChange = (newSize) => {
        setFontSize(newSize);
        localStorage.setItem('userFontSize', newSize);
        applyFontSize(newSize);
        setMessage('Accessibility preference saved!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handlePrivacyToggle = async (key, value) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const newPrivacy = { ...privacy, [key]: value };
            await axios.put('/api/auth/privacy', { privacy: newPrivacy }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrivacy(newPrivacy);
            setMessage('Privacy settings updated!');
        } catch {
            setMessage('Failed to update privacy settings.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleProfileSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/profile', {
                name: profileForm.name,
                bio: profileForm.bio
            }, { headers: { Authorization: `Bearer ${token}` } });

            await axios.put('/api/auth/socials', {
                portfolio: profileForm.socialLink
            }, { headers: { Authorization: `Bearer ${token}` } });

            setMessage('Profile updated successfully!');
            fetchUserData();
        } catch {
            setMessage('Error updating profile.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage('New passwords do not match.');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }, { headers: { Authorization: `Bearer ${token}` } });

            setMessage('Password updated successfully!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating password.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/auth/avatar', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Profile picture updated!');
            localStorage.setItem('avatar', response.data.avatar);
            window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: response.data.avatar }));
            fetchUserData();
        } catch {
            setMessage('Error uploading profile picture.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleNotificationChange = async (value) => {
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/notifications', {
                notifications: { artworkAdded: value }
            }, { headers: { Authorization: `Bearer ${token}` } });
            setNotificationArtworkAdded(value);
            setMessage('Notification preference updated!');
        } catch {
            setMessage('Error updating notification preference.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.tabContent}>
                        <h2>Public Profile</h2>
                        <p className={styles.subtext}>Manage how you appear to other artists and visitors.</p>
                        <div className={styles.formGroup}>
                            <label>Profile Picture</label>
                            <div className={styles.avatarSection}>
                                <img src={getAvatarUrl(user?.avatar)} alt="Profile" className={styles.currentAvatar} />
                                <label className={styles.uploadBtn}>
                                    Change Picture
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input type="text" value={profileForm.name} onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Artist Bio</label>
                            <textarea rows="4" value={profileForm.bio} onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell the world about your art style..." className={styles.textarea} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Portfolio / Social Link</label>
                            <input type="url" value={profileForm.socialLink} onChange={e => setProfileForm(prev => ({ ...prev, socialLink: e.target.value }))} placeholder="https://..." className={styles.input} />
                        </div>
                        <button className={styles.saveBtn} onClick={handleProfileSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.tabContent}>
                        <h2>Account Security</h2>
                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="••••••••" className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Confirm New Password</label>
                            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" className={styles.input} />
                        </div>
                        <button className={styles.saveBtn} onClick={handlePasswordChange} disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
                    </div>
                );
            case 'notifications':
                return (
                    <div className={styles.tabContent}>
                        <h2>Notifications</h2>
                        <div className={styles.toggleCard}>
                            <div>
                                <h4 className={styles.toggleTitle}>Artwork Notifications</h4>
                                <p className={styles.toggleDescription}>Get notified when your artwork submissions are approved and published.</p>
                            </div>
                            <ToggleSwitch
                                checked={notificationArtworkAdded}
                                onChange={(e) => handleNotificationChange(e.target.checked)}
                                disabled={saving}
                            />
                        </div>
                    </div>
                );
            case 'accessibility':
                return (
                    <div className={styles.tabContent}>
                        <h2>Accessibility</h2>
                        <div className={styles.formGroup}>
                            <label>Font size</label>
                            <select value={fontSize} onChange={(e) => handleFontSizeChange(e.target.value)} className={styles.select}>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                            <p className={styles.checkboxDescription}>Adjust the text size throughout the site.</p>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div className={styles.tabContent}>
                        <h2>Privacy & Data</h2>
                        <div className={styles.toggleCard}>
                            <div>
                                <h4 className={styles.toggleTitle}>Hide Followers List</h4>
                                <p className={styles.toggleDescription}>Other users will not see who follows you.</p>
                            </div>
                            <ToggleSwitch
                                checked={privacy.hideFollowers}
                                onChange={(e) => handlePrivacyToggle('hideFollowers', e.target.checked)}
                                disabled={saving}
                            />
                        </div>
                        <div className={styles.toggleCard}>
                            <div>
                                <h4 className={styles.toggleTitle}>Hide Following List</h4>
                                <p className={styles.toggleDescription}>Other users will not see who you follow.</p>
                            </div>
                            <ToggleSwitch
                                checked={privacy.hideFollowing}
                                onChange={(e) => handlePrivacyToggle('hideFollowing', e.target.checked)}
                                disabled={saving}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* STANDARD BACKGROUND EFFECT (same as Notifications & admin pages) */}
            <div className="background-fx"></div>
            <div className={styles.settingsLayout}>
                <aside className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Settings</h3>
                    <nav className={styles.navMenu}>
                        <button className={activeTab === 'profile' ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setActiveTab('profile')}>Public Profile</button>
                        <button className={activeTab === 'security' ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setActiveTab('security')}>Account Security</button>
                        <button className={activeTab === 'notifications' ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setActiveTab('notifications')}>Notifications</button>
                        <button className={activeTab === 'accessibility' ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setActiveTab('accessibility')}>Accessibility</button>
                        <div className={styles.divider}></div>
                        <button className={activeTab === 'privacy' ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setActiveTab('privacy')}>Privacy & Data</button>
                    </nav>
                </aside>
                <main className={styles.contentArea}>
                    {message && (
                        <div className={`${styles.message} ${message.includes('Error') || message.includes('Failed') ? styles.error : styles.success}`}>
                            {message}
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
        </>
    );
};

export default Settings;