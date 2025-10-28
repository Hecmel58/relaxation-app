const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateAdminPassword() {
  try {
    // Yeni güçlü admin şifresi
    const newPassword = 'Admin@FidBal2024!Secure';
    console.log('Yeni admin şifreniz:', newPassword);
    console.log('BU ŞİFREYİ GÜVENLİ BİR YERE KAYDEDİN!\n');
    
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Database'de güncelle
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE phone = $2 RETURNING id, name, phone',
      [hashedPassword, '5394870058']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin şifresi başarıyla güncellendi!');
      console.log('Güncellenen kullanıcı:', result.rows[0]);
    } else {
      console.log('❌ Admin kullanıcı bulunamadı!');
    }
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();