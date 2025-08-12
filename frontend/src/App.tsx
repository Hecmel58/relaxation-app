// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/home";
import AdminPage from "./pages/admin";
import Relaxation from "./pages/relaxation"; // vs

export default function App() {
  const [auth, setAuth] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) setAuth(JSON.parse(raw));
  }, []);

  const handleLogin = (user: any) => {
    setAuth(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      {/* Header yalnızca giriş yapılmışsa gösterilecek */}
      {auth && <Header />}

      <div className={auth ? "main-content" : ""}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={<Home />} />
          <Route path="/relaxation" element={<Relaxation />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* diğer sayfalar */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
