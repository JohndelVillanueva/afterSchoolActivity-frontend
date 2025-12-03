import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styling/AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.fname.trim()) {
      newErrors.fname = 'First name is required';
    }

    if (!formData.lname.trim()) {
      newErrors.lname = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const studentId = `WF${year}${random}`;

      const studentData = {
        ...formData,
        type: 'student',
        isactive: 1,
        status: 1,
        level: 3,
        uniqid: studentId,
        username: formData.email.split('@')[0],
        grade: 'Not Assigned',
        section: 'Not Assigned',
        sy: `${year}-${year + 1}`,
        isEnrolledInAfterSchool: false
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/registration-success', { 
          state: { 
            studentId: data.uniqid,
            studentName: `${formData.fname} ${formData.lname}`
          } 
        });
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="square-auth-page">
      <div className="square-auth-container">
        <div className="square-auth-card">
          <div className="square-auth-header">
            <div className="square-logo">
              <span className="logo-icon">🏆</span>
              <span className="logo-text">Westfields International School</span>
            </div>
            <h2>Create Student Account</h2>
            <p>Join our sports community</p>
          </div>

          <form onSubmit={handleSubmit} className="square-auth-form">
            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}

            <div className="square-form-row">
              <div className="square-form-group">
                <label htmlFor="fname">First Name *</label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  placeholder="First name"
                  className={errors.fname ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.fname && <span className="error-text">{errors.fname}</span>}
              </div>

              <div className="square-form-group">
                <label htmlFor="lname">Last Name *</label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={errors.lname ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.lname && <span className="error-text">{errors.lname}</span>}
              </div>
            </div>

            <div className="square-form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@westfields.edu"
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="square-form-group">
              <label htmlFor="password">Password *</label>
              <div className="square-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
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

            <div className="square-form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="square-password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className={`square-btn square-btn-primary square-btn-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="square-auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="square-auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;