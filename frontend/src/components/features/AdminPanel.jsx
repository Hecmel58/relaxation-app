import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AdminSleepData from './AdminSleepData';
import AdminMessages from './AdminMessages';
import AdminForms from './AdminForms';
import AdminHeartRateData from './AdminHeartRateData';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

function AdminPanel() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      const [usersRes, statsRes, passwordResetRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/password-reset-requests')
      ]);
      setUsers(usersRes.data.users || []);
      setStats(statsRes.data.stats || null);
      setPasswordResetRequests(passwordResetRes.data.requests || []);
    } catch (error) {
      console.error('Admin verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      alert('Kullanıcı silindi');
      loadAdminData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Kullanıcı silinemedi');
    }
  };

  const handleChangeGroup = async (userId, currentGroup) => {
    const newGroup = currentGroup === 'control' ? 'experiment' : 'control';
    const groupName = newGroup === 'experiment' ? 'Deney' : 'Kontrol';
    
    if (!confirm(`Kullanıcıyı ${groupName} grubuna taşımak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await api.put(`/admin/users/${userId}`, { abGroup: newGroup });
      alert('Grup değiştirildi');
      loadAdminData();
    } catch (error) {
      console.error('Grup değiştirme hatası:', error);
      alert('Grup değiştirilemedi');
    }
  };

  const handleApprovePasswordReset = async (requestId) => {
    if (!newPassword || newPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (!confirm('Bu şifre sıfırlama talebini onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    setProcessingRequestId(requestId);
    try {
      const response = await api.post('/admin/password-reset/approve', {
        requestId,
        newPassword
      });
      
      if (response.data.success) {
        alert(`✅ Şifre güncellendi!\n\nTelefon: ${response.data.phone}\nYeni Şifre: ${response.data.newPassword}\n\nKullanıcıya bu bilgileri iletmeyi unutmayın!`);
        setNewPassword('');
        loadAdminData();
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      alert('Şifre sıfırlanamadı: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectPasswordReset = async (requestId) => {
    if (!confirm('Bu şifre sıfırlama talebini reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    setProcessingRequestId(requestId);
    try {
      await api.post('/admin/password-reset/reject', { requestId });
      alert('Talep reddedildi');
      loadAdminData();
    } catch (error) {
      console.error('Talep reddetme hatası:', error);
      alert('Talep reddedilemedi');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const tabs = [
    { id: 'users', name: 'Kullanıcılar', icon: '👥' },
    { id: 'password-reset', name: 'Şifre Sıfırlama', icon: '🔑', badge: passwordResetRequests.length },
    { id: 'sleep', name: 'Uyku Verileri', icon: '😴' },
    { id: 'heart-rate', name: 'Kalp Atım Hızı', icon: '💗' },
    { id: 'forms', name: 'Form Yanıtları', icon: '📋' },
    { id: 'messages', name: 'Mesajlar', icon: '💬' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600 mt-1">Sistem yönetimi ve kullanıcı takibi</p>
        </div>
        {activeTab === 'users' && (
          <Button onClick={() => setShowAddUserModal(true)}>
            Yeni Kullanıcı Ekle
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stats.users?.total || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Toplam Kullanıcı</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-wellness-600">{stats.users?.control || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Kontrol Grubu</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600">{stats.users?.experiment || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Deney Grubu</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-600">{stats.sleep?.totalRecords || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Uyku Kaydı</div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-semibold text-slate-900">{u.name || 'İsimsiz'}</div>
                        {u.is_admin && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{u.phone}</div>
                      {u.email && <div className="text-xs text-slate-500 mt-1">{u.email}</div>}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleChangeGroup(u.id, u.ab_group)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          u.ab_group === 'experiment' 
                            ? 'bg-warning-100 text-warning-800 hover:bg-warning-200' 
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                        title="Grup değiştirmek için tıklayın"
                      >
                        {u.ab_group === 'experiment' ? 'Deney' : 'Kontrol'}
                      </button>
                      <span className="text-xs text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(u)}
                      >
                        Düzenle
                      </Button>
                      {!u.is_admin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Sil
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'password-reset' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Bekleyen Şifre Sıfırlama Talepleri ({passwordResetRequests.length})
              </h3>
              
              {passwordResetRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-2">🔑</div>
                  <p>Bekleyen şifre sıfırlama talebi yok</p>
                </div>
              ) : (
                passwordResetRequests.map(request => (
                  <div key={request.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{request.user_name}</div>
                        <div className="text-sm text-slate-600 mt-1">📱 {request.phone}</div>
                        {request.email && (
                          <div className="text-sm text-slate-600">📧 {request.email}</div>
                        )}
                        <div className="text-xs text-slate-500 mt-2">
                          Talep Tarihi: {new Date(request.created_at).toLocaleString('tr-TR')}
                        </div>
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Yeni şifre (min 6 karakter)"
                            value={processingRequestId === request.id ? newPassword : ''}
                            onChange={(e) => {
                              setProcessingRequestId(request.id);
                              setNewPassword(e.target.value);
                            }}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-64"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePasswordReset(request.id)}
                            disabled={processingRequestId !== request.id || !newPassword}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✅ Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectPasswordReset(request.id)}
                            disabled={processingRequestId && processingRequestId !== request.id}
                          >
                            ❌ Reddet
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sleep' && <AdminSleepData />}
          
          {activeTab === 'heart-rate' && <AdminHeartRateData />}
          
          {activeTab === 'forms' && <AdminForms />}
          
          {activeTab === 'messages' && <AdminMessages />}
        </div>
      </Card>

      {showAddUserModal && (
        <AddUserModal 
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            setShowAddUserModal(false);
            loadAdminData();
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            loadAdminData();
          }}
        />
      )}
    </div>
  );
}

export default AdminPanel;