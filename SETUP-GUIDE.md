# Panduan Setup Google Drive API untuk Photo Storage Pro

## 📋 Langkah-Langkah Konfigurasi

### 1️⃣ Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Login dengan akun Google Anda (oranghilang377@gmail.com)
3. Klik "Select a project" → "NEW PROJECT"
4. Beri nama project: "Photo Storage Pro"
5. Klik "CREATE"

### 2️⃣ Aktifkan Google Drive API

1. Di sidebar, pilih "APIs & Services" → "Library"
2. Cari "Google Drive API"
3. Klik pada hasil pencarian
4. Klik tombol "ENABLE"

### 3️⃣ Buat API Credentials

#### Buat API Key:
1. Pergi ke "APIs & Services" → "Credentials"
2. Klik "CREATE CREDENTIALS" → "API key"
3. Copy API Key yang muncul
4. (Opsional) Klik "RESTRICT KEY" untuk keamanan:
   - Application restrictions: pilih "HTTP referrers"
   - API restrictions: pilih "Google Drive API"

#### Buat OAuth 2.0 Client ID:
1. Di halaman "Credentials", klik "CREATE CREDENTIALS" → "OAuth client ID"
2. Jika diminta, konfigurasi OAuth consent screen dulu:
   - User Type: External
   - App name: Photo Storage Pro
   - User support email: oranghilang377@gmail.com
   - Developer contact: oranghilang377@gmail.com
   - Klik "SAVE AND CONTINUE"
   - Scopes: tambahkan "../auth/drive.file" (klik "ADD OR REMOVE SCOPES")
   - Test users: tambahkan oranghilang377@gmail.com
   - Klik "SAVE AND CONTINUE"

3. Kembali ke Create OAuth client ID:
   - Application type: "Web application"
   - Name: "Photo Storage Web Client"
   - Authorized JavaScript origins: 
     - http://localhost
     - http://localhost:8000
     - (tambahkan domain Anda jika sudah online)
   - Authorized redirect URIs:
     - http://localhost
     - http://localhost:8000
   - Klik "CREATE"

4. Copy "Client ID" yang muncul

### 4️⃣ Update File HTML

Buka file `photo-storage-drive.html` dan ganti nilai berikut:

```javascript
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY_HERE';
```

Ganti dengan:
- `YOUR_CLIENT_ID_HERE` → Client ID yang Anda dapat dari langkah 3
- `YOUR_API_KEY_HERE` → API Key yang Anda dapat dari langkah 3

### 5️⃣ Jalankan Website

#### Opsi 1: Menggunakan Python (Recommended)
```bash
# Di folder tempat file HTML berada
python -m http.server 8000
```
Buka browser: http://localhost:8000/photo-storage-drive.html

#### Opsi 2: Menggunakan Live Server (VS Code)
1. Install extension "Live Server" di VS Code
2. Klik kanan pada file HTML
3. Pilih "Open with Live Server"

#### Opsi 3: Upload ke Web Hosting
Upload file ke hosting dan update Authorized JavaScript origins dengan domain Anda

### 6️⃣ Testing

1. Buka website di browser
2. Klik tombol "Masuk dengan Google"
3. Login dengan oranghilang377@gmail.com
4. Berikan izin akses ke Google Drive
5. Upload foto dan coba simpan ke Drive
6. Cek folder "Photo Storage Pro" di Google Drive Anda

## ⚠️ Catatan Penting

1. **Keamanan API Key**: 
   - Jangan share API Key & Client ID secara publik
   - Gunakan environment variables untuk production
   - Aktifkan API restrictions di Google Cloud Console

2. **OAuth Consent Screen**:
   - Status "Testing" hanya bisa digunakan oleh test users
   - Untuk publish, perlu verifikasi dari Google

3. **Quota & Limits**:
   - Free tier: 15 GB storage di Google Drive
   - Rate limit: 1000 requests per 100 seconds per user

4. **CORS Issues**:
   - Website harus dijalankan dari server (tidak bisa file:///)
   - Gunakan localhost atau hosting online

## 🔧 Troubleshooting

### Error: "Origin not allowed"
- Pastikan origin Anda sudah ditambahkan di Authorized JavaScript origins

### Error: "API key not valid"
- Periksa API Key sudah benar
- Pastikan Google Drive API sudah enabled

### Error: "Access blocked: This app's request is invalid"
- Configure OAuth consent screen dengan benar
- Tambahkan test user (email Anda)

### Tidak bisa upload ke Drive
- Periksa folder "Photo Storage Pro" berhasil dibuat
- Cek console browser untuk error messages
- Pastikan sudah login dan authorized

## 📞 Support

Jika ada masalah, cek:
1. Browser Console (F12) untuk error messages
2. Network tab untuk melihat API requests
3. Google Cloud Console → API & Services → Dashboard untuk monitoring

## ✅ Checklist Setup

- [ ] Project dibuat di Google Cloud Console
- [ ] Google Drive API enabled
- [ ] API Key created dan dicopy
- [ ] OAuth 2.0 Client ID created dan dicopy
- [ ] OAuth consent screen configured
- [ ] Test user ditambahkan (oranghilang377@gmail.com)
- [ ] CLIENT_ID dan API_KEY diupdate di HTML
- [ ] Website dijalankan via server (localhost atau online)
- [ ] Berhasil login dengan Google
- [ ] Berhasil upload dan save ke Drive

---

**Email untuk testing**: oranghilang377@gmail.com

Selamat menggunakan Photo Storage Pro! 🎉
