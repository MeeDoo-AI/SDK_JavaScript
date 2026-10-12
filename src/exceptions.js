// MeeDoo AI SDK — Exception classes

class MeeDooError extends Error {
  constructor(message = '', statusCode = 0, body = {}) {
    super(message);
    this.name = 'MeeDooError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

class AuthenticationError extends MeeDooError {
  constructor(message = 'Authentication failed', statusCode = 401, body = {}) {
    super(message, statusCode, body);
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends MeeDooError {
  constructor(message = 'Rate limit exceeded', statusCode = 429, body = {}) {
    super(message, statusCode, body);
    this.name = 'RateLimitError';
  }
}

class InsufficientCreditsError extends MeeDooError {
  constructor(message = 'Insufficient credits', statusCode = 400, body = {}) {
    super(message, statusCode, body);
    this.name = 'InsufficientCreditsError';
  }
}

class ModelNotFoundError extends MeeDooError {
  constructor(message = 'Model not found', statusCode = 404, body = {}) {
    super(message, statusCode, body);
    this.name = 'ModelNotFoundError';
  }
}

class APIError extends MeeDooError {
  constructor(message = 'API error', statusCode = 500, body = {}) {
    super(message, statusCode, body);
    this.name = 'APIError';
  }
}

module.exports = {
  MeeDooError,
  AuthenticationError,
  RateLimitError,
  InsufficientCreditsError,
  ModelNotFoundError,
  APIError,
};