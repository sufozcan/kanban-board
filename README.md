# 📋 TaskFlow | Kurumsal Düzey Kanban Yönetim Sistemi

**TaskFlow**, modern yazılım ekiplerinin çevik (Agile) süreçlerini yönetmek için tasarlanmış, veri tutarlılığı ve yüksek performans odaklı bir görev yönetim aracıdır. Bu döküman, projenin geliştirilme sürecindeki teknik kararları ve mimari çözümleri detaylandırmaktadır.

> **📍 Canlı Uygulama:** [kanban-board-tau-brown.vercel.app](https://kanban-board-tau-brown.vercel.app)

---

## 📸 Uygulama Görünümü

| Giriş ve Kayıt Ekranı | Ana Dashboard | Mobil Görünüm |
| :--- | :--- | :--- |
| ![Giriş Ekranı](<img width="512" height="713" alt="image" src="https://github.com/user-attachments/assets/6f94651a-5948-4049-bba0-401578bbda61" />
) | ![Ana Dashboard](https://via.placeholder.com/400x250?text=Dashboard+Gorselini+Buraya+Surukle) | ![Mobil Görünüm](https://via.placeholder.com/400x250?text=Mobil+Gorunum+Gorselini+Buraya+Surukle) |

*(Not: GitHub'da README dosyasını düzenlerken, kendi aldığın ekran görüntülerini doğrudan sürükleyip bu tablo hücrelerinin içine bırakabilirsin.)*

---

## 🧠 Teknik Kararlar ve Sorulara Yanıtlar

Değerlendirme kriterlerinde belirtilen kritik sorulara yönelik teknik analizim aşağıdadır:

### 1. Sürükle-Bırak Kütüphanesi Seçimi (Neden dnd-kit?)
Piyasada bulunan alternatifler arasından **dnd-kit** tercih edilmiştir. 
- **Neden dnd-kit?** `react-beautiful-dnd` artık güncellenmemekte ve hantal kalmaktadır. `SortableJS` ise React state yönetimiyle her zaman pürüzsüz çalışmayabilir. 
- **Karar:** `dnd-kit` modüler yapısı, sıfır bağımlılığı ve en önemlisi **Sensör (Sensor)** desteği sayesinde mobil cihazlarda "uzun basma" (long press) özelliğini en temiz şekilde kurgulamama olanak sağladı.

### 2. Sıralama Verisi ve Kalıcılık (Persistence)
Sayfa yenilendiğinde kartların sırasının korunması için **"Index-Based Positioning"** stratejisi uygulanmıştır.
- **Çözüm:** PostgreSQL veritabanındaki her kartın ve sütunun bir `position` (integer) değeri vardır. 
- **Mantık:** Sürükleme işlemi bittiğinde (`onDragEnd`), sadece yer değiştiren elementlerin `position` değerleri Supabase üzerinde güncellenir. Bu sayede Board → Sütun → Kart hiyerarşisi asla bozulmaz.

### 3. Mobil Cihaz Dinamikleri
Mobildeki en büyük sorun "ekranı kaydırma" ile "kartı tutma" hareketinin çakışmasıdır.
- **Mekanizma:** `TouchSensor` aktive edilerek **250ms delay** tanımlanmıştır. 
- **Sonuç:** Kullanıcı sayfayı aşağı/sağa kaydırmak istediğinde tarayıcının normal kaydırması çalışır. Ancak bir karta 250ms basılı tuttuğunda sürükleme modu devreye girer. Ayrıca `touch-none` sınıfıyla bu çakışmalar tamamen engellenmiştir.

### 4. Sütunların Sırasını Değiştirme
Evet, uygulamada sadece kartlar değil, **sütunların kendisi de** sürüklenebilir haldedir. Bu, proje yöneticilerinin iş akışını (Örn: "Test" sütununu "Hazır"dan önceye çekmek gibi) esnekçe özelleştirmesine olanak tanır.

### 5. Ekstra Özellikler: Etiket, Tarih ve Sorumlu Kişi
48 saatlik süreçte "çalışan bir MVP" sunmak adına veri modeline şu detaylar eklenmiştir:
- **Etiket (Label):** Görev önceliğini belirtmek için.
- **Sorumlu Kişi (Assignee):** Görevin kime ait olduğunu netleştirmek için.
- **Son Teslim Tarihi (Due Date):** Zaman yönetimini sağlamak için.

---

## 🛠️ Detaylı Özellik Analizi

### 🔐 Güvenlik ve Auth (Authentication)
* **Supabase Auth:** Email/Şifre tabanlı güvenli oturum yönetimi.
* **Row Level Security (RLS):** Veritabanı seviyesinde katı güvenlik kuralları. Sisteme giriş yapmamış anonim kullanıcılar panoyu göremez veya değiştiremez.

### 🎨 Kullanıcı Arayüzü (UI/UX)
* **Optimistic Updates:** Kart taşındığında veritabanı cevabı beklenmeden arayüz anında güncellenir, gecikme hissi ortadan kaldırılır.
* **Trello Tarzı Scroll:** Çok sayıda sütun olduğunda sayfa düzenini bozmayan, özel tasarlanmış yatay kaydırma çubuğu.

---

## 💾 Veritabanı Mimarisi (SQL)

Proje için kurgulanan ve Supabase üzerinde çalışan tablo mimarisi aşağıdaki gibidir:

```sql
-- 1. SÜTUNLAR TABLOSU
create table public.columns (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  position int not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. KARTLAR (GÖREVLER) TABLOSU
create table public.cards (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references public.columns(id) on delete cascade not null,
  title text not null,
  description text,
  label text,
  assignee text,
  due_date date,
  position int not null default 0,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GÜVENLİK (RLS) POLİTİKALARI
alter table public.columns enable row level security;
alter table public.cards enable row level security;

create policy "Authenticated users can manage columns" on public.columns for all to authenticated using (true);
create policy "Authenticated users can manage cards" on public.cards for all to authenticated using (true);
```

---

## 💻 Teknoloji Yığını

- **Frontend:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Backend & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel

---

## 👨‍💻 Geliştirici
**Yusuf Özcan** *İstatistik (METU) & Yönetim Bilişim Sistemleri (Anadolu Üniv.) Öğrencisi* Modern web teknolojileri ve veri analitiği odaklı çözümler geliştirmeye tutkulu.

---

### Nasıl Kurulur?
1. `git clone https://github.com/kullaniciadi/taskflow.git` ile projeyi indirin.
2. `npm install` ile bağımlılıkları yükleyin.
3. `.env.local` dosyasına Supabase URL ve Anon Key bilgilerinizi ekleyin.
4. `npm run dev` ile projeyi yerelde başlatın.
