const pool = require('../config/database');

class AdminController {
  async getUsers(req, res, next) {
    try {
      const result = await pool.query(
        'SELECT id, name, phone, email, is_admin, is_approved, ab_group, created_at FROM users ORDER BY created_at DESC'
      );
      
      res.json({
        success: true,
        users: result.rows
      });
    } catch (error) {
      console.error('Get users error:', error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const usersQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ab_group = 'control') as control,
          COUNT(*) FILTER (WHERE ab_group = 'experiment') as experiment
        FROM users
      `;
      
      const sleepQuery = `
        SELECT COUNT(*) as total_records
        FROM sleep_sessions
      `;
      
      const [usersResult, sleepResult] = await Promise.all([
        pool.query(usersQuery),
        pool.query(sleepQuery)
      ]);
      
      res.json({
        success: true,
        stats: {
          users: {
            total: parseInt(usersResult.rows[0].total),
            control: parseInt(usersResult.rows[0].control),
            experiment: parseInt(usersResult.rows[0].experiment)
          },
          sleep: {
            totalRecords: parseInt(sleepResult.rows[0].total_records)
          }
        }
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { name, email, abGroup, isAdmin, isApproved } = req.body;
      
      const query = `
        UPDATE users 
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            ab_group = COALESCE($3, ab_group),
            is_admin = COALESCE($4, is_admin),
            is_approved = COALESCE($5, is_approved)
        WHERE id = $6
        RETURNING id, name, phone, email, is_admin, is_approved, ab_group
      `;
      
      const result = await pool.query(query, [name, email, abGroup, isAdmin, isApproved, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
      }
      
      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update user error:', error);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 AND is_admin = false RETURNING id',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Kullanıcı bulunamadı veya admin silinemez' 
        });
      }
      
      res.json({
        success: true,
        message: 'Kullanıcı silindi'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      next(error);
    }
  }

  async getSleepData(req, res, next) {
    try {
      const query = `
        SELECT 
          ss.*,
          u.name as user_name,
          u.phone as user_phone,
          u.ab_group
        FROM sleep_sessions ss
        JOIN users u ON ss.user_id = u.id
        ORDER BY ss.sleep_date DESC, ss.created_at DESC
        LIMIT 100
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        sessions: result.rows
      });
    } catch (error) {
      console.error('Admin sleep data error:', error);
      next(error);
    }
  }

  async getUserSleepHistory(req, res, next) {
    try {
      const { userId } = req.params;
      
      const query = `
        SELECT *
        FROM sleep_sessions
        WHERE user_id = $1
        ORDER BY sleep_date DESC
      `;
      
      const result = await pool.query(query, [userId]);
      
      res.json({
        success: true,
        sessions: result.rows
      });
    } catch (error) {
      console.error('User sleep history error:', error);
      next(error);
    }
  }

  async getFormResponses(req, res, next) {
    try {
      const query = `
        SELECT 
          fr.*,
          u.name as user_name,
          u.phone as user_phone,
          u.ab_group
        FROM form_responses fr
        JOIN users u ON fr.user_id = u.id
        ORDER BY fr.created_at DESC
        LIMIT 100
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        forms: result.rows
      });
    } catch (error) {
      console.error('Get form responses error:', error);
      next(error);
    }
  }
}

module.exports = new AdminController();