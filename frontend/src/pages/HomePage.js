import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to Campus Connect</h1>
            <p className="hero-subtitle">Experience seamless campus living with our integrated services</p>
            <button 
              className="cta-button" 
              onClick={() => navigate('/login')}
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="hero-image">
            <img 
              src="/illustration.jpg" 
              alt="Students enjoying campus life" 
              className="hero-img" 
            />
          </div>
        </div>
      </section>

      {/* Features Section (optional) */}
      <section className="features-section">
        <h2 className="section-title">Our Services</h2>
        <div className="features-grid">
          {/* Feature cards would go here */}
        </div>
      </section>
    </div>
  );
};

export default HomePage;