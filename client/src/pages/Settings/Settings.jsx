import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Settings.module.css';
import { getAvatarUrl } from '../../utils/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [profileForm, setProfileForm] = useState({
        name: '',
        bio: '',
        socialLink: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        artworkAdded: true
    });

    useEffect(() => {
        fetchUserData();
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
            setNotifications(response.data.notifications || { artworkAdded: true });
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
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
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await axios.put('/api/auth/socials', {
                portfolio: profileForm.socialLink
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Profile updated successfully!');
            fetchUserData();
        } catch (error) {
            setMessage('Error updating profile. Please try again.');
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
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
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

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

            setMessage('Profile picture updated successfully!');
            localStorage.setItem('avatar', response.data.avatar);
            window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: response.data.avatar }));
            fetchUserData();
        } catch (error) {
            setMessage('Error uploading profile picture.');
            console.error('Error uploading avatar:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationChange = async (type, value) => {
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/notifications', {
                notifications: { [type]: value }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => ({ ...prev, [type]: value }));
            setMessage('Notification preferences updated!');
        } catch (error) {
            setMessage('Error updating notification preferences.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

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
                                <img
                                    src={getAvatarUrl(user?.avatar) || '/assets/images/profile_icon.png'}
                                    alt="Profile"
                                    className={styles.currentAvatar}
                                />
                                <label className={styles.uploadBtn}>
                                    Change Picture
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Artist Bio</label>
                            <textarea
                                rows="4"
                                value={profileForm.bio}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Tell the world about your art style..."
                                className={styles.textarea}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Portfolio / Social Link</label>
                            <input
                                type="url"
                                value={profileForm.socialLink}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, socialLink: e.target.value }))}
                                placeholder="https://artstation.com/yourname"
                                className={styles.input}
                            />
                        </div>

                        <button
                            className={styles.saveBtn}
                            onClick={handleProfileSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.tabContent}>
                        <h2>Account Security</h2>
                        <p className={styles.subtext}>Update your password and secure your account.</p>
                        
                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="••••••••"
                                className={styles.input}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="••••••••"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="••••••••"
                                className={styles.input}
                            />
                        </div>

                        <button
                            className={styles.saveBtn}
                            onClick={handlePasswordChange}
                            disabled={saving}
                        >
                            {saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                );
            case 'notifications':
                return (
                    <div className={styles.tabContent}>
                        <h2>Notifications</h2>
                        <p className={styles.subtext}>Choose what emails and alerts you receive.</p>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={notifications.artworkAdded}
                                    onChange={(e) => handleNotificationChange('artworkAdded', e.target.checked)}
                                    disabled={saving}
                                />
                                <span className={styles.checkboxText}>
                                    Artwork successfully added notifications
                                </span>
                            </label>
                            <p className={styles.checkboxDescription}>
                                Get notified when your artwork submissions are approved and published.
                            </p>
                        </div>
                    </div>
                );
            case 'accessibility':
                return (
                    <div className={styles.tabContent}>
                        <h2>Accessibility</h2>
                        <p className={styles.subtext}>Customize your viewing experience.</p>
                        <p style={{ color: '#8b949e' }}>Accessibility options coming soon.</p>
                    </div>
                );
            case 'privacy':
                return (
                    <div className={styles.tabContent}>
                        <h2>Data & Privacy</h2>
                        <p className={styles.subtext}>Manage your data and account visibility.</p>
                        <p style={{ color: '#8b949e' }}>Privacy settings coming soon.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.settingsLayout}>
            <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Settings</h3>
                <nav className={styles.navMenu}>
                    <button 
                        className={activeTab === 'profile' ? `${styles.navItem} ${styles.active}` : styles.navItem}
                        onClick={() => setActiveTab('profile')}
                    >
                        Public Profile
                    </button>
                    <button 
                        className={activeTab === 'security' ? `${styles.navItem} ${styles.active}` : styles.navItem}
                        onClick={() => setActiveTab('security')}
                    >
                        Account Security
                    </button>
                    <button 
                        className={activeTab === 'notifications' ? `${styles.navItem} ${styles.active}` : styles.navItem}
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notifications
                    </button>
                    <button 
                        className={activeTab === 'accessibility' ? `${styles.navItem} ${styles.active}` : styles.navItem}
                        onClick={() => setActiveTab('accessibility')}
                    >
                        Accessibility
                    </button>
                    <div className={styles.divider}></div>
                    <button 
                        className={activeTab === 'privacy' ? `${styles.navItem} ${styles.active}` : styles.navItem}
                        onClick={() => setActiveTab('privacy')}
                    >
                        Data & Privacy
                    </button>
                </nav>
            </aside>

            <main className={styles.contentArea}>
                {message && (
                    <div className={`${styles.message} ${message.includes('Error') || message.includes('incorrect') ? styles.error : styles.success}`}>
                        {message}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default Settings;
