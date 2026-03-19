import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';

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
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);
            await axios.post('http://localhost:5000/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            
            setShowPopup(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles["login-wrapper"]} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '80vh', padding: '2rem' }}>
            <div className={styles["login-bg"]}></div>
            <div className={styles["form-container"]}>
                <p className={styles["title"]}>Create Account</p>
                
                {error && <p className={styles.error}>{error}</p>}
                
                <form className={styles["form"]} onSubmit={handleSubmit}>
                    <div className={styles["input-group"]}>
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" id="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
                    </div>
                    
                    <div className={styles["input-group"]}>
                        <label htmlFor="email">E-mail</label>
                        <input type="email" name="email" id="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required autoComplete="off" />
                    </div>
                    
                    <div className={styles["input-group"]}>
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className={styles["input-group"]}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <div style={{ position: 'relative', marginTop: '1.5rem' }}>
                        <button type="submit" className={styles["sign"]} disabled={loading}>
                            {loading ? 'Sending Request...' : 'Send Request'}
                        </button>

                        {showPopup && (
                            <div className={styles["success-popup"]}>
                                <p className={styles["success-message"]}>Your account will be created once an admin accepts your user registration.</p>
                                <button type="button" className={styles["ok-btn"]} onClick={() => navigate('/login')}>OK</button>
                            </div>
                        )}
                    </div>
                </form>

                <p className={styles["signup"]}>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;