#!/bin/bash
cd ~/Downloads/meu-projeto-senior
docker compose up -d db redis
echo "✅ DB:5433 e Redis:6379 no Docker"
echo "👉 Agora abre 2 terminais e roda:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
