# 🔄 Cara Kerja Webhook Printful

Webhook adalah cara bagi Printful untuk memberitahu website Anda secara otomatis jika terjadi perubahan data (seperti produk baru, stok habis, atau pesanan dikirim) tanpa Anda harus mengeceknya secara manual.

---

## 🚀 Alur Kerja (End-to-End)

### 1. Website Menyediakan Endpoint (Penerima)
Website Anda telah memiliki "pintu masuk" khusus untuk menerima data dari Printful di URL:
👉 `https://www.printfultshirt.com/api/printful/webhook?secret=TOKEN_ANDA`

*   **Method**: `POST`
*   **Format Data**: `JSON`
*   **Event Utama**: `product_synced`, `product_updated`, `stock_updated`
*   **Lokasi Kode**: `app/api/printful/webhook/route.ts`

### 2. Pendaftaran Webhook ke Printful
Karena di dashboard Printful menu Webhook seringkali tersembunyi, Anda harus mendaftarkannya melalui API. Saya telah menyediakan script untuk ini:
1. Jalankan `npx tsx scripts/setup-webhooks.ts` di komputer lokal.
2. Script akan mengirim perintah ke Printful: *"Hey Printful, tolong kirim info ke URL saya jika ada perubahan produk/stok."*

### 3. Kejadian (Event) di Printful
Setiap kali Anda:
*   Menambahkan produk baru di Printful.
*   Mengubah harga atau nama varian.
*   Menghapus produk.
*   Stok barang di gudang Printful habis.

### 4. Printful Mengirim Payload
Printful akan mengirimkan data JSON secara otomatis ke website Anda. Contoh data untuk produk baru:
```json
{
  "type": "product_synced",
  "data": {
    "sync_product": { "id": 12345, "name": "T-Shirt Baru" }
  }
}
```

### 5. Website Memproses Data
Website Anda menerima data tersebut dan melakukan aksi otomatis:
*   **`product_synced` / `product_updated`**: Website otomatis menarik detail produk (warna, ukuran, gambar) ke database lokal.
*   **`product_deleted`**: Website otomatis menyembunyikan produk tersebut dari halaman depan.
*   **`stock_updated`**: Website otomatis memperbarui label "In Stock" atau "Out of Stock".

### 6. Respon Balik (Handshake)
Setelah selesai memproses, website Anda akan membalas dengan status **200 OK**. Jika server tidak membalas, Printful akan mencoba mengirim ulang data tersebut beberapa kali (retry).

---

## 🛠 Cara Setup Ulang (Jika Pindah Hosting/Server)

1.  Pastikan URL website di `.env` (VPS) sudah benar:
    ```bash
    NEXT_PUBLIC_SITE_URL=https://www.printfultshirt.com
    ```
2.  Jalankan pendaftaran ulang:
    ```bash
    docker compose exec nextjs npx tsx scripts/setup-webhooks.ts
    ```

## 🔐 Keamanan & Debugging

*   **Simulasi**: Gunakan Simulator Webhook di Dashboard Printful dengan URL `https://www.printfultshirt.com/api/printful/webhook`.
*   **Log**: Anda bisa memantau data yang masuk secara real-time di VPS dengan perintah:
    ```bash
    docker compose logs -f nextjs
    ```

---
*Dokumentasi ini dibuat untuk membantu pengelolaan integrasi otomatis Pintful.*
