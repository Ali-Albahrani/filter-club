import React, { useState, useEffect } from 'react';
import RatingSlider from './RatingSlider';
import GuessDropdown from './GuessDropdown';

const CoffeePanel = ({ 
  coffee, 
  rating, 
  guess, 
  onRatingChange, 
  onGuessChange,
  isPublished = false,
  currentUserId = null,
  eventOrganizerId = null
}) => {
  const [localRating, setLocalRating] = useState(rating?.score || null);
  const [localGuess, setLocalGuess] = useState({
    guessedOriginCountry: guess?.guessedOriginCountry || '',
    guessedProcess: guess?.guessedProcess || ''
  });
  const [isDirty, setIsDirty] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalRating(rating?.score || null);
    setLocalGuess({
      guessedOriginCountry: guess?.guessedOriginCountry || '',
      guessedProcess: guess?.guessedProcess || ''
    });
    setIsDirty(false);
  }, [rating, guess]);

  const handleRatingChange = (newRating) => {
    setLocalRating(newRating);
    setIsDirty(true);
    onRatingChange(coffee._id, newRating);
  };

  const handleGuessChange = (field, value) => {
    const newGuess = { ...localGuess, [field]: value };
    setLocalGuess(newGuess);
    setIsDirty(true);
    onGuessChange(coffee._id, newGuess);
  };

  // Determine if user can see actual coffee details
  const canSeeDetails = isPublished || 
    (currentUserId && eventOrganizerId && currentUserId === eventOrganizerId);

  return (
    <div className="bg-brand-white rounded-lg shadow-md p-6 mb-4 border border-brand-blue">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-red">Coffee {coffee.label}</h3>
          {canSeeDetails ? (
            <div className="mt-2">
              <p className="text-sm text-brand-blue font-medium">{coffee.name}</p>
              <p className="text-xs text-brand-blue">{coffee.roaster}</p>
            </div>
          ) : (
            <p className="text-sm text-brand-blue italic">Details hidden until results are published</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-brand-blue">
            {canSeeDetails ? (
              <>
                <div>Origin: {coffee.originCountry}</div>
                <div>Process: {coffee.process}</div>
              </>
            ) : (
              <>
                <div>Origin: [Hidden]</div>
                <div>Process: [Hidden]</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-red mb-2">
          Rate this coffee (1-10)
        </label>
        <RatingSlider 
          value={localRating || 0} 
          onChange={handleRatingChange}
          disabled={isPublished}
        />
        {localRating !== null && (
          <div className="mt-1 text-right text-brand-red font-bold">
            {localRating}/10
          </div>
        )}
      </div>

      {/* Guess Origin */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-red mb-2">
          Guess the origin country
        </label>
        <GuessDropdown
          value={localGuess.guessedOriginCountry}
          onChange={(value) => handleGuessChange('guessedOriginCountry', value)}
          options={[
            'Ethiopia', 'Colombia', 'Kenya', 'Guatemala', 'Costa Rica', 
            'Brazil', 'Honduras', 'Mexico', 'Panama', 'Peru', 
            'Rwanda', 'Tanzania', 'Uganda', 'Yemen', 'Indonesia'
          ]}
          placeholder="Select origin country"
          disabled={isPublished}
        />
      </div>

      {/* Guess Process */}
      <div>
        <label className="block text-sm font-medium text-brand-red mb-2">
          Guess the processing method
        </label>
        <GuessDropdown
          value={localGuess.guessedProcess}
          onChange={(value) => handleGuessChange('guessedProcess', value)}
          options={['washed', 'honey', 'natural', 'experimental']}
          placeholder="Select processing method"
          disabled={isPublished}
        />
      </div>

      {isDirty && !isPublished && (
        <div className="mt-3 text-xs text-brand-red bg-brand-red-secondary p-2 rounded">
          Your changes are being saved automatically
        </div>
      )}
    </div>
  );
};

export default CoffeePanel;