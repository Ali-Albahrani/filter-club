import React, { useState, useEffect } from 'react';
import { Coffee, Users, Trophy, BarChart3, Plus, Eye, EyeOff, Crown, LogIn, UserPlus } from 'lucide-react';
import SetupView from './SetupView';
import EventList from './EventList';
import EventAdmin from './EventAdmin';
import CuppingView from './CuppingView';
import ResultsView from './ResultsView';
import Leaderboard from './Leaderboard';
import AlertModal from './AlertModal';

// Base API URL - replace with your actual backend API URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FilterClubApp = () => {
  const [currentView, setCurrentView] = useState('eventList');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [events, setEvents] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginView, setLoginView] = useState('login'); // 'login' or 'signup'

  // Load user and token from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Load events and leaderboard data
  useEffect(() => {
    if (token) {
      loadEvents();
      loadLeaderboard();
    }
  }, [token]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load leaderboard');
      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auth functions
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('eventList');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('eventList');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentView('eventList');
  };

  // Event functions
  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }
      
      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setCurrentView('eventAdmin');
      setCurrentEvent(newEvent);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${eventId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join event');
      }
      
      const session = await response.json();
      setCurrentSession(session);
      
      // Load the full event details
      const eventResponse = await fetch(`${API_BASE}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!eventResponse.ok) throw new Error('Failed to load event details');
      const eventDetails = await eventResponse.json();
      setCurrentEvent(eventDetails);
      
      setCurrentView('cupping');
    } catch (err) {
      console.error('Error joining event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (sessionId, coffeeId, score) => {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coffeeId, score })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit rating');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error submitting rating:', err);
      throw err;
    }
  };

  const submitGuess = async (sessionId, coffeeId, guessedOriginCountry, guessedProcess) => {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/guesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coffeeId, guessedOriginCountry, guessedProcess })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit guess');
      }
      
      return await response.json();
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
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load results');
      }
      
      const results = await response.json();
      setSessionResults(results);
      setCurrentView('results');
    } catch (err) {
      console.error('Error loading session results:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSpreadsheet = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/results/spreadsheet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download spreadsheet');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading spreadsheet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/results/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const updateCoffee = async (eventId, coffeeId, coffeeData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${eventId}/coffees/${coffeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coffeeData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update coffee');
      }
      
      // Refresh events list
      loadEvents();
    } catch (err) {
      console.error('Error updating coffee:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCoffee = async (eventId, coffeeData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${eventId}/coffees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coffeeData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add coffee');
      }
      
      // Refresh events list
      loadEvents();
    } catch (err) {
      console.error('Error adding coffee:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeCoffee = async (eventId, coffeeId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${eventId}/coffees/${coffeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove coffee');
      }
      
      // Refresh events list
      loadEvents();
    } catch (err) {
      console.error('Error removing coffee:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const publishEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish event');
      }
      
      // Refresh events list
      loadEvents();
      
      // Navigate back to event list
      setCurrentView('eventList');
    } catch (err) {
      console.error('Error publishing event:', err);
      setError(err.message);
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
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brand-white p-6 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-brand-red">Loading...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-4 right-4 z-50">
          {error}
          <button className="ml-4" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Authentication views - shown when not logged in */}
      {!user && (
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
            <LoginForm onLogin={login} loading={loading} />
          ) : (
            <SignupForm onSignup={signup} loading={loading} />
          )}
        </div>
      )}

      {/* Main application views - shown when logged in */}
      {user && (
        <>
          {/* Main Content */}
          {currentView === 'eventList' && (
            <EventList 
              events={events} 
              user={user} 
              joinEvent={joinEvent} 
            />
          )}

          {currentView === 'setup' && (
            <SetupView 
              createEvent={createEvent}
              user={user}
            />
          )}

          {currentView === 'eventAdmin' && currentEvent && (
            <EventAdmin
              event={currentEvent}
              updateCoffee={updateCoffee}
              addCoffee={addCoffee}
              removeCoffee={removeCoffee}
              publishEvent={publishEvent}
              user={user}
            />
          )}

          {currentView === 'cupping' && currentEvent && currentSession && (
            <CuppingView
              currentSession={currentSession}
              event={currentEvent}
              ratings={currentSession.ratings || []}
              guesses={currentSession.guesses || []}
              submitRating={submitRating}
              submitGuess={submitGuess}
              finishSession={finishSession}
            />
          )}

          {currentView === 'results' && sessionResults && currentEvent && (
            <ResultsView
              sessionResults={sessionResults}
              event={currentEvent}
              user={user}
              downloadSpreadsheet={downloadSpreadsheet}
              downloadPDF={downloadPDF}
              backToEventList={backToEventList}
            />
          )}

          {currentView === 'leaderboard' && (
            <Leaderboard
              leaderboardData={leaderboardData}
              events={events}
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
                onClick={logout}
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