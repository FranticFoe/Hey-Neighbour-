import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, Spinner, Alert, Badge } from "react-bootstrap";
import { useContext } from "react";
import { NotificationProvider } from "./NotificationProvider";
import { NotificationContext } from "./NotificationProvider";

const url = "https://neighbour-api.vercel.app";

export default function SentRequestTab({ communityName, currentUsername, onUnreadCountChange }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAsRead, setMarkingAsRead] = useState({});
    const [count, setCount] = useState(0)
    const { refreshKey, triggerRefresh } = useContext(NotificationContext);

    const fetchSentRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${url}/neighbour/sent_request/${currentUsername}`);
            const fetchedRequests = res.data.requests.rows || [];
            setRequests(fetchedRequests);
            console.log("Sent request number:", res.data.requests.rowCount);

            // Calculate unread count based on sender_has_read and notify parent
            const unreadCount = fetchedRequests.filter(req => !req.sender_has_read).length;
            console.log(unreadCount)
            if (onUnreadCountChange) {
                onUnreadCountChange(unreadCount);
            }
            setCount(parseInt(unreadCount))
        } catch (err) {
            console.error("Failed to fetch requests", err);
            setError("Unable to fetch your sent requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function fetchRequests() {
            try {
                setLoading(true);
                const res = await axios.get(`${url}/neighbour/sent_request/${currentUsername}`);
                const fetchedRequests = res.data.requests.rows || [];
                setRequests(fetchedRequests);
                console.log("Sent request number:", res.data.requests.rowCount);

                // Calculate unread count based on sender_has_read and notify parent
                const unreadCount = fetchedRequests.filter(req => !req.sender_has_read).length;
                if (onUnreadCountChange) {
                    onUnreadCountChange(unreadCount);
                }
                setCount(parseInt(unreadCount));
            } catch (err) {
                console.error("Failed to fetch requests", err);
                setError("Unable to fetch your sent requests.");
            } finally {
                setLoading(false);
            }
        }

        if (currentUsername) {
            fetchRequests();
        }
    }, [currentUsername, onUnreadCountChange, refreshKey]);

    const toggleReadStatus = useCallback(async (communityName, requestId, currentReadStatus) => {
        if (markingAsRead[requestId]) return; // Prevent double-clicking

        setMarkingAsRead(prev => ({ ...prev, [requestId]: true }));

        try {
            if (currentReadStatus) {
                // Mark as unread
                await axios.put(`${url}/neighbour/sent_request/has_unread`, {
                    community_name: communityName,
                    username: currentUsername,
                });
            } else {
                // Mark as read
                await axios.put(`${url}/neighbour/sent_request/has_read`, {
                    community_name: communityName,
                    username: currentUsername,
                });
            }

            triggerRefresh()
            // Update local state immediately for better UX
            setRequests(prev =>
                prev.map(req =>
                    req.id === requestId
                        ? { ...req, sender_has_read: !currentReadStatus }
                        : req
                )
            );

            // Update unread count
            const newUnreadCount = requests.filter(req => {
                if (req.id === requestId) {
                    return currentReadStatus; // If currently read, it will become unread
                }
                return !req.sender_has_read;
            }).length;

            if (onUnreadCountChange) {
                onUnreadCountChange(newUnreadCount);
            }

            console.log(
                `Marked as ${currentReadStatus ? 'unread' : 'read'} - Community:`,
                communityName,
                "Username:",
                currentUsername
            );
        } catch (err) {
            console.error("Failed to toggle read status", err);
            setError("Failed to update message status. Please try again.");
            setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
        } finally {
            setMarkingAsRead(prev => ({ ...prev, [requestId]: false }));
        }
    }, [currentUsername, onUnreadCountChange, requests, markingAsRead]);

    useEffect(() => {
        if (currentUsername) {
            fetchSentRequests();
        }
    }, [communityName, currentUsername]);

    // Auto-refresh every 300 seconds to catch updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentUsername) {
                fetchSentRequests();
            }
        }, 300000);

        return () => clearInterval(interval);
    }, [currentUsername]);

    const getStatusColor = (hasRead) => {
        return hasRead ? 'success' : 'warning';
    };

    const getStatusText = (hasRead) => {
        return hasRead ? 'Read' : 'Unread';
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading your requests...</p>
            </div>
        );
    }

    return (
        <div className="sent-requests-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Your Sent Requests</h4>
                <Badge bg="secondary" className="requests-count">
                    {count !== 0 && (
                        <p style={{ margin: 0 }}>{count} Total </p>
                    )}
                </Badge>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {requests.length === 0 ? (
                <Card className="text-center py-4 border-0 bg-light">
                    <Card.Body>
                        <div className="mb-3">
                            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                        </div>
                        <h5 className="text-muted">No Join Requests</h5>
                        <p className="text-muted mb-0">
                            You haven't made any join requests yet.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <div className="requests-list">
                    {requests.map(({ id, community_name, sender_has_read, created_at }) => (
                        <Card
                            key={id}
                            className={`request-card mb-3 ${!sender_has_read ? 'unread-card' : 'read-card'}`}
                            onClick={() => toggleReadStatus(community_name, id, sender_has_read)}
                            style={{
                                cursor: markingAsRead[id] ? 'wait' : 'pointer',
                                transition: 'all 0.3s ease',
                                transform: markingAsRead[id] ? 'scale(0.98)' : 'scale(1)'
                            }}
                        >
                            <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <strong className="request-text">
                                                Your request to join{' '}
                                                <span className="community-name text-primary">
                                                    {community_name}
                                                </span>{' '}
                                                is still pending.
                                            </strong>
                                        </div>
                                        {created_at && (
                                            <small className="text-muted">
                                                Sent: {new Date(created_at).toLocaleDateString()}
                                            </small>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Badge
                                            bg={getStatusColor(sender_has_read)}
                                            className="status-badge"
                                        >
                                            {getStatusText(sender_has_read)}
                                        </Badge>
                                        {markingAsRead[id] && (
                                            <Spinner size="sm" animation="border" />
                                        )}
                                    </div>
                                </div>

                                <div className="action-indicator">
                                    <small className="text-primary">
                                        <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                                        Click to {sender_has_read ? 'mark as unread' : 'mark as read'}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}

            <style jsx>{`
                .sent-requests-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .requests-count {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.8rem;
                }

                .request-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                }

                .request-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
                }

                .unread-card {
                    border-left: 4px solid #ffc107;
                    background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
                }

                .read-card {
                    border-left: 4px solid #28a745;
                    background: #ffffff;
                    opacity: 0.9;
                }

                .community-name {
                    font-weight: 600;
                    text-decoration: underline;
                    text-decoration-color: rgba(0, 123, 255, 0.3);
                }

                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.4rem 0.6rem;
                    border-radius: 20px;
                }

                .action-indicator {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(0, 123, 255, 0.1);
                }

                .requests-list {
                    animation: fadeIn 0.5s ease-in;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .sent-requests-container {
                        padding: 0 1rem;
                    }
                    
                    .request-card {
                        margin-bottom: 1rem;
                    }
                    
                    .status-badge {
                        font-size: 0.7rem;
                        padding: 0.3rem 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
}