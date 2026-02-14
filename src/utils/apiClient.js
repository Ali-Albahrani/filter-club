// apiClient.js - HTTP client utility for API communication with JWT handling

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a base configuration for API requests
const apiClient = {
  // Get the token from localStorage
  getAuthToken: () => {
    return localStorage.getItem('token');
  },

  // Set up headers with content type and auth token
  getHeaders: (additionalHeaders = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    const token = apiClient.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  // Generic request function
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    
    const config = {
      headers: apiClient.getHeaders(options.headers || {}),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // If the response is unauthorized, redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect to login
        return;
      }
      
      // Try to parse the response as JSON
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like file downloads), return the response object
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
      }
      
      // If the response is not OK, throw an error with the message
      if (!response.ok) {
        const error = new Error(data.message || data.error || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },

  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      return apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    signup: async (name, email, password) => {
      return apiClient.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
    },

    logout: async () => {
      return apiClient.request('/auth/logout', {
        method: 'POST'
      });
    },

    profile: async () => {
      return apiClient.request('/auth/profile', {
        method: 'POST'
      });
    }
  },

  // Event endpoints
  events: {
    getAll: async () => {
      return apiClient.request('/events');
    },

    get: async (id) => {
      return apiClient.request(`/events/${id}`);
    },

    create: async (eventData) => {
      return apiClient.request('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
    },

    update: async (id, eventData) => {
      return apiClient.request(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(eventData)
      });
    },

    delete: async (id) => {
      return apiClient.request(`/events/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Coffee endpoints (nested under events)
  coffees: {
    add: async (eventId, coffeeData) => {
      return apiClient.request(`/events/${eventId}/coffees`, {
        method: 'POST',
        body: JSON.stringify(coffeeData)
      });
    },

    update: async (eventId, coffeeId, coffeeData) => {
      return apiClient.request(`/events/${eventId}/coffees/${coffeeId}`, {
        method: 'PATCH',
        body: JSON.stringify(coffeeData)
      });
    },

    delete: async (eventId, coffeeId) => {
      return apiClient.request(`/events/${eventId}/coffees/${coffeeId}`, {
        method: 'DELETE'
      });
    }
  },

  // Session endpoints
  sessions: {
    join: async (eventId) => {
      return apiClient.request(`/events/${eventId}/sessions`, {
        method: 'POST'
      });
    },

    get: async (sessionId) => {
      return apiClient.request(`/events/sessions/${sessionId}`);
    },

    getResults: async (sessionId) => {
      return apiClient.request(`/sessions/${sessionId}/results`);
    }
  },

  // Rating endpoints
  ratings: {
    submit: async (sessionId, ratingData) => {
      return apiClient.request(`/sessions/${sessionId}/ratings`, {
        method: 'POST',
        body: JSON.stringify(ratingData)
      });
    }
  },

  // Guess endpoints
  guesses: {
    submit: async (sessionId, guessData) => {
      return apiClient.request(`/sessions/${sessionId}/guesses`, {
        method: 'POST',
        body: JSON.stringify(guessData)
      });
    }
  },

  // Results endpoints
  results: {
    get: async (eventId) => {
      return apiClient.request(`/events/${eventId}/results`);
    },

    publish: async (eventId) => {
      return apiClient.request(`/events/${eventId}/publish`, {
        method: 'POST'
      });
    }
  },

  // Leaderboard endpoints
  leaderboard: {
    get: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `/leaderboard?${queryParams}` : '/leaderboard';
      return apiClient.request(endpoint);
    },

    getUserPoints: async (userId) => {
      return apiClient.request(`/users/${userId}/points`);
    }
  },

  // Document generation endpoints
  documents: {
    getEventResultsSpreadsheet: async (eventId) => {
      return apiClient.request(`/events/${eventId}/results/spreadsheet`, {
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
    },

    getEventResultsPDF: async (eventId) => {
      return apiClient.request(`/events/${eventId}/results/pdf`, {
        headers: {
          'Accept': 'application/pdf'
        }
      });
    },

    getIndividualResultsSpreadsheet: async (sessionId) => {
      return apiClient.request(`/sessions/${sessionId}/results/spreadsheet`, {
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
    },

    getIndividualResultsPDF: async (sessionId) => {
      return apiClient.request(`/sessions/${sessionId}/results/pdf`, {
        headers: {
          'Accept': 'application/pdf'
        }
      });
    }
  }
};

export default apiClient;