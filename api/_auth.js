// api/_auth.js — JWT token helpers
// Signs and verifies JWTs using process.env.JWT_SECRET

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aptitude-master-dev-secret-2025';
const JWT_EXPIRES_IN = '30d'; // 30-day sessions

/**
 * Sign a JWT token for a user
 * @param {object} payload - { id, identifier, name }
 * @returns {string} signed JWT
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token from Authorization header
 * @param {string} token - raw JWT string
 * @returns {object|null} decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Extract and verify token from an HTTP request's Authorization header
 * @param {object} req - Vercel request object
 * @returns {object|null} decoded user payload or null
 */
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Standard CORS headers for all API responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Handle CORS preflight & set headers
 */
function setCors(res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

module.exports = { signToken, verifyToken, getUserFromRequest, setCors };
