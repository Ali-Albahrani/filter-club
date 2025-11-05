// validation.js - Form validation utilities matching backend rules

// Validation patterns and rules
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 6,
    message: 'Password must be at least 6 characters long'
  },
  name: {
    minLength: 2,
    message: 'Name must be at least 2 characters long'
  },
  eventName: {
    minLength: 1,
    message: 'Event name is required'
  },
  coffeeName: {
    minLength: 1,
    message: 'Coffee name is required'
  },
  roaster: {
    minLength: 1,
    message: 'Roaster is required'
  },
  originCountry: {
    minLength: 1,
    message: 'Origin country is required'
  },
  process: {
    validValues: ['washed', 'honey', 'natural', 'experimental'],
    message: 'Please select a valid processing method'
  },
  rating: {
    min: 1,
    max: 10,
    message: 'Rating must be between 1 and 10'
  }
};

// Validation functions
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!validationRules.email.pattern.test(email)) {
    return validationRules.email.message;
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < validationRules.password.minLength) {
    return validationRules.password.message;
  }
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < validationRules.name.minLength) {
    return validationRules.name.message;
  }
  return null;
};

export const validateEventName = (name) => {
  if (!name) return 'Event name is required';
  if (name.length < validationRules.eventName.minLength) {
    return validationRules.eventName.message;
  }
  return null;
};

export const validateCoffee = (coffee) => {
  const errors = {};
  
  if (!coffee.name) {
    errors.name = validationRules.coffeeName.message;
  }
  
  if (!coffee.roaster) {
    errors.roaster = validationRules.roaster.message;
  }
  
  if (!coffee.originCountry) {
    errors.originCountry = validationRules.originCountry.message;
  }
  
  if (!coffee.process) {
    errors.process = validationRules.process.message;
  } else if (!validationRules.process.validValues.includes(coffee.process)) {
    errors.process = validationRules.process.message;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateRating = (rating) => {
  if (rating === null || rating === undefined) return 'Rating is required';
  if (rating < validationRules.rating.min || rating > validationRules.rating.max) {
    return validationRules.rating.message;
  }
  if (!Number.isInteger(rating)) {
    return 'Rating must be a whole number';
  }
  return null;
};

export const validateGuess = (guess) => {
  const errors = {};
  
  if (!guess.guessedOriginCountry) {
    errors.guessedOriginCountry = 'Origin country guess is required';
  }
  
  if (!guess.guessedProcess) {
    errors.guessedProcess = 'Process guess is required';
  } else if (!validationRules.process.validValues.includes(guess.guessedProcess)) {
    errors.guessedProcess = validationRules.process.message;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate entire form data
export const validateEventFormData = (eventData) => {
  const errors = {};
  
  const eventNameError = validateEventName(eventData.name);
  if (eventNameError) errors.name = eventNameError;
  
  if (!eventData.startTs) {
    errors.startTs = 'Start date and time are required';
  }
  
  if (!eventData.location) {
    errors.location = 'Location is required';
  }
  
  if (!eventData.coffees || eventData.coffees.length === 0) {
    errors.coffees = 'At least one coffee is required';
  } else {
    const coffeeErrors = [];
    for (let i = 0; i < eventData.coffees.length; i++) {
      const coffeeError = validateCoffee(eventData.coffees[i]);
      if (coffeeError) {
        coffeeErrors.push(coffeeError);
      } else {
        coffeeErrors.push(null);
      }
    }
    
    if (coffeeErrors.some(err => err !== null)) {
      errors.coffees = coffeeErrors;
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate user registration form
export const validateRegistrationForm = (userData) => {
  const errors = {};
  
  const nameError = validateName(userData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(userData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(userData.password);
  if (passwordError) errors.password = passwordError;
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate user login form
export const validateLoginForm = (userData) => {
  const errors = {};
  
  const emailError = validateEmail(userData.email);
  if (emailError) errors.email = emailError;
  
  if (!userData.password) {
    errors.password = 'Password is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};