const XLSX = require('xlsx');
const Event = require('../models/Event');
const Session = require('../models/Session');

// Generate the main results spreadsheet
const generateMainResultsSpreadsheet = async (eventId) => {
  try {
    // Get event with coffee stats
    const event = await Event.findById(eventId).populate('organizerId', 'name email');
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.published) {
      throw new Error('Event results have not been published yet');
    }

    // Get all sessions for the event with user details
    const sessions = await Session.find({ eventId: eventId })
      .populate('userId', 'name email');

    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Create the main results sheet
    const mainSheetData = [
      ['Coffee Label', 'Average Score', 'Actual Origin', 'Actual Process', 'User Guess (Origin)', 'User Guess (Process)', 'Rating Score']
    ];

    // Populate data for each coffee
    for (const coffee of event.coffees) {
      const coffeeStat = event.coffeeStats && event.coffeeStats[coffee._id.toString()] || { average: 0, count: 0 };
      
      // For each coffee, get all user ratings and guesses
      for (const session of sessions) {
        const rating = session.ratings.find(r => r.coffeeId.toString() === coffee._id.toString());
        const guess = session.guesses.find(g => g.coffeeId.toString() === coffee._id.toString());
        
        mainSheetData.push([
          coffee.label,
          coffeeStat.average || 0,
          coffee.originCountry,
          coffee.process,
          guess ? guess.guessedOriginCountry : '',
          guess ? guess.guessedProcess : '',
          rating ? rating.score : ''
        ]);
      }
    }
    
    const mainWs = XLSX.utils.aoa_to_sheet(mainSheetData);
    XLSX.utils.book_append_sheet(wb, mainWs, 'Main Results');

    // Create a per-user totals sheet
    const userTotalsData = [
      ['User Name', 'Total Points', 'Rank in Event']
    ];
    
    for (const session of sessions) {
      userTotalsData.push([
        session.userId ? session.userId.name : 'Anonymous',
        session.points || 0,
        session.results?.rankInEvent || ''
      ]);
    }
    
    const userWs = XLSX.utils.aoa_to_sheet(userTotalsData);
    XLSX.utils.book_append_sheet(wb, userWs, 'User Totals');

    // Create leaderboard sheet
    const leaderboardData = [
      ['User Name', 'Total Points']
    ];
    
    // Sort sessions by points to create leaderboard
    const sortedSessions = [...sessions].sort((a, b) => (b.points || 0) - (a.points || 0));
    
    for (const session of sortedSessions) {
      leaderboardData.push([
        session.userId ? session.userId.name : 'Anonymous',
        session.points || 0
      ]);
    }
    
    const lbWs = XLSX.utils.aoa_to_sheet(leaderboardData);
    XLSX.utils.book_append_sheet(wb, lbWs, 'Leaderboard');

    // Generate the buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
    return {
      filename: `disco-spoons-results-${event.name}-${event._id}.xlsx`,
      buffer
    };
  } catch (error) {
    throw error;
  }
};

// Generate individual user results spreadsheet
const generateIndividualResultsSpreadsheet = async (sessionId) => {
  try {
    // Get session with detailed results
    const session = await Session.findById(sessionId)
      .populate('userId', 'name email')
      .populate('eventId', 'name published');
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.eventId.published) {
      throw new Error('Event results have not been published yet');
    }

    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Create the user results sheet
    const userSheetData = [
      ['Coffee Label', 'Actual Origin', 'Actual Process', 'Your Rating', 'Your Guess (Origin)', 'Your Guess (Process)', 'Points Earned']
    ];

    // Use the detailed results stored in the session
    if (session.results && session.results.detailedResults) {
      for (const [coffeeId, result] of session.results.detailedResults) {
        userSheetData.push([
          result.label,
          result.originCountry,
          result.process,
          result.userRating || '',
          result.userGuessOrigin || '',
          result.userGuessProcess || '',
          result.pointsEarned
        ]);
      }
    }
    
    const userWs = XLSX.utils.aoa_to_sheet(userSheetData);
    XLSX.utils.book_append_sheet(wb, userWs, 'Your Results');

    // Add summary sheet
    const summaryData = [
      ['Summary', 'Value'],
      ['Total Points', session.points || 0],
      ['Rank in Event', session.results?.rankInEvent || 'N/A'],
      ['Total Possible Points', session.results?.totalPossiblePoints || 0]
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate the buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
    const userName = session.userId ? session.userId.name : 'Anonymous';
    return {
      filename: `disco-spoons-individual-results-${userName}-${sessionId}.xlsx`,
      buffer
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateMainResultsSpreadsheet,
  generateIndividualResultsSpreadsheet
};