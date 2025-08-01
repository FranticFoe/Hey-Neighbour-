import { useEffect, useState } from "react";
import { Button, Row, Col, Card, ListGroup, Image } from "react-bootstrap";
import axios from "axios";
import HelpFormModal from "./HelpFormModal";

export default function HelpTab({ url, username, communityName, onDeleteHelp }) {
    const [helpList, setHelpList] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showHelpForm, setShowHelpForm] = useState(false);
    const [taskBeingEdited, setTaskBeingEdited] = useState(null);
    const [showUserRequests, setShowUserRequests] = useState(false);
    const [headerTitle, setHeaderTitle] = useState("Available Tasks");

    useEffect(() => {
        if (communityName) {
            fetchHelpRequests();
        }
    }, [communityName]);

    const fetchHelpRequests = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/help/${communityName}`);
            setHelpList(res.data.help || []);
        } catch (err) {
            console.error("Failed to fetch help list", err);
        }
    };

    const fetchUserHelpTasks = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/help/needed/${username}`);
            setHelpList(res.data.helpNeeded);
            setSelectedTask(null);
        } catch (error) {
            console.error("Failed to fetch user tasks:", error);
        }
    };

    const handleShuffleClick = async () => {
        try {
            if (showUserRequests) {
                await fetchHelpRequests();
                setHeaderTitle("Available Tasks");
            } else {
                await fetchUserHelpTasks();
                setHeaderTitle("Your Request");
            }
            setShowUserRequests(!showUserRequests);
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };

    const handleEditHelp = (task) => {
        setTaskBeingEdited(task);
        setShowHelpForm(true);
    };

    const handleHelp = async (taskId) => {
        try {
            await axios.post(`${url}/neighbour/helpers`, {
                username,
                task_id: taskId,
            });
            alert("You are now helping!");
            fetchHelpRequests();
        } catch (err) {
            console.error("Failed to help", err);
            alert(err.response?.data?.message || "Failed to help");
        }
    };

    const handleFormClosed = () => {
        setShowHelpForm(false);
        setTaskBeingEdited(null);
        fetchHelpRequests();
    };

    function formatTime(time24) {
        if (!time24) return "any";
        const [hour, minute] = time24.split(":");
        const h = parseInt(hour);
        const suffix = h >= 12 ? "PM" : "AM";
        const hour12 = ((h + 11) % 12 + 1);
        return `${hour12}:${minute} ${suffix}`;
    }

    function formatDate(isoDate) {
        if (!isoDate) return "any";
        const d = new Date(isoDate);
        if (isNaN(d)) return "any";
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    return (
        <>
            <h3 className="text-center fw-bold">Help Requests</h3>
            <hr />

            <Button
                className="mb-3"
                onClick={() => {
                    setShowHelpForm(true);
                    setTaskBeingEdited(null);
                }}
            >
                Request Help
            </Button>

            <Row className="mt-4">
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-dark text-white text-center position-relative">
                            <i
                                className="bi bi-shuffle position-absolute start-0 ms-3 shuffle-icon"
                                onClick={handleShuffleClick}
                                title="Toggle Your Requests"
                                style={{ cursor: 'pointer' }}
                            />
                            📜 {headerTitle}
                        </Card.Header>
                        <ListGroup variant="flush">
                            {helpList.length === 0 && (
                                <ListGroup.Item>No help requests yet.</ListGroup.Item>
                            )}

                            {helpList.map((task) => (
                                <ListGroup.Item
                                    action
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    active={selectedTask?.id === task.id}
                                    className="cursor-pointer position-relative d-flex align-items-center justify-content-between task-item"
                                >
                                    <div className="d-flex align-items-center justify-content-between w-100">
                                        {username === task.username ? (
                                            <i
                                                className="bi bi-pencil edit-icon text-warning me-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditHelp(task);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            ></i>
                                        ) : (
                                            <span style={{ width: "1.5rem" }}></span>
                                        )}

                                        <div className="flex-grow-1 text-center" style={{ pointerEvents: "none" }}>
                                            <span className="task-item">{task.task_title}</span>
                                        </div>

                                        {username === task.username ? (
                                            <i
                                                className="bi bi-trash delete-icon text-danger-emphasis ms-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteHelp(task.id);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            ></i>
                                        ) : (
                                            <span style={{ width: "1.5rem" }}></span>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white text-center">
                            {selectedTask ? selectedTask.task_title : "📝 Task Details"}
                        </Card.Header>
                        <Card.Body>
                            {selectedTask ? (
                                <>
                                    <p className="text-center">
                                        <strong>Posted By:</strong> {selectedTask.username === username ? "Yourself" : selectedTask.username}
                                    </p>
                                    <div className="text-center">
                                        <Image
                                            style={{ maxHeight: "400px", objectFit: "cover" }}
                                            src={selectedTask.task_image_url}
                                            fluid
                                        />
                                    </div>
                                    <p><strong>Description:</strong> {selectedTask.description}</p>
                                    <p><strong>Rewards:</strong> {selectedTask.task_rewards || "none"}</p>
                                    <p><strong>Date:</strong> {formatDate(selectedTask.date) ?? "any"}</p>
                                    <p><strong>Time:</strong> {formatTime(selectedTask.start_time) ?? "any"} - {selectedTask.end_time ?? ""}</p>
                                    <p><strong>Capacity:</strong> {selectedTask.capacity ?? "∞"}</p>
                                    <p><strong>Helpers Joined:</strong> {selectedTask.current_helper ?? 0}</p>
                                    <div className="text-center">
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleHelp(selectedTask.id)}
                                            disabled={selectedTask.status || selectedTask.username === username}
                                        >
                                            {selectedTask.status ? "Full" : "Help"}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-muted">Select a task from the list to view details.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <HelpFormModal
                show={showHelpForm}
                onHide={handleFormClosed}
                taskBeingEdited={taskBeingEdited}
                url={url}
                username={username}
                communityName={communityName}
            />
        </>
    );
}