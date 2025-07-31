import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";

const url = "https://neighbour-api.vercel.app";

export default function SentRequestTab({ communityName, currentUsername }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSentRequests = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/sent_request/${currentUsername}`);
            setRequests(res.data.requests.rows || []);
        } catch (err) {
            console.error("Failed to fetch requests", err);
            setError("Unable to fetch your sent requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSentRequests();
    }, [communityName]); // still keep communityName if it's used as a trigger

    return (
        <div>
            <h4>Join Requests</h4>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <Spinner animation="border" />
            ) : requests.length === 0 ? (
                <p>You have not made a join request.</p>
            ) : (
                requests.map(({ id, community_name }) => (
                    <Card key={id} className="mb-2 p-3">
                        <strong>Your request to join <b>{community_name}</b> is still pending.</strong>
                    </Card>
                ))
            )}
        </div>
    );
}
