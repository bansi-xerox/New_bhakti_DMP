const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

// Check if registration or login should be displayed on the frontend
exports.getAuthStatus = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    return res.status(200).json({
      success: true,
      hasRegisteredUser: userCount > 0, // true = show Login; false = show Registration
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// First user registration logic
exports.registerUser = async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Registration is closed. A user account already exists.',
      });
    }

    const { email_address, password } = req.body;

    if (!email_address || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
      });
    }

    const user = await User.create({
      email_address,
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email_address: user.email_address,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Login user logic
exports.loginUser = async (req, res) => {
  try {
    const { email_address, password } = req.body;

    if (!email_address || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email_address });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user._id, email_address: user.email_address },
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email address or password' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password -> Generates dynamic 32-byte token with 24-hour expiry
exports.forgotPassword = async (req, res) => {
  try {
    const { email_address } = req.body;

    const user = await User.findOne({ email_address });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email address not found' });
    }

    // Dynamic 32-byte reset token
    const resetTokenRaw = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');

    // 24 Hours initial validity
    user.reset_token = hashedToken;
    user.reset_expiry_at = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetTokenRaw}`;
    const message = `You requested a password reset. Click the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 24 hours until activated.`;

    try {
      await sendEmail({
        email: user.email_address,
        subject: 'Password Reset Request',
        message,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email address',
      });
    } catch (err) {
      user.reset_token = null;
      user.reset_expiry_at = null;
      await user.save();

      return res.status(500).json({ success: false, message: 'Failed to send reset email' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Link Activation -> Validates token and converts expiry period to 5 minutes
exports.activateResetLink = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      reset_token: hashedToken,
      reset_expiry_at: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    // Change expiry window to 5 minutes from activation time
    const fiveMinutesInMs = 5 * 60 * 1000;
    user.reset_expiry_at = new Date(Date.now() + fiveMinutesInMs);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Reset link activated. You have 5 minutes to complete the password update.',
      expiry_at: user.reset_expiry_at,
      remaining_seconds: Math.floor(fiveMinutesInMs / 1000),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Perform Password Reset
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { new_password, confirm_password } = req.body;

    if (!new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both new password and confirm password',
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      reset_token: hashedToken,
      reset_expiry_at: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid reset token or the 5-minute countdown period has expired',
      });
    }

    user.password = new_password;
    user.password_updated_at = new Date();

    user.reset_token = null;
    user.reset_expiry_at = null;

    await user.save();

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          updated_at: null,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};