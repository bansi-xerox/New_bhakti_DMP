import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { activateResetLink, resetPassword } from '../../services/api';
import CountdownTimer from '../../components/CountdownTimer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToastAlert, showErrorAlert } from '../../components/common/Alert';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isValidToken, setIsValidToken] = useState(null);
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    activateResetLink(token)
      .then((res) => {
        setIsValidToken(true);
        if (res.data.remaining_seconds) {
          setRemainingSeconds(res.data.remaining_seconds);
        }
      })
      .catch((err) => {
        console.error('Activation Error:', err);
        setIsValidToken(false);
      });
  }, [token]);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm_password) {
      showErrorAlert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, {
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password,
      });

      await showToastAlert('Password Reset Successful');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update password.';
      showErrorAlert('Reset Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="auth-wrapper">
        <div className="btn-spinner" style={{ width: 36, height: 36, borderColor: '#e65100', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (isValidToken === false || isExpired) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card-modern" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#c62828', marginTop: 0 }}>Reset Link Expired</h3>
          <p style={{ color: '#8d6e63', fontSize: 14 }}>This password recovery session is invalid or has expired.</p>
          <Button onClick={() => navigate('/forgot-password')}>
            Request New Link
          </Button>
        </div>
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
          <h2 className="auth-header-title">Create New Password</h2>
          <div className="header-accent-divider" />
          <p className="auth-header-desc">
            Please enter and confirm your updated security credentials.
          </p>
        </div>

        {isValidToken && (
          <CountdownTimer
            initialMinutes={Math.ceil(remainingSeconds / 60)}
            onExpire={() => setIsExpired(true)}
          />
        )}

        <form onSubmit={handleSubmit}>
          {/* Reusable New Password Input */}
          <Input
            label="New Password"
            type={showPass ? 'text' : 'password'}
            name="new_password"
            value={passwords.new_password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {/* Reusable Confirm Password Input */}
          <Input
            label="Confirm New Password"
            type={showPass ? 'text' : 'password'}
            name="confirm_password"
            value={passwords.confirm_password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            leftIcon={<Lock size={18} />}
          />

          {/* Reusable Submit Button */}
          <Button
            type="submit"
            loading={loading}
            icon={<KeyRound size={16} />}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;