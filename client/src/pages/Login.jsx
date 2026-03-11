import React from 'react'

const Login = () => {
  return (
    <>
        {/*<!-- for background effect-->*/}
        <div className="login-bg"></div>
        <div className="form-container">
            <p className="title">Login</p>
            <form className="form" >
                <div className="input-group">
                    <label htmlFor="username">E-mail</label>
                    <input type="text" name="username" id="username" placeholder="" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" placeholder="" />
                    <div className="forgot"><a rel="noopener noreferrer" href="#">Forgot Password?</a></div>
                </div>
                <button className="sign">Sign in</button>
            </form>
            <div className="social-message">
                <div className="line"></div>
                <p className="message">Login with social accounts</p>
                <div className="line"></div>
            </div>
            {/*<!-- TODO: Make alternate icons for mouse hover -->*/}
            <div className="social-icons">
                <a aria-label="Log in with Google" className="icon"><img src="/assets/images/icons/google.png" alt="Google Sign-in" /></a>
                <a aria-label="Log in with Twitter" className="icon"><img src="/assets/images/icons/twitter.png" alt="Twitter Sign-in" /></a>
                <a aria-label="Log in with GitHub" className="icon"><img src="/assets/images/icons/github.png" alt="GitHub Sign-in" /></a>
            </div>
            {/*<!-- TODO: No sign-up option since it is handled by the admin -->*/}
            <p className="signup">Don't have an account? <a rel="noopener noreferrer" href="admin_dashboard.html" className="">Sign up</a></p>
        </div>
    </>
  )
}

export default Login;