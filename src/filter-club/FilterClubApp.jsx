import React, { useState, useEffect } from 'react';
import { Coffee, Users, Trophy, BarChart3, Plus, Eye, EyeOff, Crown } from 'lucide-react';
import SetupView from './SetupView';
import VotingView from './VotingView';
import DashboardView from './DashboardView';

const API_URL = 'http://localhost:5000/api/sessions';

const FilterClubApp = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [votes, setVotes] = useState([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(false);

  // Load sessions from backend on mount
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSessions(data));
  }, []);

  // Create a new session in backend
  const createNewSession = async (sessionData) => {
    const newSession = {
      date: new Date().toISOString().split('T')[0],
      ...sessionData
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    });
    const created = await res.json();
    setCurrentSession(created);
    setVotes([]);
    setVotingOpen(true);
    setResultsRevealed(false);
    setCurrentView('voting');
    // Refresh sessions list
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSessions(data));
  };

  // Submit a vote (update session in backend)
  const submitVote = async (voteData) => {
    const updatedVotes = [...(currentSession.votes || [])];
    const existingVoteIndex = updatedVotes.findIndex(v => v.member === voteData.member);
    if (existingVoteIndex >= 0) {
      updatedVotes[existingVoteIndex] = voteData;
    } else {
      updatedVotes.push(voteData);
    }
    // Auto-close voting if everyone has voted
    if (updatedVotes.length === currentSession.members.length) {
      setVotingOpen(false);
    }
    // Update session in backend
    const updatedSession = { ...currentSession, votes: updatedVotes };
    const res = await fetch(`${API_URL}/${currentSession._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSession)
    });
    const saved = await res.json();
    setCurrentSession(saved);
    setVotes(saved.votes || []);
    // Refresh sessions list
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSessions(data));
  };

  // Calculate results (client-side)
  const calculateResults = () => {
    if (!currentSession || (currentSession.votes || []).length === 0) return [];
    const scores = {};
    currentSession.coffees.forEach(coffee => {
      scores[coffee.name] = {
        score: 0,
        name: coffee.name,
        roaster: coffee.roaster,
        country: coffee.country,
        varietals: coffee.varietals,
        processingMethod: coffee.processingMethod
      };
    });
    (currentSession.votes || []).forEach(vote => {
      if (vote.rankings && vote.rankings.length > 0) {
        if (vote.rankings[0] && scores[vote.rankings[0]]) scores[vote.rankings[0]].score += 3;
        if (vote.rankings[1] && scores[vote.rankings[1]]) scores[vote.rankings[1]].score += 2;
        if (vote.rankings[2] && scores[vote.rankings[2]]) scores[vote.rankings[2]].score += 1;
      }
    });
    return Object.values(scores).sort((a, b) => b.score - a.score);
  };

  // Finish session (update session in backend)
  const finishSession = async () => {
    if (!currentSession) return;
    const results = calculateResults();
    const completedSession = {
      ...currentSession,
      votes: currentSession.votes || [],
      results: results,
      completed: true
    };
    const res = await fetch(`${API_URL}/${currentSession._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completedSession)
    });
    const saved = await res.json();
    setCurrentSession(null);
    setVotes([]);
    setVotingOpen(false);
    setResultsRevealed(false);
    setCurrentView('dashboard');
    // Refresh sessions list
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSessions(data));
  };

  // Delete a session
  const deleteSession = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    // Refresh sessions list
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSessions(data));
  };

  return (
    <div className="min-h-screen bg-brand-white">
      {currentView === 'setup' && (
        <SetupView createNewSession={createNewSession} />
      )}
      {currentView === 'voting' && (
        <VotingView
          currentSession={currentSession}
          votes={currentSession?.votes || []}
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
          deleteSession={deleteSession}
        />
      )}
      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-brand-white rounded-full shadow-lg p-2 flex space-x-2">
          <button
            onClick={() => setCurrentView('setup')}
            className={`p-3 rounded-full transition-colors ${
              currentView === 'setup' ? 'bg-brand-red text-brand-white' : 'text-brand-red hover:bg-brand-red-secondary'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('voting')}
            className={`p-3 rounded-full transition-colors ${
              currentView === 'voting' ? 'bg-brand-red text-brand-white' : 'text-brand-red hover:bg-brand-red-secondary'
            }`}
            disabled={!currentSession}
          >
            <Coffee className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`p-3 rounded-full transition-colors ${
              currentView === 'dashboard' ? 'bg-brand-red text-brand-white' : 'text-brand-red hover:bg-brand-red-secondary'
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