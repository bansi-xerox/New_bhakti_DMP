import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activateResetLink, resetPassword } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isValidToken, setIsValidToken] = useState(null);
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300);

  useEffect(() => {
    // Activates the reset link (converts validity to 5 mins on backend)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.new_password !== passwords.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword(token, {
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password,
      });
      alert('Password updated successfully! Please log in with your new password.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  if (isValidToken === null) {
    return <div className="auth-container">Activating reset link...</div>;
  }

  if (isValidToken === false || isExpired) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#c62828' }}>Reset Link Invalid or Expired</h3>
          <p>This reset link has expired or is invalid.</p>
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

        {isValidToken && (
          <CountdownTimer
            initialMinutes={Math.ceil(remainingSeconds / 60)}
            onExpire={() => setIsExpired(true)}
          />
        )}

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={passwords.confirm_password}
              onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;