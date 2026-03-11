import React from 'react'
import styles from './Contact.module.css'

const Contact = () => {
  return (
    <>
    <section className={styles["page-header"]}>
        <h1>Contact Us</h1>
        <p>Get in touch with the departments and institutions behind the EMC Artisan project.</p>
    </section>

    {/*<!-- Contact Cards -->*/}
    <section className={styles["contact-section"]}>
        <div className={styles["contact-grid"]}>

            {/* <!-- OLFU --> */}
            <div className={styles["contact-card"]}>
                <img src="/assets/images/logos/olfu_logo.png" alt="OLFU Logo" />
                <h3>Our Lady of Fatima University</h3>
                <p>Official institution supporting academic excellence and innovation.</p>
                <a href="https://fatima.edu.ph" target="_blank">Visit Website</a>
            </div>

            {/* <!-- Computer Science --> */}
            <div className={styles["contact-card"]}>
                <img src="/assets/images/logos/ccs_logo.jpg" alt="Computer Science Logo" />
                <h3>Department of Computer Science</h3>
                <p>Focused on software engineering, computing research, and system development.</p>
                <a href="#">Email Department</a>
            </div>

            {/* <!-- EMC --> */}
            <div className={styles["contact-card"]}>
                <img src="/assets/images/logos/emc_logo.jpg" alt="EMC Logo" />
                <h3>Entertainment & Multimedia Computing</h3>
                <p>Creative technology program combining design, media, and computing.</p>
                <a href="https://fatima.edu.ph/bachelor-of-science-in-entertainment-and-multimedia-computing-major-in-digital-animation-technology/" target="_blank">
                    Program Details
                </a>
            </div>
        </div>
    </section>
    </>
  )
}

export default Contact