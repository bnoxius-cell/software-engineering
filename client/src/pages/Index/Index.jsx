import React from 'react'
import styles from './Index.module.css'
import backgroundImage from '../../assets/images/homeBackgroundImg.png'

const Index = () => {
  return (
    <>
    <section className={styles.hero}>
        <div className={styles["hero-box"]}>
            <div className={styles["hero-text"]}>
                <h1>Welcome to EMC Artisan E-Portfolio</h1>
                <p>Explore the artistic creations of EMC students.</p>
                {/* Gallery Preview */}             
                <a href="/pages/gallery.html" className={styles["button-link"]}>
                    <button className={styles.button}>
                        <svg className={styles.svgIcon} viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
                        </svg>
                        Explore
                    </button>
                </a>
            </div>
            <div className={styles["hero-image"]}>
                <img src={backgroundImage} alt="Featured Art"/>
            </div>
        </div>
    </section>

    <section className={styles["gallery-preview"]}>
        <h2>Recent Works</h2>
        <div className={styles["artwork-grid"]}>

            {/* TODO: Hardcoded images; fix later */}
            <div className={styles.card}>
                <img src="sampleArt_1.jpg" alt="Artwork 1" className={styles["card__image"]}/>
                <div className={styles["card__content"]}>
                    <p className={styles["card__title"]}>Artwork 1</p>
                    <p className={styles["card__description"]}>Description for Artwork 1 the goes here.</p>
                    <a href="gallery.html" className={styles["card__button-link"]}><button className={styles["card__button"]}>See more</button></a>
                    <button className={styles["card__button secondary"]}>Share</button>
                </div>
            </div>
            <div className={styles["card"]}>
                <img src="sampleArt_2.jpg" alt="Artwork 2" className={styles["card__image"]}/>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 5H4V19L13.2923 9.70649C13.6828 9.31595 14.3159 9.31591 14.7065 9.70641L20 15.0104V5ZM2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z"></path>
                </svg>
                <div className={styles["card__content"]}>
                    <p className={styles["card__title"]}>Artwork 2</p>
                    <p className={styles["card__description"]}>Description for Artwork 2 goes here.</p>
                    <a href="gallery.html" className={styles["card__button-link"]}><button className={styles["card__button"]}>See more</button></a>
                    <button className={styles["card__button secondary"]}>Share</button>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default Index
