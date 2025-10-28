const pool = require('../config/database');

class SleepService {
  async createSession(userId, data) {
    const {
      date,
      sleep_time,
      wake_time,
      sleep_quality,
      mood_before,
      mood_after,
      rem_duration = 0,
      deep_sleep_duration = 0,
      light_sleep_duration = 0,
      awake_duration = 0,
      heart_rate = 0,
      stress_level,
      screen_time_before = 0,
      room_temperature = 20,
      last_meal_time,
      caffeine_intake = false,
      alcohol_intake = false,
      exercise = false,
      medication = false,
      meditation = false,
      reading = false,
      notes
    } = data;

    const sleepDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const sleep_duration = parseInt(rem_duration || 0) + 
                          parseInt(deep_sleep_duration || 0) + 
                          parseInt(light_sleep_duration || 0);

    const total_time = sleep_duration + parseInt(awake_duration || 0);
    const sleep_efficiency = total_time > 0 ? Math.round((sleep_duration / total_time) * 100) : 0;

    const query = `
      INSERT INTO sleep_sessions (
        user_id, sleep_date, sleep_time, wake_time, 
        sleep_quality, sleep_duration, rem_duration,
        deep_sleep_duration, light_sleep_duration, awake_duration,
        heart_rate, mood_before, mood_after, stress_level,
        screen_time_before, room_temperature, last_meal_time,
        caffeine_intake, alcohol_intake, exercise,
        medication, meditation, reading, notes, 
        sleep_efficiency, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, $16, $17, $18, $19, 
                $20, $21, $22, $23, $24, $25, NOW())
      RETURNING *
    `;

    const values = [
      userId, sleepDate, sleep_time, wake_time, sleep_quality, sleep_duration,
      rem_duration || 0, deep_sleep_duration || 0, light_sleep_duration || 0, 
      awake_duration || 0, heart_rate || 0, mood_before, mood_after, stress_level, 
      screen_time_before || 0, room_temperature || 20, last_meal_time, 
      caffeine_intake || false, alcohol_intake || false, exercise || false,
      medication || false, meditation || false, reading || false, notes,
      sleep_efficiency
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getUserSessions(userId, limit = 50) {
    const query = `
      SELECT 
        id, 
        sleep_date, 
        sleep_time, 
        wake_time,
        sleep_quality, 
        sleep_duration,
        rem_duration,
        deep_sleep_duration, 
        light_sleep_duration, 
        awake_duration,
        heart_rate, 
        mood_before, 
        mood_after, 
        stress_level,
        screen_time_before, 
        room_temperature, 
        last_meal_time,
        caffeine_intake, 
        alcohol_intake, 
        exercise,
        medication, 
        meditation, 
        reading, 
        notes,
        sleep_efficiency,
        created_at
      FROM sleep_sessions 
      WHERE user_id = $1 
      ORDER BY sleep_date DESC, created_at DESC 
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  async getSessionById(sessionId, userId) {
    const result = await pool.query(
      'SELECT * FROM sleep_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    return result.rows[0];
  }

  async deleteSession(sessionId, userId) {
    const result = await pool.query(
      'DELETE FROM sleep_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, userId]
    );
    return result.rows.length > 0;
  }

  async getAnalytics(userId, period = 'week') {
    const daysMap = { week: 7, month: 30, year: 365 };
    const days = daysMap[period] || 7;

    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(AVG(sleep_quality), 0) as avg_sleep_quality,
        COALESCE(AVG(sleep_duration), 0) as avg_sleep_duration,
        COALESCE(AVG(rem_duration), 0) as avg_rem_duration,
        COALESCE(AVG(deep_sleep_duration), 0) as avg_deep_sleep,
        COALESCE(AVG(light_sleep_duration), 0) as avg_light_sleep,
        COALESCE(AVG(heart_rate), 0) as avg_heart_rate,
        COALESCE(AVG(stress_level), 0) as avg_stress_level,
        COALESCE(AVG(sleep_efficiency), 0) as avg_efficiency
      FROM sleep_sessions 
      WHERE user_id = $1 
        AND sleep_date >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    const result = await pool.query(query, [userId]);
    
    const analytics = result.rows[0];
    return {
      total_sessions: parseInt(analytics.total_sessions),
      avg_sleep_quality: parseFloat(analytics.avg_sleep_quality).toFixed(1),
      avg_sleep_duration: Math.round(parseFloat(analytics.avg_sleep_duration)),
      avg_rem_duration: Math.round(parseFloat(analytics.avg_rem_duration)),
      avg_deep_sleep: Math.round(parseFloat(analytics.avg_deep_sleep)),
      avg_light_sleep: Math.round(parseFloat(analytics.avg_light_sleep)),
      avg_heart_rate: Math.round(parseFloat(analytics.avg_heart_rate)),
      avg_stress_level: parseFloat(analytics.avg_stress_level).toFixed(1),
      avg_efficiency: Math.round(parseFloat(analytics.avg_efficiency))
    };
  }
}

module.exports = new SleepService();