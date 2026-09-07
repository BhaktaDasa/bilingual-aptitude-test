// api/leaderboard.js — GET /api/leaderboard
// Returns top 20 all-time scores across all students
// No auth required — public leaderboard

const { getPool } = require('./_db');
const { setCors } = require('./_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pool = getPool();

    // Top 20 highest individual test scores
    const result = await pool.query(
      `SELECT
         u.name,
         th.set_name,
         th.total,
         th.correct,
         th.score_pct,
         th.taken_at
       FROM test_history th
       JOIN users u ON u.id = th.user_id
       ORDER BY th.score_pct DESC, th.correct DESC, th.taken_at ASC
       LIMIT 20`
    );

    const leaderboard = result.rows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      setName: r.set_name,
      total: r.total,
      correct: r.correct,
      scorePct: r.score_pct,
      date: new Date(r.taken_at).toLocaleDateString('en-GB'),
    }));

    return res.status(200).json({ success: true, leaderboard });

  } catch (err) {
    console.error('Leaderboard error:', err.message);
    return res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};
