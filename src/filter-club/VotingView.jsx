import React, { useState } from 'react';
import { Coffee, Users, Trophy, Plus, Eye, EyeOff, Crown } from 'lucide-react';

const VotingView = ({
  currentSession,
  votes,
  votingOpen,
  setVotingOpen,
  resultsRevealed,
  setResultsRevealed,
  submitVote,
  finishSession,
  calculateResults
}) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');

  const handleVoteSubmit = () => {
    if (!selectedMember || !first || !second || !third) {
      alert('Please select a member and all three coffee rankings');
      return;
    }
    if (first === second || second === third || first === third) {
      alert('Please select different coffees for each position');
      return;
    }
    submitVote({
      member: selectedMember,
      first,
      second,
      third,
      timestamp: new Date().toISOString()
    });
    setSelectedMember('');
    setFirst('');
    setSecond('');
    setThird('');
    alert('Vote submitted successfully!');
  };

  const voteCount = votes.length;
  const totalMembers = currentSession?.members.length || 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Coffee className="w-12 h-12 mx-auto mb-4 text-amber-600" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentSession?.name}</h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {voteCount} of {totalMembers} voted
          </div>
          {votingOpen && (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Voting Open
            </div>
          )}
        </div>
      </div>
      {votingOpen && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select your name</option>
                {currentSession?.members
                  .filter(member => !votes.some(vote => vote.member === member))
                  .map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🥇 First Place
              </label>
              <select
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select coffee</option>
                {currentSession?.coffees.map(coffee => (
                  <option key={coffee.name} value={coffee.name}>{coffee.name} - {coffee.roaster}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🥈 Second Place
              </label>
              <select
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select coffee</option>
                {currentSession?.coffees
                  .filter(coffee => coffee.name !== first)
                  .map(coffee => (
                    <option key={coffee.name} value={coffee.name}>{coffee.name} - {coffee.roaster}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🥉 Third Place
              </label>
              <select
                value={third}
                onChange={(e) => setThird(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select coffee</option>
                {currentSession?.coffees
                  .filter(coffee => coffee.name !== first && coffee.name !== second)
                  .map(coffee => (
                    <option key={coffee.name} value={coffee.name}>{coffee.name} - {coffee.roaster}</option>
                  ))}
              </select>
            </div>
            <button
              onClick={handleVoteSubmit}
              className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Submit Vote
            </button>
          </div>
        </div>
      )}
      {/* Admin Controls */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-700">Session Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVotingOpen(!votingOpen)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              votingOpen 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {votingOpen ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {votingOpen ? 'Close Voting' : 'Open Voting'}
          </button>
          <button
            onClick={() => setResultsRevealed(!resultsRevealed)}
            disabled={votingOpen}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {resultsRevealed ? 'Hide Results' : 'Reveal Results'}
          </button>
          <button
            onClick={finishSession}
            disabled={votingOpen || voteCount === 0}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Finish Session
          </button>
        </div>
      </div>
      {/* Results */}
      {resultsRevealed && !votingOpen && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">🏆 Results</h2>
          <div className="space-y-4">
            {calculateResults().map((result, index) => (
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
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-700">
                    {result.score} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingView; 