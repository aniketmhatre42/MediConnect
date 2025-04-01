import React from 'react';
import '../styles/components/Services.css';

const Services = () => {
  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Our Services</h1>
        <p className="subtitle">Comprehensive healthcare solutions at your fingertips</p>
      </div>

      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">
            <img src="/assets/icons/telemedicine.png" alt="Telemedicine" />
          </div>
          <h3>Telemedicine</h3>
          <p>
            Connect with qualified healthcare professionals through secure video consultations.
            Get diagnosed, receive prescriptions, and follow up - all from the comfort of your home.
          </p>
          <a href="#telemedicine" className="service-link">Learn More →</a>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <img src="/assets/icons/ai-health.png" alt="Health AI" />
          </div>
          <h3>AI Health Assistant</h3>
          <p>
            Our AI-powered chatbot provides instant responses to common health questions,
            helps assess symptoms, and guides you to appropriate care options.
          </p>
          <a href="#ai-assistant" className="service-link">Learn More →</a>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <img src="/assets/icons/prescription.png" alt="Prescription" />
          </div>
          <h3>Digital Prescriptions</h3>
          <p>
            Receive, manage and access your prescriptions digitally. Set medication
            reminders and get automatic refill notifications.
          </p>
          <a href="#prescriptions" className="service-link">Learn More →</a>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <img src="/assets/icons/asha.png" alt="ASHA Worker" />
          </div>
          <h3>ASHA Worker Connect</h3>
          <p>
            Our network of ASHA workers provides doorstep healthcare services in rural and
            underserved areas, ensuring healthcare access for all.
          </p>
          <a href="#asha-worker" className="service-link">Learn More →</a>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <img src="/assets/icons/health-records.png" alt="Health Records" />
          </div>
          <h3>Health Records</h3>
          <p>
            Securely store and access your health records, test results, and medical history
            in one place, and easily share with healthcare providers when needed.
          </p>
          <a href="#health-records" className="service-link">Learn More →</a>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <img src="/assets/icons/education.png" alt="Education" />
          </div>
          <h3>Health Education</h3>
          <p>
            Access a wealth of reliable health information, videos, and resources to help
            you make informed decisions about your health and wellness.
          </p>
          <a href="#education" className="service-link">Learn More →</a>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register</h3>
            <p>Create your secure MediConnect account</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose Service</h3>
            <p>Select the healthcare service you need</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect</h3>
            <p>Get connected to healthcare professionals</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Receive Care</h3>
            <p>Get the care you need, when you need it</p>
          </div>
        </div>
      </div>

      <div className="service-cta">
        <h2>Ready to experience better healthcare?</h2>
        <button className="cta-button">Get Started</button>
      </div>
    </div>
  );
};

export default Services;
