"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

export default function BoardColumn({ 
  column, 
  onAddCard,
  onDeleteCard,
  onEditCard,
  onDeleteColumn,
  isDragging,
}: { 
  column: any, 
  onAddCard: (colId: string, cardData: any) => void,
  onDeleteCard: (cardId: string, colId: string) => void,
  onEditCard: (cardId: string, updates: any) => void,
  onDeleteColumn: (colId: string) => void,
  isDragging?: boolean,
}) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Form verilerini tutan state
  const [newCardData, setNewCardData] = useState({
    title: "",
    label: "",
    due_date: "",
    assignee: ""
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const { setNodeRef: setBottomRef } = useDroppable({
    id: column.id,
    data: { type: "Column", column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const cardIds = column.cards?.map((c: any) => c.id) || [];

  const handleSave = () => {
    if (newCardData.title.trim() !== "") {
      onAddCard(column.id, newCardData);
      // Formu sıfırla ve kapat
      setNewCardData({ title: "", label: "", due_date: "", assignee: "" });
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="w-80 bg-gray-200/50 rounded-xl p-4 flex-shrink-0 flex flex-col min-h-[150px] border-2 border-transparent focus-within:border-blue-300 transition-colors"
    >
      <h2
        {...attributes}
        {...listeners}
        // Fare sütunun üzerine geldiğinde çöp kutusunu göstermek için 'group' class'ını ekledik
        className="font-semibold text-gray-700 mb-4 px-2 flex justify-between items-center cursor-grab active:cursor-grabbing select-none group"
      >
        <span className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">⠿</span>
          {column.title}
        </span>
        
        <div className="flex items-center gap-1">
          <span className="text-xs bg-gray-300 px-2 py-1 rounded-full cursor-default">
            {cardIds.length}
          </span>
          {/* Silme Butonu */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Butona tıklanınca "sürükleme" olayının tetiklenmesini engeller
              onDeleteColumn(column.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-xs p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            title="Sütunu Sil"
          >
            🗑️
          </button>
        </div>
      </h2>
      
      <div className="flex flex-col gap-3 flex-grow text-left">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards?.map((card: any) => (
            <TaskCard 
              key={card.id} 
              card={card} 
              onDelete={(cardId) => onDeleteCard(cardId, column.id)}
              onEdit={(cardId, updates) => onEditCard(cardId, updates)}
            />
          ))}
        </SortableContext>

        <div ref={setBottomRef} className="flex-grow min-h-[40px]" />

        {isAdding ? (
          <div className="bg-white p-3 rounded-lg border-2 border-blue-400 shadow-md mt-2 flex flex-col gap-3">
            {/* Görev Başlığı */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Görev Başlığı</label>
              <input 
                type="text" 
                autoFocus
                placeholder="Örn: Rapor hazırlanacak" 
                value={newCardData.title}
                onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
                className="w-full text-sm outline-none border border-gray-200 rounded p-1.5 focus:border-blue-300 font-medium text-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Etiket Alanı */}
              <div className="w-1/2 flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Etiket (İsteğe Bağlı)</label>
                <input 
                  placeholder="Örn: Önemli" 
                  value={newCardData.label}
                  onChange={(e) => setNewCardData({ ...newCardData, label: e.target.value })}
                  className="text-[11px] outline-none border border-gray-200 rounded p-1.5 focus:border-blue-300 text-gray-600"
                />
              </div>
              
              {/* Son Teslim Tarihi */}
              <div className="w-1/2 flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Son Teslim</label>
                <input 
                  type="date"
                  value={newCardData.due_date}
                  onChange={(e) => setNewCardData({ ...newCardData, due_date: e.target.value })}
                  className="text-[11px] outline-none border border-gray-200 rounded p-1.5 focus:border-blue-300 text-gray-500"
                />
              </div>
            </div>

            {/* Sorumlu Kişi */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sorumlu Kişi</label>
              <input 
                placeholder="Örn: Yusuf" 
                value={newCardData.assignee}
                onChange={(e) => setNewCardData({ ...newCardData, assignee: e.target.value })}
                className="w-full text-[11px] outline-none border border-gray-200 rounded p-1.5 focus:border-blue-300 text-gray-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 mt-1">
              <button 
                onClick={() => setIsAdding(false)} 
                className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2"
              >
                İptal
              </button>
              <button 
                onClick={handleSave} 
                className="text-xs bg-blue-500 text-white rounded px-4 py-1.5 hover:bg-blue-600 transition-all shadow-sm font-semibold"
              >
                Ekle
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="mt-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-200/80 p-2 rounded text-left flex items-center gap-2 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Yeni Kart Ekle
          </button>
        )}
      </div>
    </div>
  );
}