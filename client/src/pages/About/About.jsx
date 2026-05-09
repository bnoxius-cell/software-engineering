import React from 'react';
import styles from './About.module.css';

const About = () => {
  // Generate static stars (80 random positions) – improves background depth
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
  }));

  return (
    <div className={styles.aboutWrapper}>
      {/* Animated starfield background */}
      <div className={styles.starsContainer}>
        {stars.map((star) => (
          <div
            key={star.id}
            className={styles.star}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

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
      </div>
    </div>
  );
};

export default About;