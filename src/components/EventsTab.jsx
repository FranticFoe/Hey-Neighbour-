import { useEffect, useState } from "react";
import { Button, Card, Image } from "react-bootstrap";
import axios from "axios";
import EventFormModal from "./EventFormModal";

export default function EventsTab({ url, username, communityName, isLeader, onDeleteEvent }) {
    const [events, setEvents] = useState([]);
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        if (communityName) {
            fetchEvents();
        }
    }, [communityName]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/events/${communityName}`);
            setEvents(res.data.events || []);
        } catch (err) {
            console.error("Error loading events:", err);
        }
    };

    const handleEditEvent = (event) => {
        setShowAddEventForm(true);
        setEditingEvent(event);
    };

    const handleCloseModal = () => {
        setShowAddEventForm(false);
        setEditingEvent(null);
    };

    const handleEventSaved = () => {
        handleCloseModal();
        fetchEvents();
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
            <h3 className="text-center fw-bold">Upcoming Events</h3>
            <hr />

            {isLeader && (
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
                            className="position-absolute top-0 start-50 translate-middle-x"
                            style={{ zIndex: 4, fontSize: "1rem", padding: "0.5rem 1rem" }}
                        >
                            📌
                        </span>

                        {isLeader && (
                            <>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    className="edit-btn position-absolute top-0 start-0 m-2"
                                    onClick={() => handleEditEvent(event)}
                                >
                                    ✏️ Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="delete-btn position-absolute top-0 end-0 m-2"
                                    onClick={() => onDeleteEvent(event.event_id)}
                                >
                                    🗑️ Delete
                                </Button>
                            </>
                        )}

                        {event.event_image_url && (
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    paddingTop: "56.25%",
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

                        <Card.Body className="px-4 py-3">
                            <Card.Title className="fw-bold text-center fs-4 text-primary mb-3 pt-4">
                                {event.event_title}
                            </Card.Title>

                            <div className="mb-3 text-center">
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

            {isLeader && (
                <EventFormModal
                    show={showAddEventForm}
                    onHide={handleCloseModal}
                    onEventSaved={handleEventSaved}
                    editingEvent={editingEvent}
                    url={url}
                    username={username}
                    communityName={communityName}
                />
            )}
        </>
    );
}