import React from 'react';
import styles from './Contact.module.css';

const Contact = () => {
  const contacts = [
    {
      name: 'Our Lady of Fatima University',
      description: 'Official institution supporting academic excellence and innovation.',
      link: 'https://fatima.edu.ph',
      img: '/assets/images/logos/olfu_logo.png',
      alt: 'OLFU Logo',
    },
    {
      name: 'Department of Computer Science',
      description: 'Focused on software engineering, computing research, and system development.',
      link: 'https://fatima.edu.ph/bachelor-of-science-in-computer-science/',
      img: '/assets/images/logos/ccs_logo.jpg',
      alt: 'Computer Science Logo',
    },
    {
      name: 'Entertainment & Multimedia Computing',
      description: 'Creative technology program combining design, media, and computing.',
      link: 'https://fatima.edu.ph/bachelor-of-science-in-entertainment-and-multimedia-computing-major-in-digital-animation-technology/',
      img: '/assets/images/logos/emc_logo.jpg',
      alt: 'EMC Logo',
    },
  ];

  const handleImageError = (e) => {
    e.target.src = '/assets/images/placeholder-logo.png'; // fallback image
  };

  return (
    <div className={styles['contact-wrapper']}>
      <section className={styles['page-header']}>
        <div className={styles['header-content']}>
          <h1>Contact Us</h1>
          <p>Get in touch with the departments and institutions behind the EMC Artisan project.</p>
        </div>
      </section>

      <section className={styles['contact-section']}>
        <div className={styles['contact-grid']}>
          {contacts.map((contact, idx) => (
            <div key={contact.name} className={styles['contact-card']}>
              <img
                src={contact.img}
                alt={contact.alt}
                onError={handleImageError}
                loading="lazy"
              />
              <h3>{contact.name}</h3>
              <p>{contact.description}</p>
              <a
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${contact.name} website`}
              >
                Program Details
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;