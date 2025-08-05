import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { useContext } from "react"
import { AuthContext } from "./AuthProvider"
import { NotificationContext } from "./NotificationProvider"

export default function UserLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const [count, setCount] = useState(0);
    const [, setIsLeader] = useState(false);
    const { currentUser, communityName } = useContext(AuthContext);
    const username = currentUser?.displayName;
    const url = "https://neighbour-api.vercel.app"
    const { refreshKey } = useContext(NotificationContext);
    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
    }, [location])

    useEffect(() => {
        if (!username) return;

        async function checkisLeader() {
            try {
                const res = await axios.get(`${url}/neighbour/community/${username}`);
                const name = res.data.community[0]?.community_name;
                // Check if user is leader
                const leaderRes = await axios.get(
                    `${url}/neighbour/isLeader/${username}/community/${name}`
                );

                setIsLeader(leaderRes.data.status);

            } catch (err) {
                console.error("Error loading community data:", err);
            }
        }
        checkisLeader();
    }, [username]);

    useEffect(() => {
        async function fetchUnreadCount() {
            console.log("communityName:", communityName)
            try {
                const res = await axios.get(`${url}/neighbour/unread_count`, {
                    params: { username, community_name: communityName }
                });
                setCount(parseInt(res.data.unread_count || 0));
            } catch (err) {
                console.error("Failed to fetch unread count", err);
            }
        }


        if (username) {
            fetchUnreadCount();
        }
    }, [username, communityName, refreshKey]);


    const navLinks = [
        { to: "/user", label: "Home", icon: "🏠" },
        { to: "/user/community", label: "Community", icon: "👥" },
        {
            to: "/user/messages", label: <> Mailbox  {count !== 0 ? "📫" : "📪"} {count !== 0 && (
                <span className="badge bg-danger rounded-pill ms-2">
                    {count}
                </span>
            )}</>,
        },
        { to: "/user/logout", label: "Logout", icon: "🚪" }
    ]

    const isActiveLink = (path) => {
        if (path === "/user") {
            return location.pathname === "/user"
        }
        return location.pathname.startsWith(path)
    }

    return (
        <>
            <nav className={`modern-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    {/* Brand */}
                    <Link to="/" className="brand">
                        <img src="/community_logo.png" alt="Hey Neighbour Logo" className="brand-logo mt-2" />
                        <div className="brand-text">
                            <span className="brand-name">Hey Neighbour!</span>
                            <span className="brand-tagline">Connecting Communities</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="nav-links desktop-only">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`nav-link ${isActiveLink(link.to) ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                <span className="nav-text">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn mobile-only"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-nav-content">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`mobile-nav-link ${isActiveLink(link.to) ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                <span className="nav-text">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            <style jsx>{`
                .modern-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .modern-navbar.scrolled {
                    background: rgba(102, 126, 234, 0.95);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                }

                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 70px;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    color: white;
                    transition: transform 0.2s ease;
                }

                .brand:hover {
                    transform: scale(1.02);
                    color: white;
                    text-decoration: none;
                }

                .brand-icon {
                    font-size: 2rem;
                    animation: wave 2s ease-in-out infinite;
                }

                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-10deg); }
                }

                .brand-text {
                    display: flex;
                    flex-direction: column;
                }

                .brand-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    line-height: 1.2;
                }

                .brand-tagline {
                    font-size: 0.75rem;
                    opacity: 0.9;
                    font-weight: 400;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 50px;
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .nav-link::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }

                .nav-link:hover::before {
                    left: 100%;
                }

                .nav-link:hover {
                    color: white;
                    text-decoration: none;
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .nav-link.active {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .nav-icon {
                    font-size: 1.1rem;
                }

                .mobile-menu-btn {
                    background: none;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: background-color 0.2s ease;
                }

                .mobile-menu-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .hamburger {
                    width: 24px;
                    height: 18px;
                    position: relative;
                    transform: rotate(0deg);
                    transition: 0.3s ease-in-out;
                }

                .hamburger span {
                    display: block;
                    position: absolute;
                    height: 2px;
                    width: 100%;
                    background: white;
                    border-radius: 2px;
                    opacity: 1;
                    left: 0;
                    transform: rotate(0deg);
                    transition: 0.25s ease-in-out;
                }

                .hamburger span:nth-child(1) {
                    top: 0px;
                }

                .hamburger span:nth-child(2) {
                    top: 8px;
                }

                .hamburger span:nth-child(3) {
                    top: 16px;
                }

                .hamburger.active span:nth-child(1) {
                    top: 8px;
                    transform: rotate(135deg);
                }

                .hamburger.active span:nth-child(2) {
                    opacity: 0;
                    left: -60px;
                }

                .hamburger.active span:nth-child(3) {
                    top: 8px;
                    transform: rotate(-135deg);
                }

                .mobile-nav {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    transform: translateY(-100%);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .mobile-nav.open {
                    transform: translateY(0);
                    opacity: 1;
                    visibility: visible;
                }

                .mobile-nav-content {
                    padding: 1rem 2rem 2rem;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    margin: 4px 0;
                    border-radius: 12px;
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .mobile-nav-link:hover,
                .mobile-nav-link.active {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    text-decoration: none;
                    transform: translateX(8px);
                }

                .mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    backdrop-filter: blur(2px);
                }

                .main-content {
                    margin-top: 70px;
                    min-height: calc(100vh - 70px);
                }

                .desktop-only {
                    display: flex;
                }

                .mobile-only {
                    display: none;
                }

                @media (max-width: 768px) {
                    .navbar-container {
                        padding: 0 1rem;
                    }

                    .brand-tagline {
                        display: none;
                    }

                    .desktop-only {
                        display: none;
                    }

                    .mobile-only {
                        display: block;
                    }
                }

                @media (max-width: 480px) {
                    .brand-name {
                        font-size: 1.1rem;
                    }

                    .brand-icon {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </>

    )
}