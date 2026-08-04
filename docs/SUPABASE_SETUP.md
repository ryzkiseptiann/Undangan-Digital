# Supabase Setup

Panduan ini dipakai untuk menyiapkan database awal Undangan Digital Premium.

## 1. File yang Disediakan

- `supabase/schema.sql`: struktur tabel, constraint, index, trigger `updated_at`, dan Row Level Security policy.
- `supabase/seed.sql`: data demo opsional untuk satu undangan published.

## 2. Environment Variable

Project membutuhkan environment variable berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Catatan:

- `.env.example` sudah disediakan sebagai template.
- Gunakan `.env.local` untuk development lokal Next.js.
- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` di client component.
- Public anon key aman dipakai di browser hanya jika RLS policy sudah benar.

## 3. Urutan Setup di Supabase

1. Buka Supabase Dashboard.
2. Masuk ke project yang akan dipakai.
3. Buka menu SQL Editor.
4. Paste isi `supabase/schema.sql`.
5. Jalankan query.
6. Jika ingin data demo, paste isi `supabase/seed.sql`.
7. Jalankan query seed.
8. Masukkan Supabase URL dan anon key ke `.env.local`.
9. Restart dev server Next.js setelah environment variable diubah.

## 4. Tabel yang Dibuat

- `invitations`: data utama undangan.
- `event_sessions`: jadwal acara seperti akad dan resepsi.
- `guests`: daftar tamu untuk link personal.
- `rsvps`: data konfirmasi kehadiran.
- `wishes`: ucapan dan doa.
- `galleries`: foto galeri.
- `gift_accounts`: rekening atau e-wallet.

## 5. RLS Policy Awal

Policy awal dibuat untuk kebutuhan MVP:

- Public hanya bisa membaca undangan yang `is_published = true`.
- Public bisa membaca detail acara, galeri, dan gift dari undangan published.
- Public tidak bisa membaca tabel `guests` pada MVP agar daftar tamu tetap privat.
- Public bisa insert RSVP untuk undangan published.
- Public bisa insert wishes untuk undangan published.
- Public hanya bisa membaca wishes yang `is_approved = true`.
- Public tidak diberi akses update/delete.

Untuk production, akses admin sebaiknya dibuat lewat auth dan policy tambahan.

## 6. Data Demo

Seed menyediakan satu undangan:

```txt
slug: demo-luxury-wedding
route target: /u/demo-luxury-wedding
```

Asset demo yang disebut di seed:

```txt
/images/demo/hero.jpeg
/music/demo-wedding.mp3
```

File tersebut belum dibuat. Saat UI dibangun, bisa diganti dengan asset asli di `public/` atau URL dari Supabase Storage.

## 7. Catatan Nama Tabel Lama

Kode testing saat ini membaca tabel `RSVP`. Schema baru menggunakan nama tabel lowercase plural:

```txt
rsvps
```

Supabase/PostgreSQL lebih nyaman dan konsisten memakai lowercase snake_case. Saat masuk tahap implementasi UI, query di `app/page.tsx` perlu disesuaikan.

## 8. Catatan Link Personal

Untuk MVP, nama tamu bisa dikirim lewat query parameter, misalnya:

```txt
/u/demo-luxury-wedding?to=Nama%20Tamu
```

Tabel `guests` sudah disiapkan, tetapi belum dibuka untuk public read. Jika nanti ingin link personal yang lebih aman, buat RPC atau server-side route yang hanya mengambil satu guest berdasarkan kode unik.

## 9. Checklist Setelah Setup

- `schema.sql` berhasil dijalankan tanpa error.
- RLS aktif di semua tabel public.
- `.env.local` berisi URL dan anon key.
- Tabel `invitations` punya minimal satu data dengan `is_published = true`.
- Query public untuk membaca undangan published berhasil.
- Insert RSVP dan wishes berhasil dari client.
