// api/tests.js — GET & POST /api/tests
// GET: fetch a user's test history
// POST: save a completed mock test result

const { getPool } = require('./_db');
const { getUserFromRequest, setCors } = require('./_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized — please sign in' });

  const pool = getPool();

  // -----------------------------------------------
  // GET /api/tests — fetch test history
  // -----------------------------------------------
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT id, set_name, total, correct, score_pct, time_taken_s, taken_at
         FROM test_history
         WHERE user_id = $1
         ORDER BY taken_at DESC
         LIMIT 50`,
        [user.id]
      );

      const history = result.rows.map(r => ({
        id: r.id,
        setName: r.set_name,
        total: r.total,
        correct: r.correct,
        scorePct: r.score_pct,
        timeTakenSeconds: r.time_taken_s,
        date: new Date(r.taken_at).toLocaleDateString('en-GB'),
        time: new Date(r.taken_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      }));

      return res.status(200).json({ success: true, history });

    } catch (err) {
      console.error('GET tests error:', err.message);
      return res.status(500).json({ error: 'Failed to load test history' });
    }
  }

  // -----------------------------------------------
  // POST /api/tests — save a completed test
  // -----------------------------------------------
  if (req.method === 'POST') {
    try {
      const { setName, total, correct, scorePct, timeTakenSeconds } = req.body;

      if (!setName || total == null || correct == null || scorePct == null) {
        return res.status(400).json({ error: 'Missing required test data' });
      }

      const result = await pool.query(
        `INSERT INTO test_history (user_id, set_name, total, correct, score_pct, time_taken_s)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, taken_at`,
        [user.id, setName, total, correct, scorePct, timeTakenSeconds || 0]
      );

      return res.status(201).json({
        success: true,
        test: { id: result.rows[0].id, takenAt: result.rows[0].taken_at }
      });

    } catch (err) {
      console.error('POST tests error:', err.message);
      return res.status(500).json({ error: 'Failed to save test result' });
    }
  }

  // -----------------------------------------------
  // DELETE /api/tests — clear test history
  // -----------------------------------------------
  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM test_history WHERE user_id = $1', [user.id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to clear test history' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
