import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase"
import axios from "axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [communityName, setCommunityName] = useState("");
    const url = 'https://neighbour-api.vercel.app'

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            // console.log("Identified user has been changed", auth)
            // console.log("This is currentuser", user)
            // console.log(user.displayName)
            setCurrentUser(user);
            setLoading(false);

        })
    }, [])

    useEffect(() => {
        if (!currentUser?.displayName) return;

        async function checkisLeader() {
            try {
                const res = await axios.get(`${url}/neighbour/community/${currentUser?.displayName}`);
                const name = res.data.community[0]?.community_name;
                setCommunityName(name);

            } catch (err) {
                console.error("Error loading community data:", err);
            }
        }
        checkisLeader();
    }, [currentUser?.displayName]);

    // const value = { currentUser }

    return (
        <AuthContext.Provider value={{ currentUser, communityName }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}