"use client";

import { useState, useEffect } from "react";
// ÖNEMLİ: Kendi projendeki doğru yolları buraya yaz (örn: "../lib/supabase")
import { supabase } from "../lib/supabase"; 
import KanbanBoard from "../components/KanbanBoard"; 
import Auth from "../components/Auth";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [boardData, setBoardData] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchBoardData();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setLoading(true);
        fetchBoardData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBoardData = async () => {
    const { data, error } = await supabase
      .from("columns")
      .select("*, cards(*)")
      .order("position");

    if (error) {
      console.error("Pano verileri çekilirken hata:", error.message);
    } else {
      const sortedData = data?.map(col => ({
        ...col,
        cards: col.cards?.sort((a: any, b: any) => a.position - b.position) || []
      }));
      setBoardData(sortedData || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium animate-pulse flex items-center gap-2">
          <span className="text-xl">📋</span> Çalışma alanı hazırlanıyor...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Giriş Yapmış Kullanıcı (Ortak Pano)
  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-12">
      {/* Üst Kısım: Genişliği max-w-5xl'den max-w-[1600px]'e çıkardık */}
      <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center mb-8 px-4 md:px-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">📋</span> TaskFlow
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Ekip alanına hoş geldin, {session.user.email}
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Tahta Kısmı: Genişliği serbest bıraktık ve özel kaydırma çubuğu sınıfı ekledik */}
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 overflow-x-auto pb-4 custom-scrollbar">
        <KanbanBoard initialColumns={boardData} />
      </div>
    </main>
  );
}