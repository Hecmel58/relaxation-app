import React from 'react';
import './BinauralPage.css';

export default function BinauralPage() {
    const tracks = [
        {
            id: 1,
            title: 'Odaklanma 40Hz',
            duration: '15 dk',
            audio: '/assets/focus40hz.mp3'
        },
        {
            id: 2,
            title: 'Rahatlama 8Hz',
            duration: '20 dk',
            audio: '/assets/relax8hz.mp3'
        }
    ];

    return (
        <div className="binaural-page main-content">
            <h1>Binaural Beats</h1>
            <p>
                Binaural vuruşlar, her kulağa farklı frekansta ses dalgaları verildiğinde beynin
                algıladığı üçüncü bir frekansın oluşturduğu ses efektidir. Bu teknik; odaklanma,
                yaratıcılık, derin uyku ve rahatlama gibi zihinsel durumları desteklemek amacıyla
                kullanılır. Aşağıdaki ses kayıtlarını dinleyerek farklı frekansların zihinsel
                etkilerini deneyimleyebilirsiniz.
            </p>

            {tracks.map(t => (
                <div key={t.id} className="track">
                    <span className="track-title">{t.title}</span>
                    <span>{t.duration}</span>
                    <audio
                        src={t.audio}
                        controls
                        style={{ marginLeft: '10px', flex: '1' }}
                    />
                </div>
            ))}
        </div>
    );
}
