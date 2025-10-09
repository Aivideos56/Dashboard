# Multi-Restoran İdarəetmə Sistemi

Tam funksional, production-ready multi-restoran admin paneli. POS və Ofisiant sistemləri ilə inteqrasiyaya hazır.

## 🚀 Xüsusiyyətlər

### Admin Panel
- ✅ Restoran əlavə etmə və idarəetmə
- ✅ Bütün restoranların statistikası
- ✅ Real-time məlumat göstərilməsi
- ✅ Restoran detallı məlumatları

### Restoran Dashboard
- ✅ Günlük/Aylıq/İllik statistika
- ✅ Gəlir qrafikləri (Recharts)
- ✅ Ən çox satılan məhsullar
- ✅ Son sifarişlər
- ✅ Aktiv masalar

### Masa İdarəetməsi
- ✅ CRUD əməliyyatları
- ✅ Masa statusu (Boş/Dolu/Rezerv)
- ✅ Zona təyinatı (Daxili/Xarici/VIP)
- ✅ Tutum seçimi (2-10 nəfər)

### Menyu İdarəetməsi
- ✅ 3 Səviyyəli struktur: Kateqoriya → Alt Kateqoriya → Məhsul
- ✅ Məhsul axtarışı və filterləmə
- ✅ Şəkil upload
- ✅ Barkod generatoru
- ✅ Qiymət və maya dəyəri
- ✅ Aktiv/Qeyri-aktiv status

### Sifarişlər
- ✅ Tarixçə
- ✅ Geniş filtrləmə
- ✅ Detallı görünüş
- ✅ Çap funksiyası

### Statistika
- ✅ Dövr əsaslı (Gün/Ay/İl)
- ✅ Gəlir trendi qrafiki
- ✅ Top məhsullar
- ✅ Masa əsaslı statistika
- ✅ CSV export

### Parametrlər
- ✅ Ümumi məlumatlar
- ✅ İş saatları
- ✅ Valyuta və vergi
- ✅ Hesab idarəetməsi

## 🛠 Texnologiyalar

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Database**: Supabase (PostgreSQL)
- **Date Utils**: date-fns

## 📦 Quraşdırma

```bash
# Asılılıqları yüklə
npm install

# Development rejimi
npm run dev

# Production build
npm run build

# Preview
npm run preview
```

## 🔑 Giriş Məlumatları

### Admin
- İstifadəçi adı: `admin`
- Şifrə: `admin123`

### Test Restoranı
Yeni restoran yaratmaq üçün Admin paneldən "Yeni Restoran" düyməsini istifadə edin.

## 🗄 Database Strukturu

Supabase database artıq konfiqurasiya olunub:
- `admin_users` - Admin istifadəçilər
- `restaurants` - Restoranlar
- `tables` - Masalar
- `categories` - Kateqoriyalar
- `sub_categories` - Alt kateqoriyalar
- `products` - Məhsullar
- `orders` - Sifarişlər
- `reservations` - Rezervasiyalar

Bütün cədvəllər RLS (Row Level Security) ilə qorunur.

## 🔗 POS və Ofisiant İnteqrasiyası

Bu sistem mərkəzi database istifadə edir:

```
┌─────────────────────────────────────────────────┐
│           SUPABASE DATABASE (Mərkəzi)           │
└─────────────────────────────────────────────────┘
                      ↓ ↑
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Admin Panel  │ │   POS    │ │  Ofisiant    │
│ (Bu sistem)  │ │ (sonra)  │ │  (sonra)     │
└──────────────┘ └──────────┘ └──────────────┘
```

### Hazırda mövcud:
- ✅ Admin Panel (Restoran idarəetməsi)
- ✅ Database schema (POS-a hazır)
- ✅ Real-time updates dəstəyi

### Gələcək:
- 🔄 POS Sistemi
- 🔄 Ofisiant Mobil App

## 📱 Responsive Dizayn

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🎨 Dizayn Prinsipləri

- Modern, təmiz interfeys
- Yüksək kontrast və oxunaqlılıq
- Smooth animasiyalar
- Intuitiv UX
- Professional görünüş

## 📂 Layihə Strukturu

```
src/
├── components/
│   ├── cards/           # Kart komponentləri
│   ├── layout/          # Layout komponentləri
│   └── modals/          # Modal komponentləri
├── pages/               # Səhifələr
├── store/               # Redux store
│   └── slices/          # Redux slices
├── utils/               # Utility funksiyalar
│   ├── storage.js       # Supabase əməliyyatları
│   ├── validation.js    # Validasiya
│   ├── helpers.js       # Köməkçi funksiyalar
│   └── sampleData.js    # Nümunə data
└── lib/                 # Xarici kitabxanalar
```

## 🔒 Təhlükəsizlik

- ✅ Row Level Security (RLS)
- ✅ Protected routes
- ✅ Authentication yoxlaması
- ✅ Şifrə validasiyası
- ✅ Input sanitization

## 📊 Performans

- ✅ Code splitting
- ✅ Lazy loading
- ✅ Optimized images
- ✅ Memoization
- ✅ Efficient re-renders

## 🌐 Çoxdilli Dəstək

Hazırda Azərbaycan dilində. Gələcəkdə:
- 🔄 English
- 🔄 Русский
- 🔄 Türkçe

## 🤝 Töhfə

Pull request-lər xoş gəlmisiniz!

## 📝 Lisenziya

MIT

## 📧 Əlaqə

Suallar üçün issue yaradın.

---

**Status**: ✅ Production Ready
**Versiya**: 1.0.0
**Son yeniləmə**: 2025
