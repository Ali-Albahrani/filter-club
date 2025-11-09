// guestAuth.js - Middleware for guest session access

const Session = require('../models/Session');

// Middleware to allow guest access to their own sessions
const guestAuth = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { email } = req.body || req.query || req.headers; // Email can come from different sources
    

    
    // Try to find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // If the session has a userId, it belongs to a registered user and should use the auth middleware
    if (session.userId) {
      return res.status(401).json({ error: 'Registered user sessions require authentication' });
    }
    

    
    // Compare provided email (in lowercase) with session email
    if (session.email !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Not authorized to access this guest session' });
    }
    
    // Add session and email to request for use in controllers
    req.sessionData = session;
    req.guestEmail = email.toLowerCase();
    req.isGuest = true;
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = guestAuth;