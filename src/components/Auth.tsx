"use client";

import { useState } from "react";
// ÖNEMLİ: Kendi projendeki doğru yolu buraya yazmayı unutma (örn: "../lib/supabase")
import { supabase } from "../lib/supabase"; 

export default function Auth() {
  // YENİ: Hangi modda olduğumuzu takip eden sihirli state
  const [isLogin, setIsLogin] = useState(true); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      setIsLogin(true); // Kayıt başarılı olunca otomatik olarak giriş formuna yönlendir
      setPassword(""); // Güvenlik için şifre kutusunu temizle
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100 transition-all duration-300">
        
        {/* Dinamik İkon ve Başlık */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
            {isLogin ? "🔐" : "✨"}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          {isLogin ? "Tekrar Hoş Geldiniz" : "Yeni Hesap Oluştur"}
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6 font-medium">
          {isLogin ? "Çalışma alanınıza giriş yapın" : "Ekibe katılmak için bilgilerinizi girin"}
        </p>

        {/* Form (Submit işlemi hangi modda olduğumuza göre değişir) */}
        <form className="flex flex-col gap-4" onSubmit={isLogin ? handleSignIn : handleSignUp}>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">E-Posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 font-medium"
              placeholder="ornek@mail.com"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded-md text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Tek ve Dinamik Buton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-lg p-2.5 mt-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50"
          >
            {loading ? "Bekleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
          </button>
        </form>

        {/* Mod Değiştirme Butonu */}
        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null); // Mod değişirken eski hataları temizle
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isLogin 
              ? "Hesabınız yok mu? Yeni hesap oluşturun" 
              : "Zaten hesabınız var mı? Giriş yapın"}
          </button>
        </div>

      </div>
    </div>
  );
}