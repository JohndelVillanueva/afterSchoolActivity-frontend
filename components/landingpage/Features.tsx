import React from 'react';

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2>Why Choose Sportify?</h2>
          <p>Comprehensive tools and features for every athlete</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your performance with detailed analytics and progress reports</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community</h3>
            <p>Connect with fellow athletes, join teams, and participate in events</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏅</div>
            <h3>Expert Coaching</h3>
            <p>Get personalized training plans from certified sports coaches</p>
          </div>
          
          {/* <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile App</h3>
            <p>Access all features on the go with our dedicated mobile application</p>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Features;