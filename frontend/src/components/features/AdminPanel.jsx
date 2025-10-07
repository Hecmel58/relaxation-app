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

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data.users || []);
      setStats(statsRes.data.stats || null);
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

  const tabs = [
    { id: 'users', name: 'Kullanıcılar', icon: '👥' },
    { id: 'sleep', name: 'Uyku Verileri', icon: '😴' },
    { id: 'heart-rate', name: 'Kalp Atım Hızı', icon: '❤️' },
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
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
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