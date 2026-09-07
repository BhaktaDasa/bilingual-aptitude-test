// api/auth/signin.js — POST /api/auth/signin
// Authenticates a student and returns a JWT

const bcrypt = require('bcryptjs');
const { getPool } = require('../_db');
const { signToken, setCors } = require('../_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const pool = getPool();
    const id = identifier.trim().toLowerCase();

    // Fetch user
    const result = await pool.query(
      'SELECT id, name, identifier, password_hash, target_exam, daily_goal, created_at FROM users WHERE identifier = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email/username' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Sign JWT
    const token = signToken({ id: user.id, identifier: user.identifier, name: user.name });

    return res.status(200).json({
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
    console.error('Signin error:', err.message);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};
