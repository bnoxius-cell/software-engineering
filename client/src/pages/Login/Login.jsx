import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        // Clear error when user starts typing
        if (error) setError('');
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
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const res = await axios.post('/api/auth/login', formData);
            
            localStorage.setItem('token', res.data.token);
            
            const userRole = res.data.role; 
            if (userRole) {
                localStorage.setItem('role', userRole);
            }
            
            setUser(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        // Implement social login logic
        console.log(`Login with ${provider}`);
        // Redirect to OAuth endpoint or open popup
    };

    return (
        <div className={styles["login-wrapper"]} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '100vh', padding: '2rem' }}>
            {/* Background with space theme */}
            <div className={styles["login-bg"]}>
                <div className={styles["stars"]}></div>
                <div className={styles["stars2"]}></div>
                <div className={styles["stars3"]}></div>
                <div className={styles["moon"]}></div>
                <div className={styles["astronaut-container"]}>
                    {/* Use a reliable image source or import locally */}
                    <img src="client\src\assets\images\icons\astronaut.png" alt="Astronaut" className={styles["astronaut"]} />
                    <div className={styles["glow"]}></div>
                </div>
            </div>
            
            <div className={styles["form-container"]}>
                <p className={styles["title"]}>Login</p>
                
                {error && <p className={styles.error} role="alert">{error}</p>}
                
                <form className={styles["form"]} onSubmit={handleSubmit} noValidate>
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
                            placeholder="Enter your password" 
                            value={formData.password} 
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        <div className={styles["forgot"]}>
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                    </div>
                    
                    <button className={styles["sign"]} type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                
                <div className={styles["social-message"]}>
                    <div className={styles["line"]}></div>
                    <p className={styles["message"]}>Login with social accounts</p>
                    <div className={styles["line"]}></div>
                </div>
                
                <div className={styles["social-icons"]}>
                    <button 
                        aria-label="Log in with Google" 
                        className={styles["icon"]}
                        onClick={() => handleSocialLogin('google')}
                        disabled={loading}
                    >
                        <img src="/assets/images/icons/google.png" alt="Google Sign-in" />
                    </button>
                    <button 
                        aria-label="Log in with Twitter" 
                        className={styles["icon"]}
                        onClick={() => handleSocialLogin('twitter')}
                        disabled={loading}
                    >
                        <img src="/assets/images/icons/twitter.png" alt="Twitter Sign-in" />
                    </button>
                    <button 
                        aria-label="Log in with GitHub" 
                        className={styles["icon"]}
                        onClick={() => handleSocialLogin('github')}
                        disabled={loading}
                    >
                        <img src="/assets/images/icons/github.png" alt="GitHub Sign-in" />
                    </button>
                </div>
                
                <p className={styles["signup"]}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;