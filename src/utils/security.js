// security.js - Security utilities and validation functions

// Sanitize user input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters/syntax
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')  // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')  // Remove iframe tags
    .replace(/javascript:/gi, '')  // Remove javascript: protocol
    .replace(/on\w+="[^"]*"/gi, '')  // Remove event handlers
    .replace(/<[^>]*>/g, '')  // Remove all HTML tags (fallback)
    .trim();
};

// Sanitize an entire object recursively
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeInput(obj[key]);
      }
    }
    return sanitized;
  }
  
  return sanitizeInput(obj);
};

// Validate token format
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // Basic JWT format validation (3 parts separated by dots)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) return false;
  
  // Check if each part is valid base64
  const base64Regex = /^[A-Za-z0-9-_]+$/;
  return tokenParts.every(part => base64Regex.test(part));
};

// Validate user roles
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const userRole = user.role.toLowerCase();
  const required = requiredRole.toLowerCase();
  
  // Admin can do everything
  if (userRole === 'admin') return true;
  
  // Organizer can manage events
  if (required === 'organizer' && (userRole === 'organizer' || userRole === 'admin')) return true;
  
  // Participant is the default role
  if (required === 'participant' && 
      (userRole === 'participant' || userRole === 'organizer' || userRole === 'admin')) return true;
  
  return userRole === required;
};

// Check if user is the organizer of an event
export const isEventOrganizer = (user, event) => {
  if (!user || !event) return false;
  
  // Check if user ID matches the event's organizer ID 
  return user._id === event.organizerId || user._id === event.organizerId?._id;
};

// Validate that an input is safe to use in a URL parameter
export const isValidUrlParam = (param) => {
  if (typeof param !== 'string') return false;
  
  // Basic check: only allow alphanumeric characters, hyphens, and underscores
  const urlSafeRegex = /^[a-zA-Z0-9_-]+$/;
  return urlSafeRegex.test(param);
};

// Validate object ID format (typically MongoDB ObjectID)
export const isValidObjectId = (id) => {
  if (typeof id !== 'string') return false;
  
  // MongoDB ObjectID is 24 characters long and contains only hex characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Check if a request is potentially malicious
export const isPotentiallyMalicious = (req) => {
  // Check for common attack patterns in headers or body
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /\.\.\//i,  // Directory traversal
    /%2e%2e%2f/i,  // Encoded directory traversal
  ];
  
  // Check headers
  if (req.headers) {
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return true;
          }
        }
      }
    }
  }
  
  // Check body
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyStr)) {
        return true;
      }
    }
  }
  
  return false;
};