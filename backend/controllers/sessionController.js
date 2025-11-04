const Session = require('../models/Session');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Join event (create session)
// @route   POST /api/events/:eventId/sessions
// @access  Private
const joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is still active (hasn't ended yet)
    if (new Date() > event.endTs) {
      return res.status(400).json({ error: 'Cannot join event that has already ended' });
    }
    
    // Check if user has already joined this event
    const existingSession = await Session.findOne({
      userId: req.user.id,
      eventId: eventId
    });
    
    if (existingSession) {
      return res.status(400).json({ error: 'User already joined this event' });
    }
    
    // Create a new session
    const session = new Session({
      userId: req.user.id,
      eventId: eventId,
      joinedAt: new Date()
    });
    
    const createdSession = await session.save();
    
    res.status(201).json(createdSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get session details
// @route   GET /api/events/:eventId/sessions/:sessionId
// @access  Private (session owner or organizer)
const getSession = async (req, res) => {
  try {
    const { eventId, sessionId } = req.params;
    
    // Check if session exists and belongs to this event
    const session = await Session.findById(sessionId)
      .populate('userId', 'name email')
      .populate('eventId', 'name startTs endTs location');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if this event matches
    if (session.eventId._id.toString() !== eventId) {
      return res.status(400).json({ error: 'Session does not belong to this event' });
    }
    
    // Check if user is session owner or event organizer
    // Handle both registered users and anonymous sessions
    let isAuthorized = false;
    if (session.userId) {
      // This session belongs to a registered user
      isAuthorized = session.userId._id.toString() === req.user.id || 
                    session.eventId.organizerId.toString() === req.user.id;
    } else {
      // This is an anonymous session - check if requesting user matches the session email
      isAuthorized = session.eventId.organizerId.toString() === req.user.id; // Only organizer can access anonymous sessions
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to view this session' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  joinEvent,
  getSession
};