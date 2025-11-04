// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models to ensure they're registered
require('./models/User');
require('./models/Event');
require('./models/Session');
require('./models/Leaderboard');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Placeholder route
app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Import the models for API endpoints
const Session = require('./models/Session');
const User = require('./models/User');
const Event = require('./models/Event');
const Leaderboard = require('./models/Leaderboard');

// Import controllers
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  logoutUser
} = require('./controllers/authController');

const { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('./controllers/eventController');

const { 
  addCoffee, 
  getCoffees, 
  updateCoffee, 
  removeCoffee 
} = require('./controllers/coffeeController');

const {
  joinEvent,
  getSession
} = require('./controllers/sessionController');

const {
  submitRating,
  submitGuess,
  getResults,
  publishEvent
} = require('./controllers/ratingGuessController');

const {
  getLeaderboard,
  getUserPoints
} = require('./controllers/leaderboardController');

// Import middleware
const auth = require('./middleware/auth');
const roleAuth = require('./middleware/roleAuth');
const { validateEvent, validateRating, validateGuess } = require('./middleware/validation');

// User API endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Event API endpoints
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().populate('organizerId', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Leaderboard API endpoints
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('userId', 'name email')
      .sort({ totalPoints: -1 });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authentication routes
app.post('/api/auth/signup', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/logout', auth, logoutUser);
app.post('/api/auth/profile', auth, getUserProfile);

// Event routes
app.get('/api/events', getEvents);
app.get('/api/events/:id', getEvent);
app.post('/api/events', auth, validateEvent, createEvent);
app.patch('/api/events/:id', auth, updateEvent);
app.delete('/api/events/:id', auth, deleteEvent);

// Coffee routes
app.post('/api/events/:eventId/coffees', auth, addCoffee);
app.get('/api/events/:eventId/coffees', getCoffees);
app.patch('/api/events/:eventId/coffees/:coffeeId', auth, updateCoffee);
app.delete('/api/events/:eventId/coffees/:coffeeId', auth, removeCoffee);

// Session routes
app.post('/api/events/:eventId/sessions', auth, joinEvent);
app.get('/api/events/:eventId/sessions/:sessionId', auth, getSession);

// Rating and Guess routes
app.post('/api/sessions/:sessionId/ratings', auth, validateRating, submitRating);
app.post('/api/sessions/:sessionId/guesses', auth, validateGuess, submitGuess);
app.get('/api/events/:eventId/results', auth, getResults);
app.post('/api/events/:eventId/publish', auth, publishEvent);

// Leaderboard routes
app.get('/api/leaderboard', getLeaderboard);
app.get('/api/users/:userId/points', getUserPoints);

// Get a single session by ID
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('eventId', 'name startTs endTs location');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a session by ID
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a session (e.g., add ratings/guesses)
app.put('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('userId', 'name email')
      .populate('eventId', 'name startTs endTs location');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new session
app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session(req.body);
    const savedSession = await session.save();
    res.status(201).json(savedSession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});