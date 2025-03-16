import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa"; 

const AshaWorkerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  
  const validAshaWorkers = [
    { email: "ashaworker123@gmail.com", password: "mediconnect" },
    { email: "asha2@example.com", password: "password2" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    
    const isValid = validAshaWorkers.some(
      (worker) => worker.email === email && worker.password === password
    );

    if (isValid) {
      
      navigate("/asha-dashboard");
    } else {
      
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundImage: "url('https://via.placeholder.com/1920x1080?text=Healthcare+Background')", // Add a background image
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)", 
          padding: "2.5rem",
          borderRadius: "15px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
          width: "400px",
          textAlign: "center",
          backdropFilter: "blur(10px)", 
          border: "1px solid rgba(255, 255, 255, 0.3)", 
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.3)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)";
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            color: "#2d3748", 
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          Asha Worker Login
        </h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.5rem", position: "relative" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "medium",
                marginBottom: "0.5rem",
                color: "#4a5568", 
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <FaUser
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#718096", // Icon color
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.5rem 0.5rem 2.5rem", // Add padding for the icon
                  border: "1px solid #e2e8f0", // Light gray border
                  borderRadius: "0.375rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4299e1"; // Blue border on focus
                  e.target.style.boxShadow = "0 0 0 3px rgba(66, 153, 225, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0"; // Reset border color
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>
          <div style={{ marginBottom: "2rem", position: "relative" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "medium",
                marginBottom: "0.5rem",
                color: "#4a5568", // Gray color
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <FaLock
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#718096", // Icon color
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.5rem 0.5rem 2.5rem", // Add padding for the icon
                  border: "1px solid #e2e8f0", // Light gray border
                  borderRadius: "0.375rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4299e1"; // Blue border on focus
                  e.target.style.boxShadow = "0 0 0 3px rgba(66, 153, 225, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0"; // Reset border color
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#4299e1", // Blue color
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.375rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s, transform 0.2s",
              border: "none",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#3182ce"; // Darker blue on hover
              e.target.style.transform = "translateY(-2px)"; // Slight lift on hover
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#4299e1"; // Original blue on mouse out
              e.target.style.transform = "translateY(0)"; // Reset position
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AshaWorkerLogin;