import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [modalContent, setModalContent] = useState('terms');
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [checkingSettings, setCheckingSettings] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings/public');
                if (res.data && res.data.allowRegistration === false) {
                    setAllowRegistration(false);
                }
            } catch {
                // Silently fail - default to allowing registration.
            } finally {
                setCheckingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE}/api/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setShowPopup(true);
        } catch (err) {
            console.error(err);
            if (err.code === 'ERR_NETWORK') {
                setError('Network error. Please check your connection to the server.');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAstronautError = (e) => {
        e.target.src = '/assets/images/placeholder-astronaut.png';
    };

    const openTermsModal = (type) => {
        setModalContent(type);
        setShowTermsModal(true);
    };

    const termsTitle = modalContent === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions';

    if (checkingSettings) {
        return (
            <div className={styles["register-wrapper"]}>
                <div className={styles["form-container"]}>
                    <p className={styles["title"]}>Create Account</p>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!allowRegistration) {
        return (
            <div className={styles["register-wrapper"]}>
                <div className={styles["form-container"]}>
                    <p className={styles["title"]}>Registration Closed</p>
                    <p className={styles.error} role="alert">
                        New user registrations are currently disabled. Please contact an administrator.
                    </p>
                    <p className={styles["signup"]}>
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["register-wrapper"]}>
            <div className={styles["login-bg"]}>
                <div className={styles["stars"]}></div>
                <div className={styles["stars2"]}></div>
                <div className={styles["stars3"]}></div>
                <div className={styles["moon"]}></div>
                <div className={styles["astronaut-container"]}>
                    <img
                        src="/assets/images/icons/astronaut.png"
                        alt="Astronaut"
                        className={styles["astronaut"]}
                        onError={handleAstronautError}
                    />
                    <div className={styles["glow"]}></div>
                </div>
            </div>

            <div className={styles["form-container"]}>
                <p className={styles["title"]}>Create Account</p>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <form className={styles["form"]} onSubmit={handleSubmit} noValidate>
                    <div className={styles["input-group"]}>
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="off"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className={styles["input-group"]}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="off"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className={styles["input-group"]}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Create a password (min. 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className={styles["input-group"]}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button className={styles["sign"]} type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Creating Account...
                            </>
                        ) : (
                            'Sign up'
                        )}
                    </button>
                </form>

                <p className={styles["signup"]}>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>

                <p className={styles.termsNotice}>
                    By signing up, you agree to our{' '}
                    <button type="button" className={styles.termsLink} onClick={() => openTermsModal('terms')}>
                        Terms
                    </button>{' '}
                    and{' '}
                    <button type="button" className={styles.termsLink} onClick={() => openTermsModal('privacy')}>
                        Privacy Policy
                    </button>.
                </p>
            </div>

            {showPopup && (
                <div className={styles["popup-overlay"]}>
                    <div className={styles["popup-content"]}>
                        <p className={styles["popup-message"]}>
                            Your account will be created once an admin accepts your user registration.
                        </p>
                        <button
                            type="button"
                            className={styles["popup-button"]}
                            onClick={() => navigate('/login')}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {showTermsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>{termsTitle}</div>
                            <button
                                type="button"
                                className={styles.modalClose}
                                onClick={() => setShowTermsModal(false)}
                                aria-label="Close terms dialog"
                            >
                                x
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {modalContent === 'privacy' ? (
                                <>
                                    <h3>Information We Use</h3>
                                    <p>Your name, email, and portfolio activity are used to create and manage your account inside the platform.</p>
                                    <h3>How It Is Used</h3>
                                    <p>We use your information to authenticate you, display your profile, and support artwork submission, moderation, and notifications.</p>
                                    <h3>Visibility</h3>
                                    <p>Content you publish, including profile details and artworks, may be visible to other users based on your account and privacy settings.</p>
                                </>
                            ) : (
                                <>
                                    <h3>Acceptable Use</h3>
                                    <p>Accounts should be used for legitimate academic and portfolio activity. Uploaded content must belong to you or be shared with permission.</p>
                                    <h3>Account Review</h3>
                                    <p>New registrations may require administrator approval before full access is granted.</p>
                                    <h3>Content Moderation</h3>
                                    <p>Administrators may review, edit metadata, archive, or remove submissions that do not follow platform rules.</p>
                                </>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.modalAccept}
                                onClick={() => setShowTermsModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
