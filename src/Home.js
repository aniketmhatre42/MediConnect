import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaAmbulance, FaHospital, FaMobileAlt, FaRobot, 
  FaVideo, FaStethoscope, FaChevronLeft, FaChevronRight,
  FaLanguage, FaClock, FaCheckCircle, FaLaptopMedical
} from "react-icons/fa";
import './Home.css';
import chatbotGif from './assets/images/chatbot_gif.gif';

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = [
    { quote: "MediConnect helped my grandmother get specialist consultation without traveling 100km to the city. The doctor diagnosed her condition through video call and prescribed medication that was delivered to our doorstep.",
      author: "Shruti Chavre",
      role: "Villager, Madhya Pradesh"
    },
    { quote: "As an ASHA worker, this platform has made my job significantly easier. I can now connect villagers with doctors instantly and maintain digital health records for everyone.",
      author: "Tanisha Paras",
      role: "ASHA Worker, Tamil Nadu"
    },
    { quote: "The AI chatbot quickly identified my symptoms as potential dengue fever and arranged an immediate video consultation with a doctor. This prompt action probably saved my life.",
      author: "Aniket Mhatre",
      role: "Farmer, Uttar Pradesh"
    },
    { quote: "Being able to speak to the AI in my native language made all the difference. I could explain my symptoms properly and get the right medical advice.",
      author: "Dipti Raut",
      role: "Homemaker, Gujarat"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToTestimonial = (index) => {
    setActiveIndex(index);
  };

  const navigateTestimonial = (direction) => {
    setActiveIndex((prevIndex) => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) return testimonials.length - 1;
      if (newIndex >= testimonials.length) return 0;
      return newIndex;
    });
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-flex">
            <div className="hero-text">
              <div className="hero-badge">Healthcare Innovation</div>
              <h1 className="intro-text">
                CONNECTING RURAL <span className="highlight-text">INDIA</span> TO MODERN HEALTHCARE
              </h1>
              <p className="hero-description">
                MediConnect bridges the healthcare gap in rural India through innovative technology. We reach the unreached with telemedicine solutions,
                multilingual support, and a network of dedicated healthcare professionals.
              </p>
              <div className="hero-stats">
                
                
               
              </div>
              <div className="hero-cta">
                <Link to="/about">
                  <button className="cta-button">Learn More</button>
                </Link>
                <Link to="/services">
                  <button className="cta-button secondary">Our Services</button>
                </Link>
              </div>
            </div>
            <div className="hero-image-container">
              <div className="hero-pattern"></div>
              <img src="/favicon.png" alt="MediConnect AI Chatbot" className="hero-image" />
              <div className="hero-image-badge">
                AI-Powered <br/>Healthcare
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="ai-highlight-section">
        <div className="ai-highlight-content">
          <div className="ai-highlight-info">
            <span className="ai-subtitle">Intelligent Healthcare</span>
            <h2>AI-Powered Medical Assistance</h2>
            <p className="ai-highlight-description">
              Our advanced AI technology understands multiple Indian languages, identifies symptoms,
              and provides immediate guidance. Available 24/7, it bridges the gap between rural
              communities and quality healthcare with personalized recommendations.
            </p>
            <div className="ai-features">
              <div className="ai-feature-item">
                <FaLanguage /> Multilingual Support
              </div>
              <div className="ai-feature-item">
                <FaClock /> 24/7 Availability
              </div>
              <div className="ai-feature-item">
                <FaCheckCircle /> Symptom Analysis
              </div>
              <div className="ai-feature-item">
                <FaLaptopMedical /> Digital Prescriptions
              </div>
            </div>
            <Link to="/chatbot">
              <button className="cta-button dark">Try Our Chatbot</button>
            </Link>
          </div>
          <div className="ai-highlight-image">
            <img src={chatbotGif} alt="AI Chatbot Interface" className="chatbot-gif pulse-animation" />
          </div>
        </div>
      </section>
      <section className="features-section">
        <h2 className="section-title">Our Solutions</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-container">
              <FaMobileAlt className="feature-icon" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Mobile-Based Access</h3>
              <p className="feature-description">
                Access healthcare services directly from your mobile phone using simple OTP authentication,
                making healthcare available to everyone with a basic phone.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <FaRobot className="feature-icon" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">AI-Powered Chatbot</h3>
              <p className="feature-description">
                Our multilingual AI chatbot guides patients through the process and provides 
                recommendations based on symptoms in the language they're comfortable with.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <FaVideo className="feature-icon" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Remote Consultations</h3>
              <p className="feature-description">
                Video conferencing allows patients to consult with specialists from their local kiosk 
                or home, eliminating the need for long-distance travel.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <FaHospital className="feature-icon" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Access to Specialists</h3>
              <p className="feature-description">
                Get referred to specialists and receive treatment plans through a simple and 
                efficient process from the comfort of your village.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <FaStethoscope className="feature-icon" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Digital Prescriptions</h3>
              <p className="feature-description">
                Receive and store digital prescriptions that can be accessed anytime and used 
                at local pharmacies for easier medication access.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <FaAmbulance className="feature-icon" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Emergency Services</h3>
              <p className="feature-description">
                Quick access to ambulance services during emergencies with live tracking and 
                estimated arrival times for better emergency management.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="section-title">Success Stories</h2>
          <div className="testimonials-carousel">
            <button 
              className="testimonial-nav-btn prev-btn" 
              onClick={() => navigateTestimonial(-1)}
              aria-label="Previous testimonial"
            >
              <FaChevronLeft />
            </button>
            <div className="testimonial-slide-container">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`testimonial-card ${activeIndex === index ? 'active' : ''}`}
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: `translateX(${(index - activeIndex) * 100}%)`
                  }}
                >
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <div className="testimonial-author">{testimonial.author}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              ))}
            </div>
            <button 
              className="testimonial-nav-btn next-btn" 
              onClick={() => navigateTestimonial(1)}
              aria-label="Next testimonial"
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <span 
                key={index}
                className={`indicator ${activeIndex === index ? 'active' : ''}`}
                onClick={() => goToTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
