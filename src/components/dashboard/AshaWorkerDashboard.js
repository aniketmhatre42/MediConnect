import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ref, get, push, set } from "firebase/database";
import { auth, rtdb } from "../../firebase/config";
import { FaUser, FaHome, FaClipboardList, FaUserPlus, FaSignOutAlt, FaUsers, FaMapMarkerAlt, FaTasks, FaExclamationCircle } from "react-icons/fa";
import "../../styles/components/dashboard/AshaWorkerDashboard.css";

const AshaWorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    medicalHistory: "",
    status: "Active"
  });
  const [sidebarActive, setSidebarActive] = useState(true);
  
  const navigate = useNavigate();

  // Modified authentication check to be more relaxed during development
  useEffect(() => {
    console.log("AshaWorkerDashboard mounting...");
    
    // Check if user is logged in via session storage
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    
    console.log("Session data:", { userRole, userId });
    
    if (userRole !== 'ashaWorker' || !userId) {
      console.warn("Not authenticated as AshaWorker, redirecting to login");
      navigate("/asha-login");
      return;
    }
    
    // Fetch worker data without listeners
    const fetchWorkerData = async () => {
      try {
        console.log("Fetching worker data for ID:", userId);
        const workerRef = ref(rtdb, `ashaworkers/${userId}`);
        const workerSnapshot = await get(workerRef);
        
        if (workerSnapshot.exists()) {
          const workerData = workerSnapshot.val();
          console.log("Worker data retrieved:", workerData);
          setWorker(workerData);
          await fetchPatients(userId);
        } else {
          console.error("Worker profile not found in database");
          setError("Worker profile not found");
          setTimeout(() => {
            handleLogout();
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkerData();
  }, [navigate]);
  
  // Separate function to fetch patients
  const fetchPatients = async (userId) => {
    try {
      const patientsRef = ref(rtdb, 'patients');
      const patientsSnapshot = await get(patientsRef);
      
      if (patientsSnapshot.exists()) {
        const patientsList = [];
        Object.entries(patientsSnapshot.val()).forEach(([id, data]) => {
          if (data.assignedWorker === userId) {
            patientsList.push({ id, ...data });
          }
        });
        setPatients(patientsList);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('workerName');
      sessionStorage.removeItem('workerDistrict');
      navigate("/asha-login");
    } catch (err) {
      setError("Logout failed: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPatientData.name || !newPatientData.age || !newPatientData.gender || !newPatientData.location) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const userId = sessionStorage.getItem('userId'); // Use session storage instead of auth.currentUser
      if (!userId) {
        setError("User session expired. Please login again.");
        setTimeout(() => navigate("/asha-login"), 2000);
        return;
      }
      
      const patientsRef = ref(rtdb, 'patients');
      const newPatientRef = push(patientsRef);
      
      await set(newPatientRef, {
        ...newPatientData,
        assignedWorker: userId,
        registeredDate: new Date().toISOString()
      });
      
      // Reset form
      setNewPatientData({
        name: "",
        age: "",
        gender: "",
        location: "",
        medicalHistory: "",
        status: "Active"
      });
      
      // Refresh patients list
      await fetchPatients(userId);
      
      setActiveTab("patients");
      
    } catch (err) {
      setError("Failed to register patient: " + err.message);
    }
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="sidebar-user">
          <div className="user-avatar">
            <FaUser size={40} />
          </div>
          <h3 className="user-name">{worker?.fullName || "Asha Worker"}</h3>
          <p className="user-id">{worker?.workerId || "ID: Unknown"}</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <button 
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setActiveTab("dashboard")}
              >
                <FaHome /> Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "patients" ? "active" : ""}
                onClick={() => setActiveTab("patients")}
              >
                <FaClipboardList /> Patient List
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "register" ? "active" : ""}
                onClick={() => setActiveTab("register")}
              >
                <FaUserPlus /> Register Patient
              </button>
            </li>
          </ul>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-content">
        {error && (
          <div className="error-alert">
            <FaExclamationCircle style={{ marginRight: "10px" }} />
            {error}
          </div>
        )}
        
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="page-title">Dashboard</h2>
            <div className="stat-cards">
              <div className="stat-card patients">
                <h3>Assigned Patients</h3>
                <p className="stat-value">{patients.length}</p>
                <FaUsers className="icon-bg" />
              </div>
              
              <div className="stat-card district">
                <h3>District</h3>
                <p className="stat-value">{worker?.district || "Unknown"}</p>
                <FaMapMarkerAlt className="icon-bg" />
              </div>
              
              <div className="stat-card tasks">
                <h3>Tasks</h3>
                <p className="stat-value">0</p>
                <FaTasks className="icon-bg" />
              </div>
            </div>
            
            <div className="welcome-card">
              <h3>Welcome, {worker?.fullName}</h3>
              <p>
                This is your MediConnect dashboard. Here you can manage your assigned patients,
                register new patients, and coordinate healthcare services in your district.
              </p>
            </div>
          </div>
        )}
        
        {/* Patient List Tab */}
        {activeTab === "patients" && (
          <div>
            <h2 className="page-title">Assigned Patients</h2>
            {patients.length > 0 ? (
              <div className="patient-table-container">
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.name}</td>
                        <td>{patient.age}</td>
                        <td>{patient.gender}</td>
                        <td>{patient.location}</td>
                        <td>
                          <span className={`status-badge ${patient.status?.toLowerCase() || 'active'}`}>
                            {patient.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-patients">
                <p>No patients assigned yet.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Register Patient Tab */}
        {activeTab === "register" && (
          <div>
            <h2 className="page-title">Register New Patient</h2>
            <form className="reg-form" onSubmit={handlePatientSubmit}>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  name="name"
                  value={newPatientData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={newPatientData.age}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Age"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    name="gender"
                    value={newPatientData.gender}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newPatientData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Village/Town"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Medical History</label>
                <textarea
                  name="medicalHistory"
                  value={newPatientData.medicalHistory}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter any medical history or notes"
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Register Patient
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AshaWorkerDashboard;
