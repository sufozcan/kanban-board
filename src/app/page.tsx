import { supabase } from '../lib/supabase';
import KanbanBoard from '../components/KanbanBoard'; 

export default async function Home() {
  // Sadece veriyi çekiyoruz
  const { data: columns, error: colError } = await supabase
    .from('columns')
    .select('*, cards(*)') 
    .order('position', { ascending: true });

  if (colError) {
    return <div className="p-10 text-red-500">Veri yüklenirken hata oluştu: {colError.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">TaskFlow Kanban</h1>
      
      {/* Çekilen veriyi görsel bileşene gönderiyoruz */}
      <KanbanBoard initialColumns={columns || []} />
    </main>
  );
}