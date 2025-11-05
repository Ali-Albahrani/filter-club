// GuessDropdown.test.js - Component tests for GuessDropdown using React Testing Library

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import GuessDropdown from './GuessDropdown';

describe('GuessDropdown', () => {
  const options = ['washed', 'honey', 'natural', 'experimental'];

  test('renders with correct options', () => {
    render(
      <GuessDropdown 
        value="" 
        onChange={() => {}} 
        options={options} 
        placeholder="Select processing method" 
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Check that all options are present
    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  test('displays placeholder option', () => {
    render(
      <GuessDropdown 
        value="" 
        onChange={() => {}} 
        options={options} 
        placeholder="Select processing method" 
      />
    );
    
    expect(screen.getByText('Select processing method')).toBeInTheDocument();
  });

  test('calls onChange when selection changes', () => {
    const onChangeMock = jest.fn();
    render(
      <GuessDropdown 
        value="" 
        onChange={onChangeMock} 
        options={options} 
        placeholder="Select processing method" 
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'natural' } });
    
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith('natural');
  });

  test('is disabled when disabled prop is true', () => {
    render(
      <GuessDropdown 
        value="" 
        onChange={() => {}} 
        options={options} 
        placeholder="Select processing method" 
        disabled={true}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  test('shows selected value', () => {
    render(
      <GuessDropdown 
        value="honey" 
        onChange={() => {}} 
        options={options} 
        placeholder="Select processing method" 
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('honey');
  });
});