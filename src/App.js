import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Services from "./Services";
import MEDICONNECTChatbot from "./Chatbot"; 
import Preloader from "./Preloader"; 
import Login from "./Login";
import Signup from "./Signup";
import HomePage from './pages/Home/index.jsx'; 
import RoomPage from './pages/Home/Room/index.jsx'; 
import AshaWorkerLogin from "./AshaWorkerLogin"; 
import AshaDashboard from "./AshaWorkerDashboard";
import Navbar from "./Navbar";
import FacialAuth from './components/FacialAuth.js'; // Fixed capitalization in import
import CameraTester from './CameraTester'; // Add CameraTester to imports

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const hasSeenPreloader = localStorage.getItem('hasSeenPreloader');

    if (!hasSeenPreloader) {
      
      const timer = setTimeout(() => {
        setLoading(false);
        
        localStorage.setItem('hasSeenPreloader', 'true');
      }, 5000); 

      
      return () => clearTimeout(timer);
    } else {
      
      setLoading(false);
    }
  }, []);

  return (
      <Router>
        {loading ? (
          <Preloader />
        ) : (
          <div>
            <Navbar />
            <div className="content-wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/chatbot" element={<MEDICONNECTChatbot />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/video-conferencing" element={<HomePage />} />
                <Route path="/room/:roomId" element={<RoomPage />} />
                <Route path="/asha-login" element={<AshaWorkerLogin />} /> 
                <Route path="/asha-dashboard" element={<AshaDashboard />} /> 
                <Route path="/facial-auth" element={<FacialAuth />} />
                {/* Add the camera test route */}
                <Route path="/camera-test" element={<CameraTester />} />
              </Routes>
            </div>
          </div>
        )}
      </Router>
  );
}

export default App;