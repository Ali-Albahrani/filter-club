import React, { useState, useEffect } from 'react';
import { Coffee, Users, Trophy, BarChart3, Plus, Eye, EyeOff, Crown, LogIn, UserPlus } from 'lucide-react';
import SetupView from './SetupView';
import EventList from './EventList';
import EventAdmin from './EventAdmin';
import CuppingView from './CuppingView';
import ResultsView from './ResultsView';
import Leaderboard from './Leaderboard';
import apiClient from '../utils/apiClient';
import { useAppContext } from './AppContext';

const FilterClubApp = () => {
  const { 
    state, 
    setCurrentView, 
    setUser, 
    setToken, 
    setEvents, 
    setCurrentSession, 
    setCurrentEvent, 
    setSessionResults, 
    setLeaderboard,
    setLoading,
    setError,
    logout,
    addEvent,
    updateCurrentSession
  } = useAppContext();

  const [loginView, setLoginView] = useState('login'); // 'login' or 'signup'
  const [currentView, setCurrentViewLocal] = useState('eventList');

  // Update local currentView when context changes
  useEffect(() => {
    setCurrentViewLocal(currentView);
  }, [currentView]);

  // Load events and leaderboard data
  useEffect(() => {
    if (state.token) {
      loadEvents();
      loadLeaderboard();
    }
  }, [state.token]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.events.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiClient.leaderboard.get();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Auth functions
  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await apiClient.auth.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('eventList');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await apiClient.auth.signup(name, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('eventList');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const appLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    setCurrentView('eventList');
  };

  // Event functions
  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      const newEvent = await apiClient.events.create(eventData);
      addEvent(newEvent);
      setCurrentView('eventAdmin');
      setCurrentEvent(newEvent);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      setLoading(true);
      const session = await apiClient.sessions.join(eventId);
      setCurrentSession(session);
      
      // Load the full event details
      const eventDetails = await apiClient.events.get(eventId);
      setCurrentEvent(eventDetails);
      
      setCurrentView('cupping');
    } catch (err) {
      console.error('Error joining event:', err);
      setError(err.message || 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (sessionId, coffeeId, score) => {
    try {
      const result = await apiClient.ratings.submit(sessionId, { coffeeId, score });
      // Update local session data
      updateCurrentSession({
        ratings: [
          ...state.currentSession.ratings.filter(r => r.coffeeId !== coffeeId),
          { coffeeId, score }
        ]
      });
      return result;
    } catch (err) {
      console.error('Error submitting rating:', err);
      throw err;
    }
  };

  const submitGuess = async (sessionId, coffeeId, guessedOriginCountry, guessedProcess) => {
    try {
      const result = await apiClient.guesses.submit(sessionId, { 
        coffeeId, 
        guessedOriginCountry, 
        guessedProcess 
      });
      // Update local session data
      updateCurrentSession({
        guesses: [
          ...state.currentSession.guesses.filter(g => g.coffeeId !== coffeeId),
          { coffeeId, guessedOriginCountry, guessedProcess }
        ]
      });
      return result;
    } catch (err) {
      console.error('Error submitting guess:', err);
      throw err;
    }
  };

  const finishSession = async () => {
    // In this implementation, we'll just navigate back to event list
    setCurrentView('eventList');
  };

  const loadSessionResults = async (sessionId) => {
    try {
      setLoading(true);
      const results = await apiClient.sessions.getResults(sessionId);
      setSessionResults(results);
      setCurrentView('results');
    } catch (err) {
      console.error('Error loading session results:', err);
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const downloadSpreadsheet = async (sessionId) => {
    try {
      setLoading(true);
      const response = await apiClient.documents.getIndividualResultsSpreadsheet(sessionId);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download spreadsheet');
      }
    } catch (err) {
      console.error('Error downloading spreadsheet:', err);
      setError(err.message || 'Failed to download spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (sessionId) => {
    try {
      setLoading(true);
      const response = await apiClient.documents.getIndividualResultsPDF(sessionId);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download PDF');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(err.message || 'Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const updateCoffee = async (eventId, coffeeId, coffeeData) => {
    try {
      setLoading(true);
      await apiClient.coffees.update(eventId, coffeeId, coffeeData);
      // Refresh events list
      loadEvents();
    } catch (err) {
      console.error('Error updating coffee:', err);
      setError(err.message || 'Failed to update coffee');
    } finally {
      setLoading(false);
    }
  };

  const addCoffee = async (eventId, coffeeData) => {
    try {
      setLoading(true);
      await apiClient.coffees.add(eventId, coffeeData);
      // Refresh events list
      loadEvents();
    } catch (err) {
      console.error('Error adding coffee:', err);
      setError(err.message || 'Failed to add coffee');
    } finally {
      setLoading(false);
    }
  };

  const removeCoffee = async (eventId, coffeeId) => {
    try {
      setLoading(true);
      await apiClient.coffees.delete(eventId, coffeeId);
      // Refresh events list
      loadEvents();
    } catch (err) {
      console.error('Error removing coffee:', err);
      setError(err.message || 'Failed to remove coffee');
    } finally {
      setLoading(false);
    }
  };

  const publishEvent = async (eventId) => {
    try {
      setLoading(true);
      await apiClient.results.publish(eventId);
      // Refresh events list
      loadEvents();
      // Navigate back to event list
      setCurrentView('eventList');
    } catch (err) {
      console.error('Error publishing event:', err);
      setError(err.message || 'Failed to publish event');
    } finally {
      setLoading(false);
    }
  };

  // Handle view changes
  const backToEventList = () => {
    setCurrentView('eventList');
  };

  return (
    <div className="min-h-screen pb-28 bg-brand-white">
      {state.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brand-white p-6 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-brand-red">Loading...</p>
          </div>
        </div>
      )}

      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-4 right-4 z-50">
          {state.error}
          <button className="ml-4" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Authentication views - shown when not logged in */}
      {!state.user && (
        <div className="max-w-md mx-auto p-6 bg-brand-white rounded-lg shadow-md mt-20">
          <div className="text-center mb-8">
            <Coffee className="w-16 h-16 mx-auto text-brand-red mb-4" />
            <h1 className="text-2xl font-bold text-brand-red">Disco Spoons</h1>
            <p className="text-brand-blue">Coffee Cupping Platform</p>
          </div>

          <div className="flex border-b mb-6">
            <button
              onClick={() => setLoginView('login')}
              className={`py-2 px-4 font-medium ${
                loginView === 'login'
                  ? 'text-brand-red border-b-2 border-brand-red'
                  : 'text-brand-blue hover:text-brand-red'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setLoginView('signup')}
              className={`py-2 px-4 font-medium ${
                loginView === 'signup'
                  ? 'text-brand-red border-b-2 border-brand-red'
                  : 'text-brand-blue hover:text-brand-red'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Sign Up
            </button>
          </div>

          {loginView === 'login' ? (
            <LoginForm onLogin={login} loading={state.loading} />
          ) : (
            <SignupForm onSignup={signup} loading={state.loading} />
          )}
        </div>
      )}

      {/* Main application views - shown when logged in */}
      {state.user && (
        <>
          {/* Main Content */}
          {currentView === 'eventList' && (
            <EventList 
              events={state.events} 
              user={state.user} 
              joinEvent={joinEvent} 
            />
          )}

          {currentView === 'setup' && (
            <SetupView 
              createEvent={createEvent}
              user={state.user}
            />
          )}

          {currentView === 'eventAdmin' && state.currentEvent && (
            <EventAdmin
              event={state.currentEvent}
              updateCoffee={updateCoffee}
              addCoffee={addCoffee}
              removeCoffee={removeCoffee}
              publishEvent={publishEvent}
              user={state.user}
            />
          )}

          {currentView === 'cupping' && state.currentEvent && state.currentSession && (
            <CuppingView
              currentSession={state.currentSession}
              event={state.currentEvent}
              ratings={state.currentSession.ratings || []}
              guesses={state.currentSession.guesses || []}
              submitRating={submitRating}
              submitGuess={submitGuess}
              finishSession={finishSession}
            />
          )}

          {currentView === 'results' && state.sessionResults && state.currentEvent && (
            <ResultsView
              sessionResults={state.sessionResults}
              event={state.currentEvent}
              user={state.user}
              downloadSpreadsheet={downloadSpreadsheet}
              downloadPDF={downloadPDF}
              backToEventList={backToEventList}
            />
          )}

          {currentView === 'leaderboard' && (
            <Leaderboard
              leaderboardData={state.leaderboardData}
              events={state.events}
            />
          )}

          {/* Navigation */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-brand-white rounded-full shadow-lg p-2 flex space-x-2">
              <button
                onClick={() => setCurrentView('eventList')}
                className={`p-3 rounded-full transition-colors ${
                  currentView === 'eventList' ? 'bg-brand-red text-brand-white' : 'text-brand-red hover:bg-brand-red-secondary'
                }`}
              >
                <Coffee className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentView('setup')}
                className={`p-3 rounded-full transition-colors ${
                  currentView === 'setup' ? 'bg-brand-red text-brand-white' : 'text-brand-red hover:bg-brand-red-secondary'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className={`p-3 rounded-full transition-colors ${
                  currentView === 'leaderboard' ? 'bg-brand-red text-brand-white' : 'text-brand-red hover:bg-brand-red-secondary'
                }`}
              >
                <Trophy className="w-5 h-5" />
              </button>
              <button
                onClick={appLogout}
                className="p-3 rounded-full text-brand-red hover:bg-brand-red-secondary transition-colors"
              >
                <LogIn className="w-5 h-5 transform rotate-180" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-red mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-brand-blue rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-brand-red mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-brand-blue rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-red text-brand-white py-3 px-4 rounded-lg hover:bg-brand-red-secondary transition-colors font-medium disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Signup Form Component
const SignupForm = ({ onSignup, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignup(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-red mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-brand-blue rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-red mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-brand-blue rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-brand-red mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-brand-blue rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-red text-brand-white py-3 px-4 rounded-lg hover:bg-brand-red-secondary transition-colors font-medium disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default FilterClubApp; 