import './App.css'
import { BrowserRouter, Outlet, Route, Routes, Link } from 'react-router-dom'
import { Navbar, Container, Nav } from 'react-bootstrap'
import Home from './pages/Home'
import { AuthProvider } from './components/AuthProvider'
import Authenticate from './pages/Authentication'
import UserPage from './pages/UserPage'
import UserLayout from './components/UserLayout'
import Community from './pages/Community'
import LogOut from './components/LogOut'
function App() {

  function Layout() {
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
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                <Nav.Link as={Link} to="/">See all Communities </Nav.Link>
                <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                <Nav.Link as={Link} to="/authentication">Log In</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Outlet />
      </>
    )

  }
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="authentication" element={<Authenticate />} />
            </Route>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserPage />} />
              <Route path="community" element={<Community />} />
              <Route path="logout" element={<LogOut />} />
            </Route>

          </Routes>
        </BrowserRouter >
      </AuthProvider>
    </>
  )
}

export default App
