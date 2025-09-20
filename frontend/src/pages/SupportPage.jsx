import { useState } from 'react';
import './SupportPage.css';
import { apiService } from '../services/api';

export default function SupportPage({ user }) {
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        // Form validation
        if (!form.subject?.trim() || !form.message?.trim()) {
            setErrorMsg('Konu ve mesaj alanları zorunludur.');
            return;
        }

        if (form.message.trim().length < 10) {
            setErrorMsg('Mesajınız en az 10 karakter olmalıdır.');
            return;
        }

        if (form.phone && !/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, ''))) {
            setErrorMsg('Geçerli bir telefon numarası girin (10-11 rakam).');
            return;
        }

        setLoading(true);
        try {
            await apiService.sendSupportMessage({
                name: form.name.trim() || 'Anonim',
                phone: form.phone.trim() || user?.phone || '',
                subject: form.subject.trim(),
                message: form.message.trim(),
                priority: form.priority
            });

            setSuccessMsg('Destek talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.');
            setForm({
                name: user?.name || '',
                phone: user?.phone || '',
                subject: '',
                message: '',
                priority: 'normal'
            });
        } catch (err) {
            console.error('Destek talebi gönderilirken hata:', err);
            setErrorMsg(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const subjectOptions = [
        { value: '', label: 'Konu seçin' },
        { value: 'technical', label: '🔧 Teknik Sorun' },
        { value: 'account', label: '👤 Hesap Sorunları' },
        { value: 'feature', label: '💡 Özellik Önerisi' },
        { value: 'feedback', label: '📝 Geri Bildirim' },
        { value: 'billing', label: '💳 Fatura/Ödeme' },
        { value: 'other', label: '❓ Diğer' }
    ];

    const priorityOptions = [
        { value: 'low', label: '🟢 Düşük - Acil değil' },
        { value: 'normal', label: '🟡 Normal - Standart' },
        { value: 'high', label: '🟠 Yüksek - Önemli' },
        { value: 'urgent', label: '🔴 Acil - Hemen gerekli' }
    ];

    return (
        <div className="support-page main-content">
            <div className="page-header">
                <h1>💬 Destek Merkezi</h1>
                <p className="page-description">
                    Herhangi bir sorun yaşıyorsanız, öneriniz varsa veya yardıma ihtiyacınız varsa
                    buradan bize ulaşabilirsiniz. Destek ekibimiz mümkün olan en kısa sürede
                    size geri dönüş yapacaktır.
                </p>
            </div>

            {/* Mesajlar */}
            {successMsg && <div className="alert success">{successMsg}</div>}
            {errorMsg && <div className="alert error">{errorMsg}</div>}

            <div className="support-content">
                {/* Destek Formu */}
                <div className="support-form-card">
                    <div className="card-header">
                        <h2>📋 Destek Talebi Oluştur</h2>
                        <p>Sorununuzu detaylı bir şekilde anlatın</p>
                    </div>

                    <form className="support-form" onSubmit={handleSubmit}>
                        {/* Kişisel Bilgiler */}
                        <div className="form-section">
                            <h3>👤 İletişim Bilgileri</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <span className="label-icon">📝</span>
                                        Ad Soyad
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Adınızı yazın"
                                        value={form.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                    <div className="form-help">
                                        İsteğe bağlı - Boş bırakırsanız "Anonim" olarak görünür
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">
                                        <span className="label-icon">📞</span>
                                        Telefon Numarası
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="5XX XXX XX XX"
                                        value={form.phone}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                    <div className="form-help">
                                        Geri dönüş için kullanılabilir (isteğe bağlı)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Talep Detayları */}
                        <div className="form-section">
                            <h3>📋 Talep Detayları</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="subject">
                                        <span className="label-icon">🏷️</span>
                                        Konu *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        className="form-select"
                                    >
                                        {subjectOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="priority">
                                        <span className="label-icon">⚡</span>
                                        Öncelik Durumu
                                    </label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-select"
                                    >
                                        {priorityOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Mesaj */}
                        <div className="form-section">
                            <h3>💬 Mesajınız</h3>
                            <div className="form-group">
                                <label htmlFor="message">
                                    <span className="label-icon">✍️</span>
                                    Detaylı Açıklama *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Sorununuzu, önerinizi veya geri bildiriminizi detaylı bir şekilde yazın. Ne kadar detaylı açıklarsanız, size o kadar hızlı yardımcı olabiliriz."
                                    value={form.message}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    className="form-textarea"
                                    rows="6"
                                />
                                <div className="form-help">
                                    Minimum 10 karakter - Sorununuzu adım adım açıklayın
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-large"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">📤</span>
                                        Destek Talebi Gönder
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Destek Bilgileri */}
                <div className="support-info-card">
                    <div className="card-header">
                        <h2>ℹ️ Destek Bilgileri</h2>
                    </div>

                    <div className="info-content">
                        <div className="info-item">
                            <span className="info-icon">⏱️</span>
                            <div className="info-text">
                                <h4>Yanıt Süresi</h4>
                                <p>Normal talepler: 24 saat içinde<br/>
                                Acil talepler: 2-4 saat içinde</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="info-icon">🕒</span>
                            <div className="info-text">
                                <h4>Çalışma Saatleri</h4>
                                <p>Pazartesi - Cuma: 09:00 - 18:00<br/>
                                Hafta sonu: 10:00 - 16:00</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="info-icon">📧</span>
                            <div className="info-text">
                                <h4>Direkt İletişim</h4>
                                <p>Acil durumlar için:<br/>
                                <a href="mailto:support@example.com">support@example.com</a></p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="info-icon">❓</span>
                            <div className="info-text">
                                <h4>Sık Sorulan Sorular</h4>
                                <p>Çoğu sorunun cevabını<br/>
                                <a href="#faq">SSS bölümünde</a> bulabilirsiniz</p>
                            </div>
                        </div>
                    </div>

                    {/* Hızlı Yardım */}
                    <div className="quick-help">
                        <h3>🚀 Hızlı Yardım</h3>
                        <div className="help-links">
                            <a href="#" className="help-link">
                                🔐 Şifremi Unuttum
                            </a>
                            <a href="#" className="help-link">
                                📱 Mobil Uygulama
                            </a>
                            <a href="#" className="help-link">
                                ⚙️ Hesap Ayarları
                            </a>
                            <a href="#" className="help-link">
                                📊 Kullanım Rehberi
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}