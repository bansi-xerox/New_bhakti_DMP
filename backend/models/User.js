const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email_address: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(
            value
          );
        },
        message:
          'Password must contain uppercase, lowercase, number and special character.',
      },
    },
    reset_token: {
      type: String,
      default: null,
    },
    reset_expiry_at: {
      type: Date,
      default: null,
    },
    password_updated_at: {
      type: Date,
      default: null,
    },
       created_at: {
      type: Date,
      default: Date.now,
    },

    updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  // If the password hasn't been modified, just exit the function
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);