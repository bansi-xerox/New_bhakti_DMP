import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { checkAuthStatus, registerUser, loginUser } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToastAlert, showErrorAlert } from '../../components/common/Alert';

const AuthPage = () => {
  const [isRegistered, setIsRegistered] = useState(true);
  const [formData, setFormData] = useState({ email_address: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus()
      .then((res) => {
        setIsRegistered(res.data.hasRegisteredUser);
      })
      .catch((err) => {
        console.error('Status Check Error:', err);
        setIsRegistered(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!isRegistered) {
        await registerUser(formData);
        await showToastAlert('Registration Successful');
        setIsRegistered(true);
        setFormData({ email_address: '', password: '' });
      } else {
        const res = await loginUser(formData);
        await showToastAlert('Login Successful');
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      showErrorAlert('Authentication Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="btn-spinner" style={{ width: 36, height: 36, borderColor: '#e65100', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card-modern">
        {/* Unique Devotional Header */}
        <div className="auth-header-modern">
          <div className="header-emblem-wrapper">
          </div>
          <h2 className="auth-header-title">Bhajan Kirtan Portal</h2>
          <div className="header-accent-divider" />
          <p className="auth-header-desc">
            {isRegistered
              ? 'Enter your credentials to access the admin portal'
              : 'Configure your primary master administrator account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Reusable Email Input */}
          <Input
            label="Email Address"
            type="email"
            name="email_address"
            value={formData.email_address}
            onChange={handleChange}
            placeholder="admin@devam.com"
            required
            leftIcon={<Mail size={18} />}
          />

          {/* Reusable Password Input */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {/* Forgot Password Link */}
          {isRegistered && (
            <div className="auth-extra-actions">
              <Link to="/forgot-password" className="link-forgot">
                Forgot password?
              </Link>
            </div>
          )}

          {/* Reusable Submit Button */}
          <Button
            type="submit"
            loading={isSubmitting}
            icon={<ArrowRight size={18} />}
          >
            {isRegistered ? 'Sign In to Portal' : 'Create Admin Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;