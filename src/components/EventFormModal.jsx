import { useState, useEffect } from "react";
import { Modal, Form, Button, Image } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";

export default function EventFormModal({ show, onHide, onEventSaved, editingEvent, url, username, communityName }) {
    const [newEvent, setNewEvent] = useState({
        event_title: "",
        event_description: "",
        date: "",
        start_time: "",
        end_time: "",
        event_image_url: "",
    });
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (editingEvent) {
            setNewEvent({
                ...editingEvent,
                event_image_url: editingEvent.event_image_url || "",
                date: editingEvent.date ? editingEvent.date.slice(0, 10) : "",
            });
            setPreviewImage(editingEvent.event_image_url || null);
        } else {
            resetForm();
        }
    }, [editingEvent]);

    const resetForm = () => {
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
                event_id: editingEvent?.event_id,
            };

            if (editingEvent) {
                await axios.put(`${url}/neighbour/events/update`, eventPayload);
                alert("Event updated");
            } else {
                await axios.post(`${url}/neighbour/create/events`, eventPayload);
                alert("Event created");
            }

            onEventSaved();
        } catch (err) {
            console.error("Error saving event:", err);
            alert("Failed to save event");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
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
                            onChange={handleImageChange}
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
                        <Button variant="secondary" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Submit
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}