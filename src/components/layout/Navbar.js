import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Navbar.css";
import { FaBars, FaTimes, FaCaretDown, FaCaretUp, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAshaDropdown, setShowAshaDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  // Check authentication status and get username when component mounts
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check both localStorage and sessionStorage for authentication data
    const checkAuth = () => {
      const sessionUsername = sessionStorage.getItem("username");
      const sessionAuth = sessionStorage.getItem("authenticated");
      const localUser = localStorage.getItem("user");
      
      if (sessionUsername && sessionAuth === "true") {
        setIsAuthenticated(true);
        setUsername(sessionUsername);
      } else if (localUser) {
        setIsAuthenticated(true);
        try {
          const userData = JSON.parse(localUser);
          setUsername(userData.username || "User");
        } catch (e) {
          setUsername("User");
        }
      } else {
        setIsAuthenticated(false);
        setUsername("");
      }
    };
    
    // Initial check
    checkAuth();
    
    // Setup event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Custom event for auth changes within the app
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    setShowAshaDropdown(false);
  };

  const toggleAshaDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAshaDropdown(prev => !prev);
    setShowUserDropdown(false); // Close user dropdown if open
  };
  
  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserDropdown(prev => !prev);
    setShowAshaDropdown(false); // Close asha dropdown if open
  };

  // Improved logout function that clears all auth data
  const handleLogout = () => {
    // Clear session data
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    
    // Clear local storage auth data
    localStorage.removeItem("user");
    
    // Update state
    setIsAuthenticated(false);
    setUsername("");
    setShowUserDropdown(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    
    // Navigate to home page
    navigate("/");
    closeMenu();
  };

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleOutsideClick = () => {
      setShowUserDropdown(false);
      setShowAshaDropdown(false);
    };
    
    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

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
          {/* Asha Worker Dropdown */}
          <li className="dropdown-item" onClick={(e) => e.stopPropagation()}>
            <a href="#!" className="dropdown-toggle" onClick={toggleAshaDropdown}>
              Asha Worker {showAshaDropdown ? <FaCaretUp /> : <FaCaretDown />}
            </a>
            {showAshaDropdown && (
              <div className="dropdown-menu">
                <Link to="/asha-login" className="dropdown-link" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/asha-signup" className="dropdown-link" onClick={closeMenu}>
                  Register
                </Link>
                <Link to="/asha-dashboard" className="dropdown-link" onClick={closeMenu}>
                  Dashboard
                </Link>
              </div>
            )}
          </li>
          
          {/* Display based on authentication status */}
          {!isAuthenticated ? (
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
          ) : (
            <>
              {/* User dropdown with username and logout option */}
              <li className="dropdown-item user-dropdown" onClick={(e) => e.stopPropagation()}>
                <a href="#!" className="dropdown-toggle username-toggle" onClick={toggleUserDropdown}>
                  <FaUser className="user-icon" /> 
                  {username || "User"} {showUserDropdown ? <FaCaretUp /> : <FaCaretDown />}
                </a>
                {showUserDropdown && (
                  <div className="dropdown-menu user-dropdown-menu">
                    <Link to="/profile" className="dropdown-link" onClick={closeMenu}>
                      <FaUser className="dropdown-icon" /> Profile
                    </Link>
                    <Link to="/settings" className="dropdown-link" onClick={closeMenu}>
                      <FaCog className="dropdown-icon" /> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-link logout-link" onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" /> Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
