// validation.test.js - Tests for validation utilities

import {
  validateEmail,
  validatePassword,
  validateName,
  validateEventName,
  validateCoffee,
  validateRating,
  validateGuess,
  validateEventFormData,
  validateRegistrationForm,
  validateLoginForm
} from './validation';

describe('Email Validation', () => {
  test('validates correct email format', () => {
    expect(validateEmail('test@example.com')).toBeNull();
    expect(validateEmail('user.name+tag@example.co.uk')).toBeNull();
  });

  test('rejects invalid email formats', () => {
    expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('test@')).toBe('Please enter a valid email address');
    expect(validateEmail('@example.com')).toBe('Please enter a valid email address');
  });
});

describe('Password Validation', () => {
  test('validates password length', () => {
    expect(validatePassword('password')).toBeNull();
    expect(validatePassword('123456')).toBeNull();
  });

  test('rejects short passwords', () => {
    expect(validatePassword('')).toBe('Password is required');
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters long');
  });
});

describe('Name Validation', () => {
  test('validates name length', () => {
    expect(validateName('A')).toBeNull();
    expect(validateName('John')).toBeNull();
  });

  test('rejects short names', () => {
    expect(validateName('')).toBe('Name is required');
    expect(validateName('J')).toBe('Name must be at least 2 characters long');
  });
});

describe('Coffee Validation', () => {
  test('validates complete coffee object', () => {
    const validCoffee = {
      name: 'Test Coffee',
      roaster: 'Test Roaster',
      originCountry: 'Ethiopia',
      process: 'natural'
    };
    
    expect(validateCoffee(validCoffee)).toBeNull();
  });

  test('rejects incomplete coffee object', () => {
    const invalidCoffee = {
      name: '',
      roaster: 'Test Roaster',
      originCountry: 'Ethiopia',
      process: 'invalid'
    };
    
    const errors = validateCoffee(invalidCoffee);
    expect(errors).toEqual({
      name: 'Coffee name is required',
      process: 'Please select a valid processing method'
    });
  });
});

describe('Rating Validation', () => {
  test('validates correct ratings', () => {
    expect(validateRating(1)).toBeNull();
    expect(validateRating(5)).toBeNull();
    expect(validateRating(10)).toBeNull();
  });

  test('rejects invalid ratings', () => {
    expect(validateRating(0)).toBe('Rating must be between 1 and 10');
    expect(validateRating(11)).toBe('Rating must be between 1 and 10');
    expect(validateRating(5.5)).toBe('Rating must be a whole number');
    expect(validateRating(null)).toBe('Rating is required');
    expect(validateRating(undefined)).toBe('Rating is required');
  });
});

describe('Guess Validation', () => {
  test('validates complete guess object', () => {
    const validGuess = {
      guessedOriginCountry: 'Ethiopia',
      guessedProcess: 'natural'
    };
    
    expect(validateGuess(validGuess)).toBeNull();
  });

  test('rejects incomplete guess object', () => {
    const invalidGuess = {
      guessedOriginCountry: '',
      guessedProcess: 'invalid'
    };
    
    const errors = validateGuess(invalidGuess);
    expect(errors).toEqual({
      guessedOriginCountry: 'Origin country guess is required',
      guessedProcess: 'Please select a valid processing method'
    });
  });
});

describe('Event Form Validation', () => {
  test('validates complete event form data', () => {
    const validEventData = {
      name: 'Test Event',
      startTs: '2023-10-15T10:00',
      location: 'Test Location',
      coffees: [{
        name: 'Test Coffee',
        roaster: 'Test Roaster',
        originCountry: 'Ethiopia',
        process: 'natural'
      }]
    };
    
    expect(validateEventFormData(validEventData)).toBeNull();
  });

  test('rejects incomplete event form data', () => {
    const invalidEventData = {
      name: '',
      startTs: '',
      location: '',
      coffees: [{
        name: '',
        roaster: 'Test Roaster',
        originCountry: 'Ethiopia',
        process: 'invalid'
      }]
    };
    
    const errors = validateEventFormData(invalidEventData);
    expect(errors).toEqual({
      name: 'Event name is required',
      startTs: 'Start date and time are required',
      location: 'Location is required',
      coffees: [{
        name: 'Coffee name is required',
        process: 'Please select a valid processing method'
      }]
    });
  });
});

describe('Registration Form Validation', () => {
  test('validates complete registration form', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    expect(validateRegistrationForm(validUserData)).toBeNull();
  });

  test('rejects incomplete registration form', () => {
    const invalidUserData = {
      name: '',
      email: 'invalid-email',
      password: '123'
    };
    
    const errors = validateRegistrationForm(invalidUserData);
    expect(errors).toEqual({
      name: 'Name is required',
      email: 'Please enter a valid email address',
      password: 'Password must be at least 6 characters long'
    });
  });
});

describe('Login Form Validation', () => {
  test('validates complete login form', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    expect(validateLoginForm(validUserData)).toBeNull();
  });

  test('rejects incomplete login form', () => {
    const invalidUserData = {
      email: 'invalid-email',
      password: ''
    };
    
    const errors = validateLoginForm(invalidUserData);
    expect(errors).toEqual({
      email: 'Please enter a valid email address',
      password: 'Password is required'
    });
  });
});