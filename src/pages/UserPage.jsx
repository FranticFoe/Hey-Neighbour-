import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../components/AuthProvider";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

const presetBanners = [
    "https://i.pinimg.com/736x/50/13/3f/50133fb8e218ebc3dffa5a08592ee94a.jpg",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/cebd17f1-b283-45e5-8600-6ec3edc558fd/dee2aqv-222532a7-8676-4788-b8e3-08d4f5be55e2.png/v1/fill/w_1280,h_640,q_80,strp/profile_banner_by_darkfigure4_dee2aqv-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjQwIiwicGF0aCI6IlwvZlwvY2ViZDE3ZjEtYjI4My00NWU1LTg2MDAtNmVjM2VkYzU1OGZkXC9kZWUyYXF2LTIyMjUzMmE3LTg2NzYtNDc4OC1iOGUzLTA4ZDRmNWJlNTVlMi5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.sdy7FtZ92V4tHXX-hTf0PupZmkD7CQoG-BkmOY0_mQg",
    "https://res.cloudinary.com/omaha-code/image/upload/ar_4:3,c_fill,dpr_1.0,e_art:quartz,g_auto,h_396,q_auto:best,t_Linkedin_official,w_1584/v1561576558/mountains-1412683_1280.png",
    "https://www.athero.org.au/fh/wp-content/uploads/default-banner.png"
];

