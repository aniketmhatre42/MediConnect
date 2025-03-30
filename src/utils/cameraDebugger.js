/**
 * Utility to help debug camera issues
 */

export const diagnoseCamera = async () => {
  const report = {
    browserInfo: getBrowserInfo(),
    cameraSupport: checkCameraSupport(),
    permissions: await checkCameraPermissions(),
    devices: await listMediaDevices()
  };
  
  console.log("Camera diagnostics report:", report);
  return report;
};

function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
    platform: navigator.platform,
    language: navigator.language
  };
}

function checkCameraSupport() {
  return {
    mediaDevicesSupported: !!navigator.mediaDevices,
    getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    enumerateDevicesSupported: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
    streamConstraintsSupported: !!(window.MediaStreamTrack && MediaStreamTrack.getSources)
  };
}

async function checkCameraPermissions() {
  try {
    // Query for camera permission state
    const permissionStatus = await navigator.permissions.query({ name: 'camera' });
    return {
      state: permissionStatus.state, // 'granted', 'denied', or 'prompt'
      permissionQuerySupported: true
    };
  } catch (error) {
    // Permission query not supported
    return {
      state: 'unknown',
      permissionQuerySupported: false,
      error: error.message
    };
  }
}

async function listMediaDevices() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { supported: false };
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    return {
      supported: true,
      count: devices.length,
      videoCameras: devices.filter(d => d.kind === 'videoinput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || 'Unnamed camera',
        groupId: d.groupId
      }))
    };
  } catch (error) {
    return {
      supported: false,
      error: error.message
    };
  }
}

/**
 * Tests the camera with current constraints
 * @returns {Promise<Object>} Test results
 */
export const testCameraWithConstraints = async (constraints = { video: true }) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Analyze the stream tracks
    const videoTracks = stream.getVideoTracks();
    const trackInfo = videoTracks.map(track => ({
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      constraints: track.getConstraints(),
      settings: track.getSettings()
    }));
    
    // Stop the stream
    videoTracks.forEach(track => track.stop());
    
    return {
      success: true,
      trackCount: videoTracks.length,
      tracks: trackInfo
    };
  } catch (error) {
    return {
      success: false,
      errorName: error.name,
      errorMessage: error.message,
      constraintName: error.constraintName
    };
  }
};

/**
 * Try to fix common camera issues automatically
 */
export const fixCameraIssues = async (videoElement) => {
  if (!videoElement) return { success: false, message: "No video element provided" };
  
  try {
    // 1. Check if browser is in a background tab (which might pause media)
    if (document.hidden) {
      return { 
        success: false, 
        message: "Browser tab is not active. Please focus this tab." 
      };
    }
    
    // 2. Check if the video element is properly initialized
    if (!videoElement.srcObject) {
      return { 
        success: false, 
        message: "Video source is not set. Try restarting the camera." 
      };
    }
    
    // 3. Try different constraints if current ones aren't working
    const videoTracks = videoElement.srcObject.getVideoTracks();
    if (!videoTracks || videoTracks.length === 0) {
      // Try getting a lower quality stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { max: 15 }
        }
      });
      
      videoElement.srcObject = stream;
      return {
        success: true,
        message: "Applied lower quality video constraints"
      };
    }
    
    // 4. Check if track is ended or muted
    const track = videoTracks[0];
    if (track.readyState === 'ended') {
      return {
        success: false,
        message: "Video track has ended. Camera may be in use by another application."
      };
    }
    
    // 5. Try restarting the track
    if (track.stop && typeof track.stop === 'function') {
      track.stop();
    }
    
    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = newStream;
    
    return {
      success: true,
      message: "Camera restarted successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fix camera: ${error.message}`
    };
  }
};

/**
 * Enhanced force camera permission prompt with user activation chain
 * @returns {Promise<Object>} - Permission status
 */
export const requestCameraPermission = async () => {
  try {
    console.log("=== CAMERA PERMISSION DEBUG LOG ===");
    console.log("Starting camera permission request flow...");
    
    // 1. Check current permission status first if available
    let permissionStatus = null;
    try {
      if (navigator.permissions && navigator.permissions.query) {
        permissionStatus = await navigator.permissions.query({ name: 'camera' });
        console.log(`Initial permission status: ${permissionStatus.state}`);
        
        // Monitor permission changes
        permissionStatus.onchange = () => {
          console.log(`Permission state changed to: ${permissionStatus.state}`);
        };
      } else {
        console.log("Permissions API not supported on this browser");
      }
    } catch (permErr) {
      console.log("Error checking permission status:", permErr);
    }
    
    // 2. Try with a very simple constraint set first (more compatible)
    console.log("Requesting camera with basic constraints...");
    try {
      const simpleStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      console.log("Basic camera access GRANTED!");
      
      // Get device information
      const videoTrack = simpleStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log("Video device:", videoTrack.label);
        
        // For debugging: get all camera capabilities
        try {
          const capabilities = videoTrack.getCapabilities();
          console.log("Camera capabilities:", capabilities);
        } catch (e) {
          console.log("Could not get camera capabilities");
        }
      }
      
      // Release this stream
      simpleStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind} - ${track.label}`);
        track.stop();
      });
      
      // 3. Now try with more specific constraints
      console.log("Testing with advanced constraints...");
      const advancedStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      console.log("Advanced camera access GRANTED!");
      
      // Release the advanced stream
      advancedStream.getTracks().forEach(track => track.stop());
      
      // 4. Check final permission status
      if (navigator.permissions && navigator.permissions.query) {
        const finalStatus = await navigator.permissions.query({ name: 'camera' });
        console.log(`Final permission status: ${finalStatus.state}`);
      }
      
      console.log("=== CAMERA PERMISSION FLOW COMPLETE ===");
      
      return {
        success: true,
        permissionGranted: true,
        permissionState: (permissionStatus?.state || 'granted'),
        message: "Camera permission successfully granted"
      };
    } catch (err) {
      console.error("Error in camera permission flow:", err);
      return {
        success: false,
        permissionGranted: false,
        error: err.name,
        message: err.message,
        isDenied: err.name === "NotAllowedError",
        isNotFound: err.name === "NotFoundError"
      };
    }
  } catch (err) {
    console.error("Unexpected error in camera permission request:", err);
    return {
      success: false,
      permissionGranted: false,
      error: err.name,
      message: err.message
    };
  }
};

/**
 * Simple camera test function that should work in most browsers
 */
export const simpleCameraTest = async () => {
  try {
    console.log("Starting simple camera test...");
    
    // Create a temporary video element
    const tempVideo = document.createElement('video');
    tempVideo.setAttribute('playsinline', ''); // Important for iOS
    tempVideo.setAttribute('autoplay', '');
    tempVideo.setAttribute('muted', '');
    document.body.appendChild(tempVideo);
    
    console.log("Requesting camera with basic constraints...");
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    console.log("Camera access GRANTED!", stream);
    
    // Connect stream to video
    tempVideo.srcObject = stream;
    
    // Let it play briefly then clean up
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stop all tracks
    stream.getTracks().forEach(track => {
      console.log(`Stopping track: ${track.label}`);
      track.stop();
    });
    
    // Remove temp video
    document.body.removeChild(tempVideo);
    
    console.log("Camera test complete - SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("Simple camera test failed:", err);
    return {
      success: false,
      error: err.name,
      message: err.message
    };
  }
};
