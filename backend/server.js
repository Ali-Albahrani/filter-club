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
  getSession,
  getSessionResults
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

// Import services
const {
  generateMainResultsSpreadsheet,
  generateIndividualResultsSpreadsheet
} = require('./services/spreadsheetService');

const {
  generateEventResultsPDF,
  generateIndividualResultsPDF
} = require('./services/pdfService');


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
app.get('/api/sessions/:id/results', auth, getSessionResults);

// Rating and Guess routes
app.post('/api/sessions/:sessionId/ratings', auth, validateRating, submitRating);
app.post('/api/sessions/:sessionId/guesses', auth, validateGuess, submitGuess);
app.get('/api/events/:eventId/results', auth, getResults);
app.post('/api/events/:eventId/publish', auth, publishEvent);

// Leaderboard routes
app.get('/api/leaderboard', getLeaderboard);
app.get('/api/users/:userId/points', getUserPoints);

// Document generation routes (PDF/Spreadsheet)
// Event results (organizer only)
app.get('/api/events/:eventId/results/spreadsheet', auth, async (req, res) => {
  try {
    // Verify user is the organizer of this event
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access these results' });
    }
    
    const { filename, buffer } = await generateMainResultsSpreadsheet(req.params.eventId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:eventId/results/pdf', auth, async (req, res) => {
  try {
    // Verify user is the organizer of this event
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access these results' });
    }
    
    const { filename, buffer } = await generateEventResultsPDF(req.params.eventId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Individual results (user or organizer only)
app.get('/api/sessions/:sessionId/results/spreadsheet', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate('eventId', 'published organizerId');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is session owner or event organizer
    if (session.userId) {
      if (session.userId.toString() !== req.user.id && 
          session.eventId.organizerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to download these results' });
      }
    } else {
      if (session.eventId.organizerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to download these results' });
      }
    }
    
    // Check if event is published
    if (!session.eventId.published) {
      return res.status(400).json({ error: 'Results not available until event is published' });
    }
    
    const { filename, buffer } = await generateIndividualResultsSpreadsheet(req.params.sessionId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:sessionId/results/pdf', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate('eventId', 'published organizerId');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is session owner or event organizer
    if (session.userId) {
      if (session.userId.toString() !== req.user.id && 
          session.eventId.organizerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to download these results' });
      }
    } else {
      if (session.eventId.organizerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to download these results' });
      }
    }
    
    // Check if event is published
    if (!session.eventId.published) {
      return res.status(400).json({ error: 'Results not available until event is published' });
    }
    
    const { filename, buffer } = await generateIndividualResultsPDF(req.params.sessionId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));