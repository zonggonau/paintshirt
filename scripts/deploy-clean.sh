#!/bin/bash

# =========================
# CONFIG
# =========================
SERVICE_NAME="nextjs"    # nama service di docker-compose.yml
WEBHOOK_SETUP_COMMAND="docker compose exec $SERVICE_NAME npx tsx scripts/setup-webhooks.ts"

# =========================
# 1️⃣ Stop container & hapus volume
# =========================
echo "🚀 Stop container & hapus volume lama..."
docker compose down -v

# =========================
# 2️⃣ Bersihkan image & cache lama
# =========================
echo "🧹 Bersihkan semua cache dan image lama..."
docker system prune -a -f

# =========================
# 3️⃣ Build ulang & jalankan container
# =========================
echo "⚡ Build ulang container tanpa cache dan jalankan..."
docker compose up -d --build --no-cache

# =========================
# 4️⃣ Sinkronisasi database & seed
# =========================
echo "🗄️ Sinkronisasi database..."
docker compose exec $SERVICE_NAME npx drizzle-kit push

echo "🌱 Seed kategori utama..."
docker compose exec $SERVICE_NAME npm run db:seed

# =========================
# 5️⃣ Setup webhook
# =========================
if [ ! -z "$WEBHOOK_SETUP_COMMAND" ]; then
    echo "🔗 Setup webhook Printful..."
    eval $WEBHOOK_SETUP_COMMAND
fi

echo "✅ Deploy selesai!"
