import React, { useState, useCallback } from 'react';
import './BinauralPage.css';

export default function BinauralPage() {
    const [currentPlaying, setCurrentPlaying] = useState(null);

    const tracks = [
        {
            id: 1,
            title: 'Alfa Dalgaları - Odaklanma',
            frequency: '10 Hz',
            duration: '15 dk',
            category: 'Odaklanma',
            description: 'Konsantrasyon ve öğrenme kapasitesini artıran alfa frekansları',
            audio: '/assets/focus-alpha-10hz.mp3',
            color: '#4A90E2'
        },
        {
            id: 2,
            title: 'Beta Dalgaları - Aktif Düşünme',
            frequency: '20 Hz',
            duration: '12 dk',
            category: 'Enerji',
            description: 'Zihinsel enerji ve uyanıklığı destekleyen beta frekansları',
            audio: '/assets/energy-beta-20hz.mp3',
            color: '#F39C12'
        },
        {
            id: 3,
            title: 'Theta Dalgaları - Derin Rahatlama',
            frequency: '6 Hz',
            duration: '20 dk',
            category: 'Rahatlama',
            description: 'Derin meditasyon ve stres azaltma için theta frekansları',
            audio: '/assets/relax-theta-6hz.mp3',
            color: '#27AE60'
        },
        {
            id: 4,
            title: 'Delta Dalgaları - Uyku',
            frequency: '3 Hz',
            duration: '30 dk',
            category: 'Uyku',
            description: 'Derin uyku ve rejenerasyon için delta frekansları',
            audio: '/assets/sleep-delta-3hz.mp3',
            color: '#8E44AD'
        },
        {
            id: 5,
            title: 'Gama Dalgaları - Yaratıcılık',
            frequency: '40 Hz',
            duration: '10 dk',
            category: 'Yaratıcılık',
            description: 'Yaratıcı düşünce ve problem çözme için gama frekansları',
            audio: '/assets/creativity-gamma-40hz.mp3',
            color: '#E74C3C'
        }
    ];

    const categories = ['Tümü', 'Odaklanma', 'Enerji', 'Rahatlama', 'Uyku', 'Yaratıcılık'];
    const [selectedCategory, setSelectedCategory] = useState('Tümü');

    const filteredTracks = selectedCategory === 'Tümü' 
        ? tracks 
        : tracks.filter(track => track.category === selectedCategory);

    const stopAllAudio = useCallback(() => {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }, []);

    const handlePlay = useCallback((trackId) => {
        // Diğer ses dosyalarını durdur
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            if (audio.id !== `audio-${trackId}`) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        setCurrentPlaying(trackId);
    }, []);

    const handlePause = useCallback(() => {
        setCurrentPlaying(null);
    }, []);

    const handlePlayButtonClick = useCallback((trackId) => {
        const audio = document.getElementById(`audio-${trackId}`);
        if (!audio) return;

        if (currentPlaying === trackId) {
            audio.pause();
        } else {
            stopAllAudio();
            audio.play().catch(error => {
                console.error('Audio play failed:', error);
            });
        }
    }, [currentPlaying, stopAllAudio]);

    const handleDownload = useCallback((audioSrc, title) => {
        // Download functionality - bu gerçek bir dosya indirme işlemi değil
        // Gerçek uygulamada backend'den dosya indirme API'si kullanılmalı
        console.log(`Downloading: ${title} from ${audioSrc}`);
        
        // Geçici çözüm - yeni sekmede aç
        const link = document.createElement('a');
        link.href = audioSrc;
        link.download = `${title}.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    return (
        <div className="binaural-page">
            <div className="page-header">
                <h1>🎵 Binaural Beats</h1>
                <p className="page-description">
                    Binaural vuruşlar, her kulağa farklı frekansta ses dalgaları verildiğinde beynin 
                    algıladığı üçüncü bir frekansın oluşturduğu ses efektidir. Bu teknik odaklanma, 
                    yaratıcılık, derin uyku ve rahatlama gibi zihinsel durumları desteklemek amacıyla kullanılır.
                </p>
            </div>

            {/* Kategori Filtreleri */}
            <div className="category-filters">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                        type="button"
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Ses Parçaları Grid */}
            <div className="tracks-grid">
                {filteredTracks.map(track => (
                    <div key={track.id} className="track-card">
                        <div className="track-header">
                            <div 
                                className="frequency-badge" 
                                style={{ backgroundColor: track.color }}
                            >
                                {track.frequency}
                            </div>
                            <div 
                                className="category-tag"
                                style={{ color: track.color }}
                            >
                                {track.category}
                            </div>
                        </div>

                        <div className="track-info">
                            <h3 className="track-title">{track.title}</h3>
                            <p className="track-description">{track.description}</p>
                            
                            <div className="track-meta">
                                <span className="duration">⏱️ {track.duration}</span>
                                <span className="frequency">📶 {track.frequency}</span>
                            </div>
                        </div>

                        <div className="audio-container">
                            <audio
                                id={`audio-${track.id}`}
                                className="custom-audio-player"
                                controls
                                preload="none"
                                onPlay={() => handlePlay(track.id)}
                                onPause={handlePause}
                                onEnded={handlePause}
                                onError={(e) => console.error('Audio error:', e)}
                            >
                                <source src={track.audio} type="audio/mpeg" />
                                Tarayıcınız ses oynatmayı desteklemiyor.
                            </audio>
                        </div>

                        <div className="track-actions">
                            <button 
                                className={`btn ${currentPlaying === track.id ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => handlePlayButtonClick(track.id)}
                                type="button"
                            >
                                {currentPlaying === track.id ? '⏸️ Durdur' : '▶️ Oynat'}
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => handleDownload(track.audio, track.title)}
                                type="button"
                            >
                                💾 İndir
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Binaural Beats Hakkında Bilgi */}
            <div className="info-section">
                <h2>🧠 Beyin Dalgaları ve Etkileri</h2>
                <div className="brainwave-info">
                    <div className="brainwave-item">
                        <div className="wave-icon" style={{backgroundColor: '#8E44AD'}}>δ</div>
                        <h4>Delta (0.5-4 Hz)</h4>
                        <p>Derin uyku, şifa ve rejenerasyon</p>
                    </div>
                    <div className="brainwave-item">
                        <div className="wave-icon" style={{backgroundColor: '#27AE60'}}>θ</div>
                        <h4>Theta (4-8 Hz)</h4>
                        <p>Derin meditasyon ve yaratıcılık</p>
                    </div>
                    <div className="brainwave-item">
                        <div className="wave-icon" style={{backgroundColor: '#4A90E2'}}>α</div>
                        <h4>Alpha (8-13 Hz)</h4>
                        <p>Rahatlama ve odaklanma</p>
                    </div>
                    <div className="brainwave-item">
                        <div className="wave-icon" style={{backgroundColor: '#F39C12'}}>β</div>
                        <h4>Beta (13-30 Hz)</h4>
                        <p>Normal uyanıklık ve dikkat</p>
                    </div>
                    <div className="brainwave-item">
                        <div className="wave-icon" style={{backgroundColor: '#E74C3C'}}>γ</div>
                        <h4>Gamma (30+ Hz)</h4>
                        <p>Yüksek kognitif fonksiyonlar</p>
                    </div>
                </div>
            </div>

            {/* Kullanım Önerileri */}
            <div className="usage-tips">
                <h2>💡 Kullanım Önerileri</h2>
                <div className="tips-list">
                    <div className="tip">
                        <span className="tip-icon">🎧</span>
                        <p><strong>Kulaklık kullanın:</strong> Binaural beats etkisi için mutlaka kulaklık gereklidir.</p>
                    </div>
                    <div className="tip">
                        <span className="tip-icon">🔊</span>
                        <p><strong>Orta seviye ses:</strong> Rahatsız etmeyecek, ama duyabileceğiniz seviyede ayarlayın.</p>
                    </div>
                    <div className="tip">
                        <span className="tip-icon">⏰</span>
                        <p><strong>Düzenli dinleme:</strong> En az 15 dakika süreyle dinleme yapın.</p>
                    </div>
                    <div className="tip">
                        <span className="tip-icon">🧘‍♀️</span>
                        <p><strong>Rahat pozisyon:</strong> Sessiz ve rahat bir ortamda dinleyin.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}