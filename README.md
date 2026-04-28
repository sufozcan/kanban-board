# 📋 TaskFlow | Kanban Proje Yönetim Tahtası

**TaskFlow**, küçük yazılım ekipleri için geliştirilmiş , veri tutarlılığı ve yüksek performans odaklı bir görev yönetim aracıdır. Kullanıcılar hesap oluşturup giriş yapabilir; board üzerinde sütun ve kartlar ekleyebilir, sürükle-bırak ile görevlerin durumunu güncelleyebilir. Tüm değişiklikler sayfa yenilemesinde korunur.

> **📍 Canlı Uygulama:** [kanban-board-tau-brown.vercel.app](https://kanban-board-tau-brown.vercel.app)

---

## 📸 Uygulama Görünümü

<p align="center">
  <img src="https://github.com/user-attachments/assets/0d802ba4-d0c1-4b54-aca8-af0b763cf732" height="250" />
  <img src="https://github.com/user-attachments/assets/de4ce905-6eb9-4056-9961-4558fe3f4462" height="250" />
  <img src="https://github.com/user-attachments/assets/62036c2f-1dee-4b70-9a24-bd42dfaf1146" height="250" />
</p>

---

## 48 Saatte Neye Odaklanıldı? 

**Kararlı bir şekilde çalışmayan fazla özellik yerine, kusursuz çalışan temel bir çekirdek yapıya odaklanıldı.**

48 saatlik kısıtlı sürede projenin odak noktası **temel sürükle-bırak mekaniğinin kusursuzlaştırılması, veri bütünlüğünün sağlanması ve mobil uyumluluk** olmuştur. 
- Kartların ve sütunların sayfa yenilendiğinde sırasını koruması ve mobildeki dokunmatik çakışmalarının çözülmesi ana mesaiyi almıştır.
- Kartlara "Etiket, Tarih ve Sorumlu Kişi" gibi detaylar, CRUD (Create, Read, Update, Delete) operasyonlarının tam çalıştığını kanıtlamak adına temel düzeyde eklenmiş, ancak bu detayların üzerinde aşırı mühendislik yapmaktan kaçınılmıştır.

---

##  Teknik Kararlar ve Analiz


### 1. Kütüphane Karşılaştırması: Neden `dnd-kit`?
Piyasadaki alternatifler değerlendirildiğinde şu artılar ve eksiler masaya yatırılmıştır:
* **Tarayıcı Yerleşik (Native HTML5) Drag-and-Drop:** Ek bağımlılık gerektirmez ancak mobil desteği yeterli değildir. Ciddi "polyfill" yazmayı gerektirir ve UI kısıtlamaları çok fazladır.
* **`SortableJS`:** Çok hızlıdır ancak DOM'u doğrudan manipüle ettiği için React'in Virtual DOM yapısıyla (özellikle state güncellemelerinde) ciddi çakışmalar ve senkronizasyon hataları yaratır.
* **`@hello-pangea/dnd`:** API'si harikadır ancak dosya boyutu nispeten büyüktür ve React 18 Strict Mode ile zaman zaman uyum sorunları yaşatır.
* ** Seçim (`dnd-kit`):** Headless (görünümsüz) mimarisi sayesinde tam UI kontrolü sağlar. **Sensör (Sensor) API'si** sayesinde mobil/masaüstü ayrımını en hassas yönetebildiğimiz, modern ve hafif kütüphanedir.

### 2. Sıralama Verisi ve Kalıcılık (Persistence)
Sayfa yenilendiğinde kart sırasının korunması için "Index-Based Positioning" (Pozisyon Bazlı Sıralama) kullanılmıştır. Supabase veritabanında her kartın bir `position` değeri tutulur. Sürükleme bittiğinde (`onDragEnd`), değişen dizilim tespit edilir ve veritabanı anlık olarak güncellenir.

### 3. Mobil Cihaz Dinamikleri (Mobile UX)
Mobilde "ekranı kaydırma" ile "kartı tutma" hareketinin çakışması, `TouchSensor` ile çözülmüştür. Karta **250ms basılı tutulduğunda (Long Press)** sürükleme modu devreye girer. Ayrıca `touch-none` sınıfıyla tarayıcının istenmeyen müdahaleleri engellenmiştir.

### 4. Sütunların Sırasının Değiştirilmesi
Kapsama dahil edilmiştir. İş akışlarının (Örn: "Test" sütununu "Hazır"dan önceye çekmek) özelleştirilebilmesi için sütunlar da sürüklenebilir (Draggable) yapılmıştır.

### 5. Performans: Çok Sayıda Kart Olduğunda Akıcılık
`dnd-kit`, sürükleme işlemi sırasında elementleri DOM içinde fiziksel olarak yer değiştirmek yerine, GPU hızlandırmalı **CSS `transform` (translate3d)** özelliğini kullanır. Bu sayede "Layout Thrashing" (tarayıcının sayfayı sürekli yeniden çizmesi) engellenir. Yüzlerce kart olduğunda bile 60fps (akıcı) bir sürükleme deneyimi korunur.

---

## 🚫 Kapsam Dışı Bırakılanlar

48 saatlik süreyi verimli kullanmak adına bazı özellikler bilinçli olarak kapsam dışı bırakılmıştır:

* **Gelişmiş Board Paylaşımı (Sadece İzleme vs. Düzenleme):** Uygulama şu an yetki ayrımı olmadan "Birlikte Düzenleme" mantığıyla çalışmaktadır. Farklı yetki seviyeleri (Admin, Viewer) eklemek karmaşık bir "Role-Based Access Control (RBAC)" mimarisi gerektireceğinden kapsam dışında tutulmuştur.
* **Aktivite Geçmişi (Log / History):** Bir kartın hangi sütunlar arasında ne zaman taşındığını görmek kurumsal firmalar için çok değerlidir. Ancak bunun için veritabanında ayrı bir log tablosu kurgulamak ve "Event Sourcing" mantığı kurmak gerektiğinden, odak temel mekaniklere kaydırılmış ve bu özellik şimdilik ertelenmiştir.

---

## 🏗️ Proje Mimarisi ve Dosya Yapısı (`src/`)

Proje, Next.js App Router yapısına ve "Separation of Concerns" (Sorumlulukların Ayrılması) prensibine uygun olarak modüler şekilde tasarlanmıştır.

```text
taskflow/
├── src/
│   ├── app/
│   │   ├── globals.css      # Custom scrollbar ve global stiller
│   │   ├── layout.tsx       # Ana HTML/Body yapısı
│   │   └── page.tsx         # Ana Dashboard (Veri çekme ve state yönetimi)
│   ├── components/
│   │   ├── Auth.tsx         # Giriş/Kayıt olma ekranı (Supabase)
│   │   ├── BoardColumn.tsx  # Sütun bileşeni (Droppable area)
│   │   ├── KanbanBoard.tsx  # Dnd-context ve sensör kurallarının merkezi
│   │   └── TaskCard.tsx     # Tekil kart bileşeni (Draggable item)
│   └── lib/
│       └── supabase.ts      # Supabase istemci bağlantısı
├── .env.local               # Gizli API anahtarları
└── tailwind.config.ts       # UI tasarım kuralları
```

---

## 🔐 Güvenlik (Row Level Security)
Veritabanı işlemleri Supabase üzerinden RLS politikaları ile korunmaktadır. Anonim (giriş yapmamış) kullanıcılar panoyu göremez veya veri değiştiremez.

---

## 💻 Teknoloji Yığını
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Sürükle-Bırak:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Backend/DB:** Supabase (PostgreSQL)
- **Deployment:** Vercel

---

### Kurulum
1. `git clone https://github.com/kullaniciadi/taskflow.git`
2. `npm install`
3. `.env.local` oluşturup Supabase bilgilerinizi ekleyin.
4. `npm run dev` ile başlatın.


