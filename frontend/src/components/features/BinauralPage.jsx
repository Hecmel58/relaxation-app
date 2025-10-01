import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function BinauralPage() {
  const { user } = useAuthStore();
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [selectedType, setSelectedType] = useState('delta');
  const audioRef = useRef(new Audio());

  const brainwaveTypes = [
    { id: 'delta', name: 'Delta Dalgalar', freq: '0.5-4 Hz', icon: '🌙', desc: 'Derin uyku' },
    { id: 'theta', name: 'Theta Dalgalar', freq: '4-8 Hz', icon: '🌅', desc: 'Meditasyon' },
    { id: 'alpha', name: 'Alpha Dalgalar', freq: '8-13 Hz', icon: '☀️', desc: 'Rahatlama' }
  ];

  useEffect(() => {
    loadSounds();
    
    const audio = audioRef.current;
    audio.addEventListener('ended', handleAudioEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, []);

  useEffect(() => {
    loadSounds();
  }, [selectedType]);

  const loadSounds = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/binaural/sounds?category=${selectedType}`);
      setSounds(response.data.sounds || []);
    } catch (error) {
      console.error('Sesler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioEnded = () => {
    setCurrentPlaying(null);
  };

  const handlePlay = (sound) => {
    const audio = audioRef.current;
    
    if (currentPlaying === sound.id) {
      audio.pause();
      setCurrentPlaying(null);
    } else {
      audio.src = sound.url;
      audio.play().catch(err => {
        console.error('Oynatma hatası:', err);
        alert('Ses dosyası oynatılamadı.');
      });
      setCurrentPlaying(sound.id);
    }
  };

  // Admin kullanıcılar veya experiment grubu erişebilir
  if (!user?.isAdmin && user?.abGroup !== 'experiment') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Beta Özellik</h2>
        <p className="text-slate-600">
          Binaural sesler şu anda seçili kullanıcılara test ediliyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Binaural Sesler</h1>
        <p className="text-slate-600 mt-1">Beyin dalgalarını etkileyerek uyku kalitenizi artırın</p>
        {user?.abGroup === 'experiment' && !user?.isAdmin && (
          <div className="mt-2 px-3 py-1 bg-warning-100 text-warning-800 text-sm rounded-full inline-block">
            BETA ÖZELLİK - Sadece Deney Grubu
          </div>
        )}
      </div>

      <Card className="bg-primary-50 border-primary-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-primary-800 mb-2">Binaural Sesler Nedir?</h4>
            <p className="text-primary-700 text-sm">
              Her kulağa farklı frekansta ses gönderilerek beyninizin belirli bir frekansı oluşturması sağlanır. 
              <br /><br />
              <strong>Önemli:</strong> Kulaklık kullanmanız gerekir!
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brainwaveTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedType === type.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <h3 className="font-semibold text-slate-900">{type.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{type.freq}</p>
            <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      ) : sounds.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-slate-600">Bu kategoride henüz ses yok</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sounds.map((sound) => (
            <Card key={sound.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">🎵</div>
                <span className="text-xs text-slate-500">
                  {Math.floor(sound.duration / 60)} dk
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {sound.name}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                {sound.description}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-slate-500">Baz Frekans</div>
                  <div className="font-semibold">{sound.base_frequency} Hz</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-slate-500">Binaural</div>
                  <div className="font-semibold">{sound.binaural_frequency} Hz</div>
                </div>
              </div>

              <Button 
                onClick={() => handlePlay(sound)}
                className="w-full"
                variant={currentPlaying === sound.id ? 'secondary' : 'primary'}
              >
                {currentPlaying === sound.id ? (
                  <>⏸️ Durdur</>
                ) : (
                  <>▶️ Dinle</>
                )}
              </Button>

              {sound.play_count > 0 && (
                <div className="mt-3 text-xs text-slate-500 text-center">
                  {sound.play_count} kez dinlendi
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BinauralPage;