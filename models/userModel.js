const crypto = require('crypto');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    unique: true,
    maxlength: [255, 'Name must have less than 255 characters'],
    minlength: [10, 'Name must have more than 10 characters'],
  },
  slug: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'], //remove 'admin for production or add role in mongo
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'You must provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAT: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// DOCUMENT MIDDLEWARE pre / post
// Only runs on Save and Create
userSchema.pre('save', async function (next) {
  // console.log('fired');
  if (!this.isModified('password') || !this.isNew) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // console.log(this.password);
  this.passwordChangedAT = Date.now() - 5000; // prevents the token from setting before the change
  this.passwordConfirm = undefined;

  this.slug = slugify(this.name, { lower: true });
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAT) {
    const changedTimestamp = parseInt(
      this.passwordChangedAT.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // False meansn not changes
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
