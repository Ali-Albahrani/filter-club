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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleVoteSubmit = async () => {
    setError('');
    setSuccessMessage('');
    if (!selectedMember) {
      setError('Please select a member');
      return;
    }
    if (coffeeOrder.length !== currentSession?.coffees.length) {
      setError('Please rank all coffees');
      return;
    }
    setSubmitting(true);
    try {
      await submitVote({
        member: selectedMember,
        rankings: coffeeOrder,
        timestamp: new Date().toISOString()
      });
      setSelectedMember('');
      setCoffeeOrder(currentSession?.coffees.map(c => c.name) || []);
      setSuccessMessage('Your vote has been submitted!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const voteCount = votes.length;
  const totalMembers = currentSession?.members.length || 0;

  // Map coffee name to blind label (Coffee 1, Coffee 2, ...)
  const coffeeBlindLabels = React.useMemo(() => {
    if (!currentSession?.coffees) return {};
    const map = {};
    currentSession.coffees.forEach((c, i) => {
      map[c.name] = `Coffee ${i + 1}`;
    });
    return map;
  }, [currentSession]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Coffee className="w-12 h-12 mx-auto mb-4 text-brand-red" />
        <h1 className="text-2xl font-bold text-brand-red mb-2">{currentSession?.name}</h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-brand-blue">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {voteCount} of {totalMembers} voted
          </div>
          {votingOpen && (
            <div className="flex items-center text-brand-red">
              <div className="w-2 h-2 bg-brand-red rounded-full mr-2 animate-pulse"></div>
              Voting Open
            </div>
          )}
        </div>
      </div>
      {votingOpen && (
        <div className="bg-brand-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-brand-red">Cast Your Vote</h2>
          {successMessage && <div className="text-green-600 mb-2 animate-fade-in">{successMessage}</div>}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-red mb-2">
                Your Name
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full p-3 border border-brand-blue rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
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
              <label className="block text-sm font-medium text-brand-red mb-2">
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
                                className={`flex items-center space-x-4 p-3 rounded border bg-brand-white shadow-sm ${snapshot.isDragging ? 'bg-brand-red-secondary' : ''}`}
                              >
                                <span className="font-bold w-6 text-brand-red">{idx + 1}</span>
                                <span className="flex-1 text-brand-red">{coffeeBlindLabels[coffeeName]}</span>
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
              className="w-full bg-brand-red text-brand-white py-3 px-4 rounded-lg hover:bg-brand-red-secondary transition-colors font-medium disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      )}
      {/* Admin Controls */}
      <div className="bg-brand-blue rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-brand-red">Session Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVotingOpen(!votingOpen)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              votingOpen 
                ? 'bg-brand-red-secondary text-brand-red hover:bg-brand-red' 
                : 'bg-brand-white text-brand-red hover:bg-brand-red-secondary'
            }`}
          >
            {votingOpen ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {votingOpen ? 'Close Voting' : 'Open Voting'}
          </button>
          <button
            onClick={() => setResultsRevealed(!resultsRevealed)}
            disabled={votingOpen}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-brand-white text-brand-red hover:bg-brand-red-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {resultsRevealed ? 'Hide Results' : 'Reveal Results'}
          </button>
          <button
            onClick={finishSession}
            disabled={votingOpen || voteCount === 0}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-brand-white text-brand-red hover:bg-brand-red-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Finish Session
          </button>
        </div>
      </div>
      {/* Results */}
      {resultsRevealed && !votingOpen && (
        <div className="mt-6 bg-brand-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-center text-brand-red">🏆 Results</h2>
          <div className="space-y-4">
            {calculateResults().map((result, index) => (
              <div key={result.name} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'border-brand-red bg-brand-red-secondary' :
                index === 1 ? 'border-brand-blue bg-brand-blue' :
                index === 2 ? 'border-brand-red-secondary bg-brand-white' :
                'border-brand-blue bg-brand-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {index === 0 && <Crown className="w-6 h-6 text-brand-red mr-2" />}
                    <div>
                      <span className="font-medium text-lg text-brand-red">
                        #{index + 1} {result.name}
                      </span>
                      <div className="text-sm text-brand-blue">
                        {result.roaster} • {result.country}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-brand-red">
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