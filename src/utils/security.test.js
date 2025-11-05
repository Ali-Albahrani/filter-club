// security.test.js - Tests for security utilities

import {
  sanitizeInput,
  sanitizeObject,
  isValidToken,
  hasRole,
  isEventOrganizer,
  isValidUrlParam,
  isValidObjectId,
  isPotentiallyMalicious
} from './security';

describe('Input Sanitization', () => {
  test('removes script tags from input', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
    expect(sanitizeInput('safe input')).toBe('safe input');
  });

  test('removes javascript protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  test('removes event handlers', () => {
    expect(sanitizeInput('<div onclick="alert(1)">click me</div>')).toBe('click mediv');
  });

  test('sanitizes entire objects recursively', () => {
    const obj = {
      name: '<script>alert("xss")</script>John',
      description: 'A <b>safe</b> description',
      nested: {
        value: 'javascript:alert(1)',
        list: ['<script>test</script>', 'safe']
      }
    };
    
    const sanitized = sanitizeObject(obj);
    expect(sanitized.name).toBe('alert("xss")John');
    expect(sanitized.description).toBe('Asafeb description'); // All HTML tags removed
    expect(sanitized.nested.value).toBe('alert(1)');
    expect(sanitized.nested.list[0]).toBe('test');
    expect(sanitized.nested.list[1]).toBe('safe');
  });
});

describe('Token Validation', () => {
  test('validates JWT format', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(isValidToken(validToken)).toBe(true);
    
    expect(isValidToken(null)).toBe(false);
    expect(isValidToken('')).toBe(false);
    expect(isValidToken('invalid.token')).toBe(false);
    expect(isValidToken('invalid.token.format.now')).toBe(false);
  });
});

describe('Role Validation', () => {
  test('checks user roles correctly', () => {
    expect(hasRole({ role: 'admin' }, 'participant')).toBe(true);
    expect(hasRole({ role: 'admin' }, 'organizer')).toBe(true);
    expect(hasRole({ role: 'organizer' }, 'organizer')).toBe(true);
    expect(hasRole({ role: 'participant' }, 'participant')).toBe(true);
    expect(hasRole({ role: 'participant' }, 'organizer')).toBe(false);
  });
});

describe('Event Organizer Check', () => {
  test('verifies event organizer status', () => {
    const user = { _id: '123' };
    const event1 = { organizerId: '123' };
    const event2 = { organizerId: '456' };
    const event3 = { organizerId: { _id: '123' } }; // Nested organizer ID
    
    expect(isEventOrganizer(user, event1)).toBe(true);
    expect(isEventOrganizer(user, event2)).toBe(false);
    expect(isEventOrganizer(user, event3)).toBe(true);
    expect(isEventOrganizer(null, event1)).toBe(false);
    expect(isEventOrganizer(user, null)).toBe(false);
  });
});

describe('URL Parameter Validation', () => {
  test('validates safe URL parameters', () => {
    expect(isValidUrlParam('validParam123')).toBe(true);
    expect(isValidUrlParam('valid-param')).toBe(true);
    expect(isValidUrlParam('valid_param')).toBe(true);
    
    expect(isValidUrlParam('invalid param')).toBe(false);
    expect(isValidUrlParam('invalid/param')).toBe(false);
    expect(isValidUrlParam('javascript:alert(1)')).toBe(false);
  });
});

describe('Object ID Validation', () => {
  test('validates MongoDB ObjectID format', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    expect(isValidObjectId('507f1f77bcf86cd79943901a')).toBe(true); // Contains hex chars
    
    expect(isValidObjectId('invalid123')).toBe(false); // Too short
    expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false); // Contains 'g' which is not a hex char
    expect(isValidObjectId('')).toBe(false);
  });
});

describe('Malicious Request Detection', () => {
  test('detects potentially malicious requests', () => {
    const safeReq = { headers: { 'content-type': 'application/json' }, body: { data: 'safe' } };
    const maliciousReq = { 
      headers: { 'x-custom': '<script>alert(1)</script>' }, 
      body: { data: 'safe' } 
    };
    
    expect(isPotentiallyMalicious(safeReq)).toBe(false);
    expect(isPotentiallyMalicious(maliciousReq)).toBe(true);
  });
});