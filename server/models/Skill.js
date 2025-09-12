const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Arts', 'Music', 'Sports', 'Cooking', 'Languages', 'Business', 'Other']
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    type: String, // e.g., "30 minutes", "1 hour", "2 hours"

  },
  mode: {
    type: String,
    enum: ['Online', 'In-person', 'Both'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isOffered: {
    type: Boolean,
    default: true // true for offered, false for wanted
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

skillSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Skill', skillSchema);