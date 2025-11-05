import React from 'react';

const GuessDropdown = ({ value, onChange, options, placeholder, disabled = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent ${
        disabled 
          ? 'bg-brand-blue text-brand-white border-brand-white cursor-not-allowed' 
          : 'bg-brand-white text-brand-red border-brand-blue'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default GuessDropdown;