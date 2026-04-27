import React from 'react';
import styles from './Contact.module.css';

const Contact = () => {
  return (
    <div className={styles.contactWrapper}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1>Contact Us</h1>
          <p>Get in touch with our departments and OLFU campus offices.</p>
        </header>

        <section className={styles.contactGrid}>
          {/* Card 1: Campus Locations */}
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3>📍 Campus Locations</h3>
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.locationBlock}>
                <strong>OLFU Main Campus:</strong>
                <p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=120+MacArthur+Highway,+Valenzuela+City,+1440+Metro+Manila" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#a1ff14', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                  >
                    120 MacArthur Highway, Valenzuela City, 1440 Metro Manila
                  </a>
                </p>
              </div>
              <div className={styles.locationBlock}>
                <strong>Tamaraw Campus:</strong>
                <p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Tamaraw+Hills,+MacArthur+Highway,+Valenzuela+City" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#a1ff14', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                  >
                    Tamaraw Hills, MacArthur Highway, Valenzuela City
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Front Desk */}
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3>📞 Front Desk Inquiries</h3>
            </div>
            <div className={styles.contactInfo}>
              <p className={styles.desc}>For university admissions, registrar, and general inquiries.</p>
              <ul className={styles.contactList}>
                <li><strong>Phone:</strong> +63 (02) 8291-6538</li>
                <li><strong>Mobile:</strong> +63 917-123-4567</li>
                <li><strong>Email:</strong> info@fatima.edu.ph</li>
              </ul>
            </div>
          </div>

          {/* Card 3: CCS Contacts */}
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3>🖥️ College of Computer Studies</h3>
            </div>
            <div className={styles.contactInfo}>
              <p className={styles.desc}>For inquiries regarding BSCS, BSIT, and general computing programs.</p>
              <ul className={styles.contactList}>
                <li><strong>Dean's Office:</strong> loc. 204</li>
                <li><strong>Direct Line:</strong> +63 (02) 8291-1234</li>
                <li><strong>Email:</strong> ccs.inquiries@fatima.edu.ph</li>
              </ul>
            </div>
          </div>

          {/* Card 4: EMC Contacts */}
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3>🎮 EMC Department</h3>
            </div>
            <div className={styles.contactInfo}>
              <p className={styles.desc}>For EMC program-specific concerns, academic advising, and lab inquiries.</p>
              <ul className={styles.contactList}>
                <li><strong>Department Head:</strong> loc. 205</li>
                <li><strong>Lab Support:</strong> emc.labs@fatima.edu.ph</li>
                <li><strong>Email:</strong> emc.dept@fatima.edu.ph</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;