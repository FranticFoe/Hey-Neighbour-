import { useState, useEffect } from "react";
import { Modal, Form, Button, Image } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";

export default function HelpFormModal({ show, onHide, taskBeingEdited, url, username, communityName }) {
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
    const [newTaskImage, setNewTaskImage] = useState(null);
    const [previewTaskImage, setPreviewTaskImage] = useState(null);

    const isEditMode = taskBeingEdited !== null;

    useEffect(() => {
        if (taskBeingEdited) {
            setHelpForm({
                task_title: taskBeingEdited.task_title ?? "",
                task_description: taskBeingEdited.description ?? "",
                capacity: taskBeingEdited.capacity ?? "",
                date: taskBeingEdited.date ? taskBeingEdited.date.slice(0, 10) : "",
                start_time: taskBeingEdited.start_time ?? "",
                duration: taskBeingEdited.duration ?? "",
                task_rewards: taskBeingEdited.task_rewards ?? "",
                task_image_url: taskBeingEdited.task_image_url ?? "",
            });
            setPreviewTaskImage(taskBeingEdited.task_image_url || null);
        } else {
            resetForm();
        }
    }, [taskBeingEdited]);

    const resetForm = () => {
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
    };

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
                    username: username,
                    task_id: taskBeingEdited.id,
                    community_name: communityName,
                    task_image_url: imageUrl,
                    ...helpForm,
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

            onHide();
        } catch (err) {
            console.error("Error submitting help request", err);
            alert("Failed to submit task");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewTaskImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewTaskImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
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
                            onChange={handleImageChange}
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
                        <Button variant="secondary" className="me-2" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {isEditMode ? "Update Help Request" : "Submit Help Request"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}