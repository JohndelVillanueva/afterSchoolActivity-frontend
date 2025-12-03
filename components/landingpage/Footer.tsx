import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <span className="logo-icon">🏆</span>
              <span className="logo-text">WIS</span>
            </div>
            <p>Empowering athletes to reach their full potential through technology and community.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#sports">Sports</a>
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@westfields.edu.ph</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: 123 Sports Ave, Athletic City</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Westfields International School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;