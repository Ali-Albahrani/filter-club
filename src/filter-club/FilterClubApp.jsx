import React, { useState, useEffect } from 'react';
import { Coffee, Users, Trophy, BarChart3, Plus, Eye, EyeOff, Crown } from 'lucide-react';
import SetupView from './SetupView';
import VotingView from './VotingView';
import DashboardView from './DashboardView';

const FilterClubApp = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [votes, setVotes] = useState([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('filterClubSessions') || '[]');
    setSessions(savedSessions);
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('filterClubSessions', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = (sessionData) => {
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...sessionData
    };
    setCurrentSession(newSession);
    setVotes([]);
    setVotingOpen(true);
    setResultsRevealed(false);
    setCurrentView('voting');
  };

  const submitVote = (voteData) => {
    setVotes(prev => {
      const existingVoteIndex = prev.findIndex(v => v.member === voteData.member);
      let updatedVotes;
      if (existingVoteIndex >= 0) {
        updatedVotes = [...prev];
        updatedVotes[existingVoteIndex] = voteData;
      } else {
        updatedVotes = [...prev, voteData];
      }
      // Auto-close voting if everyone has voted
      if (updatedVotes.length === currentSession?.members.length) {
        setVotingOpen(false);
      }
      return updatedVotes;
    });
  };

  const calculateResults = () => {
    if (!currentSession || votes.length === 0) return [];
    const scores = {};
    currentSession.coffees.forEach(coffee => {
      scores[coffee.name] = {
        score: 0,
        name: coffee.name,
        roaster: coffee.roaster,
        country: coffee.country
      };
    });
    votes.forEach(vote => {
      if (vote.first && scores[vote.first]) scores[vote.first].score += 3;
      if (vote.second && scores[vote.second]) scores[vote.second].score += 2;
      if (vote.third && scores[vote.third]) scores[vote.third].score += 1;
    });
    return Object.values(scores).sort((a, b) => b.score - a.score);
  };

  const finishSession = () => {
    if (!currentSession) return;
    const results = calculateResults();
    const completedSession = {
      ...currentSession,
      votes: votes,
      results: results,
      completed: true
    };
    setSessions(prev => [...prev, completedSession]);
    setCurrentSession(null);
    setVotes([]);
    setVotingOpen(false);
    setResultsRevealed(false);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {currentView === 'setup' && (
        <SetupView createNewSession={createNewSession} />
      )}
      {currentView === 'voting' && (
        <VotingView
          currentSession={currentSession}
          votes={votes}
          votingOpen={votingOpen}
          setVotingOpen={setVotingOpen}
          resultsRevealed={resultsRevealed}
          setResultsRevealed={setResultsRevealed}
          submitVote={submitVote}
          finishSession={finishSession}
          calculateResults={calculateResults}
        />
      )}
      {currentView === 'dashboard' && (
        <DashboardView
          sessions={sessions}
          setSessions={setSessions}
          setCurrentView={setCurrentView}
        />
      )}
      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-white rounded-full shadow-lg p-2 flex space-x-2">
          <button
            onClick={() => setCurrentView('setup')}
            className={`p-3 rounded-full transition-colors ${
              currentView === 'setup' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('voting')}
            className={`p-3 rounded-full transition-colors ${
              currentView === 'voting' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            disabled={!currentSession}
          >
            <Coffee className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`p-3 rounded-full transition-colors ${
              currentView === 'dashboard' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterClubApp; 