const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  roaster: {
    type: String,
    required: true,
    trim: true
  },
  originCountry: {
    type: String,
    required: true,
    trim: true
  },
  process: {
    type: String,
    enum: ['washed', 'honey', 'natural', 'experimental'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startTs: {
    type: Date,
    required: true
  },
  endTs: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coffees: [coffeeSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
  ,
  // Whether results have been published (controls masking and downstream jobs)
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ organizerId: 1 });
// Note: Coffee label uniqueness is enforced at the application level per event

module.exports = mongoose.model('Event', eventSchema);