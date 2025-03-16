import React from 'react';
import './Preloader.css'; 

const Preloader = () => {
  return (
    <div className="preloader">
      <video autoPlay loop muted className="preloader-video">
        <source src="/preloader.mp4" type="video/mp4" />
        
      </video>
      <div className="preloader-overlay"></div>
    </div>
  );
};

export default Preloader;
