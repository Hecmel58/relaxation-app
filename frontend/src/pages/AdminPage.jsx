import { useEffect, useState } from 'react';
import './AdminPage.css';
import { apiService } from '../services/api';

export default function AdminPage({ user }) {
    const [physioRecords, setPhysioRecords] = useState([]);
    const [supportRequests, setSupportRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingPhysio, setLoadingPhysio] = useState(true);
    const [loadingSupport, setLoadingSupport] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // 📌 Yeni kullanıcı formu state
    const [newUser, setNewUser] = useState({ 
        phone: '', 
        password: '', 
        name: '', 
        role: 'user' 
    });
    const [addingUser, setAddingUser] = useState(false);

    useEffect(() => {
        console.log('🔍 AdminPage - Kullanıcı kontrol:', { user: user, role: user?.role });
        
        if (!user || user.role !== 'admin') {
            console.warn('⚠️ Admin değil:', user);
            return;
        }

        fetchData();
    }, [user]);

    const fetchData = async () => {
        // Physio kayıtları
        try {
            const physioData = await apiService.getAllPhysioRecords();
            setPhysioRecords(physioData || []);
        } catch (err) {
            console.error('Fiziksel kayıtlar alınamadı:', err);
            setErrorMsg('Fiziksel kayıtlar yüklenirken hata oluştu.');
        } finally {
            setLoadingPhysio(false);
        }

        // Destek talepleri
        try {
            const supportData = await apiService.getAllSupportRequests();
            setSupportRequests(supportData || []);
        } catch (err) {
            console.error('Destek talepleri alınamadı:', err);
            setErrorMsg('Destek talepleri yüklenirken hata oluştu.');
        } finally {
            setLoadingSupport(false);
        }

        // Kullanıcılar
        try {
            const usersData = await apiService.getUsers();
            setUsers(usersData || []);
        } catch (err) {
            console.error('Kullanıcılar alınamadı:', err);
            setErrorMsg('Kullanıcılar yüklenirken hata oluştu.');
        } finally {
            setLoadingUsers(false);
        }
    };

    // 📌 Yeni kullanıcı ekleme fonksiyonu
    const handleAddUser = async (e) => {
        e.preventDefault();
        
        if (!newUser.phone || !newUser.password) {
            setErrorMsg('Telefon ve şifre zorunludur.');
            return;
        }

        setAddingUser(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await apiService.addUser(newUser);
            setNewUser({ phone: '', password: '', name: '', role: 'user' });
            setSuccessMsg('Kullanıcı başarıyla eklendi.');
            
            // Kullanıcıları yeniden yükle
            const usersData = await apiService.getUsers();
            setUsers(usersData || []);
            
        } catch (err) {
            console.error('Kullanıcı eklenirken hata:', err);
            setErrorMsg(err.message || 'Kullanıcı eklenemedi.');
        } finally {
            setAddingUser(false);
        }
    };

    // 📌 Kullanıcı silme
    const handleDeleteUser = async (userId, userPhone) => {
        if (!confirm(`${userPhone} kullanıcısını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await apiService.deleteUser(userId);
            setSuccessMsg('Kullanıcı başarıyla silindi.');
            
            // Kullanıcıları yeniden yükle
            const usersData = await apiService.getUsers();
            setUsers(usersData || []);
            
        } catch (err) {
            console.error('Kullanıcı silinirken hata:', err);
            setErrorMsg(err.message || 'Kullanıcı silinemedi.');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="main-content">
                <div className="alert error">
                    <h2>❌ Yetkisiz Erişim</h2>
                    <p>Bu sayfayı görüntüleme yetkiniz yok.</p>
                    <p><strong>Mevcut Kullanıcı:</strong> {user?.phone || 'Bilinmiyor'}</p>
                    <p><strong>Mevcut Rol:</strong> {user?.role || 'Bilinmiyor'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="admin-page">
                <div className="admin-header">
                    <h1>⚙️ Admin Paneli</h1>
                    <p>Sistem yönetim paneline hoşgeldiniz, {user.name || user.phone}</p>
                </div>

                {/* Mesajlar */}
                {errorMsg && <div className="alert error">{errorMsg}</div>}
                {successMsg && <div className="alert success">{successMsg}</div>}

                {/* Kullanıcı Ekleme Formu */}
                <div className="card">
                    <div className="card-header">
                        <h2>👤 Yeni Kullanıcı Ekle</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleAddUser} className="admin-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Telefon Numarası *</label>
                                    <input
                                        type="text"
                                        placeholder="5394870058"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        required
                                        disabled={addingUser}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Şifre *</label>
                                    <input
                                        type="password"
                                        placeholder="Minimum 6 karakter"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        disabled={addingUser}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>İsim</label>
                                    <input
                                        type="text"
                                        placeholder="Kullanıcı adı (opsiyonel)"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        disabled={addingUser}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        disabled={addingUser}
                                    >
                                        <option value="user">👤 Kullanıcı</option>
                                        <option value="admin">👑 Admin</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={addingUser} className="btn btn-success">
                                {addingUser ? 'Ekleniyor...' : '➕ Kullanıcı Ekle'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Kullanıcılar Tablosu */}
                <div className="card">
                    <div className="card-header">
                        <h2>👥 Kullanıcı Listesi ({users.length})</h2>
                    </div>
                    <div className="card-body">
                        {loadingUsers ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                Kullanıcılar yükleniyor...
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-center">Henüz kullanıcı bulunamadı.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Telefon</th>
                                            <th>İsim</th>
                                            <th>Rol</th>
                                            <th>Kayıt Tarihi</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td>{u.phone}</td>
                                                <td>{u.name || '-'}</td>
                                                <td>
                                                    <span className={`role-badge ${u.role}`}>
                                                        {u.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
                                                    </span>
                                                </td>
                                                <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                                                <td>
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id, u.phone)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            🗑️ Sil
                                                        </button>
                                                    )}
                                                    {u.role === 'admin' && <span className="text-muted">-</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fiziksel Kayıtlar */}
                <div className="card">
                    <div className="card-header">
                        <h2>💤 Fiziksel Kayıtlar ({physioRecords.length})</h2>
                    </div>
                    <div className="card-body">
                        {loadingPhysio ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                Kayıtlar yükleniyor...
                            </div>
                        ) : physioRecords.length === 0 ? (
                            <p className="text-center">Henüz fiziksel kayıt bulunamadı.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Kullanıcı</th>
                                            <th>Tip</th>
                                            <th>Saat/Kalite</th>
                                            <th>Notlar</th>
                                            <th>Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {physioRecords.map((rec) => (
                                            <tr key={rec._id}>
                                                <td>{rec.user?.phone || rec.user?.name || '?'}</td>
                                                <td>{rec.type || 'Bilinmiyor'}</td>
                                                <td>
                                                    {rec.hours && `${rec.hours} saat`}
                                                    {rec.quality && ` (${rec.quality})`}
                                                </td>
                                                <td>{rec.notes || '-'}</td>
                                                <td>{new Date(rec.createdAt).toLocaleDateString('tr-TR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Destek Talepleri */}
                <div className="card">
                    <div className="card-header">
                        <h2>💬 Destek Talepleri ({supportRequests.length})</h2>
                    </div>
                    <div className="card-body">
                        {loadingSupport ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                Talepler yükleniyor...
                            </div>
                        ) : supportRequests.length === 0 ? (
                            <p className="text-center">Henüz destek talebi bulunamadı.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Kullanıcı</th>
                                            <th>İsim</th>
                                            <th>Telefon</th>
                                            <th>Konu</th>
                                            <th>Mesaj</th>
                                            <th>Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supportRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td>{req.user?.phone || '?'}</td>
                                                <td>{req.name || req.user?.name || '-'}</td>
                                                <td>{req.phone || req.user?.phone || '-'}</td>
                                                <td>{req.subject || '-'}</td>
                                                <td title={req.message}>
                                                    {req.message?.length > 50 
                                                        ? `${req.message.substring(0, 50)}...`
                                                        : req.message || '-'
                                                    }
                                                </td>
                                                <td>{new Date(req.createdAt).toLocaleDateString('tr-TR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}