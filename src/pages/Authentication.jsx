import { Button, Col, Image, Row, Modal, Form, Container, Card, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Authenticate() {
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login");
    const auth = getAuth();
    const { currentUser } = useContext(AuthContext)
    const [showPasswordError, setShowPasswordError] = useState(false);

    const url = "https://neighbour-api.vercel.app"

    const provider = new GoogleAuthProvider();

    async function processGoogleUser(res) {
        try {
            // res might be a UserCredential (res.user) or a Firebase User (res).
            const user = res && res.user ? res.user : res;
            console.log("gmail sign in:", res);
            console.log("usergmail:", user.email);
            console.log("username:", user.displayName);

            const email = user.email;
            const username = user.displayName;

            // preserve your original backend checks
            const checkExist = await axios.get(`${url}/checkGmailsignin/${encodeURIComponent(email)}`);
            console.log(checkExist);
            if (checkExist.data) {
                try {
                    const backendRes = await axios.post(`${url}/signup`, { email, username });
                    if (backendRes.data) {
                        try {
                            // NOTE: this mirrors your original code exactly.
                            // createUserWithEmailAndPassword will fail if `password` is empty.
                            const firebaseRes = await createUserWithEmailAndPassword(getAuth(), email, password);
                            console.log(firebaseRes.user);
                            resetFields();

                            await updateProfile(getAuth().currentUser, {
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
            }
        } catch (err) {
            console.error("Error processing Google user:", err);
        }
    }

    const handleGoogleLogIn = async (e) => {
        e.preventDefault();
        try {
            provider.setCustomParameters({
                prompt: "select_account",
            });

            const auth = getAuth();

            if (window.innerWidth >= 1024) {
                // Desktop/laptop: use popup (immediate result)
                const res = await signInWithPopup(auth, provider);
                await processGoogleUser(res);
            } else {
                // Mobile/tablet: do a redirect (result handled in getRedirectResult)
                await signInWithRedirect(auth, provider);
            }
        } catch (err) {
            console.error("Error signing in with Google", err);
        }
    };

    // On mount: handle the redirect result (mobile flow)
    useEffect(() => {
        const auth = getAuth();
        getRedirectResult(auth)
            .then(async (result) => {
                if (result && result.user) {
                    await processGoogleUser(result);
                }
            })
            .catch((err) => {
                // ignore user-cancelled redirect if needed, otherwise log
                console.error("Redirect result error:", err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (currentUser != null) navigate("/user")
    }, [currentUser, navigate])

    const handleSignUp = async (e) => {
        e.preventDefault();
        setShowPasswordError(false); // reset on new attempt

        function validatePassword(password) {
            if (password.length < 6) {
                return "Password must be at least 6 characters long.";
            }
            return null;
        }

        const error = validatePassword(password);
        if (error) {
            setShowPasswordError(true); // Show the error after submit
            return;
        }

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
                                ? <p className="text-center">Sign in to Hey Neighbour with one of the options below or your credentials.</p>
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
                            <>
                                <Button onClick={handleGoogleLogIn} style={{ fontFamily: "sans-serif" }} className="rounded-pill d-flex justify-content-center align-items-center gap-2" variant="outline-dark"><i className="bi bi-google" ></i> Continue with Google</Button>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    textAlign: "center",
                                    margin: "1rem 0"
                                }}>
                                    <div style={{ flex: 1, borderBottom: "1px solid #ccc" }}></div>
                                    <div style={{ padding: "0 10px", fontFamily: "sans-serif" }}>or</div>
                                    <div style={{ flex: 1, borderBottom: "1px solid #ccc" }}></div>
                                </div>
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
                            </>) : (
                            <>
                                <Button onClick={handleGoogleLogIn} style={{ fontFamily: "sans-serif" }} className="rounded-pill d-flex justify-content-center align-items-center gap-2" variant="outline-dark"><i className="bi bi-google" ></i> Sign up with Google</Button>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    textAlign: "center",
                                    margin: "1rem 0"
                                }}>
                                    <div style={{ flex: 1, borderBottom: "1px solid #ccc" }}></div>
                                    <div style={{ padding: "0 10px", fontFamily: "sans-serif" }}>or</div>
                                    <div style={{ flex: 1, borderBottom: "1px solid #ccc" }}></div>
                                </div>
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
                        {mode === "signup" && showPasswordError && (
                            <p style={{ color: "red", marginBottom: "10px" }}>
                                The password must be at least 6 characters long.
                            </p>
                        )}

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