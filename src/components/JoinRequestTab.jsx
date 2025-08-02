import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useContext } from "react";
import { NotificationContext } from "./NotificationProvider";

const url = "https://neighbour-api.vercel.app";

export default function JoinRequestsTab({ communityName, currentUsername, onUnreadCountChange }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [markingAsRead, setMarkingAsRead] = useState({});
    const [message, setMessage] = useState(null);
    const { refreshKey, triggerRefresh } = useContext(NotificationContext);

    const fetchJoinRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${url}/neighbour/join/request/${communityName}`);
            const fetchedRequests = res.data.requests || [];
            setRequests(fetchedRequests);
            console.log("Join requests number:", res.data.Info.rowCount);

            // Calculate unread count based on leader_has_read
            const unreadCount = fetchedRequests.filter(req => !req.leader_has_read).length;

            // Notify parent component about unread count
            if (onUnreadCountChange) {
                onUnreadCountChange(unreadCount);
            }
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

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (communityName) {
                fetchJoinRequests();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [communityName]);

    const handleAccept = async (senderName) => {
        setActionLoading((prev) => ({ ...prev, [senderName]: true }));
        try {
            await axios.post(`${url}/neighbour/join/request/accept`, {
                community_name: communityName,
                username: currentUsername,
                sender_name: senderName,
            });

            // Update local state immediately
            const updatedRequests = requests.filter((req) => req.sender_name !== senderName);
            setRequests(updatedRequests);

            // Update unread count
            const unreadCount = updatedRequests.filter(req => !req.leader_has_read).length;
            if (onUnreadCountChange) {
                onUnreadCountChange(unreadCount);
            }

            setMessage({ type: 'success', text: `Accepted ${senderName}'s request.` });
            setTimeout(() => setMessage(null), 5000);
        } catch (err) {
            console.error("Accept error:", err);
            setMessage({ type: 'danger', text: `Failed to accept ${senderName}'s request.` });
            setTimeout(() => setMessage(null), 5000);
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

            // Update local state immediately
            const updatedRequests = requests.filter((req) => req.sender_name !== senderName);
            setRequests(updatedRequests);

            // Update unread count
            const unreadCount = updatedRequests.filter(req => !req.leader_has_read).length;
            if (onUnreadCountChange) {
                onUnreadCountChange(unreadCount);
            }

            setMessage({ type: 'info', text: `Declined ${senderName}'s request.` });
            setTimeout(() => setMessage(null), 5000);
        } catch (err) {
            console.error("Decline error:", err);
            setMessage({ type: 'danger', text: `Failed to decline ${senderName}'s request.` });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setActionLoading((prev) => ({ ...prev, [senderName]: false }));
        }
    };

    const toggleReadStatus = async (senderName, currentReadStatus) => {
        if (markingAsRead[senderName]) return; // Prevent double-clicking

        setMarkingAsRead(prev => ({ ...prev, [senderName]: true }));

        try {
            if (currentReadStatus) {
                // Mark as unread
                await axios.put(`${url}/neighbour/join_request/has_unread`, {
                    community_name: communityName,
                    senderName: senderName,
                });
            } else {
                // Mark as read
                await axios.put(`${url}/neighbour/join_request/has_read`, {
                    community_name: communityName,
                    username: currentUsername,
                    senderName: senderName,
                });
            }
            triggerRefresh()

            // Update local state immediately for better UX
            setRequests(prev =>
                prev.map(req =>
                    req.sender_name === senderName
                        ? { ...req, leader_has_read: !currentReadStatus }
                        : req
                )
            );

            // Update unread count
            const newUnreadCount = requests.filter(req => {
                if (req.sender_name === senderName) {
                    return currentReadStatus; // If currently read, it will become unread
                }
                return !req.leader_has_read;
            }).length;

            if (onUnreadCountChange) {
                onUnreadCountChange(newUnreadCount);
            }

            console.log(`Marked ${senderName}'s request as ${currentReadStatus ? 'unread' : 'read'}`);
        } catch (err) {
            console.error("Failed to toggle read status", err);
            setMessage({ type: 'danger', text: `Failed to update message status. Please try again.` });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setMarkingAsRead(prev => ({ ...prev, [senderName]: false }));
        }
    };

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
                <p className="mt-2 text-muted">Loading join requests...</p>
            </div>
        );
    }

    return (
        <div className="join-requests-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Join Requests</h4>
                <Badge bg="primary" className="requests-count">
                    {requests.length} Pending
                </Badge>
            </div>

            {message && (
                <Alert
                    variant={message.type}
                    dismissible
                    onClose={() => setMessage(null)}
                    className="alert-custom"
                >
                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : message.type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2`}></i>
                    {message.text}
                </Alert>
            )}

            {requests.length === 0 ? (
                <Card className="text-center py-4 border-0 bg-light">
                    <Card.Body>
                        <div className="mb-3">
                            <i className="bi bi-person-check" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                        </div>
                        <h5 className="text-success">All Caught Up!</h5>
                        <p className="text-muted mb-0">
                            No pending join requests for your community.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <div className="requests-list">
                    {requests.map(({ sender_name, created_at, leader_has_read }) => (
                        <Card
                            key={sender_name}
                            className={`request-card mb-3 ${!leader_has_read ? 'unread-card' : 'read-card'}`}
                            onClick={() => toggleReadStatus(sender_name, leader_has_read)}
                            style={{
                                cursor: markingAsRead[sender_name] ? 'wait' : 'pointer',
                                transform: markingAsRead[sender_name] ? 'scale(0.98)' : 'scale(1)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="avatar-placeholder me-3">
                                                <i className="bi bi-person-circle" style={{ fontSize: '2.5rem', color: '#007bff' }}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <h5 className="mb-0">
                                                        <strong className="text-primary">{sender_name}</strong>
                                                    </h5>
                                                    <Badge
                                                        bg={getStatusColor(leader_has_read)}
                                                        className="status-badge"
                                                    >
                                                        {getStatusText(leader_has_read)}
                                                    </Badge>
                                                    {markingAsRead[sender_name] && (
                                                        <Spinner size="sm" animation="border" />
                                                    )}
                                                </div>
                                                <p className="mb-0 text-muted">
                                                    wants to join your community
                                                </p>
                                                {created_at && (
                                                    <small className="text-muted">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {new Date(created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-buttons">
                                        <Button
                                            variant="success"
                                            className="me-2 action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAccept(sender_name);
                                            }}
                                            disabled={actionLoading[sender_name]}
                                        >
                                            {actionLoading[sender_name] ? (
                                                <>
                                                    <Spinner size="sm" animation="border" className="me-1" />
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-lg me-1"></i>
                                                    Accept
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDecline(sender_name);
                                            }}
                                            disabled={actionLoading[sender_name]}
                                        >
                                            {actionLoading[sender_name] ? (
                                                <>
                                                    <Spinner size="sm" animation="border" className="me-1" />
                                                    Declining...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-x-lg me-1"></i>
                                                    Decline
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="request-footer mt-3 pt-3 border-top">
                                    <small className="text-primary">
                                        <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                                        Click to {leader_has_read ? 'mark as unread' : 'mark as read'}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}

            <style jsx>{`
                .join-requests-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .requests-count {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.8rem;
                }

                .alert-custom {
                    border-radius: 12px;
                    border: none;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .request-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 15px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .unread-card {
                    background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
                    border-left: 4px solid #ffc107;
                }

                .read-card {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
                    border-left: 4px solid #28a745;
                    opacity: 0.9;
                }

                .request-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
                }

                .avatar-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .action-btn {
                    border-radius: 25px;
                    padding: 0.5rem 1rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    min-width: 100px;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                }

                .btn-success.action-btn {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border: none;
                }

                .btn-danger.action-btn {
                    background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
                    border: none;
                }

                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.4rem 0.6rem;
                    border-radius: 20px;
                }

                .request-footer {
                    border-top: 1px solid rgba(0, 123, 255, 0.1) !important;
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
                    .join-requests-container {
                        padding: 0 1rem;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        gap: 0.3rem;
                    }
                    
                    .action-btn {
                        min-width: 80px;
                        font-size: 0.8rem;
                        padding: 0.4rem 0.8rem;
                    }
                    
                    .d-flex.justify-content-between.align-items-start {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .action-buttons {
                        align-self: stretch;
                        flex-direction: row;
                        justify-content: space-between;
                    }

                    .status-badge {
                        font-size: 0.7rem;
                        padding: 0.3rem 0.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .request-card {
                        margin-bottom: 1rem;
                    }
                    
                    .avatar-placeholder {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}