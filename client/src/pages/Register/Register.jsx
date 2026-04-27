import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const API_BASE = import.meta.env.VITE_API_URL || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            
            const res = await axios.post(`${API_BASE}/api/auth/google-login`, {
                token: credentialResponse.credential,
            });
            
            localStorage.setItem('token', res.data.token);
            
            const userRole = res.data.role;
            if (userRole) {
                localStorage.setItem('role', userRole);
            }
            if (res.data.name) {
                localStorage.setItem('name', res.data.name);
            }

            sessionStorage.setItem('justLoggedIn', 'true');

            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || "Google registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google registration failed. Please try again.');
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
                
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#30363d' }}></div>
                    <p style={{ margin: '0 10px', color: '#8b949e', fontSize: '0.85rem' }}>Or continue with</p>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#30363d' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    {GOOGLE_CLIENT_ID ? (
                        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                shape="pill"
                            />
                        </GoogleOAuthProvider>
                    ) : (
                        <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>Google Auth Not Configured</p>
                    )}
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
        </div>
    );
};

export default Register;
