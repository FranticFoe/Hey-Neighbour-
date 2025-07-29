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
    // const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    function loadGoogleMaps(apiKey) {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps);
                return;
            }

            const existingScript = document.getElementById("googleMapsScript");
            if (existingScript) {
                existingScript.onload = () => resolve(window.google.maps);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.id = "googleMapsScript";
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.google.maps);
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }


    useEffect(() => {
        if (!show) return;

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        loadGoogleMaps(apiKey)
            .then(() => {
                handleJoinByLocation();
            })
            .catch((err) => {
                console.error("Failed to load Google Maps script:", err);
            });
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
                        "https://neighbour-api.vercel.app/neighbour/availableCommunities/location"
                    );

                    const communities = response.data.communities;
                    setCommunities(communities);
                    setLoading(false);

                    if (window.google && !map) {
                        requestAnimationFrame(() => {
                            const mapDiv = document.getElementById("map");
                            if (!mapDiv) {
                                console.error("Map div not found");
                                return;
                            }

                            const mapInstance = new window.google.maps.Map(mapDiv, {
                                center: { lat: latitude, lng: longitude },
                                zoom: 14,
                            });

                            communities.forEach((community) => {
                                const marker = new window.google.maps.Marker({
                                    position: {
                                        lat: community.latitude,
                                        lng: community.longitude,
                                    },
                                    map: mapInstance,
                                    title: community.community_name,
                                    icon: {
                                        url: `${window.location.origin}/house_Marker.png`,
                                        scaledSize: new window.google.maps.Size(32, 32),
                                    },
                                });

                                const infoWindow = new window.google.maps.InfoWindow({
                                    content: `
    <div style="
      font-family: Arial, sans-serif;
      padding: 8px;
      border-radius: 8px;
      background-color: #fefefe;
      max-width: 200px;
      
      text-align: center;
    ">
      <strong style="
        font-size: 16px;
        display: block;
        margin-bottom: 8px;
        color: #333;
      ">
        ${community.community_name}
      </strong>
      <button id="join-${community.community_name}" style="
        background-color: #28a745;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      ">
        Join
      </button>
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
                        })
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
                "https://neighbour-api.vercel.app/neighbour/join/request",
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
