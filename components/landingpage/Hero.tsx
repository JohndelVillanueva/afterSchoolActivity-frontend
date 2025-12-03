import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Unleash Your Athletic Potential
          </h1>
          <p className="hero-subtitle">
            Join thousands of athletes and sports enthusiasts in the ultimate sports community. 
            Track progress, connect with coaches, and achieve your fitness goals.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large">Get Started</button>
            <button className="btn btn-secondary btn-large">Watch Demo</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat">
              <div className="stat-number">25+</div>
              <div className="stat-label">Sports</div>
            </div>
            <div className="stat">
              <div className="stat-number">100+</div>
              <div className="stat-label">Coaches</div>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="sports-illustration">
            <div className="athlete-silhouette"></div>
            <div className="floating-elements">
              <div className="floating-element">⚽</div>
              <div className="floating-element">🏀</div>
              <div className="floating-element">🎾</div>
              <div className="floating-element">🏃</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;