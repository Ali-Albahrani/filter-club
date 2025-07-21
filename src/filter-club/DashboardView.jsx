import React, { useState } from 'react';
import { Trophy, BarChart3, Crown } from 'lucide-react';

const DashboardView = ({ sessions, setSessions, setCurrentView }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const allCoffees = sessions.flatMap(s => s.results || []);
  const roasterStats = {};
  const countryStats = {};
  allCoffees.forEach(result => {
    if (!roasterStats[result.roaster]) {
      roasterStats[result.roaster] = { totalScore: 0, appearances: 0, wins: 0 };
    }
    roasterStats[result.roaster].totalScore += result.score;
    roasterStats[result.roaster].appearances += 1;
    if (!countryStats[result.country]) {
      countryStats[result.country] = { totalScore: 0, appearances: 0, wins: 0 };
    }
    countryStats[result.country].totalScore += result.score;
    countryStats[result.country].appearances += 1;
  });
  sessions.forEach(session => {
    if (session.results && session.results.length > 0) {
      const winner = session.results[0];
      if (roasterStats[winner.roaster]) {
        roasterStats[winner.roaster].wins += 1;
      }
      if (countryStats[winner.country]) {
        countryStats[winner.country].wins += 1;
      }
    }
  });
  const topRoasters = Object.entries(roasterStats)
    .map(([roaster, stats]) => ({
      roaster,
      avgScore: stats.totalScore / stats.appearances,
      ...stats
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);
  const topCountries = Object.entries(countryStats)
    .map(([country, stats]) => ({
      country,
      avgScore: stats.totalScore / stats.appearances,
      ...stats
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);
  // Leaderboard for varietals
  const varietalStats = {};
  allCoffees.forEach(result => {
    if (result.varietals) {
      result.varietals.split(',').map(v => v.trim()).forEach(varietal => {
        if (!varietalStats[varietal]) {
          varietalStats[varietal] = { totalScore: 0, appearances: 0, wins: 0 };
        }
        varietalStats[varietal].totalScore += result.score;
        varietalStats[varietal].appearances += 1;
      });
    }
  });
  sessions.forEach(session => {
    if (session.results && session.results.length > 0) {
      const winner = session.results[0];
      if (winner.varietals) {
        winner.varietals.split(',').map(v => v.trim()).forEach(varietal => {
          if (varietalStats[varietal]) {
            varietalStats[varietal].wins += 1;
          }
        });
      }
    }
  });
  const topVarietals = Object.entries(varietalStats)
    .map(([varietal, stats]) => ({
      varietal,
      avgScore: stats.totalScore / stats.appearances,
      ...stats
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  // Leaderboard for processing methods
  const processStats = {};
  allCoffees.forEach(result => {
    if (result.processingMethod) {
      result.processingMethod.split(',').map(p => p.trim()).forEach(process => {
        if (!processStats[process]) {
          processStats[process] = { totalScore: 0, appearances: 0, wins: 0 };
        }
        processStats[process].totalScore += result.score;
        processStats[process].appearances += 1;
      });
    }
  });
  sessions.forEach(session => {
    if (session.results && session.results.length > 0) {
      const winner = session.results[0];
      if (winner.processingMethod) {
        winner.processingMethod.split(',').map(p => p.trim()).forEach(process => {
          if (processStats[process]) {
            processStats[process].wins += 1;
          }
        });
      }
    }
  });
  const topProcesses = Object.entries(processStats)
    .map(([process, stats]) => ({
      process,
      avgScore: stats.totalScore / stats.appearances,
      ...stats
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);
  const deleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };
  if (selectedSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedSession(null)}
            className="text-amber-600 hover:text-amber-700 font-medium mb-4"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedSession.name}</h1>
            <p className="text-gray-600">{selectedSession.date} • {selectedSession.votes?.length || 0} votes</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-center">🏆 Full Scoreboard</h2>
          <div className="space-y-4">
            {selectedSession.results?.map((result, index) => (
              <div key={result.name} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'border-yellow-400 bg-yellow-50' :
                index === 1 ? 'border-gray-400 bg-gray-50' :
                index === 2 ? 'border-orange-400 bg-orange-50' :
                'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {index === 0 && <Crown className="w-6 h-6 text-yellow-500 mr-2" />}
                    <div>
                      <span className="font-medium text-lg">
                        #{index + 1} {result.name}
                      </span>
                      <div className="text-sm text-gray-600">
                        {result.roaster} • {result.country}
                      </div>
                      {result.varietals && (
                        <div className="text-xs text-gray-500">Varietals: {result.varietals}</div>
                      )}
                      {result.processingMethod && (
                        <div className="text-xs text-gray-500">Processing: {result.processingMethod}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-700">
                    {result.score} pts
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </div>
        {selectedSession.votes && selectedSession.votes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Individual Votes</h2>
            <div className="space-y-3">
              {selectedSession.votes.map((vote, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800 mb-2">{vote.member}</div>
                  <div className="text-sm text-gray-600">
                    🥇 {vote.first} • 🥈 {vote.second} • 🥉 {vote.third}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-amber-600" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Filter Club Analytics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{sessions.length}</div>
          <div className="text-gray-600">Total Sessions</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{Object.keys(roasterStats).length}</div>
          <div className="text-gray-600">Roasters Tasted</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{Object.keys(countryStats).length}</div>
          <div className="text-gray-600">Countries</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {topRoasters.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Roasters</h2>
            <div className="space-y-3">
              {topRoasters.map((roaster, index) => (
                <div key={roaster.roaster} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{roaster.roaster}</div>
                      <div className="text-sm text-gray-600">
                        {roaster.appearances} coffees • {roaster.wins} wins
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-600">
                      {roaster.avgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {topCountries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Countries</h2>
            <div className="space-y-3">
              {topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{country.country}</div>
                      <div className="text-sm text-gray-600">
                        {country.appearances} coffees • {country.wins} wins
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {country.avgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {topVarietals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Varietals</h2>
            <div className="space-y-3">
              {topVarietals.map((varietal, index) => (
                <div key={varietal.varietal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{varietal.varietal}</div>
                      <div className="text-sm text-gray-600">
                        {varietal.appearances} coffees • {varietal.wins} wins
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {varietal.avgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {topProcesses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Processes</h2>
            <div className="space-y-3">
              {topProcesses.map((process, index) => (
                <div key={process.process} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{process.process}</div>
                      <div className="text-sm text-gray-600">
                        {process.appearances} coffees • {process.wins} wins
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {process.avgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No sessions yet. Start your first cupping session!</p>
        ) : (
          <div className="space-y-4">
            {sessions.slice(-5).reverse().map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{session.name}</h3>
                    <p className="text-sm text-gray-600">{session.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">
                      {session.votes?.length || 0} votes
                    </div>
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      View Details →
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {session.results && session.results.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Winner: </span>
                    <span className="text-amber-600">{session.results[0].name}</span>
                    <span className="text-gray-600"> by {session.results[0].roaster} ({session.results[0].score} pts)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentView('setup')}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
};

export default DashboardView; 