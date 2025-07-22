import { useEffect } from "react"
import { AuthContext } from "../components/AuthProvider"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext)
    useEffect(() => {
        if (currentUser != null) navigate("/user")
    }, [currentUser, navigate])

    return (
        <p>This is the landing page. Display all app functions in a slideshow picture here.</p>
    )
}