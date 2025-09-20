import React from 'react';
import './RelaxationPage.css';

export default function RelaxationPage() {
    const sessions = [
        {
            id: 1,
            title: 'Derin Nefes Meditasyonu',
            desc: '10 dakikalık rehberli nefes egzersizi ile zihinsel sakinlik',
            duration: '10 dk',
            difficulty: 'Başlangıç',
            video: '/assets/meditation1.mp4',
            thumbnail: '/assets/meditation1-thumb.jpg'
        },
        {
            id: 2,
            title: 'Kas Gevşetme Teknikleri',
            desc: 'Tüm vücut kaslarını sistemli olarak gevşetme egzersizi',
            duration: '15 dk',
            difficulty: 'Orta',
            video: '/assets/breathing.mp4',
            thumbnail: '/assets/breathing-thumb.jpg'
        },
        {
            id: 3,
            title: 'Doğa Sesleri ile Meditasyon',
            desc: 'Orman sesleri eşliğinde zihinsel dinlenme seansı',
            duration: '20 dk',
            difficulty: 'Tüm Seviyeler',
            video: '/assets/nature-meditation.mp4',
            thumbnail: '/assets/nature-thumb.jpg'
        }
    ];

    return (
        <div className="relaxation-page main-content">
            <div className="page-header">
                <h1>🧘‍♀️ Rahatlama Seansları</h1>
                <p className="page-description">
                    Rahatlama teknikleri, zihinsel ve fiziksel stresi azaltmak, odaklanmayı artırmak ve 
                    genel yaşam kalitesini iyileştirmek için kullanılan yöntemlerdir. Meditasyon, 
                    nefes egzersizleri, kas gevşetme teknikleri ve doğa sesleri, en yaygın rahatlama 
                    yöntemleri arasında yer alır.
                </p>
            </div>

            <div className="sessions-grid">
                {sessions.map(session => (
                    <div key={session.id} className="session-card">
                        <div className="session-header">
                            <div className="session-info">
                                <h3 className="session-title">{session.title}</h3>
                                <p className="session-description">{session.desc}</p>
                                
                                <div className="session-meta">
                                    <span className="session-duration">
                                        ⏱️ {session.duration}
                                    </span>
                                    <span className="session-difficulty">
                                        📊 {session.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="video-container">
                            <video
                                className="session-video"
                                controls
                                preload="metadata"
                                poster={session.thumbnail}
                            >
                                <source src={session.video} type="video/mp4" />
                                <p>Tarayıcınız video oynatmayı desteklemiyor.</p>
                            </video>
                        </div>

                        <div className="session-actions">
                            <button className="btn btn-primary">
                                ▶️ Seansı Başlat
                            </button>
                            <button className="btn btn-secondary">
                                💾 Kaydet
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relaxation-tips">
                <h2>💡 Rahatlama İpuçları</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">🌱</div>
                        <h3>Düzenli Pratik</h3>
                        <p>Her gün aynı saatte kısa süreli meditasyon yaparak rutin oluşturun.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">🔇</div>
                        <h3>Sessiz Ortam</h3>
                        <p>Dikkat dağıtıcı unsurları ortadan kaldırarak odaklanmanızı artırın.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">🪑</div>
                        <h3>Rahat Pozisyon</h3>
                        <p>Rahat ama dik bir oturuş pozisyonu tercih edin.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}