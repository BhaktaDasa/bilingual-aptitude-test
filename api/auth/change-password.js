// api/auth/change-password.js — POST /api/auth/change-password
// Allows a signed-in student to update their password

const bcrypt = require('bcryptjs');
const { getPool } = require('../_db');
const { getUserFromRequest, setCors } = require('../_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized — please sign in' });

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const pool = getPool();

    // Get current hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });

  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
