import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import "./loginmodal.css"; // CSS dosyasını ekledik

const LoginModal = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [agreement, setAgreement] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!agreement) {
            setError("Lütfen kullanıcı sözleşmesini onaylayın.");
            return;
        }

        // Supabase'den kullanıcıyı kontrol et
        const { data, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .eq("password", password) // burada hash kontrolü de eklenebilir
            .single();

        if (fetchError || !data) {
            setError("Telefon numarası veya şifre hatalı.");
            return;
        }

        // Admin kontrolü — artık ayrı panel yok, adminler de buradan giriyor
        if (data.role === "admin") {
            navigate("/home"); // admin de normal anasayfaya yönlendirilir
        } else {
            navigate("/home");
        }
    };

    return (
        <div className="login-modal">
            <form onSubmit={handleLogin}>
                <h2>Giriş Yap</h2>

                <input
                    type="text"
                    placeholder="Telefon Numarası"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label className="agreement">
                    <input
                        type="checkbox"
                        checked={agreement}
                        onChange={(e) => setAgreement(e.target.checked)}
                    />
                    Kullanıcı sözleşmesini okudum, onaylıyorum.
                </label>

                {error && <p className="error">{error}</p>}

                <button type="submit">Giriş Yap</button>
            </form>
        </div>
    );
};

export default LoginModal;
