import './App.css'
import { BrowserRouter, Outlet, Route, Routes, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import { AuthProvider } from './components/AuthProvider'
import Authenticate from './pages/Authentication'
import UserPage from './pages/UserPage'
import UserLayout from './components/UserLayout'
import CommunityList from './pages/CommunityList'
import LogOut from './components/LogOut'
import Messages from './pages/Messages'
import Community from './pages/Community'

function App() {
  function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

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

    const navLinks = [
      { to: "/", label: "Home", icon: "🏠" },
      { to: "/communities", label: "Communities", icon: "🏘️" },
      { to: "/authentication", label: "Log In", icon: "🔐" }
    ]

    const isActiveLink = (path) => {
      if (path === "/") {
        return location.pathname === "/"
      }
      return location.pathname.startsWith(path)
    }

    return (
      <>
        <nav className={`public-navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="navbar-container">
            {/* Brand */}
            <Link to="/" className="brand">
              <div className="brand-icon">👋</div>
              <div className="brand-text">
                <span className="brand-name">Hey Neighbour!</span>
                <span className="brand-tagline">Connecting Communities, One Tap at a Time</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links desktop-only">
              {navLinks.map((link) => (
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

        {/* Footer */}
        <Footer />

        <style jsx>{`
          .public-navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          .public-navbar.scrolled {
            background: rgba(79, 172, 254, 0.95);
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="authentication" element={<Authenticate />} />
              <Route path="communities" element={<CommunityList />} />
            </Route>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserPage />} />
              <Route path="community" element={<Community />} />
              <Route path="messages" element={<Messages />} />
              <Route path="logout" element={<LogOut />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

// Reusable Footer Component (can be copied to UserLayout)
function Footer() {

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Communities", href: "/communities" },
      { label: "Safety", href: "#safety" },
      { label: "Privacy", href: "#privacy" }
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Contact", href: "#contact" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" }
    ],
    support: [
      { label: "Help Center", href: "#help" },
      { label: "Community Guidelines", href: "#guidelines" },
      { label: "Report Issue", href: "#report" },
      { label: "Feedback", href: "#feedback" }
    ],
    legal: [
      { label: "Terms of Service", href: "#terms" },
      { label: "Privacy Policy", href: "#privacy-policy" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "GDPR", href: "#gdpr" }
    ]
  }

  const socialLinks = [
    { icon: "📘", label: "Facebook", href: "#facebook" },
    { icon: "🐦", label: "Twitter", href: "#twitter" },
    { icon: "📸", label: "Instagram", href: "#instagram" },
    { icon: "💼", label: "LinkedIn", href: "#linkedin" }
  ]

  return (
    <>
      <footer className="modern-footer">
        <div className="footer-container">
          {/* Main Footer Content */}
          <div className="footer-main">
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="footer-icon">👋</span>
                <span className="footer-name">Hey Neighbour!</span>
              </div>
              <p className="footer-description">
                Building stronger communities, one connection at a time.
                Join thousands of neighbors making their neighborhoods better places to live.
              </p>
              <div className="social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="social-link"
                    aria-label={social.label}
                  >
                    <span>{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="footer-links">
              <div className="link-group">
                <h3 className="link-title">Product</h3>
                <ul className="link-list">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="footer-link">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="link-group">
                <h3 className="link-title">Company</h3>
                <ul className="link-list">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="footer-link">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="link-group">
                <h3 className="link-title">Support</h3>
                <ul className="link-list">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="footer-link">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="link-group">
                <h3 className="link-title">Legal</h3>
                <ul className="link-list">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="footer-link">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="newsletter-section">
            <div className="newsletter-content">
              <div className="newsletter-text">
                <h3 className="newsletter-title">Stay Connected</h3>
                <p className="newsletter-description">
                  Get the latest community updates and neighbor stories delivered to your inbox.
                </p>
              </div>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">
                  <span>Subscribe</span>
                  <span className="btn-icon">✉️</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="copyright">
                © Adrian Tan E-Herng Hey Neighbour! All rights reserved. Made with ❤️ for communities everywhere.
              </p>
              <div className="footer-badges">
                <span className="badge">🔒 Secure</span>
                <span className="badge">🌍 Global</span>
                <span className="badge">👥 Community-First</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Back to Top Button */}
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <span>⬆️</span>
        </button>
      </footer>

      <style jsx>{`
        .modern-footer {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .modern-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          padding: 4rem 0 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0.5rem;
        }

        .footer-icon {
          font-size: 2rem;
          animation: wave 3s ease-in-out infinite;
        }

        .footer-name {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .footer-description {
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          text-decoration: none;
          font-size: 1.2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px) rotate(5deg);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .link-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: white;
        }

        .link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .footer-link:hover {
          color: white;
          text-decoration: none;
          transform: translateX(4px);
        }

        .newsletter-section {
          padding: 3rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .newsletter-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .newsletter-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .newsletter-description {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0;
          line-height: 1.6;
        }

        .newsletter-form {
          display: flex;
          gap: 1rem;
          max-width: 400px;
          margin-left: auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.95rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .newsletter-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .newsletter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          background: #f8f9ff;
        }

        .btn-icon {
          transition: transform 0.3s ease;
        }

        .newsletter-btn:hover .btn-icon {
          transform: translateX(2px);
        }

        .footer-bottom {
          padding: 2rem 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .copyright {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
        }

        .footer-badges {
          display: flex;
          gap: 1rem;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .back-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .back-to-top:hover {
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .footer-main {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 3rem 0 2rem;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .newsletter-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .newsletter-form {
            margin: 0 auto;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .footer-container {
            padding: 0 1rem;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .newsletter-form {
            flex-direction: column;
            max-width: 100%;
          }

          .footer-badges {
            justify-content: center;
            flex-wrap: wrap;
          }

          .back-to-top {
            bottom: 1rem;
            right: 1rem;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </>
  )
}

export default App