import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styling/AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '', // Can be email or username
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email or Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { 
        email: formData.email, 
        password: formData.password ? '***' : 'MISSING' 
      });
      console.log('Full form data:', formData);
      
      const response = await fetch('http://10.128.2.113:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Server response:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('Login successful:', data.data.user);
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data.error);
        setErrors({ submit: data.error || 'Invalid email/username or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container login-width">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        
        <div className="auth-card login-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🏆</span>
              <span className="logo-text">Westfields International School</span>
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to access your sports dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address or Username</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@westfields.edu or username"
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                Remember me for 30 days
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In to Your Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              New to Westfields Sports?{' '}
              <Link to="/register" className="auth-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;