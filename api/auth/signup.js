// api/auth/signup.js — POST /api/auth/signup
// Registers a new student account

const bcrypt = require('bcryptjs');
const { getPool } = require('../_db');
const { signToken, setCors } = require('../_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, identifier, password, targetExam, dailyGoal } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Email or username is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const pool = getPool();
    const id = identifier.trim().toLowerCase();

    // Check if identifier already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE identifier = $1',
      [id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email/username already exists' });
    }

    // Hash password with bcrypt (salt rounds = 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, identifier, password_hash, target_exam, daily_goal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, identifier, target_exam, daily_goal, created_at`,
      [name.trim(), id, passwordHash, targetExam || 'General Preparation', parseInt(dailyGoal) || 20]
    );

    const user = result.rows[0];

    // Sign JWT
    const token = signToken({ id: user.id, identifier: user.identifier, name: user.name });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        targetExam: user.target_exam,
        dailyGoal: user.daily_goal,
        createdAt: user.created_at,
      }
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};
