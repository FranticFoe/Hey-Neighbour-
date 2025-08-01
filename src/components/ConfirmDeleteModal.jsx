import { Modal, Button } from "react-bootstrap";

export default function ConfirmDeleteModal({ show, onHide, onConfirm, deleteType }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>
                <div className="w-100 text-center">
                    <Modal.Title>
                        Confirm {deleteType === "event" ? "Event" : deleteType === "task" ? "Task" : "Item"} Deletion
                    </Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="w-100 text-center">
                    <p>Are you sure you want to delete this {deleteType}?</p>
                    <p className="text-danger">This action cannot be undone.</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}