import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

function FacialAuth() {
  const videoRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        // Using models directly from CDN
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        await startVideo();
        setIsLoading(false);
      } catch (err) {
        setError('Error loading face recognition models: ' + err.message);
        setIsLoading(false);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing webcam: ", err));
    };

    loadModels();
  }, []);

  const handleVideoPlay = async () => {
    // Start face detection process
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(detections, {
          width: videoRef.current.width,
          height: videoRef.current.height,
        });

        const results = resizedDetections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor)
        );

        results.forEach((result, i) => {
          if (result.label === "YourName") {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        });
      }
    }, 1000);
  };

  const loadLabeledImages = () => {
    const labels = ["YourName"]; // Labels should match the person's name to be authenticated
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 1; i++) {
          const img = await faceapi.fetchImage(`/labeled_images/${label}/${i}.jpg`);
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

  return (
    <div className="facial-auth-container">
      {error && <div className="error">{error}</div>}
      {isLoading ? (
        <div className="loading">Loading face recognition models...</div>
      ) : (
        <>
          <h3>Facial Authentication</h3>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="720"
            height="560"
            onPlay={handleVideoPlay}
          />
          {isAuthenticated ? (
            <div className="auth-success">Authenticated Successfully!</div>
          ) : (
            <div className="auth-warning">Waiting for authentication...</div>
          )}
        </>
      )}
    </div>
  );
}

export default FacialAuth;
