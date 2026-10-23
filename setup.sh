#!/bin/bash
set -e
echo "=== SENIOR CRUD SETUP ==="
docker compose config > /dev/null && echo "YAML OK"
docker compose up -d db redis
echo "Aguardando postgres healthy..."
sleep 20
cd backend
npm install
npx prisma migrate dev --name init --skip-generate
npx prisma generate
echo "Backend OK - rodando em background..."
npm run dev &
cd ../frontend
npm install
echo "Frontend OK - rode npm run dev"
echo "=== TUDO PRONTO ==="
echo "API: http://localhost:5000"
echo "APP: http://localhost:5173"
echo "Teste: curl http://localhost:5000/"
