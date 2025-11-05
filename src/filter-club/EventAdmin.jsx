import React, { useState } from 'react';
import { Coffee, Users, Calendar, MapPin, Trophy, Plus, Edit3, Trash2, Send } from 'lucide-react';
import CoffeeGrid from './CoffeeGrid';

const EventAdmin = ({ event, updateCoffee, addCoffee, removeCoffee, publishEvent, user }) => {
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [newCoffee, setNewCoffee] = useState({
    name: '',
    roaster: '',
    originCountry: '',
    process: ''
  });

  const isOrganizer = event.organizerId?._id === user._id;

  if (!isOrganizer) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Trophy className="w-16 h-16 mx-auto text-brand-red mb-4" />
        <h1 className="text-2xl font-bold text-brand-red mb-2">Access Denied</h1>
        <p className="text-brand-blue">You must be the event organizer to manage this event.</p>
      </div>
    );
  }

  const handleUpdateCoffee = (coffeeId) => {
    if (!editingCoffee?.name || !editingCoffee?.roaster || !editingCoffee?.originCountry || !editingCoffee?.process) {
      alert('Please fill in all fields');
      return;
    }
    updateCoffee(event._id, coffeeId, editingCoffee);
    setEditingCoffee(null);
  };

  const handleAddCoffee = () => {
    if (!newCoffee.name || !newCoffee.roaster || !newCoffee.originCountry || !newCoffee.process) {
      alert('Please fill in all fields');
      return;
    }
    // Add the new coffee with proper label
    const label = String.fromCharCode(65 + event.coffees.length);
    addCoffee(event._id, { ...newCoffee, label });
    setNewCoffee({ name: '', roaster: '', originCountry: '', process: '' });
  };

  const handlePublishEvent = async () => {
    if (window.confirm('Are you sure you want to publish this event? This will finalize all results and award points.')) {
      try {
        await publishEvent(event._id);
      } catch (error) {
        console.error('Failed to publish event:', error);
        alert('Failed to publish event. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <div className="flex items-center">
            <Coffee className="w-12 h-12 mr-4 text-brand-red" />
            <div>
              <h1 className="text-2xl font-bold text-brand-red">{event.name}</h1>
              <p className="text-brand-blue">Event Management Dashboard</p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex flex-wrap gap-2 text-sm text-brand-blue">
            <div className="flex items-center bg-brand-red-secondary px-3 py-1 rounded">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(event.startTs).toLocaleString()}
            </div>
            <div className="flex items-center bg-brand-red-secondary px-3 py-1 rounded">
              <MapPin className="w-4 h-4 mr-1" />
              {event.location}
            </div>
            <div className="flex items-center bg-brand-red-secondary px-3 py-1 rounded">
              <Users className="w-4 h-4 mr-1" />
              {event.coffees?.length || 0} Coffees
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-brand-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-red">Event Coffees</h2>
              <button
                onClick={() => document.getElementById('add-coffee-form').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center px-4 py-2 bg-brand-red text-brand-white rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Coffee
              </button>
            </div>

            {event.coffees && event.coffees.length > 0 ? (
              <div className="space-y-4">
                {event.coffees.map((coffee) => (
                  <div key={coffee._id} className="border border-brand-blue rounded-lg p-4">
                    {editingCoffee && editingCoffee._id === coffee._id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editingCoffee.name}
                            onChange={(e) => setEditingCoffee({...editingCoffee, name: e.target.value})}
                            className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                            placeholder="Coffee Name"
                          />
                          <input
                            type="text"
                            value={editingCoffee.roaster}
                            onChange={(e) => setEditingCoffee({...editingCoffee, roaster: e.target.value})}
                            className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                            placeholder="Roaster"
                          />
                          <input
                            type="text"
                            value={editingCoffee.originCountry}
                            onChange={(e) => setEditingCoffee({...editingCoffee, originCountry: e.target.value})}
                            className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                            placeholder="Origin Country"
                          />
                          <select
                            value={editingCoffee.process}
                            onChange={(e) => setEditingCoffee({...editingCoffee, process: e.target.value})}
                            className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                          >
                            <option value="">Process</option>
                            <option value="washed">Washed</option>
                            <option value="honey">Honey</option>
                            <option value="natural">Natural</option>
                            <option value="experimental">Experimental</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateCoffee(coffee._id)}
                            className="px-3 py-1 bg-brand-red text-brand-white rounded hover:bg-brand-red-secondary transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCoffee(null)}
                            className="px-3 py-1 bg-brand-blue text-brand-red rounded hover:bg-brand-red-secondary transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-brand-red">Coffee {coffee.label}: {coffee.name}</h3>
                          <p className="text-sm text-brand-blue">{coffee.roaster} • {coffee.originCountry} • {coffee.process}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCoffee({...coffee})}
                            className="p-2 text-brand-red hover:bg-brand-red-secondary rounded-full"
                            title="Edit coffee"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeCoffee(event._id, coffee._id)}
                            className="p-2 text-brand-red hover:bg-brand-red-secondary rounded-full"
                            title="Remove coffee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-brand-blue">
                <Coffee className="w-12 h-12 mx-auto mb-2" />
                <p>No coffees added yet</p>
              </div>
            )}

            {/* Add Coffee Form */}
            <div id="add-coffee-form" className="mt-6 pt-6 border-t border-brand-blue">
              <h3 className="text-lg font-bold text-brand-red mb-3">Add New Coffee</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCoffee.name}
                  onChange={(e) => setNewCoffee({...newCoffee, name: e.target.value})}
                  className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="Coffee Name"
                />
                <input
                  type="text"
                  value={newCoffee.roaster}
                  onChange={(e) => setNewCoffee({...newCoffee, roaster: e.target.value})}
                  className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="Roaster"
                />
                <input
                  type="text"
                  value={newCoffee.originCountry}
                  onChange={(e) => setNewCoffee({...newCoffee, originCountry: e.target.value})}
                  className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="Origin Country"
                />
                <select
                  value={newCoffee.process}
                  onChange={(e) => setNewCoffee({...newCoffee, process: e.target.value})}
                  className="p-2 border border-brand-red rounded focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="">Process</option>
                  <option value="washed">Washed</option>
                  <option value="honey">Honey</option>
                  <option value="natural">Natural</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
              <button
                onClick={handleAddCoffee}
                className="mt-3 w-full md:w-auto px-4 py-2 bg-brand-red text-brand-white rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Coffee
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-brand-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-brand-red mb-4">Event Controls</h2>
            
            <div className="space-y-4">
              <div className="bg-brand-blue p-4 rounded-lg">
                <h3 className="font-semibold text-brand-red mb-2">Event Status</h3>
                <div className="flex items-center">
                  {event.published ? (
                    <span className="bg-brand-blue text-brand-red px-3 py-1 rounded-full text-sm border border-brand-red">
                      Published
                    </span>
                  ) : (
                    <span className="bg-brand-red text-brand-white px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-brand-blue p-4 rounded-lg">
                <h3 className="font-semibold text-brand-red mb-2">Actions</h3>
                <div className="space-y-3">
                  {!event.published && (
                    <button
                      onClick={handlePublishEvent}
                      disabled={event.coffees?.length === 0}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        event.coffees?.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-brand-red text-brand-white hover:bg-brand-red-secondary'
                      }`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish Results
                    </button>
                  )}
                  
                  <button className="w-full px-4 py-2 bg-brand-blue text-brand-red rounded-lg hover:bg-brand-red-secondary transition-colors font-medium">
                    Download Results
                  </button>
                  
                  <button className="w-full px-4 py-2 bg-brand-blue text-brand-red rounded-lg hover:bg-brand-red-secondary transition-colors font-medium">
                    Send Reminders
                  </button>
                </div>
              </div>
              
              <div className="bg-brand-blue p-4 rounded-lg">
                <h3 className="font-semibold text-brand-red mb-2">Event Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-blue">Total Coffees:</span>
                    <span className="font-medium text-brand-red">{event.coffees?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-blue">Participants:</span>
                    <span className="font-medium text-brand-red">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-blue">Avg. Rating:</span>
                    <span className="font-medium text-brand-red">N/A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAdmin;