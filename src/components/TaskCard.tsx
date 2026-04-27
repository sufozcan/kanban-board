"use client";

import { useState } from "react"; // useState ekledik
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// onEdit özelliğini ekledik
export default function TaskCard({ 
  card, 
  onDelete,
  onEdit 
}: { 
  card: any, 
  onDelete?: (id: string) => void,
  onEdit?: (id: string, newTitle: string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "Card", card },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const handleSave = () => {
    if (editTitle.trim() !== "" && editTitle !== card.title) {
      if (onEdit) onEdit(card.id, editTitle);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-gray-700 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors group relative min-h-[74px]"
    >
      {/* DÜZENLEME MODU */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            // Sürüklemeyi engellemek için tıklandığında olayı durduruyoruz:
            onPointerDown={(e) => e.stopPropagation()} 
            className="w-full text-sm border border-blue-400 rounded p-1 outline-none"
          />
          <div className="flex justify-end gap-2">
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => { setIsEditing(false); setEditTitle(card.title); }} 
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              İptal
            </button>
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={handleSave} 
              className="text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600"
            >
              Kaydet
            </button>
          </div>
        </div>
      ) : (
        /* NORMAL GÖRÜNÜM MODU */
        <>
          <div className="font-medium group-hover:text-blue-600 pr-12">{card.title}</div>
          
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            {/* Düzenle Butonu */}
            {onEdit && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Görevi Düzenle"
              >
                ✎
              </button>
            )}
            {/* Sil Butonu */}
            {onDelete && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onDelete(card.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Görevi Sil"
              >
                ✕
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}