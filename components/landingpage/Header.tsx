import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/login');
  };

  const handleJoinHere = () => {
    navigate('/register');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">🏆</span>
          <span className="logo-text">Westfields International School</span>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <a href="#home">Home</a>
          <a href="#sports">Sports</a>
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleSignUp}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={handleJoinHere}>
            Join Here
          </button>
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          padding: 0 20px;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: bold;
          color: #2563eb;
          flex-shrink: 0;
        }

        .logo-icon {
          font-size: 1.8rem;
        }

        .logo-text {
          white-space: nowrap;
        }

        .nav {
          display: flex;
          gap: 2rem;
          margin: 0 auto;
        }

        .nav a {
          text-decoration: none;
          color: #4b5563;
          font-weight: 500;
          transition: color 0.3s;
          white-space: nowrap;
        }

        .nav a:hover {
          color: #2563eb;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-shrink: 0;
        }

        .btn {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #2563eb;
          color: #2563eb;
        }

        .btn-outline:hover {
          background: #2563eb;
          color: white;
        }

        .menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          gap: 4px;
        }

        .menu-toggle span {
          width: 25px;
          height: 3px;
          background: #333;
          transition: 0.3s;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .logo-text {
            font-size: 1.1rem;
          }
          
          .nav {
            gap: 1.5rem;
          }
          
          .nav a {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: flex;
          }

          .nav {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s;
            gap: 1rem;
          }

          .nav-open {
            transform: translateY(0);
            opacity: 1;
          }

          .header-actions .btn {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 1rem;
          }
          
          .header-container {
            padding: 0.8rem 0;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;