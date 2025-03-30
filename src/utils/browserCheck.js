/**
 * Utility to check browser compatibility for camera features
 */
export const checkBrowserCompatibility = () => {
  const results = {
    compatible: true,
    issues: [],
    browser: {
      name: getBrowserName(),
      version: getBrowserVersion(),
      mobile: isMobile()
    },
    features: {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webGL: hasWebGLSupport()
    }
  };
  
  // Check if browser is compatible with face-api.js
  if (!results.features.webGL) {
    results.compatible = false;
    results.issues.push("WebGL is not supported, which is required for face detection");
  }
  
  if (!results.features.getUserMedia) {
    results.compatible = false;
    results.issues.push("Camera access (getUserMedia) is not supported");
  }
  
  // Add specific browser recommendations
  if (results.browser.name === "Internet Explorer") {
    results.compatible = false;
    results.issues.push("Internet Explorer is not supported. Please use Chrome, Firefox, or Edge");
  }
  
  if (results.browser.name === "Safari" && parseInt(results.browser.version) < 14) {
    results.issues.push("Older Safari versions may have limited compatibility. Upgrade to Safari 14+ for best experience");
  }
  
  return results;
};

// Helper functions
function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  if (userAgent.indexOf("SamsungBrowser") > -1) return "Samsung Internet";
  if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
  if (userAgent.indexOf("Trident") > -1) return "Internet Explorer";
  if (userAgent.indexOf("Edge") > -1) return "Edge";
  if (userAgent.indexOf("Chrome") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1) return "Safari";
  return "Unknown";
}

function getBrowserVersion() {
  const userAgent = navigator.userAgent;
  const browser = getBrowserName();
  let version = "Unknown";
  
  if (browser === "Chrome") {
    version = userAgent.match(/Chrome\/([0-9.]+)/)[1];
  } else if (browser === "Firefox") {
    version = userAgent.match(/Firefox\/([0-9.]+)/)[1];
  } else if (browser === "Safari") {
    version = userAgent.match(/Version\/([0-9.]+)/)[1];
  } else if (browser === "Edge") {
    version = userAgent.match(/Edge\/([0-9.]+)/)[1];
  }
  
  return version;
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function hasWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * Test camera availability and permissions
 * @returns {Promise<Object>} Result with success status and potential error
 */
export const testCameraAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop all tracks to release camera
    stream.getTracks().forEach(track => track.stop());
    return { 
      success: true, 
      message: "Camera access granted"
    };
  } catch (error) {
    return {
      success: false,
      error: error.name || "Unknown error",
      message: error.message,
      isDenied: error.name === "NotAllowedError",
      isNotFound: error.name === "NotFoundError"
    };
  }
};
