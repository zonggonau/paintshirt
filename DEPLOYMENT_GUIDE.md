# 🚀 Panduan Deployment: Local -> GitHub -> VPS

Proyek ini menggunakan alur otomatisasi berbasis **GitHub Actions** dan **Docker Compose**. Setiap kali Anda melakukan `push` ke branch `master`, proyek akan otomatis ter-deploy ke VPS.

---

## 🛠 1. Konfigurasi Awal (Sekali Saja)

### A. Persiapan di GitHub (Secrets)
Agar GitHub bisa masuk ke VPS Anda, tambahkan variabel berikut di **Settings > Secrets and variables > Actions**:

| Variabel | Deskripsi |
| :--- | :--- |
| `VPS_HOST` | Alamat IP VPS Anda (misal: `161.97.96.119`) |
| `VPS_USER` | Username SSH (biasanya `root`) |
| `VPS_SSH_KEY` | Isi dari file Private Key SSH Anda (`id_rsa` atau `id_ed25519`) |
| `VPS_PORT` | Port SSH (default: `22`) |

### B. Persiapan di VPS
1. **Buat Folder Proyek**:
   ```bash
   mkdir -p /var/www/projek/tshirt && cd /var/www/projek/tshirt
   ```
2. **Clone Repositori** (Gunakan SSH):
   ```bash
   git clone git@github.com:zonggonau/paintshirt.git .
   ```
3. **Konfigurasi Environment (`.env`)**:
   Buat file `.env` manual di VPS karena file ini tidak ikut di-push ke GitHub:
   ```bash
   nano .env
   ```
   *Isi dengan API Key Printful, Snipcart, dan password Database Anda.*

---

## 🏎 2. Alur Kerja Harian (Development)

Setiap kali Anda ingin memperbarui website:

1. **Coding di komputer lokal**.
2. **Simpan dan Commit**:
   ```bash
   git add .
   git commit -m "Deskripsi perubahan Anda"
   ```
3. **Push ke GitHub**:
   ```bash
   git push origin master
   ```
4. **Pantau Otomatisasi**:
   Buka tab **Actions** di repositori GitHub Anda untuk melihat status deployment. Jika berwarna hijau, website sudah terupdate di VPS.

---

## 🔒 3. Setup SSL (HTTPS) Gratis

Langkah ini dilakukan untuk pertama kali setelah domain Anda diarahkan (A Record) ke IP VPS.

### Langkah A: Daftarkan Sertifikat
Jalankan perintah ini di VPS:
```bash
cd /var/www/projek/tshirt

docker compose run --rm --entrypoint certbot certbot certonly --webroot --webroot-path=/var/www/certbot -d printfultshirt.com -d www.printfultshirt.com --email admin@printfultshirt.com --agree-tos --no-eff-email
```

### Langkah B: Aktifkan HTTPS di Nginx
Setelah sertifikat berhasil didapat:
1. Edit file `nginx/conf.d/default.conf`.
2. Hapus komentar (`#`) pada blokir `listen 443 ssl` dan aktifkan `return 301 https://...`.
3. Restart Nginx:
   ```bash
   docker compose restart nginx
   ```

---

## 🔍 4. Perintah Berguna di VPS

Gunakan perintah ini lewat SSH untuk memantau aplikasi:

* **Cek Status Semua Kontainer**:
  ```bash
  docker compose ps
  ```
* **Melihat Log Aplikasi (Real-time)**:
  ```bash
  docker compose logs -f nextjs
  ```
* **Melihat Log Nginx (Cek Traffic)**:
  ```bash
  docker compose logs -f nginx
  ```
* **Restart Manual**:
  ```bash
  docker compose restart
  ```
* **Update Kode Manual (Jika GitHub Actions bermasalah)**:
  ```bash
  git pull origin master
  docker compose up -d --build
  ```

---

## 💡 Troubleshooting (Kendala Umum)

1. **Website tidak bisa diakses?**
   - Cek apakah firewall VPS mengizinkan port 80 dan 443: `ufw allow 80/tcp && ufw allow 443/tcp`.
2. **Database Error?**
   - Pastikan variabel `DATABASE_URL` di file `.env` sudah mengarah ke servis `postgres`.
3. **Sertifikat SSL expired?**
   - SSL akan otomatis diperbarui oleh servis `certbot` setiap 12 jam (jika sudah mendekati masa kadaluarsa). Anda tidak perlu melakukan apa pun.

---
🚀 *Happy Coding!*




Untuk menghapus seluruh sisa Docker (termasuk database lama yang mungkin korup) dan membangun ulang sistem secara benar-benar bersih di VPS, silakan jalankan rangkaian perintah "Hard Reset" berikut di terminal VPS (SSH) Anda:

1. Hapus Total Kontainer & Data (Volume)
Perintah ini akan menghentikan sistem dan menghapus seluruh isi database agar kita bisa mulai dari nol yang bersih.

bash
cd /var/www/projek/tshirt
docker compose down -v
2. Bersihkan Sisa Gambar & Build Cache
Ini akan menghapus cache lama agar Docker mengunduh ulang dependensi yang benar-benar bersih.

bash
docker system prune -a -f
3. Build & Jalankan Ulang dari Nol
Kita akan membangun ulang kontainer tanpa menggunakan cache sama sekali (--no-cache).

bash
docker compose up -d --build --no-cache
4. Sinkronisasi Database & Seed Kategori
Karena database tadi kita hapus total, kita harus membuat struktur tabel baru dan menarik ulang kategori utama dari Printful.

bash
# Sinkronkan struktur tabel terbaru
docker compose exec nextjs npx drizzle-kit push
# Tarik ulang kategori produk
docker compose exec nextjs npm run db:seed
5. Setup Ulang Webhook (Wajib)
Ini memastikan Printful mulai mengirim data ke "instalasi bersih" yang baru ini.

bash
docker compose exec nextjs npx tsx scripts/setup-webhooks.ts
Hasil Akhir: Sistem Anda sekarang benar-benar baru. Produk akan mulai muncul secara otomatis di website setiap kali Webhook dari Printful masuk, atau Anda bisa memicu sinkronisasi manual jika diperlukan. Website juga sekarang menggunakan tag <img /> sehingga masalah gambar tidak tampil seharusnya sudah hilang total.


docker exec -it dropshiping-postgres psql -U postgres

ALTER USER postgres WITH PASSWORD 'postgres';
\q
docker compose restart nextjs
