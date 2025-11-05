// AppContext.js - Context for managing global application state

import React, { createContext, useContext, useReducer } from 'react';

// Define initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  events: [],
  currentSession: null,
  currentEvent: null,
  sessionResults: null,
  leaderboardData: [],
  loading: false,
  error: null,
  currentView: 'eventList',
};

// Define action types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  SET_EVENTS: 'SET_EVENTS',
  SET_CURRENT_SESSION: 'SET_CURRENT_SESSION',
  SET_CURRENT_EVENT: 'SET_CURRENT_EVENT',
  SET_SESSION_RESULTS: 'SET_SESSION_RESULTS',
  SET_LEADERBOARD: 'SET_LEADERBOARD',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  REMOVE_EVENT: 'REMOVE_EVENT',
  UPDATE_CURRENT_SESSION: 'UPDATE_CURRENT_SESSION',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case actionTypes.SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    case actionTypes.SET_EVENTS:
      return {
        ...state,
        events: action.payload,
      };
    case actionTypes.SET_CURRENT_SESSION:
      return {
        ...state,
        currentSession: action.payload,
      };
    case actionTypes.SET_CURRENT_EVENT:
      return {
        ...state,
        currentEvent: action.payload,
      };
    case actionTypes.SET_SESSION_RESULTS:
      return {
        ...state,
        sessionResults: action.payload,
      };
    case actionTypes.SET_LEADERBOARD:
      return {
        ...state,
        leaderboardData: action.payload,
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case actionTypes.LOGOUT:
      return {
        ...initialState,
        token: null,
      };
    case actionTypes.ADD_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    case actionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event =>
          event._id === action.payload._id ? action.payload : event
        ),
      };
    case actionTypes.REMOVE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event._id !== action.payload),
      };
    case actionTypes.UPDATE_CURRENT_SESSION:
      return {
        ...state,
        currentSession: { ...state.currentSession, ...action.payload },
      };
    case actionTypes.SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const setUser = (user) => dispatch({ type: actionTypes.SET_USER, payload: user });
  const setToken = (token) => dispatch({ type: actionTypes.SET_TOKEN, payload: token });
  const setEvents = (events) => dispatch({ type: actionTypes.SET_EVENTS, payload: events });
  const setCurrentSession = (session) => dispatch({ type: actionTypes.SET_CURRENT_SESSION, payload: session });
  const setCurrentEvent = (event) => dispatch({ type: actionTypes.SET_CURRENT_EVENT, payload: event });
  const setSessionResults = (results) => dispatch({ type: actionTypes.SET_SESSION_RESULTS, payload: results });
  const setLeaderboard = (leaderboard) => dispatch({ type: actionTypes.SET_LEADERBOARD, payload: leaderboard });
  const setLoading = (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  const setError = (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error });
  const clearError = () => dispatch({ type: actionTypes.CLEAR_ERROR });
  const logout = () => dispatch({ type: actionTypes.LOGOUT });
  const addEvent = (event) => dispatch({ type: actionTypes.ADD_EVENT, payload: event });
  const updateEvent = (event) => dispatch({ type: actionTypes.UPDATE_EVENT, payload: event });
  const removeEvent = (eventId) => dispatch({ type: actionTypes.REMOVE_EVENT, payload: eventId });
  const updateCurrentSession = (updates) => dispatch({ type: actionTypes.UPDATE_CURRENT_SESSION, payload: updates });
  const setCurrentView = (view) => dispatch({ type: actionTypes.SET_CURRENT_VIEW, payload: view });

  const value = {
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
    clearError,
    logout,
    addEvent,
    updateEvent,
    removeEvent,
    updateCurrentSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;