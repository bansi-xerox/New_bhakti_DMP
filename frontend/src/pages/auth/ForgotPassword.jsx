import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { forgotPassword } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToastAlert, showErrorAlert } from '../../components/common/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      await showToastAlert(res.data.message || 'Reset link sent to your email');
      setEmail('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Email address not found in system.';
      showErrorAlert('Request Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-modern">
        {/* Unique Devotional Header */}
        <div className="auth-header-modern">
          <div className="header-emblem-wrapper">
          </div>
          <h2 className="auth-header-title">Forgot Password</h2>
          <div className="header-accent-divider" />
          <p className="auth-header-desc">
            Provide your registered email address to receive a secure password recovery link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Reusable Email Input */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@devam.com"
            required
            leftIcon={<Mail size={18} />}
          />

          {/* Reusable Submit Button */}
          <Button
            type="submit"
            loading={loading}
            icon={<Send size={16} />}
          >
            Send Reset Link
          </Button>
        </form>

        <div className="auth-card-footer">
          <Link to="/" className="link-forgot" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;