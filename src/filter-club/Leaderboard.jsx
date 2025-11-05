import React, { useState } from 'react';
import { Trophy, Users, Star, Calendar } from 'lucide-react';

const Leaderboard = ({ leaderboardData, events }) => {
  const [timeFilter, setTimeFilter] = useState('all'); // all, monthly, quarterly

  // Filter events based on selected time range if needed
  // In a real implementation, you'd filter events by date
  const filteredEvents = events;

  // Prepare leaderboard data with additional info
  const processedLeaderboard = leaderboardData.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    user: entry.userId || { name: 'Anonymous', email: 'anonymous' }
  }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-brand-red" />
        <h1 className="text-2xl font-bold text-brand-red mb-2">Disco Spoons Leaderboard</h1>
        <p className="text-brand-blue">Rankings across all cupping events</p>
      </div>

      <div className="bg-brand-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-red mb-4 md:mb-0">Global Rankings</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeFilter === 'all' 
                  ? 'bg-brand-red text-brand-white' 
                  : 'bg-brand-blue text-brand-red hover:bg-brand-red-secondary'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeFilter === 'monthly' 
                  ? 'bg-brand-red text-brand-white' 
                  : 'bg-brand-blue text-brand-red hover:bg-brand-red-secondary'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('quarterly')}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeFilter === 'quarterly' 
                  ? 'bg-brand-red text-brand-white' 
                  : 'bg-brand-blue text-brand-red hover:bg-brand-red-secondary'
              }`}
            >
              This Quarter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-red">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-red uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-red uppercase tracking-wider">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-red uppercase tracking-wider">Total Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-red uppercase tracking-wider">Monthly Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-red uppercase tracking-wider">Events Participated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue">
              {processedLeaderboard.map((entry) => (
                <tr key={entry._id} className="hover:bg-brand-red-secondary transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500 mr-2" />}
                      {entry.rank === 2 && <Trophy className="w-5 h-5 text-gray-300 mr-2" />}
                      {entry.rank === 3 && <Trophy className="w-5 h-5 text-amber-800 mr-2" />}
                      <span className="font-bold text-lg text-brand-red">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-red">{entry.user.name || entry.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-red font-bold">{entry.totalPoints}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-red">{entry.monthlyPoints || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-red">TBD</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Trophy className="w-5 h-5 text-brand-red mr-2" />
            <h2 className="text-xl font-bold text-brand-red">Recent Events</h2>
          </div>
          
          {filteredEvents && filteredEvents.length > 0 ? (
            <div className="space-y-3">
              {filteredEvents.slice(0, 5).map(event => (
                <div key={event._id} className="border border-brand-blue rounded-lg p-4 hover:shadow-md">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-brand-red">{event.name}</h3>
                      <div className="text-sm text-brand-blue flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(event.startTs).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-brand-blue">Coffees: {event.coffees?.length || 0}</div>
                      <div className="text-sm text-brand-blue">Published: {event.published ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-brand-blue">
              No recent events
            </div>
          )}
        </div>

        <div className="bg-brand-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Star className="w-5 h-5 text-brand-red mr-2" />
            <h2 className="text-xl font-bold text-brand-red">Your Performance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="text-brand-blue">Total Points</div>
              <div className="text-brand-red font-bold">0</div>
            </div>
            <div className="flex justify-between">
              <div className="text-brand-blue">Events Participated</div>
              <div className="text-brand-red font-bold">0</div>
            </div>
            <div className="flex justify-between">
              <div className="text-brand-blue">Correct Origin Guesses</div>
              <div className="text-brand-red font-bold">0%</div>
            </div>
            <div className="flex justify-between">
              <div className="text-brand-blue">Correct Process Guesses</div>
              <div className="text-brand-red font-bold">0%</div>
            </div>
            <div className="flex justify-between">
              <div className="text-brand-blue">Perfect Scores (10/10)</div>
              <div className="text-brand-red font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;