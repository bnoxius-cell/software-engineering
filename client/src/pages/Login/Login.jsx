    import React, { useState } from 'react'
    import axios from 'axios'
    import styles from './Login.module.css'
    import { useNavigate } from 'react-router-dom'

    const Login = ({ setUser }) => {
        const [ formData, setFormData ] = useState({
            email: "",
            password: ""
        })

        const [ error, setError] = useState('');
        const navigate = useNavigate();
        
        const handleChange = (e) => {
            setFormData({...formData, [e.target.name]: e.target.value})
        }

        const handleSubmit = async (e) => {
            e.preventDefault();
            console.log(formData)
            try {
                const res = await axios.post('/api/auth/login', formData);
                console.log(res)
                
                localStorage.setItem('token', res.data.token)

                const userRole = res.data.role; 
                if (userRole) {
                    localStorage.setItem('role', userRole);
                }

                setUser(res.data)
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.message || "Login failed.") 
            }
        }

return (
    <div className={styles["login-wrapper"]} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '100vh', padding: '2rem' }}>
        {/* Background with space theme */}
        <div className={styles["login-bg"]}>
            {/* Stars layers */}
            <div className={styles["stars"]}></div>
            <div className={styles["stars2"]}></div>
            <div className={styles["stars3"]}></div>
            
            {/* Moon in top left */}
            <div className={styles["moon"]}></div>
            
            {/* Shooting Stars - Following the example pattern */}
            <div className={`${styles["shooting-star"]} ${styles["shooting-star1"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star2"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star3"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star4"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star5"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star6"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star7"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star8"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star9"]}`}></div>
            <div className={`${styles["shooting-star"]} ${styles["shooting-star10"]}`}></div>
            
            {/* Astronaut Container - Left side aligned with form */}
            <div className={styles["astronaut-container"]}>
                <img src="https://uiverse.io/astronaut.png" alt="Astronaut" className={styles["astronaut"]} />
                <div className={styles["glow"]}></div>
            </div>
        </div>
        
        {/* Login Form Container */}
        <div className={styles["form-container"]}>
            <p className={styles["title"]}>Login</p>
            
            {error && <p className={styles.error}>{error}</p>}
            <form className={styles["form"]} onSubmit={handleSubmit}>
                <div className={styles["input-group"]}>
                    <label htmlFor="email">E-mail</label>
                    <input type="email" name="email" id="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} autoComplete='off' />
                </div>
                <div className={styles["input-group"]}>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
                    <div className={styles["forgot"]}><a rel="noopener noreferrer" href="#">Forgot Password ?</a></div>
                </div>
                <button className={styles["sign"]}>Sign in</button>
            </form>
            
            <div className={styles["social-message"]}>
                <div className={styles["line"]}></div>
                <p className={styles["message"]}>Login with social accounts</p>
                <div className={styles["line"]}></div>
            </div>
            
            {/* Social Icons */}
            <div className={styles["social-icons"]}>
                <a aria-label="Log in with Google" className={styles["icon"]}><img src="/assets/images/icons/google.png" alt="Google Sign-in" /></a>
                <a aria-label="Log in with Twitter" className={styles["icon"]}><img src="/assets/images/icons/twitter.png" alt="Twitter Sign-in" /></a>
                <a aria-label="Log in with GitHub" className={styles["icon"]}><img src="/assets/images/icons/github.png" alt="GitHub Sign-in" /></a>
            </div>
            
            {/* Sign up link */}
            <p className={styles["signup"]}>Don't have an account? <a rel="noopener noreferrer" href="admin_dashboard.html">Sign up</a></p>
            {/*<!-- TODO: No sign-up option since it is handled by the admin -->*/}
            <p className={styles["signup"]}>Don't have an account? <a rel="noopener noreferrer" href="/register">Sign up</a></p>
        </div>
    </div>
)
    }

    export default Login;