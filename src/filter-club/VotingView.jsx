import React, { useState } from 'react';
import { Coffee, Users, Trophy, Plus, Eye, EyeOff, Crown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  const [coffeeOrder, setCoffeeOrder] = useState(currentSession?.coffees.map(c => c.name) || []);

  React.useEffect(() => {
    setCoffeeOrder(currentSession?.coffees.map(c => c.name) || []);
  }, [currentSession]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(coffeeOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setCoffeeOrder(newOrder);
  };

  const handleVoteSubmit = () => {
    if (!selectedMember) {
      alert('Please select a member');
      return;
    }
    if (coffeeOrder.length !== currentSession?.coffees.length) {
      alert('Please rank all coffees');
      return;
    }
    submitVote({
      member: selectedMember,
      rankings: coffeeOrder,
      timestamp: new Date().toISOString()
    });
    setSelectedMember('');
    setCoffeeOrder(currentSession?.coffees.map(c => c.name) || []);
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
                Drag to Rank Coffees
              </label>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="coffees">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {coffeeOrder.map((coffeeName, idx) => {
                        const coffee = currentSession?.coffees.find(c => c.name === coffeeName);
                        return (
                          <Draggable key={coffeeName} draggableId={coffeeName} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center space-x-4 p-3 rounded border bg-white shadow-sm ${snapshot.isDragging ? 'bg-amber-50' : ''}`}
                              >
                                <span className="font-bold w-6">{idx + 1}</span>
                                <span className="flex-1">{coffee.name} - {coffee.roaster}</span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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