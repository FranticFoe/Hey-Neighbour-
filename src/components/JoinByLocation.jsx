import { useEffect, useState, useContext } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import GoogleMapDisplay from "./GoogleMapDisplay";
import JoinConfirmModal from "./JoinConfirmModal";
import JoinStatusModal from "./JoinStatusModal";
import { NotificationContext } from "./NotificationProvider";

export default function JoinCommunityMap({ show, onHide }) {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [joinResponse, setJoinResponse] = useState(null);
    const [notificationStatus, setNotificationStatus] = useState('show')
    const { currentUser } = useContext(AuthContext);
    const { triggerRefresh } = useContext(NotificationContext);

    useEffect(() => {
        if (show) {
            handleJoinByLocation();
        }
    }, [show]);

    const handleJoinByLocation = async () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                try {
                    const response = await axios.get(
                        "https://neighbour-api.vercel.app/neighbour/availableCommunities/location"
                    );
                    setCommunities(response.data.communities || []);
                } catch (error) {
                    console.error("Error fetching communities:", error);
                    setError("Failed to load nearby communities. Please try again.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setError("Unable to retrieve your location. Please enable location services.");
                setLoading(false);
            }
        );
    };

    const handleJoinCommunity = (communityName) => {
        setSelectedCommunity(communityName);
        setShowConfirm(true);
    };

    const confirmJoinCommunity = async () => {
        try {
            await axios.post(
                "https://neighbour-api.vercel.app/neighbour/join/request",
                {
                    username: currentUser.displayName,
                    community_name: selectedCommunity,
                }
            );
            triggerRefresh()
            setJoinResponse('success');
        } catch (err) {
            console.error("Error joining community:", err);
            if (err.response?.data?.message === 'You have already sent a join request.') {
                setJoinResponse('already_sent');
            } else {
                setJoinResponse('failed');
            }
        } finally {
            setShowConfirm(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        handleJoinByLocation();
    };

    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                size="xl"
                centered
                className="join-community-modal"
            >
                <Modal.Header className="bg-primary text-white border-0">
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.2em' }}>🗺️</span>
                        <span>Discover Nearby Communities</span>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-0">
                    {loading ? (
                        <div className="d-flex flex-column align-items-center justify-content-center p-5">
                            <Spinner
                                animation="border"
                                variant="primary"
                                style={{ width: '3rem', height: '3rem' }}
                            />
                            <p className="mt-3 text-muted">Finding communities near you...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4">
                            <Alert variant="danger" className="d-flex align-items-center">
                                <span className="me-2">⚠️</span>
                                <div className="flex-grow-1">
                                    <strong>Location Error</strong>
                                    <br />
                                    {error}
                                </div>
                            </Alert>
                            <div className="text-center">
                                <Button variant="primary" onClick={handleRetry}>
                                    <span className="me-2">🔄</span>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="position-relative">
                                <GoogleMapDisplay
                                    userLocation={userLocation}
                                    communities={communities}
                                    onJoinCommunity={handleJoinCommunity}
                                />

                                {/* Floating info card */}
                                <div
                                    className="position-absolute top-0 end-0 m-3 bg-white rounded shadow-sm border"
                                    style={{
                                        zIndex: 1000,
                                        maxWidth: '280px',
                                        backdropFilter: 'blur(10px)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                    }}
                                >
                                    {notificationStatus === 'show' && (
                                        <div className="p-3">
                                            <div className="d-flex justify-content-between  py-2 ">
                                                <h6 className="mb-2 d-flex align-items-center gap-2">
                                                    <span>🏘️</span>
                                                    <span>Communities Found</span>
                                                </h6>
                                                <i
                                                    className="bi bi-x cursor-pointer fs-4"
                                                    style={{ transform: "translateY(-15px) " }}
                                                    onClick={() => setNotificationStatus('hide')}
                                                ></i>
                                            </div>

                                            <div className="mb-2">
                                                <span className="badge bg-primary fs-6">
                                                    {communities.length} nearby
                                                </span>
                                            </div>
                                            <small className="text-muted">
                                                Click on map markers to join a community
                                            </small>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Community list section */}
                            {communities.length > 0 && (
                                <div className="p-4 bg-light border-top">
                                    <h6 className="mb-3 d-flex align-items-center gap-2">
                                        📋 <span>Available Communities</span>
                                    </h6>
                                    <div className="row g-2">
                                        {communities.map((community, index) => (
                                            <div key={community.community_name} className="col-md-6 col-lg-4">
                                                <div
                                                    className="card h-100 border-0 shadow-sm hover-shadow"
                                                    style={{
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => handleJoinCommunity(community.community_name)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                    }}
                                                >
                                                    <div className="card-body p-3 text-center">
                                                        <div className="mb-2">
                                                            <span
                                                                className="badge rounded-pill text-white"
                                                                style={{
                                                                    backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                #{index + 1}
                                                            </span>
                                                        </div>
                                                        <h6 className="card-title mb-2 text-truncate">
                                                            {community.community_name}
                                                        </h6>
                                                        <small className="text-muted">
                                                            Click to join
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer className="border-0 bg-light">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <small className="text-muted">
                            {!loading && !error && communities.length > 0 && (
                                <span>💡 Tip: Click map markers for quick access</span>
                            )}
                        </small>
                        <Button variant="outline-secondary" onClick={onHide}>
                            <span className="me-1">✕</span>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal >

            <JoinConfirmModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={confirmJoinCommunity}
                communityName={selectedCommunity}
            />

            <JoinStatusModal
                show={!!joinResponse}
                onHide={() => setJoinResponse(null)}
                status={joinResponse}
                communityName={selectedCommunity}
            />
        </>
    );
}