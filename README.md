# 🏸 GOR JUARA

**Sistem booking lapangan badminton berbasis web** — cek jadwal, booking online, dan kelola semuanya dari satu dashboard.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Tentang Proyek

GOR JUARA adalah aplikasi web untuk manajemen booking lapangan badminton (GOR = Gedung Olah Raga). Aplikasi ini melayani tiga jenis pengguna sekaligus dalam satu sistem:

- **Pengunjung publik** — bisa cek jadwal dan booking cepat tanpa perlu bikin akun.
- **Member** — booking online lewat dashboard pribadi, upload bukti bayar, dan pantau riwayat tiket.
- **Admin** — mengelola verifikasi pembayaran, jadwal, lapangan, harga, dan hari libur GOR.

Seluruh aplikasi dibangun murni dengan **HTML, CSS, dan JavaScript (vanilla)** tanpa framework maupun proses build, jadi bisa langsung dijalankan di browser. Data booking, member, lapangan, dan hari libur disimpan di `localStorage` browser — belum terhubung ke backend/database sungguhan, sehingga proyek ini saat ini paling pas diposisikan sebagai **prototipe UI/UX / proyek belajar**, bukan untuk produksi multi-perangkat (lihat bagian Catatan & Keterbatasan).

## ✨ Fitur

### 👤 Publik (tanpa login)
- Landing page dengan pilihan **"Cek Jadwal"** atau **"Login Member"**
- Lihat jadwal lapangan untuk hari ini & besok (6 slot jam, 08.00–20.00)
- **Booking sebagai tamu** langsung dari jadwal publik — cukup isi nama & no. WhatsApp, pilih durasi, tanpa perlu akun
- Pembayaran tamu bersifat "bayar di tempat" (transfer/QRIS saat datang ke lokasi)

### 🎫 Member
- Dashboard dengan sapaan personal & ringkasan tiket terbaru
- **Booking lapangan**: pilih tanggal (7 hari ke depan) → pilih jam & lapangan (12 slot/hari, 08.00–21.00) → pilih durasi 1–3 jam (otomatis menyesuaikan kalau jam berikutnya sudah bentrok)
- Pembayaran dengan **upload bukti transfer/QRIS**
- Riwayat tiket dengan status *Proses*, *Lunas*, *Menunggu Batal*, atau *Gagal*
- Ajukan pembatalan booking (perlu persetujuan admin) atau hapus tiket dari riwayat
- Kelola profil: ubah nomor WhatsApp & ganti password

### 🛠️ Admin
- Ringkasan dashboard: total pendapatan, booking aktif, dan jumlah verifikasi tertunda (dengan badge notifikasi)
- **Verifikasi** — terima/tolak booking baru dan permintaan pembatalan dari member
- **Kelola Jadwal** — lihat jadwal 7 hari ke depan per lapangan, tutup (*maintenance*) atau buka kembali slot secara manual
- **Riwayat** — tabel seluruh transaksi booking dari semua status
- **Member Baru** — daftarkan akun member (username, no. WhatsApp, password)
- **Lapangan & Harga** — tambah, ubah nama/harga sewa per jam, atau hapus lapangan
- **Tutup GOR (Libur)** — tandai satu atau beberapa hari sebagai libur beserta alasannya; jadwal booking di tanggal itu otomatis tertutup

## 🧱 Tech Stack

| Bagian | Teknologi |
|---|---|
| Markup | HTML5 (4 halaman: landing, login, dashboard, admin) |
| Styling | [Tailwind CSS](https://tailwindcss.com) via CDN (JIT) + `css/style.css` untuk animasi kustom |
| Logika | JavaScript (vanilla ES6+), dipisah per modul di `js/` |
| Font | Plus Jakarta Sans via Google Fonts |
| Penyimpanan | Web Storage API — `localStorage` (data) & `sessionStorage` (sesi login) |
| Desain | Tema hijau emerald + aksen kuning keemasan, gaya glassmorphism, responsif (mobile & desktop) |

Tidak ada `package.json` maupun proses build — semua dependency dimuat lewat CDN.

## 📁 Struktur Folder

```
GorJuara-main/
├── index.html        # Landing page + jadwal publik + form booking tamu
├── login.html         # Halaman login (member & admin)
├── dashboard.html      # Area member: booking, riwayat, profil
├── admin.html            # Panel admin: verifikasi, jadwal, member, dll.
├── css/
│   └── style.css         # Animasi & styling tambahan di luar Tailwind
├── js/
│   ├── data.js            # State/data global + helper format & storage
│   ├── auth.js             # Navigasi antar-"halaman" (SPA-like), login/logout
│   ├── public.js            # Logika jadwal publik & booking tamu
│   ├── member.js             # Logika booking, riwayat, & profil member
│   └── admin.js                # Logika seluruh panel admin
├── assets/
│   └── LogoKecil.png            # Logo GOR JUARA
└── .gitignore
```

> Catatan: ada file `split_debug.txt` di root folder yang tampaknya sisa proses development (pemisahan satu file skrip besar menjadi beberapa modul di `js/`). Aman dihapus kalau memang sudah tidak dibutuhkan lagi.

## 🚀 Cara Menjalankan

Tidak ada proses build atau instalasi dependency — GOR JUARA adalah static site murni.

**Opsi 1 — Buka langsung**
Klik dua kali `index.html` untuk membukanya di browser.

**Opsi 2 — Live Server (disarankan)**
Kalau pakai VS Code, install ekstensi *Live Server*, lalu klik kanan `index.html` → **Open with Live Server**. Menjalankan lewat `http://` lebih konsisten dibanding membuka file langsung (`file://`).

**Opsi 3 — Static server lewat terminal**
```bash
# Python
python -m http.server 5500

# atau Node (tanpa instalasi global)
npx serve .
```
Lalu buka `http://localhost:5500` di browser (sesuaikan port yang muncul).

## 💾 Penyimpanan Data

Belum ada backend — semua data berikut disimpan di `localStorage` browser (per perangkat, per browser):

| Key | Isi |
|---|---|
| `badminton_bookings_final_v3` | Daftar booking (tanggal, jam, lapangan, status, user, bukti bayar, dll.) |
| `gorjuara_courts` | Daftar lapangan beserta harga sewa per jam |
| `gorjuara_holidays` | Daftar hari libur GOR |
| `gorjuara_users` | Daftar member yang didaftarkan admin |

Status booking yang digunakan: `pending`, `booked`, `rejected`, `cancel-pending`, `maintenance`.

Booking dengan durasi lebih dari 1 jam disimpan sebagai beberapa entri terpisah (satu entri per jam) yang dihubungkan lewat `groupId` yang sama — fungsi `groupBookings()` di `data.js` menggabungkannya kembali menjadi satu tiket saat ditampilkan.

`sessionStorage` dipakai untuk menyimpan sesi login (`currentUser`) dan halaman terakhir sebelum reload (`lastView`).

## 🗺️ Ide Pengembangan Selanjutnya

- Integrasi payment gateway (mis. Midtrans/Xendit) untuk verifikasi pembayaran otomatis
- API/backend agar data booking bisa sinkron di banyak perangkat
- Halaman pendaftaran mandiri untuk calon member
