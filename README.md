# Senior Project - Fullstack API + Dashboard

> Sistema completo com autenticacao JWT, CRUD de produtos, cache com Redis, logs estruturados e deploy com Docker.

### Stack

Backend: Node.js, Express, Prisma ORM, PostgreSQL, Redis, JWT, Zod, Pino Logger
Frontend: React, Vite, React Router, Axios
Infra: Docker, Docker Compose, Nginx

### Arquitetura

meu-projeto-senior/
- backend/src/modules/auth
- backend/src/modules/products
- backend/src/shared/middlewares
- frontend/src/pages
- docker-compose.yml

### Como rodar

1. Clone e configure env:
git clone https://github.com/heltonmachado/meu-projeto-senior.git
cd meu-projeto-senior
cp .env.example .env

2. Com Docker:
docker-compose up --build

3. Sem Docker:
cd backend && npm install && npx prisma migrate dev && npm run dev
cd frontend && npm install && npm run dev

### Endpoints

POST /api/auth/register
POST /api/auth/login
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

### Autor

Helton Machado
