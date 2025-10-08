// server.js
const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Placeholder route
app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const { readDb, writeDb } = require('./db');

// Get a single session by ID
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const db = await readDb();
    const session = db.sessions.find(s => s._id === req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a session by ID
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const db = await readDb();
    const initialLength = db.sessions.length;
    db.sessions = db.sessions.filter(s => s._id !== req.params.id);
    if (db.sessions.length === initialLength) return res.status(404).json({ error: 'Session not found' });
    await writeDb(db);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a session (e.g., add votes/results)
app.put('/api/sessions/:id', async (req, res) => {
  try {
    const db = await readDb();
    const sessionIndex = db.sessions.findIndex(s => s._id === req.params.id);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });
    const updatedSession = { ...db.sessions[sessionIndex], ...req.body };
    db.sessions[sessionIndex] = updatedSession;
    await writeDb(db);
    res.json(updatedSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new session
app.post('/api/sessions', async (req, res) => {
  try {
    const db = await readDb();
    const newSession = { ...req.body, _id: Date.now().toString() };
    db.sessions.push(newSession);
    await writeDb(db);
    res.status(201).json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});