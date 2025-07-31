import { Modal, Button, Card } from "react-bootstrap";

export default function JoinConfirmModal({ show, onHide, onConfirm, communityName }) {
    return (
        <Modal show={show} onHide={onHide} centered size="md">
            <div className="modal-content border-0 shadow-lg">
                <Modal.Header className="border-0 pb-0">
                    <div className="w-100 text-center">
                        <div 
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                borderRadius: '50%',
                                fontSize: '2rem'
                            }}
                        >
                            🏘️
                        </div>
                        <Modal.Title className="h4 mb-0">
                            Join Community
                        </Modal.Title>
                    </div>
                </Modal.Header>
                
                <Modal.Body className="px-4 pb-4">
                    <Card className="border-0 bg-light">
                        <Card.Body className="text-center p-4">
                            <h5 className="mb-3">
                                Ready to join <span className="text-primary fw-bold">{communityName}</span>?
                            </h5>
                            
                            <div className="mb-4">
                                <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                                    <div className="text-center">
                                        <div className="mb-2">
                                            <span 
                                                className="d-inline-block p-3 rounded-circle text-white"
                                                style={{ backgroundColor: '#28a745' }}
                                            >
                                                🤝
                                            </span>
                                        </div>
                                        <small className="text-muted">Connect</small>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="mb-2">
                                            <span 
                                                className="d-inline-block p-3 rounded-circle text-white"
                                                style={{ backgroundColor: '#17a2b8' }}
                                            >
                                                📅
                                            </span>
                                        </div>
                                        <small className="text-muted">Events</small>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="mb-2">
                                            <span 
                                                className="d-inline-block p-3 rounded-circle text-white"
                                                style={{ backgroundColor: '#ffc107' }}
                                            >
                                                🔄
                                            </span>
                                        </div>
                                        <small className="text-muted">Share</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="alert alert-info border-0 mb-0" style={{ backgroundColor: '#e3f2fd' }}>
                                <small className="text-muted">
                                    💡 <strong>Note:</strong> Your join request will be sent to community leaders for approval.
                                    You'll be notified once your request is reviewed.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                
                <Modal.Footer className="border-0 pt-0 gap-3">
                    <Button 
                        variant="outline-secondary" 
                        onClick={onHide}
                        className="px-4 py-2"
                        style={{ borderRadius: '25px' }}
                    >
                        <span className="me-1">❌</span>
                        Cancel
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={onConfirm}
                        className="px-4 py-2 fw-semibold"
                        style={{ 
                            borderRadius: '25px',
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                        }}
                    >
                        <span className="me-1">✨</span>
                        Send Join Request
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}