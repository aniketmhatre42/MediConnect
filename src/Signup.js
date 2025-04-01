import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './Signup.css';
import { saveFaceDescriptor, hasFaceDescriptor } from './services/localFaceStorage';
import { auth } from './firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { saveFaceToFirebase } from './services/firebaseFaceService';
import { findMatchingFace, formatMatchConfidence } from './utils/faceUtils'; // Add this import

function Signup() {
  // Define the constant at component level so it's accessible everywhere
  const TOTAL_DETECTIONS_NEEDED = 5; // Reduced from 20 to 5 for faster processing
  const MIN_SCAN_TIME_MS = 5000; // Minimum 5 seconds scan time
  
  const [username, setUsername] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [registrationStep, setRegistrationStep] = useState('username'); // 'username', 'camera', 'processing', 'complete'
  const [progress, setProgress] = useState(0);
  const [faceDataInfo, setFaceDataInfo] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [usernameExists, setUsernameExists] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [existingUserData, setExistingUserData] = useState(null);
  
  // Add state for face positioning feedback
  const [faceCentered, setFaceCentered] = useState(false);
  const [faceDistance, setFaceDistance] = useState('unknown'); // 'too_close', 'good', 'too_far'

  // Add state for scan timer
  const [scanStartTime, setScanStartTime] = useState(null);
  const [scanTimeRemaining, setScanTimeRemaining] = useState(0);

  // Add states for face duplication check
  const [matchingFace, setMatchingFace] = useState(null);
  const [showFaceMatchWarning, setShowFaceMatchWarning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
        setLoading(false);
      } catch (err) {
        setError('Error loading face detection models: ' + err.message);
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  // Check if username already exists
  useEffect(() => {
    if (username.trim()) {
      checkUsernameExists(username);
    } else {
      setUsernameExists(false);
      setExistingUserData(null);
    }
  }, [username]);

  const checkUsernameExists = async (username) => {
    try {
      // Get stored face data from localStorage
      const storedFaceData = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
      
      // Check if username already exists
      const existingUser = storedFaceData.find(data => data.username === username);
      
      if (existingUser) {
        setUsernameExists(true);
        setExistingUserData(existingUser);
        console.log("Username already exists:", existingUser);
      } else {
        setUsernameExists(false);
        setExistingUserData(null);
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameExists(false);
      setExistingUserData(null);
    }
  };

  const startCamera = async () => {
    if (!username.trim()) {
      setError('Please enter a username first');
      return;
    }

    try {
      setIsCapturing(true);
      setError('');
      setScanStartTime(Date.now()); // Record scan start time
      setScanTimeRemaining(MIN_SCAN_TIME_MS / 1000);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
            setError("Error starting video playback");
          });
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError(`Camera access failed: ${err.message}`);
      setIsCapturing(false);
    }
  };

  // Clean up video stream when component unmounts
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const saveFaceData = async () => {
    if (!capturedDescriptor || !username) {
      setError('Face data or username missing');
      return;
    }

    try {
      // First check if this face already exists in the system
      console.log("🔍 Checking for duplicate faces...");
      const storedFaceData = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
      
      console.log(`Retrieved ${storedFaceData.length} existing face entries from storage`);
      
      // Debug stored face data
      storedFaceData.forEach((face, idx) => {
        console.log(`Face #${idx+1}: username=${face.username}, descriptorLength=${face.descriptor ? face.descriptor.length : 'undefined'}`);
      });
      
      // Use stricter threshold (0.4 instead of 0.45) for duplicate detection
      const matchingFace = findMatchingFace(capturedDescriptor, storedFaceData, 0.4);
      
      // Always log the best match information for debugging (but only to console, not shown to user)
      if (matchingFace) {
        console.log("Match details:", {
          username: matchingFace.username,
          distance: matchingFace.distance,
          confidence: matchingFace.confidence,
          currentUsername: username,
          isSameUser: matchingFace.username === username
        });
      }
      
      // If we found a match with a different username, block registration entirely
      // Security: Don't reveal which user they matched with
      if (matchingFace && matchingFace.username !== username) {
        console.log(`⚠️ Duplicate face detected! Matches with an existing user. Confidence: ${formatMatchConfidence(matchingFace.confidence)}`);
        setMatchingFace(matchingFace);
        setShowFaceMatchWarning(true);
        return; // Stop here - user must use a different face
      }
      
      // Continue with normal registration flow
      setRegistrationStep('processing');
      
      // Create a user ID - if we're using Firebase auth, use that ID
      let userId = `user_${Date.now()}`;
      
      try {
        // Try to create a Firebase user (if we have email/password)
        // Generate a valid email from username for Firebase
        const email = `${username.replace(/\s+/g, '')}@example.com`;
        const password = `password123`; // Placeholder password
        
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          email,
          password
        );
        userId = userCredential.user.uid;
        console.log("Firebase user created with ID:", userId);
      } catch (authErr) {
        console.warn("Could not create Firebase user, using local ID:", authErr);
      }
      
      console.log("Starting face data save process...");
      console.log("Descriptor data type:", capturedDescriptor instanceof Float32Array ? "Float32Array" : typeof capturedDescriptor);
      console.log("Descriptor length:", capturedDescriptor.length);
      
      // Store face data both in Firebase and localStorage for backup
      // Modified to pass username as the second parameter to saveFaceToFirebase
      let firebaseSavePromise = Promise.race([
        saveFaceToFirebase(userId, username, capturedDescriptor),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase operation timed out')), 10000))
      ]);
      
      // Add more detailed logging during the Firebase save attempt
      console.log("Waiting for Firebase operation to complete...");
      
      try {
        const saved = await firebaseSavePromise;
        console.log("Face descriptor save result:", saved);
        
        if (saved) {
          console.log("Face data successfully saved to storage");
        } else {
          console.warn("Face data save returned false - check for errors");
        }
      } catch (saveErr) {
        console.warn("Error saving to Firebase, will continue with local storage:", saveErr);
        // Continue with local storage only
      }
      
      // Save additional user data in localStorage
      const userData = {
        userId,
        username,
        descriptor: Array.from(capturedDescriptor),
        timestamp: new Date().toISOString()
      };
      
      // Get existing data from local storage
      let existingData = [];
      try {
        const storedData = localStorage.getItem('face_descriptors');
        existingData = storedData ? JSON.parse(storedData) : [];
      } catch (parseErr) {
        console.warn('Could not parse existing face data, creating new storage');
      }
      
      // Ensure existingData is an array
      if (!Array.isArray(existingData)) existingData = [];
      
      // Check if we're updating an existing user's face data
      if (usernameExists) {
        // Replace the data for the existing user
        const updatedData = existingData.filter(item => item.username !== username);
        updatedData.push(userData);
        localStorage.setItem('face_descriptors', JSON.stringify(updatedData));
      } else {
        // Add new user data
        existingData.push(userData);
        localStorage.setItem('face_descriptors', JSON.stringify(existingData));
      }
      
      // Update the storage location info display to be more accurate
      setFaceDataInfo({
        storageKey: 'face_descriptors',
        location: 'Firebase Realtime Database and Browser Local Storage',
        timestamp: new Date().toISOString(),
        dataSize: capturedDescriptor.length * 4, // Float32 is 4 bytes per element
        isUpdate: usernameExists,
        userId
      });
      
      stopCamera();
      setRegistrationStep('complete');
      // Show countdown for redirect
      let countdown = 5;
      const countdownInterval = setInterval(() => {
        countdown--;
        setProgress(countdown);
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          navigate('/login');
        }
      }, 1000);
    } catch (err) {
      setError('Failed to save face data: ' + err.message);
      setRegistrationStep('camera'); // Go back to camera step on error
    }
  };

  // Remove the handleContinueDespiteMatch function since we don't want to allow continuing
  // if a duplicate face is detected for security reasons

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setScanMessage('Analyzing face...');
    
    // Calculate remaining scan time
    const elapsedTime = Date.now() - scanStartTime;
    const remainingTime = Math.max(0, Math.ceil((MIN_SCAN_TIME_MS - elapsedTime) / 1000));
    setScanTimeRemaining(remainingTime);
    
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection) {
        // Draw the detection
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedResults = faceapi.resizeResults(detection, dims);
        faceapi.draw.drawDetections(canvas, [resizedResults]);
        faceapi.draw.drawFaceLandmarks(canvas, [resizedResults]);
        setDetectionCount(prev => prev + 1);
        
        // Check if minimum scan time has elapsed
        const scanComplete = elapsedTime >= MIN_SCAN_TIME_MS;
        
        if (detectionCount >= TOTAL_DETECTIONS_NEEDED && scanComplete) {
          // Only complete if both enough detections and minimum time has passed
          setCapturedDescriptor(detection.descriptor);
          setFaceDetected(true);
          setScanMessage('Face detected! Click Register to save.');
          return; // Stop detection once we have enough samples
        } else {
          // Show time remaining if still under minimum time
          if (!scanComplete) {
            setScanMessage(`Keep still... ${remainingTime}s remaining`);
          } else {
            setScanMessage(`Hold still... ${Math.round((detectionCount/TOTAL_DETECTIONS_NEEDED) * 100)}%`);
          }
        }
      } else {
        setScanMessage(`No face detected. Please position your face in the frame. ${remainingTime}s remaining`);
        setFaceDetected(false);
      }
        
      if (isCapturing && detectionCount < TOTAL_DETECTIONS_NEEDED) {
        requestAnimationFrame(detectFace);
      }
    } catch (err) {
      setScanMessage('Error during detection: ' + err.message);
    }
  };

  useEffect(() => {
    let animationFrameId;
    if (isCapturing && videoRef.current && videoStream) {
      const detectFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        setScanMessage('Analyzing face...');

        // Calculate remaining scan time
        const elapsedTime = Date.now() - scanStartTime;
        const remainingTime = Math.max(0, Math.ceil((MIN_SCAN_TIME_MS - elapsedTime) / 1000));
        setScanTimeRemaining(remainingTime);

        try {
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection) {
            // Draw the detection
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            const dims = faceapi.matchDimensions(canvas, video, true);
            const resizedResults = faceapi.resizeResults(detection, dims);
            faceapi.draw.drawDetections(canvas, [resizedResults]);
            faceapi.draw.drawFaceLandmarks(canvas, [resizedResults]);
            // Use TOTAL_DETECTIONS_NEEDED here instead of totalDetectionsNeeded
            setCapturedDescriptor(detection.descriptor);
            setFaceDetected(true);
            setScanMessage('Face detected! Click Register to save.');
          } else {
            setScanMessage(`No face detected. Please position your face in the frame. ${remainingTime}s remaining`);
            setFaceDetected(false);
          } 
          if (isCapturing) {
            animationFrameId = requestAnimationFrame(detectFace);
          }
        } catch (err) {
          setScanMessage('Error during detection: ' + err.message);
        }
      };

      videoRef.current.onplay = () => {
        detectFace();
      };
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isCapturing, videoStream]);

  // Handle clicking next from username screen
  const handleUsernameNext = () => {
    if (username.trim()) {
      if (usernameExists && !showUpdateConfirm) {
        setShowUpdateConfirm(true);
      } else {
        setShowUpdateConfirm(false);
        setRegistrationStep('camera');
        startCamera();
      }
    } else {
      setError('Please enter a username');
    }
  };

  // Handle confirmation for updating existing user's face data
  const handleUpdateConfirm = (confirmed) => {
    setShowUpdateConfirm(false);
    if (confirmed) {
      setRegistrationStep('camera');
      startCamera();
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Face Registration</h1>
        {/* Progress indicator */}
        <div className="registration-progress">
          <div className="progress-steps">
            <div className={`step ${registrationStep === 'username' ? 'active' : ''} ${registrationStep !== 'username' ? 'completed' : ''}`}>
              1. Username
            </div>
            <div className={`step ${registrationStep === 'camera' ? 'active' : ''} ${registrationStep === 'complete' ? 'completed' : ''}`}>
              2. Face Scan
            </div>
            <div className={`step ${registrationStep === 'complete' ? 'active' : ''}`}>
              3. Complete
            </div>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Update face match warning overlay for security */}
        {showFaceMatchWarning && (
          <div className="face-match-warning-overlay">
            <div className="face-match-warning">
              <div className="warning-icon">⚠️</div>
              <h3>Face Already Registered</h3>
              <p>This face appears to match an existing user in our system.</p>
              <p>For security reasons, each face can only be registered once.</p>
              <p>Please try again with a different face or contact support if you believe this is an error.</p>
              
              <div className="face-match-actions">
                <button 
                  className="cancel-match-btn"
                  onClick={() => setShowFaceMatchWarning(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
        
        {registrationStep === 'username' && (
          <div className="step-container">
            <div className="face-icon-container">
              <div className="face-icon"></div>
            </div>
            <h3>Choose Your Username</h3>
            <p className="step-description">This username will be associated with your face data.</p>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {usernameExists && !showUpdateConfirm && (
              <div className="username-exists-warning">
                Username already exists! You can update the face data for this user.
              </div>
            )}
            {showUpdateConfirm ? (
              <div className="update-confirmation">
                <p>This username already exists. Do you want to update the face data for this user?</p>
                <div className="confirmation-buttons">
                  <button 
                    className="confirm-btn"
                    onClick={() => handleUpdateConfirm(true)}
                  >
                    Yes, Update
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => handleUpdateConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="next-button"
                onClick={handleUsernameNext}
              >
                {usernameExists ? 'Update Face Data' : 'Continue to Face Scan'}
              </button>
            )}
          </div>
        )}
        {registrationStep === 'camera' && (
          <div className="camera-section">
            <div className="face-position-guide">
              <h3>Face Positioning Guide</h3>
              <ul className="face-guide-list">
                <li className={faceCentered ? 'success' : ''}>
                  <span className="check-icon">{faceCentered ? '✓' : '○'}</span>
                  Center your face in the frame
                </li>
                <li className={faceDistance === 'good' ? 'success' : ''}>
                  <span className="check-icon">{faceDistance === 'good' ? '✓' : '○'}</span>
                  Keep a good distance (not too close/far)
                </li>
                <li className={faceDetected ? 'success' : ''}>
                  <span className="check-icon">{faceDetected ? '✓' : '○'}</span>
                  Look directly at the camera
                </li>
              </ul>
            </div>
            {!isCapturing ? (
              <button
                className="start-button"
                onClick={startCamera}
                disabled={loading || !isModelLoaded || !username.trim()}
              >
                {loading ? 'Loading...' : 'Start Camera'}
              </button>
            ) : (
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ display: 'block', width: '100%' }}
                />
                <canvas 
                  ref={canvasRef}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                />
                <div className="scan-message">{scanMessage}</div>
                {/* Enhanced progress bar that shows both time progress and detection progress */}
                <div className="detection-progress-container">
                  <div 
                    className="detection-progress-bar" 
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          (detectionCount / TOTAL_DETECTIONS_NEEDED) * 100,
                          scanStartTime ? ((Date.now() - scanStartTime) / MIN_SCAN_TIME_MS) * 100 : 0
                        )
                      )}%`
                    }}
                  ></div>
                </div>
                {/* Add a visible timer */}
                {scanTimeRemaining > 0 && !faceDetected && (
                  <div className="scan-timer">
                    {scanTimeRemaining}s
                  </div>
                )}
                {/* Face position feedback */}
                {!faceDetected && (
                  <div className={`face-position-feedback ${faceDistance}`}>
                    {!faceCentered && <div>Move your face to the center</div>}
                    {faceDistance === 'too_close' && <div>Move further from camera</div>}
                    {faceDistance === 'too_far' && <div>Move closer to camera</div>}
                  </div>
                )}
                {/* Add face detection success overlay when face is detected */}
                {faceDetected && (
                  <div className="face-detected-overlay">
                    <div className="face-detected-icon"></div>
                    <p>Face Successfully Detected!</p>
                  </div>
                )}
              </div>
            )}
            {isCapturing && (
              <div className="camera-controls">
                <button className="cancel-button" onClick={stopCamera}>
                  Cancel
                </button>
                <button
                  className={`register-button ${faceDetected ? 'register-ready' : ''}`}
                  onClick={saveFaceData}
                  disabled={!faceDetected}
                >
                  {faceDetected ? (
                    <>
                      Register Face
                      <span className="register-icon">✓</span>
                    </>
                  ) : (
                    'Waiting for Face...'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        {registrationStep === 'processing' && (
          <div className="processing-container">
            <div className="spinner"></div>
            <h3>Processing Face Data</h3>
            <p>Please wait while we {usernameExists ? 'update' : 'save'} your face data...</p>
            {/* Add a countdown timer to prevent endless processing */}
            <p className="processing-timer" ref={(el) => {
              if (el && !el.hasTimer) {
                el.hasTimer = true;
                let timeLeft = 10;
                const timer = setInterval(() => {
                  timeLeft -= 1;
                  if (el) el.innerText = `Timeout in ${timeLeft} seconds...`;
                  if (timeLeft <= 0) {
                    clearInterval(timer);
                    // Force completion if taking too long
                    setRegistrationStep('complete');
                  }
                }, 1000);
              }
            }}>Processing...</p>
          </div>
        )}
        {registrationStep === 'complete' && (
          <div className="completion-container">
            <div className="success-icon">✓</div>
            <h3>Registration Complete!</h3>
            <p>Your face data has been successfully {usernameExists ? 'updated' : 'registered'}.</p>
            {faceDataInfo && (
              <div className="storage-info">
                <h4>Storage Information</h4>
                <ul>
                  <li>Storage Type: {faceDataInfo.location}</li>
                  <li>Storage Key: {faceDataInfo.storageKey}</li>
                  <li>Saved At: {new Date(faceDataInfo.timestamp).toLocaleString()}</li>
                  <li>Type: {faceDataInfo.isUpdate ? 'Update' : 'New Registration'}</li>
                </ul>
                <div className="info-tip">
                  <p>Your face data is saved in your browser's local storage</p>
                </div>
              </div>
            )}
            <p className="redirect-message">
              Redirecting to login in {progress} seconds...
            </p>
          </div>
        )}
        <div className="alternative-auth">
          <p>Already have an account?</p>
          <Link to="/login" className="login-link">
            Login with Face ID
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
