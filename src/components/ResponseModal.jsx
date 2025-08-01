import { Modal, Button } from "react-bootstrap";

export default function ResponseModal({ show, onHide, message }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>
                <div className="w-100 text-center">
                    <Modal.Title>Status</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="w-100 text-center">
                    {message}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}