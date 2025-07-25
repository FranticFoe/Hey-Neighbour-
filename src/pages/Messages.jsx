import JoinRequestsTab from "../components/JoinRequestTab"
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthProvider";

export default function Messages() {

    const [communityName, setCommunityName] = useState("");
    const { currentUser } = useContext(AuthContext);
    const username = currentUser?.displayName;
    const [isLeader, setIsLeader] = useState(false);
    const url = "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev"

    useEffect(() => {
        async function fetchcommunityName() {
            try {
                const res = await axios.get(`${url}/neighbour/community/${username}`);
                const community = res.data.community;
                if (community[0].community_name != null) {
                    setCommunityName(community[0].community_name);
                }
            } catch (err) {
                console.error("Error checking community:", err);
            }
        }
        fetchcommunityName();
    }, [username]);


    useEffect(() => {
        if (!username) return;

        async function checkisLeader() {
            try {
                const res = await axios.get(`${url}/neighbour/community/${username}`);
                const name = res.data.community[0]?.community_name;
                setCommunityName(name);

                // Check if user is leader
                const leaderRes = await axios.get(
                    `${url}/neighbour/isLeader/${username}/community/${name}`
                );
                console.log("leaderRes", leaderRes)
                setIsLeader(leaderRes.data.status);

            } catch (err) {
                console.error("Error loading community data:", err);
            }
        }
        checkisLeader();
    }, [username]);

    console.log("importantinfo:", username)
    console.log("alsoimportant:", communityName)

    return (
        <>
            {isLeader
                ? <JoinRequestsTab communityName={communityName} currentUsername={username} />
                : <p>Message tab in progress</p>}

        </>
    )
}