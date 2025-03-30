import React, { useState, useRef } from 'react';

/**
 * Simple component to test camera access 
 */
const CameraTester = () => {
  const [status, setStatus] = useState('Ready to test camera');
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  
  const startCamera = async () => {
    try {
      setStatus('Requesting camera access...');
      setError(null);
      
      // Request camera with minimal options
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      setStatus('Camera access granted!');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setStatus(`Camera access failed: ${err.name}`);
      setError(err.message);
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setStatus('Camera stopped');
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', 
                textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Camera Access Tester</h2>
      
      <div style={{ margin: '20px 0', padding: '10px', 
                  backgroundColor: status.includes('failed') ? '#ffebee' : '#f1f8e9', 
                  borderRadius: '4px' }}>
        <p><strong>Status:</strong> {status}</p>
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      </div>
      
      <div style={{ margin: '20px 0' }}>
        {!stream ? (
          <button 
            onClick={startCamera}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Stop Camera
          </button>
        )}
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '300px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        overflow: 'hidden',
        marginTop: '20px',
        border: stream ? '3px solid green' : '1px dashed #ccc'
      }}>
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#000'
          }}
        />
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Browser:</strong> {navigator.userAgent}</p>
        <p><strong>Has MediaDevices API:</strong> {navigator.mediaDevices ? "Yes" : "No"}</p>
        <p><strong>Has getUserMedia:</strong> {navigator.mediaDevices?.getUserMedia ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

export default CameraTester;
