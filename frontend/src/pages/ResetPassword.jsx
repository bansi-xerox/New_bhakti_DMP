import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateResetToken, resetPassword } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isValidToken, setIsValidToken] = useState(null);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Trigger link activation (converts token validity to 5 mins on backend)
    validateResetToken(token)
      .then(() => setIsValidToken(true))
      .catch(() => setIsValidToken(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, password: passwords.newPassword });
      alert('Password updated successfully! Please login with your new password.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  if (isValidToken === false || isExpired) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#c62828' }}>Reset Link Invalid or Expired</h3>
          <p>This reset link has expired or the link is invalid.</p>
          <button className="btn-primary" onClick={() => navigate('/forgot-password')}>
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Set New Password</h2>
        </div>

        {isValidToken && <CountdownTimer initialMinutes={5} onExpire={() => setIsExpired(true)} />}

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;