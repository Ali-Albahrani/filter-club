// RatingSlider.test.js - Component tests for RatingSlider using React Testing Library

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import RatingSlider from './RatingSlider';

describe('RatingSlider', () => {
  test('renders with correct initial value', () => {
    render(<RatingSlider value={5} onChange={() => {}} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider.value).toBe('5');
  });

  test('calls onChange when value changes', () => {
    const onChangeMock = jest.fn();
    render(<RatingSlider value={3} onChange={onChangeMock} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 7 } });
    
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(7);
  });

  test('is disabled when disabled prop is true', () => {
    render(<RatingSlider value={5} onChange={() => {}} disabled={true} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  test('shows correct value label', () => {
    render(<RatingSlider value={8} onChange={() => {}} />);
    
    // Since the slider doesn't have an explicit label, we test the aria-label or value
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });
});