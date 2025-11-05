import React, { useState, useEffect } from 'react';
import { Coffee, Star, Trophy, RotateCcw } from 'lucide-react';
import CoffeeGrid from './CoffeeGrid';

const CuppingView = ({ 
  currentSession, 
  event, 
  ratings, 
  guesses, 
  submitRating, 
  submitGuess, 
  finishSession 
}) => {
  const [localRatings, setLocalRatings] = useState(ratings || []);
  const [localGuesses, setLocalGuesses] = useState(guesses || []);
  const [savingStatus, setSavingStatus] = useState({});

  // Initialize local state with current data
  useEffect(() => {
    if (ratings) setLocalRatings(ratings);
    if (guesses) setLocalGuesses(guesses);
  }, [ratings, guesses]);

  const handleRatingChange = async (coffeeId, newRating) => {
    try {
      // Optimistically update the UI
      const updatedRatings = [...localRatings];
      const existingIndex = updatedRatings.findIndex(r => r.coffeeId === coffeeId);
      
      if (existingIndex !== -1) {
        updatedRatings[existingIndex].score = newRating;
      } else {
        updatedRatings.push({ coffeeId, score: newRating });
      }
      
      setLocalRatings(updatedRatings);
      
      // Update saving status
      setSavingStatus(prev => ({ ...prev, [`rating-${coffeeId}`]: 'saving' }));
      
      // Submit to backend
      await submitRating(currentSession._id, coffeeId, newRating);
      
      // Update saving status
      setSavingStatus(prev => ({ ...prev, [`rating-${coffeeId}`]: 'saved' }));
      
      // Reset saving status after 1 second
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [`rating-${coffeeId}`]: null }));
      }, 1000);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setSavingStatus(prev => ({ ...prev, [`rating-${coffeeId}`]: 'error' }));
    }
  };

  const handleGuessChange = async (coffeeId, newGuess) => {
    try {
      // Optimistically update the UI
      const updatedGuesses = [...localGuesses];
      const existingIndex = updatedGuesses.findIndex(g => g.coffeeId === coffeeId);
      
      if (existingIndex !== -1) {
        updatedGuesses[existingIndex] = { ...updatedGuesses[existingIndex], ...newGuess };
      } else {
        updatedGuesses.push({ coffeeId, ...newGuess });
      }
      
      setLocalGuesses(updatedGuesses);
      
      // Update saving status
      setSavingStatus(prev => ({ ...prev, [`guess-${coffeeId}`]: 'saving' }));
      
      // Submit to backend
      await submitGuess(currentSession._id, coffeeId, newGuess.guessedOriginCountry, newGuess.guessedProcess);
      
      // Update saving status
      setSavingStatus(prev => ({ ...prev, [`guess-${coffeeId}`]: 'saved' }));
      
      // Reset saving status after 1 second
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [`guess-${coffeeId}`]: null }));
      }, 1000);
    } catch (error) {
      console.error('Failed to submit guess:', error);
      setSavingStatus(prev => ({ ...prev, [`guess-${coffeeId}`]: 'error' }));
    }
  };

  // Calculate progress
  const completedRatings = localRatings.length;
  const completedGuesses = localGuesses.length;
  const totalCoffees = event?.coffees?.length || 0;
  const ratingProgress = totalCoffees > 0 ? Math.round((completedRatings / totalCoffees) * 100) : 0;
  const guessProgress = totalCoffees > 0 ? Math.round((completedGuesses / totalCoffees) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center">
          <Coffee className="w-12 h-12 mr-4 text-brand-red" />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-brand-red">{event?.name}</h1>
            <p className="text-brand-blue">Rate and guess the origin of each coffee</p>
          </div>
        </div>
      </div>

      <div className="bg-brand-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-red mb-2">Cupping Session</h2>
            <p className="text-brand-blue">Rate each coffee from 1-10 and guess the origin and process</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-brand-blue p-3 rounded-lg min-w-[150px]">
              <div className="text-sm text-brand-blue">Ratings</div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-brand-red mr-2" />
                <span className="text-brand-red font-bold">{completedRatings}/{totalCoffees}</span>
              </div>
              <div className="w-full bg-brand-white rounded-full h-2 mt-1">
                <div 
                  className="bg-brand-red h-2 rounded-full" 
                  style={{ width: `${ratingProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-brand-blue p-3 rounded-lg min-w-[150px]">
              <div className="text-sm text-brand-blue">Guesses</div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-brand-red mr-2" />
                <span className="text-brand-red font-bold">{completedGuesses}/{totalCoffees}</span>
              </div>
              <div className="w-full bg-brand-white rounded-full h-2 mt-1">
                <div 
                  className="bg-brand-red h-2 rounded-full" 
                  style={{ width: `${guessProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {event?.coffees ? (
          <CoffeeGrid
            coffees={event.coffees}
            ratings={localRatings}
            guesses={localGuesses}
            onRatingChange={handleRatingChange}
            onGuessChange={handleGuessChange}
            isPublished={event.published}
            currentUserId={currentSession?.userId}
            eventOrganizerId={event.organizerId?._id}
          />
        ) : (
          <div className="text-center py-12">
            <Coffee className="w-16 h-16 mx-auto text-brand-blue mb-4" />
            <h3 className="text-xl font-semibold text-brand-red mb-2">No coffees available</h3>
            <p className="text-brand-blue">The event organizer has not added any coffees yet.</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-brand-blue flex justify-end">
          <button
            onClick={finishSession}
            className="px-6 py-3 bg-brand-red text-brand-white rounded-lg hover:bg-brand-red-secondary transition-colors font-medium flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Finish Cupping
          </button>
        </div>
      </div>

      {/* Saving status indicators */}
      {Object.keys(savingStatus).length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2">
          {Object.entries(savingStatus).map(([key, status]) => {
            if (!status) return null;
            
            let message = '';
            let color = 'bg-brand-blue';
            
            if (status === 'saving') {
              message = 'Saving...';
              color = 'bg-brand-red';
            } else if (status === 'saved') {
              message = 'Saved!';
              color = 'bg-green-500';
            } else if (status === 'error') {
              message = 'Error saving';
              color = 'bg-red-500';
            }
            
            return (
              <div key={key} className={`${color} text-brand-white px-4 py-2 rounded-lg shadow-lg`}>
                {message}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CuppingView;