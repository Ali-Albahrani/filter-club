import React, { useState } from 'react';
import { Coffee, Plus, Calendar, MapPin } from 'lucide-react';
import AlertModal from './AlertModal';

const SetupView = ({ createEvent, user }) => {
  const [eventDetails, setEventDetails] = useState({
    name: '',
    startTs: '',
    endTs: '',
    location: ''
  });
  const [coffees, setCoffees] = useState([
    { name: '', roaster: '', originCountry: '', process: '' }
  ]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const addCoffee = () => setCoffees(prev => [...prev, { name: '', roaster: '', originCountry: '', process: '' }]);

  const removeCoffee = (index) => {
    if (coffees.length > 1) {
      setCoffees(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCoffee = (index, field, value) => {
    setCoffees(prev => prev.map((coffee, i) =>
      i === index ? { ...coffee, [field]: value } : coffee
    ));
  };

  const updateEventDetails = (field, value) => {
    setEventDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate inputs
    const validCoffees = coffees.filter(c => 
      c.name.trim() && c.roaster.trim() && c.originCountry.trim() && c.process.trim()
    );
    
    if (validCoffees.length < 1) {
      setAlertMessage('Please add at least 1 complete coffee (with name, roaster, origin, and process)');
      setAlertOpen(true);
      return;
    }
    
    if (!eventDetails.name.trim()) {
      setAlertMessage('Please enter an event name');
      setAlertOpen(true);
      return;
    }
    
    if (!eventDetails.startTs) {
      setAlertMessage('Please select a start time');
      setAlertOpen(true);
      return;
    }
    
    // Map coffees to the format expected by the backend (with labels)
    const coffeesWithLabels = validCoffees.map((coffee, index) => ({
      ...coffee,
      label: String.fromCharCode(65 + index) // A, B, C, ...
    }));

    try {
      await createEvent({
        ...eventDetails,
        organizerId: user._id,
        coffees: coffeesWithLabels
      });
    } catch (error) {
      setAlertMessage(error.message || 'Failed to create event. Please try again.');
      setAlertOpen(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Coffee className="w-12 h-12 mx-auto mb-4 text-brand-red" />
        <h1 className="text-3xl font-bold text-brand-red mb-2">Disco Spoons</h1>
        <p className="text-brand-red">Create a new cupping event</p>
      </div>
      <div className="bg-brand-blue rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-brand-red mb-2">
            Event Name
          </label>
          <input
            type="text"
            value={eventDetails.name}
            onChange={(e) => updateEventDetails('name', e.target.value)}
            className="w-full p-3 border border-brand-white rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            placeholder="e.g., Ethiopian Tasting Session"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-red mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={eventDetails.startTs}
              onChange={(e) => updateEventDetails('startTs', e.target.value)}
              className="w-full p-3 border border-brand-white rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-red mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={eventDetails.location}
              onChange={(e) => updateEventDetails('location', e.target.value)}
              className="w-full p-3 border border-brand-white rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              placeholder="e.g., Conference Room A"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-red mb-2">
            Coffees for Cupping
          </label>
          {coffees.map((coffee, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-3 border border-brand-blue rounded-lg relative">
              <input
                type="text"
                value={coffee.name}
                onChange={(e) => updateCoffee(index, 'name', e.target.value)}
                className="p-2 border border-brand-blue rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                placeholder="Coffee Name"
              />
              <input
                type="text"
                value={coffee.roaster}
                onChange={(e) => updateCoffee(index, 'roaster', e.target.value)}
                className="p-2 border border-brand-blue rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                placeholder="Roaster"
              />
              <input
                type="text"
                value={coffee.originCountry}
                onChange={(e) => updateCoffee(index, 'originCountry', e.target.value)}
                className="p-2 border border-brand-blue rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                placeholder="Origin Country"
              />
              <select
                value={coffee.process}
                onChange={(e) => updateCoffee(index, 'process', e.target.value)}
                className="p-2 border border-brand-blue rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
              >
                <option value="">Process</option>
                <option value="washed">Washed</option>
                <option value="honey">Honey</option>
                <option value="natural">Natural</option>
                <option value="experimental">Experimental</option>
              </select>
              {coffees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCoffee(index)}
                  className="absolute -top-2 -right-2 bg-brand-red text-brand-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
                  aria-label="Remove coffee"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCoffee}
            className="flex items-center text-brand-red hover:text-brand-red-secondary font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Coffee
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full bg-brand-red text-brand-white py-3 px-4 rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
        >
          Create Cupping Event
        </button>
      </div>
      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} message={alertMessage} />
    </div>
  );
};

export default SetupView; 