import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase"

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            console.log("Identified user has been changed", auth)
            console.log("This is currentuser", user)
            console.log(user.displayName)
            setCurrentUser(user);
            setLoading(false);

        })
    }, [])

    // const value = 

    return (
        <AuthContext.Provider value={{ currentUser }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}