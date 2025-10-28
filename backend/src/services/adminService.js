const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../config/constants');

class AdminService {
  async getAllUsers() {
    const result = await pool.query(
      `SELECT id, name, phone, email, ab_group, is_admin, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getStats() {
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN ab_group = 'control' THEN 1 END) as control,
        COUNT(CASE WHEN ab_group = 'experiment' THEN 1 END) as experiment
      FROM users
    `;

    const sleepQuery = `
      SELECT 
        COUNT(*) as total_records,
        AVG(sleep_quality) as avg_quality,
        AVG(sleep_duration) as avg_duration
      FROM sleep_sessions
    `;

    const [usersResult, sleepResult] = await Promise.all([
      pool.query(usersQuery),
      pool.query(sleepQuery)
    ]);

    return {
      users: usersResult.rows[0],
      sleep: sleepResult.rows[0]
    };
  }

  async getAllSleepData() {
    const query = `
      SELECT 
        s.*,
        u.name as user_name,
        u.phone as user_phone,
        u.ab_group
      FROM sleep_sessions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.sleep_date DESC, s.created_at DESC
      LIMIT 100
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async getUserSleepHistory(userId) {
    const result = await pool.query(
      'SELECT * FROM sleep_sessions WHERE user_id = $1 ORDER BY sleep_date DESC',
      [userId]
    );
    return result.rows;
  }

  async createUser(name, phone, email, password, abGroup) {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Bu telefon numarası zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, phone, email, password_hash, ab_group, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, name, phone, email, ab_group, is_admin`,
      [name, phone, email || null, hashedPassword, abGroup]
    );

    return result.rows[0];
  }

  async updateUser(userId, updates) {
    const { name, email, abGroup } = updates;
    
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           ab_group = COALESCE($3, ab_group)
       WHERE id = $4
       RETURNING id, name, phone, email, ab_group, is_admin`,
      [name, email, abGroup, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return result.rows[0];
  }

  async deleteUser(userId) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND is_admin = false RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Kullanıcı bulunamadı veya admin kullanıcı silinemez');
    }

    return true;
  }
}

module.exports = new AdminService();