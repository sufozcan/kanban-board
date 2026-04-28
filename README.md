📋 TaskFlow — Profesyonel Kanban Yönetim Sistemi
TaskFlow, modern yazılım ekiplerinin ihtiyaç duyduğu hız, güvenlik ve mobil uyumluluk kriterlerini karşılamak üzere geliştirilmiş tam kapsamlı bir proje yönetim aracıdır. Bu proje, mükemmel temel mekanikler ve sağlam veri mimarisi hedeflenerek inşa edilmiştir.

🚀 Canlı Uygulama
🔗 kanban-board-tau-brown.vercel.app

🛠️ Teknik Kararlar ve Stratejiler
Değerlendirme kriterlerinde yer alan kritik sorulara yönelik geliştirdiğim çözümler aşağıdadır:

1. Kütüphane Seçimi: Neden dnd-kit?
Projede artık bakım desteği verilmeyen react-beautiful-dnd yerine, modern ve modüler bir yapı sunan dnd-kit tercih edilmiştir.

Avantajı: Ağaç sallama (tree-shaking) desteğiyle hafif olması, sıfır bağımlılık ilkesi ve sensör tabanlı yapısı sayesinde mobil/masaüstü ayrımını en iyi şekilde yönetmesidir.

2. Sıralama ve Veri Tutarlılığı
Sayfa yenilendiğinde kartların sırasının bozulmaması için Supabase (PostgreSQL) üzerinde her kart ve sütun için bir position (float/integer) sütunu kullanılmıştır.

Mantık: Sürükleme bittiği anda dnd-kit'ten gelen yeni dizilim position değerleri üzerinden güncellenir. Bu sayede veri modeli (Board → Sütun → Kart) hiyerarşisi bozulmadan korunur.

3. Mobil Cihazlarda Sürükle-Bırak (Mobile UX)
Dokunmatik ekranlarda "kaydırma" (scroll) ve "sürükleme" (drag) hareketlerinin çakışması, özel bir Long Press (Uzun Basma) mekanizması ile çözülmüştür:

Çözüm: TouchSensor kullanılarak 250ms basılı tutma kuralı eklenmiştir.

Erişilebilirlik: touch-none ve select-none CSS özellikleri ile tarayıcının varsayılan hareketleri kısıtlanarak, mobilde "yağ gibi akan" bir deneyim sağlanmıştır.

4. Güvenlik ve Paylaşım (RLS)
Proje, kurumsal standartlarda Row Level Security (RLS) ile korunmaktadır.

Senaryo: Uygulama "Birlikte Düzenleme" (Shared Dashboard) modeline göre kurgulanmıştır. Sadece sisteme giriş yapmış yetkili kullanıcılar veritabanına erişebilir ve işlem yapabilir.

✨ Uygulama Özellikleri
Auth Sistemi: Supabase Auth ile güvenli kayıt ve giriş.

Tam CRUD: Sütun ve kart ekleme, başlık/detay düzenleme ve silme işlemleri.

Gelişmiş Kart Detayları: Etiket (label), son teslim tarihi (due date) ve sorumlu kişi (assignee) desteği.

Sütun Reordering: Sadece kartlar değil, sütunlar da kendi aralarında sürüklenebilir.

Görsel Geribildirim: Sürükleme sırasında gölge efektleri, renk değişimleri ve yer tutucu (placeholder) animasyonları.

Custom Scroll: Çok sayıda sütun olduğunda Trello tarzı modern yatay kaydırma çubuğu.

🏗️ Teknoloji Yığını
Framework: Next.js (App Router) & TypeScript

Veritabanı: Supabase (PostgreSQL) & RLS Security

Sürükle-Bırak: @dnd-kit/core & @dnd-kit/sortable

Styling: Tailwind CSS

Deployment: Vercel


🛠️ Yerel Kurulum
Depoyu klonlayın ve dizine gidin.

npm install ile bağımlılıkları yükleyin.

.env.local dosyasına Supabase URL ve Anon Key bilgilerinizi girin.

npm run dev ile projeyi ayağa kaldırın.

Not: Bu proje, 48 saatlik kısıtlı sürede "yarım kalan çok özellik" yerine "kusursuz çalışan temel bir ürün" vizyonuyla, özellikle veri tutarlılığı ve mobil deneyim üzerine yoğunlaşılarak tamamlanmıştır.
