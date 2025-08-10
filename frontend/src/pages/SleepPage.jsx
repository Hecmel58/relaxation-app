import { useState } from 'react';
import './SleepPage.css';
import { apiService } from '../services/api';

export default function SleepPage({ user }) {
    const [form, setForm] = useState({
        hours: '',
        quality: '',
        notes: '',
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

        setLoading(true);
        try {
            // Eski kodun mantığı korunuyor, sadece API fonksiyonu güncel
            await apiService.createPhysioRecord({
                type: 'sleep',
                hours: form.hours,
                quality: form.quality,
                notes: form.notes,
            });

            setSuccessMsg('Uyku kaydınız başarıyla eklendi.');
            setForm({ hours: '', quality: '', notes: '' });
        } catch (err) {
            console.error('Uyku kaydı eklenirken hata:', err);
            setErrorMsg(err.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sleep-page main-content">
            <h1>Uyku Takibi</h1>
            <p>Uyku düzeninizi takip ederek daha sağlıklı bir yaşam için ilk adımı atın.</p>

            {successMsg && <div className="sp-alert success">{successMsg}</div>}
            {errorMsg && <div className="sp-alert error">{errorMsg}</div>}

            <form className="sleep-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="hours">Uyku Süresi (saat)</label>
                    <input
                        type="number"
                        id="hours"
                        name="hours"
                        placeholder="Kaç saat uyudunuz?"
                        value={form.hours}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="quality">Uyku Kalitesi</label>
                    <select
                        id="quality"
                        name="quality"
                        value={form.quality}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    >
                        <option value="">Seçin</option>
                        <option value="excellent">Mükemmel</option>
                        <option value="good">İyi</option>
                        <option value="average">Orta</option>
                        <option value="poor">Kötü</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Notlar</label>
                    <textarea
                        id="notes"
                        name="notes"
                        placeholder="Eklemek istediğiniz notlar..."
                        value={form.notes}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <button type="submit" className="sleep-submit" disabled={loading}>
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </form>
        </div>
    );
}
