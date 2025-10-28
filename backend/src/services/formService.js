const pool = require('../config/database');
const { FORM_TYPES } = require('../config/constants');

class FormService {
  getFormTypes() {
    return [
      {
        id: FORM_TYPES.PERSONAL,
        title: 'Kişisel Tanıtıcı Bilgi Formu',
        description: 'Kişisel bilgileriniz',
        url: 'https://forms.gle/pvbAiodN5Au6savf7'
      },
      {
        id: FORM_TYPES.STRESS,
        title: 'Algılanan Stres Ölçeği',
        description: 'Stres değerlendirmesi',
        url: 'https://forms.gle/CmeaiXh6bjJfAxcZ6'
      },
      {
        id: FORM_TYPES.NURSING,
        title: 'Hemşirelik Eğitim Stresi',
        description: 'Eğitim stresi değerlendirmesi',
        url: 'https://forms.gle/uJRGR5yr1U32viDk9'
      },
      {
        id: FORM_TYPES.PSQI,
        title: 'Pittsburgh Uyku Kalitesi İndeksi (PUKİ)',
        description: 'Uyku kalitesi değerlendirmesi',
        url: 'https://forms.gle/Xv2Ku6JjcpoQqZks6'
      }
    ];
  }

  async submitForm(userId, formType, formTitle, googleFormUrl) {
    const existingCheck = await pool.query(
      'SELECT id FROM form_submissions WHERE user_id = $1 AND form_type = $2',
      [userId, formType]
    );

    if (existingCheck.rows.length > 0) {
      await pool.query(
        'UPDATE form_submissions SET submitted_at = NOW() WHERE user_id = $1 AND form_type = $2',
        [userId, formType]
      );
    } else {
      await pool.query(
        'INSERT INTO form_submissions (user_id, form_type, form_title, google_form_url, submitted_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, formType, formTitle, googleFormUrl]
      );
    }

    return { message: 'Form tamamlandı olarak işaretlendi' };
  }

  async getUserForms(userId) {
    const result = await pool.query(
      'SELECT form_type, form_title, submitted_at FROM form_submissions WHERE user_id = $1 ORDER BY submitted_at DESC',
      [userId]
    );
    return result.rows;
  }
}

module.exports = new FormService();