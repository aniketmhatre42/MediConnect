import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, rtdb } from "../../firebase/config";
import "../../styles/components/auth/AshaWorkerLogin.css";

const AshaWorkerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Using simple session check instead
  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    
    if (userRole === 'ashaWorker' && userId) {
      navigate("/asha-dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Login successful, fetching worker data...");
      
      // Fetch worker data from RTDB
      const workerRef = ref(rtdb, `ashaworkers/${user.uid}`);
      const workerSnapshot = await get(workerRef);
      
      if (workerSnapshot.exists()) {
        const workerData = workerSnapshot.val();
        
        // Store essential worker data in session storage
        sessionStorage.setItem('userRole', 'ashaWorker');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userId', user.uid);
        sessionStorage.setItem('workerName', workerData.fullName);
        sessionStorage.setItem('workerDistrict', workerData.district);
        
        console.log("Worker data retrieved:", workerData.fullName);
        
        // Navigate to asha dashboard
        navigate("/asha-dashboard");
      } else {
        console.error("Worker data not found in database");
        setError("Account exists but worker profile is missing. Please contact support.");
        await signOut(auth); // Sign out since profile is missing
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(getErrorMessage(error.code));
      setLoading(false);
    }
  };

  // Helper function to provide user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Try again later.';
      default:
        return 'Failed to login. Please try again.';
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "2.5rem",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          width: "100%",
          maxWidth: "450px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.01)";
          e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.15)";
        }}
      >
        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: "bold",
            marginBottom: "1.8rem",
            color: "#2d3748",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
            lineHeight: "1.2",
          }}
        >
          Asha Worker Login
        </h2>
        
        {error && (
          <div style={{
            padding: "12px",
            marginBottom: "20px",
            backgroundColor: "rgba(254, 215, 215, 0.8)",
            color: "#c53030",
            borderRadius: "12px",
            fontSize: "1rem",
            border: "1px solid rgba(197, 48, 48, 0.2)"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          {/* Form fields */}
          <div style={{ marginBottom: "1.8rem", position: "relative" }}>
            <label
              style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "0.6rem",
                color: "#4a5568",
                textAlign: "left"
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <FaEnvelope
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#718096",
                  fontSize: "1.1rem"
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem 0.8rem 0.8rem 3rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "1.05rem",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4299e1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(66, 153, 225, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.05)";
                }}
                required
                disabled={loading}
                placeholder="Enter your email address"
              />
            </div>
          </div>
          <div style={{ marginBottom: "2.2rem", position: "relative" }}>
            <label
              style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "0.6rem",
                color: "#4a5568",
                textAlign: "left"
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <FaLock
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#718096",
                  fontSize: "1.1rem"
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem 0.8rem 0.8rem 3rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "1.05rem",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4299e1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(66, 153, 225, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.05)";
                }}
                required
                disabled={loading}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: loading ? "#90cdf4" : "#3182ce",
              color: "white",
              padding: "0.9rem",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "1.1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              border: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: loading ? "none" : "0 4px 12px rgba(49, 130, 206, 0.3)"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#2b6cb0";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 18px rgba(49, 130, 206, 0.35)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#3182ce";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(49, 130, 206, 0.3)";
              }
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div style={{ marginTop: "2rem", color: "#4a5568", fontSize: "1.05rem" }}>
          <p>Don't have an account? <Link to="/asha-signup" style={{ color: "#3182ce", fontWeight: "500", textDecoration: "none" }}>Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AshaWorkerLogin;
