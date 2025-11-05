import React from 'react';

const RatingSlider = ({ value, onChange, disabled = false }) => {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  // Generate labels for the slider
  const labels = [];
  for (let i = 1; i <= 10; i++) {
    labels.push(
      <div 
        key={i} 
        className={`absolute top-6 transform -translate-x-1/2 text-xs ${i === value ? 'text-brand-red font-bold' : 'text-brand-blue'}`}
        style={{ left: `${(i - 1) * 10}%` }}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
          disabled ? 'bg-brand-blue' : 'bg-brand-red-secondary'
        }`}
        style={{
          background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${value * 10}%, #E0E7FF ${value * 10}%, #E0E7FF 100%)`
        }}
      />
      <div className="relative h-6">
        {labels}
      </div>
      <div className="flex justify-between text-xs text-brand-blue mt-1">
        <span>1 - Bad</span>
        <span>5 - Average</span>
        <span>10 - Excellent</span>
      </div>
    </div>
  );
};

export default RatingSlider;