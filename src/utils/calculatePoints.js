// calculatePoints.js - Business logic for calculating points in Disco Spoons

/**
 * Calculate points for a user's guess against actual coffee information
 * @param {Object} guess - The user's guess containing originCountry and process
 * @param {Object} actual - The actual coffee information containing originCountry and process
 * @returns {number} Points earned (0, 1, or 2)
 */
export const calculatePoints = (guess, actual) => {
  let points = 0;
  
  if (guess.guessedOriginCountry === actual.originCountry) {
    points += 1;
  }
  
  if (guess.guessedProcess === actual.process) {
    points += 1;
  }
  
  return points;
};

/**
 * Calculate average score for a coffee based on all ratings
 * @param {Array} ratings - Array of rating objects with score property
 * @returns {number} Average score or null if no ratings
 */
export const calculateAverageScore = (ratings) => {
  if (!ratings || ratings.length === 0) {
    return null;
  }
  
  const total = ratings.reduce((sum, rating) => sum + rating.score, 0);
  return total / ratings.length;
};

/**
 * Calculate event statistics for coffees
 * @param {Array} coffees - Array of coffee objects
 * @param {Array} sessions - Array of session objects with ratings and guesses
 * @returns {Object} Statistics for each coffee
 */
export const calculateEventStats = (coffees, sessions) => {
  const stats = {};
  
  coffees.forEach(coffee => {
    // Get all ratings for this coffee
    const coffeeRatings = [];
    const coffeeGuesses = [];
    
    sessions.forEach(session => {
      const rating = session.ratings.find(r => r.coffeeId.toString() === coffee._id.toString());
      if (rating) {
        coffeeRatings.push(rating);
      }
      
      const guess = session.guesses.find(g => g.coffeeId.toString() === coffee._id.toString());
      if (guess) {
        coffeeGuesses.push({
          guess: guess,
          actual: { originCountry: coffee.originCountry, process: coffee.process }
        });
      }
    });
    
    stats[coffee._id] = {
      averageScore: calculateAverageScore(coffeeRatings),
      ratingCount: coffeeRatings.length,
      correctOriginGuesses: coffeeGuesses.filter(item => 
        item.guess.guessedOriginCountry === item.actual.originCountry).length,
      correctProcessGuesses: coffeeGuesses.filter(item => 
        item.guess.guessedProcess === item.actual.process).length,
      totalGuesses: coffeeGuesses.length
    };
  });
  
  return stats;
};

/**
 * Calculate user's detailed results for an event
 * @param {Object} event - Event object with coffees
 * @param {Object} session - Session object with ratings and guesses
 * @returns {Object} Detailed results for the user
 */
export const calculateUserResults = (event, session) => {
  const detailedResults = new Map();
  let totalPoints = 0;
  
  event.coffees.forEach(coffee => {
    const rating = session.ratings.find(r => 
      r.coffeeId.toString() === coffee._id.toString()
    );
    
    const guess = session.guesses.find(g => 
      g.coffeeId.toString() === coffee._id.toString()
    );
    
    const result = {
      coffeeId: coffee._id,
      label: coffee.label,
      name: coffee.name,
      roaster: coffee.roaster,
      originCountry: coffee.originCountry,
      process: coffee.process,
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
        result.pointsEarned += 1;
        totalPoints += 1;
      }
      if (guess.guessedProcess === coffee.process) {
        result.isProcessCorrect = true;
        result.pointsEarned += 1;
        totalPoints += 1;
      }
    }
    
    detailedResults.set(coffee._id.toString(), result);
  });
  
  return {
    detailedResults,
    totalPoints,
    totalPossiblePoints: event.coffees.length * 2 // 2 points possible per coffee (origin + process)
  };
};