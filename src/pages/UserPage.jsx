import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/AuthProvider";

export default function UserPage() {
    const url = "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev";
    const { currentUser } = useContext(AuthContext);

    function Profile() {
        const [profileData, setProfileData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const username = currentUser?.displayName;

        useEffect(() => {
            async function fetchProfile() {
                try {
                    const res = await axios.get(`${url}/neighbour/profile/${username}`);
                    setProfileData(res.data);
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                    setError("Failed to load profile");
                } finally {
                    setLoading(false);
                }
            }

            if (username) fetchProfile();
        }, [username]);

        if (loading) return <Spinner animation="border" variant="primary" />;
        if (error) return <p>{error}</p>;
        if (!profileData || !profileData.profile || profileData.profile.length === 0) {
            return <p>No profile found.</p>;
        }

        const profile = profileData.profile[0];

        return (
            <Card style={{ width: "22rem", margin: "auto", marginTop: "2rem" }}>
                <Card.Body>
                    <Card.Title>{profile.profile_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">@{profile.username}</Card.Subtitle>
                    <Card.Text>
                        Bio: {profile.profile_description || "No bio yet."}
                        <br />
                        Joined: {new Date(profile.joined_date).toLocaleDateString()}
                    </Card.Text>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Profile />
        </>
    );
}
