import { useEffect, useState } from "react";
import { Row, Col, Card, ListGroup, Image } from "react-bootstrap";
import axios from "axios";

export default function CommunityMembersTab({ url, username, communityName, currentUser }) {
    const [members, setCommunityMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

    const defaultPic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

    useEffect(() => {
        if (communityName && username) {
            fetchCommunityMembers();
        }
    }, [communityName, username]);

    const fetchCommunityMembers = async () => {
        try {
            const res = await axios.get(`${url}/neighbour/members/${communityName}/${username}`);
            setCommunityMembers(res.data.members);
        } catch (err) {
            console.error("Error fetching community members:", err);
        }
    };

    function formatDate(isoDate) {
        if (!isoDate) return "N/A";
        const d = new Date(isoDate);
        if (isNaN(d)) return "N/A";
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    return (
        <Row className="mt-4">
            {/* LEFT COLUMN – MEMBER LIST */}
            <Col md={4}>
                <Card className="h-100">
                    <Card.Header className="bg-dark text-white text-center position-relative">
                        👥 Member Names
                    </Card.Header>
                    <ListGroup variant="flush">
                        {members.filter((m) => m.username !== currentUser.username).map((member) => (
                            <ListGroup.Item
                                key={member.username}
                                action
                                onClick={() => setSelectedMember(member)}
                                active={selectedMember?.username === member.username}
                                className="d-flex align-items-center justify-content-between task-item"
                            >
                                <span className="badge bg-primary me-2">{member.reputation}</span>
                                <div className="d-flex align-items-center w-100">
                                    <Image
                                        src={member.profile_image_url || defaultPic}
                                        roundedCircle
                                        style={{ width: 40, height: 40, objectFit: "cover", marginRight: 10 }}
                                    />
                                    <div className="text-start flex-grow-1" style={{ pointerEvents: "none" }}>
                                        <strong>{member.profile_name || member.username}</strong>
                                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>@{member.username}</div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            </Col>

            {/* RIGHT COLUMN – MEMBER DETAILS */}
            <Col md={8}>
                <Card className="h-100">
                    <Card.Header className="bg-primary text-white text-center">
                        {selectedMember ? `${selectedMember.profile_name || selectedMember.username}'s Info` : "ℹ️ About Member"}
                    </Card.Header>
                    <Card.Body>
                        {selectedMember ? (
                            <>
                                <div className="text-center mb-3">
                                    <Image
                                        src={selectedMember.profile_image_url || defaultPic}
                                        roundedCircle
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "cover",
                                            border: "2px solid #ddd",
                                        }}
                                    />
                                    <h5 className="mt-2">{selectedMember.profile_name || selectedMember.username}</h5>
                                    <div className="text-muted">@{selectedMember.username}</div>
                                </div>

                                <p><strong>Description:</strong> {selectedMember.profile_description || "No description provided."}</p>
                                <p><strong>Reputation:</strong> {selectedMember.reputation}</p>
                                <p><strong>Joined:</strong> {formatDate(selectedMember.joined_date)}</p>
                                <p><strong>Community:</strong> {selectedMember.community_name}</p>
                            </>
                        ) : (
                            <p className="text-center text-muted">
                                Select a member from the list to view details.
                            </p>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}