import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function RelaxationPage() {
  const { user } = useAuthStore();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('box_breathing');
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [heartRateBefore, setHeartRateBefore] = useState('');
  const [heartRateAfter, setHeartRateAfter] = useState('');
  const [pendingSound, setPendingSound] = useState(null);
  const [isWaitingForAfter, setIsWaitingForAfter] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const audioRef = useRef(new Audio());

  const testContent = {
    box_breathing: [
      { 
        id: 'test-box-1', 
        title: 'Kutu Nefes Tekniği - Temel',
        description: '4-4-4-4 kutu nefes egzersizi ile stres azaltın',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 240,
        type: 'audio',
        view_count: 0
      }
    ],
    guided_imagery: [
      { 
        id: 'test-imagery-1', 
        title: 'Rehberli İmgeleme - Huzurlu Orman',
        description: 'Zihninizi sakinleştiren görsel meditasyon',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 600,
        type: 'audio',
        view_count: 0
      }
    ],
    progressive_relaxation: [
      { 
        id: 'test-pmr-1', 
        title: 'Progresif Kas Gevşetme',
        description: 'Tüm vücut kaslarını sırayla gevşetin',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        duration: 900,
        type: 'audio',
        view_count: 0
      }
    ]
  };

  const categories = [
    { id: 'box_breathing', name: 'Kutu Nefes Tekniği', icon: '🌬️' },
    { id: 'guided_imagery', name: 'Rehberli İmgeleme', icon: '🧘‍♀️' },
    { id: 'progressive_relaxation', name: 'Progresif Kas Gevşetme', icon: '🌊' }
  ];

  useEffect(() => {
    loadContent();
    
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
    loadContent();
  }, [selectedCategory]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/relaxation/content?category=${selectedCategory}`);
      const apiContent = response.data.content || [];
      
      if (apiContent.length === 0) {
        setContent(testContent[selectedCategory] || []);
      } else {
        setContent(apiContent);
      }
    } catch (error) {
      console.error('İçerik yüklenemedi, test içeriği kullanılıyor:', error);
      setContent(testContent[selectedCategory] || []);
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

  const handlePlay = (item) => {
    const audio = audioRef.current;
    
    if (currentPlaying === item.id) {
      audio.pause();
      setCurrentPlaying(null);
      setProgress(0);
    } else {
      setPendingSound(item);
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
          content_type: 'relaxation',
          content_id: currentPlaying,
          content_name: pendingSound?.title || 'Bilinmeyen',
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
        alert('Ses dosyası oynatılamadı.');
      });
      setCurrentPlaying(pendingSound.id);
      setSessionStartTime(Date.now());
      setShowHeartRateModal(false);
      
      trackContentUsage(pendingSound.id, 'view');
    }
  };

  const trackContentUsage = async (contentId, interactionType) => {
    try {
      await api.post('/relaxation/track-usage', {
        contentId,
        interactionType,
        durationSeconds: 0
      });
    } catch (error) {
      console.error('Kullanım kaydedilemedi:', error);
    }
  };

  if (!user?.isAdmin && user?.abGroup !== 'experiment') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Beta Özellik</h2>
        <p className="text-slate-600">
          Rahatlama merkezi şu anda seçili kullanıcılara test ediliyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rahatlama Merkezi</h1>
        <p className="text-slate-600 mt-1">Meditasyon, nefes egzersizleri ve rahatlama teknikleri</p>
        {user?.abGroup === 'experiment' && !user?.isAdmin && (
          <div className="mt-2 px-3 py-1 bg-warning-100 text-warning-800 text-sm rounded-full inline-block">
            BETA ÖZELLİK - Sadece Deney Grubu
          </div>
        )}
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      ) : content.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-slate-600">Bu kategoride henüz içerik yok</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">
                  {item.type === 'video' ? '🎥' : item.type === 'audio' ? '🎵' : '🌊'}
                </div>
                <span className="text-xs text-slate-500">
                  {Math.floor(item.duration / 60)} dk
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {item.description}
              </p>

              {currentPlaying === item.id && (
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
                onClick={() => handlePlay(item)}
                className="w-full"
                variant={currentPlaying === item.id ? 'secondary' : 'primary'}
              >
                {currentPlaying === item.id ? (
                  <>⏸️ Durdur</>
                ) : (
                  <>▶️ Başlat</>
                )}
              </Button>

              {item.view_count > 0 && (
                <div className="mt-3 text-xs text-slate-500 text-center">
                  {item.view_count} kez dinlendi
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-wellness-50 border-wellness-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-wellness-800 mb-2">İpucu</h4>
            <p className="text-wellness-700 text-sm">
              Her gün düzenli olarak rahatlama egzersizleri yapmak uyku kalitenizi artırabilir.
              Kulaklık kullanmanız daha iyi bir deneyim sağlayacaktır.
            </p>
          </div>
        </div>
      </Card>

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

export default RelaxationPage;