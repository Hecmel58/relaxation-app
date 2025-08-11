import React, { useState } from 'react';
import dayjs from 'dayjs';

export default function Physio({ api, user }: any){
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [preHR, setPreHR] = useState('');
  const [postHR, setPostHR] = useState('');
  const [deep, setDeep] = useState('');
  const [light, setLight] = useState('');
  const [rem, setRem] = useState('');
  const [avgHR, setAvgHR] = useState('');
  const [message, setMessage] = useState('');

  async function submit(e:any){
    e.preventDefault();
    if(!user){ alert('Önce giriş yapın.'); return; }
    const payload = {
      date, preHeartRate: Number(preHR||0), postHeartRate: Number(postHR||0),
      deepSleepMinutes: Number(deep||0), lightSleepMinutes: Number(light||0), remSleepMinutes: Number(rem||0),
      avgSleepHeartRate: Number(avgHR||0), notes: message
    };
    try {
      const res = await api.createPhys(payload);
      alert('Kayıt başarıyla eklendi.');
    } catch (err:any) {
      alert(err.message || 'Hata');
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Uyku ve Fizyolojik Kayıt</h2>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3">
        <label>Tarih <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>Seans Öncesi Kalp Atım Hızı <input value={preHR} onChange={e=>setPreHR(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>Seans Sonrası Kalp Atım Hızı <input value={postHR} onChange={e=>setPostHR(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>Derin Uyku Süresi (dk) <input value={deep} onChange={e=>setDeep(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>Hafif Uyku Süresi (dk) <input value={light} onChange={e=>setLight(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>REM Süresi (dk) <input value={rem} onChange={e=>setRem(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>Uyku Sırasındaki Ortalama Nabız <input value={avgHR} onChange={e=>setAvgHR(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <label>Notlar <textarea value={message} onChange={e=>setMessage(e.target.value)} className="p-2 rounded bg-white/5" /></label>
        <div className="flex gap-2">
          <button className="bg-accent text-black px-4 py-2 rounded" type="submit">Kaydet</button>
        </div>
      </form>
    </div>
  );
}
