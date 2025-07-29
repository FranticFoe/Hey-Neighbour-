import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthProvider";
import CreateCommunityModal from "../components/CreateCommunityModal";
import JoinCommunityMap from "../components/JoinByLocation";
import CommunityTabs from "../components/CommunityTab";

export default function Community() {
    const [hasCommunity, setHasCommunity] = useState(false);
    const [communityName, setCommunityName] = useState("");
    const [, setEvents] = useState([]);
    const [, setHelpTasks] = useState([]);

    const [joinOptionsModal, setJoinOptionsModal] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [availableCommunities, setAvailableCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState("");
    const [showJoinByLocationMap, setShowJoinByLocationMap] = useState(false);

    const [createModalShow, setCreateModalShow] = useState(false);

    const [, setLatitude] = useState(null);
    const [, setLongitude] = useState(null);

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);

    const { currentUser } = useContext(AuthContext);
    const username = currentUser?.displayName;
    const url = "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev";

    useEffect(() => {
        async function checkCommunity() {
            try {
                const res = await axios.get(`${url}/neighbour/community/${username}`);
                const community = res.data.community;
                if (community[0].community_name != null) {
                    setHasCommunity(true);
                    setCommunityName(community[0].community_name);
                }
            } catch (err) {
                console.error("Error checking community:", err);
            }
        }
        checkCommunity();
    }, [username]);

    useEffect(() => {
        if (hasCommunity) {
            axios.get(`${url}/neighbour/events/${communityName}`)
                .then(res => setEvents(res.data.events))
                .catch(err => console.error(err));

            axios.get(`${url}/neighbour/help/${communityName}`)
                .then(res => setHelpTasks(res.data.help))
                .catch(err => console.error(err));
        }
    }, [hasCommunity, communityName]);

    useEffect(() => {
        if (createModalShow && window.google && window.google.maps) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
                initializeMap(pos.coords.latitude, pos.coords.longitude);
            }, (err) => {
                console.warn("Geolocation error:", err);
            });
        }
    }, [createModalShow]);

    const initializeMap = (lat, lng) => {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 15,
        });

        const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance.current,
            draggable: true,
        });

        marker.addListener("dragend", (e) => {
            setLatitude(e.latLng.lat());
            setLongitude(e.latLng.lng());
        });

        markerInstance.current = marker;
    };

    const sendJoinRequest = async () => {
        try {
            await axios.post(`${url}/neighbour/join/request`, {
                username,
                community_name: selectedCommunity
            });
            alert("Join request sent!");
            setModalShow(false);
        } catch (err) {
            alert("Failed to send join request. You may already be in a community.");
            console.error(err);
        }
    };

    const loadGoogleMapsScript = () => {
        if (window.google) return;

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB9t7gGcJKV4g35C2xDOLFT4zEccZ8GfGk`;
        script.async = true;
        script.onload = () => console.log("Google Maps loaded");
        document.body.appendChild(script);
    };

    useEffect(() => {
        loadGoogleMapsScript();
    }, []);

    if (!hasCommunity) {
        return (
            <div className="p-4">
                <h3>You're not in a community yet.</h3>
                <Button variant="primary" className="me-2" onClick={() => setJoinOptionsModal(true)}>
                    Join a community
                </Button>
                <Button variant="success" onClick={() => setCreateModalShow(true)}>
                    Create a community
                </Button>

                <CreateCommunityModal
                    show={createModalShow}
                    onHide={() => setCreateModalShow(false)}
                    user={{ username }}
                />

                <Modal show={joinOptionsModal} onHide={() => setJoinOptionsModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select a way to join a community</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Button
                            variant="outline-primary"
                            className="w-100 mb-3"
                            onClick={async () => {
                                try {
                                    const res = await axios.get(`${url}/neighbour/availableCommunities`);
                                    setAvailableCommunities(res.data.communities);
                                    setJoinOptionsModal(false);
                                    setModalShow(true);
                                } catch (err) {
                                    console.error("Error fetching available communities:", err);
                                    alert("Failed to fetch communities.");
                                }
                            }}
                        >
                            Join by Name
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="w-100"
                            onClick={() => {
                                console.log("Join by Location clicked");
                                setJoinOptionsModal(false);
                                setShowJoinByLocationMap(true);
                            }}
                        >
                            Join by Location
                        </Button>
                    </Modal.Body>
                </Modal>

                <Modal show={modalShow} onHide={() => setModalShow(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select a Community to Join</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)}>
                            <option value="">-- Choose a community --</option>
                            {availableCommunities.map((c, idx) => (
                                <option key={idx} value={c.community_name}>
                                    {c.community_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setModalShow(false)}>Cancel</Button>
                        <Button variant="primary" onClick={sendJoinRequest} disabled={!selectedCommunity}>
                            Send Join Request
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/*  Map Modal Renders Separately Outside Other Modals */}
                {showJoinByLocationMap && (
                    <JoinCommunityMap
                        show={showJoinByLocationMap}
                        onHide={() => setShowJoinByLocationMap(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-center">{communityName}</h2>
            <CommunityTabs />
        </div>
    );
}
