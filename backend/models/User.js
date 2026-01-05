const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  hobbies: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // This automatically manages createdAt and updatedAt
  timestamps: true,
});

// No need for pre-save middleware with timestamps option

module.exports = mongoose.model('User', userSchema);