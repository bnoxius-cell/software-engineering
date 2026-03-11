import React from 'react'

const Navbar = () => {
  return (
    <header className="navbar">
        <div className="logo">
            <a href="/index.html">
                <img src="/assets/images/artisanLogo.png" alt="EMC Artisan Logo" />
            </a>
        </div>
        <div className="search-container">
            <input type="text" placeholder="Search" className="search-bar" />
            <select className="search-select">
                <option value="all">All</option>
                <option value="student">Artwork Name</option>
                <option value="artwork">Student Name</option>
                <option value="genre">Genre</option>
            </select>
            <button type="button" className="search-btn">Search</button>
        </div>  

        {/*<!-- Navigation Links -->*/}
        <ul className="nav-links">
            <li><a href="/pages/about.html">About</a></li>
            <li><a href="/pages/contact.html">Contact Us</a></li>

            {/*<!-- TODO: dropdown-container img should be expandable -->*/}
            <li className="dropdown-container">
                <a href="/pages/login.html" className="dropdown-trigger">
                    <img src="/assets/images/profile_icon.png" alt="Profile" className="nav-profile" />
                </a>
                <div className="dropdown-menu">
                    <div className="dropdown-content">
                        <a href="#"><img src="" alt="Profile" />Profile</a>
                        <a href="#"><img src="/assets/images/icons/account.png" alt="Account" />Account</a>
                        <a href="#"><img src="/assets/images/icons/setting.png" alt="Settings" />Settings</a>
                        <a href="#"><img src="/assets/images/icons/accessibility.png" alt="Accessibility" />Accessibility</a>
                        <a href="#"><img src="/assets/images/icons/notification.png" alt="Notifications" />Notifications</a>
                    </div>
                </div>
            </li>
        </ul>
    </header>
  )
}

export default Navbar