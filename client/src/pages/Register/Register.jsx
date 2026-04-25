import React, { useState } from 'react';
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
    const [modalContent, setModalContent] = useState('terms'); // 'terms' or 'privacy'
    const navigate = useNavigate();

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
            setError("Passwords do not match");
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
                setError(err.response?.data?.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Sign up with ${provider}`);
        // Redirect to OAuth endpoint or open popup
    };

    const handleAstronautError = (e) => {
        e.target.src = '/assets/images/placeholder-astronaut.png';
    };

    const openTermsModal = (type) => {
        setModalContent(type);
        setShowTermsModal(true);
    };

    return (
        <div className={styles["register-wrapper"]}>
            {/* Background with space theme */}
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
                
                <div className={styles["social-message"]}>
                    <div className={styles["line"]}></div>
                    <p className={styles["message"]}>Sign up with social accounts</p>
                    <div className={styles["line"]}></div>
                </div>
                
                <div className={styles["social-icons"]}>
                    {/* Only Google left */}
                    <button 
                        aria-label="Sign up with Google" 
                        className={styles["icon"]}
                        onClick={() => handleSocialLogin('google')}
                        disabled={loading}
                    >
                        <img src="/assets/images/icons/google.png" alt="Google Sign-up" />
                    </button>
                </div>
                
                <p className={styles["signup"]}>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>

                {/* Terms & Privacy Notice */}
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

            {/* Success Popup */}
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

            {/* Terms & Privacy Modal (same as Login) */}
            {showTermsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                                </svg>
                                {modalContent === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                            </div>
                            <button className={styles.modalClose} onClick={() => setShowTermsModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            {modalContent === 'terms' ? (
                                <>
                                    <h3>1. Acceptance of Terms</h3>
                                    <p>By accessing and using EMC Artisan ("the Platform"), you agree to comply with these Terms of Service.</p>
                                    <h3>2. User Content</h3>
                                    <p>You retain ownership of the artwork you upload. By uploading, you grant the Platform a non‑exclusive, royalty‑free license to display, promote, and archive your work.</p>
                                    <h3>3. Prohibited Conduct</h3>
                                    <p>You may not upload content that is illegal, infringing, or inappropriate (e.g., hate speech, violence, nudity). The Platform reserves the right to remove any content.</p>
                                    <h3>4. Intellectual Property</h3>
                                    <p>All site design, logos, and code belong to EMC Artisan. Users may not copy or reproduce the platform’s underlying code.</p>
                                    <h3>5. Termination</h3>
                                    <p>We may suspend or terminate accounts that violate these terms.</p>
                                </>
                            ) : (
                                <>
                                    <h3>1. Information We Collect</h3>
                                    <p>We collect your name, email address, profile picture, and artworks you upload. We also collect usage data (e.g., page views, likes).</p>
                                    <h3>2. How We Use Your Data</h3>
                                    <p>Your data is used to operate the gallery, communicate with you, and improve the platform. We do not sell your personal information.</p>
                                    <h3>3. Sharing of Information</h3>
                                    <p>Artworks and artist names are publicly visible. Your email and personal details are never shared without consent.</p>
                                    <h3>4. Data Security</h3>
                                    <p>We implement industry‑standard security measures. However, no method of transmission over the Internet is 100% secure.</p>
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

export default Register;