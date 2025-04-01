import React from 'react';
import '../styles/components/About.css';
import { FaHeartbeat, FaLightbulb, FaUsers, FaChartLine, FaLinkedin, FaGithub } from 'react-icons/fa';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section with Background */}
      <div className="about-hero">
        <div className="hero-content">
          <h1>About MediConnect</h1>
          <div className="hero-divider"></div>
          <p className="subtitle">Revolutionizing healthcare access for everyone</p>
        </div>
        <div className="hero-shape"></div>
      </div>

      {/* Mission Section with Modern Card */}
      <div className="about-section mission-vision-container">
        <div className="section-card mission-card">
          <div className="card-header">
            <span className="card-icon"><FaHeartbeat /></span>
            <h2>Our Mission</h2>
          </div>
          <p>
            MediConnect is dedicated to bridging the healthcare gap by providing accessible, 
            affordable, and quality healthcare services to all, especially in remote and 
            underserved communities. We leverage modern technology to connect patients with 
            healthcare professionals, regardless of geographical barriers.
          </p>
        </div>

        <div className="section-card vision-card">
          <div className="card-header">
            <span className="card-icon"><FaLightbulb /></span>
            <h2>Our Vision</h2>
          </div>
          <p>
            We envision a world where everyone has equal access to healthcare services. 
            Through our innovative platform, we strive to create a seamless healthcare 
            experience that empowers individuals to take control of their health and 
            well-being.
          </p>
        </div>
      </div>

      {/* Key Features Section - Now centered */}
      <section className="features-section">
        <div className="section-title">
          <h2>Key Features</h2>
          <div className="title-underline"></div>
        </div>
        <div className="features-grid-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👩‍⚕️</div>
              <h3>Virtual Consultations</h3>
              <p>Connect with healthcare professionals through video calls</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Prescription Management</h3>
              <p>Easy management of prescriptions and medication reminders</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Health Assistant</h3>
              <p>Get quick responses to your health queries 24/7</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👩‍🦽</div>
              <h3>ASHA Worker Network</h3>
              <p>Community health workers providing doorstep health services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h3>10k+</h3>
            <p>Users</p>
          </div>
          <div className="stat-item">
            <h3>500+</h3>
            <p>Healthcare Providers</p>
          </div>
          <div className="stat-item">
            <h3>25+</h3>
            <p>Districts</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>
      </section>

      {/* Team Section with Member Cards */}
      <section className="team-section">
        <div className="section-title">
          <h2>Our Team</h2>
          <div className="title-underline"></div>
        </div>
        
        <div className="team-description text-center">
          <p>
            MediConnect is powered by a dedicated team of healthcare professionals, 
            technology experts, and passionate individuals committed to making healthcare 
            accessible to all.
          </p>
        </div>
        
        <div className="team-members">
          <div className="team-member-card">
            <div className="member-avatar">
              <img src="./assets/images/" alt="Aniket Mhatre" />
            </div>
            <h3 className="member-name">Aniket Mhatre</h3>
            <p className="member-role">Lead Developer</p>
            <p className="member-bio">Specializes in AI and machine learning algorithms for healthcare solutions.</p>
            <div className="member-social">
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            </div>
          </div>
          
          <div className="team-member-card">
            <div className="member-avatar">
              <img src="./assets/images/shruti.jpeg" alt="Shruti Chavre" />
            </div>
            <h3 className="member-name">Shruti Chavre</h3>
            <p className="member-role">Healthcare Specialist</p>
            <p className="member-bio">Brings expertise in rural healthcare policy and implementation.</p>
            <div className="member-social">
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            </div>
          </div>
          
          <div className="team-member-card">
            <div className="member-avatar">
              <img src="/assets/images/tanisha.jpeg" alt="Tanisha Paras" />
            </div>
            <h3 className="member-name">Tanisha Paras</h3>
            <p className="member-role">UI/UX Designer</p>
            <p className="member-bio">Creates intuitive interfaces focused on accessibility and ease of use.</p>
            <div className="member-social">
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            </div>
          </div>
        </div>
        
        <div className="team-values">
          <div className="value-item">
            <span className="value-dot"></span>
            <p>Compassion</p>
          </div>
          <div className="value-item">
            <span className="value-dot"></span>
            <p>Innovation</p>
          </div>
          <div className="value-item">
            <span className="value-dot"></span>
            <p>Accessibility</p>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="join-us-section">
        <div className="cta-pattern left"></div>
        <div className="cta-pattern right"></div>
        <h2>Join the Healthcare Revolution</h2>
        <p>
          Be a part of our mission to transform healthcare delivery. Together, 
          we can create a healthier and more connected world.
        </p>
        <button className="join-us-btn">Contact Us</button>
      </section>
    </div>
  );
};

export default About;
