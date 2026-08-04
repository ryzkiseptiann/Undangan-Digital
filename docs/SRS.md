# Software Requirements Specification (SRS)

# Undangan Digital Premium

## 1. Tujuan Dokumen

Dokumen ini menjelaskan kebutuhan teknis untuk membangun aplikasi Undangan Digital Premium menggunakan Next.js, Tailwind CSS, dan Supabase. SRS ini menjadi panduan implementasi awal agar struktur route, data, validasi, dan integrasi database tidak berubah-ubah saat development berjalan.

## 2. Stack Teknologi

- Framework: Next.js 16 dengan App Router.
- UI: React 19.
- Styling: Tailwind CSS 4.
- Database: Supabase PostgreSQL.
- Supabase Client: `@supabase/supabase-js`.
- Bahasa: TypeScript.
- Deployment target: Vercel atau platform Node.js yang mendukung Next.js.

Catatan: Karena project menggunakan Next.js versi baru, sebelum menulis kode framework-level perlu membaca dokumentasi lokal di `node_modules/next/dist/docs/` sesuai instruksi `AGENTS.md`.

## 3. Arsitektur Aplikasi

## 3.1 Struktur Folder yang Disarankan

```txt
app/
  page.tsx
  u/
    [slug]/
      page.tsx
  layout.tsx
  globals.css
components/
  invitation/
    CoverSection.tsx
    HeroSection.tsx
    EventDetails.tsx
    Countdown.tsx
    GallerySection.tsx
    RsvpForm.tsx
    WishesSection.tsx
    GiftSection.tsx
    MusicControl.tsx
lib/
  supabase.ts
  validations/
types/
  invitation.ts
docs/
  PRD.md
  SRS.md
```

Struktur ini dapat berubah saat implementasi, tetapi pemisahan komponen undangan sebaiknya dipertahankan agar UI mudah dirawat.

## 3.2 Route MVP

| Route | Fungsi |
| --- | --- |
| `/` | Landing atau preview undangan default |
| `/u/[slug]` | Halaman undangan publik berdasarkan slug |

Route admin belum wajib untuk MVP. Pada tahap awal, data dapat dicek melalui Supabase dashboard.

## 4. Environment Variable

Environment variable minimal:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Aturan:

