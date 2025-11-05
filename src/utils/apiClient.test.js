// apiClient.test.js - Integration tests for API client

import apiClient from '../utils/apiClient';

// Mock the fetch function
global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('auth methods', () => {
    test('login method calls the correct endpoint', async () => {
      const mockResponse = { token: 'test-token', user: { id: '1', name: 'Test User' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.auth.login('test@example.com', 'password');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('signup method calls the correct endpoint', async () => {
      const mockResponse = { token: 'test-token', user: { id: '2', name: 'New User' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.auth.signup('New User', 'new@example.com', 'password');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ name: 'New User', email: 'new@example.com', password: 'password' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('events methods', () => {
    test('getAll method calls the correct endpoint', async () => {
      const mockEvents = [{ _id: '1', name: 'Test Event' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      });

      // Set a mock token in localStorage for auth header
      localStorage.setItem('token', 'test-token');
      const result = await apiClient.events.getAll();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/events',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockEvents);
    });

    test('create method calls the correct endpoint', async () => {
      const eventData = { name: 'New Event', location: 'Test Location' };
      const mockResponse = { _id: '2', ...eventData };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.setItem('token', 'test-token');
      const result = await apiClient.events.create(eventData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(eventData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('ratings methods', () => {
    test('submit method calls the correct endpoint', async () => {
      const ratingData = { coffeeId: '1', score: 8 };
      const mockResponse = { success: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.setItem('token', 'test-token');
      const result = await apiClient.ratings.submit('session123', ratingData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/sessions/session123/ratings',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(ratingData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    test('handles 401 errors by clearing auth data', async () => {
      // Mock a 401 response
      fetch.mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      // Spy on localStorage
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

      // Temporarily suppress console.error for this test
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        await apiClient.events.getAll();
      } catch (error) {
        // We expect an error to be thrown
      }

      // Restore console.error
      console.error = originalConsoleError;

      expect(removeItemSpy).toHaveBeenCalledWith('token');
      expect(removeItemSpy).toHaveBeenCalledWith('user');
    });

    test('throws error for non-JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(apiClient.events.getAll()).rejects.toThrow('Request failed');
    });
  });
});