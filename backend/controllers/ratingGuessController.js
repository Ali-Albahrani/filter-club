const Session = require('../models/Session');
const Event = require('../models/Event');

// @desc    Submit rating
// @route   POST /api/sessions/:sessionId/ratings
// @access  Private
const submitRating = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { coffeeId, score } = req.body;
    
    // Validate input: require integer score per spec
    if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 10) {
      return res.status(400).json({ 
        error: 'ValidationError', 
        details: 'Score must be an integer between 1 and 10' 
      });
    }
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user owns this session.
    // Support both authenticated sessions and (optional) anonymous sessions tied to email.
    if (session.userId) {
      if (session.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to rate for this session' });
      }
    } else {
      // No userId on session -> check email matches authenticated user's email
      if (!req.user || req.user.email !== session.email) {
        return res.status(403).json({ error: 'Not authorized to rate for this session' });
      }
    }
    
    // Check if rating for this coffee already exists
    const existingRatingIndex = session.ratings.findIndex(rating => 
      rating.coffeeId.toString() === coffeeId
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      session.ratings[existingRatingIndex].score = score;
      session.ratings[existingRatingIndex].submittedAt = new Date();
    } else {
      // Add new rating
      session.ratings.push({ coffeeId, score });
    }
    
    await session.save();
    
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Submit guess
// @route   POST /api/sessions/:sessionId/guesses
// @access  Private
const submitGuess = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { coffeeId, guessedOriginCountry, guessedProcess } = req.body;
    
    // Validate process
    const validProcesses = ['washed', 'honey', 'natural', 'experimental'];
    if (!validProcesses.includes(guessedProcess)) {
      return res.status(400).json({ 
        error: 'ValidationError', 
        details: 'guessedProcess must be one of: washed, honey, natural, experimental' 
      });
    }
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check ownership similar to ratings
    if (session.userId) {
      if (session.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to guess for this session' });
      }
    } else {
      if (!req.user || req.user.email !== session.email) {
        return res.status(403).json({ error: 'Not authorized to guess for this session' });
      }
    }
    
    // Check if guess for this coffee already exists
    const existingGuessIndex = session.guesses.findIndex(guess => 
      guess.coffeeId.toString() === coffeeId
    );
    
    if (existingGuessIndex !== -1) {
      // Update existing guess
      session.guesses[existingGuessIndex].guessedOriginCountry = guessedOriginCountry;
      session.guesses[existingGuessIndex].guessedProcess = guessedProcess;
      session.guesses[existingGuessIndex].createdAt = new Date();
    } else {
      // Add new guess
      session.guesses.push({ 
        coffeeId, 
        guessedOriginCountry, 
        guessedProcess 
      });
    }
    
    await session.save();
    
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get results (masked until published)
// @route   GET /api/events/:eventId/results
// @access  Private (event participants and organizer)
const getResults = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is participant or organizer
    const session = await Session.findOne({
      userId: req.user.id,
      eventId: eventId
    });
    
    if (!session && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view results' });
    }
    
    // For participants, include their own ratings and guesses
    let participantData = null;
    if (session) {
      participantData = {
        userId: session.userId._id,
        ratings: session.ratings.map(rating => ({
          coffeeId: rating.coffeeId,
          score: rating.score,
          submittedAt: rating.submittedAt
        })),
        guesses: session.guesses.map(guess => ({
          coffeeId: guess.coffeeId,
          guessedOriginCountry: guess.guessedOriginCountry,
          guessedProcess: guess.guessedProcess
        })),
        points: session.points
      };
    }
    
    // Return event coffees with appropriate masking based on publish status
    res.json({
      eventId: event._id,
      eventName: event.name,
      published: event.published,
      participant: participantData,
      coffees: event.coffees.map(coffee => {
        const coffeeObj = {
          id: coffee._id,
          label: coffee.label,
          // Before publishing, hide sensitive details
          name: event.published ? coffee.name : `[Coffee ${coffee.label}]`,
          roaster: event.published ? coffee.roaster : '[Roaster hidden until results published]',
          originCountry: event.published ? coffee.originCountry : '[Origin hidden until results published]',
          process: event.published ? coffee.process : '[Process hidden until results published]'
        };
        
        // If published, include additional computed data
        if (event.published) {
          // In a full implementation, you would calculate average scores, etc.
        }
        
        return coffeeObj;
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Publish event results (calculate points, etc.)
// @route   POST /api/events/:eventId/publish
// @access  Private (organizer only)
const publishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to publish this event' });
    }
    
    // Get all sessions for this event
    const sessions = await Session.find({ eventId: eventId }).populate('userId');
    
    // Calculate points for each session and update leaderboards
    // Also calculate average scores for each coffee
    const coffeeStats = {}; // To store stats for each coffee
    
    for (const coffee of event.coffees) {
      coffeeStats[coffee._id.toString()] = {
        totalScore: 0,
        count: 0,
        average: 0
      };
    }
    
    // First pass: Calculate points and coffee stats
    for (const session of sessions) {
      let totalPoints = 0;
      let detailedResults = new Map(); // Store detailed results for this session
      
      // Create detailed results for each coffee in the event
      for (const coffee of event.coffees) {
        // Find the user's rating for this coffee
        const rating = session.ratings.find(r => 
          r.coffeeId.toString() === coffee._id.toString()
        );
        
        // Find the user's guess for this coffee
        const guess = session.guesses.find(g => 
          g.coffeeId.toString() === coffee._id.toString()
        );
        
        // Initialize result object for this coffee
        const result = {
          coffeeId: coffee._id,
          label: coffee.label,
          name: event.published ? coffee.name : '[Coffee name hidden until results published]',
          roaster: event.published ? coffee.roaster : '[Roaster hidden until results published]',
          originCountry: event.published ? coffee.originCountry : '[Origin hidden until results published]',
          process: event.published ? coffee.process : '[Process hidden until results published]',
          userRating: rating ? rating.score : null,
          userGuessOrigin: guess ? guess.guessedOriginCountry : null,
          userGuessProcess: guess ? guess.guessedProcess : null,
          isOriginCorrect: false,
          isProcessCorrect: false,
          pointsEarned: 0
        };
        
        // Calculate points if both rating and guess exist
        if (rating && guess) {
          // Award points for correct guesses
          if (guess.guessedOriginCountry === coffee.originCountry) {
            result.isOriginCorrect = true;
            result.pointsEarned += 1; // 1 point for correct origin guess
            totalPoints += 1;
          }
          if (guess.guessedProcess === coffee.process) {
            result.isProcessCorrect = true;
            result.pointsEarned += 1; // 1 point for correct process guess
            totalPoints += 1;
          }
        }
        
        detailedResults.set(coffee._id.toString(), result);
        
        // Add to coffee stats for average calculation (only if there's a rating)
        if (rating) {
          coffeeStats[coffee._id.toString()].totalScore += rating.score;
          coffeeStats[coffee._id.toString()].count += 1;
        }
      }
      
      // Update the session with calculated points and detailed results
      session.points = totalPoints;
      session.results = {
        published: true,
        detailedResults: detailedResults,
        totalPossiblePoints: event.coffees.length * 2 // 2 points possible per coffee (origin + process)
      };
      await session.save();
      
      // Update the user's leaderboard entry
      if (session.userId) { // Only update leaderboard if user is registered (not anonymous)
        const Leaderboard = require('../models/Leaderboard');
        
        let leaderboardEntry = await Leaderboard.findOne({ userId: session.userId });
        if (leaderboardEntry) {
          // Update existing entry
          leaderboardEntry.totalPoints += totalPoints;
          // In a full implementation, monthly points would be updated based on the event date
          leaderboardEntry.monthlyPoints += totalPoints;
          leaderboardEntry.lastUpdated = new Date();
          await leaderboardEntry.save();
        } else {
          // Create new entry
          leaderboardEntry = new Leaderboard({
            userId: session.userId,
            totalPoints: totalPoints,
            monthlyPoints: totalPoints,
            lastUpdated: new Date()
          });
          await leaderboardEntry.save();
        }
      }
    }
    
    // Calculate averages for each coffee
    for (const coffeeId in coffeeStats) {
      if (coffeeStats[coffeeId].count > 0) {
        coffeeStats[coffeeId].average = coffeeStats[coffeeId].totalScore / coffeeStats[coffeeId].count;
      }
    }
    
    // Add coffee stats to the event for future reference
    event.coffeeStats = coffeeStats;
    await event.save();
    
    // Now calculate ranks within the event (optional enhancement)
    // Sort sessions by points to determine rank
    const sortedSessions = [...sessions].sort((a, b) => b.points - a.points);
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      session.results.rankInEvent = i + 1;
      await session.save();
    }
    
    // Update event to mark as published so results are unmasked and downstream jobs can run
    event.published = true;
    await event.save();

    // TODO: enqueue background jobs to generate spreadsheets and email results
    
    res.json({ 
      message: 'Event results published successfully', 
      calculatedFor: sessions.length + ' sessions',
      totalPointsAwarded: sessions.reduce((sum, session) => sum + session.points, 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitRating,
  submitGuess,
  getResults,
  publishEvent
};