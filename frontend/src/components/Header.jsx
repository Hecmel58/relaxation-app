import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png"; // logo yolu doğru mu kontrol et
import "./header.css"; // CSS dosyasını ekledik

const Header = () => {
    const location = useLocation();

    // Eğer kullanıcı giriş ekranındaysa ("/") header hiç görünmesin
    if (location.pathname === "/") {
        return null;
    }

    return (
        <header className="app-header">
            {/* Logo + Site İsmi */}
            <div className="header-inner">
                <img src={logo} alt="Site Logo" className="header-logo" />
                <span className="header-title">Stres ve Uyku Yönetimi</span>
            </div>

            {/* Menü */}
            <nav className="ml-auto flex space-x-6">
                <Link to="/home" className="hover:text-blue-300">Ana Sayfa</Link>
                <Link to="/relax" className="hover:text-blue-300">Gevşeme Teknikleri</Link>
                <Link to="/binaural" className="hover:text-blue-300">Binaural Vuruşlar</Link>
                <Link to="/sleep" className="hover:text-blue-300">Uyku ve Fizyolojik Kayıt</Link>
                <Link to="/support" className="hover:text-blue-300">Destek</Link>
                <Link to="/form" className="hover:text-blue-300">Form</Link>
            </nav>
        </header>
    );
};

export default Header;
