import { useEffect, useState, useContext } from "react";
import {
    Container,
    Card,
    ToggleButtonGroup,
    ToggleButton,
    Button,
    Form,
    Image,
    Modal,
    Row,
    Col,
    ListGroup
} from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import "../App.css";


export default function CommunityTabs() {
    const url =
        "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev";

    const [activeTab, setActiveTab] = useState("event");
    const [events, setEvents] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [communityName, setCommunityName] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [newTaskImage, setNewTaskImage] = useState(null);
    const [previewTaskImage, setPreviewTaskImage] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showUserRequests, setShowUserRequests] = useState(false);
    const [headerTitle, setHeaderTitle] = useState("Available Tasks");


    const [newEvent, setNewEvent] = useState({
        event_title: "",
        event_description: "",
        date: "",
        start_time: "",
        end_time: "",
    });
    const [editingEvent, setEditingEvent] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");


    const [deleteType, setDeleteType] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showHelpForm, setShowHelpForm] = useState(false);
    const [helpList, setHelpList] = useState([]);
    const [taskBeingEdited, setTaskBeingEdited] = useState(null);
    const isEditMode = taskBeingEdited !== null;
    const [helpForm, setHelpForm] = useState({
        task_title: "",
        task_description: "",
        capacity: "",
        date: "",
        start_time: "",
        duration: "",
        task_rewards: "",
        task_image_url: "",
    });

    const { currentUser } = useContext(AuthContext);
    const username = currentUser?.displayName;

    const fetchHelpRequests = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/help/${communityName}`);
            setHelpList(res.data.help || []);
        } catch (err) {
            console.error("Failed to fetch help list", err);
        }
    };


    useEffect(() => {
        fetchHelpRequests();
    }, [communityName]);

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


    const handleSubmitHelp = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = helpForm.task_image_url || "";

            if (newTaskImage) {
                const imageRef = ref(storage, `help/${newTaskImage.name}`);
                await uploadBytes(imageRef, newTaskImage);
                imageUrl = await getDownloadURL(imageRef);
            }

            if (isEditMode && taskBeingEdited !== null) {
                const payload = {
                    task_id: taskBeingEdited,
                    ...helpForm,
                    username: username,
                    community_name: communityName,
                    task_image_url: imageUrl,
                };

                await axios.put(`${url}/neighbour/help/update`, payload);

                alert("Task updated");

            } else {
                await axios.post(`${url}/neighbour/help`, {
                    ...helpForm,
                    neighbour_username: username,
                    community_name: communityName,
                    task_image_url: imageUrl,
                });
                alert("Task created");
            }

            // Reset form

            setShowHelpForm(false);
            setHelpForm({
                task_title: "",
                task_description: "",
                capacity: "",
                date: "",
                start_time: "",
                duration: "",
                task_rewards: "",
                task_image_url: "",
            });
            setNewTaskImage(null);
            setPreviewTaskImage(null);
            fetchHelpRequests();
        } catch (err) {
            console.error("Error submitting help request", err);
            alert("Failed to submit task");
        }
    };


    const handleEditHelp = (task) => {
        setTaskBeingEdited(task.id);
        setHelpForm({
            task_title: task.task_title,
            task_description: task.description,
            capacity: task.capacity,
            date: task.date?.slice(0, 10) || "",
            start_time: task.start_time || "",
            duration: task.duration,
            task_rewards: task.task_rewards,
            task_image_url: task.task_image_url || "",
        });
        setPreviewTaskImage(task.task_image_url || null);
        setShowHelpForm(true);
    };



    const handleDeleteHelp = (taskId) => {
        setItemToDelete(taskId);          // shared state for confirm
        setDeleteType("task");            // distinguish between task/event
        setShowConfirmModal(true);        // triggers the modal
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
            alert("Task deleted");
            fetchHelpRequests(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task");
        }
    };

    const handleHelp = async (taskId) => {
        try {
            await axios.post(`${url}/neighbour/helpers`, {
                username,
                task_id: taskId,
            });
            alert("You are now helping!");
            fetchHelpRequests(); // Refresh list
        } catch (err) {
            console.error("Failed to help", err);
            alert(err.response?.data?.message || "Failed to help");
        }
    };

    const fetchUserHelpTasks = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/help/needed/${username}`);
            setHelpList(res.data.helpNeeded);
            setSelectedTask(null); // Optional: clear selection on shuffle
        } catch (error) {
            console.error("Failed to fetch shuffled tasks:", error);
        }
    };

    const handleShuffleClick = async () => {
        try {
            if (showUserRequests) {
                await fetchHelpRequests(); // Show all community tasks
                setHeaderTitle("Available Tasks");
            } else {
                await fetchUserHelpTasks(); // Show user's own requests
                setHeaderTitle("Your Request");
            }
            setShowUserRequests(!showUserRequests); // Toggle the view
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };


    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            let downloadURL = newEvent.event_image_url || "";

            if (newImage) {
                const imageRef = ref(storage, `events/${newImage.name}`);
                await uploadBytes(imageRef, newImage);
                downloadURL = await getDownloadURL(imageRef);
            }

            const eventPayload = {
                ...newEvent,
                community_name: communityName,
                leader_name: username,
                event_image_url: downloadURL,
                event_id: editingEvent, // used in update
            };

            if (editingEvent) {
                await axios.put(`${url}/neighbour/events/update`, eventPayload);
                alert("Event updated");
            } else {
                await axios.post(`${url}/neighbour/create/events`, eventPayload);
                alert("Event created");
            }

            // Reset
            setShowAddEventForm(false);
            setNewEvent({
                event_title: "",
                event_description: "",
                date: "",
                start_time: "",
                end_time: "",
                event_image_url: "",
            });
            setNewImage(null);
            setPreviewImage(null);
            setEditingEvent(null);

            // Refresh list
            const res = await axios.get(`${url}/neighbour/events/${communityName}`);
            setEvents(res.data.events || []);
        } catch (err) {
            console.error("Error saving event:", err);
            alert("Failed to save event");
        }
    };

    const handleEditEvent = (event) => {
        setShowAddEventForm(true);
        setNewEvent({
            ...event,
            event_image_url: event.event_image_url || "",
            date: event.date ? event.date.slice(0, 10) : "",
        });
        setPreviewImage(event.event_image_url || null);
        setEditingEvent(event.event_id); // used to determine if update or create
    };

    const handleDeleteEvent = (event_id) => {
        setEventToDelete(event_id);
        setDeleteType("event");
        setShowConfirmModal(true);
    };

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
            const res = await axios.get(`${url}/neighbour/events/${communityName}`);
            setEvents(res.data.events || []);
        } catch (err) {
            console.error("Failed to delete event:", err);
            setResponseMessage("❌ Failed to delete event.");
        } finally {
            setShowResponseModal(true);
        }
    };

    const [shareList, setShareList] = useState([]);
    const [showShareForm, setShowShareForm] = useState(false);
    const [shareForm, setShareForm] = useState({
        title: "",
        description: "",
        is_borrowable: true,
        borrow_fee: "",
    });

    const fetchShares = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/share/${communityName}`);
            const visibleShares = res.data.shares.filter(share => {
                if (share.poster_username === username) {
                    return true;
                } else {
                    return share.is_borrowable && !share.is_borrowed;
                }
            });
            setShareList(visibleShares);
        } catch (err) {
            console.error("Failed to fetch shares", err);
        }
    };

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
                console.log("leaderRes", leaderRes)
                setIsLeader(leaderRes.data.status);

                // Fetch events
                const eventsRes = await axios.get(`${url}/neighbour/events/${name}`);
                setEvents(eventsRes.data.events || []);
            } catch (err) {
                console.error("Error loading community data:", err);
            }
        }
        fetchHelpRequests();
        fetchCommunity();
    }, [username]);
    fetchShares();

    return (
        <Container className="mt-4">
            <ToggleButtonGroup
                type="radio"
                name="tabOptions"
                defaultValue={"event"}
                onChange={(val) => setActiveTab(val)}
            >
                <ToggleButton id="tab-event" value={"event"} variant="outline-primary">
                    Event
                </ToggleButton>
                <ToggleButton id="tab-help" value={"help"} variant="outline-secondary">
                    Help Required
                </ToggleButton>

                <ToggleButton id="tab-borrow" value={"borrow"} variant="outline-success">
                    Borrow & Share
                </ToggleButton>

            </ToggleButtonGroup>

            <Card className="mt-3">
                <Card.Body>
                    {activeTab === "event" && (
                        <>

                            {isLeader && (
                                <Modal
                                    show={showAddEventForm}
                                    onHide={() => {
                                        setShowAddEventForm(false);
                                        setEditingEvent(null);
                                        setNewEvent({
                                            event_title: "",
                                            event_description: "",
                                            date: "",
                                            start_time: "",
                                            end_time: "",
                                            event_image_url: "",
                                        });
                                        setPreviewImage(null);
                                    }}
                                    centered
                                    size="lg"
                                >
                                    <Modal.Header>
                                        <div className="w-100 text-center">
                                            <Modal.Title>{editingEvent ? "Edit Event" : "Add Event"}</Modal.Title>
                                        </div>
                                    </Modal.Header>

                                    <Modal.Body>
                                        <Form onSubmit={handleCreateEvent}>
                                            <Form.Group controlId="formImage" className="mt-3">
                                                <Form.Label>Event Image</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewImage(file);
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setPreviewImage(reader.result);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </Form.Group>

                                            {previewImage && (
                                                <div className="mt-2">
                                                    <div className="p-2 mt-2 bg-secondary text-white rounded" style={{ fontSize: "0.9rem" }}>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="bi bi-check-circle-fill me-2"></i>
                                                            <span>Image selected:</span>
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                            <Image
                                                                src={previewImage}
                                                                fluid
                                                                style={{ maxHeight: 100, borderRadius: 8, border: "3px solid white" }}
                                                                className="mx-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <Form.Group>
                                                <Form.Label>Event Title</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required
                                                    value={newEvent.event_title}
                                                    onChange={(e) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            event_title: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </Form.Group>

                                            <Form.Group className="mt-2">
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    required
                                                    value={newEvent.event_description}
                                                    onChange={(e) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            event_description: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </Form.Group>

                                            <Form.Group className="mt-2">
                                                <Form.Label>Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    required
                                                    value={newEvent.date}
                                                    onChange={(e) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            date: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </Form.Group>
                                            {/* useSelect for cuztomized start/end time with own built in function  where it uses moment.js or date-fns*/}


                                            <Form.Group className="mt-2">
                                                <Form.Label>Start Time</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    required
                                                    value={newEvent.start_time}
                                                    onChange={(e) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            start_time: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </Form.Group>

                                            <Form.Group className="mt-2">
                                                <Form.Label>End Time</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    required
                                                    value={newEvent.end_time}
                                                    onChange={(e) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            end_time: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </Form.Group>

                                            <div className="mt-3 d-flex gap-2 justify-content-end">
                                                <Button variant="secondary" onClick={() => {
                                                    setShowAddEventForm(false);
                                                    setEditingEvent(null);
                                                    setNewEvent({
                                                        event_title: "",
                                                        event_description: "",
                                                        date: "",
                                                        start_time: "",
                                                        end_time: "",
                                                        event_image_url: "",
                                                    });
                                                    setPreviewImage(null);
                                                }}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" variant="primary">
                                                    Submit
                                                </Button>
                                            </div>
                                        </Form>
                                    </Modal.Body>
                                </Modal>
                            )}

                            <h3 className="text-center fw-bold">Upcoming Events</h3>
                            <hr />
                            {isLeader && !showAddEventForm && (
                                <Button variant="success" onClick={() => setShowAddEventForm(true)}>
                                    Add Event
                                </Button>
                            )}

                            {events.length === 0 ? (
                                <p className="text-center text-muted">📭 No events yet. Check back soon!</p>
                            ) : (
                                events.map((event, idx) => (

                                    <Card key={idx} className="card-group-hover position-relative mb-4 mt-4 border border-black border-1 shadow-sm" style={{ backgroundColor: "#fdfdfd" }}>

                                        <span
                                            className="position-absolute top-0 start-50 translate-middle-x  "
                                            style={{ zIndex: 4, fontSize: "1rem", padding: "0.5rem 1rem" }}
                                        >
                                            📌
                                        </span>
                                        {/* Image Header */}
                                        {isLeader && (
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="edit-btn position-absolute top-0 start-0 m-2"
                                                onClick={() => handleEditEvent(event)}
                                            >
                                                ✏️ Edit
                                            </Button>
                                        )}

                                        {isLeader && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="delete-btn position-absolute top-0 end-0 m-2"
                                                onClick={() => handleDeleteEvent(event.event_id)}
                                            >
                                                🗑️ Delete
                                            </Button>
                                        )}

                                        {event.event_image_url && (
                                            <div
                                                style={{
                                                    position: "relative",
                                                    width: "100%",
                                                    paddingTop: "56.25%", // 16:9 ratio
                                                    overflow: "hidden",
                                                    backgroundColor: "#f8f9fa",
                                                    marginTop: "45px",
                                                }}
                                            >
                                                <Card.Img
                                                    src={event.event_image_url}
                                                    alt={event.event_title}
                                                    style={{
                                                        position: "absolute",
                                                        maxWidth: "100%",
                                                        maxHeight: "100%",
                                                        objectFit: "contain",
                                                        top: 0,
                                                        left: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <Card.Body className="px-4 py-3">
                                            <Card.Title className="fw-bold text-center fs-4 text-primary mb-3 pt-4">
                                                {event.event_title}
                                            </Card.Title>

                                            <div className="mb-3 text-center ">
                                                <div><strong>📅Date:</strong> {formatDate(event.date)}</div>
                                                <div><strong>⏰Time:</strong> {formatTime(event.start_time)} – {formatTime(event.end_time)}</div>
                                            </div>

                                            <Card.Text className="text-dark text-center" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
                                                {event.event_description}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>

                                ))
                            )}
                        </>
                    )}

                    {/* Delete Confirmation Modal */}
                    <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                        <Modal.Header >
                            <div className="w-100 text-center">
                                <Modal.Title>Confirm {deleteType === "event" ? "Event" : "Task"} Deletion</Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-100 text-center">
                                <p>Are you sure you want to delete this {deleteType}?</p>
                                <p className="text-danger">This action cannot be undone.</p>
                            </div>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (deleteType === "event") {
                                        confirmDeleteEvent();
                                    } else if (deleteType === "task") {
                                        confirmDeleteTask();
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Response Modal */}
                    <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)} centered>
                        <Modal.Header >
                            <div className="w-100 text-center">
                                <Modal.Title>Delete Status</Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body>{responseMessage}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={() => setShowResponseModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>



                    {activeTab === "help" && (
                        <>

                            <Modal show={showHelpForm} onHide={() => setShowHelpForm(false)} centered size="lg">
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        {isEditMode ? "Edit Help Request" : "Create Help Request"}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form onSubmit={handleSubmitHelp}>
                                        <Form.Group controlId="formImage" className="mt-2">
                                            <Form.Label>Task Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setNewTaskImage(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setPreviewTaskImage(reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </Form.Group>

                                        {previewTaskImage && (
                                            <div className="mt-3">
                                                <div className="p-2 bg-secondary text-white rounded" style={{ fontSize: "0.9rem" }}>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="bi bi-check-circle-fill me-2"></i>
                                                        <span>Image selected:</span>
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                        <Image
                                                            src={previewTaskImage}
                                                            fluid
                                                            style={{ maxHeight: 100, borderRadius: 8, border: "3px solid white" }}
                                                            className="mx-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Form.Group>
                                            <Form.Label>Task Title</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                value={helpForm.task_title}
                                                onChange={(e) => setHelpForm({ ...helpForm, task_title: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                required
                                                value={helpForm.task_description}
                                                onChange={(e) => setHelpForm({ ...helpForm, task_description: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Capacity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={helpForm.capacity}
                                                onChange={(e) => setHelpForm({ ...helpForm, capacity: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={helpForm.date}
                                                onChange={(e) => setHelpForm({ ...helpForm, date: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={helpForm.start_time}
                                                onChange={(e) => setHelpForm({ ...helpForm, start_time: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Duration (minutes)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={helpForm.duration}
                                                onChange={(e) => setHelpForm({ ...helpForm, duration: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Rewards</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={helpForm.task_rewards}
                                                onChange={(e) => setHelpForm({ ...helpForm, task_rewards: e.target.value })}
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-end mt-3">
                                            <Button variant="secondary" className="me-2" onClick={() => setShowHelpForm(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="primary">
                                                {isEditMode ? "Update Help Request" : "Submit Help Request"}
                                            </Button>
                                        </div>
                                    </Form>
                                </Modal.Body>
                            </Modal>

                            <h3 className="text-center fw-bold">Help Requests</h3>
                            <hr />
                            <Button
                                className="mb-3"
                                onClick={() => {
                                    setShowHelpForm(!showHelpForm);
                                    setTaskBeingEdited(null);
                                }}
                            >
                                {showHelpForm ? "Close Help Request Form" : "Request Help"}
                            </Button>

                            <Row className="mt-4">
                                {/* LEFT: Task Title List */}
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
                                                    className={`cursor-pointer position-relative d-flex align-items-center justify-content-between task-item`}
                                                >

                                                    {username === task.username && (
                                                        <i
                                                            className="bi bi-pencil edit-icon text-warning"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditHelp(task);
                                                            }}
                                                            style={{ cursor: "pointer" }}
                                                        ></i>
                                                    )}

                                                    <span className={`cursor-pointer position-relative d-flex align-items-center justify-content-between task-item`} style={{ pointerEvents: "none" }}>
                                                        {task.task_title}
                                                    </span>


                                                    {username === task.username && (
                                                        <i
                                                            className="bi bi-trash delete-icon text-danger-emphasis"
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

                        </>
                    )}

                    {activeTab === "borrow" && (
                        <>
                            <Button className="mb-3" onClick={() => setShowShareForm(!showShareForm)}>
                                {showShareForm ? "Close Share Form" : "Share Items to Neighbours"}
                            </Button>

                            {showShareForm && (
                                <Form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        try {
                                            await axios.post(`${url}/neighbour/share`, {
                                                username,
                                                community_name: communityName,
                                                title: shareForm.title,
                                                description: shareForm.description,
                                                is_borrowable: shareForm.is_borrowable,
                                                borrow_fee: shareForm.borrow_fee,
                                            });
                                            alert("Item shared");
                                            setShowShareForm(false);
                                            setShareForm({
                                                title: "",
                                                description: "",
                                                is_borrowable: true,
                                                borrow_fee: "",
                                            });
                                            fetchShares();
                                        } catch (err) {
                                            console.error("Error sharing item", err);
                                            alert("Failed to share item");
                                        }
                                    }}
                                >
                                    <Form.Group>
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            required
                                            value={shareForm.title}
                                            onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            required
                                            value={shareForm.description}
                                            onChange={(e) => setShareForm({ ...shareForm, description: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check
                                            type="checkbox"
                                            label="Is Borrowable?"
                                            checked={shareForm.is_borrowable}
                                            onChange={(e) => setShareForm({ ...shareForm, is_borrowable: e.target.checked })}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Borrow Fee</Form.Label>
                                        <Form.Control
                                            value={shareForm.borrow_fee}
                                            onChange={(e) => setShareForm({ ...shareForm, borrow_fee: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Button type="submit" className="mt-2">Share Item</Button>
                                </Form>
                            )}

                            <hr />
                            <h5>Available Items</h5>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Borrow Fee</th>
                                        <th>Shared By</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shareList.length === 0 && (
                                        <tr><td colSpan="5">No items available.</td></tr>
                                    )}
                                    {shareList.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.item_name}</td>
                                            <td>{item.item_description}</td>
                                            <td>{item.borrow_fee || "Free"}</td>
                                            <td>{item.poster_username}</td>
                                            <td>
                                                {item.poster_username === username ? (
                                                    <Button
                                                        size="sm"
                                                        variant="warning"
                                                        disabled={!item.is_borrowed}
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post(`${url}/neighbour/share/return`, {
                                                                    username,
                                                                    item_name: item.item_name,
                                                                });
                                                                alert("Item marked as returned");
                                                                fetchShares();
                                                            } catch (err) {
                                                                console.error("Return failed", err);
                                                            }
                                                        }}
                                                    >
                                                        Mark Returned
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        disabled={item.is_borrowed}
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post(`${url}/neighbour/share/borrow`, {
                                                                    username,
                                                                    item_name: item.item_name,
                                                                });
                                                                alert("Item borrowed");
                                                                fetchShares();
                                                            } catch (err) {
                                                                console.error("Borrow failed", err);
                                                            }
                                                        }}
                                                    >
                                                        {item.is_borrowed ? "Unavailable" : "Borrow"}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}


                </Card.Body>
            </Card>
        </Container>
    );
}
