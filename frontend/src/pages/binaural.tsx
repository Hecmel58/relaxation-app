import React from 'react';

export default function Binaural(){
  return (
    <div className="card">
      <h2 className="text-3xl font-bold mb-4">Binaural Vuruşlar</h2>
      <p className="mb-3">Örnek binaural ses oynatıcı ve bilgilendirici metin.</p>
      <div className="mx-auto max-w-xl">
        <audio controls>
          <source src="/assets/sample-audio.txt" />
          Tarayıcınız ses formatını desteklemiyor. (Replace sample-audio.txt with mp3)
        </audio>
        <div className="mt-4 text-left">
          <p><strong>Binaural vuruş nedir?</strong></p>
          <p>İki farklı frekansın her kulağa verildiğinde beyin tarafından algılanan faz farkı ile ortaya çıkan bir ritimdir. Rahatlama ve uyku için belirli frekanslar tercih edilebilir.</p>
        </div>
      </div>
    </div>
  );
}
