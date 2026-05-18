import React, { useEffect, useState, useRef } from 'react';
import styles from './Upload.module.css';
import { useNavigate } from 'react-router-dom';
import { ARTWORK_CATEGORIES } from '../../constants/artworkCategories';
import PendingApprovalModal from '../../components/PendingApprovalModal/PendingApprovalModal';
import '../../styles/mainstarsbackground.css';

const StarsBackground = () => (
  <div className="starsContainer">
    <div className="stars"></div>
    <div className="stars2"></div>
    <div className="stars3"></div>
  </div>
);

const Upload = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewMediaType, setPreviewMediaType] = useState('image');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
    const thumbnailInputRef = useRef(null);

    const [isUploading, setIsUploading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false); // NEW: state for pending approval modal
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        medium: 'digital_2d',
        description: '',
        tags: ''
    });

    const [validationErrors, setValidationErrors] = useState({
        file: false,
        title: false,
        description: false,
        tags: false
    });

    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const tagsRef = useRef(null);
    const dropZoneRef = useRef(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
        };
    }, [previewUrl, thumbnailPreviewUrl]);

    // Lock body scroll when modals are open
    useEffect(() => {
        if (showSuccessModal || showPendingModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [showSuccessModal, showPendingModal]);

    const clearFieldError = (field) => {
        setValidationErrors(prev => ({ ...prev, [field]: false }));
    };

    // Reset all form fields after successful upload
    const resetForm = () => {
        // Clear file and preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
        setFile(null);
        setPreviewUrl(null);
        setPreviewMediaType('image');
        setThumbnailFile(null);
        setThumbnailPreviewUrl(null);
        
        // Reset form data
        setFormData({
            title: '',
            medium: 'digital_2d',
            description: '',
            tags: ''
        });
        
        // Clear validation errors
        setValidationErrors({
            file: false,
            title: false,
            description: false,
            tags: false
        });
        
        // Reset file input values (so same file can be re-uploaded)
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {
            file: !file,
            title: !formData.title.trim(),
            description: !formData.description.trim(),
            tags: !formData.tags.trim()
        };
        setValidationErrors(errors);

        if (errors.file) {
            dropZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (errors.title) {
            titleRef.current?.focus();
            titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (errors.description) {
            descriptionRef.current?.focus();
            descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (errors.tags) {
            tagsRef.current?.focus();
            tagsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsUploading(true);

        const submitData = new FormData();
        submitData.append('artworkImage', file);
        if (thumbnailFile) submitData.append('thumbnailImage', thumbnailFile);
        submitData.append('title', formData.title.trim());
        submitData.append('medium', formData.medium);
        submitData.append('description', formData.description.trim());
        submitData.append('tags', formData.tags.trim());

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/artworks/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: submitData
            });
            if (response.ok) {
                resetForm();                // Clear all fields
                setShowSuccessModal(true); // Show success modal
            } else {
                const errorData = await response.json();
                // Check if error is due to pending account approval
                if (response.status === 403 && errorData.message?.toLowerCase().includes('pending admin approval')) {
                    setShowPendingModal(true);
                } else {
                    alert(`Upload failed: ${errorData.message}`);
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            // Network error or server unreachable
            if (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes('pending admin approval')) {
                setShowPendingModal(true);
            } else {
                alert("Server error. Is your backend running?");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const closeModalAndStay = () => {
        setShowSuccessModal(false);
    };

    const goToGallery = () => {
        setShowSuccessModal(false);
        navigate('/gallery');
    };

    const closePendingModal = () => {
        setShowPendingModal(false);
    };

    // Drag & Drop Handlers
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/'))) {
            processFile(droppedFile);
            clearFieldError('file');
        }
    };
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
            clearFieldError('file');
        }
    };

    const processFile = (file) => {
        setFile(file);
        const isVideo = file.type.startsWith('video/');
        setPreviewMediaType(isVideo ? 'video' : 'image');
        const objectUrl = URL.createObjectURL(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(objectUrl);
        if (!isVideo) {
            setThumbnailFile(null);
            if (thumbnailPreviewUrl) {
                URL.revokeObjectURL(thumbnailPreviewUrl);
                setThumbnailPreviewUrl(null);
            }
        }
    };

    const processThumbnailFile = (file) => {
        if (!file.type.startsWith('image/')) return;
        setThumbnailFile(file);
        if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
        const objectUrl = URL.createObjectURL(file);
        setThumbnailPreviewUrl(objectUrl);
    };
    const handleThumbnailSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processThumbnailFile(selectedFile);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearFieldError(name);
    };

    return (
        <>
            <StarsBackground />
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
                            ref={dropZoneRef}
                            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${validationErrors.file ? styles.errorBorder : ''}`}
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
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                    >
                                        Replace Media
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
                        {validationErrors.file && <p className={styles.errorMessage}>Please upload an artwork file.</p>}
                    </div>

                    {/* RIGHT SIDE: Details Form */}
                    <form className={styles.formSection} onSubmit={handleSubmit} noValidate>
                        <div className={styles.formHeader}>
                            <h2>Publish Artwork</h2>
                            <p>Share your creation with the world. Images and videos are supported. Faculty approval required for the global feed.</p>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Title *</label>
                            <input 
                                ref={titleRef}
                                type="text" 
                                name="title"
                                className={`${styles.input} ${validationErrors.title ? styles.errorInput : ''}`}
                                placeholder="e.g. Cyberpunk Cityscape" 
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                            {validationErrors.title && <p className={styles.errorMessage}>Title is required.</p>}
                        </div>

                        {previewMediaType === 'video' && (
                            <div className={styles.inputGroup}>
                                <label>Video Thumbnail (Optional)</label>
                                <p className={styles.fieldDescription}>Upload a custom image to be shown before the video plays.</p>
                                <input type="file" ref={thumbnailInputRef} onChange={handleThumbnailSelect} accept="image/*" style={{ display: 'none' }} />
                                <div 
                                    className={`${styles.dropZone} ${styles.thumbnailDropZone}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => { e.preventDefault(); processThumbnailFile(e.dataTransfer.files[0]); }}
                                    onClick={() => thumbnailInputRef.current.click()}
                                >
                                    {thumbnailPreviewUrl ? (
                                        <img src={thumbnailPreviewUrl} alt="Thumbnail Preview" className={styles.previewImage} />
                                    ) : (
                                        <div className={styles.dropZoneContent}>
                                            <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                                            </svg>
                                            <h3>Drag & Drop or Click to add a thumbnail</h3>
                                            <p>Recommended: 16:9 aspect ratio</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Medium / Category *</label>
                            <select name="medium" className={styles.select} value={formData.medium} onChange={handleInputChange}>
                                {ARTWORK_CATEGORIES.map(category => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Description & Tools Used *</label>
                            <textarea 
                                ref={descriptionRef}
                                name="description"
                                className={`${styles.textarea} ${validationErrors.description ? styles.errorInput : ''}`}
                                placeholder="Tell us about the process, inspiration, or software used (e.g. Blender, Photoshop)..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                            {validationErrors.description && <p className={styles.errorMessage}>Description is required.</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Tags (Comma separated) *</label>
                            <input 
                                ref={tagsRef}
                                type="text" 
                                name="tags"
                                className={`${styles.input} ${validationErrors.tags ? styles.errorInput : ''}`}
                                placeholder="cyberpunk, neon, concept art" 
                                value={formData.tags}
                                onChange={handleInputChange}
                            />
                            {validationErrors.tags && <p className={styles.errorMessage}>Tags are required.</p>}
                        </div>

                        {/* NEON GREEN THEMED SPACE BUTTON */}
                        <div className={styles.btnContainer}>
                            <button 
                                id="space-btn" 
                                name="space-button" 
                                type="submit"
                                className={styles.spaceButton}
                                disabled={isUploading}
                            >
                                <span>{isUploading ? 'Publishing...' : 'Publish to Portfolio'}</span>
                                <div style={{ position: 'absolute', left: '119.273px', top: '18.0747px', animationDelay: '3.37051s', transform: 'scale(0.196521)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '166.774px', top: '47.4519px', animationDelay: '3.03913s', transform: 'scale(0.33078)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '238.677px', top: '19.6434px', animationDelay: '3.85796s', transform: 'scale(1.29037)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '22.2022px', top: '4.69534px', animationDelay: '4.9415s', transform: 'scale(1.82231)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '206.74px', top: '40.7685px', animationDelay: '1.59195s', transform: 'scale(1.01375)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '241.531px', top: '14.2516px', animationDelay: '1.67616s', transform: 'scale(0.811597)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '14.754px', top: '25.2924px', animationDelay: '0.0348248s', transform: 'scale(0.102529)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '220.444px', top: '43.9803px', animationDelay: '1.5106s', transform: 'scale(0.16088)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '95.948px', top: '54.8942px', animationDelay: '3.18662s', transform: 'scale(1.7822)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '30.3484px', top: '36.5984px', animationDelay: '4.30868s', transform: 'scale(1.16326)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '184.622px', top: '20.0923px', animationDelay: '2.83829s', transform: 'scale(1.27781)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '142.1px', top: '22.3542px', animationDelay: '2.73988s', transform: 'scale(1.62715)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '145.079px', top: '6.97553px', animationDelay: '0.0408754s', transform: 'scale(0.468075)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '6.67886px', top: '38.4849px', animationDelay: '3.84019s', transform: 'scale(0.272217)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '201.17px', top: '39.9168px', animationDelay: '2.93587s', transform: 'scale(0.521258)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '224.215px', top: '42.9903px', animationDelay: '0.895495s', transform: 'scale(0.0458902)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '42.2308px', top: '9.78383px', animationDelay: '4.58407s', transform: 'scale(0.0422065)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '91.2734px', top: '14.0408px', animationDelay: '2.05927s', transform: 'scale(0.11997)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '35.6985px', top: '52.6403px', animationDelay: '3.07343s', transform: 'scale(0.672992)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '76.4191px', top: '48.453px', animationDelay: '2.35679s', transform: 'scale(1.46957)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '184.503px', top: '4.18267px', animationDelay: '1.43409s', transform: 'scale(0.606616)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '221.039px', top: '54.2493px', animationDelay: '2.92356s', transform: 'scale(0.638665)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '185.612px', top: '44.3px', animationDelay: '1.36401s', transform: 'scale(1.65012)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '154.027px', top: '45.9848px', animationDelay: '3.723s', transform: 'scale(1.4118)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '220.591px', top: '4.95194px', animationDelay: '0.363098s', transform: 'scale(0.52369)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '236.028px', top: '11.1663px', animationDelay: '3.67493s', transform: 'scale(0.956478)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '110.241px', top: '20.2684px', animationDelay: '2.94906s', transform: 'scale(1.2193)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '12.602px', top: '19.8836px', animationDelay: '4.072s', transform: 'scale(1.49026)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '30.0911px', top: '37.9746px', animationDelay: '1.02002s', transform: 'scale(1.41008)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '62.3096px', top: '9.64604px', animationDelay: '3.9445s', transform: 'scale(0.231214)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '44.7189px', top: '32.4307px', animationDelay: '4.78921s', transform: 'scale(0.359408)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '191.866px', top: '27.151px', animationDelay: '1.34451s', transform: 'scale(1.13484)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '47.6744px', top: '3.00604px', animationDelay: '1.04567s', transform: 'scale(0.682023)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '98.6225px', top: '49.6115px', animationDelay: '2.41384s', transform: 'scale(1.96254)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '57.4785px', top: '29.6588px', animationDelay: '3.3569s', transform: 'scale(1.53118)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '13.2213px', top: '24.538px', animationDelay: '1.69582s', transform: 'scale(1.6236)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '131.656px', top: '31.1837px', animationDelay: '1.29918s', transform: 'scale(1.84486)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '56.9067px', top: '51.9904px', animationDelay: '4.74375s', transform: 'scale(0.749788)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '82.8361px', top: '54.3876px', animationDelay: '1.28648s', transform: 'scale(0.566118)' }} className={styles.star}></div>
                                <div style={{ position: 'absolute', left: '193.213px', top: '43.9428px', animationDelay: '0.390178s', transform: 'scale(1.411)' }} className={styles.star}></div>
                                <div style={{ animationDelay: '1.2122s' }} className={`${styles.shootingStar} ${styles.shootingStar1}`}></div>
                                <div style={{ animationDelay: '0.777895s' }} className={`${styles.shootingStar} ${styles.shootingStar2}`}></div>
                                <div style={{ animationDelay: '4.90483s' }} className={`${styles.shootingStar} ${styles.shootingStar3}`}></div>
                                <div style={{ animationDelay: '3.66012s' }} className={`${styles.shootingStar} ${styles.shootingStar4}`}></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.successModal}>
                        <div className={styles.modalIcon}>✓</div>
                        <h3>Artwork Successfully Submitted!</h3>
                        <p>Your artwork has been uploaded and will be reviewed by faculty. You'll receive a notification once it's approved.</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.galleryBtn} onClick={goToGallery}>
                                Go to Gallery
                            </button>
                            <button className={styles.doneBtn} onClick={closeModalAndStay}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PENDING APPROVAL MODAL */}
            <PendingApprovalModal 
                isOpen={showPendingModal}
                onClose={closePendingModal}
                actionName="upload artwork"
            />
        </>
    );
};

export default Upload;