export default function UserPage() {
    const url = "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev";
    const { currentUser } = useContext(AuthContext);
    const username = currentUser?.displayName;
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [newBanner, setNewBanner] = useState(null);
    const [uploading, setUploading] = useState(false);

    function formatDate(isoDate) {
        const d = new Date(isoDate);
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await axios.get(`${url}/neighbour/profile/${username}`);
                setProfileData(res.data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        if (username) fetchProfile();
    }, [username]);

    async function handleSaveChanges() {
        setUploading(true);
        try {
            let imageUrl = null;
            if (newImage) {
                const imageRef = ref(storage, `profiles/${username}/${newImage.name}`);
                await uploadBytes(imageRef, newImage);
                imageUrl = await getDownloadURL(imageRef);

                await axios.put(`${url}/neighbour/profile/image`, {
                    username,
                    imageUrl,
                });
            }

            if (newBanner) {
                await axios.put(`${url}/neighbour/profile/banner`, {
                    username,
                    bannerUrl: newBanner,
                });
            }

            await axios.put(`${url}/neighbour/profile/info`, {
                username,
                profile_name: newName,
                profile_description: newDescription,
            });

            const res = await axios.get(`${url}/neighbour/profile/${username}`);
            setProfileData(res.data);
            setShowModal(false);
            setNewImage(null);
            setPreviewImage(null);
            setNewBanner(null);
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert("Failed to update profile.");
        } finally {
            setUploading(false);
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const bannerRef = ref(storage, `banners/${username}/${file.name}`);
            await uploadBytes(bannerRef, file);
            const uploadedUrl = await getDownloadURL(bannerRef);
            setNewBanner(uploadedUrl);
        } catch (err) {
            console.error("Failed to upload banner:", err);
            alert("Failed to upload banner image.");
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
                <p className="loading-text">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">Oops! Something went wrong</h3>
                <p className="error-message">{error}</p>
                <button className="retry-btn" onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    if (!profileData || !profileData.profile || profileData.profile.length === 0) {
        return (
            <div className="error-container">
                <div className="error-icon">👤</div>
                <h3 className="error-title">Profile Not Found</h3>
                <p className="error-message">We couldn't find your profile. Please try refreshing the page.</p>
            </div>
        );
    }

    const profile = profileData.profile[0];
    const bannerUrl = profile.banner_image_url;
    const defaultPic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

    return (
        <>
            <div className="profile-container">
                {/* Banner Section */}
                <div className="banner-section">
                    <div className="banner-wrapper">
                        <img
                            src={bannerUrl || presetBanners[3]}
                            alt="Profile Banner"
                            className="banner-image"
                        />
                        <div className="banner-overlay"></div>
                        <div className="banner-gradient"></div>
                    </div>

                    {/* Profile Picture */}
                    <div className="profile-picture-wrapper">
                        <div className="profile-picture-container">
                            <img
                                src={profile.profile_image_url || defaultPic}
                                alt="Profile Picture"
                                className="profile-picture"
                            />
                            <div className="profile-picture-ring"></div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <button
                        className="edit-profile-btn"
                        onClick={() => {
                            setNewName(profile.profile_name || "");
                            setNewDescription(profile.profile_description || "");
                            setShowModal(true);
                        }}
                    >
                        <span className="edit-icon">✏️</span>
                        <span>Edit Profile</span>
                    </button>
                </div>

                {/* Profile Info Section */}
                <div className="profile-info-section">
                    <div className="profile-header">
                        <div className="profile-names">
                            <h1 className="profile-name">{profile.profile_name}</h1>
                            <p className="username">@{profile.username}</p>
                        </div>
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-icon">📅</span>
                                <span className="stat-text">Joined {formatDate(profile.joined_date)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-description">
                        {profile.profile_description ? (
                            <p className="description-text">{profile.profile_description}</p>
                        ) : (
                            <p className="description-placeholder">
                                <span className="placeholder-icon">✨</span>
                                This neighbor hasn't shared their story yet.
                            </p>
                        )}
                    </div>

                    <div className="profile-actions">
                        <button className="action-btn primary">
                            <span className="btn-icon">💬</span>
                            <span>Send Message</span>
                        </button>
                        <button className="action-btn secondary">
                            <span className="btn-icon">👋</span>
                            <span>Wave Hello</span>
                        </button>
                        <button className="action-btn tertiary">
                            <span className="btn-icon">⚐</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <span className="modal-icon">✨</span>
                                Edit Your Profile
                            </h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Profile Name */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">👤</span>
                                    Profile Name
                                </label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter your display name"
                                    className="form-input"
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📝</span>
                                    About You
                                </label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Tell your neighbors about yourself..."
                                    className="form-textarea"
                                    rows={4}
                                />
                            </div>

                            {/* Profile Picture */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📸</span>
                                    Profile Picture
                                </label>
                                <div className="upload-section">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="file-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="upload-btn"
                                    >
                                        <span className="upload-icon">📁</span>
                                        <span>Choose New Picture</span>
                                    </button>
                                </div>

                                {previewImage && (
                                    <div className="preview-container">
                                        <div className="preview-header">
                                            <span className="preview-icon">✅</span>
                                            <span>New picture selected</span>
                                        </div>
                                        <img src={previewImage} alt="Preview" className="preview-image" />
                                    </div>
                                )}
                            </div>

                            {/* Banner Selection */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🖼️</span>
                                    Cover Banner
                                </label>

                                <div className="banner-presets">
                                    {presetBanners.map((banner, idx) => (
                                        <div
                                            key={idx}
                                            className={`preset-banner ${newBanner === banner ? 'selected' : ''}`}
                                            onClick={() => setNewBanner(banner)}
                                        >
                                            <img src={banner} alt={`Banner ${idx + 1}`} />
                                            {newBanner === banner && (
                                                <div className="selection-indicator">
                                                    <span>✓</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="upload-section">
                                    <input
                                        ref={bannerInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        className="file-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="upload-btn secondary"
                                    >
                                        <span className="upload-icon">🎨</span>
                                        <span>Upload Custom Banner</span>
                                    </button>
                                </div>

                                {newBanner && !presetBanners.includes(newBanner) && (
                                    <div className="preview-container">
                                        <div className="preview-header">
                                            <span className="preview-icon">✅</span>
                                            <span>Custom banner selected</span>
                                        </div>
                                        <img src={newBanner} alt="Custom Banner" className="preview-banner" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="modal-btn secondary"
                                onClick={() => setShowModal(false)}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={handleSaveChanges}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">💾</span>
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .profile-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                    position: relative;
                }

                .banner-section {
                    position: relative;
                    height: 280px;
                }

                .banner-wrapper {
                    position: relative;
                    height: 220px;
                    overflow: hidden;
                }

                .banner-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .banner-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.2);
                }

                .banner-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 100px;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
                }

                .profile-picture-wrapper {
                    position: absolute;
                    bottom: 0;
                    left: 2rem;
                    transform: translateY(50%);
                }

                .profile-picture-container {
                    position: relative;
                }

                .profile-picture {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 4px solid white;
                    object-fit: cover;
                    background: white;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                }

                .profile-picture-ring {
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    z-index: -1;
                    animation: pulse 3s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }

                .edit-profile-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #2d3748;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .edit-profile-btn:hover {
                    background: white;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .profile-info-section {
                    padding: 4rem 2rem 2rem;
                }

                .profile-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .profile-names {
                    flex: 1;
                }

                .profile-name {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin: 0 0 0.5rem 0;
                    line-height: 1.2;
                }

                .username {
                    font-size: 1.1rem;
                    color: #718096;
                    margin: 0;
                    font-weight: 500;
                }

                .profile-stats {
                    display: flex;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: #f7fafc;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    color: #4a5568;
                    font-weight: 500;
                }

                .stat-icon {
                    font-size: 1rem;
                }

                .profile-description {
                    margin-bottom: 2rem;
                }

                .description-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #4a5568;
                    margin: 0;
                }

                .description-placeholder {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                    color: #a0aec0;
                    margin: 0;
                    font-style: italic;
                }

                .placeholder-icon {
                    font-size: 1.1rem;
                }

                .profile-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }

                .action-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                }

                .action-btn.secondary {
                    background: #f7fafc;
                    color: #4a5568;
                    border: 1px solid #e2e8f0;
                }

                .action-btn.secondary:hover {
                    background: #edf2f7;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .action-btn.tertiary {
                    background: #f7fafc;
                    color: #4a5568;
                    border: 1px solid #e2e8f0;
                    width: 48px;
                    justify-content: center;
                }

                .action-btn.tertiary:hover {
                    background: #fed7d7;
                    color: #e53e3e;
                    border-color: #feb2b2;
                }

                .btn-icon {
                    font-size: 1.1rem;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-container {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
                    animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .modal-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin: 0;
                }

                .modal-icon {
                    font-size: 1.3rem;
                }

                .modal-close-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .modal-body {
                    padding: 2rem;
                    max-height: 60vh;
                    overflow-y: auto;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                }

                .label-icon {
                    font-size: 1.1rem;
                }

                .form-input,
                .form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: #f7fafc;
                }

                .form-input:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .upload-section {
                    margin-bottom: 1rem;
                }

                .file-input {
                    display: none;
                }

                .upload-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .upload-btn.secondary {
                    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                }

                .upload-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
                }

                .upload-icon {
                    font-size: 1.1rem;
                }

                .preview-container {
                    background: #f0fff4;
                    border: 1px solid #9ae6b4;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }

                .preview-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 0.5rem;
                    color: #2f855a;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .preview-icon {
                    font-size: 1rem;
                }

                .preview-image {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .preview-banner {
                    width: 100%;
                    height: 80px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .banner-presets {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .preset-banner {
                    position: relative;
                    height: 80px;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .preset-banner:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .preset-banner.selected {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
                }

                .preset-banner img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .selection-indicator {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(102, 126, 234, 0.9);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.9rem;
                    backdrop-filter: blur(10px);
                }

                .modal-footer {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem 2rem;
                    border-top: 1px solid #e2e8f0;
                    background: #f7fafc;
                    justify-content: flex-end;
                }

                .modal-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    min-width: 120px;
                    justify-content: center;
                }

                .modal-btn.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }

                .modal-btn.primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                }

                .modal-btn.secondary {
                    background: white;
                    color: #4a5568;
                    border: 1px solid #e2e8f0;
                }

                .modal-btn.secondary:hover {
                    background: #f7fafc;
                    transform: translateY(-1px);
                }

                .modal-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .btn-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Loading States */
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    gap: 2rem;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .loading-spinner {
                    position: relative;
                }

                .spinner {
                    width: 60px;
                    height: 60px;
                    border: 3px solid rgba(102, 126, 234, 0.1);
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-text {
                    font-size: 1.1rem;
                    color: #667eea;
                    font-weight: 500;
                    margin: 0;
                }

                /* Error States */
                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    gap: 1.5rem;
                    text-align: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .error-icon {
                    font-size: 4rem;
                    opacity: 0.7;
                }

                .error-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0;
                }

                .error-message {
                    font-size: 1.1rem;
                    color: #718096;
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }

                .retry-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }

                .retry-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .profile-container {
                        margin: 0 1rem;
                        border-radius: 16px;
                    }

                    .banner-section {
                        height: 240px;
                    }

                    .banner-wrapper {
                        height: 180px;
                    }

                    .profile-picture {
                        width: 100px;
                        height: 100px;
                    }

                    .profile-info-section {
                        padding: 3rem 1.5rem 2rem;
                    }

                    .profile-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .profile-name {
                        font-size: 1.75rem;
                    }

                    .profile-actions {
                        justify-content: center;
                        width: 100%;
                    }

                    .action-btn {
                        flex: 1;
                        min-width: 0;
                    }

                    .action-btn.tertiary {
                        flex: 0 0 48px;
                    }

                    .modal-container {
                        margin: 1rem;
                        max-height: calc(100vh - 2rem);
                    }

                    .modal-body {
                        padding: 1.5rem;
                        max-height: calc(100vh - 200px);
                    }

                    .banner-presets {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .modal-footer {
                        padding: 1rem 1.5rem;
                        flex-direction: column;
                    }

                    .modal-btn {
                        width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .profile-picture-wrapper {
                        left: 1rem;
                    }

                    .profile-picture {
                        width: 80px;
                        height: 80px;
                    }

                    .edit-profile-btn {
                        top: 0.5rem;
                        right: 0.5rem;
                        padding: 8px 16px;
                        font-size: 0.85rem;
                    }

                    .profile-name {
                        font-size: 1.5rem;
                    }

                    .username {
                        font-size: 1rem;
                    }

                    .profile-actions {
                        flex-direction: column;
                    }

                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .banner-presets {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}