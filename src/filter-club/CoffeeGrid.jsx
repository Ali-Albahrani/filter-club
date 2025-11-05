import React from 'react';
import CoffeePanel from './CoffeePanel';

const CoffeeGrid = ({ 
  coffees, 
  ratings = [], 
  guesses = [], 
  onRatingChange, 
  onGuessChange,
  isPublished = false,
  currentUserId = null,
  eventOrganizerId = null
}) => {
  const getCoffeeRating = (coffeeId) => {
    return ratings.find(rating => rating.coffeeId === coffeeId);
  };

  const getCoffeeGuess = (coffeeId) => {
    return guesses.find(guess => guess.coffeeId === coffeeId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coffees.map((coffee) => (
        <CoffeePanel
          key={coffee._id}
          coffee={coffee}
          rating={getCoffeeRating(coffee._id)}
          guess={getCoffeeGuess(coffee._id)}
          onRatingChange={onRatingChange}
          onGuessChange={onGuessChange}
          isPublished={isPublished}
          currentUserId={currentUserId}
          eventOrganizerId={eventOrganizerId}
        />
      ))}
    </div>
  );
};

export default CoffeeGrid;