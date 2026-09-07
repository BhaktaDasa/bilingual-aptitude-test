// api/auth/me.js — GET /api/auth/me
// Returns the current user's profile (requires valid JWT)

const { getPool } = require('../_db');
const { getUserFromRequest, setCors } = require('../_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized — please sign in' });

  try {
    const pool = getPool();

    const result = await pool.query(
      'SELECT id, name, identifier, target_exam, daily_goal, created_at, last_login FROM users WHERE id = $1',
      [user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    return res.status(200).json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        identifier: u.identifier,
        targetExam: u.target_exam,
        dailyGoal: u.daily_goal,
        createdAt: u.created_at,
        lastLogin: u.last_login,
      }
    });

  } catch (err) {
    console.error('Me error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
