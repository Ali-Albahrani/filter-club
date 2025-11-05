import React, { useState, useEffect } from 'react';
import { Coffee, Users, Calendar, MapPin, Trophy } from 'lucide-react';

const EventList = ({ events, user, joinEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'upcoming') {
      matchesFilter = new Date(event.startTs) >= new Date();
    } else if (filter === 'past') {
      matchesFilter = new Date(event.startTs) < new Date();
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleJoinEvent = async (eventId) => {
    try {
      await joinEvent(eventId);
    } catch (error) {
      console.error('Failed to join event:', error);
      // Handle error appropriately in the UI
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Coffee className="w-12 h-12 mx-auto mb-4 text-brand-red" />
        <h1 className="text-2xl font-bold text-brand-red mb-2">Event Lobby</h1>
        <p className="text-brand-red">Join an upcoming cupping event</p>
      </div>

      <div className="bg-brand-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-brand-red rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
            <Coffee className="w-5 h-5 absolute left-3 top-3.5 text-brand-red" />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' 
                  ? 'bg-brand-red text-brand-white' 
                  : 'bg-brand-blue text-brand-red hover:bg-brand-red-secondary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'upcoming' 
                  ? 'bg-brand-red text-brand-white' 
                  : 'bg-brand-blue text-brand-red hover:bg-brand-red-secondary'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'past' 
                  ? 'bg-brand-red text-brand-white' 
                  : 'bg-brand-blue text-brand-red hover:bg-brand-red-secondary'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="w-16 h-16 mx-auto text-brand-blue mb-4" />
            <h3 className="text-xl font-semibold text-brand-red mb-2">No events found</h3>
            <p className="text-brand-blue">Try changing your search or filter criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => {
              const isUpcoming = new Date(event.startTs) >= new Date();
              const eventDate = new Date(event.startTs).toLocaleString();
              
              return (
                <div 
                  key={event._id} 
                  className="border border-brand-red rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-brand-red mr-2">{event.name}</h3>
                        {!event.published && (
                          <span className="bg-brand-red text-brand-white text-xs px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                        {event.published && (
                          <span className="bg-brand-blue text-brand-red text-xs px-2 py-1 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-brand-blue mt-2 gap-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {eventDate}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.coffees?.length || 0} coffees
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      {isUpcoming && !event.published && (
                        <button
                          onClick={() => handleJoinEvent(event._id)}
                          className="px-4 py-2 bg-brand-red text-brand-white rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
                        >
                          Join Event
                        </button>
                      )}
                      <button
                        onClick={() => window.location.hash = `#event/${event._id}`}
                        className="px-4 py-2 bg-brand-blue text-brand-red rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;