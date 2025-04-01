import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaIdCard, FaMapMarkerAlt, FaPhone, FaEnvelope, FaExclamationCircle } from "react-icons/fa";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, rtdb } from "../../firebase/config";
import "../../styles/components/auth/AshaWorkerSignup.css";

const AshaWorkerSignup = () => {
  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    workerId: "",
    district: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
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

  // Handle input changes and clear errors for that field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user edits a field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Worker ID validation - must be exactly 10 alphanumeric characters
    if (!/^[a-zA-Z0-9]{10}$/.test(formData.workerId)) {
      newErrors.workerId = "Worker ID must be exactly 10 alphanumeric characters";
    }
    
    // Phone number validation - must be exactly 10 digits
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation - minimum 6 characters
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return; // Stop if validation fails
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log("Creating user with Firebase Auth...");
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Save additional user data in Firebase Realtime Database
      console.log("Saving worker data to Realtime Database...");
      
      // Create a reference to the ashaworkers collection with user ID
      const ashaWorkerRef = ref(rtdb, `ashaworkers/${user.uid}`);
      
      // Save the worker data
      await set(ashaWorkerRef, {
        fullName: formData.fullName,
        workerId: formData.workerId,
        district: formData.district,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        createdAt: new Date().toISOString(),
        role: "ashaWorker"
      });
      
      console.log("Worker data saved successfully to RTDB");
      
      // Set session data
      sessionStorage.setItem('userRole', 'ashaWorker');
      sessionStorage.setItem('userEmail', formData.email);
      sessionStorage.setItem('userId', user.uid);
      
      console.log("Asha worker account created successfully!");
      navigate("/asha-dashboard");
      
    } catch (error) {
      console.error("Signup error:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to provide user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      default:
        return 'Failed to create account. Please try again.';
    }
  };

  // Input field styling with error handling
  const getInputStyle = (fieldName) => ({
    width: "100%",
    padding: "0.8rem 0.8rem 0.8rem 2.5rem",
    border: `1px solid ${errors[fieldName] ? "#e53e3e" : "#e2e8f0"}`,
    borderRadius: "10px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: errors[fieldName] ? "rgba(254, 215, 215, 0.1)" : "white"
  });

  // Rest of the component with form UI
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      padding: "20px",
    }}>
      {/* Form container and UI */}
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "2.5rem",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        width: "100%",
        maxWidth: "550px",
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
        <h2 style={{
          fontSize: "2.2rem",
          fontWeight: "bold",
          marginBottom: "1.8rem",
          color: "#2d3748",
          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
        }}>
          Asha Worker Registration
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
        
        {/* Form fields */}
        <form onSubmit={handleSignup}>
          {/* Form content with fields and validation */}
          <div style={{ marginBottom: "1.2rem", position: "relative" }}>
            <label style={{
              display: "block",
              fontSize: "1rem",
              fontWeight: "500",
              marginBottom: "0.5rem",
              color: "#4a5568",
              textAlign: "left"
            }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <FaUser style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: errors.fullName ? "#e53e3e" : "#718096",
                fontSize: "1rem"
              }} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={getInputStyle("fullName")}
                required
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <div style={{ 
                color: "#e53e3e", 
                fontSize: "0.875rem", 
                marginTop: "0.5rem", 
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                textAlign: "left"
              }}>
                <FaExclamationCircle /> {errors.fullName}
              </div>
            )}
          </div>
          
          {/* Other form fields */}
          {/* Worker ID */}
          <div style={{ marginBottom: "1.2rem", position: "relative" }}>
            <label style={{
              display: "block",
              fontSize: "1rem",
              fontWeight: "500",
              marginBottom: "0.5rem",
              color: "#4a5568",
              textAlign: "left"
            }}>
              Worker ID <span style={{fontSize: "0.8rem", color: "#718096"}}>(10 alphanumeric characters)</span>
            </label>
            <div style={{ position: "relative" }}>
              <FaIdCard style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: errors.workerId ? "#e53e3e" : "#718096",
                fontSize: "1rem"
              }} />
              <input
                type="text"
                name="workerId"
                value={formData.workerId}
                onChange={handleChange}
                style={getInputStyle("workerId")}
                required
                placeholder="e.g., ASHA123456"
                maxLength={10}
              />
            </div>
            {errors.workerId && (
              <div style={{ 
                color: "#e53e3e", 
                fontSize: "0.875rem", 
                marginTop: "0.5rem", 
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                textAlign: "left"
              }}>
                <FaExclamationCircle /> {errors.workerId}
              </div>
            )}
          </div>
          
          {/* District and Phone Number (side-by-side) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "1.2rem"
          }}>
            {/* District field */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#4a5568",
                textAlign: "left"
              }}>
                District
              </label>
              <div style={{ position: "relative" }}>
                <FaMapMarkerAlt style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.district ? "#e53e3e" : "#718096",
                  fontSize: "1rem"
                }} />
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  style={getInputStyle("district")}
                  required
                  placeholder="Your district"
                />
              </div>
              {errors.district && (
                <div style={{ 
                  color: "#e53e3e", 
                  fontSize: "0.875rem", 
                  marginTop: "0.5rem", 
                  textAlign: "left"
                }}>
                  <FaExclamationCircle style={{ marginRight: "0.25rem" }} /> {errors.district}
                </div>
              )}
            </div>
            
            {/* Phone Number field */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#4a5568",
                textAlign: "left"
              }}>
                Phone Number
              </label>
              <div style={{ position: "relative" }}>
                <FaPhone style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.phoneNumber ? "#e53e3e" : "#718096",
                  fontSize: "1rem"
                }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={getInputStyle("phoneNumber")}
                  required
                  placeholder="10-digit number"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
              {errors.phoneNumber && (
                <div style={{ 
                  color: "#e53e3e", 
                  fontSize: "0.875rem", 
                  marginTop: "0.5rem", 
                  textAlign: "left"
                }}>
                  <FaExclamationCircle style={{ marginRight: "0.25rem" }} /> {errors.phoneNumber}
                </div>
              )}
            </div>
          </div>
          
          {/* Email field */}
          <div style={{ marginBottom: "1.2rem", position: "relative" }}>
            <label style={{
              display: "block",
              fontSize: "1rem",
              fontWeight: "500",
              marginBottom: "0.5rem",
              color: "#4a5568",
              textAlign: "left"
            }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <FaEnvelope style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: errors.email ? "#e53e3e" : "#718096",
                fontSize: "1rem"
              }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={getInputStyle("email")}
                required
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <div style={{ 
                color: "#e53e3e", 
                fontSize: "0.875rem", 
                marginTop: "0.5rem", 
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                textAlign: "left"
              }}>
                <FaExclamationCircle /> {errors.email}
              </div>
            )}
          </div>
          
          {/* Password fields */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "1.5rem"
          }}>
            {/* Password field */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#4a5568",
                textAlign: "left"
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.password ? "#e53e3e" : "#718096",
                  fontSize: "1rem"
                }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={getInputStyle("password")}
                  required
                  placeholder="Min. 6 characters"
                />
              </div>
              {errors.password && (
                <div style={{ 
                  color: "#e53e3e", 
                  fontSize: "0.875rem", 
                  marginTop: "0.5rem", 
                  textAlign: "left"
                }}>
                  <FaExclamationCircle style={{ marginRight: "0.25rem" }} /> {errors.password}
                </div>
              )}
            </div>
            
            {/* Confirm Password field */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#4a5568",
                textAlign: "left"
              }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: errors.confirmPassword ? "#e53e3e" : "#718096",
                  fontSize: "1rem"
                }} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={getInputStyle("confirmPassword")}
                  required
                  placeholder="Re-enter password"
                />
              </div>
              {errors.confirmPassword && (
                <div style={{ 
                  color: "#e53e3e", 
                  fontSize: "0.875rem", 
                  marginTop: "0.5rem", 
                  textAlign: "left"
                }}>
                  <FaExclamationCircle style={{ marginRight: "0.25rem" }} /> {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>
          
          {/* Submit button */}
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
              marginTop: "1.5rem",
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <div style={{ marginTop: "2rem", color: "#4a5568", fontSize: "1.05rem" }}>
          <p>Already have an account? <Link to="/asha-login" style={{ color: "#3182ce", fontWeight: "500", textDecoration: "none" }}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AshaWorkerSignup;
