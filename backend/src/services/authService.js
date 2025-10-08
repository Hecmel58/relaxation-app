const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS, AB_GROUPS } = require('../config/constants');

class AuthService {
  async register(name, phone, email, password, abGroup) {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Bu telefon numarası zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const selectedGroup = abGroup || (Math.random() < 0.5 ? AB_GROUPS.CONTROL : AB_GROUPS.EXPERIMENT);

    const result = await pool.query(
      `INSERT INTO users (name, phone, email, password_hash, ab_group, is_approved, created_at) 
       VALUES ($1, $2, $3, $4, $5, false, NOW()) 
       RETURNING id, name, phone, email, ab_group, is_admin, is_approved`,
      [name, phone, email || null, hashedPassword, selectedGroup]
    );

    const user = result.rows[0];

    return {
      message: 'Kayıt başarılı! Admin onayından sonra giriş yapabilirsiniz.',
      user: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        abGroup: user.ab_group,
        isApproved: user.is_approved || false
      }
    };
  }

  async login(phone, password) {
    const result = await pool.query(
      'SELECT id, name, phone, email, password_hash, ab_group, is_admin, is_approved FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      throw new Error('Telefon numarası veya şifre hatalı');
    }

    const user = result.rows[0];
    
    if (!user.is_approved && !user.is_admin) {
      throw new Error('Hesabınız henüz admin tarafından onaylanmamıştır. Lütfen bekleyiniz.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Telefon numarası veya şifre hatalı');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        abGroup: user.ab_group,
        isAdmin: user.is_admin || false
      }
    };
  }

  async forgotPassword(phone) {
    const result = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      throw new Error('Bu telefon numarası sistemde kayıtlı değil');
    }

    return { message: 'Şifre sıfırlama talebi alındı' };
  }
}

module.exports = new AuthService();