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
            setUser(res.data)
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || "Login failed.") 
        }
    }

  return (
    <>
        {/*<!-- for background effect-->*/}
        <div className={styles["login-bg"]}></div>
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
                    <div className={styles["forgot"]}><a rel="noopener noreferrer" href="#">Forgot Password?</a></div>
                </div>
                <button className={styles["sign"]}>Sign in</button>
            </form>
            <div className={styles["social-message"]}>
                <div className={styles["line"]}></div>
                <p className={styles["message"]}>Login with social accounts</p>
                <div className={styles["line"]}></div>
            </div>
            {/*<!-- TODO: Make alternate icons for mouse hover -->*/}
            <div className={styles["social-icons"]}>
                <a aria-label="Log in with Google" className={styles["icon"]}><img src="/assets/images/icons/google.png" alt="Google Sign-in" /></a>
                <a aria-label="Log in with Twitter" className={styles["icon"]}><img src="/assets/images/icons/twitter.png" alt="Twitter Sign-in" /></a>
                <a aria-label="Log in with GitHub" className={styles["icon"]}><img src="/assets/images/icons/github.png" alt="GitHub Sign-in" /></a>
            </div>
            {/*<!-- TODO: No sign-up option since it is handled by the admin -->*/}
            <p className={styles["signup"]}>Don't have an account? <a rel="noopener noreferrer" href="admin_dashboard.html">Sign up</a></p>
        </div>
    </>
  )
}

export default Login;