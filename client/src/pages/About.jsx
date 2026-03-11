import React from 'react'

const About = () => {
  return (
    <>
    {/* Hero Section */}
    <section className="hero">
        <h1>About EMC Artisan</h1>
        <p>EMC Artisan is a digital gallery that showcases the creative works from students of Entertainment and Multimedia Computing(EMC) Section of Our Lady of Fatima University
        Explore various digital arts, paintings, photography, and more — all in one interactive and neon-themed platform!</p>
    </section>

    {/* Developer Team Section */}
    <section className="team-section">
        <h2>Meet the Developers</h2>
        <div className="team-grid">
            <div className="team-card">
                <img src="tony_img.jpg" alt="Developer 1" />
                <h3>Tony Kishore</h3>
                <p>Frontend & Design</p>
            </div>
            <div className="team-card">
                <img src="adrian_img.jpg" alt="Developer 2" />
                <h3>Adrian Reniva</h3>
                <p>Backend & Database</p>
            </div>
            <div className="team-card">
                <img src="ronda_img.jpg" alt="Developer 3" />
                <h3>Patrick Ronda</h3>
                <p>Project Manager & Testing</p>
            </div>
        </div>
    </section>

    {/* Project Description */}
    <section className="project-desc">
        <h2>About the Project</h2>
        <p>
            EMC Artisan is a web-based project developed as a course requirement for SOFE311 (Software Engineering) under the Bachelor of Science in Computing (BSCS) program. 
            The system is designed to provide a centralized and visually engaging platform for students to display their creative works. 
            It supports artistic expression, collaboration, and accessibility through features such as a dynamic gallery, search functionality, and interactive user interface elements.
        </p>
    </section>
    </>
  )
}

export default About