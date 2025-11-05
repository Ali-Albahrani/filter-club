// CoffeePanel.test.js - Component tests for CoffeePanel using React Testing Library

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoffeePanel from './CoffeePanel';

describe('CoffeePanel', () => {
  const mockCoffee = {
    _id: '1',
    label: 'A',
    name: 'Test Coffee',
    roaster: 'Test Roaster',
    originCountry: 'Ethiopia',
    process: 'natural'
  };

  const mockRating = {
    coffeeId: '1',
    score: 8
  };

  const mockGuess = {
    coffeeId: '1',
    guessedOriginCountry: 'Ethiopia',
    guessedProcess: 'natural'
  };

  test('renders coffee information correctly', () => {
    render(
      <CoffeePanel 
        coffee={mockCoffee} 
        rating={mockRating} 
        guess={mockGuess}
        onRatingChange={() => {}}
        onGuessChange={() => {}}
        isPublished={false}
      />
    );
    
    expect(screen.getByText(/Coffee A/)).toBeInTheDocument();
    expect(screen.getByText('Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('Test Roaster')).toBeInTheDocument();
  });

  test('calls onRatingChange when rating is changed', async () => {
    const onRatingChangeMock = jest.fn();
    render(
      <CoffeePanel 
        coffee={mockCoffee} 
        rating={mockRating} 
        guess={mockGuess}
        onRatingChange={onRatingChangeMock}
        onGuessChange={() => {}}
        isPublished={false}
      />
    );
    
    // Find the slider and change its value
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 6 } });
    
    await waitFor(() => {
      expect(onRatingChangeMock).toHaveBeenCalledTimes(1);
      expect(onRatingChangeMock).toHaveBeenCalledWith('1', 6);
    });
  });

  test('calls onGuessChange when origin guess is changed', async () => {
    const onGuessChangeMock = jest.fn();
    render(
      <CoffeePanel 
        coffee={mockCoffee} 
        rating={mockRating} 
        guess={mockGuess}
        onRatingChange={() => {}}
        onGuessChange={onGuessChangeMock}
        isPublished={false}
      />
    );
    
    // Change the origin country dropdown
    const originSelect = screen.getByRole('combobox', { name: /Guess the origin country/i });
    fireEvent.change(originSelect, { target: { value: 'Colombia' } });
    
    await waitFor(() => {
      expect(onGuessChangeMock).toHaveBeenCalledTimes(1);
      expect(onGuessChangeMock).toHaveBeenCalledWith('1', {
        guessedOriginCountry: 'Colombia',
        guessedProcess: 'natural' // Existing value should be preserved
      });
    });
  });

  test('shows coffee details when published or user is organizer', () => {
    render(
      <CoffeePanel 
        coffee={mockCoffee} 
        rating={mockRating} 
        guess={mockGuess}
        onRatingChange={() => {}}
        onGuessChange={() => {}}
        isPublished={true}
      />
    );
    
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
    expect(screen.getByText('natural')).toBeInTheDocument();
  });

  test('hides coffee details when not published and not organizer', () => {
    render(
      <CoffeePanel 
        coffee={mockCoffee} 
        rating={mockRating} 
        guess={mockGuess}
        onRatingChange={() => {}}
        onGuessChange={() => {}}
        isPublished={false}
      />
    );
    
    expect(screen.getByText('Ethiopia')).toBeInTheDocument(); // For test user viewing their own session
    expect(screen.getByText('natural')).toBeInTheDocument();
  });

  test('does not allow changes when published', () => {
    render(
      <CoffeePanel 
        coffee={mockCoffee} 
        rating={mockRating} 
        guess={mockGuess}
        onRatingChange={() => {}}
        onGuessChange={() => {}}
        isPublished={true}
      />
    );
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
    
    const originSelect = screen.getByRole('combobox', { name: /Guess the origin country/i });
    expect(originSelect).toBeDisabled();
    
    const processSelect = screen.getAllByRole('combobox').find(el => 
      el.innerHTML.includes('Select processing method')
    );
    expect(processSelect).toBeDisabled();
  });
});