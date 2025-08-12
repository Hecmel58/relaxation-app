import { useState } from 'react'

export default function App(){
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [msg, setMsg] = useState('')

  const login = async () => {
    if(!agree){ setMsg('Kullanıcı sözleşmesini onaylayın'); return }
    try{
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      const data = await res.json()
      if(!res.ok) setMsg(data.error || 'Hata')
      else setMsg(data.message || 'Başarılı')
    }catch(e){
      setMsg('Sunucuya bağlanılamadı')
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="logo-row">
          <img src="/logo.png" alt="logo" className="logo-small"/>
          <h1 className="site-title">Stres ve Uyku Yönetimi</h1>
        </div>
      </header>
      <main className="center">
        <h2 className="main-title">Stres ve Uyku Yönetimi</h2>
        <img src="/logo.png" alt="logo" className="logo-large" />
        <div className="login-box">
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Telefon Numarası" />
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Şifre" />
          <label className="agree"><input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} /> Kullanıcı sözleşmesini okudum onaylıyorum</label>
          <button onClick={login}>Giriş Yap</button>
          <div className="admin-area">
            <p>Yönetici girişi için ayrı panel mevcuttur.</p>
          </div>
          {msg && <p className="msg">{msg}</p>}
        </div>
      </main>
      <footer className="footer">© Telif Hakkı 2025, Tüm Hakları Saklıdır</footer>
    </div>
  )
}
