import React, { useEffect, useState, useRef } from 'react';
import styles from './Upload.module.css';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewMediaType, setPreviewMediaType] = useState('image');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const [isUploading, setIsUploading] = useState(false); // New loading state
    const navigate = useNavigate(); // Initialize the navigator

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please upload an artwork first!");

        setIsUploading(true);

        // 1. Create a FormData object to handle the file + text
        const submitData = new FormData();
        
        // Make sure 'artworkImage' matches the name your backend expects (e.g., in multer)
        submitData.append('artworkImage', file); 
        submitData.append('title', formData.title);
        submitData.append('medium', formData.medium);
        submitData.append('description', formData.description);
        submitData.append('tags', formData.tags);

        // Optional: Grab the token if your backend requires authentication to upload
        const token = localStorage.getItem('token'); 

        try {
            // 2. Send the POST request to your backend
            // Adjust the URL if your backend is running on a different port (e.g., http://localhost:5000/api...)
            const response = await fetch('http://localhost:5000/api/artworks/', {
                method: 'POST',
                headers: {
                    // Include the auth token if needed
                    'Authorization': `Bearer ${token}` 
                    // CRITICAL: Do NOT set 'Content-Type': 'multipart/form-data'. 
                    // The browser does this automatically when it sees a FormData object!
                },
                body: submitData
            });

            if (response.ok) {
                const result = await response.json();

                
                // 3. Smoothly redirect the user back to the homepage
                navigate('/'); 
            } else {
                const errorData = await response.json();
                alert(`Upload failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Server error. Is your backend running?");
        } finally {
            setIsUploading(false); // Re-enable the button
        }
    }

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        medium: 'digital_2d',
        description: '',
        tags: ''
    });

    // Handle Drag & Drop Events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/'))) {
            processFile(droppedFile);
        }
    };

    // Handle Click Upload
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    // Create a local URL to preview the image immediately
    const processFile = (file) => {
        setFile(file);
        setPreviewMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <div className="background-fx"></div>

            <div className={styles.pageContainer}>
                <div className={styles.uploadWrapper}>
                    
                    {/* LEFT SIDE: Image Upload & Preview */}
                    <div className={styles.imageSection}>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            accept="image/*,video/*" 
                            style={{ display: 'none' }} 
                        />

                        <div 
                            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !previewUrl && fileInputRef.current.click()}
                        >
                            {previewUrl ? (
                                <>
                                    {previewMediaType === 'video' ? (
                                        <video src={previewUrl} className={styles.previewImage} controls />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                                    )}
                                    <button 
                                        className={styles.changeImageBtn}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents triggering the dropZone click
                                            fileInputRef.current.click();
                                        }}
                                    >
                                        Replace Image
                                    </button>
                                </>
                            ) : (
                                <div className={styles.dropZoneContent}>
                                    <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                                    </svg>
                                    <h3>Drag & Drop your artwork or video</h3>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>or click to browse image and video files</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: Details Form */}
                    <form className={styles.formSection} onSubmit={handleSubmit}>
                        <div className={styles.formHeader}>
                            <h2>Publish Artwork</h2>
                            <p>Share your creation with the world. Images and videos are supported. Faculty approval required for the global feed.</p>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Title</label>
                            <input 
                                type="text" 
                                name="title"
                                className={styles.input} 
                                placeholder="e.g. Cyberpunk Cityscape" 
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Medium / Category</label>
                            <select 
                                name="medium" 
                                className={styles.select}
                                value={formData.medium}
                                onChange={handleInputChange}
                            >
                                <option value="digital_2d">Digital 2D Illustration</option>
                                <option value="3d_model">3D Modeling & Render</option>
                                <option value="traditional">Traditional (Paint, Ink, Pencil)</option>
                                <option value="animation">Animation / Motion Graphics</option>
                                <option value="ui_ux">UI/UX & Web Design</option>
                                <option value="photography">Photography</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Description & Tools Used</label>
                            <textarea 
                                name="description"
                                className={styles.textarea} 
                                placeholder="Tell us about the process, inspiration, or software used (e.g. Blender, Photoshop)..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Tags (Comma separated)</label>
                            <input 
                                type="text" 
                                name="tags"
                                className={styles.input} 
                                placeholder="cyberpunk, neon, concept art" 
                                value={formData.tags}
                                onChange={handleInputChange}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={!file || isUploading} 
                        >
                            {isUploading ? 'Publishing...' : 'Publish to Portfolio'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Upload;
