import JoinRequestsTab from "../components/JoinRequestTab";
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthProvider";
import { Button, ToggleButton, ToggleButtonGroup, Badge } from "react-bootstrap";
import SentRequestTab from "../components/SentRequestsTab";
import { NotificationContext } from "../components/NotificationProvider";

export default function Messages() {
    const { currentUser, communityName } = useContext(AuthContext);
    const username = currentUser?.displayName;
    const [isLeader, setIsLeader] = useState(false);
    const [mailTab, setMailTab] = useState("messages");
    const [count, setCount] = useState(0);
    const { refreshKey } = useContext(NotificationContext);
    const [unreadCounts, setUnreadCounts] = useState({
        messages: 0,
        requests: 0
    });
    const [loading, setLoading] = useState(true);
    const url = "https://neighbour-api.vercel.app";

    // Fetch community name and leader status
    useEffect(() => {
        if (!username) return;

        async function fetchCommunityData() {
            try {
                setLoading(true);
                const res = await axios.get(`${url}/neighbour/community/${username}`);
                const name = res.data.community[0]?.community_name;

                // Check if user is leader
                if (name) {
                    const leaderRes = await axios.get(
                        `${url}/neighbour/isLeader/${username}/community/${name}`
                    );
                    setIsLeader(leaderRes.data.status);
                }
            } catch (err) {
                console.error("Error loading community data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCommunityData();
    }, [username]);

    useEffect(() => {
        async function fetchUnreadCount() {
            console.log("communityName:", communityName)
            try {
                const res = await axios.get(`${url}/neighbour/unread_count`, {
                    params: { username, community_name: communityName }
                });
                setCount(parseInt(res.data.unread_count || 0));
            } catch (err) {
                console.error("Failed to fetch unread count", err);
            }
        }


        if (username) {
            fetchUnreadCount();
        }
    }, [username, communityName, refreshKey]);

    // Fetch unread counts
    const fetchUnreadCounts = useCallback(async () => {
        if (!username || !communityName) return;

        try {

            // Fetch request unread count (for sent requests)
            let requestCount = 0;
            if (!isLeader) {
                const requestRes = await axios.get(`${url}/neighbour/sent_request/${username}`);
                const requests = requestRes.data.requests.rows || [];
                requestCount = requests.filter(req => !req.has_read).length;
            } else {
                // For leaders, count join requests
                const joinRequestRes = await axios.get(`${url}/neighbour/join/request/${communityName}`);
                requestCount = joinRequestRes.data.requests.rows || 0;
            }

            setUnreadCounts({
                requests: requestCount
            });
        } catch (err) {
            console.error("Failed to fetch unread counts", err);
        }
    }, [username, communityName, isLeader]);

    useEffect(() => {
        fetchUnreadCounts();

        // Auto-refresh unread counts every 30 seconds
        const interval = setInterval(fetchUnreadCounts, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCounts]);

    // Handle unread count changes from child components
    const handleRequestUnreadCountChange = useCallback((count) => {
        setUnreadCounts(prev => ({
            ...prev,
            requests: count
        }));
    }, []);


    // Calculate total unread count
    const totalUnreadCount = count;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading your messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-container">
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-8">
                        {/* Header */}
                        <div className="text-center mb-4">
                            <h2 className="display-6 mb-2">
                                <i className="bi bi-envelope-heart me-2 text-primary"></i>
                                Messages
                            </h2>
                            {totalUnreadCount > 0 && (
                                <p className="text-muted">
                                    You have <Badge bg="danger" className="mx-1">{totalUnreadCount}</Badge>
                                    unread {totalUnreadCount === 1 ? 'message' : 'messages'}
                                </p>
                            )}
                        </div>

                        {/* Tab Navigation */}
                        <div className="d-flex justify-content-center mb-4">
                            <ToggleButtonGroup
                                type="radio"
                                name="tabs"
                                value={mailTab}
                                onChange={(val) => setMailTab(val)}
                                className="custom-toggle-group"
                            >
                                <ToggleButton
                                    id="tab-messages"
                                    value="messages"
                                    variant="outline-primary"
                                    className="px-4 py-2"
                                >
                                    <i className="bi bi-chat-dots me-2"></i>
                                    Messages
                                    {unreadCounts.messages > 0 && (
                                        <Badge bg="danger" className="ms-2">
                                            {unreadCounts.messages}
                                        </Badge>
                                    )}
                                </ToggleButton>
                                {(isLeader || !communityName) && (
                                    <ToggleButton
                                        id="tab-requests"
                                        value="inbox"
                                        variant="outline-primary"
                                        className="px-4 py-2"
                                    >
                                        {/* Icon and Label */}
                                        {!communityName ? (
                                            <>
                                                <i className="bi bi-send me-2"></i>
                                                Sent Requests
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-plus me-2"></i>
                                                Join Requests
                                            </>
                                        )}

                                        {/* Badge */}
                                        {totalUnreadCount > 0 && (
                                            <Badge bg="danger" className="ms-2">
                                                {totalUnreadCount}
                                            </Badge>
                                        )}
                                    </ToggleButton>
                                )}

                            </ToggleButtonGroup>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {mailTab === "messages" && (
                                <div className="tab-pane fade show active">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body text-center py-5">
                                            <div className="mb-4">
                                                <i className="bi bi-tools" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                            </div>
                                            <h4 className="text-muted mb-3">Messages Coming Soon</h4>
                                            <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
                                                The message feature is still in development.
                                                For now, you can use WhatsApp to communicate with your community members.
                                            </p>
                                            <Button
                                                variant="success"
                                                size="lg"
                                                onClick={() => window.open("https://web.whatsapp.com/", "_blank")}
                                                className="d-inline-flex align-items-center gap-2"
                                            >
                                                <img
                                                    src="https://images.seeklogo.com/logo-png/16/1/whatsapp-logo-png_seeklogo-168310.png"
                                                    alt="WhatsApp"
                                                    style={{ width: "24px", height: "24px" }}
                                                />
                                                Open WhatsApp Web
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mailTab === "inbox" && (
                                <div className="tab-pane fade show active">
                                    {!communityName ? (
                                        <SentRequestTab
                                            communityName={communityName}
                                            currentUsername={username}
                                            onUnreadCountChange={handleRequestUnreadCountChange}
                                        />
                                    ) : isLeader ? (
                                        <JoinRequestsTab
                                            communityName={communityName}
                                            currentUsername={username}
                                            onUnreadCountChange={handleRequestUnreadCountChange}
                                        />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .messages-container {
                    min-height: calc(100vh - 70px);
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .custom-toggle-group .btn {
                    border-radius: 25px !important;
                    margin: 0 4px;
                    border: 2px solid #007bff;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }

                .custom-toggle-group .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
                }

                .custom-toggle-group .btn-check:checked + .btn {
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    border-color: #0056b3;
                    color: white;
                }

                .tab-content {
                    animation: fadeIn 0.5s ease-in-out;
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

                .card {
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                }

                @media (max-width: 768px) {
                    .custom-toggle-group {
                        flex-direction: column;
                        width: 100%;
                    }
                    
                    .custom-toggle-group .btn {
                        margin: 4px 0;
                        border-radius: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}