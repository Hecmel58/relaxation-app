import React from 'react';

export default function Relaxation(){
  return (
    <div className="card text-center">
      <h2 className="text-3xl font-bold mb-4">Gevşeme Teknikleri</h2>
      <p className="mb-4">Gevşeme egzersizlerini uygulamadan önce ve sonra kısa fizyolojik kayıtlarınızı giriniz.</p>
      <div className="mx-auto max-w-xl">
        <img src="/assets/logo.svg" alt="example" className="mx-auto mb-4" style={{height:160}}/>
        <div className="mb-4">
          <video width="100%" height="auto" controls>
            <source src="/assets/sample-video.txt" />
            Tarayıcınız video formatını desteklemiyor. (Replace sample-video.txt with mp4)
          </video>
        </div>
      </div>
    </div>
  );
}
