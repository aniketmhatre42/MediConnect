import React, { useEffect } from 'react';
import { FaHeartbeat, FaRobot, FaVideo, FaHospital, FaAmbulance, FaUserNurse, FaMobileAlt, FaLaptopMedical } from 'react-icons/fa';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: <FaRobot />,
      title: "AI Medical Assistant",
      description: "24/7 multilingual AI chatbot for initial medical consultations and symptom analysis.",
      category: "digital"
    },
    {
      icon: <FaVideo />,
      title: "Telemedicine",
      description: "Connect with healthcare professionals through video consultations from anywhere.",
      category: "digital"
    },
    {
      icon: <FaHospital />,
      title: "Hospital Network",
      description: "Access to our network of verified hospitals and specialists across India.",
      category: "healthcare"
    },
    {
      icon: <FaAmbulance />,
      title: "Emergency Services",
      description: "Quick access to ambulance services with real-time tracking.",
      category: "emergency"
    },
    {
      icon: <FaUserNurse />,
      title: "ASHA Worker Connect",
      description: "Digital platform for ASHA workers to manage community healthcare.",
      category: "community"
    },
    {
      icon: <FaMobileAlt />,
      title: "Mobile Health Records",
      description: "Secure digital storage of medical records and prescriptions.",
      category: "digital"
    },
    {
      icon: <FaLaptopMedical />,
      title: "Remote Diagnostics",
      description: "Basic diagnostic services through our telemedicine platform.",
      category: "healthcare"
    },
    {
      icon: <FaHeartbeat />,
      title: "Health Monitoring",
      description: "Regular health checkups and continuous monitoring services.",
      category: "healthcare"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    document.querySelectorAll('.service-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="services-container">
      <div className="services-header">
        <h1 className="services-title">Our Services</h1>
        <p className="services-subtitle">
          Comprehensive healthcare solutions designed for rural India
        </p>
      </div>

      <div className="service-categories">
        <div className="category active">All Services</div>
        <div className="category">Digital Health</div>
        <div className="category">Healthcare</div>
        <div className="category">Emergency</div>
        <div className="category">Community</div>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div 
            className="service-card" 
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <button className="learn-more-btn">Learn More</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;