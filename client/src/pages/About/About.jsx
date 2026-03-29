import React from 'react';
import styles from './About.module.css';

const About = () => {
  const developers = [
    {
      name: 'Tony Kishore',
      role: 'Frontend & Design',
      img: '/assets/images/tony_img.jpg',
      alt: 'Tony Kishore - Frontend & Design',
    },
    {
      name: 'Adrian Reniva',
      role: 'Backend & Database',
      img: '/assets/images/adrian_img.jpg',
      alt: 'Adrian Reniva - Backend & Database',
    },
    {
      name: 'Patrick Ronda',
      role: 'Project Manager & Testing',
      img: '/assets/images/ronda_img.jpg',
      alt: 'Patrick Ronda - Project Manager & Testing',
    },
    {
      name: 'John Carlo Lunaria',
      role: 'Testing & Maintenance',
      img: '/assets/images/lunaria_img.png',
      alt: 'John Carlo Lunaria - Testing & Maintenance',
    },
  ];

  const handleImageError = (e) => {
    e.target.src = '/assets/images/placeholder-avatar.png'; // fallback image
  };

  return (
    <div className={styles['about-wrapper']}>
      <section className={styles.hero} aria-label="About EMC Artisan">
        <div className={styles['hero-content']}>
          <h1>About EMC Artisan</h1>
          <p>
            EMC Artisan is a web-based project developed as a course requirement for SOFE311 (Software Engineering) under the Bachelor of Science in Computing (BSCS) program. 
            The system is designed to provide a centralized and visually engaging platform for students to display their creative works. 
            It supports artistic expression, collaboration, and accessibility through features such as a dynamic gallery, search functionality, and interactive user interface elements.
          </p>
        </div>
      </section>

      <section className={styles['team-section']} aria-labelledby="team-heading">
        <h2 id="team-heading">Meet the Developers</h2>
        <div className={styles['team-grid']}>
          {developers.map((dev, idx) => (
            <div key={dev.name} className={styles['team-card']}>
              <img
                src={dev.img}
                alt={dev.alt}
                onError={handleImageError}
                loading="lazy"
              />
              <h3>{dev.name}</h3>
              <p>{dev.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;