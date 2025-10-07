import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function AdminHeartRateData() {
  const [heartRateData, setHeartRateData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadHeartRateData();
  }, []);

  const loadHeartRateData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/heart-rate-data');
      const sessions = response.data.sessions || [];
      setHeartRateData(sessions);
      
      const grouped = sessions.reduce((acc, session) => {
        const userId = session.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            user_name: session.user_name,
            user_phone: session.user_phone,
            ab_group: session.ab_group,
            sessions: []
          };
        }
        acc[userId].sessions.push(session);
        return acc;
      }, {});
      
      setGroupedData(Object.values(grouped));
    } catch (error) {
      console.error('Kalp atım hızı verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const calculateChange = (before, after) => {
    const change = after - before;
    const percent = ((change / before) * 100).toFixed(1);
    return { change, percent };
  };

  const handleViewDetails = (userGroup) => {
    setSelectedUser(userGroup);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Kalp atım hızı verileri yükleniyor...</p>
      </div>
    );
  }

  if (selectedUser) {
    return <UserHeartRateDetail user={selectedUser} onClose={() => setSelectedUser(null)} formatDate={formatDate} calculateChange={calculateChange} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{heartRateData.length}</div>
          <div className="text-sm text-slate-600 mt-1">Toplam Kalp Atım Hızı Kaydı</div>
        </div>
      </Card>

      {groupedData.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❤️</div>
            <p className="text-slate-600">Henüz kalp atım hızı kaydı bulunmuyor</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedData.map((userGroup) => {
            const latestSession = userGroup.sessions[0];
            const { change, percent } = calculateChange(latestSession.heart_rate_before, latestSession.heart_rate_after);
            
            return (
              <Card key={userGroup.user_id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-semibold text-slate-900">
                        {userGroup.user_name || 'Kullanıcı'}
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                        {userGroup.user_phone || 'Tel yok'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userGroup.ab_group === 'experiment' 
                          ? 'bg-warning-100 text-warning-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {userGroup.ab_group === 'experiment' ? 'Deney' : 'Kontrol'}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {userGroup.sessions.length} kayıt
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">Son Tarih</div>
                        <div className="font-medium">
                          {formatDate(latestSession.created_at)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">İçerik</div>
                        <div className="font-medium">{latestSession.content_name}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Önce</div>
                        <div className="font-medium text-red-600">{latestSession.heart_rate_before} bpm</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Sonra</div>
                        <div className="font-medium text-green-600">{latestSession.heart_rate_after} bpm</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Değişim</div>
                        <div className={`font-medium ${change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change > 0 ? '+' : ''}{change} ({percent}%)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(userGroup)}
                  >
                    Detay
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserHeartRateDetail({ user, onClose, formatDate, calculateChange }) {
  const sortedSessions = [...user.sessions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const avgBefore = (user.sessions.reduce((sum, s) => sum + s.heart_rate_before, 0) / user.sessions.length).toFixed(1);
  const avgAfter = (user.sessions.reduce((sum, s) => sum + s.heart_rate_after, 0) / user.sessions.length).toFixed(1);
  const avgChange = (avgAfter - avgBefore).toFixed(1);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kalp Atım Hızı Detayı - {user.user_name}</h2>
        <Button variant="outline" onClick={onClose}>Geri Dön</Button>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Kullanıcı Bilgileri</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-slate-500 text-sm">Ad:</span>
                <div className="font-medium">{user.user_name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Telefon:</span>
                <div className="font-medium">{user.user_phone}</div>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Grup:</span>
                <div className={`inline-block px-2 py-1 rounded text-xs ${
                  user.ab_group === 'experiment' ? 'bg-warning-100 text-warning-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {user.ab_group === 'experiment' ? 'Deney' : 'Kontrol'}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Ortalama Değerler</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Ort. Önce</div>
                <div className="font-semibold text-red-700">{avgBefore} bpm</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Ort. Sonra</div>
                <div className="font-semibold text-green-700">{avgAfter} bpm</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Ort. Değişim</div>
                <div className={`font-semibold ${avgChange < 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {avgChange > 0 ? '+' : ''}{avgChange} bpm
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-lg mb-4">Tüm Kayıtlar ({sortedSessions.length})</h3>
        <div className="space-y-3">
          {sortedSessions.map((session) => {
            const { change, percent } = calculateChange(session.heart_rate_before, session.heart_rate_after);
            
            return (
              <div key={session.id} className="border rounded p-3">
                <div className="grid grid-cols-6 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Tarih</div>
                    <div className="font-medium">{formatDate(session.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">İçerik Tipi</div>
                    <div className="font-medium">
                      {session.content_type === 'relaxation' ? 'Rahatlama' : 'Binaural'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">İçerik</div>
                    <div className="font-medium">{session.content_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Önce</div>
                    <div className="font-medium text-red-600">{session.heart_rate_before} bpm</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Sonra</div>
                    <div className="font-medium text-green-600">{session.heart_rate_after} bpm</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Değişim</div>
                    <div className={`font-medium ${change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change > 0 ? '+' : ''}{change} ({percent}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default AdminHeartRateData;