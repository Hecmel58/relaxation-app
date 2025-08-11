import React, { useState, useEffect } from 'react';
import Home from './pages/home';
import Relaxation from './pages/relaxation';
import Binaural from './pages/binaural';
import Physio from './pages/physio';
import Support from './pages/support';
import Admin from './pages/admin';
import LoginModal from './components/LoginModal';
import { Api } from './services/api';
import dayjs from 'dayjs';

export default function App() {
  const [route, setRoute] = useState<'home'|'relax'|'binaural'|'physio'|'support'|'form'|'admin'>('home');
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const api = Api();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function onLogin(u:any) {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setShowLogin(false);
  }
  function onLogout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <div className="min-h-screen">
      <nav className="p-4 flex items-center justify-between centered">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.svg" alt="logo" className="h-12 w-auto" />
          <h1 className="text-3xl font-extrabold" style={{fontFamily:'Inter, system-ui'}}>Relaxation</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('home')}>Ana Sayfa</button>
          <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('relax')}>Gevşeme Teknikleri</button>
          <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('binaural')}>Binaural Vuruşlar</button>
          <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('physio')}>Uyku ve Fizyolojik Kayıt</button>
          <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('support')}>Destek (Uzman ile Görüşme)</button>
          <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('form')}>Form</button>
          {user && user.role === 'admin' ? <button className="px-3 py-2 rounded hover:bg-white/5" onClick={()=>setRoute('admin')}>Yönetici</button> : null}
          {!user ? <button className="bg-white/5 px-3 py-2 rounded" onClick={()=>setShowLogin(true)}>Giriş / Kayıt</button> :
            <div className="flex items-center gap-2">
              <div className="text-sm">{user.name || user.phone}</div>
              <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={onLogout}>Çıkış</button>
            </div>
          }
        </div>
      </nav>

      <main className="py-10 centered">
        {route === 'home' && <Home />}
        {route === 'relax' && <Relaxation />}
        {route === 'binaural' && <Binaural />}
        {route === 'physio' && <Physio api={api} user={user} />}
        {route === 'support' && <Support />}
        {route === 'admin' && <Admin api={api} />}
        {route === 'form' && <div className="card">Form sayfası - placeholder</div>}
      </main>

      <LoginModal open={showLogin} onClose={()=>setShowLogin(false)} onLogin={onLogin} />

      <footer className="py-8 text-center text-sm text-white/60">
        © {dayjs().year()} Relaxation — Demo
      </footer>
    </div>
  );
}
