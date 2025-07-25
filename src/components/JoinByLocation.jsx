import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import { useContext } from "react";

export default function JoinCommunityMap({ show, onHide }) {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [map, setMap] = useState(null);
    const { currentUser } = useContext(AuthContext)

    useEffect(() => {
        const existingScript = document.getElementById("googleMapsScript");

        if (!existingScript) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB9t7gGcJKV4g35C2xDOLFT4zEccZ8GfGk`;
            script.id = "googleMapsScript";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (show) handleJoinByLocation();
            };
            document.body.appendChild(script);
        } else {
            if (show) handleJoinByLocation();
        }
    }, [show]);

    const handleJoinByLocation = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await axios.get(
                        "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev/neighbour/availableCommunities/location"
                    );

                    const communities = response.data.communities;
                    setCommunities(communities);
                    setLoading(false);

                    if (window.google && !map) {
                        const mapInstance = new window.google.maps.Map(
                            document.getElementById("map"),
                            {
                                center: { lat: latitude, lng: longitude },
                                zoom: 14,
                            }
                        );

                        communities.forEach((community) => {
                            const marker = new window.google.maps.Marker({
                                position: {
                                    lat: community.latitude,
                                    lng: community.longitude,
                                },
                                map: mapInstance,
                                title: community.community_name,
                            });

                            const infoWindow = new window.google.maps.InfoWindow({
                                content: `
                                    <div>
                                        <strong>${community.community_name}</strong><br />
                                        <button id="join-${community.community_name}">Join</button>
                                    </div>
                                `,
                            });

                            marker.addListener("click", () => {
                                infoWindow.open(mapInstance, marker);

                                // Delay needed for DOM to be available
                                setTimeout(() => {
                                    const joinButton = document.getElementById(`join-${community.community_name}`);
                                    if (joinButton) {
                                        joinButton.addEventListener("click", () =>
                                            handleJoinCommunity(community.community_name)
                                        );
                                    }
                                }, 100);
                            });
                        });

                        setMap(mapInstance);
                    }
                } catch (error) {
                    console.error("Error joining by location:", error);
                    setLoading(false);
                }
            },
            (error) => {
                alert("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    const handleJoinCommunity = async (community_name) => {
        const confirmJoin = window.confirm(`Do you want to join ${community_name}?`);
        if (!confirmJoin) return;

        try {
            await axios.post(
                "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev/neighbour/join/request",
                {
                    username: currentUser.displayName,
                    community_name,
                }
            );
            alert(`Successfully joined ${community_name}!`);
        } catch (err) {
            console.error("Error joining community:", err);
            alert("Failed to join community.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Nearby Communities</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <>
                        <div
                            id="map"
                            style={{ height: "400px", width: "100%", marginBottom: "1rem" }}
                        ></div>
                        <ul>
                            {communities.map((community) => (
                                <li key={community.community_name}>{community.community_name}</li>
                            ))}
                        </ul>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
