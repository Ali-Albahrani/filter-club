const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  coffeeId: {
    type: mongoose.Schema.Types.ObjectId,
    // references a coffee subdocument id inside an Event; avoid incorrect ref strings
    // we keep it as ObjectId and validate existence at the application layer
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
    // see note above about validating coffee existence at app layer
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
    // allow anonymous sessions (use email) so not required
    required: false
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
  // Detailed results after event publication
  results: {
    published: {
      type: Boolean,
      default: false
    },
    detailedResults: {
      type: Map,
      of: {
        coffeeId: mongoose.Schema.Types.ObjectId,
        label: String,
        name: String,
        roaster: String,
        originCountry: String,  // Only visible after publishing
        process: String,        // Only visible after publishing
        userRating: Number,
        userGuessOrigin: String,
        userGuessProcess: String,
        isOriginCorrect: Boolean,
        isProcessCorrect: Boolean,
        pointsEarned: Number
      }
    },
    totalPossiblePoints: Number,
    rankInEvent: Number
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
// Unique per (eventId, userId) when userId exists
sessionSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);
// Unique per (eventId, email) for anonymous participants
sessionSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

module.exports = mongoose.model('Session', sessionSchema);