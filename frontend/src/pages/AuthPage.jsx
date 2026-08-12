import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { checkAuthStatus, registerUser, loginUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AuthPage = () => {
  const [isRegistered, setIsRegistered] = useState(true);
  const [formData, setFormData] = useState({ email_address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if system has a registered user
    checkAuthStatus()
      .then((res) => {
        setIsRegistered(res.data.hasRegisteredUser);
      })
      .catch((err) => {
        console.error('Status Check Error:', err);
        setIsRegistered(true); // Fallback to login form on error
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!isRegistered) {
        // Register First User/Admin
        const res = await registerUser(formData);
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        // Login Flow
        const res = await loginUser(formData);
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  if (loading) {
    return <div className="auth-container">Loading...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2> Bhajan Kirtan Portal</h2>
          <p>{isRegistered ? 'Login to System' : 'First Admin Setup'}</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email_address"
              className="form-control"
              value={formData.email_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            {isRegistered ? 'Login' : 'Register Admin'}
          </button>
        </form>

        {isRegistered && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link to="/forgot-password" style={{ color: '#e65100', textDecoration: 'none', fontSize: '14px' }}>
              Forgot Password?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;