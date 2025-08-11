import React from 'react';

export default function Home(){
  return (
    <div className="card">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-4">Rahatlama ve Uyku Destek Platformu</h2>
          <p className="mb-4">Gevşeme yöntemleri, binaural vuruşlar ve uyku kayıt takibi ile kişisel gelişimini izle.</p>
          <ul className="list-disc ml-6">
            <li>Gevşeme Teknikleri & kısa rehber videolar</li>
            <li>Binaural vuruşlar & ses örnekleri</li>
            <li>Günlük uyku ve kalp atım kayıtları</li>
            <li>Uzmanla görüşme ve destek</li>
          </ul>
        </div>
        <div>
          <img src="/assets/logo.svg" alt="hero" />
        </div>
      </div>
    </div>
  );
}
