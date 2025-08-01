import { useState, useEffect } from "react";
import { Modal, Form, Button, Image } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";

export default function ShareFormModal({
    show,
    onHide,
    isEditingShare,
    editingItemId,
    editingItem,
    url,
    username,
    communityName
}) {
    const [shareForm, setShareForm] = useState({
        title: "",
        description: "",
        is_borrowable: true,
        borrow_fee: "",
        item_image_url: "",
    });
    const [newShareImage, setNewShareImage] = useState(null);
    const [previewShareImage, setPreviewShareImage] = useState(null);

    useEffect(() => {
        if (isEditingShare && editingItem) {
            setShareForm({
                title: editingItem.item_name || "",
                description: editingItem.item_description || "",
                is_borrowable: editingItem.is_borrowable ?? true,
                borrow_fee: editingItem.borrow_fee || "",
                item_image_url: editingItem.item_image_url || "",
            });
            setPreviewShareImage(editingItem.item_image_url || null);
        } else {
            resetForm();
        }
    }, [isEditingShare, editingItem]);

    const resetForm = () => {
        setShareForm({
            title: "",
            description: "",
            is_borrowable: true,
            borrow_fee: "",
            item_image_url: "",
        });
        setNewShareImage(null);
        setPreviewShareImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = shareForm.item_image_url || "";

            if (newShareImage) {
                const imageRef = ref(storage, `share/${newShareImage.name}`);
                await uploadBytes(imageRef, newShareImage);
                imageUrl = await getDownloadURL(imageRef);
            }

            if (isEditingShare) {
                await axios.put(`${url}/neighbour/share/update`, {
                    username,
                    item_id: editingItemId,
                    item_name: shareForm.title,
                    description: shareForm.description,
                    is_borrowable: shareForm.is_borrowable,
                    borrow_fee: shareForm.borrow_fee,
                    item_image_url: imageUrl,
                });
                alert("Item updated");
            } else {
                await axios.post(`${url}/neighbour/share`, {
                    username,
                    community_name: communityName,
                    title: shareForm.title,
                    description: shareForm.description,
                    is_borrowable: shareForm.is_borrowable,
                    borrow_fee: shareForm.borrow_fee,
                    item_image_url: imageUrl,
                });
                alert("Item shared");
            }

            onHide();
        } catch (err) {
            console.error("Error submitting item", err);
            alert("Failed to submit item");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewShareImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewShareImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditingShare ? "Edit Shared Item" : "Share an Item"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formImage" className="mt-2">
                        <Form.Label>Item Image</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Form.Group>

                    {previewShareImage && (
                        <div className="mt-2">
                            <div className="p-2 mt-2 bg-secondary text-white rounded" style={{ fontSize: "0.9rem" }}>
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    <span>Image selected:</span>
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    <Image
                                        src={previewShareImage}
                                        fluid
                                        style={{ maxHeight: 100, borderRadius: 8, border: "3px solid white" }}
                                        className="mx-1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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

                    <Form.Group className="mt-2">
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

                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="secondary" className="me-2" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {isEditingShare ? "Confirm Edit" : "Share Item"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}