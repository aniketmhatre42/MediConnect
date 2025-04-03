import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ref, get, push, set } from "firebase/database";
import { auth, rtdb } from "../../firebase/config";
import { 
  FaUser, 
  FaHome, 
  FaClipboardList, 
  FaUserPlus, 
  FaSignOutAlt, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaTasks, 
  FaExclamationCircle,
  FaChartPie, 
  FaBell, 
  FaCalendarCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPrescription, // Add this new icon import
} from "react-icons/fa";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../../styles/components/dashboard/AshaWorkerDashboard.css";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const AshaWorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    medicalHistory: "",
    status: "Active"
  });
  const [prescriptions, setPrescriptions] = useState([]); // Add new state for storing prescriptions
  
  const navigate = useNavigate();

  // Disease data for pie chart (random data)
  const diseaseData = {
    labels: [
      'Hypertension', 
      'Diabetes', 
      'Tuberculosis', 
      'Malaria', 
      'Respiratory Infections',
      'Diarrhea',
      'Anemia',
      'Dengue',
      'Joint Pain',
      'Skin Diseases'
    ],
    datasets: [
      {
        label: 'Cases',
        data: [65, 59, 42, 31, 56, 25, 38, 28, 45, 35], // Random data
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC249', '#EA5545', '#27AEEF', '#87BC45'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Common Diseases in Your District',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

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
    fetchPrescriptions(); // Add fetch prescriptions function call
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

  // Add fetch prescriptions function
  const fetchPrescriptions = async () => {
    try {
      const prescriptionsRef = ref(rtdb, 'prescriptions');
      const snapshot = await get(prescriptionsRef);
      
      if (snapshot.exists()) {
        const prescriptionList = [];
        Object.entries(snapshot.val()).forEach(([id, data]) => {
          if (data.assignedTo === 'vineetapatil@gmail.com') {
            prescriptionList.push({ id, ...data });
          }
        });
        setPrescriptions(prescriptionList);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
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
    setSidebarCollapsed(!isSidebarCollapsed);
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
      <div className={`dashboard-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarCollapsed ? <span>›</span> : <span>‹</span>}
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            <FaUser size={40} />
          </div>
          {!isSidebarCollapsed && (
            <>
              <h3 className="user-name">{worker?.fullName || "Asha Worker"}</h3>
              <p className="user-role">Healthcare Provider</p>
              <p className="user-id">{worker?.workerId || "ID: Unknown"}</p>
            </>
          )}
        </div>
        
        <div className="sidebar-divider"></div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <button 
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setActiveTab("dashboard")}
                title="Dashboard"
              >
                <FaHome />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "patients" ? "active" : ""}
                onClick={() => setActiveTab("patients")}
                title="Patients"
              >
                <FaClipboardList />
                {!isSidebarCollapsed && <span>Patients</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "register" ? "active" : ""}
                onClick={() => setActiveTab("register")}
                title="Register Patient"
              >
                <FaUserPlus />
                {!isSidebarCollapsed && <span>Register Patient</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "analytics" ? "active" : ""}
                onClick={() => setActiveTab("analytics")}
                title="Analytics"
              >
                <FaChartPie />
                {!isSidebarCollapsed && <span>Analytics</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "appointments" ? "active" : ""}
                onClick={() => setActiveTab("appointments")}
                title="Appointments"
              >
                <FaCalendarCheck />
                {!isSidebarCollapsed && <span>Appointments</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "notifications" ? "active" : ""}
                onClick={() => setActiveTab("notifications")}
                title="Notifications"
              >
                <FaBell />
                {!isSidebarCollapsed && <span>Notifications</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === "prescriptions" ? "active" : ""}
                onClick={() => setActiveTab("prescriptions")}
                title="Prescriptions"
              >
                <FaPrescription />
                {!isSidebarCollapsed && <span>Prescriptions</span>}
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`dashboard-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="content-header">
          <div className="content-title">
            <h1>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "patients" && "Patient Management"}
              {activeTab === "register" && "Register New Patient"}
              {activeTab === "analytics" && "Analytics & Reports"}
              {activeTab === "appointments" && "Appointments"}
              {activeTab === "notifications" && "Notifications"}
              {activeTab === "prescriptions" && "Prescriptions"}
            </h1>
            <p className="location-info">
              <FaMapMarkerAlt /> {worker?.district || "District"} Area
            </p>
          </div>
          
          <div className="header-actions">
            <span className="date-display">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        {error && (
          <div className="error-alert">
            <FaExclamationCircle style={{ marginRight: "10px" }} />
            {error}
            <button className="close-error" onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <div className="tab-content">
          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <div className="dashboard-view">
              <div className="dash-cards">
                <div className="stat-card">
                  <div className="stat-icon patients-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h3>Assigned Patients</h3>
                    <p className="stat-value">{patients.length}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon appointments-icon">
                    <FaCalendarCheck />
                  </div>
                  <div className="stat-info">
                    <h3>Today's Appointments</h3>
                    <p className="stat-value">3</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon tasks-icon">
                    <FaTasks />
                  </div>
                  <div className="stat-info">
                    <h3>Pending Tasks</h3>
                    <p className="stat-value">7</p>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-grid">
                <div className="grid-item chart-container">
                  <h3 className="section-heading">Disease Distribution</h3>
                  <div className="chart-wrapper">
                    <Pie data={diseaseData} options={chartOptions} />
                  </div>
                </div>
                
                <div className="grid-item recent-patients">
                  <h3 className="section-heading">Recent Patients</h3>
                  {patients.length > 0 ? (
                    <div className="recent-list">
                      {patients.slice(0, 5).map(patient => (
                        <div key={patient.id} className="recent-item">
                          <div className="patient-info">
                            <h4>{patient.name}</h4>
                            <p>{patient.age} years • {patient.gender}</p>
                          </div>
                          <span className={`status-badge ${patient.status?.toLowerCase() || 'active'}`}>
                            {patient.status || "Active"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No patients assigned yet</p>
                  )}
                </div>
                
                <div className="grid-item upcoming">
                  <h3 className="section-heading">Upcoming Appointments</h3>
                  <div className="upcoming-list">
                    <div className="upcoming-item">
                      <div className="upcoming-date">
                        <span className="day">12</span>
                        <span className="month">JUN</span>
                      </div>
                      <div className="upcoming-info">
                        <h4>Vaccination Drive</h4>
                        <p>Ganeshpuri Community Center • 10:00 AM</p>
                      </div>
                    </div>
                    <div className="upcoming-item">
                      <div className="upcoming-date">
                        <span className="day">15</span>
                        <span className="month">JUN</span>
                      </div>
                      <div className="upcoming-info">
                        <h4>Health Camp</h4>
                        <p>Primary School • 9:00 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid-item notifications">
                  <h3 className="section-heading">Recent Notifications</h3>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-icon success">
                        <FaCheckCircle />
                      </div>
                      <div className="notification-content">
                        <p className="notification-text">New health guidelines published</p>
                        <p className="notification-time">2 hours ago</p>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-icon warning">
                        <FaExclamationTriangle />
                      </div>
                      <div className="notification-content">
                        <p className="notification-text">Reminder: Submit weekly report</p>
                        <p className="notification-time">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Patient List Tab */}
          {activeTab === "patients" && (
            <div className="patients-view">
              <div className="patient-controls">
                <div className="search-filter">
                  <input type="text" placeholder="Search patients..." className="search-input" />
                  <select className="filter-select">
                    <option value="all">All Patients</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <button className="add-patient-btn" onClick={() => setActiveTab("register")}>
                  <FaUserPlus /> Add Patient
                </button>
              </div>
              
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
                            <div className="action-buttons">
                              <button className="action-btn view">View</button>
                              <button className="action-btn edit">Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-patients">
                  <div className="empty-state">
                    <FaClipboardList size={48} />
                    <p>No patients assigned yet.</p>
                    <button className="add-patient-btn" onClick={() => setActiveTab("register")}>
                      Register Your First Patient
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Register Patient Tab */}
          {activeTab === "register" && (
            <div className="register-view">
              <div className="form-card">
                <h3 className="form-title">Patient Information</h3>
                <form className="reg-form" onSubmit={handlePatientSubmit}>
                  <div className="form-row">
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
                  </div>
                  
                  <div className="form-row">
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
                    
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select 
                        name="status"
                        value={newPatientData.status}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Location/Address</label>
                    <input
                      type="text"
                      name="location"
                      value={newPatientData.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Village/Town and Address"
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
                      placeholder="Enter any medical history, conditions, or notes"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setActiveTab("patients")}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Register Patient
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="analytics-view">
              <div className="analytics-header">
                <h3>Health Statistics in {worker?.district || "Your District"}</h3>
                <p>Overview of health patterns and disease prevalence in your assigned area.</p>
              </div>
              
              <div className="chart-container analytics-chart">
                <h3>Disease Distribution</h3>
                <div className="chart-wrapper large">
                  <Pie data={diseaseData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'bottom'
                      }
                    }
                  }} />
                </div>
                <div className="chart-description">
                  <p>This chart shows the distribution of common diseases reported in your district. Hypertension and diabetes remain the most prevalent conditions, followed by respiratory infections and joint pain.</p>
                  <div className="chart-actions">
                    <button className="chart-action-btn">Download Data</button>
                    <button className="chart-action-btn">Share Report</button>
                  </div>
                </div>
              </div>
              
              <div className="analytics-stats">
                <div className="stat-block">
                  <h4>Total Registered Patients</h4>
                  <div className="stat-number">{patients.length}</div>
                </div>
                <div className="stat-block">
                  <h4>Active Cases</h4>
                  <div className="stat-number">{patients.filter(p => p.status === "Active").length || 0}</div>
                </div>
                <div className="stat-block">
                  <h4>High Risk Patients</h4>
                  <div className="stat-number">3</div>
                </div>
                <div className="stat-block">
                  <h4>Cases This Month</h4>
                  <div className="stat-number">12</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Placeholder for Appointments */}
          {activeTab === "appointments" && (
            <div className="appointments-view">
              <div className="placeholder-content">
                <FaCalendarCheck size={60} color="#ccc" />
                <h3>Appointments</h3>
                <p>Manage and schedule appointments with your patients.</p>
                <p>This feature is coming soon.</p>
              </div>
            </div>
          )}
          
          {/* Placeholder for Notifications */}
          {activeTab === "notifications" && (
            <div className="notifications-view">
              <div className="placeholder-content">
                <FaBell size={60} color="#ccc" />
                <h3>Notifications</h3>
                <p>View important updates and alerts.</p>
                <p>This feature is coming soon.</p>
              </div>
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <div className="prescriptions-view">
              <div className="prescriptions-header">
                <h2>Patient Prescriptions</h2>
                <p>Manage and process patient prescriptions</p>
              </div>

              <div className="prescriptions-list">
                {prescriptions.length > 0 ? (
                  prescriptions.map(prescription => (
                    <div key={prescription.id} className="prescription-card">
                      <div className="prescription-info">
                        <h3>{prescription.username}</h3>
                        <p className="prescription-date">
                          Received: {new Date(prescription.timestamp).toLocaleDateString()}
                        </p>
                        <div className="patient-details">
                          <p><strong>Patient ID:</strong> {prescription.userId}</p>
                          <p><strong>Address:</strong> 123, Krishna Nagar, {prescription.location || 'Mumbai'}, Maharashtra, India</p>
                        </div>
                        <div className="prescription-content">
                          <div className="prescription-section">
                            <h4>Symptoms:</h4>
                            <p>{prescription.symptoms}</p>
                          </div>
                          <div className="prescription-section">
                            <h4>Medications:</h4>
                            <ul>
                              {prescription.medications?.map((med, index) => (
                                <li key={index}>{med.name} - {med.dosage}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="prescription-actions">
                        <button className="action-btn process">Process Order</button>
                        <button className="action-btn contact">Contact Patient</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-prescriptions">
                    <FaPrescription size={48} color="#ccc" />
                    <p>No prescriptions to process</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AshaWorkerDashboard;
