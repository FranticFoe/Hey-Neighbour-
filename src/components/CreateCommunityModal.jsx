import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

export default function CreateCommunityModal({ show, onHide, user }) {
    const [communityName, setCommunityName] = useState("");
    const [description, setDescription] = useState("");
    const [roadName, setRoadName] = useState(""); // New field
    const [location, setLocation] = useState(null); // { lat, lng }
    const [confirmed, setConfirmed] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapInstance = useRef(null);

    // Load Google Maps script ONCE
    useEffect(() => {
        if (!window.google && !document.getElementById("googleMapsScript")) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB9t7gGcJKV4g35C2xDOLFT4zEccZ8GfGk`;
            script.async = true;
            script.id = "googleMapsScript";
            script.onload = () => {
                if (show) initMap();
            };
            document.body.appendChild(script);
        } else if (window.google && show) {
            initMap();
        }
    }, [show]);

    function initMap() {
        if (!window.google || !mapRef.current) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const latLng = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setLocation(latLng);

                mapInstance.current = new window.google.maps.Map(mapRef.current, {
                    center: latLng,
                    zoom: 15,
                });

                const marker = new window.google.maps.Marker({
                    position: latLng,
                    map: mapInstance.current,
                    draggable: true,
                    icon: {
                        url: `${window.location.origin}/house_Marker.png`,
                        scaledSize: new window.google.maps.Size(32, 32),
                    },
                });

                marker.addListener("dragend", () => {
                    const newPos = marker.getPosition();
                    const newLocation = {
                        lat: newPos.lat(),
                        lng: newPos.lng(),
                    };
                    setLocation(newLocation);
                    setConfirmed(false); // reset confirmation
                });

                markerRef.current = marker;
            });
        }
    }

    const handleRoadNameSearch = () => {
        if (!roadName.trim()) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: roadName }, (results, status) => {
            if (status === "OK" && results[0]) {
                const newLocation = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                };

                setLocation(newLocation);
                setConfirmed(false); // reset confirmation

                // Update map and marker
                if (!mapInstance.current || !markerRef.current) return;

                mapInstance.current.setCenter(newLocation);
                markerRef.current.setPosition(newLocation);
            } else {
                alert("Could not find that road. Try a more specific name.");
            }
        });
    };

    const handleConfirmLocation = () => {
        setConfirmed(true);
    };

    const handleCreate = async () => {
        if (!confirmed || !location) {
            alert("Please confirm location first.");
            return;
        }

        try {
            await axios.post("https://neighbour-api.vercel.app/create/community", {
                community_name: communityName,
                community_description: description,
                neighbour_username: user?.username,
                latitude: location.lat,
                longitude: location.lng,
            });
            alert("Community created successfully");
            onHide();
        } catch (err) {
            console.error("Error:", err);
            alert("Failed to create community.");
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Create Community</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Community Name</Form.Label>
                    <Form.Control
                        value={communityName}
                        onChange={(e) => setCommunityName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mt-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mt-2">
                    <Form.Label>Optional: Enter Road Name to Set Marker</Form.Label>
                    <div className="d-flex">
                        <Form.Control
                            value={roadName}
                            onChange={(e) => setRoadName(e.target.value)}
                            placeholder="e.g. Jalan Bukit Bintang"
                        />
                        <Button variant="outline-primary" className="ms-2" onClick={handleRoadNameSearch}>
                            Search
                        </Button>
                    </div>
                </Form.Group>
                <div className="mt-3">
                    <div
                        ref={mapRef}
                        style={{ width: "100%", height: "300px", borderRadius: "8px" }}
                    />
                    <Button
                        className="mt-2"
                        onClick={handleConfirmLocation}
                        disabled={!location}
                    >
                        Confirm Location
                    </Button>
                    {confirmed && location && (
                        <p className="text-success mt-2">
                            Location confirmed: ({location.lat.toFixed(5)}, {location.lng.toFixed(5)})
                        </p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!confirmed}>
                    Create
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
