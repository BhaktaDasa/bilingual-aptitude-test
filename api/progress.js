// api/progress.js — GET & POST /api/progress
// GET: fetch all user progress (attempts, bookmarks, mistakes, streak)
// POST: save a practice attempt, bookmark, or mistake update

const { getPool } = require('./_db');
const { getUserFromRequest, setCors } = require('./_auth');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized — please sign in' });

  const pool = getPool();

  // -----------------------------------------------
  // GET /api/progress — fetch all user data
  // -----------------------------------------------
  if (req.method === 'GET') {
    try {
      const [attemptsRes, bookmarksRes, mistakesRes, activityRes] = await Promise.all([
        pool.query(
          'SELECT question_id, correct FROM practice_attempts WHERE user_id = $1',
          [user.id]
        ),
        pool.query(
          'SELECT question_id FROM bookmarks WHERE user_id = $1',
          [user.id]
        ),
        pool.query(
          'SELECT question_id FROM mistakes WHERE user_id = $1',
          [user.id]
        ),
        pool.query(
          `SELECT activity_date, questions_answered FROM daily_activity
           WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '60 days'
           ORDER BY activity_date`,
          [user.id]
        )
      ]);

      // Build practiceAttempts object { [questionId]: { correct: bool } }
      const practiceAttempts = {};
      attemptsRes.rows.forEach(r => {
        practiceAttempts[r.question_id] = { correct: r.correct };
      });

      // Build streak from activity
      const activityLog = {};
      let streakCount = 0;
      let lastDate = '';

      activityRes.rows.forEach(r => {
        const dateStr = r.activity_date.toISOString().split('T')[0];
        activityLog[dateStr] = r.questions_answered;
      });

      // Calculate current streak
      const today = new Date().toISOString().split('T')[0];
      let checkDate = new Date();
      while (true) {
        const key = checkDate.toISOString().split('T')[0];
        if (activityLog[key]) {
          if (!lastDate) lastDate = key;
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (key === today) {
          // Today not practiced yet, check yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          if (!activityLog[checkDate.toISOString().split('T')[0]]) break;
        } else {
          break;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          practiceAttempts,
          bookmarks: bookmarksRes.rows.map(r => r.question_id),
          mistakesVault: mistakesRes.rows.map(r => r.question_id),
          streak: { count: streakCount, lastDate, activityLog },
        }
      });

    } catch (err) {
      console.error('GET progress error:', err.message);
      return res.status(500).json({ error: 'Failed to load progress' });
    }
  }

  // -----------------------------------------------
  // POST /api/progress — save a single update
  // -----------------------------------------------
  if (req.method === 'POST') {
    try {
      const { type, questionId, correct } = req.body;

      if (!type || !questionId) {
        return res.status(400).json({ error: 'type and questionId are required' });
      }

      if (type === 'attempt') {
        // Upsert practice attempt
        await pool.query(
          `INSERT INTO practice_attempts (user_id, question_id, correct)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, question_id)
           DO UPDATE SET correct = EXCLUDED.correct, attempted_at = NOW()`,
          [user.id, questionId, !!correct]
        );

        // Record daily activity
        const today = new Date().toISOString().split('T')[0];
        await pool.query(
          `INSERT INTO daily_activity (user_id, activity_date, questions_answered)
           VALUES ($1, $2, 1)
           ON CONFLICT (user_id, activity_date)
           DO UPDATE SET questions_answered = daily_activity.questions_answered + 1`,
          [user.id, today]
        );

        // Auto-add to mistakes vault if wrong
        if (!correct) {
          await pool.query(
            `INSERT INTO mistakes (user_id, question_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [user.id, questionId]
          );
        } else {
          // Remove from mistakes if now correct
          await pool.query(
            'DELETE FROM mistakes WHERE user_id = $1 AND question_id = $2',
            [user.id, questionId]
          );
        }

        return res.status(200).json({ success: true });

      } else if (type === 'bookmark_add') {
        await pool.query(
          `INSERT INTO bookmarks (user_id, question_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [user.id, questionId]
        );
        return res.status(200).json({ success: true });

      } else if (type === 'bookmark_remove') {
        await pool.query(
          'DELETE FROM bookmarks WHERE user_id = $1 AND question_id = $2',
          [user.id, questionId]
        );
        return res.status(200).json({ success: true });

      } else if (type === 'mistake_remove') {
        await pool.query(
          'DELETE FROM mistakes WHERE user_id = $1 AND question_id = $2',
          [user.id, questionId]
        );
        return res.status(200).json({ success: true });

      } else {
        return res.status(400).json({ error: `Unknown type: ${type}` });
      }

    } catch (err) {
      console.error('POST progress error:', err.message);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
