import { useState } from 'react';
import './SleepPage.css';
import { apiService } from '../services/api';

export default function SleepPage({ user }) {
    const [form, setForm] = useState({
        hours: '',
        quality: '',
        notes: '',
        sleepTime: '',
        wakeTime: ''
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

        if (!form.hours || !form.quality) {
            setErrorMsg('Uyku süresi ve uyku kalitesi zorunludur.');
            return;
        }

        // Form validation
        if (parseFloat(form.hours) <= 0 || parseFloat(form.hours) > 24) {
            setErrorMsg('Uyku süresi 0-24 saat arasında olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            await apiService.createPhysioRecord({
                type: 'sleep',
                hours: parseFloat(form.hours),
                quality: form.quality,
                notes: form.notes,
                sleepTime: form.sleepTime,
                wakeTime: form.wakeTime,
                date: new Date()
            });

            setSuccessMsg('Uyku kaydınız başarıyla eklendi.');
            setForm({ 
                hours: '', 
                quality: '', 
                notes: '', 
                sleepTime: '', 
                wakeTime: '' 
            });
        } catch (err) {
            console.error('Uyku kaydı eklenirken hata:', err);
            setErrorMsg(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const qualityOptions = [
        { value: '', label: 'Kalite seçin' },
        { value: 'excellent', label: '😴 Mükemmel - Çok derin ve dinlendirici' },
        { value: 'good', label: '😊 İyi - Genel olarak dinlendirici' },
        { value: 'average', label: '😐 Orta - Kabul edilebilir' },
        { value: 'poor', label: '😟 Kötü - Huzursuz ve kesintili' },
        { value: 'terrible', label: '😫 Çok Kötü - Uykusuz kaldım' }
    ];

    return (
        <div className="sleep-page main-content">
            <div className="page-header">
                <h1>😴 Uyku Takibi</h1>
                <p className="page-description">
                    Uyku kalitesi genel sağlığınızın en önemli göstergelerinden biridir. 
                    Düzenli uyku takibi ile uyku düzeninizi analiz edebilir ve sağlıklı 
                    yaşam alışkanlıkları geliştirebilirsiniz.
                </p>
            </div>

            {/* Mesajlar */}
            {successMsg && <div className="alert success">{successMsg}</div>}
            {errorMsg && <div className="alert error">{errorMsg}</div>}

            <div className="sleep-content">
                {/* Form Card */}
                <div className="sleep-form-card">
                    <div className="card-header">
                        <h2>📊 Yeni Uyku Kaydı</h2>
                        <p>Dün geceki uyku deneyiminizi kaydedin</p>
                    </div>
                    
                    <form className="sleep-form" onSubmit={handleSubmit}>
                        {/* Uyku Süreleri */}
                        <div className="form-section">
                            <h3>⏰ Uyku Süreleri</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="sleepTime">
                                        <span className="label-icon">🌙</span>
                                        Yatış Saati
                                    </label>
                                    <input
                                        type="time"
                                        id="sleepTime"
                                        name="sleepTime"
                                        value={form.sleepTime}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="wakeTime">
                                        <span className="label-icon">☀️</span>
                                        Kalkış Saati
                                    </label>
                                    <input
                                        type="time"
                                        id="wakeTime"
                                        name="wakeTime"
                                        value={form.wakeTime}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Uyku Süresi */}
                        <div className="form-section">
                            <h3>⏱️ Uyku Süresi</h3>
                            <div className="form-group">
                                <label htmlFor="hours">
                                    <span className="label-icon">🕐</span>
                                    Toplam Uyku Süresi (saat) *
                                </label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        id="hours"
                                        name="hours"
                                        placeholder="8"
                                        value={form.hours}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        className="form-input"
                                    />
                                    <span className="input-unit">saat</span>
                                </div>
                                <div className="form-help">
                                    Örnek: 7.5 saat için "7.5" yazın
                                </div>
                            </div>
                        </div>

                        {/* Uyku Kalitesi */}
                        <div className="form-section">
                            <h3>⭐ Uyku Kalitesi</h3>
                            <div className="form-group">
                                <label htmlFor="quality">
                                    <span className="label-icon">💤</span>
                                    Uyku Kalitenizi Değerlendirin *
                                </label>
                                <select
                                    id="quality"
                                    name="quality"
                                    value={form.quality}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    className="form-select"
                                >
                                    {qualityOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notlar */}
                        <div className="form-section">
                            <h3>📝 Ek Notlar</h3>
                            <div className="form-group">
                                <label htmlFor="notes">
                                    <span className="label-icon">📋</span>
                                    Uykunuzla İlgili Notlar
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Uykunuzu etkileyen faktörler, rüyalar, uyanma durumu vb. (opsiyonel)"
                                    value={form.notes}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="form-textarea"
                                    rows="4"
                                />
                                <div className="form-help">
                                    Uyku kalitenizi etkileyen faktörleri not edin (stres, kafein, ortam vb.)
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
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">💾</span>
                                        Uyku Kaydını Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Uyku İpuçları */}
                <div className="sleep-tips-card">
                    <div className="card-header">
                        <h2>💡 Kaliteli Uyku İpuçları</h2>
                    </div>
                    
                    <div className="tips-list">
                        <div className="tip-item">
                            <span className="tip-icon">🕘</span>
                            <div className="tip-content">
                                <h4>Düzenli Uyku Saatleri</h4>
                                <p>Her gün aynı saatte yatıp kalkmaya çalışın</p>
                            </div>
                        </div>
                        
                        <div className="tip-item">
                            <span className="tip-icon">📱</span>
                            <div className="tip-content">
                                <h4>Ekran Detoksu</h4>
                                <p>Yatmadan 1 saat önce elektronik cihazları bırakın</p>
                            </div>
                        </div>
                        
                        <div className="tip-item">
                            <span className="tip-icon">🌡️</span>
                            <div className="tip-content">
                                <h4>İdeal Oda Sıcaklığı</h4>
                                <p>18-22°C arası sıcaklık uykuya daha hızlı dalmanızı sağlar</p>
                            </div>
                        </div>
                        
                        <div className="tip-item">
                            <span className="tip-icon">☕</span>
                            <div className="tip-content">
                                <h4>Kafein Kontrolü</h4>
                                <p>Öğleden sonra 14:00'dan sonra kafein tüketiminden kaçının</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}