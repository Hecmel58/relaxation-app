import React, { useState } from 'react';
import { Api } from '../services/api';

export default function LoginModal({ open, onClose, onLogin } : any) {
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [agree, setAgree] = useState(false);
  const api = Api();

  if (!open) return null;
  async function submit(e:any) {
    e.preventDefault();
    if (!agree) { alert('Kullanıcı sözleşmesini onaylayın.'); return; }
    try {
      const data = await api.login(phone, pass);
      onLogin(data.user);
      api.setToken(data.token);
    } catch (err:any) {
      alert(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{background:'rgba(0,0,0,0.6)'}}>
      <div className="card w-96">
        <h3 className="text-xl font-semibold mb-2">Giriş / Kayıt</h3>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <input className="p-2 rounded bg-white/5" placeholder="Telefon (+90...)" value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="p-2 rounded bg-white/5" placeholder="Şifre" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <label className="text-sm"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} /> &nbsp;Kullanıcı sözleşmesini okudum ve onaylıyorum</label>
          <div className="flex gap-2">
            <button className="flex-1 bg-accent text-black py-2 rounded" type="submit">Giriş</button>
            <button type="button" className="flex-1 bg-white/5 py-2 rounded" onClick={onClose}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
