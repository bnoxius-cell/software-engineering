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
    e.target.src = '/assets/images/placeholder-avatar.png';
  };

  return (
    <div className={styles.aboutWrapper}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1>About EMC Artisan</h1>
          <p>Discover the platform, the program, and the institution driving digital innovation.</p>
        </header>

        <section className={styles.infoSection}>
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>🎨</span>
              <h2>The E-Portfolio Platform</h2>
            </div>
            <p>
              EMC Artisan is a centralized digital gallery designed to spotlight the innovative creations of our students. Developed as a core requirement for SOFE311 (Software Engineering), this platform bridges the gap between academic submissions and professional showcasing. It empowers students to curate their 2D/3D art, animations, and UI/UX designs in a visually engaging environment that fosters artistic expression and collaboration.
            </p>
          </div>

          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>💻</span>
              <h2>Entertainment & Multimedia Computing (EMC)</h2>
            </div>
            <p>
              The Bachelor of Science in Entertainment and Multimedia Computing (EMC) is a dynamic program tailored for aspiring digital artisans. It seamlessly blends computing science with creative design, focusing on the development of multimedia content, digital animation, game development, and interactive applications. The curriculum is built to equip students with both the technical prowess and artistic vision required to thrive in the modern digital entertainment industry.
            </p>
          </div>

          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>🏛️</span>
              <h2>Our Lady of Fatima University</h2>
            </div>
            <p>
              Our Lady of Fatima University (OLFU) is a premier educational institution committed to academic excellence, continuous innovation, and the holistic development of its students. With a strong foundation across various disciplines including technology and computer studies, OLFU empowers its learners to become highly competent professionals. The university fosters a culture of resilience and compassion, ensuring every Fatimanian is prepared to "Rise to the Top."
            </p>
          </div>
        </section>

        <section className={styles.teamSection}>
          <h2>Meet the Developers</h2>
          <div className={styles.teamGrid}>
            {developers.map((dev) => (
              <div key={dev.name} className={styles.teamCard}>
                <img
                  src={dev.img}
                  alt={dev.alt}
                  onError={handleImageError}
                  loading="lazy"
                  className={styles.avatar}
                />
                <h3>{dev.name}</h3>
                <p>{dev.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;