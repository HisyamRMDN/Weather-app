# 🌤️ Weather App

Sebuah aplikasi web cuaca modern dan responsif yang menyajikan informasi cuaca secara real-time. Aplikasi ini memanfaatkan **OpenWeatherMap API** untuk menampilkan suhu saat ini, kondisi cuaca, serta prakiraan cuaca per jam dan harian untuk berbagai kota di seluruh dunia.

## ✨ Fitur Utama

- **🌍 Cuaca Berdasarkan Lokasi Saat Ini**: Mendeteksi lokasi pengguna secara otomatis (menggunakan Geolocation API) untuk menampilkan cuaca lokal.
- **🔍 Fitur Pencarian**: Pengguna dapat mencari cuaca dan prakiraan cuaca di kota mana pun di seluruh dunia.
- **📅 Prakiraan Cuaca Lengkap**: Menampilkan prakiraan cuaca per jam untuk hari ini dan prakiraan cuaca untuk 5 hari ke depan.
- **🌡️ Detail Cuaca Spesifik**: Menampilkan informasi mendetail seperti kelembapan (humidity), tekanan udara, jarak pandang (visibility), serta kecepatan dan arah angin.
- **📱 Desain Responsif**: Antarmuka pengguna (UI) yang disesuaikan secara dinamis agar terlihat sempurna di perangkat seluler, tablet, maupun desktop.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi web standar tanpa framework (Vanilla), sehingga sangat ringan dan cepat:

- **HTML5** - Struktur halaman web.
- **CSS3** - Penataan gaya (styling) dengan desain kustom yang bersih.
- **Vanilla JavaScript** - Logika aplikasi, manipulasi DOM, dan integrasi API (`fetch`).
- **OpenWeatherMap API** - Sumber data cuaca.

## 📂 Struktur Direktori

Berikut adalah struktur file dan folder dalam proyek ini:

```text
Weather-app/
├── assets/
│   ├── css/
│   │   └── style.css               # File styling utama
│   ├── font/
│   │   └── material-symbol-rounded.woff2 # Ikon lokal
│   ├── images/
│   │   ├── weather_icons/          # Kumpulan ikon kondisi cuaca (siang & malam)
│   │   ├── logo.png                # Logo aplikasi
│   │   └── openweather.png         # Atribusi OpenWeather
│   └── js/
│       ├── api.js                  # Konfigurasi dan fungsi pemanggilan API
│       ├── app.js                  # Logika utama aplikasi (DOM dan event listener)
│       ├── module.js               # Kumpulan fungsi utilitas/helper
│       └── route.js                # Penanganan rute pencarian/lokasi
├── index.html                      # Halaman utama HTML
├── favicon.svg                     # Ikon tab browser
├── style-guide.md                  # Panduan styling/palet warna
└── README.md                       # Dokumentasi proyek
```

## 🚀 Cara Menjalankan Secara Lokal (Getting Started)

Untuk menjalankan proyek ini di komputer Anda, ikuti langkah-langkah berikut:

### 1. Clone Repositori

Clone proyek ini ke dalam mesin lokal Anda menggunakan Git:

```bash
git clone https://github.com/username-anda/Weather-app.git
cd Weather-app
```

### 2. Dapatkan API Key OpenWeatherMap

Aplikasi ini memerlukan API Key agar dapat menarik data cuaca.

- Kunjungi [OpenWeatherMap](https://openweathermap.org/api) dan buat akun gratis.
- Buka dashboard Anda dan dapatkan **API Key**.

### 3. Konfigurasi API Key

Buka file `assets/js/api.js` (atau tempat konfigurasi API Anda berada) di teks editor favorit Anda (seperti VS Code).

- Cari variabel penyimpan API Key (biasanya bernama `api_key` atau serupa).
- Masukkan API Key Anda:

```javascript
const api_key = "MASUKKAN_API_KEY_ANDA_DI_SINI";
```

### 4. Jalankan Aplikasi

Karena aplikasi ini menggunakan modul JavaScript (`type="module"`), Anda tidak bisa membukanya langsung dengan klik dua kali (protokol `file://`). Anda harus menjalankannya melalui local server.

- **Menggunakan VS Code**: Instal ekstensi [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer). Klik kanan pada `index.html` dan pilih **"Open with Live Server"**.
- **Menggunakan Python (Alternatif)**: Buka terminal/command prompt di dalam folder proyek, lalu ketik `python -m http.server 8000`. Kemudian buka browser di `http://localhost:8000`.

## 🤝 Kontribusi

Kontribusi selalu diterima! Jika Anda ingin menambahkan fitur baru, memperbaiki bug, atau meningkatkan desain UI, silakan lakukan langkah berikut:

1. Fork repositori ini.
2. Buat branch fitur Anda (`git checkout -b fitur/FiturKeren`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4. Push ke branch (`git push origin fitur/FiturKeren`).
5. Buat sebuah **Pull Request**.

---

_Dibuat untuk mempelajari integrasi API dan Vanilla JavaScript._
