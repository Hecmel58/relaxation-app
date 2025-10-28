import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sleepSessions, setSleepSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSleepSessions();
  }, []);

  const loadSleepSessions = async () => {
    try {
      const response = await api.get('/sleep/sessions');
      setSleepSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to load sleep sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Geçersiz tarih';
      }
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      return dateString;
    }
  };

  const lastSleep = sleepSessions[0];
  const avgQuality = sleepSessions.length > 0 
    ? (sleepSessions.reduce((sum, s) => sum + s.sleep_quality, 0) / sleepSessions.length).toFixed(1)
    : 0;

  const stats = [
    {
      title: 'Son Uyku Kalitesi',
      value: lastSleep ? `${lastSleep.sleep_quality}/10` : '—',
      subtitle: lastSleep ? formatDate(lastSleep.sleep_date) : 'Henüz kayıt yok',
      color: 'text-primary-600'
    },
    {
      title: 'Ortalama Kalite',
      value: avgQuality > 0 ? `${avgQuality}/10` : '—',
      subtitle: `${sleepSessions.length} kayıt`,
      color: 'text-wellness-600'
    },
    {
      title: 'A/B Test Grubu',
      value: user?.abGroup === 'experiment' ? 'Deney' : 'Kontrol',
      subtitle: user?.abGroup === 'experiment' ? 'Beta özellikler aktif' : 'Temel özellikler',
      color: user?.abGroup === 'experiment' ? 'text-warning-600' : 'text-slate-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Hoş Geldiniz, {user?.name || 'Kullanıcı'}
        </h1>
        <p className="text-slate-600 mt-1">
          Uyku kalitenizi takip edin ve sağlıklı bir yaşam sürün.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm font-medium text-slate-900 mt-1">{stat.title}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.subtitle}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/sleep')}
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl">😴</span>
            <span className="text-sm font-medium">Uyku Kaydı</span>
          </button>
          
          {user?.abGroup === 'experiment' && (
            <>
              <button
                onClick={() => navigate('/relaxation')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="text-2xl">🧘‍♀️</span>
                <span className="text-sm font-medium">Rahatlama</span>
              </button>
              <button
                onClick={() => navigate('/binaural')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="text-2xl">🎵</span>
                <span className="text-sm font-medium">Binaural Sesler</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => navigate('/support')}
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <span className="text-sm font-medium">Uzman Desteği</span>
          </button>
        </div>
      </Card>

      {sleepSessions.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Son Uyku Kayıtları</h3>
          <div className="space-y-3">
            {sleepSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">
                    {formatDate(session.sleep_date)}
                  </div>
                  <div className="text-sm text-slate-500">{session.notes || 'Not eklenmemiş'}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-600">{session.sleep_quality}/10</div>
                  <div className="text-xs text-slate-500">kalite</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {user?.abGroup === 'experiment' && (
        <Card className="border-l-4 border-l-warning-500 bg-warning-50">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🧪</span>
            <div>
              <h4 className="text-lg font-semibold text-warning-800">Beta Kullanıcısı</h4>
              <p className="text-warning-700 text-sm mt-1">
                Yeni özellikleri test ediyorsunuz: Rahatlama teknikleri ve Binaural sesler. 
                Deneyimlerinizi uzmanlarımızla paylaşmayı unutmayın.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default DashboardPage;