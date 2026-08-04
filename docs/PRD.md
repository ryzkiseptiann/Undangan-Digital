# Product Requirements Document (PRD)

# Undangan Digital Premium

## 1. Ringkasan Produk

Undangan Digital Premium adalah website undangan online berbasis Next.js, Tailwind CSS, dan Supabase yang menampilkan pengalaman undangan elegan, mewah, personal, dan mudah dibagikan. Produk ini difokuskan untuk acara pernikahan sebagai MVP pertama, namun arsitekturnya tetap disiapkan agar bisa dikembangkan ke jenis acara lain seperti engagement, birthday, anniversary, atau corporate event.

Undangan harus terasa seperti undangan fisik premium yang hidup di layar: visual kuat, transisi halus, tipografi elegan, foto yang dominan, serta interaksi sederhana untuk tamu.

## 2. Tujuan Produk

- Membuat pengalaman undangan digital yang terlihat mahal, glamour, dan profesional.
- Memudahkan pemilik acara membagikan undangan melalui link personal.
- Memudahkan tamu melihat detail acara, lokasi, jadwal, galeri, RSVP, dan mengirim ucapan.
- Menyediakan fondasi teknis yang rapi untuk pengembangan fitur admin dan multi-undangan.
- Menggunakan Supabase sebagai database utama untuk data undangan, RSVP, dan ucapan tamu.

## 3. Target Pengguna

### Pemilik Acara

Orang atau pasangan yang ingin membuat undangan digital premium tanpa harus membuat website dari nol.

Kebutuhan utama:

- Menampilkan identitas acara secara elegan.
- Membagikan undangan melalui link.
- Mengumpulkan RSVP.
- Menerima ucapan/doa dari tamu.
- Menampilkan lokasi, waktu, galeri, dan informasi hadiah.

### Tamu Undangan

Orang yang menerima link undangan dari pemilik acara.

Kebutuhan utama:

- Membuka undangan dengan cepat dari mobile.
- Melihat nama penerima undangan jika link dipersonalisasi.
- Melihat detail acara dengan jelas.
- Membuka lokasi di Google Maps.
- Mengisi RSVP.
- Mengirim ucapan/doa.

## 4. Nilai Utama

- Visual premium, elegan, dan memorable.
- Mobile-first karena mayoritas tamu membuka dari WhatsApp atau media sosial.
- Interaksi sederhana dan tidak membingungkan.
- Data RSVP dan ucapan tersimpan di Supabase.
- Struktur awal siap dikembangkan menjadi produk undangan multi-template.

## 5. Ruang Lingkup MVP

### Termasuk MVP

- Halaman undangan publik.
- Cover pembuka undangan.
- Nama pasangan atau nama acara.
- Tanggal acara dan countdown.
- Detail akad/pemberkatan/resepsi.
- Link lokasi Google Maps.
- Galeri foto.
- RSVP sederhana.
- Daftar ucapan/doa tamu.
- Form kirim ucapan/doa.
- Informasi gift/amplop digital.
- Musik latar dengan kontrol on/off.
- Responsive mobile, tablet, dan desktop.
- Metadata dasar untuk SEO dan share preview.

### Tidak Termasuk MVP

- Dashboard admin lengkap.
- Payment gateway.
- Multi-template marketplace.
- Login multi-user.
- Editor visual drag-and-drop.
- Sistem pembayaran paket undangan.
- Analytics lanjutan.

Fitur di luar MVP dapat masuk ke fase berikutnya setelah undangan publik dan penyimpanan data stabil.

## 6. Fitur Produk

## 6.1 Cover Undangan

Cover adalah layar pertama yang dilihat tamu.

Kebutuhan:

- Menampilkan nama pasangan/acara.
- Menampilkan teks pembuka singkat.
- Menampilkan nama tamu jika tersedia.
- Memiliki tombol "Buka Undangan".
- Setelah dibuka, halaman utama dapat discroll.
- Musik dapat mulai aktif setelah interaksi pengguna.

## 6.2 Hero Utama

Kebutuhan:

- Menampilkan foto utama atau visual utama.
- Menampilkan nama pasangan/acara dengan tipografi display elegan.
- Menampilkan tanggal acara.
- Memberi kesan premium sejak layar pertama.

## 6.3 Detail Acara

Kebutuhan:

- Menampilkan beberapa sesi acara, misalnya akad dan resepsi.
- Setiap sesi berisi nama sesi, tanggal, waktu, lokasi, dan alamat.
- Menyediakan tombol buka Google Maps.

## 6.4 Countdown

Kebutuhan:

- Menampilkan hitung mundur menuju tanggal utama acara.
- Format minimal: hari, jam, menit, detik.
- Jika acara sudah lewat, tampilkan pesan yang sesuai.

