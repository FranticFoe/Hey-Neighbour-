import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // adjust path as needed

export default function LogOut() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await auth.signOut();
                navigate("/");
            } catch (error) {
                console.error("Logout failed:", error);
            }
        };
        logout();
    }, [navigate]);

    return null; // optional: or return a spinner/loading UI
}