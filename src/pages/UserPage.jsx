import axios from "axios";
import {
    Button,
    Spinner,
    Modal,
    Form,
    Row,
    Col,
    Image,
} from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/AuthProvider";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import 'bootstrap-icons/font/bootstrap-icons.css';

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

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [newBanner, setNewBanner] = useState(null);

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
        console.log("newBanner", newBanner)
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
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert("Failed to update profile.");
        }
    }

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <p>{error}</p>;
    if (!profileData || !profileData.profile || profileData.profile.length === 0)
        return <p>No profile found.</p>;

    const profile = profileData.profile[0];
    const bannerUrl = profile.banner_image_url;
    const defaultPic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

    return (
        <Col sm={8} className="mx-auto bg-light" style={{ border: "1px solid lightgrey" }}>
            <div style={{ position: "relative", height: "240px" }}>
                {/* Banner Image */}
                <Image
                    src={bannerUrl || presetBanners[3]}
                    fluid
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />

                {/* Profile Image overlapping banner & card */}
                <Image
                    src={profile.profile_image_url || defaultPic}
                    roundedCircle
                    style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        border: "4px solid white",
                        backgroundColor: "#fff",
                        position: "absolute",
                        bottom: -60, // moves image halfway out of the banner
                        left: "8%",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                        marginBottom: 35
                    }}
                />
            </div>

            <Row className="justify-content-end mt-2">
                <Col xs="auto">
                    <Button
                        className="rounded-pill me-3"
                        variant="outline-secondary"
                        onClick={() => {
                            setNewName(profile.profile_name || "");
                            setNewDescription(profile.profile_description || "");
                            setShowModal(true);
                        }}
                    >
                        Edit Profile
                    </Button>
                </Col>
            </Row>

            <div className="p-3 mt-1" style={{ position: "relative", paddingTop: "10px" }}>

                {/* User Info */}
                <h5 className="mt-3" style={{ marginBottom: 0, marginLeft: 10 }}>
                    {profile.profile_name}
                </h5>
                <p className="text-muted" style={{ marginLeft: 10 }}>
                    @{profile.username}
                </p>
                <p style={{ marginLeft: 10 }}>{profile.profile_description || "This user hasn't written anything about themselves yet."}</p>
                <p className="text-muted" style={{ marginLeft: 10 }}>
                    <i className="bi bi-calendar3"></i> Joined: {new Date(profile.joined_date).toLocaleDateString()}
                </p>
            </div>


            {/* Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Profile Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formDescription" className="mt-3">
                            <Form.Label>Profile Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formImage" className="mt-3">
                            <Form.Label>Profile Image</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setNewImage(file);
                                    if (file) {
                                        setPreviewImage(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </Form.Group>


                        {previewImage && (
                            <div className="mt-2">
                                <div
                                    className="p-2 mt-2 bg-secondary text-white rounded"
                                    role="alert"
                                    style={{ fontSize: "0.9rem" }}
                                >
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        <span>Image selected : </span>
                                    </div>

                                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                        <Image
                                            src={previewImage}
                                            fluid
                                            style={{ maxHeight: 100, borderRadius: 8, border: "3px solid white" }}
                                            className="mx-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Form.Group controlId="formBanner" className="mt-3">
                            <Form.Label>Choose a Banner</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {presetBanners.map((banner, idx) => (
                                    <Image
                                        key={idx}
                                        src={banner}
                                        thumbnail
                                        style={{
                                            width: 100,
                                            height: 60,
                                            objectFit: "cover",
                                            cursor: "pointer",
                                            border: newBanner === banner ? "2px solid #007bff" : "1px solid #ccc",
                                        }}
                                        onClick={() => setNewBanner(banner)}
                                    />
                                ))}
                            </div>

                            <Form.Control
                                className="mt-2"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    try {
                                        const bannerRef = ref(storage, `banners/${username}/${file.name}`);
                                        await uploadBytes(bannerRef, file);
                                        const uploadedUrl = await getDownloadURL(bannerRef);

                                        console.log("Uploaded Banner URL:", uploadedUrl);
                                        setNewBanner(uploadedUrl)
                                    } catch (err) {
                                        console.error("Failed to upload banner:", err);
                                        alert("Failed to upload banner image.");
                                    }
                                }}
                            />
                            {newBanner && (
                                <div className="mt-2">
                                    <div
                                        className="mt-2 custom-dark-blue"
                                        role="alert"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            <span>Banner selected:</span>
                                        </div>

                                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                            <Image
                                                src={newBanner}
                                                fluid
                                                style={{ maxHeight: 100, borderRadius: 8, border: "3px solid white" }}
                                                className="mx-1"

                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Col>
    );
}
