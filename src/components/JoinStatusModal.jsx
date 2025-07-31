import { Modal, Button, Alert } from "react-bootstrap";

export default function JoinStatusModal({ show, onHide, status, communityName }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: '✅',
                    title: 'Request Sent Successfully!',
                    variant: 'success',
                    bgColor: '#d4edda',
                    textColor: '#155724',
                    message: `Your join request has been sent to ${communityName}. Community leaders will review your request and get back to you soon.`,
                    buttonText: 'Great!',
                    buttonVariant: 'success'
                };
            case 'already_sent':
                return {
                    icon: '⚠️',
                    title: 'Request Already Sent',
                    variant: 'warning',
                    bgColor: '#fff3cd',
                    textColor: '#856404',
                    message: `You have already sent a join request to ${communityName}. Please check your messages for updates or wait for community leaders to respond.`,
                    buttonText: 'Got it',
                    buttonVariant: 'warning'
                };
            case 'failed':
                return {
                    icon: '❌',
                    title: 'Request Failed',
                    variant: 'danger',
                    bgColor: '#f8d7da',
                    textColor: '#721c24',
                    message: `Failed to send join request to ${communityName}. Please check your internet connection and try again later.`,
                    buttonText: 'Try Again Later',
                    buttonVariant: 'danger'
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="md"
            backdrop="static"
        >
            <div className="modal-content border-0 shadow-lg">
                <Modal.Header className="border-0 pb-0">
                    <div className="w-100 text-center">
                        <div
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '80px',
                                height: '80px',
                                background: config.bgColor,
                                borderRadius: '50%',
                                fontSize: '2.5rem',
                                border: `3px solid ${config.textColor}20`
                            }}
                        >
                            {config.icon}
                        </div>
                        <Modal.Title className="h4 mb-0" style={{ color: config.textColor }}>
                            {config.title}
                        </Modal.Title>
                    </div>
                </Modal.Header>

                <Modal.Body className="px-4 pb-4">
                    <Alert
                        variant={config.variant}
                        className="border-0 mb-4"
                        style={{
                            backgroundColor: config.bgColor,
                            color: config.textColor
                        }}
                    >
                        <div className="text-center">
                            <strong className="d-block mb-2">{communityName}</strong>
                            <p className="mb-0 lh-base">
                                {config.message}
                            </p>
                        </div>
                    </Alert>

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="d-flex justify-content-center gap-4 mb-3">
                                <div className="text-center">
                                    <div
                                        className="mb-2 d-inline-block p-2 rounded-circle"
                                        style={{ backgroundColor: '#e3f2fd' }}
                                    >
                                        📧
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Check Messages</small>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="mb-2 d-inline-block p-2 rounded-circle"
                                        style={{ backgroundColor: '#e8f5e8' }}
                                    >
                                        ⏰
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Wait for Approval</small>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="mb-2 d-inline-block p-2 rounded-circle"
                                        style={{ backgroundColor: '#fff3e0' }}
                                    >
                                        🎉
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Join Community</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'already_sent' && (
                        <div className="text-center">
                            <small className="text-muted">
                                💡 <strong>Tip:</strong> You can try joining other communities while waiting for a response.
                            </small>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="text-center">
                            <small className="text-muted">
                                🔧 <strong>Troubleshooting:</strong> Make sure you have a stable internet connection and try again.
                            </small>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0 justify-content-center">
                    <Button
                        variant={config.buttonVariant}
                        onClick={onHide}
                        className="px-4 py-2 fw-semibold"
                        style={{
                            borderRadius: '25px',
                            minWidth: '120px'
                        }}
                    >
                        {config.buttonText}
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}