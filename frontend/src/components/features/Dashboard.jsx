import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Dashboard = ({ user, sleepSessions = [] }) => {
  const lastSleep = sleepSessions[0];
  const avgQuality = sleepSessions.length > 0 
    ? (sleepSessions.reduce((sum, s) => sum + s.sleep_quality, 0) / sleepSessions.length).toFixed(1)
    : 0;

  const stats = [
    {
      title: 'Son Uyku Kalitesi',
      value: lastSleep ? `${lastSleep.sleep_quality}/10` : '—',
      subtitle: lastSleep ? new Date(lastSleep.date).toLocaleDateString('tr-TR') : 'Henüz kayıt yok',
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
      value: user.abGroup === 'experiment' ? 'Deney' : 'Kontrol',
      subtitle: user.abGroup === 'experiment' ? 'Beta özellikler aktif' : 'Temel özellikler',
      color: user.abGroup === 'experiment' ? 'text-warning-600' : 'text-slate-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Hoş Geldiniz, {user.name || 'Kullanıcı'}
        </h1>
        <p className="text-slate-600 mt-1">
          Uyku kalitenizi takip edin ve sağlıklı bir yaşam sürün.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-900 mt-1">
                {stat.title}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stat.subtitle}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <span className="text-2xl">😴</span>
            <span className="text-sm">Uyku Kaydı</span>
          </Button>
          
          {user.abGroup === 'experiment' && (
            <>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <span className="text-2xl">🧘‍♀️</span>
                <span className="text-sm">Rahatlama</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <span className="text-2xl">🎵</span>
                <span className="text-sm">Binaural Sesler</span>
              </Button>
            </>
          )}
          
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <span className="text-2xl">💬</span>
            <span className="text-sm">Uzman Desteği</span>
          </Button>
        </div>
      </Card>

      {/* Recent Sleep Records */}
      {sleepSessions.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Son Uyku Kayıtları</h3>
          <div className="space-y-3">
            {sleepSessions.slice(0, 5).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">
                    {new Date(session.date).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-sm text-slate-500">
                    {session.notes || 'Not eklenmemiş'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-600">
                    {session.sleep_quality}/10
                  </div>
                  <div className="text-xs text-slate-500">
                    kalite
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* A/B Test Info */}
      {user.abGroup === 'experiment' && (
        <Card className="border-l-4 border-l-warning-500 bg-warning-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🧪</span>
            </div>
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
};

export default Dashboard;