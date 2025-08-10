import { useState } from 'react';
import './SupportPage.css';
import { apiService } from '../services/api';

export default function SupportPage({ user }) {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        subject: '',
        message: '',
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

        if (!form.subject || !form.message) {
            setErrorMsg('Konu ve mesaj zorunludur.');
            return;
        }

        setLoading(true);
        try {
            // Önceden createSupport kullanılıyordu, şimdi sendSupportMessage
            await apiService.sendSupportMessage({
                name: form.name || user?.name || '',
                phone: form.phone || user?.phone || '',
                subject: form.subject,
                message: form.message,
            });

            setSuccessMsg('Destek talebiniz başarıyla gönderildi.');
            setForm({ name: '', phone: '', subject: '', message: '' });
        } catch (err) {
            console.error('Destek talebi gönderilirken hata:', err);
            setErrorMsg(err.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="support-page main-content">
            <h1>Destek Talebi</h1>
            <p>Herhangi bir sorun yaşarsanız veya öneriniz varsa bize buradan ulaşabilirsiniz.</p>

            {successMsg && <div className="sp-alert success">{successMsg}</div>}
            {errorMsg && <div className="sp-alert error">{errorMsg}</div>}

            <form className="support-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Ad Soyad</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Adınızı girin"
                        value={form.name}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Telefon numaranızı girin"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">Konu</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        placeholder="Konu başlığı"
                        value={form.subject}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message">Mesaj</label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Mesajınızı yazın..."
                        value={form.message}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    />
                </div>

                <button type="submit" className="support-submit" disabled={loading}>
                    {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
            </form>
        </div>
    );
}