## 6.5 Galeri

Kebutuhan:

- Menampilkan beberapa foto pasangan/acara.
- Layout elegan, tidak terasa seperti grid mentah.
- Gambar harus responsif dan tidak merusak layout mobile.

## 6.6 RSVP

Kebutuhan:

- Tamu dapat mengisi nama.
- Tamu dapat memilih status kehadiran: hadir, tidak hadir, atau ragu-ragu.
- Tamu dapat mengisi jumlah tamu.
- Data tersimpan ke Supabase.
- Setelah submit, tamu mendapatkan feedback berhasil/gagal.

## 6.7 Ucapan dan Doa

Kebutuhan:

- Tamu dapat mengirim nama dan pesan.
- Pesan tampil di halaman undangan setelah terkirim.
- Pesan dapat dibatasi panjangnya.
- MVP belum wajib memiliki moderasi admin, namun struktur data harus mendukung moderasi di masa depan.

## 6.8 Gift / Amplop Digital

Kebutuhan:

- Menampilkan rekening atau e-wallet.
- Tombol salin nomor rekening.
- Informasi pemilik rekening.
- Opsional QRIS pada fase berikutnya.

## 6.9 Musik Latar

Kebutuhan:

- Musik tidak autoplay sebelum interaksi pengguna.
- Tersedia tombol play/pause.
- Kontrol tidak mengganggu konten utama.

## 7. Pengalaman Visual

Arah visual yang disarankan:

- Premium, romantic, elegant, dan glamour.
- Mobile-first dengan komposisi tinggi seperti undangan digital modern.
- Foto atau visual utama harus menjadi pusat pengalaman.
- Gunakan warna netral dan aksen metalik, misalnya ivory, charcoal, champagne gold, emerald, burgundy, atau pearl.
- Hindari tampilan terlalu ramai, terlalu template, atau terlalu seperti landing page SaaS.
- Gunakan animasi halus untuk reveal section, bukan animasi berlebihan.
- Tipografi nama pasangan harus terasa editorial dan mewah.

## 8. User Flow MVP

### Tamu Undangan

1. Tamu menerima link undangan.
2. Tamu membuka halaman undangan.
3. Tamu melihat cover dan nama penerima.
4. Tamu menekan tombol buka undangan.
5. Tamu melihat detail acara.
6. Tamu membuka lokasi jika diperlukan.
7. Tamu mengisi RSVP.
8. Tamu mengirim ucapan/doa.
9. Tamu dapat melihat gift/amplop digital.

### Pemilik Acara

1. Pemilik acara menyediakan data undangan.
2. Data undangan disimpan di Supabase atau konfigurasi awal.
3. Pemilik acara membagikan link undangan.
4. Pemilik acara melihat data RSVP dan ucapan melalui Supabase dashboard pada MVP.

## 9. Data yang Dibutuhkan

Data minimal untuk satu undangan:

- Slug undangan.
- Nama pasangan/acara.
- Tanggal utama.
- Cerita singkat atau quote pembuka.
- Detail sesi acara.
- Daftar foto galeri.
- Daftar rekening/gift.
- Musik latar.
- Nama tamu undangan.
- RSVP tamu.
- Ucapan/doa tamu.

## 10. Kriteria Sukses MVP

- Halaman undangan tampil baik di mobile dan desktop.
- Tamu dapat membuka undangan dan memahami detail acara tanpa kebingungan.
- RSVP berhasil tersimpan ke Supabase.
- Ucapan berhasil tersimpan dan ditampilkan.
- Visual terasa premium, bukan template default.
- Build Next.js berhasil tanpa error.
- Struktur database cukup rapi untuk pengembangan dashboard admin.

## 11. Risiko Produk

- Visual bisa terlihat biasa jika tidak menggunakan aset foto yang kuat.
- RSVP dan ucapan perlu validasi agar data tidak kotor.
- Musik dan animasi harus dijaga agar tidak mengganggu performa.
- Supabase Row Level Security harus diatur dengan benar sebelum production.
- Penggunaan public anon key aman hanya jika policy database tepat.

## 12. Rencana Fase Berikutnya

### Fase 1: MVP Public Invitation

- Bangun halaman undangan publik.
- Hubungkan RSVP dan ucapan ke Supabase.
- Gunakan satu template premium.

### Fase 2: Admin Basic

- Dashboard sederhana untuk melihat RSVP dan ucapan.
- Form edit data undangan.
- Upload galeri.

### Fase 3: Multi-Invitation

- Dukungan banyak slug undangan.
- Data tamu per undangan.
- Tema/template berbeda.

### Fase 4: Produk Komersial

- Paket harga.
- Payment gateway.
- Custom domain.
- Analytics.
- Template marketplace.
