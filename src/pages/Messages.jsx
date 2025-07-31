import JoinRequestsTab from "../components/JoinRequestTab"
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthProvider";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
export default function Messages() {

    const [communityName, setCommunityName] = useState("");
    const { currentUser } = useContext(AuthContext);
    const username = currentUser?.displayName;
    const [isLeader, setIsLeader] = useState(false);
    const url = "https://neighbour-api.vercel.app"

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

            <div className="p-2 text-center">
                {isLeader
                    ? <JoinRequestsTab communityName={communityName} currentUsername={username} />

                    : <p className="mt-3" style={{ fontSize: "1.2rem" }}>
                        Message tab is still in progress. For now use{" "}
                        <img
                            onClick={() => window.open("https://web.whatsapp.com/")}
                            src="https://images.seeklogo.com/logo-png/16/1/whatsapp-logo-png_seeklogo-168310.png"
                            alt="WhatsApp"
                            style={{
                                width: "24px",
                                height: "24px",
                                cursor: "pointer",
                                verticalAlign: "middle",
                                marginLeft: "4px"
                            }}
                        />
                    </p>}
            </div>
        </>
    )
}