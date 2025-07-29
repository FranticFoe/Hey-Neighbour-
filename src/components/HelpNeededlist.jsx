import { useEffect, useState } from "react";
import { Row, Col, Card, ListGroup, Button, Image } from "react-bootstrap";
import axios from "axios";

export default function HelpNeededList({ username, handleEditHelp, handleDeleteHelp, handleHelp }) {
    const [helpList, setHelpList] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchHelpList();
    }, []);

    const fetchHelpList = async () => {
        try {
            const res = await axios.get(`/neighbour/help/needed/${username}`);
            setHelpList(res.data.helpNeeded || []);
            setSelectedTask(null); // Reset selection
        } catch (err) {
            console.error("Failed to fetch help needed list", err);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return null;
        const [hour, minute] = timeStr.split(":");
        return `${hour}:${minute}`;
    };

    return (
        <Row className="mt-4">
            {/* LEFT: Task Title List */}
            <Col md={4}>
                <Card className="h-100">
                    <Card.Header className="bg-dark text-white text-center position-relative">
                        <i
                            className="bi bi-shuffle position-absolute start-0 ms-3"
                            style={{ cursor: "pointer" }}
                            onClick={fetchHelpList}
                        ></i>
                        📜 Available Tasks
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
                                className="d-flex align-items-center justify-content-between"
                            >
                                {username === task.username && (
                                    <i
                                        className="bi bi-pencil text-warning me-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditHelp(task);
                                        }}
                                        style={{ cursor: "pointer" }}
                                    ></i>
                                )}
                                <span style={{ pointerEvents: "none", flex: 1 }}>{task.task_title}</span>
                                {username === task.username && (
                                    <i
                                        className="bi bi-trash text-danger-emphasis ms-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteHelp(task.id);
                                        }}
                                        style={{ cursor: "pointer" }}
                                    ></i>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            </Col>

            {/* RIGHT: Selected Task Details */}
            <Col md={8}>
                <Card className="h-100">
                    <Card.Header className="bg-primary text-white text-center">
                        {selectedTask ? selectedTask.task_title : "📝 Task Details"}
                    </Card.Header>
                    <Card.Body>
                        {selectedTask ? (
                            <>
                                <p className="text-center">
                                    <strong>Posted By:</strong> {selectedTask.username}
                                </p>
                                <div className="text-center">
                                    <Image
                                        src={selectedTask.task_image_url}
                                        fluid
                                        style={{ maxHeight: "400px", objectFit: "cover" }}
                                    />
                                </div>
                                <p><strong>Description:</strong> {selectedTask.description}</p>
                                <p><strong>Rewards:</strong> {selectedTask.task_rewards || "none"}</p>
                                <p><strong>Date:</strong> {formatDate(selectedTask.date)}</p>
                                <p><strong>Time:</strong> {formatTime(selectedTask.start_time)} - {selectedTask.end_time ?? ""}</p>
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
    );
}
