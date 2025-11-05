import React, { useMemo } from 'react';
import CoffeePanel from './CoffeePanel';

const CoffeeGrid = React.memo(({ 
  coffees, 
  ratings = [], 
  guesses = [], 
  onRatingChange, 
  onGuessChange,
  isPublished = false,
  currentUserId = null,
  eventOrganizerId = null
}) => {
  // Memoize the coffee data processing to prevent unnecessary recalculations
  const coffeeData = useMemo(() => {
    return coffees.map(coffee => {
      const rating = ratings.find(r => r.coffeeId === coffee._id);
      const guess = guesses.find(g => g.coffeeId === coffee._id);
      return { coffee, rating, guess };
    });
  }, [coffees, ratings, guesses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coffeeData.map(({ coffee, rating, guess }) => (
        <CoffeePanel
          key={coffee._id}
          coffee={coffee}
          rating={rating}
          guess={guess}
          onRatingChange={onRatingChange}
          onGuessChange={onGuessChange}
          isPublished={isPublished}
          currentUserId={currentUserId}
          eventOrganizerId={eventOrganizerId}
        />
      ))}
    </div>
  );
});

export default CoffeeGrid;