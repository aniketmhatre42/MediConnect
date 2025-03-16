import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [user, setUser] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    let user = window.localStorage.getItem("user");
    if (user) {
      setUser(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scroll-nav' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-typewriter">
            <span className="typewriter-text">mediconnect</span>
            <span className="typewriter-cursor">.</span>
          </div>
        </Link>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About</Link></li>
          <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
          <li>
            <a href="https://esanjeevani.mohfw.gov.in/#/" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
              Sanjeevani App
            </a>
          </li>
          {!user && <li><Link to="/login" onClick={closeMenu}>Login</Link></li>}
          {user && (
            <>
              <li><Link to="/chatbot" onClick={closeMenu}>Chatbot</Link></li>
              <li><Link to="/video-conferencing" onClick={closeMenu}>Video Conferencing</Link></li>
              <li><Link to="/asha-login" onClick={closeMenu}>Asha Worker</Link></li>
              <li>
                <button
                  className="logout-btn"
                  onClick={() => {
                    window.localStorage.removeItem("user");
                    setUser(false);
                    window.location.href = "/login";
                    closeMenu();
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
