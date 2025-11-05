// calculatePoints.test.js - Unit tests for business logic functions

import { calculatePoints, calculateAverageScore, calculateEventStats, calculateUserResults } from './calculatePoints';

describe('calculatePoints', () => {
  test('returns 2 points when both origin and process are correct', () => {
    const guess = {
      guessedOriginCountry: 'Ethiopia',
      guessedProcess: 'natural'
    };
    
    const actual = {
      originCountry: 'Ethiopia',
      process: 'natural'
    };
    
    const points = calculatePoints(guess, actual);
    expect(points).toBe(2);
  });

  test('returns 1 point when only origin is correct', () => {
    const guess = {
      guessedOriginCountry: 'Ethiopia',
      guessedProcess: 'washed'
    };
    
    const actual = {
      originCountry: 'Ethiopia',
      process: 'natural'
    };
    
    const points = calculatePoints(guess, actual);
    expect(points).toBe(1);
  });

  test('returns 1 point when only process is correct', () => {
    const guess = {
      guessedOriginCountry: 'Colombia',
      guessedProcess: 'natural'
    };
    
    const actual = {
      originCountry: 'Ethiopia',
      process: 'natural'
    };
    
    const points = calculatePoints(guess, actual);
    expect(points).toBe(1);
  });

  test('returns 0 points when both are incorrect', () => {
    const guess = {
      guessedOriginCountry: 'Colombia',
      guessedProcess: 'washed'
    };
    
    const actual = {
      originCountry: 'Ethiopia',
      process: 'natural'
    };
    
    const points = calculatePoints(guess, actual);
    expect(points).toBe(0);
  });
});

describe('calculateAverageScore', () => {
  test('returns correct average for multiple ratings', () => {
    const ratings = [
      { score: 8 },
      { score: 6 },
      { score: 10 },
      { score: 7 }
    ];
    
    const average = calculateAverageScore(ratings);
    expect(average).toBe(7.75);
  });

  test('returns correct average for single rating', () => {
    const ratings = [
      { score: 9 }
    ];
    
    const average = calculateAverageScore(ratings);
    expect(average).toBe(9);
  });

  test('returns null for empty ratings array', () => {
    const ratings = [];
    
    const average = calculateAverageScore(ratings);
    expect(average).toBeNull();
  });

  test('returns null for undefined ratings', () => {
    const average = calculateAverageScore(undefined);
    expect(average).toBeNull();
  });
});

describe('calculateEventStats', () => {
  test('calculates statistics for coffees', () => {
    const coffees = [
      { _id: '1', originCountry: 'Ethiopia', process: 'natural' },
      { _id: '2', originCountry: 'Colombia', process: 'washed' }
    ];
    
    const sessions = [
      {
        ratings: [
          { coffeeId: '1', score: 8 },
          { coffeeId: '2', score: 6 }
        ],
        guesses: [
          { coffeeId: '1', guessedOriginCountry: 'Ethiopia', guessedProcess: 'natural' },
          { coffeeId: '2', guessedOriginCountry: 'Ethiopia', guessedProcess: 'honey' }
        ]
      },
      {
        ratings: [
          { coffeeId: '1', score: 7 }
        ],
        guesses: [
          { coffeeId: '1', guessedOriginCountry: 'Colombia', guessedProcess: 'washed' }
        ]
      }
    ];
    
    const stats = calculateEventStats(coffees, sessions);
    
    expect(stats['1'].averageScore).toBe(7.5); // (8 + 7) / 2
    expect(stats['1'].ratingCount).toBe(2);
    expect(stats['1'].correctOriginGuesses).toBe(1); // 1 out of 2 correct
    expect(stats['1'].correctProcessGuesses).toBe(1); // 1 out of 2 correct
    expect(stats['1'].totalGuesses).toBe(2);
    
    expect(stats['2'].averageScore).toBe(6); // 6 / 1
    expect(stats['2'].ratingCount).toBe(1);
    expect(stats['2'].correctOriginGuesses).toBe(0); // 0 out of 1 correct
    expect(stats['2'].correctProcessGuesses).toBe(0); // 0 out of 1 correct
    expect(stats['2'].totalGuesses).toBe(1);
  });
});

describe('calculateUserResults', () => {
  test('calculates user results correctly', () => {
    const event = {
      coffees: [
        { 
          _id: '1', 
          label: 'A', 
          name: 'Test Coffee A', 
          roaster: 'Test Roaster', 
          originCountry: 'Ethiopia', 
          process: 'natural' 
        },
        { 
          _id: '2', 
          label: 'B', 
          name: 'Test Coffee B', 
          roaster: 'Test Roaster 2', 
          originCountry: 'Colombia', 
          process: 'washed' 
        }
      ]
    };
    
    const session = {
      ratings: [
        { coffeeId: '1', score: 8 },
        { coffeeId: '2', score: 6 }
      ],
      guesses: [
        { coffeeId: '1', guessedOriginCountry: 'Ethiopia', guessedProcess: 'natural' },
        { coffeeId: '2', guessedOriginCountry: 'Ethiopia', guessedProcess: 'honey' }
      ]
    };
    
    const results = calculateUserResults(event, session);
    
    expect(results.totalPoints).toBe(3); // 2 points for coffee 1 (both correct) + 0 points for coffee 2 (both wrong) = 2, but origin for coffee 2 was guessed as Ethiopia when it was Colombia, so 2 + 0 = 2
    // Actually: Coffee 1: correct origin (Ethiopia) + correct process (natural) = 2 points
    // Coffee 2: wrong origin (Ethiopia vs Colombia) + wrong process (honey vs washed) = 0 points
    // Total = 2 points
    
    // Let me recheck: The first coffee guess is correct for both, so 2 points
    // The second coffee guess is incorrect for both, so 0 points
    // Actually, coffee 2 guess was Ethiopia/washed but actual was Colombia/washed
    // So origin is wrong, process is correct = 1 point
    // Total should be 3
    
    const result1 = results.detailedResults.get('1');
    expect(result1.isOriginCorrect).toBe(true);
    expect(result1.isProcessCorrect).toBe(true);
    expect(result1.pointsEarned).toBe(2);
    
    const result2 = results.detailedResults.get('2');
    expect(result2.isOriginCorrect).toBe(false);
    expect(result2.isProcessCorrect).toBe(false);
    expect(result2.pointsEarned).toBe(0);
    
    expect(results.totalPoints).toBe(2); // Coffee 1: 2 points (both correct), Coffee 2: 0 points (both wrong)
  });
  
  test('handles sessions with missing ratings or guesses', () => {
    const event = {
      coffees: [
        { 
          _id: '1', 
          label: 'A', 
          name: 'Test Coffee A', 
          roaster: 'Test Roaster', 
          originCountry: 'Ethiopia', 
          process: 'natural' 
        }
      ]
    };
    
    // Session has rating but no guess for coffee
    const session = {
      ratings: [
        { coffeeId: '1', score: 8 }
      ],
      guesses: [] // No guesses
    };
    
    const results = calculateUserResults(event, session);
    const result1 = results.detailedResults.get('1');
    
    expect(result1.userRating).toBe(8);
    expect(result1.userGuessOrigin).toBeNull();
    expect(result1.userGuessProcess).toBeNull();
    expect(result1.pointsEarned).toBe(0); // No points without guesses
  });
});