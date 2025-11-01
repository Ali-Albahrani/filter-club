const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  coffeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event.coffees',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const guessSchema = new mongoose.Schema({
  coffeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event.coffees',
    required: true
  },
  guessedOriginCountry: {
    type: String,
    required: true,
    trim: true
  },
  guessedProcess: {
    type: String,
    enum: ['washed', 'honey', 'natural', 'experimental'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  email: {
    type: String,
    required: function() {
      return !this.userId; // required if user is anonymous
    },
    trim: true,
    lowercase: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  ratings: [ratingSchema],
  guesses: [guessSchema],
  points: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Session', sessionSchema);