import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import BackButton from '../../components/BackButton';
import styles from './Login.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [modalContent, setModalContent] = useState('terms');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
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
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${API_BASE}/api/auth/login`, formData);

            localStorage.setItem('token', res.data.token);

            if (res.data.role) {
                localStorage.setItem('role', res.data.role);
            }
            if (res.data.name) {
                localStorage.setItem('name', res.data.name);
            }
            if (res.data.avatar) {
                localStorage.setItem('avatar', res.data.avatar);
            }

            sessionStorage.setItem('justLoggedIn', 'true');

            setUser(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openTermsModal = (type) => {
        setModalContent(type);
        setShowTermsModal(true);
    };

    return (
        <div className={styles.loginWrapper}>
            <BackButton />

            <div className={styles.formContainer}>
                <div className={styles.cardHeader}>
                    <p className={styles.eyebrow}>Artist Access</p>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>
                        Sign in to manage your profile, uploads, bookmarks, and notifications.
                    </p>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.inputGroup}>
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        <div className={styles.forgot}>
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                    </div>

                    <button className={styles.sign} type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <p className={styles.signup}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>

                <p className={styles.termsNotice}>
                    By signing in, you agree to our{' '}
                    <button type="button" className={styles.termsLink} onClick={() => openTermsModal('terms')}>
                        Terms
                    </button>{' '}
                    and{' '}
                    <button type="button" className={styles.termsLink} onClick={() => openTermsModal('privacy')}>
                        Privacy Policy
                    </button>.
                </p>
            </div>

            {showTermsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                                </svg>
                                {modalContent === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                            </div>
                            <button
                                type="button"
                                className={styles.modalClose}
                                onClick={() => setShowTermsModal(false)}
                                aria-label="Close terms dialog"
                            >
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {modalContent === 'terms' ? (
                                <>
                                    <h3>1. Acceptance of Terms</h3>
                                    <p>By accessing and using EMC Artisan, you agree to comply with these Terms of Service.</p>
                                    <h3>2. User Content</h3>
                                    <p>You retain ownership of the artwork you upload. By uploading, you grant the platform a non-exclusive, royalty-free license to display, promote, and archive your work.</p>
                                    <h3>3. Prohibited Conduct</h3>
                                    <p>You may not upload content that is illegal, infringing, or inappropriate. The platform reserves the right to remove any content.</p>
                                    <h3>4. Intellectual Property</h3>
                                    <p>All site design, logos, and code belong to EMC Artisan. Users may not copy or reproduce the platform's underlying code.</p>
                                    <h3>5. Termination</h3>
                                    <p>We may suspend or terminate accounts that violate these terms.</p>
                                </>
                            ) : (
                                <>
                                    <h3>1. Information We Collect</h3>
                                    <p>We collect your name, email address, profile picture, uploaded artworks, and general usage data.</p>
                                    <h3>2. How We Use Your Data</h3>
                                    <p>Your data is used to operate the gallery, communicate with you, and improve the platform. We do not sell your personal information.</p>
                                    <h3>3. Sharing of Information</h3>
                                    <p>Artworks and artist names are publicly visible. Your email and personal details are never shared without consent.</p>
                                    <h3>4. Data Security</h3>
                                    <p>We implement standard security measures, but no method of transmission over the internet is 100 percent secure.</p>
                                    <h3>5. Your Rights</h3>
                                    <p>You may request deletion of your account and data by contacting support.</p>
                                </>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.modalAccept} onClick={() => setShowTermsModal(false)}>Accept</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