- `NEXT_PUBLIC_SUPABASE_URL` boleh dipakai client-side.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` boleh dipakai client-side hanya jika Row Level Security dan policy Supabase sudah benar.
- Service role key tidak boleh digunakan di client component.
- File `.env` atau `.env.local` tidak boleh di-commit.

## 5. Model Data

## 5.1 invitations

Menyimpan data utama undangan.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| slug | text | Unique slug untuk URL |
| event_type | text | Contoh: wedding, engagement |
| title | text | Judul undangan |
| bride_name | text | Nama mempelai wanita, opsional untuk non-wedding |
| groom_name | text | Nama mempelai pria, opsional untuk non-wedding |
| display_names | text | Nama display utama |
| opening_text | text | Teks pembuka |
| quote | text | Quote atau ayat, opsional |
| main_event_at | timestamptz | Tanggal utama untuk countdown |
| hero_image_url | text | URL foto hero |
| music_url | text | URL musik |
| theme | jsonb | Konfigurasi warna/font ringan |
| is_published | boolean | Status publish |
| created_at | timestamptz | Waktu dibuat |
| updated_at | timestamptz | Waktu update |

## 5.2 event_sessions

Menyimpan sesi acara seperti akad dan resepsi.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| invitation_id | uuid | Relasi ke invitations |
| name | text | Nama sesi |
| starts_at | timestamptz | Waktu mulai |
| ends_at | timestamptz | Waktu selesai, opsional |
| venue_name | text | Nama venue |
| address | text | Alamat lengkap |
| maps_url | text | Link Google Maps |
| sort_order | int | Urutan tampil |

## 5.3 guests

Menyimpan daftar tamu jika ingin link personal.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| invitation_id | uuid | Relasi ke invitations |
| name | text | Nama tamu |
| slug | text | Slug/kode tamu opsional |
| phone | text | Nomor WhatsApp opsional |
| group_name | text | Grup tamu, contoh keluarga/kantor |
| max_pax | int | Batas jumlah tamu |
| created_at | timestamptz | Waktu dibuat |

## 5.4 rsvps

Menyimpan konfirmasi kehadiran.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| invitation_id | uuid | Relasi ke invitations |
| guest_id | uuid | Relasi ke guests, nullable |
| name | text | Nama pengisi |
| attendance_status | text | attending, not_attending, maybe |
| pax | int | Jumlah tamu |
| note | text | Catatan opsional |
| created_at | timestamptz | Waktu submit |

## 5.5 wishes

Menyimpan ucapan dan doa.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| invitation_id | uuid | Relasi ke invitations |
| guest_id | uuid | Relasi ke guests, nullable |
| name | text | Nama pengirim |
| message | text | Isi ucapan |
| is_approved | boolean | Status moderasi |
| created_at | timestamptz | Waktu submit |

## 5.6 galleries

Menyimpan gambar galeri.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| invitation_id | uuid | Relasi ke invitations |
| image_url | text | URL gambar |
| alt_text | text | Deskripsi gambar |
| sort_order | int | Urutan tampil |
| created_at | timestamptz | Waktu dibuat |

## 5.7 gift_accounts

Menyimpan rekening atau e-wallet.

| Field | Type | Keterangan |
| --- | --- | --- |
| id | uuid | Primary key |
| invitation_id | uuid | Relasi ke invitations |
| provider | text | BCA, Mandiri, GoPay, DANA, dll |
| account_number | text | Nomor rekening/e-wallet |
| account_name | text | Nama pemilik |
| qr_image_url | text | URL QR/QRIS opsional |
| sort_order | int | Urutan tampil |

## 6. Functional Requirements

## 6.1 Menampilkan Undangan

- Sistem harus dapat mengambil data undangan berdasarkan `slug`.
- Sistem hanya menampilkan undangan dengan `is_published = true`.
- Jika slug tidak ditemukan, tampilkan halaman not found.
- Halaman harus responsive.

## 6.2 RSVP

- Sistem harus menyediakan form RSVP.
- Field wajib: nama, status kehadiran.
- Field opsional: jumlah tamu dan catatan.
- Jumlah tamu minimal 1 jika hadir.
- RSVP harus tersimpan ke tabel `rsvps`.
- Setelah submit berhasil, sistem harus menampilkan pesan sukses.
- Jika gagal, sistem harus menampilkan pesan error yang ramah.

## 6.3 Ucapan dan Doa

- Sistem harus menyediakan form ucapan.
- Field wajib: nama dan pesan.
- Pesan harus memiliki batas panjang.
- Ucapan harus tersimpan ke tabel `wishes`.
- Untuk MVP, ucapan dapat tampil langsung jika `is_approved` default true.
- Untuk production yang lebih aman, `is_approved` dapat default false dan perlu admin approval.

## 6.4 Countdown

- Sistem harus menghitung sisa waktu berdasarkan `main_event_at`.
- Countdown harus berjalan di client.
- Jika tanggal sudah lewat, countdown harus diganti dengan pesan acara telah berlangsung.

## 6.5 Galeri

- Sistem harus mengambil gambar dari tabel `galleries`.
- Gambar harus tampil berdasarkan `sort_order`.
- Jika galeri kosong, section dapat disembunyikan.

## 6.6 Gift

- Sistem harus mengambil data dari `gift_accounts`.
- Sistem harus menyediakan tombol salin nomor rekening.
- Jika tidak ada data gift, section dapat disembunyikan.

## 6.7 Musik

- Sistem harus menyediakan kontrol play/pause.
- Musik hanya boleh mulai setelah interaksi pengguna.
- Jika `music_url` kosong, kontrol musik tidak ditampilkan.

## 7. Non-Functional Requirements

## 7.1 Performance

- Halaman harus cepat dibuka di mobile.
- Gambar harus dioptimalkan.
- Animasi harus ringan.
- Query Supabase harus mengambil kolom yang dibutuhkan saja.

## 7.2 Accessibility

- Tombol harus memiliki label yang jelas.
- Kontras teks harus cukup.
- Form harus bisa digunakan dengan keyboard.
- Gambar penting harus memiliki alt text.

## 7.3 Security

- Supabase Row Level Security harus aktif untuk tabel publik.
- Public read hanya boleh untuk undangan yang published.
- Insert RSVP dan wishes boleh dari public dengan validasi policy.
- Update dan delete tidak boleh dibuka ke public.
- Service role key tidak boleh digunakan di client.

## 7.4 Reliability

- Form harus menangani loading state.
- Error Supabase harus ditangani.
- Data kosong harus memiliki fallback UI.
- Komponen tidak boleh crash jika field opsional kosong.

## 8. Rekomendasi Supabase RLS

Policy awal yang disarankan:

- `invitations`: public select hanya jika `is_published = true`.
- `event_sessions`: public select jika invitation terkait published.
- `galleries`: public select jika invitation terkait published.
- `gift_accounts`: public select jika invitation terkait published.
- `guests`: tidak public select pada MVP agar daftar tamu tetap privat.
- `rsvps`: public insert, tidak public select untuk MVP kecuali dibutuhkan.
- `wishes`: public insert dan public select hanya untuk `is_approved = true`.

Detail SQL policy sebaiknya dibuat pada tahap implementasi database.

## 9. Validasi Form

## 9.1 RSVP

- `name`: required, 2 sampai 100 karakter.
- `attendance_status`: required, enum `attending`, `not_attending`, `maybe`.
- `pax`: number, minimal 1, maksimal mengikuti `guests.max_pax` jika ada.
- `note`: optional, maksimal 300 karakter.

## 9.2 Wishes

- `name`: required, 2 sampai 100 karakter.
- `message`: required, 5 sampai 500 karakter.

## 10. Acceptance Criteria MVP

- User dapat membuka `/u/[slug]` dan melihat data undangan.
- User dapat membuka detail lokasi.
- User dapat mengirim RSVP ke Supabase.
- User dapat mengirim ucapan ke Supabase.
- Ucapan yang approved dapat ditampilkan di halaman.
- Build project berhasil.
- Lint project berhasil.
- Tampilan mobile tidak rusak di viewport umum.

## 11. Prioritas Implementasi

1. Rapikan struktur folder dan komponen undangan.
2. Buat data mock lokal untuk bentuk UI premium.
3. Bangun tampilan undangan public secara mobile-first.
4. Hubungkan Supabase untuk RSVP dan wishes.
5. Tambahkan query undangan berdasarkan slug.
6. Tambahkan skema SQL dan RLS.
7. Tambahkan polish visual, animasi, dan metadata.

## 12. Pertanyaan Terbuka

- Apakah produk hanya untuk satu undangan dulu atau langsung multi-undangan?
- Apakah dashboard admin diperlukan di fase pertama?
- Apakah ucapan perlu dimoderasi sebelum tampil?
- Apakah link tamu perlu personal, misalnya `/u/rizky-sari?to=Nama+Tamu`?
- Apakah aset foto dan musik akan disimpan di Supabase Storage atau folder `public/`?
- Apakah tema pertama akan fokus wedding luxury modern, classic gold, atau romantic editorial?
