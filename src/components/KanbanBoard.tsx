"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import BoardColumn from "./BoardColumn";
import { supabase } from "../lib/supabase";

export default function KanbanBoard({
  initialColumns,
}: {
  initialColumns: any[];
}) {
  const [columns, setColumns] = useState(() =>
    initialColumns.map((col) => ({
      ...col,
      cards: [...(col.cards || [])].sort(
        (a: any, b: any) => a.position - b.position
      ),
    }))
  );

  const columnsRef = useRef(columns);

  const updateColumns = useCallback(
    (updater: any[] | ((prev: any[]) => any[])) => {
      setColumns((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        columnsRef.current = next;
        return next;
      });
    },
    []
  );

  const [activeItem, setActiveItem] = useState<{
    type: "card" | "column";
    data: any;
  } | null>(null);

  const dragSourceColIdRef = useRef<string | null>(null);
  const dragTypeRef = useRef<"card" | "column" | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const collisionDetection = useCallback((args: any) => {
    if (dragTypeRef.current === "column") {
      return closestCenter(args);
    }
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const activeId = event.active.id as string;
    const isColumn = columnsRef.current.some((col) => col.id === activeId);

    if (isColumn) {
      dragTypeRef.current = "column";
      dragSourceColIdRef.current = null;
      const col = columnsRef.current.find((c) => c.id === activeId);
      setActiveItem({ type: "column", data: col });
    } else {
      dragTypeRef.current = "card";
      const sourceCol = columnsRef.current.find((col) =>
        col.cards.some((card: any) => card.id === activeId)
      );
      dragSourceColIdRef.current = sourceCol?.id ?? null;
      const card = sourceCol?.cards.find((c: any) => c.id === activeId);
      setActiveItem({ type: "card", data: card });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // SÜTUN sürükleniyorsa — anlık önizleme için sırayı güncelle
    if (dragTypeRef.current === "column") {
      updateColumns((prev) => {
        const activeIndex = prev.findIndex((c) => c.id === activeId);
        const overIndex = prev.findIndex((c) => c.id === overId);
        if (activeIndex === -1 || overIndex === -1) return prev;
        if (activeIndex === overIndex) return prev;
        return arrayMove(prev, activeIndex, overIndex);
      });
      return;
    }

    // KART sürükleniyor
    updateColumns((prev) => {
      const allColIds = new Set(prev.map((c) => c.id));

      const sourceCol = prev.find((col) =>
        col.cards.some((card: any) => card.id === activeId)
      );

      const overIsColumn = allColIds.has(overId);
      const targetCol = overIsColumn
        ? prev.find((c) => c.id === overId)
        : prev.find((col) =>
            col.cards.some((card: any) => card.id === overId)
          );

      if (!sourceCol || !targetCol || sourceCol.id === targetCol.id)
        return prev;

      const sourceCards = [...sourceCol.cards];
      const targetCards = [...targetCol.cards];

      const activeIndex = sourceCards.findIndex((c: any) => c.id === activeId);
      if (activeIndex === -1) return prev;

      if (overIsColumn && targetCards.some((c: any) => c.id === activeId))
        return prev;

      const overIndex = targetCards.findIndex((c: any) => c.id === overId);
      const insertIndex = overIndex >= 0 ? overIndex : targetCards.length;

      const [movedCard] = sourceCards.splice(activeIndex, 1);
      targetCards.splice(insertIndex, 0, movedCard);

      return prev.map((col) => {
        if (col.id === sourceCol.id) return { ...col, cards: sourceCards };
        if (col.id === targetCol.id) return { ...col, cards: targetCards };
        return col;
      });
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveItem(null);

    const dragType = dragTypeRef.current;
    dragTypeRef.current = null;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // SÜTUN sıralama — handleDragOver zaten sırayı güncelledi, sadece Supabase'e yaz
    if (dragType === "column") {
      const currentCols = columnsRef.current;

      await Promise.all(
        currentCols.map((col: any, i: number) =>
          Promise.resolve(
            supabase
              .from("columns")
              .update({ position: i + 1 })
              .eq("id", col.id)
          )
        )
      );
      return;
    }

    // KART sıralama / taşıma
    const sourceColId = dragSourceColIdRef.current;
    dragSourceColIdRef.current = null;

    if (!sourceColId) return;

    const currentCols = columnsRef.current;
    const currentCol = currentCols.find((col) =>
      col.cards.some((card: any) => card.id === activeId)
    );

    if (!currentCol) return;

    // AYNI SÜTUN İÇİNDE
    if (sourceColId === currentCol.id) {
      const cards = currentCol.cards;
      const activeIndex = cards.findIndex((c: any) => c.id === activeId);
      const overIndex = cards.findIndex((c: any) => c.id === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newCards = arrayMove(cards, activeIndex, overIndex) as any[];
        updateColumns((prev) =>
          prev.map((col) =>
            col.id === currentCol.id ? { ...col, cards: newCards } : col
          )
        );

        await Promise.all(
          newCards.map((card: any, i: number) =>
            Promise.resolve(
              supabase.from("cards").update({ position: i + 1 }).eq("id", card.id)
            )
          )
        );
      }
    }
    // FARKLI SÜTUNA TAŞIMA
    else {
      const updates: Promise<any>[] = [];

      for (const colId of [sourceColId, currentCol.id]) {
        const col = currentCols.find((c) => c.id === colId);
        if (!col) continue;

        col.cards.forEach((card: any, i: number) => {
          updates.push(
            Promise.resolve(
              supabase
                .from("cards")
                .update({ column_id: colId, position: i + 1 })
                .eq("id", card.id)
            )
          );
        });
      }

      await Promise.all(updates);
    }
  }

  async function handleAddCard(columnId: string, cardData: any) {
    const column = columnsRef.current.find((c) => c.id === columnId);
    if (!column) return;

    const newPosition = column.cards ? column.cards.length + 1 : 1;

    // Tarih boşsa veritabanına null olarak gönderiyoruz
    const finalData = {
      ...cardData,
      column_id: columnId,
      position: newPosition,
      due_date: cardData.due_date === "" ? null : cardData.due_date,
    };

    const { data: newCard, error } = await supabase
      .from("cards")
      .insert(finalData)
      .select()
      .single();

    if (error) {
      console.error("Kart eklenirken hata:", error.message);
      return;
    }

    updateColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...(col.cards || []), newCard] }
          : col
      )
    );
  }

  async function handleDeleteCard(cardId: string, columnId: string) {
    updateColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c: any) => c.id !== cardId) }
          : col
      )
    );

    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (error) console.error("Kart silinirken hata:", error.message);
  }

  async function handleEditCard(cardId: string, updates: any) {
    // 1. Ekrandaki (State) görünümü anında güncelle
    updateColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards:
          col.cards?.map((card: any) =>
            card.id === cardId ? { ...card, ...updates } : card
          ) || [],
      }))
    );

    // 2. Supabase (Veritabanı) kaydını güncelle
    const { error } = await supabase
      .from("cards")
      .update(updates)
      .eq("id", cardId);
      
    if (error) console.error("Kart güncellenirken hata:", error.message);
  }

  async function handleAddColumn() {
    if (newColumnTitle.trim() === "") return;

    const newPosition = columnsRef.current.length + 1;
    const currentBoardId =
      columnsRef.current.length > 0 ? columnsRef.current[0].board_id : null;

    const { data: newColumn, error } = await supabase
      .from("columns")
      .insert({
        title: newColumnTitle,
        position: newPosition,
        board_id: currentBoardId,
      })
      .select()
      .single();

    if (error) {
      console.error("Sütun eklenirken hata:", error.message);
      return;
    }

    updateColumns((prev) => [...prev, { ...newColumn, cards: [] }]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  }

  if (!isMounted) return null;

  const columnIds = columns.map((c) => c.id);

  // Sütun Silme Fonksiyonu
  async function handleDeleteColumn(columnId: string) {
    // Kullanıcıya kazara silmelere karşı bir onay penceresi gösterelim
    if (!window.confirm("Bu sütunu ve içindeki tüm görevleri silmek istediğinize emin misiniz?")) {
      return;
    }

    // 1. Ekrandaki (State) görünümü anında güncelle
    updateColumns((prev) => prev.filter((col) => col.id !== columnId));

    // 2. Supabase (Veritabanı) kaydını sil
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);
      
    if (error) {
      console.error("Sütun silinirken hata:", error.message);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-6 overflow-x-auto pb-4 items-start">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onEditCard={handleEditCard}
              onDeleteColumn={handleDeleteColumn}
              isDragging={activeItem?.type === "column" && activeItem.data?.id === col.id}
            />
          ))}

          <div className="w-80 flex-shrink-0">
            {isAddingColumn ? (
              <div className="bg-gray-200/80 rounded-xl p-4 border border-blue-400 shadow-sm">
                <input
                  type="text"
                  autoFocus
                  placeholder="Yeni kategori adı..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                  className="w-full text-sm outline-none bg-white p-2 rounded mb-3 text-gray-700"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingColumn(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddColumn}
                    className="text-xs bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600 font-medium shadow-sm"
                  >
                    Kategori Ekle
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full h-[100px] bg-gray-200/30 hover:bg-gray-200/60 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-500 flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-xl">+</span> Yeni Sütun Ekle
              </button>
            )}
          </div>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem?.type === "column" && (
          <div className="w-80 bg-gray-200/90 rounded-xl p-4 flex-shrink-0 shadow-2xl rotate-2 opacity-95 border border-gray-300">
            <h2 className="font-semibold text-gray-700 mb-3 px-2">
              {activeItem.data?.title}
            </h2>
            <div className="flex flex-col gap-2">
              {activeItem.data?.cards?.slice(0, 3).map((card: any) => (
                <div key={card.id} className="bg-white rounded-lg p-3 text-sm text-gray-600 shadow-sm">
                  {card.title}
                </div>
              ))}
              {activeItem.data?.cards?.length > 3 && (
                <div className="text-xs text-gray-400 px-2">
                  +{activeItem.data.cards.length - 3} kart daha
                </div>
              )}
            </div>
          </div>
        )}
        {activeItem?.type === "card" && (
          <div className="w-72 bg-white rounded-lg p-3 shadow-2xl rotate-1 opacity-95 border border-gray-200">
            <p className="text-sm text-gray-700">{activeItem.data?.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}