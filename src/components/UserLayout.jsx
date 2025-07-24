import { Link, Outlet } from "react-router-dom"
import { Navbar, Container, Nav } from 'react-bootstrap'


export default function UserLayout() {
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
                <Container fluid className="px-3">
                    <Navbar.Brand as={Link} to="/" className="me-4">
                        Hey Neighbour! - Connecting Communities, One Tap at a Time.
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="main-navbar-nav" />
                    <Navbar.Collapse id="main-navbar-nav">
                        <Nav className="ms-auto align-items-center gap-3">
                            <Nav.Link as={Link} to="/user">Home</Nav.Link>
                            <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                            <Nav.Link as={Link} to="/user/community">Community </Nav.Link>
                            <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                            <Nav.Link as={Link} to="/user/messages">Messages</Nav.Link>
                            <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                            <Nav.Link as={Link} to="/user/logout">Logout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Outlet />
        </>
    )
}