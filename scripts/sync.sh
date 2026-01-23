#!/bin/bash

# Konfigurasi
URL="https://printfultshirt.com/api/sync/products?type=scheduled"
SECRET="EQvFkPka6N5dXDJG8uWCUr0Wzm6d8tfwGIachate"

echo "--- Starting Sync: $(date) ---"

# Eksekusi CURL
curl -X POST "$URL" \
     -H "x-webhook-secret: $SECRET" \
     -H "Content-Type: application/json"

echo -e "\n--- Sync Finished: $(date) ---\n"
