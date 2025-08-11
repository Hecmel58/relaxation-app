import React, { useState } from 'react';

export default function Support(){
  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [subject,setSubject] = useState('');
  const [message,setMessage] = useState('');
  async function submit(e:any){
    e.preventDefault();
    alert('Destek talebi oluşturuldu (demo).');
  }
  return (
    <div className="card max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Destek (Uzman ile Görüşme)</h2>
      <form onSubmit={submit} className="grid gap-3">
        <input className="p-2 rounded bg-white/5" placeholder="Adınız" value={name} onChange={e=>setName(e.target.value)} />
        <input className="p-2 rounded bg-white/5" placeholder="Telefon" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="p-2 rounded bg-white/5" placeholder="Konu" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea className="p-2 rounded bg-white/5" placeholder="Mesajınız" value={message} onChange={e=>setMessage(e.target.value)} />
        <button className="bg-accent text-black px-4 py-2 rounded">Uzmanla Görüşme İsteği</button>
      </form>
      <div className="mt-4 text-sm">Uzman: Fidan Balkaya (demo)</div>
    </div>
  );
}
