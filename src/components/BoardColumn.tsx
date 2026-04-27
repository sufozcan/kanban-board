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
  isDragging,
}: { 
  column: any, 
  onAddCard: (colId: string, title: string) => void,
  onDeleteCard: (cardId: string, colId: string) => void,
  onEditCard: (cardId: string, newTitle: string) => void,
  isDragging?: boolean,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Sütunun kendisini sürüklenebilir yap
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

  // Kartlar için boş alan droppable
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
    if (newTitle.trim() !== "") {
      onAddCard(column.id, newTitle);
      setNewTitle("");
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="w-80 bg-gray-200/50 rounded-xl p-4 flex-shrink-0 flex flex-col min-h-[150px] border-2 border-transparent focus-within:border-blue-300 transition-colors"
    >
      {/* Başlık — sürükleme tutacağı */}
      <h2
        {...attributes}
        {...listeners}
        className="font-semibold text-gray-700 mb-4 px-2 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
      >
        <span className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">⠿</span>
          {column.title}
        </span>
        <span className="text-xs bg-gray-300 px-2 py-1 rounded-full cursor-default">
          {cardIds.length}
        </span>
      </h2>
      
      <div className="flex flex-col gap-3 flex-grow">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards?.map((card: any) => (
            <TaskCard 
              key={card.id} 
              card={card} 
              onDelete={(cardId) => onDeleteCard(cardId, column.id)}
              onEdit={(cardId, newTitle) => onEditCard(cardId, newTitle)}
            />
          ))}
        </SortableContext>

        {/* Boş alan — en alta sürüklemek için */}
        <div ref={setBottomRef} className="flex-grow min-h-[40px]" />

        {isAdding ? (
          <div className="bg-white p-3 rounded-lg border border-blue-400 shadow-sm mt-2">
            <input 
              type="text" 
              autoFocus
              placeholder="Görev adı..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full text-sm outline-none bg-transparent mb-2 text-gray-700"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="text-xs bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600 transition-colors"
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