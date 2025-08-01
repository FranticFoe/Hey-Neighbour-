import { useEffect, useState, useContext } from "react";
import { Container, Card, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import EventsTab from "./EventsTab";
import HelpTab from "./HelpTab";
import BorrowShareTab from "./BorrowShareTab";
import CommunityMembersTab from "./CommunityMemberTab";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ResponseModal from "./ResponseModal";
import "../App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function CommunityTabs() {
    const url = "https://neighbour-api.vercel.app";

    const [activeTab, setActiveTab] = useState("event");
    const [communityName, setCommunityName] = useState("");
    const [isLeader, setIsLeader] = useState(false);

    // Shared modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [deleteType, setDeleteType] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);

    const { currentUser } = useContext(AuthContext);
    const username = currentUser?.displayName;

    // Initialize community data
    useEffect(() => {
        if (!username) return;

        async function fetchCommunity() {
            try {
                const res = await axios.get(`${url}/neighbour/community/${username}`);
                const name = res.data.community[0]?.community_name;
                setCommunityName(name);

                // Check if user is leader
                const leaderRes = await axios.get(
                    `${url}/neighbour/isLeader/${username}/community/${name}`
                );
                setIsLeader(leaderRes.data.status);
            } catch (err) {
                console.error("Error loading community data:", err);
            }
        }

        fetchCommunity();
    }, [username, url]);

    // Shared delete handlers
    const handleDeleteEvent = (event_id) => {
        setEventToDelete(event_id);
        setDeleteType("event");
        setShowConfirmModal(true);
    };

    const handleDeleteHelp = (taskId) => {
        setItemToDelete(taskId);
        setDeleteType("task");
        setShowConfirmModal(true);
    };

    const handleDeleteShare = (itemId) => {
        setSelectedItemId(itemId);
        setDeleteType("share");
        setShowConfirmModal(true);
    };

    // Shared delete confirmation handlers
    const confirmDeleteEvent = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`${url}/neighbour/events/delete`, {
                data: {
                    leader_name: username,
                    community_name: communityName,
                    event_id: eventToDelete,
                },
            });
            setResponseMessage("✅ Event deleted successfully.");
        } catch (err) {
            console.error("Failed to delete event:", err);
            setResponseMessage("❌ Failed to delete event.");
        } finally {
            setShowResponseModal(true);
        }
    };

    const confirmDeleteTask = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`${url}/neighbour/help/delete`, {
                data: {
                    username,
                    community_name: communityName,
                    task_id: itemToDelete,
                },
            });
            setResponseMessage("✅ Task deleted successfully.");
        } catch (err) {
            console.error("Failed to delete task:", err);
            setResponseMessage("❌ Failed to delete task.");
        } finally {
            setShowResponseModal(true);
        }
    };

    const confirmDeleteShare = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`${url}/neighbour/share/delete`, {
                data: {
                    username,
                    item_id: selectedItemId,
                },
            });
            setResponseMessage("✅ Item deleted successfully.");
        } catch (err) {
            console.error("Delete failed", err);
            setResponseMessage("❌ Failed to delete item.");
        } finally {
            setShowResponseModal(true);
        }
    };

    const handleConfirmDelete = () => {
        if (deleteType === "event") {
            confirmDeleteEvent();
        } else if (deleteType === "task") {
            confirmDeleteTask();
        } else if (deleteType === "share") {
            confirmDeleteShare();
        }
    };

    return (
        <Container className="mt-4">
            <ToggleButtonGroup
                type="radio"
                name="tabOptions"
                defaultValue={"event"}
                onChange={(val) => setActiveTab(val)}
                className="w-100 mb-4 d-flex flex-wrap justify-content-center gap-2"
            >
                <ToggleButton
                    id="tab-event"
                    value={"event"}
                    variant={activeTab === "event" ? "primary" : "outline-primary"}
                    className="flex-fill flex-sm-fill-0 px-4 py-3 rounded-pill fw-semibold border-2 transition-all shadow-sm hover-shadow"
                    style={{
                        minWidth: '140px',
                        transition: 'all 0.2s ease-in-out',
                        border: activeTab === "event" ? '2px solid var(--bs-primary)' : '2px solid var(--bs-primary)',
                        boxShadow: activeTab === "event" ? '0 4px 12px rgba(13, 110, 253, 0.25)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <span className="d-flex align-items-center justify-content-center gap-2">
                        <span style={{ fontSize: '1.1em' }}>🎉</span>
                        <span>Events</span>
                    </span>
                </ToggleButton>

                <ToggleButton
                    id="tab-help"
                    value={"help"}
                    variant={activeTab === "help" ? "warning" : "outline-warning"}
                    className="flex-fill flex-sm-fill-0 px-4 py-3 rounded-pill fw-semibold border-2"
                    style={{
                        minWidth: '140px',
                        transition: 'all 0.2s ease-in-out',
                        border: activeTab === "help" ? '2px solid var(--bs-warning)' : '2px solid var(--bs-warning)',
                        boxShadow: activeTab === "help" ? '0 4px 12px rgba(255, 193, 7, 0.25)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <span className="d-flex align-items-center justify-content-center gap-2">
                        <span style={{ fontSize: '1.1em' }}>🤝</span>
                        <span>Help Needed</span>
                    </span>
                </ToggleButton>

                <ToggleButton
                    id="tab-borrow"
                    value={"borrow"}
                    variant={activeTab === "borrow" ? "success" : "outline-success"}
                    className="flex-fill flex-sm-fill-0 px-4 py-3 rounded-pill fw-semibold border-2"
                    style={{
                        minWidth: '140px',
                        transition: 'all 0.2s ease-in-out',
                        border: activeTab === "borrow" ? '2px solid var(--bs-success)' : '2px solid var(--bs-success)',
                        boxShadow: activeTab === "borrow" ? '0 4px 12px rgba(25, 135, 84, 0.25)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <span className="d-flex align-items-center justify-content-center gap-2">
                        <span style={{ fontSize: '1.1em' }}>🔄</span>
                        <span>Borrow & Share</span>
                    </span>
                </ToggleButton>

                <ToggleButton
                    id="tab-community"
                    value={"community"}
                    variant={activeTab === "community" ? "info" : "outline-info"}
                    className="flex-fill flex-sm-fill-0 px-4 py-3 rounded-pill fw-semibold border-2"
                    style={{
                        minWidth: '140px',
                        transition: 'all 0.2s ease-in-out',
                        border: activeTab === "community" ? '2px solid var(--bs-info)' : '2px solid var(--bs-info)',
                        boxShadow: activeTab === "community" ? '0 4px 12px rgba(13, 202, 240, 0.25)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <span className="d-flex align-items-center justify-content-center gap-2">
                        <span style={{ fontSize: '1.1em' }}>👨‍👩‍👧‍👦</span>
                        <span>Members</span>
                    </span>
                </ToggleButton>
            </ToggleButtonGroup>

            <Card className="mt-3">
                <Card.Body>
                    {activeTab === "event" && (
                        <EventsTab
                            url={url}
                            username={username}
                            communityName={communityName}
                            isLeader={isLeader}
                            onDeleteEvent={handleDeleteEvent}
                        />
                    )}

                    {activeTab === "help" && (
                        <HelpTab
                            url={url}
                            username={username}
                            communityName={communityName}
                            onDeleteHelp={handleDeleteHelp}
                        />
                    )}

                    {activeTab === "borrow" && (
                        <BorrowShareTab
                            url={url}
                            username={username}
                            communityName={communityName}
                            onDeleteShare={handleDeleteShare}
                        />
                    )}

                    {activeTab === "community" && (
                        <CommunityMembersTab
                            url={url}
                            username={username}
                            communityName={communityName}
                            currentUser={currentUser}
                        />
                    )}
                </Card.Body>
            </Card>

            <ConfirmDeleteModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                deleteType={deleteType}
            />

            <ResponseModal
                show={showResponseModal}
                onHide={() => setShowResponseModal(false)}
                message={responseMessage}
            />
        </Container>
    );
}