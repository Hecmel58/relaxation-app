import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function AdminSleepData() {
  const [sleepData, setSleepData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/sleep-data');
      const sessions = response.data.sessions || [];
      setSleepData(sessions);
      
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
      
      if (sessions.length > 0) {
        const avgQuality = sessions.reduce((sum, s) => sum + (s.sleep_quality || 0), 0) / sessions.length;
        const avgDuration = sessions.reduce((sum, s) => sum + (s.sleep_duration || 0), 0) / sessions.length;
        
        setStats({
          totalSessions: sessions.length,
          avgQuality: avgQuality.toFixed(1),
          avgDuration: (avgDuration / 60).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Uyku verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSleepHistory = async (userId) => {
    try {
      const response = await api.get(`/admin/sleep-history/${userId}`);
      return response.data.sessions || [];
    } catch (error) {
      console.error('Kullanıcı geçmişi yüklenemedi:', error);
      return [];
    }
  };

  const handleViewDetails = async (userGroup) => {
    const history = userGroup.sessions;
    setSelectedSession({ ...userGroup.sessions[0], history, user_name: userGroup.user_name, user_phone: userGroup.user_phone, ab_group: userGroup.ab_group });
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Bu uyku kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/admin/sleep-sessions/${sessionId}`);
      
      // Detay görünümünü kapat ve verileri yeniden yükle
      setSelectedSession(null);
      await loadSleepData();
      
      alert('Uyku kaydı başarıyla silindi');
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Uyku kaydı silinemedi: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // ✅ YENİ: CSV İNDİRME FONKSİYONU
  const handleDownloadUserData = async (userGroup) => {
    try {
      const headers = [
        'Kullanıcı Adı',
        'Telefon',
        'Tarih',
        'Uyku Süresi (dk)',
        'Uyku Kalitesi',
        'REM Süresi (dk)',
        'Derin Uyku (dk)',
        'Hafif Uyku (dk)',
        'Uyanıklık (dk)',
        'Kalp Atımı',
        'Stres Seviyesi',
        'Verimlilik (%)',
        'Notlar'
      ];

      const rows = userGroup.sessions.map(session => [
        userGroup.user_name || '',
        userGroup.user_phone || '',
        formatDate(session.sleep_date),
        session.sleep_duration || 0,
        session.sleep_quality || 0,
        session.rem_duration || 0,
        session.deep_sleep_duration || 0,
        session.light_sleep_duration || 0,
        session.awake_duration || 0,
        session.heart_rate || 0,
        session.stress_level || 0,
        session.sleep_efficiency || 0,
        session.notes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `uyku-verileri-${userGroup.user_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('Veriler indirilemedi');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Uyku verileri yükleniyor...</p>
      </div>
    );
  }

  if (selectedSession) {
    return <SleepDetailView session={selectedSession} onClose={() => setSelectedSession(null)} formatDate={formatDate} onDeleteSession={handleDeleteSession} />;
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stats.totalSessions}</div>
              <div className="text-sm text-slate-600 mt-1">Toplam Kayıt</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-wellness-600">{stats.avgQuality}/10</div>
              <div className="text-sm text-slate-600 mt-1">Ort. Kalite</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600">{stats.avgDuration}sa</div>
              <div className="text-sm text-slate-600 mt-1">Ort. Süre</div>
            </div>
          </Card>
        </div>
      )}

      {groupedData.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😴</div>
            <p className="text-slate-600">Henüz uyku kaydı bulunmuyor</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedData.map((userGroup) => {
            const latestSession = userGroup.sessions[0];
            const hours = Math.floor(latestSession.sleep_duration / 60);
            const minutes = latestSession.sleep_duration % 60;
            const totalSessions = userGroup.sessions.length;
            
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
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                        {totalSessions} kayıt
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">Son Tarih</div>
                        <div className="font-medium">
                          {formatDate(latestSession.sleep_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Son Süre</div>
                        <div className="font-medium">{hours}sa {minutes}dk</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Son Kalite</div>
                        <div className="font-medium">{latestSession.sleep_quality}/10</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Son REM</div>
                        <div className="font-medium">{latestSession.rem_duration || 0}dk</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Son Kalp</div>
                        <div className="font-medium">{latestSession.heart_rate || 0} bpm</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Son Verimlilik</div>
                        <div className="font-medium">
                          {latestSession.sleep_efficiency ? `${latestSession.sleep_efficiency}%` : '-'}
                        </div>
                      </div>
                    </div>

                    {latestSession.notes && (
                      <div className="mt-3 p-2 bg-slate-50 rounded text-sm text-slate-700">
                        <span className="font-medium">Son Not:</span> {latestSession.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(userGroup)}
                    >
                      Detay
                    </Button>
                    {/* ✅ YENİ: İNDİR BUTONU */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadUserData(userGroup)}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      📥 İndir
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SleepDetailView({ session, onClose, formatDate, onDeleteSession }) {
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  
  const hours = Math.floor(session.sleep_duration / 60);
  const minutes = session.sleep_duration % 60;

  const analyzeHistory = (history) => {
    const now = new Date();
    const week = history.filter(s => new Date(s.sleep_date) >= new Date(now - 7 * 24 * 60 * 60 * 1000));
    const twoWeeks = history.filter(s => new Date(s.sleep_date) >= new Date(now - 15 * 24 * 60 * 60 * 1000));
    const month = history.filter(s => new Date(s.sleep_date) >= new Date(now - 30 * 24 * 60 * 60 * 1000));

    const calcAvg = (data, field) => {
      if (data.length === 0) return 0;
      return (data.reduce((sum, s) => sum + (s[field] || 0), 0) / data.length).toFixed(1);
    };

    return {
      week: {
        count: week.length,
        avgQuality: calcAvg(week, 'sleep_quality'),
        avgDuration: calcAvg(week, 'sleep_duration'),
        avgRem: calcAvg(week, 'rem_duration'),
        avgDeep: calcAvg(week, 'deep_sleep_duration'),
        avgLight: calcAvg(week, 'light_sleep_duration'),
        avgHeart: calcAvg(week, 'heart_rate')
      },
      twoWeeks: {
        count: twoWeeks.length,
        avgQuality: calcAvg(twoWeeks, 'sleep_quality'),
        avgDuration: calcAvg(twoWeeks, 'sleep_duration'),
        avgRem: calcAvg(twoWeeks, 'rem_duration'),
        avgDeep: calcAvg(twoWeeks, 'deep_sleep_duration'),
        avgLight: calcAvg(twoWeeks, 'light_sleep_duration'),
        avgHeart: calcAvg(twoWeeks, 'heart_rate')
      },
      month: {
        count: month.length,
        avgQuality: calcAvg(month, 'sleep_quality'),
        avgDuration: calcAvg(month, 'sleep_duration'),
        avgRem: calcAvg(month, 'rem_duration'),
        avgDeep: calcAvg(month, 'deep_sleep_duration'),
        avgLight: calcAvg(month, 'light_sleep_duration'),
        avgHeart: calcAvg(month, 'heart_rate')
      }
    };
  };

  const analysis = session.history ? analyzeHistory(session.history) : null;
  const sortedHistory = session.history ? [...session.history].sort((a, b) => new Date(b.sleep_date) - new Date(a.sleep_date)) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Uyku Detayı - {session.user_name}</h2>
        <Button variant="outline" onClick={onClose}>Geri Dön</Button>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Kullanıcı Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 text-sm">Ad:</span>
                <div className="font-medium">{session.user_name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Telefon:</span>
                <div className="font-medium">{session.user_phone}</div>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Grup:</span>
                <div className={`inline-block px-2 py-1 rounded text-xs ${
                  session.ab_group === 'experiment' ? 'bg-warning-100 text-warning-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {session.ab_group === 'experiment' ? 'Deney' : 'Kontrol'}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Son Uyku Kaydı</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Tarih</div>
                <div className="font-semibold">{formatDate(session.sleep_date)}</div>
              </div>
              <div className="bg-primary-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Toplam Süre</div>
                <div className="font-semibold text-primary-700">{hours}sa {minutes}dk</div>
              </div>
              <div className="bg-wellness-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Kalite</div>
                <div className="font-semibold text-wellness-700">{session.sleep_quality}/10</div>
              </div>
              <div className="bg-warning-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Verimlilik</div>
                <div className="font-semibold text-warning-700">
                  {session.sleep_efficiency ? `${session.sleep_efficiency}%` : '-'}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-slate-500 text-xs">REM</div>
                <div className="font-semibold text-blue-700">{session.rem_duration || 0}dk</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Derin Uyku</div>
                <div className="font-semibold text-purple-700">{session.deep_sleep_duration || 0}dk</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div className="bg-indigo-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Hafif Uyku</div>
                <div className="font-semibold text-indigo-700">{session.light_sleep_duration || 0}dk</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Kalp Atım Hızı</div>
                <div className="font-semibold text-red-700">{session.heart_rate || 0} bpm</div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Stres Seviyesi</div>
                <div className="font-semibold text-orange-700">{session.stress_level || 0}/10</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Uyanıklık</div>
                <div className="font-semibold text-green-700">{session.awake_duration || 0}dk</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {analysis && (
        <Card>
          <h3 className="font-semibold text-lg mb-4">Periyodik Analiz</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <h4 className="font-medium text-primary-700 mb-3">Son 7 Gün</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kayıt Sayısı:</span>
                  <span className="font-semibold">{analysis.week.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Kalite:</span>
                  <span className="font-semibold">{analysis.week.avgQuality}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Süre:</span>
                  <span className="font-semibold">{(analysis.week.avgDuration / 60).toFixed(1)}sa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. REM:</span>
                  <span className="font-semibold">{analysis.week.avgRem}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Derin:</span>
                  <span className="font-semibold">{analysis.week.avgDeep}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Hafif:</span>
                  <span className="font-semibold">{analysis.week.avgLight}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Kalp:</span>
                  <span className="font-semibold">{analysis.week.avgHeart} bpm</span>
                </div>
              </div>
            </div>

            <div className="border rounded p-4">
              <h4 className="font-medium text-wellness-700 mb-3">Son 15 Gün</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kayıt Sayısı:</span>
                  <span className="font-semibold">{analysis.twoWeeks.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Kalite:</span>
                  <span className="font-semibold">{analysis.twoWeeks.avgQuality}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Süre:</span>
                  <span className="font-semibold">{(analysis.twoWeeks.avgDuration / 60).toFixed(1)}sa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. REM:</span>
                  <span className="font-semibold">{analysis.twoWeeks.avgRem}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Derin:</span>
                  <span className="font-semibold">{analysis.twoWeeks.avgDeep}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Hafif:</span>
                  <span className="font-semibold">{analysis.twoWeeks.avgLight}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Kalp:</span>
                  <span className="font-semibold">{analysis.twoWeeks.avgHeart} bpm</span>
                </div>
              </div>
            </div>

            <div className="border rounded p-4">
              <h4 className="font-medium text-warning-700 mb-3">Son 30 Gün</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kayıt Sayısı:</span>
                  <span className="font-semibold">{analysis.month.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Kalite:</span>
                  <span className="font-semibold">{analysis.month.avgQuality}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Süre:</span>
                  <span className="font-semibold">{(analysis.month.avgDuration / 60).toFixed(1)}sa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. REM:</span>
                  <span className="font-semibold">{analysis.month.avgRem}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Derin:</span>
                  <span className="font-semibold">{analysis.month.avgDeep}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Hafif:</span>
                  <span className="font-semibold">{analysis.month.avgLight}dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ort. Kalp:</span>
                  <span className="font-semibold">{analysis.month.avgHeart} bpm</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {sortedHistory.length > 0 && (
        <Card>
          <h3 className="font-semibold text-lg mb-4">Tüm Kayıtlar ({sortedHistory.length})</h3>
          <div className="space-y-3">
            {sortedHistory.map((s) => {
              const h = Math.floor(s.sleep_duration / 60);
              const m = s.sleep_duration % 60;
              const isExpanded = expandedSessionId === s.id;
              
              return (
                <div key={s.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-6 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">Tarih</div>
                        <div className="font-medium">{formatDate(s.sleep_date)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Süre</div>
                        <div className="font-medium">{h}sa {m}dk</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Kalite</div>
                        <div className="font-medium">{s.sleep_quality}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">REM</div>
                        <div className="font-medium">{s.rem_duration}dk</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Kalp</div>
                        <div className="font-medium">{s.heart_rate} bpm</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Verimlilik</div>
                        <div className="font-medium">{s.sleep_efficiency}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                      >
                        {isExpanded ? 'Gizle' : 'Detay'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteSession(s.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">Derin Uyku</div>
                        <div>{s.deep_sleep_duration}dk</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Hafif Uyku</div>
                        <div>{s.light_sleep_duration}dk</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Uyanıklık</div>
                        <div>{s.awake_duration}dk</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Kalp</div>
                        <div>{s.heart_rate} bpm</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Stres</div>
                        <div>{s.stress_level}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Ekran Süresi</div>
                        <div>{s.screen_time_before}dk</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Oda Sıcaklığı</div>
                        <div>{s.room_temperature}°C</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Ruh Hali Önce/Sonra</div>
                        <div>{s.mood_before}/{s.mood_after}</div>
                      </div>
                      {s.notes && (
                        <div className="col-span-4 bg-slate-50 p-2 rounded text-xs">
                          <span className="font-medium">Not:</span> {s.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminSleepData;