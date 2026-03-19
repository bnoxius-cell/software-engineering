import React, { useState } from 'react';
import styles from './Settings.module.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.tabContent}>
                        <h2>Public Profile</h2>
                        <p className={styles.subtext}>Manage how you appear to other artists and visitors.</p>
                        
                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input type="text" defaultValue="John Doe" className={styles.input} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Artist Bio</label>
                            <textarea rows="4" placeholder="Tell the world about your art style..." className={styles.textarea}></textarea>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Portfolio / Social Link</label>
                            <input type="url" placeholder="https://artstation.com/yourname" className={styles.input} />
                        </div>

                        <button className={styles.saveBtn}>Save Changes</button>
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.tabContent}>
                        <h2>Account Security</h2>
                        <p className={styles.subtext}>Update your password and secure your account.</p>
                        
                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input type="password" placeholder="••••••••" className={styles.input} />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input type="password" placeholder="••••••••" className={styles.input} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="••••••••" className={styles.input} />
                        </div>

                        <button className={styles.saveBtn}>Update Password</button>
                    </div>
                );
            case 'notifications':
                return (
                    <div className={styles.tabContent}>
                        <h2>Notifications</h2>
                        <p className={styles.subtext}>Choose what emails and alerts you receive.</p>
                        <p style={{ color: '#8b949e' }}>Notification preferences coming soon.</p>
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
            {/* LEFT SIDEBAR */}
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

            {/* RIGHT CONTENT AREA */}
            <main className={styles.contentArea}>
                {renderContent()}
            </main>
        </div>
    );
};

export default Settings;