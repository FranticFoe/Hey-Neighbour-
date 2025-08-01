import { useEffect, useState } from "react";
import { Button, Row, Col, Card, ListGroup, Image } from "react-bootstrap";
import axios from "axios";
import ShareFormModal from "./ShareFormModal";

export default function BorrowShareTab({ url, username, communityName, onDeleteShare }) {
    const [shareList, setShareList] = useState([]);
    const [selectedShare, setSelectedShare] = useState(null);
    const [showShareForm, setShowShareForm] = useState(false);
    const [showUserRequests, setShowUserRequests] = useState(false);
    const [shareHeaderTitle, setShareHeaderTitle] = useState("Items Available for Borrowing");
    const [isEditingShare, setIsEditingShare] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => {
        if (communityName) {
            fetchShares();
        }
    }, [communityName]);

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

    const fetchUserShareList = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/share/user/${username}`);
            setShareList(res.data.shares);
        } catch (error) {
            console.error("Failed to fetch user shares:", error);
        }
    };

    const handleShareShuffleClick = async () => {
        try {
            if (showUserRequests) {
                await fetchShares();
                setShareHeaderTitle("Shareable Items");
            } else {
                await fetchUserShareList();
                setShareHeaderTitle("Your Shared Items");
            }
            setShowUserRequests(!showUserRequests);
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };

    const handleEditShare = (item) => {
        setIsEditingShare(true);
        setEditingItemId(item.id);
        setShowShareForm(true);
    };

    const handleBorrow = async (itemName) => {
        try {
            await axios.post(`${url}/neighbour/share/borrow`, {
                username,
                item_name: itemName,
            });
            alert("Item borrowed");
            fetchShares();
        } catch (err) {
            console.error("Borrow failed", err);
            alert("Failed to borrow item");
        }
    };

    const handleReturn = async (itemName) => {
        try {
            await axios.post(`${url}/neighbour/share/return`, {
                username,
                item_name: itemName,
            });
            alert("Item marked as returned");
            fetchShares();
        } catch (err) {
            console.error("Return failed", err);
            alert("Failed to return item");
        }
    };

    const handleFormClosed = () => {
        setShowShareForm(false);
        setIsEditingShare(false);
        setEditingItemId(null);
        fetchShares();
    };

    return (
        <>
            <h3 className="text-center fw-bold">Available Items</h3>
            <hr />

            <Button className="mb-3" onClick={() => setShowShareForm(true)}>
                Share Items to Neighbours
            </Button>

            <Row className="mt-4">
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-dark text-white text-center position-relative">
                            <i
                                className="bi bi-shuffle position-absolute start-0 ms-3 shuffle-icon"
                                onClick={handleShareShuffleClick}
                                title="Toggle Your Requests"
                                style={{ cursor: 'pointer' }}
                            />
                            📦 {shareHeaderTitle}
                        </Card.Header>
                        <ListGroup variant="flush">
                            {shareList.length === 0 && (
                                <ListGroup.Item>No items available.</ListGroup.Item>
                            )}
                            {shareList.map((item) => (
                                <ListGroup.Item
                                    action
                                    key={item.id}
                                    onClick={() => setSelectedShare(item)}
                                    active={selectedShare?.id === item.id}
                                    className="d-flex justify-content-between align-items-center task-item"
                                >
                                    <div className="d-flex align-items-center justify-content-between w-100">
                                        {item.poster_username === username ? (
                                            <i
                                                className="bi bi-pencil edit-icon text-warning me-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditShare(item);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            />
                                        ) : (
                                            <span style={{ width: "1.5rem" }}></span>
                                        )}

                                        <div className="flex-grow-1 text-center" style={{ pointerEvents: "none" }}>
                                            <span className="task-item">{item.item_name}</span>
                                        </div>

                                        {item.poster_username === username ? (
                                            <i
                                                className="bi bi-trash delete-icon text-danger-emphasis ms-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteShare(item.id);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            />
                                        ) : (
                                            <span style={{ width: "1.5rem" }}></span>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white text-center">
                            {selectedShare ? selectedShare.item_name : "📋 Item Details"}
                        </Card.Header>
                        <Card.Body>
                            {selectedShare ? (
                                <>
                                    <p className="text-center">
                                        <strong>Shared By:</strong>{" "}
                                        {selectedShare.poster_username === username
                                            ? "Yourself"
                                            : selectedShare.poster_username}
                                    </p>

                                    {selectedShare.item_image_url && (
                                        <div className="text-center mb-3">
                                            <Image
                                                src={selectedShare.item_image_url}
                                                fluid
                                                style={{
                                                    maxHeight: "400px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "2px solid #ddd",
                                                }}
                                            />
                                        </div>
                                    )}

                                    <p>
                                        <strong>Description:</strong> {selectedShare.item_description}
                                    </p>
                                    <p>
                                        <strong>Borrow Fee:</strong>{" "}
                                        {selectedShare.borrow_fee || "Free"}
                                    </p>
                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {selectedShare.is_borrowed ? "Borrowed" : "Available"}
                                    </p>

                                    <div className="text-center">
                                        {selectedShare.poster_username === username ? (
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                disabled={!selectedShare.is_borrowed}
                                                onClick={() => handleReturn(selectedShare.item_name)}
                                            >
                                                Mark Returned
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                disabled={selectedShare.is_borrowed}
                                                onClick={() => handleBorrow(selectedShare.item_name)}
                                            >
                                                {selectedShare.is_borrowed ? "Unavailable" : "Borrow"}
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-muted">
                                    Select an item from the list to view details.
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <ShareFormModal
                show={showShareForm}
                onHide={handleFormClosed}
                isEditingShare={isEditingShare}
                editingItemId={editingItemId}
                editingItem={isEditingShare ? selectedShare : null}
                url={url}
                username={username}
                communityName={communityName}
            />
        </>
    );
}