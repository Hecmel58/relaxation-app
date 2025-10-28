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
  const [progress, setProgress] = useState(0);
  const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [heartRateBefore, setHeartRateBefore] = useState('');
  const [heartRateAfter, setHeartRateAfter] = useState('');
  const [pendingSound, setPendingSound] = useState(null);
  const [isWaitingForAfter, setIsWaitingForAfter] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const audioRef = useRef(new Audio());

  const testSounds = {
    delta: [
      {
        id: 'test-delta-1',
        name: 'Derin Uyku 1Hz',
        description: 'Derin uyku için delta dalgası',
        base_frequency: 100,
        binaural_frequency: 1,
        duration: 3600,
        purpose: 'Derin uyku, fiziksel iyileşme',
        brainwave_type: 'delta',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        play_count: 0
      }
    ],
    theta: [
      {
        id: 'test-theta-1',
        name: 'REM Uyku 6Hz',
        description: 'REM uykusu için theta dalgası',
        base_frequency: 200,
        binaural_frequency: 6,
        duration: 2400,
        purpose: 'Derin rahatlama, meditasyon, REM uykusu',
        brainwave_type: 'theta',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        play_count: 0
      }
    ],
    alpha: [
      {
        id: 'test-alpha-1',
        name: 'Rahat Uyanıklık 10Hz',
        description: 'Rahat ama uyanık durum için alpha',
        base_frequency: 200,
        binaural_frequency: 10,
        duration: 1800,
        purpose: 'Rahat uyanıklık, odaklanma',
        brainwave_type: 'alpha',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        play_count: 0
      }
    ]
  };

  const brainwaveTypes = [
    { id: 'delta', name: 'Delta Dalgalar', freq: '0.5-4 Hz', icon: '🌙', desc: 'Derin uyku' },
    { id: 'theta', name: 'Theta Dalgalar', freq: '4-8 Hz', icon: '🌅', desc: 'Meditasyon' },
    { id: 'alpha', name: 'Alpha Dalgalar', freq: '8-13 Hz', icon: '☀️', desc: 'Rahatlama' }
  ];

  useEffect(() => {
    loadSounds();
    
    const audio = audioRef.current;
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    loadSounds();
  }, [selectedType]);

  const loadSounds = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/binaural/sounds?category=${selectedType}`);
      const apiSounds = response.data.sounds || [];
      
      if (apiSounds.length === 0) {
        setSounds(testSounds[selectedType] || []);
      } else {
        setSounds(apiSounds);
      }
    } catch (error) {
      console.error('Sesler yüklenemedi, test sesleri kullanılıyor:', error);
      setSounds(testSounds[selectedType] || []);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio.duration) {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleAudioEnded = () => {
    setIsWaitingForAfter(true);
    setShowHeartRateModal(true);
  };

  const handlePlay = (sound) => {
    const audio = audioRef.current;
    
    if (currentPlaying === sound.id) {
      audio.pause();
      setCurrentPlaying(null);
      setProgress(0);
    } else {
      setPendingSound(sound);
      setIsWaitingForAfter(false);
      setShowHeartRateModal(true);
    }
  };

  const handleHeartRateSubmit = async () => {
    if (isWaitingForAfter) {
      if (!heartRateAfter || heartRateAfter < 40 || heartRateAfter > 200) {
        alert('Lütfen geçerli bir kalp atım hızı girin (40-200 arası)');
        return;
      }

      try {
        await api.post('/heart-rate/sessions', {
          content_type: 'binaural',
          content_id: currentPlaying,
          content_name: pendingSound?.name || 'Bilinmeyen',
          heart_rate_before: parseInt(heartRateBefore),
          heart_rate_after: parseInt(heartRateAfter),
          duration: Math.floor((Date.now() - sessionStartTime) / 1000)
        });

        setCurrentPlaying(null);
        setProgress(0);
        setShowHeartRateModal(false);
        setHeartRateBefore('');
        setHeartRateAfter('');
        setPendingSound(null);
        setIsWaitingForAfter(false);
        alert('Kalp atım hızı kaydedildi!');
      } catch (error) {
        console.error('Kalp atım hızı kaydedilemedi:', error);
        alert('Kayıt başarısız oldu');
      }
    } else {
      if (!heartRateBefore || heartRateBefore < 40 || heartRateBefore > 200) {
        alert('Lütfen geçerli bir kalp atım hızı girin (40-200 arası)');
        return;
      }

      const audio = audioRef.current;
      audio.src = pendingSound.url;
      audio.play().catch(err => {
        console.error('Oynatma hatası:', err);
        alert('Ses dosyası oynatılamadı. Lütfen kulaklık takın ve tarayıcı izinlerini kontrol edin.');
      });
      setCurrentPlaying(pendingSound.id);
      setSessionStartTime(Date.now());
      setShowHeartRateModal(false);
    }
  };

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

              {currentPlaying === sound.id && (
                <div className="mb-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

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

      {showHeartRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {isWaitingForAfter ? 'Ses Sonrası Kalp Atım Hızı' : 'Ses Öncesi Kalp Atım Hızı'}
            </h3>
            <p className="text-slate-600 mb-4">
              {isWaitingForAfter 
                ? 'Ses bitti. Şimdi kalp atım hızınızı ölçün ve girin.' 
                : 'Sesi başlatmadan önce kalp atım hızınızı ölçün ve girin.'}
            </p>
            <input
              type="number"
              min="40"
              max="200"
              placeholder="Örn: 72"
              value={isWaitingForAfter ? heartRateAfter : heartRateBefore}
              onChange={(e) => isWaitingForAfter ? setHeartRateAfter(e.target.value) : setHeartRateBefore(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4"
            />
            <div className="flex space-x-3">
              <Button onClick={handleHeartRateSubmit} className="flex-1">
                {isWaitingForAfter ? 'Kaydet' : 'Başlat'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowHeartRateModal(false);
                  setHeartRateBefore('');
                  setHeartRateAfter('');
                  setPendingSound(null);
                  setIsWaitingForAfter(false);
                }}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BinauralPage;