import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Spinner, Alert } from "react-bootstrap";

const url = "https://neighbour-api.vercel.app";

export default function JoinRequestsTab({ communityName, currentUsername }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [message, setMessage] = useState(null);

    const fetchJoinRequests = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/join/request/${communityName}`);
            setRequests(res.data.requests || []);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (communityName) {
            fetchJoinRequests();
        }
    }, [communityName]);

    const handleAccept = async (senderName) => {
        setActionLoading((prev) => ({ ...prev, [senderName]: true }));
        try {
            await axios.post(`${url}/neighbour/join/request/accept`, {
                community_name: communityName,
                username: currentUsername,
                sender_name: senderName,
            });
            setRequests((prev) => prev.filter((req) => req.username !== senderName));
            setMessage(`Accepted ${senderName}'s request.`);
            fetchJoinRequests();
        } catch (err) {
            console.error("Accept error:", err);
            setMessage(`Failed to accept ${senderName}'s request.`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [senderName]: false }));
        }

    };

    const handleDecline = async (senderName) => {
        setActionLoading((prev) => ({ ...prev, [senderName]: true }));
        try {
            await axios.delete(`${url}/neighbour/join/request/decline`, {
                data: {
                    community_name: communityName,
                    username: currentUsername,
                    sender_name: senderName,
                },
            });
            setRequests((prev) => prev.filter((req) => req.username !== senderName));
            setMessage(`Declined ${senderName}'s request.`);
            fetchJoinRequests();
        } catch (err) {
            console.error("Decline error:", err);
            setMessage(`Failed to decline ${senderName}'s request.`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [senderName]: false }));
        }
    };

    return (
        <div>
            <h4>Join Requests</h4>
            {message && <Alert variant="info">{message}</Alert>}

            {loading ? (
                <Spinner animation="border" />
            ) : requests.length === 0 ? (
                <p>No join requests for this community.</p>
            ) : (
                requests.map(({ sender_name }) => (
                    <Card key={sender_name} className="mb-2 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <strong>{sender_name} wants to join the community</strong>
                            <div>
                                <Button
                                    variant="success"
                                    className="me-2"
                                    onClick={() => handleAccept(sender_name)}
                                    disabled={actionLoading[sender_name]}
                                >
                                    {actionLoading[sender_name] ? "Accepting..." : "Accept"}

                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDecline(sender_name)}
                                    disabled={actionLoading[sender_name]}
                                >
                                    {actionLoading[sender_name] ? "Declining..." : "Decline"}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
}
