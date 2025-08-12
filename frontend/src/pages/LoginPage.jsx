import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Supabase tablosunda kullanıcı kontrolü
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("password", password)
      .single();

    if (error || !data) {
      setError("Telefon numarası veya şifre hatalı.");
    } else {
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Giriş Yap</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Telefon Numarası</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" required className="mr-2" />
            <span className="text-sm">Kullanıcı sözleşmesini okudum, onaylıyorum</span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
