import { useEffect, useState } from 'react';
import './AdminPage.css';
import { apiService } from '../services/api';

export default function AdminPage({ user }) {
    const [physioRecords, setPhysioRecords] = useState([]);
    const [supportRequests, setSupportRequests] = useState([]);
    const [loadingPhysio, setLoadingPhysio] = useState(true);
    const [loadingSupport, setLoadingSupport] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // 📌 Yeni kullanıcı formu state
    const [newUser, setNewUser] = useState({ phone: '', password: '', name: '', role: 'user' });

    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const fetchPhysio = async () => {
            try {
                const data = await apiService.getAllPhysioRecords();
                setPhysioRecords(data || []);
            } catch (err) {
                console.error('Fiziksel kayıtlar alınamadı:', err);
                setErrorMsg('Fiziksel kayıtlar yüklenirken hata oluştu.');
            } finally {
                setLoadingPhysio(false);
            }
        };

        const fetchSupport = async () => {
            try {
                const data = await apiService.getAllSupportRequests();
                setSupportRequests(data || []);
            } catch (err) {
                console.error('Destek talepleri alınamadı:', err);
                setErrorMsg('Destek talepleri yüklenirken hata oluştu.');
            } finally {
                setLoadingSupport(false);
            }
        };

        fetchPhysio();
        fetchSupport();
    }, [user]);

    // 📌 Yeni kullanıcı ekleme fonksiyonu
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await apiService.addUser(newUser);
            setNewUser({ phone: '', password: '', name: '', role: 'user' });
            alert('Kullanıcı başarıyla eklendi.');
        } catch (err) {
            console.error('Kullanıcı eklenirken hata:', err);
            alert('Kullanıcı eklenemedi.');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="admin-page main-content">
                <h2>Yetkisiz erişim</h2>
                <p>Bu sayfayı görüntüleme yetkiniz yok.</p>
            </div>
        );
    }

    return (
        <div className="admin-page main-content">
            <h1>Admin Paneli</h1>

            {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

            {/* 📌 Yeni Kullanıcı Ekleme Formu */}
            <section className="admin-section">
                <h2>Yeni Kullanıcı Ekle</h2>
                <form onSubmit={handleAddUser} className="admin-add-user-form">
                    <input
                        type="text"
                        placeholder="Telefon"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="İsim"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit">Ekle</button>
                </form>
            </section>

            {/* Fiziksel Kayıtlar Tablosu */}
            <section className="admin-section">
                <h2>Fiziksel Kayıtlar</h2>
                {loadingPhysio ? (
                    <p>Yükleniyor...</p>
                ) : physioRecords.length === 0 ? (
                    <p>Fiziksel kayıt bulunamadı.</p>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Tip</th>
                                <th>Saat</th>
                                <th>Kalite</th>
                                <th>Notlar</th>
                                <th>Tarih</th>
                            </tr>
                            </thead>
                            <tbody>
                            {physioRecords.map((rec) => (
                                <tr key={rec._id}>
                                    <td>{rec.user?.name || '—'}</td>
                                    <td>{rec.type}</td>
                                    <td>{rec.hours || '-'}</td>
                                    <td>{rec.quality || '-'}</td>
                                    <td>{rec.notes || '-'}</td>
                                    <td>{new Date(rec.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Destek Talepleri Tablosu */}
            <section className="admin-section">
                <h2>Destek Talepleri</h2>
                {loadingSupport ? (
                    <p>Yükleniyor...</p>
                ) : supportRequests.length === 0 ? (
                    <p>Destek talebi bulunamadı.</p>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Telefon</th>
                                <th>Konu</th>
                                <th>Mesaj</th>
                                <th>Tarih</th>
                            </tr>
                            </thead>
                            <tbody>
                            {supportRequests.map((req) => (
                                <tr key={req._id}>
                                    <td>{req.name || req.user?.name || '—'}</td>
                                    <td>{req.phone || req.user?.phone || '—'}</td>
                                    <td>{req.subject}</td>
                                    <td>{req.message}</td>
                                    <td>{new Date(req.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
