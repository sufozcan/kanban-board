"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({
  card,
  onDelete,
  onEdit,
}: {
  card: any;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Form verilerini tutacağımız state
  const [editData, setEditData] = useState({
    title: card.title,
    label: card.label || "",
    due_date: card.due_date || "",
    assignee: card.assignee || "",
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    // Veritabanının kabul edeceği formatı hazırlıyoruz
    const formattedData = {
      ...editData,
      // Tarih boş string ("") ise null yap, değilse kendi değerini kullan
      due_date: editData.due_date === "" ? null : editData.due_date,
    };

    onEdit(card.id, formattedData);
    setIsEditing(false);
  };

  // KART DÜZENLEME MODU (Sürükleme özellikleri burada kapalıdır, tıklamalar karışmaz)
  // KART DÜZENLEME MODU (Sürükleme özellikleri burada kapalıdır, tıklamalar karışmaz)
  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-blue-400 flex flex-col gap-3">
        {/* Başlık Alanı */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Görev Başlığı</label>
          <input
            className="border border-gray-200 rounded p-1.5 text-sm outline-none focus:border-blue-400 font-medium text-gray-700"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Görev Başlığı"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          {/* Etiket Alanı */}
          <div className="w-1/2 flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Etiket (İsteğe Bağlı)</label>
            <input
              className="border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-blue-400 text-gray-600"
              value={editData.label}
              onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              placeholder="Örn: Acil, Bug"
            />
          </div>
          
          {/* Tarih Alanı */}
          <div className="w-1/2 flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Son Teslim</label>
            <input
              type="date"
              className="border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-blue-400 text-gray-600"
              value={editData.due_date}
              onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
            />
          </div>
        </div>

        {/* Sorumlu Kişi Alanı */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sorumlu Kişi</label>
          <input
            className="border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-blue-400 text-gray-600"
            value={editData.assignee}
            onChange={(e) => setEditData({ ...editData, assignee: e.target.value })}
            placeholder="Örn: Yusuf"
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-2 mt-1 border-t border-gray-100 pt-2">
          <button onClick={() => setIsEditing(false)} className="text-xs font-medium text-gray-500 hover:text-gray-800">
            İptal
          </button>
          <button onClick={handleSave} className="text-xs font-medium bg-blue-500 text-white rounded px-3 py-1.5 hover:bg-blue-600 shadow-sm transition-colors">
            Kaydet
          </button>
        </div>
      </div>
    );
  }

  // NORMAL KART GÖRÜNÜMÜ
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 cursor-grab active:cursor-grabbing flex flex-col gap-2 touch-none select-none"
    >
      {/* 1. Kısım: Etiket (Varsa) */}
      {card.label && (
        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full w-max uppercase tracking-wider">
          {card.label}
        </span>
      )}

      {/* 2. Kısım: Başlık */}
      <p className="text-sm text-gray-800 font-medium leading-snug">{card.title}</p>

      {/* 3. Kısım: Tarih ve Sorumlu Kişi (Varsa) */}
      {(card.due_date || card.assignee) && (
        <div className="flex justify-between items-center mt-1 border-t border-gray-100 pt-2">
          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
            {card.due_date && (
              <>
                <span>📅</span>
                {new Date(card.due_date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
              </>
            )}
          </div>
          {card.assignee && (
            <div 
              className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white" 
              title={card.assignee}
            >
              {card.assignee.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Görünmez Düzenle/Sil Butonları (Fare üzerine gelince belirir) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-md p-1 border border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="text-xs p-1 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
          title="Düzenle"
        >
          ✏️
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
          className="text-xs p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
          title="Sil"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}