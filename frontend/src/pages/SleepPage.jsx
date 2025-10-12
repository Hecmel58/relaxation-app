import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import SleepForm from '../components/features/SleepForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function SleepPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sleep/sessions');
      console.log('Sleep sessions:', response.data.sessions);
      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error('Kayıtlar yüklenemedi', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const totalSleep = (formData.rem_duration || 0) + 
                        (formData.deep_sleep_duration || 0) + 
                        (formData.light_sleep_duration || 0);
      
      console.log('Submitting sleep data:', { ...formData, total_sleep_minutes: totalSleep });
      
      const response = await api.post('/sleep/sessions', {
        ...formData,
        total_sleep_minutes: totalSleep
      });

      console.log('Sleep session created:', response.data);
      
      setShowForm(false);
      fetchSessions();
      alert('Uyku kaydı başarıyla oluşturuldu!');
    } catch (err) {
      console.error('Sleep form submit error:', err);
      alert(err.response?.data?.error || 'Kayıt eklenemedi');
    }
  };

  const formatSleepDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0sa 0dk';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60); // ✅ Math.round ile yuvarla
    return `${hours}sa ${mins}dk`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Geçersiz tarih';
      }
      return date.toLocaleDateString('tr-TR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Tarih formatlama hatası:', error);
      return dateString;
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Yeni Uyku Kaydı</h1>
            <p className="text-slate-600 mt-1">Detaylı uyku bilgilerinizi girin</p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(false)}>Geri Dön</Button>
        </div>
        
        <SleepForm onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  const totalSleepAvg = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.sleep_duration || 0), 0) / sessions.length 
    : 0;

  const qualityAvg = sessions.length > 0 
    ? (sessions.reduce((sum, s) => sum + (s.sleep_quality || 0), 0) / sessions.length).toFixed(1)
    : 0;

  const thisWeekCount = sessions.filter(s => {
    try {
      const sessionDate = new Date(s.sleep_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return !isNaN(sessionDate.getTime()) && sessionDate >= weekAgo;
    } catch {
      return false;
    }
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Uyku Takibi</h1>
          <p className="text-slate-600 mt-1">Uyku kaliteni takip et ve gelişimini izle</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Yeni Kayıt Ekle</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-sm text-slate-600">Toplam Kayıt</div>
          <div className="text-3xl font-bold text-primary-600">{sessions.length}</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-sm text-slate-600">Ortalama Kalite</div>
          <div className="text-3xl font-bold text-wellness-600">{qualityAvg}/10</div>
        </Card>

        <Card className="text-center">
          <div className="text-sm text-slate-600">Ortalama Uyku</div>
          <div className="text-3xl font-bold text-primary-600">
            {formatSleepDuration(totalSleepAvg)}
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-sm text-slate-600">Bu Hafta</div>
          <div className="text-3xl font-bold text-slate-600">{thisWeekCount}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Son Kayıtlar ({sessions.length})</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😴</div>
            <p className="text-slate-500 mb-4">Henüz uyku kaydınız bulunmuyor.</p>
            <Button onClick={() => setShowForm(true)}>İlk Kaydı Oluştur</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-2">
                      {formatDate(session.sleep_date)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">Uyku Süresi:</span>
                        <span className="ml-1 font-medium text-primary-600">
                          {formatSleepDuration(session.sleep_duration)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Derin Uyku:</span>
                        <span className="ml-1 font-medium">{session.deep_sleep_duration || 0}dk</span>
                      </div>
                      <div>
                        <span className="text-slate-600">REM:</span>
                        <span className="ml-1 font-medium">{session.rem_duration || 0}dk</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Hafif Uyku:</span>
                        <span className="ml-1 font-medium">{session.light_sleep_duration || 0}dk</span>
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">"{session.notes}"</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary-600">{session.sleep_quality}/10</div>
                    <div className="text-xs text-slate-500">kalite</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default SleepPage;