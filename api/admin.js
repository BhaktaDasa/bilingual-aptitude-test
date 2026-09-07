// api/admin.js — GET /api/admin
// Admin dashboard data: all students, aggregate stats
// Protected — only works if the caller is an admin (identifier contains 'admin' or is in admin list)

const { getPool } = require('./_db');
const { getUserFromRequest, setCors } = require('./_auth');

// Admin identifiers — add your own email/username here
const ADMIN_IDS = ['admin', 'admin@aptitudemaster.com', 'bhaktadasa'];

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Check admin access
  const isAdmin = ADMIN_IDS.includes(user.identifier) || user.identifier.includes('admin');
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden — admin access only' });

  try {
    const pool = getPool();

    const [studentsRes, kpiRes, topTestsRes] = await Promise.all([
      // All students with their stats
      pool.query(`
        SELECT
          u.id, u.name, u.identifier, u.target_exam, u.daily_goal,
          u.created_at, u.last_login,
          COUNT(DISTINCT pa.question_id) as attempts,
          COUNT(DISTINCT CASE WHEN pa.correct THEN pa.question_id END) as correct_count,
          COUNT(DISTINCT b.question_id) as bookmarks,
          COUNT(DISTINCT m.question_id) as mistakes,
          COUNT(DISTINCT th.id) as tests_taken,
          MAX(th.score_pct) as best_score
        FROM users u
        LEFT JOIN practice_attempts pa ON pa.user_id = u.id
        LEFT JOIN bookmarks b ON b.user_id = u.id
        LEFT JOIN mistakes m ON m.user_id = u.id
        LEFT JOIN test_history th ON th.user_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `),
      // Platform-wide KPIs
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users) AS total_students,
          (SELECT COUNT(*) FROM practice_attempts) AS total_attempts,
          (SELECT COUNT(*) FROM test_history) AS total_tests,
          (SELECT ROUND(AVG(score_pct)) FROM test_history) AS avg_score,
          (SELECT COUNT(*) FROM users WHERE last_login >= NOW() - INTERVAL '7 days') AS active_this_week
      `),
      // Top 5 test results platform-wide
      pool.query(`
        SELECT u.name, th.set_name, th.score_pct, th.correct, th.total, th.taken_at
        FROM test_history th
        JOIN users u ON u.id = th.user_id
        ORDER BY th.score_pct DESC LIMIT 5
      `)
    ]);

    const students = studentsRes.rows.map(s => ({
      id: s.id,
      name: s.name,
      identifier: s.identifier,
      targetExam: s.target_exam,
      dailyGoal: s.daily_goal,
      createdAt: s.created_at,
      lastLogin: s.last_login,
      attempts: parseInt(s.attempts) || 0,
      correct: parseInt(s.correct_count) || 0,
      accuracy: s.attempts > 0 ? Math.round((s.correct_count / s.attempts) * 100) : 0,
      bookmarks: parseInt(s.bookmarks) || 0,
      mistakes: parseInt(s.mistakes) || 0,
      testsTaken: parseInt(s.tests_taken) || 0,
      bestScore: s.best_score || 0,
    }));

    const kpi = kpiRes.rows[0];

    return res.status(200).json({
      success: true,
      kpi: {
        totalStudents: parseInt(kpi.total_students),
        totalAttempts: parseInt(kpi.total_attempts),
        totalTests: parseInt(kpi.total_tests),
        avgScore: parseInt(kpi.avg_score) || 0,
        activeThisWeek: parseInt(kpi.active_this_week),
      },
      students,
      topTests: topTestsRes.rows,
    });

  } catch (err) {
    console.error('Admin error:', err.message);
    return res.status(500).json({ error: 'Failed to load admin data' });
  }
};
