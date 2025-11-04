// Validation middleware for common validation tasks

const validateEvent = (req, res, next) => {
  const { name, startTs, endTs, location, organizerId, coffees } = req.body;
  
  // Basic validation for required fields
  if (!name || !startTs || !endTs || !location || !organizerId) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'Name, startTs, endTs, location, and organizerId are required' 
    });
  }
  
  // Validate date format
  if (isNaN(Date.parse(startTs)) || isNaN(Date.parse(endTs))) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'startTs and endTs must be valid dates' 
    });
  }
  
  // Validate that end date is after start date
  if (new Date(endTs) < new Date(startTs)) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'End time must be after start time' 
    });
  }
  
  // Validate coffees if provided
  if (coffees) {
    if (!Array.isArray(coffees)) {
      return res.status(400).json({ 
        error: 'ValidationError', 
        details: 'Coffees must be an array' 
      });
    }
    
    for (let i = 0; i < coffees.length; i++) {
      const coffee = coffees[i];
      if (!coffee.name || !coffee.roaster || !coffee.originCountry || !coffee.process) {
        return res.status(400).json({ 
          error: 'ValidationError', 
          details: `Coffee at index ${i} is missing required fields (name, roaster, originCountry, process)` 
        });
      }
      
      if (!['washed', 'honey', 'natural', 'experimental'].includes(coffee.process)) {
        return res.status(400).json({ 
          error: 'ValidationError', 
          details: `Coffee at index ${i} has invalid process. Must be one of: washed, honey, natural, experimental` 
        });
      }
    }
  }
  
  next();
};

const validateRating = (req, res, next) => {
  const { coffeeId, score } = req.body;
  
  if (!coffeeId) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'coffeeId is required' 
    });
  }
  
  // Require integer score per QWEN.md spec
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 10) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'Score must be an integer between 1 and 10' 
    });
  }
  
  next();
};

const validateGuess = (req, res, next) => {
  const { coffeeId, guessedOriginCountry, guessedProcess } = req.body;
  
  if (!coffeeId) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'coffeeId is required' 
    });
  }
  
  if (!guessedOriginCountry || typeof guessedOriginCountry !== 'string') {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'guessedOriginCountry is required and must be a string' 
    });
  }
  
  if (!guessedProcess || !['washed', 'honey', 'natural', 'experimental'].includes(guessedProcess)) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      details: 'guessedProcess is required and must be one of: washed, honey, natural, experimental' 
    });
  }
  
  next();
};

module.exports = {
  validateEvent,
  validateRating,
  validateGuess
};