import React from 'react'
import styles from './Gallery.module.css'

const Gallery = () => {
  return (
    <>
    <div className={styles["background-animation"]}></div>
    <section className={styles["gallery"]}>
        <div className={styles["container"]}>
            {/*<!-- Gallery Header with Filter Button -->*/}
            <div className={styles["gallery-header"]}>
                <h1>Gallery</h1>
                <button title="filter" className={styles["filter"]}>
                    <svg viewBox="0 0 512 512" height="1em">
                        <path
                            d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"
                        ></path>
                    </svg>
                </button>
            </div>
            
            <div className={styles["artwork-grid"]} id="gallery-container">
                <div className={styles["artwork-card"]}>
                    <img src="artwork1.png" alt="Artwork 1" />
                    <div className={styles["artwork-info"]}>
                        <h3>Hanako</h3>
                        <p>by Jennah Casulla</p>
                        <p>Genre: Digital Art</p>
                    </div>
                </div>

                <div class={styles["artwork-card"]}>
                    <img src="artwork2.png" alt="Artwork 2" />
                    <div class={styles["artwork-info"]}>
                        <h3>Encore</h3>
                        <p>by Jane Smith</p>
                        <p>Genre: Digital Art</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="sampleArt_1.jpg" alt="Midnight Bloom" />
                    <div className={styles["artwork-info"]}>
                        <h3>Shiro from NGNL</h3>
                        <p>by John Rivera</p>
                        <p>Genre: Illustration</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork4.png" alt="Silent Horizon" />
                    <div className={styles["artwork-info"]}>
                        <h3>Silent Horizon</h3>
                        <p>by Jane Smith</p>
                        <p>Genre: Painting</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="photograph.jpg" alt="Neon Dreams" />
                    <div className={styles["artwork-info"]}>
                        <h3>Neon Dreams</h3>
                        <p>by Mark Lee</p>
                        <p>Genre: Photograph</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork5.png" alt="Echoes of Light" />
                    <div className={styles["artwork-info"]}>
                        <h3>Echoes of Light</h3>
                        <p>by Alyssa Cruz</p>
                        <p>Genre: Illustration</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork6.png" alt="Urban Pulse" />
                    <div className={styles["artwork-info"]}>
                        <h3>Urban Pulse</h3>
                        <p>by Daniel Gomez</p>
                        <p>Genre: Botanical Art</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork7.png" alt="Whispering Forest" />
                    <div className={styles["artwork-info"]}>
                        <h3>Clervoia</h3>
                        <p>by Maria Santos</p>
                        <p>Genre: Digital Art</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork7.jpg" alt="Crimson Tide" />
                    <div className={styles["artwork-info"]}>
                        <h3>Crimson Tide</h3>
                        <p>by Kevin Tan</p>
                        <p>Genre: Abstract</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork8.jpg" alt="Fragments" />
                    <div className={styles["artwork-info"]}>
                        <h3>Fragments</h3>
                        <p>by Nina Alvarez</p>
                        <p>Genre: Mixed Media</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork9.jpg" alt="Golden Hour" />
                    <div className={styles["artwork-info"]}>
                        <h3>Golden Hour</h3>
                        <p>by Ethan Park</p>
                        <p>Genre: Photography</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork10.jpg" alt="Celestial Path" />
                    <div className={styles["artwork-info"]}>
                        <h3>Celestial Path</h3>
                        <p>by Sophia Lim</p>
                        <p>Genre: Digital Art</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork11.jpg" alt="Reflections" />
                    <div className={styles["artwork-info"]}>
                        <h3>Reflections</h3>
                        <p>by Aaron Morales</p>
                        <p>Genre: Watercolor</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork12.jpg" alt="Lost Signals" />
                    <div className={styles["artwork-info"]}>
                        <h3>Lost Signals</h3>
                        <p>by Camille Reyes</p>
                        <p>Genre: Concept Art</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork13.jpg" alt="Monochrome City" />
                    <div className={styles["artwork-info"]}>
                        <h3>Monochrome City</h3>
                        <p>by Leo Fernandez</p>
                        <p>Genre: Photography</p>
                    </div>
                </div>

                <div className={styles["artwork-card"]}>
                    <img src="artwork14.jpg" alt="Bloom Cycle" />
                    <div className={styles["artwork-info"]}>
                        <h3>Bloom Cycle</h3>
                        <p>by Patricia Ong</p>
                        <p>Genre: Botanical Art</p>
                    </div>
                </div>

                </div> 

            <div className={styles["pagination-container"]}>
                <div className={styles["tabs"]}>
                    <div className={styles["tab-group"]}>
                        <input type="radio" name="tab" id="tab-1" checked />
                        <label for="tab-1">1</label>
                    </div>
                    <div className={styles["tab-group"]}>
                        <input type="radio" name="tab" id="tab-2" />
                        <label for="tab-2">2</label>
                    </div>
                    <div className={styles["tab-group"]}>
                        <input type="radio" name="tab" id="tab-3" />
                        <label for="tab-3">3</label>
                    </div>
                    <div className={styles["tab-group"]}>
                        <input type="radio" name="tab" id="tab-4" />
                        <label for="tab-4">4</label>
                    </div>
                    <div className={styles["tab-group"]}>
                        <input type="radio" name="tab" id="tab-5" />
                        <label for="tab-5">5</label>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default Gallery