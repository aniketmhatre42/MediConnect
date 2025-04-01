import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import components from updated locations
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Navbar from "./components/layout/Navbar"; // Updated import path
import About from "./components/About"; // New import path
import Services from "./components/Services"; // New import path
import Chatbot from "./Chatbot";
import Prescription from "./Prescription";
import VideoRecommendations from "./components/VideoRecommendations";
import FacialAuth from "./components/FacialAuth";
import AshaWorkerLogin from "./components/auth/AshaWorkerLogin";
import AshaWorkerSignup from "./components/auth/AshaWorkerSignup";
import AshaWorkerDashboard from "./components/dashboard/AshaWorkerDashboard";

// Import firebase for initialization
import { rtdb } from "./firebase/config";
import CameraTester from "./CameraTester";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("authenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    
    // Check for ASHA worker login
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    
    if (userRole === 'ashaWorker' && userId) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/video-recommendations" element={<VideoRecommendations />} />
          <Route path="/facialauth" element={<FacialAuth />} />
          <Route path="/camera-test" element={<CameraTester />} />
          
          {/* Asha Worker Routes */}
          <Route path="/asha-login" element={<AshaWorkerLogin />} />
          <Route path="/asha-signup" element={<AshaWorkerSignup />} />
          <Route path="/asha-dashboard" element={<AshaWorkerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;