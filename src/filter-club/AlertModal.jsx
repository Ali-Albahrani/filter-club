import React from 'react';

const AlertModal = ({ open, onClose, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
      <div className="bg-brand-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center animate-fade-in">
        <div className="mb-4 text-brand-red text-lg font-semibold">Alert</div>
        <div className="mb-6">{message}</div>
        <button
          onClick={onClose}
          className="bg-brand-red text-brand-white px-6 py-2 rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertModal;

// Add fade-in animation
// In your global CSS (e.g., index.css), add:
// @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
// .animate-fade-in { animation: fade-in 0.2s ease; } 