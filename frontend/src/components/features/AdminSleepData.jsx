import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function AdminSleepData() {
  const [sleepData, setSleepData] = useState([]);
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
      setSleepData(response.data.sessions || []);
      
      if (response.data.sessions?.length > 0) {
        const sessions = response.data.sessions;
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

  const handleViewDetails = async (session) => {
    const history = await loadUserSleepHistory(session.user_id);
    setSelectedSession({ ...session, history });
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
    return <SleepDetailView session={selectedSession} onClose={() => setSelectedSession(null)} />;
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

      {sleepData.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😴</div>
            <p className="text-slate-600">Henüz uyku kaydı bulunmuyor</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sleepData.map((session) => {
            const hours = Math.floor(session.sleep_duration / 60);
            const minutes = session.sleep_duration % 60;
            
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-semibold text-slate-900">
                        {session.user_name || 'Kullanıcı'}
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                        {session.user_phone || 'Tel yok'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.ab_group === 'experiment' 
                          ? 'bg-warning-100 text-warning-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {session.ab_group === 'experiment' ? 'Deney' : 'Kontrol'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">Tarih</div>
                        <div className="font-medium">
                          {new Date(session.sleep_date).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Süre</div>
                        <div className="font-medium">{hours}sa {minutes}dk</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Kalite</div>
                        <div className="font-medium">{session.sleep_quality}/10</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">REM</div>
                        <div className="font-medium">{session.rem_duration || 0}dk</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Kalp</div>
                        <div className="font-medium">{session.heart_rate || 0} bpm</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Verimlilik</div>
                        <div className="font-medium">
                          {session.sleep_efficiency ? `${session.sleep_efficiency}%` : '-'}
                        </div>
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-3 p-2 bg-slate-50 rounded text-sm text-slate-700">
                        <span className="font-medium">Not:</span> {session.notes}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(session)}
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

function SleepDetailView({ session, onClose }) {
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
        avgDuration: calcAvg(week, 'sleep_duration')
      },
      twoWeeks: {
        count: twoWeeks.length,
        avgQuality: calcAvg(twoWeeks, 'sleep_quality'),
        avgDuration: calcAvg(twoWeeks, 'sleep_duration')
      },
      month: {
        count: month.length,
        avgQuality: calcAvg(month, 'sleep_quality'),
        avgDuration: calcAvg(month, 'sleep_duration')
      }
    };
  };

  const analysis = session.history ? analyzeHistory(session.history) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Uyku Detayı</h2>
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
            <h3 className="font-semibold text-lg mb-2">Uyku Verileri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Tarih</div>
                <div className="font-semibold">{new Date(session.sleep_date).toLocaleDateString('tr-TR')}</div>
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
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Uyku Evreleri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 text-xs">REM</div>
                <div className="font-semibold">{session.rem_duration || 0}dk</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Derin Uyku</div>
                <div className="font-semibold">{session.deep_sleep_duration || 0}dk</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Hafif Uyku</div>
                <div className="font-semibold">{session.light_sleep_duration || 0}dk</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Uyanıklık</div>
                <div className="font-semibold">{session.awake_duration || 0}dk</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Sağlık ve Yaşam Tarzı</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Kalp Atım Hızı</div>
                <div className="font-semibold text-red-700">{session.heart_rate || 0} bpm</div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Stres Seviyesi</div>
                <div className="font-semibold text-orange-700">{session.stress_level || 0}/10</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Ekran Süresi</div>
                <div className="font-semibold text-blue-700">{session.screen_time_before || 0}dk</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Oda Sıcaklığı</div>
                <div className="font-semibold text-purple-700">{session.room_temperature || 20}°C</div>
              </div>
            </div>
            {session.last_meal_time && (
              <div className="mt-3 p-2 bg-slate-50 rounded text-sm">
                <span className="font-medium">Son Yemek:</span> {session.last_meal_time}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Uyku Öncesi Alışkanlıklar</h3>
            <div className="flex flex-wrap gap-2">
              {session.caffeine_intake ? <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">☕ Kafein</span> : null}
              {session.alcohol_intake ? <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">🍷 Alkol</span> : null}
              {session.exercise ? <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🏃 Egzersiz</span> : null}
              {session.medication ? <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">💊 İlaç</span> : null}
              {session.meditation ? <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">🧘 Meditasyon</span> : null}
              {session.reading ? <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">📚 Kitap</span> : null}
              {!session.caffeine_intake && !session.alcohol_intake && !session.exercise && !session.medication && !session.meditation && !session.reading && (
                <span className="text-slate-500 text-sm">Kayıtlı alışkanlık yok</span>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Ruh Hali</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Uyku Öncesi</div>
                <div className="font-semibold text-blue-700">{session.mood_before || 0}/5</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-slate-500 text-xs">Uyanış Sonrası</div>
                <div className="font-semibold text-green-700">{session.mood_after || 0}/5</div>
              </div>
            </div>
          </div>

          {session.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Notlar</h3>
              <div className="bg-slate-50 p-3 rounded text-sm">{session.notes}</div>
            </div>
          )}
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
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminSleepData;