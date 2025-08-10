import React from 'react';
import './RelaxationPage.css';

export default function RelaxationPage() {
    const sessions = [
        {
            id: 1,
            title: 'Meditasyon 1',
            desc: '10 dakikalık rehberli meditasyon',
            video: '/assets/meditation1.mp4'
        },
        {
            id: 2,
            title: 'Nefes Egzersizi',
            desc: 'Stres azaltıcı nefes çalışması',
            video: '/assets/breathing.mp4'
        }
    ];

    return (
        <div className="relaxation-page main-content">
            <h1>Rahatlama Seansları</h1>
            <p>
                Rahatlama teknikleri, zihinsel ve fiziksel stresi azaltmak, odaklanmayı artırmak ve
                genel yaşam kalitesini iyileştirmek için kullanılan yöntemlerdir. Meditasyon,
                nefes egzersizleri, kas gevşetme teknikleri ve doğa sesleri, en yaygın rahatlama
                yöntemleri arasında yer alır. Aşağıdaki videoları izleyerek günün yorgunluğunu
                atabilir, zihninizi ve bedeninizi sakinleştirebilirsiniz.
            </p>

            {sessions.map(s => (
                <div key={s.id} className="session">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <video
                        src={s.video}
                        controls
                        width="100%"
                        style={{ borderRadius: '6px', marginTop: '10px' }}
                    />
                </div>
            ))}
        </div>
    );
}
