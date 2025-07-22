const mongoose = require('mongoose');

const CoffeeSchema = new mongoose.Schema({
  name: String,
  roaster: String,
  country: String,
  varietals: String,
  processingMethod: String,
});

const VoteSchema = new mongoose.Schema({
  member: String,
  rankings: [String], // Array of coffee names in order
  timestamp: String,
});

const ResultSchema = new mongoose.Schema({
  name: String,
  roaster: String,
  country: String,
  varietals: String,
  processingMethod: String,
  score: Number,
});

const SessionSchema = new mongoose.Schema({
  name: String,
  date: String,
  coffees: [CoffeeSchema],
  members: [String],
  votes: [VoteSchema],
  results: [ResultSchema],
  completed: Boolean,
});

module.exports = mongoose.model('Session', SessionSchema);