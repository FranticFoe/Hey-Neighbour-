import { useEffect, useState, useContext } from "react";
import {
    Container,
    Card,
    ToggleButtonGroup,
    ToggleButton,
    Button,
    Form,
} from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "./AuthProvider";

export default function CommunityTabs() {
    const url =
        "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev";

    const [activeTab, setActiveTab] = useState("event");
    const [events, setEvents] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [communityName, setCommunityName] = useState("");
    const [newEvent, setNewEvent] = useState({
        event_title: "",
        event_description: "",
        date: "",
        start_time: "",
        end_time: "",
    });

    const [showHelpForm, setShowHelpForm] = useState(false);
    const [helpList, setHelpList] = useState([]);
    const [helpForm, setHelpForm] = useState({
        task_title: "",
        task_description: "",
        capacity: "",
        date: "",
        start_time: "",
        duration: "",
        task_rewards: "",
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


    const handleSubmitHelp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${url}/neighbour/help`, {
                neighbour_username: username,
                community_name: communityName,
                ...helpForm,
            });
            alert("Help request submitted");
            setShowHelpForm(false);
            setHelpForm({
                task_title: "",
                task_description: "",
                capacity: "",
                date: "",
                start_time: "",
                duration: "",
                task_rewards: "",
            });
            fetchHelpRequests(); // Refresh list
        } catch (err) {
            console.error("Error submitting help request", err);
            alert("Failed to submit help request");
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



    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${url}/neighbour/create/events`, {
                ...newEvent,
                community_name: communityName,
                leader_name: username,
            });
            alert("Event created");
            setShowAddEventForm(false);
            setNewEvent({
                event_title: "",
                event_description: "",
                date: "",
                start_time: "",
                end_time: "",
            });

            // Refresh event list
            const res = await axios.get(`${url}/neighbour/events/${communityName}`);
            setEvents(res.data.events || []);
        } catch (err) {
            console.error("Error creating event:", err);
            alert("Failed to create event");
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
                            {isLeader && !showAddEventForm && (
                                <Button variant="success" onClick={() => setShowAddEventForm(true)}>
                                    Add Event
                                </Button>
                            )}

                            {isLeader && showAddEventForm && (
                                <Form onSubmit={handleCreateEvent} className="mt-3">
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

                                    <div className="mt-3 d-flex gap-2">
                                        <Button type="submit" variant="primary">
                                            Submit
                                        </Button>
                                        <Button variant="secondary" onClick={() => setShowAddEventForm(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            )}

                            <hr />
                            <h5>Upcoming Events</h5>
                            {events.length === 0 ? (
                                <p>No events yet.</p>
                            ) : (
                                events.map((event, idx) => (
                                    <Card key={idx} className="my-2">
                                        <Card.Body>
                                            <Card.Title>{event.event_title}</Card.Title>
                                            <Card.Text>{event.event_description}</Card.Text>
                                            <p>
                                                <strong>Date:</strong> {event.date}
                                                <br />
                                                <strong>Time:</strong> {event.start_time} - {event.end_time}
                                            </p>

                                        </Card.Body>
                                    </Card>
                                ))
                            )}
                        </>
                    )}

                    {activeTab === "help" && (
                        <>
                            <Button className="mb-3" onClick={() => setShowHelpForm(!showHelpForm)}>
                                {showHelpForm ? "Close Help Request Form" : "Request Help"}
                            </Button>

                            {showHelpForm && (
                                <Form onSubmit={handleSubmitHelp}>
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
                                    <Button type="submit" className="mt-2">Submit Help Request</Button>
                                </Form>
                            )}


                            <hr />
                            <h5>Help Requests</h5>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Rewards</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Capacity</th>
                                        <th>Helpers</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {helpList.length === 0 && (
                                        <tr>
                                            <td colSpan="7">No help requests yet.</td>
                                        </tr>
                                    )}
                                    {helpList.map((task) => (
                                        <tr key={task.id}>
                                            <td>{task.task_title}</td>
                                            <td>{task.description}</td>
                                            <td>{!task.task_rewards ? "none" : task.task_rewards}</td>
                                            <td>{task.date === null ? "any" : task.date}</td>
                                            <td>{task.start_time === null ? "any" : task.start_time} - {task.end_time === null ? "" : task.end_time}</td>
                                            <td>{task.capacity ?? "∞"}</td>
                                            <td>{task.current_helper ?? 0}</td>
                                            <td>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleHelp(task.id)}
                                                    disabled={task.status || task.username === username}
                                                >
                                                    {task.status ? "Full" : "Help"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
