import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function RelaxationPage() {
  const { user } = useAuthStore();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('breathing');
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const audioRef = useRef(new Audio());

  const categories = [
    { id: 'breathing', name: 'Nefes Egzersizleri', icon: '🌬️' },
    { id: 'meditation', name: 'Meditasyon', icon: '🧘‍♀️' },
    { id: 'nature_sound', name: 'Doğa Sesleri', icon: '🌊' }
  ];

  useEffect(() => {
    loadContent();
    
    const audio = audioRef.current;
    audio.addEventListener('ended', handleAudioEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, []);

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/relaxation/content?category=${selectedCategory}`);
      setContent(response.data.content || []);
    } catch (error) {
      console.error('İçerik yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioEnded = () => {
    setCurrentPlaying(null);
  };

  const handlePlay = (item) => {
    const audio = audioRef.current;
    
    if (currentPlaying === item.id) {
      audio.pause();
      setCurrentPlaying(null);
    } else {
      audio.src = item.url;
      audio.play().catch(err => {
        console.error('Oynatma hatası:', err);
        alert('Ses dosyası oynatılamadı.');
      });
      setCurrentPlaying(item.id);
      
      trackContentUsage(item.id, 'view');
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

  // Admin kullanıcılar veya experiment grubu erişebilir
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
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RelaxationPage;