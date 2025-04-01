import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { Link } from 'react-router-dom';
import './Login.css';
import { loadFaceDescriptor } from './services/localFaceStorage';
import { getFaceFromFirebase } from './services/firebaseFaceService';

const Login = () => {
  // Face authentication state
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [matchProgress, setMatchProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceName, setFaceName] = useState('');
  const [scanningComplete, setScanningComplete] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Face position feedback
  const [faceCentered, setFaceCentered] = useState(false);
  const [faceDistance, setFaceDistance] = useState('unknown');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Add minimum scan duration
  const MIN_SCAN_TIME_MS = 5000; // 5 seconds minimum scan time
  const [scanStartTime, setScanStartTime] = useState(null);
  const [scanTimeRemaining, setScanTimeRemaining] = useState(0);

  // Add the missing state variables for authentication status messages
  const [authStatus, setAuthStatus] = useState(null); // 'success', 'error', or null
  const [authMessage, setAuthMessage] = useState('');

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setScanStatus('Initializing face recognition...');
        setLoading(true);
        
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelLoaded(true);
        setLoading(false);
        setScanStatus('Face models loaded. Ready to start authentication.');
      } catch (err) {
        setError('Error loading face recognition models. Please refresh and try again.');
        setLoading(false);
      }
    };
    
    loadModels();
    
    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startFaceAuthentication = async () => {
    setIsCapturing(true);
    setFaceDetected(false);
    setIsAuthenticated(false);
    setError('');
    setScanningComplete(false);
    setScanStartTime(Date.now()); // Record scan start time
    setScanTimeRemaining(MIN_SCAN_TIME_MS / 1000);
    
    try {
      setScanStatus('Starting camera...');
      startVideoStream();
    } catch (err) {
      setError('Error starting authentication: ' + err.message);
      setLoading(false);
    }
  };

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              fetchStoredFaceData();
            })
            .catch(err => {
              setError('Error playing video: ' + err.message);
              setLoading(false);
            });
        };
      }
    } catch (err) {
      setError('Camera access failed: ' + err.message);
      setLoading(false);
    }
  };

  const fetchStoredFaceData = async () => {
    setScanStatus('Looking for registered faces...');
    
    try {
      // Get stored face data from localStorage
      const storedFaceData = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
      
      if (!storedFaceData || storedFaceData.length === 0) {
        setScanStatus('No registered faces found. Please register first.');
        setError('No faces are registered for recognition');
        setLoading(false);
        return;
      }
      
      console.log(`Found ${storedFaceData.length} registered faces`);
      startFaceDetectionLoop(storedFaceData);
    } catch (err) {
      setError('Error fetching face data: ' + err.message);
      setLoading(false);
    }
  };

  const startFaceDetectionLoop = (storedFaceData) => {
    if (!videoRef.current || !canvasRef.current) return;
    
    let matchAttempts = 0;
    const maxAttempts = 30;
    let bestMatch = { distance: 1, user: null };
    
    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || matchAttempts >= maxAttempts) return;
      
      // Calculate time elapsed and remaining
      const elapsedTime = Date.now() - scanStartTime;
      const remainingTime = Math.max(0, Math.ceil((MIN_SCAN_TIME_MS - elapsedTime) / 1000));
      setScanTimeRemaining(remainingTime);
      const scanComplete = elapsedTime >= MIN_SCAN_TIME_MS;
      
      try {
        // Update status message to include time remaining
        if (!scanComplete) {
          setScanStatus(`Scanning your face... ${remainingTime}s remaining`);
        } else {
          setScanStatus(`Matching face (${matchAttempts + 1}/${maxAttempts})...`);
        }
        
        // Update progress to reflect both time and matching progress
        setMatchProgress(Math.min(100, ((elapsedTime / MIN_SCAN_TIME_MS) * 50) + 
            (scanComplete ? (matchAttempts / maxAttempts) * 50 : 0)));
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          // Draw detection on canvas
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          const dims = faceapi.matchDimensions(canvas, video, true);
          const resizedResults = faceapi.resizeResults(detection, dims);
          
          // Draw face detection box and landmarks
          faceapi.draw.drawDetections(canvas, [resizedResults]);
          faceapi.draw.drawFaceLandmarks(canvas, [resizedResults]);
          
          // Calculate face position feedback
          const box = detection.detection.box;
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const canvasCenterX = canvas.width / 2;
          const canvasCenterY = canvas.height / 2;
          
          // Check if face is centered
          const isCentered = 
            Math.abs(centerX - canvasCenterX) < canvas.width * 0.15 && 
            Math.abs(centerY - canvasCenterY) < canvas.height * 0.15;
          setFaceCentered(isCentered);
          
          // Check face size/distance
          const faceRatio = box.width / canvas.width;
          if (faceRatio < 0.2) {
            setFaceDistance('too_far');
          } else if (faceRatio > 0.6) {
            setFaceDistance('too_close');
          } else {
            setFaceDistance('good');
          }
          
          // Only proceed with matching if minimum scan time has elapsed
          if (scanComplete) {
            setFaceDetected(true);
            
            // Compare with stored face descriptors
            for (const userData of storedFaceData) {
              try {
                let storedDescriptor = null;
                
                // First try to get descriptor from Firebase if we have username
                if (userData.username) {
                  try {
                    // Modified to use username as key
                    storedDescriptor = await getFaceFromFirebase(userData.username);
                    if (storedDescriptor) {
                      console.log(`Retrieved face descriptor for ${userData.username} from Firebase`);
                    }
                  } catch (fbError) {
                    console.warn(`Failed to get descriptor for ${userData.username} from Firebase:`, fbError);
                  }
                }
                
                // If no descriptor from Firebase, try to get from localStorage
                if (!storedDescriptor && userData.descriptor) {
                  storedDescriptor = new Float32Array(userData.descriptor);
                  console.log(`Using face descriptor from localStorage for ${userData.username || userData.userId}`);
                }
                
                // Skip this user if we couldn't get a descriptor
                if (!storedDescriptor) continue;
                
                // Calculate the similarity distance between detected face and stored face
                const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
                
                console.log(`Distance for ${userData.username || userData.userId}: ${distance.toFixed(4)}`);
                
                // Keep track of the best match so far
                if (distance < bestMatch.distance) {
                  bestMatch = { distance, user: userData };
                }
                
                // If we have a very close match, stop early
                const MATCH_THRESHOLD = 0.45; // Lower is stricter matching
                if (distance < MATCH_THRESHOLD) {
                  setIsAuthenticated(true);
                  setFaceName(userData.username || 'User');
                  setScanStatus(`Welcome back, ${userData.username || 'User'}!`);
                  setLoading(false);
                  setScanningComplete(true);
                  
                  // Sign in the user
                  handleSuccessfulLogin(userData);
                  
                  // Redirect after a short delay
                  setTimeout(() => {
                    stopVideoStream();
                    navigate('/');
                  }, 2000);
                  return;
                }
              } catch (compareError) {
                console.error('Error comparing face descriptors:', compareError);
              }
            }
            
            matchAttempts++;
            
            if (matchAttempts >= maxAttempts) {
              // After all attempts, if we have a reasonable match, use it
              const FALLBACK_THRESHOLD = 0.6; // More lenient threshold for fallback matching
              if (bestMatch.distance < FALLBACK_THRESHOLD) {
                setIsAuthenticated(true);
                setFaceName(bestMatch.user.username || 'User');
                setScanStatus(`Welcome back, ${bestMatch.user.username || 'User'}!`);
                
                // Sign in the user
                handleSuccessfulLogin(bestMatch.user);
                
                setTimeout(() => {
                  stopVideoStream();
                  navigate('/');
                }, 2000);
              } else {
                setScanStatus('Face not recognized. Please try again or register a new account.');
                setError('No matching face found');
              }
              setLoading(false);
              setScanningComplete(true);
            } else {
              requestAnimationFrame(detectFace);
            }
          } else {
            // Continue scanning until minimum time requirement met
            requestAnimationFrame(detectFace);
          }
        } else {
          setScanStatus(`No face detected. Please position your face in the frame. ${remainingTime}s remaining`);
          setFaceDetected(false);
          
          // Only count as an attempt if minimum scan time has passed
          if (scanComplete) {
            matchAttempts++;
            
            if (matchAttempts >= maxAttempts) {
              setScanStatus('Face not detected. Please try again.');
              setLoading(false);
              setScanningComplete(true);
            } else {
              requestAnimationFrame(detectFace);
            }
          } else {
            requestAnimationFrame(detectFace);
          }
        }
      } catch (err) {
        setError('Error during face detection: ' + err.message);
        setLoading(false);
      }
    };
    
    detectFace();
  };

  const stopVideoStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const restartFaceAuth = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    stopVideoStream();
    setMatchProgress(0);
    setFaceDetected(false);
    setIsAuthenticated(false);
    setScanningComplete(false);
    setError('');
    startFaceAuthentication();
  };

  const handleSuccessfulLogin = (userData) => {
    // Store user information consistently in both sessionStorage and localStorage
    sessionStorage.setItem('username', userData?.username || 'User');
    sessionStorage.setItem('authenticated', 'true');
    sessionStorage.setItem('userId', userData?.userId || 'user_temp');
    
    // Also store in localStorage for persistence if needed
    localStorage.setItem('user', JSON.stringify({
      username: userData?.username || 'User',
      userId: userData?.userId || 'user_temp',
      authenticated: true
    }));
    
    // Dispatch custom event to notify components (like Navbar) of auth change
    window.dispatchEvent(new Event('authChange'));
    
    // Show success message
    setAuthStatus('success');
    setAuthMessage('Authentication successful! Redirecting...');
    
    // ...existing redirect code...
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Face ID Login</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="face-auth-container">
          {!isCapturing ? (
            <div className="login-start-section">
              <div className="face-icon-container">
                <div className="face-icon"></div>
              </div>
              
              <p className="login-instruction">
                Use your face to securely log in to your account
              </p>
              
              <button 
                className="start-face-auth-btn"
                onClick={startFaceAuthentication}
                disabled={loading || !modelLoaded}
              >
                {loading ? 'Initializing...' : 'Start Face Scan'}
              </button>
              
              {loading && <div className="loader-circle"></div>}
              
              {modelLoaded && !loading && !isCapturing && (
                <p className="system-status">System ready. Click button to begin.</p>
              )}
            </div>
          ) : (
            <>
              {!scanningComplete && (
                <div className="face-position-guide">
                  <h3>Face Positioning Guide</h3>
                  <ul className="face-guide-list">
                    <li className={faceCentered ? 'success' : ''}>
                      <span className="check-icon">{faceCentered ? '✓' : '○'}</span>
                      Center your face in the frame
                    </li>
                    <li className={faceDistance === 'good' ? 'success' : ''}>
                      <span className="check-icon">{faceDistance === 'good' ? '✓' : '○'}</span>
                      Keep a good distance from camera
                    </li>
                    <li className={faceDetected ? 'success' : ''}>
                      <span className="check-icon">{faceDetected ? '✓' : '○'}</span>
                      Look directly at the camera
                    </li>
                  </ul>
                </div>
              )}
              
              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="face-video"
                />
                <canvas
                  ref={canvasRef}
                  className="face-canvas"
                />
                
                {isCapturing && !scanningComplete && (
                  <>
                    <div className="scan-message">{scanStatus}</div>
                    {/* Progress bar */}
                    <div className="detection-progress-container">
                      <div 
                        className="detection-progress-bar" 
                        style={{width: `${matchProgress}%`}}
                      ></div>
                    </div>
                    
                    {/* Add visible timer during scan */}
                    {scanTimeRemaining > 0 && (
                      <div className="scan-timer" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
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
                  </>
                )}
                
                {isAuthenticated && scanningComplete && (
                  <div className="auth-success-overlay">
                    <div className="success-checkmark"></div>
                    <h3>Authentication Successful!</h3>
                    <p>Welcome back, {faceName}!</p>
                    <p className="redirect-message">Redirecting to dashboard...</p>
                  </div>
                )}
                
                {!isAuthenticated && scanningComplete && (
                  <div className="auth-failed-overlay">
                    <div className="failed-icon">✕</div>
                    <h3>Authentication Failed</h3>
                    <p>Face not recognized</p>
                  </div>
                )}
              </div>
              
              {scanningComplete && !isAuthenticated && (
                <div className="auth-action-buttons">
                  <button 
                    className="retry-button"
                    onClick={restartFaceAuth}
                  >
                    Try Again
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      stopVideoStream();
                      setIsCapturing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="alternative-auth">
          <p>Don't have an account?</p>
          <Link to="/signup" className="register-link">
            Register with Face ID
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;