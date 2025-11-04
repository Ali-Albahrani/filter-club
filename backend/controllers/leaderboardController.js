const Leaderboard = require('../models/Leaderboard');
const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { period = 'alltime' } = req.query;
    
    let leaderboard;
    
    if (period === 'monthly') {
      // For monthly leaderboard, we would need to implement logic to calculate 
      // points for the current month. This is a simplified version.
      leaderboard = await Leaderboard.find()
        .populate('userId', 'name email')
        .sort({ monthlyPoints: -1 });
    } else {
      // All-time leaderboard
      leaderboard = await Leaderboard.find()
        .populate('userId', 'name email')
        .sort({ totalPoints: -1 });
    }
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user points
// @route   GET /api/users/:userId/points
// @access  Public (or Private if checking own points)
const getUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find user's total points from sessions
    const sessions = await Session.find({ userId: userId });
    const totalPoints = sessions.reduce((sum, session) => sum + (session.points || 0), 0);
    
    // For now, we're calculating points directly from sessions
    // In a full implementation, you'd want to maintain these in the Leaderboard model
    
    res.json({
      userId: user._id,
      name: user.name,
      totalPoints: totalPoints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getUserPoints
};