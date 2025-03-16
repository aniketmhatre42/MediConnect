import React, { useState, useEffect, useRef } from 'react';
import { FaHeartbeat, FaHandHoldingHeart, FaLightbulb, FaUsers, 
  FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaShieldAlt } from 'react-icons/fa';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const tabsRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef(null);
  // Add state for stats
  const [stats, setStats] = useState([
    { value: 0, target: 200, label: 'Villages Connected' },
    { value: 0, target: 5000, label: 'Patients Served' },
    { value: 0, target: 150, label: 'Healthcare Professionals' },
    { value: 0, target: 24, label: 'Hour Support' }
  ]);

  // Team members data
  const teamMembers = [
    {
      name: 'Dr. Aniket Mhatre',
      role: 'Founder & CEO',
      image: '/team1.jpg',
      bio: 'Medical specialist with 15+ years of experience in rural healthcare initiatives.',
      social: { facebook: '#', twitter: '#', linkedin: '#' }
    },
    {
      name: 'Priya Patel',
      role: 'Chief Medical Officer',
      image: '/team2.jpg',
      bio: 'Public health expert focused on integrating technology with traditional healthcare systems.',
      social: { facebook: '#', twitter: '#', linkedin: '#' }
    },
    {
      name: 'Rajiv Kumar',
      role: 'Technical Director',
      image: '/team3.jpg',
      bio: 'Tech innovator specializing in AI and machine learning for healthcare applications.',
      social: { facebook: '#', twitter: '#', github: '#' }
    },
  ];

  // Remove journey from timeline data
  const timeline = []; // We don't need this anymore

  useEffect(() => {
    // Update slider position when tab changes
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`.about-tab[data-tab="${activeTab}"]`);
      if (activeTabElement) {
        setSliderStyle({
          width: `${activeTabElement.offsetWidth}px`,
          transform: `translateX(${activeTabElement.offsetLeft - tabsRef.current.querySelector('.about-tab').offsetLeft}px)`
        });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    // Animation for stats counter when they come into view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animatedStats) {
        setAnimatedStats(true);
        animateStats();
      }
    }, { threshold: 0.5 });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [animatedStats]);

  const animateStats = () => {
    const duration = 2000; // Animation duration in milliseconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: Math.floor(progress * stat.target)
        }))
      );
      
      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
  };

  return (
    <div className="about-container">
      <div className="about-header">
        <h1 className="about-title">About MediConnect</h1>
        <div className="about-divider"></div>
        <p className="about-subtitle">
          Connecting rural India to modern healthcare through innovative technology solutions, 
          making quality medical services accessible to everyone, everywhere.
        </p>
      </div>

      <div className="about-tabs" ref={tabsRef}>
        <div className="tab-container">
          <div className="tab-slider" style={sliderStyle}></div>
          <button 
            className={`about-tab ${activeTab === 'mission' ? 'active' : ''}`} 
            onClick={() => setActiveTab('mission')}
            data-tab="mission"
          >
            Our Mission
          </button>
          <button 
            className={`about-tab ${activeTab === 'team' ? 'active' : ''}`} 
            onClick={() => setActiveTab('team')}
            data-tab="team"
          >
            Our Team
          </button>
          <button 
            className={`about-tab ${activeTab === 'values' ? 'active' : ''}`} 
            onClick={() => setActiveTab('values')}
            data-tab="values"
          >
            Our Values
          </button>
        </div>
      </div>

      <div className="tab-content">
        {/* Mission Tab */}
        <div className={`tab-pane ${activeTab === 'mission' ? 'active' : ''}`}>
          <div className="mission-section">
            <div className="mission-details">
              <h2 className="section-title">Our Mission</h2>
              <p className="section-text">
                At MediConnect, our mission is to revolutionize rural healthcare in India by 
                leveraging technology to connect patients with quality medical services, regardless 
                of their location or economic status. We aim to reduce healthcare disparities and 
                improve health outcomes through accessible, affordable, and effective solutions.
              </p>
              <p className="section-text">
                We believe that everyone deserves access to quality healthcare, and we're committed 
                to breaking down barriers of distance, language, and infrastructure to make this a 
                reality for millions across rural India.
              </p>
            </div>
            <div className="mission-image">
              <img src="/mission.jpg" alt="MediConnect Mission" />
            </div>
          </div>

          <div className="stats-container" ref={statsRef}>
            {stats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Tab */}
        <div className={`tab-pane ${activeTab === 'team' ? 'active' : ''}`}>
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-text">
            Our team consists of passionate professionals from healthcare, technology, and 
            community development backgrounds, all united by the common goal of improving 
            healthcare access in rural India.
          </p>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-member" key={index}>
                <img src={member.image || `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 1}.jpg`} 
                     alt={member.name} 
                     className="member-image" />
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  <div className="social-links">
                    {member.social.facebook && 
                      <a href={member.social.facebook} className="social-link">
                        <FaFacebookF />
                      </a>
                    }
                    {member.social.twitter && 
                      <a href={member.social.twitter} className="social-link">
                        <FaTwitter />
                      </a>
                    }
                    {member.social.linkedin && 
                      <a href={member.social.linkedin} className="social-link">
                        <FaLinkedinIn />
                      </a>
                    }
                    {member.social.github && 
                      <a href={member.social.github} className="social-link">
                        <FaGithub />
                      </a>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Tab */}
        <div className={`tab-pane ${activeTab === 'values' ? 'active' : ''}`}>
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-text">
            These values guide everything we do at MediConnect, from product development to 
            community engagement and partnerships.
          </p>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><FaHeartbeat /></div>
              <h3 className="value-title">Compassion</h3>
              <p className="value-description">
                We approach healthcare with empathy and understanding, always putting people's 
                needs first and treating everyone with dignity and respect.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon"><FaShieldAlt /></div>
              <h3 className="value-title">Integrity</h3>
              <p className="value-description">
                We uphold the highest ethical standards in all our operations, ensuring 
                transparency, privacy, and confidentiality in every interaction.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon"><FaLightbulb /></div>
              <h3 className="value-title">Innovation</h3>
              <p className="value-description">
                We continuously explore new technologies and approaches to solve healthcare 
                challenges in creative and effective ways.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon"><FaHandHoldingHeart /></div>
              <h3 className="value-title">Accessibility</h3>
              <p className="value-description">
                We are committed to making quality healthcare accessible to everyone, 
                regardless of location, language, or economic status.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon"><FaUsers /></div>
              <h3 className="value-title">Community</h3>
              <p className="value-description">
                We believe in the power of community involvement and collaboration to create 
                sustainable healthcare solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
