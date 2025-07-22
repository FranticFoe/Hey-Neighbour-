import { Button, Col, Image, Row, Modal, Form, Container, Card, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios"

export default function Authenticate() {
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login");
    const auth = getAuth();
    const { currentUser } = useContext(AuthContext)
    const url = "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev"

    useEffect(() => {
        if (currentUser != null) navigate("/user")
    }, [currentUser, navigate])

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const backendRes = await axios.post(`${url}/signup`, { email, username });
            if (backendRes.data) {
                try {
                    const firebaseRes = await createUserWithEmailAndPassword(auth, email, password);
                    console.log(firebaseRes.user);
                    resetFields();

                    await updateProfile(auth.currentUser, {
                        displayName: username,
                    });
                    console.log("Profile updated successfully");

                } catch (err) {
                    console.error("Error in Firebase sign up:", err);
                }
            }
        } catch (err) {
            console.error("Signup error (backend):", err);
        }
    };



    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const backendRes = await axios.post(`${url}/retrieveEmail`, {
                emailOrUsername: identifier
            });
            if (backendRes.data.auth === true) {
                const normalizedEmail = backendRes.data.email.toLowerCase();
                setEmail(normalizedEmail);
                console.log("backendemail", normalizedEmail);
                try {
                    const res = await signInWithEmailAndPassword(auth, normalizedEmail, password);
                    console.log("Succesfully logged in user", res.user);
                    resetFields();
                    navigate("/user")
                } catch (err) {
                    console.error("Error in Firebase Login", err);
                }
            }
        } catch (err) {
            console.error("backend email retrieval error:", err);
        }
    };


    const resetFields = () => {
        setIdentifier("")
        setEmail("");
        setUsername("");
        setPassword("");
    };


    return (
        <>
            <Container
                fluid
                className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
            >
                <Card
                    className="p-4 shadow border"
                    style={{ width: "100%", maxWidth: "420px", backgroundColor: "#fff" }}
                >
                    <div className="text-center mb-3">
                        <h3 className="fw-bold">
                            {mode === "login" ? "Welcome back!" : "Create your account"}
                        </h3>
                        <p className="text-muted small">
                            {mode === "login"
                                ? "Log in to book your sessions"
                                : "Sign up to get started"}
                        </p>
                    </div>

                    <ToggleButtonGroup
                        type="radio"
                        name="mode"
                        value={mode}
                        onChange={setMode}
                        className="mb-4 d-flex justify-content-center"
                    >
                        <ToggleButton
                            id="login-toggle"
                            value="login"
                            variant={mode === "login" ? "primary" : "outline-primary"}
                            className="w-50"
                        >
                            Login
                        </ToggleButton>
                        <ToggleButton
                            id="signup-toggle"
                            value="signup"
                            variant={mode === "signup" ? "primary" : "outline-primary"}
                            className="w-50"
                        >
                            Sign Up
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Form
                        onSubmit={mode === "login" ? handleLogin : handleSignUp}
                        className="d-grid gap-3"
                    >
                        {mode === "login" ? (
                            <Form.Group>
                                <Form.Label className="text-muted small">Email or Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter email or username"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        ) : (
                            <>
                                <Form.Group>
                                    <Form.Label className="text-muted small">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className="text-muted small">Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </>
                        )}

                        <Form.Group>
                            <Form.Label className="text-muted small">Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="success"
                            className="w-100 rounded-pill fw-bold mt-2"
                        >
                            {mode === "login" ? "Log In" : "Continue"}
                        </Button>

                        {/* {mode === "login" && authFailed === "failed" && (
                            <p className="text-danger text-center mt-2">
                                Incorrect username/email or password
                            </p>
                        )}

                        {mode === "signup" && signStatus === "failed" && (
                            <p className="text-danger text-center mt-2">
                                Username/email already exists. Please enter a different one.
                            </p>
                        )}
                        {mode === "signup" && signStatus === "success" && (
                            <p className="text-success text-center mt-2">
                                Account created successfully. You can now login.
                            </p>
                        )} */}

                        <p className="text-muted small text-center mt-2">
                            By continuing, you agree to the Terms of Service and Privacy Policy.
                        </p>
                    </Form>
                </Card>
            </Container>
        </>
    )
}