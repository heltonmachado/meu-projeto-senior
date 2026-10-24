# Senior Project - Fullstack API + Dashboard

> Sistema completo com autenticacao JWT, CRUD de produtos, cache com Redis, logs estruturados, politica de senha forte e recuperacao via email.

### Stack

Backend: Node.js, Express, Prisma ORM, PostgreSQL, Redis, JWT, Zod, Pino Logger, Resend, bcryptjs, Helmet, Rate Limit, crypto
Frontend: React, Vite, React Router, Axios com interceptor senior (failedQueue + _retry), AuthContext
Infra: Docker, Docker Compose, Nginx

### Arquitetura

meu-projeto-senior/
├── backend/
│   ├── prisma/schema.prisma (User, Product, RefreshToken, PasswordResetToken, AuditLog)
│   ├── src/modules/auth (register, login, refresh, logout, forgot-password, reset-password)
│   ├── src/modules/products
│   ├── src/shared/middlewares (auth, errorHandler, requestId)
│   └── src/shared/infra (logger, cache)
├── frontend/
│   ├── src/pages (Login.jsx, ForgotPassword.jsx, ResetPassword.jsx, Products.jsx)
│   ├── src/api/api.js (interceptor senior)
│   ├── src/context/AuthContext.jsx
│   ├── src/App.jsx
│   └── src/index.css (100% CSS centralizado)
└── docker-compose.yml

### Features Senior

- Register com senha forte: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$ com feedback visual
- Login com httpOnly cookie + Toggle Mostrar/Ocultar senha
- Refresh Token Rotation com Redis (JTI unico, SHA256, fila failedQueue)
- Forgot Password - POST /api/auth/forgot-password, token SHA256, expira 15min, nao revela se email existe, envio via Resend para heltonmachado2017@gmail.com
- Reset Password - POST /api/auth/reset-password, valida token, troca hash, revoga todos refresh tokens
- CRUD Produtos com RBAC
- 100% CSS em index.css

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

### Variaveis .env

[STRIPPED 68 bytes]re_...
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

### Endpoints

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/me
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

### Testar recuperar senha

curl -X POST http://localhost:5000/api/auth/forgot-password -H "Content-Type: application/json" -d '{"email":"heltonmachado2017@gmail.com"}'

### Seguranca

- Senhas bcrypt 10 rounds
- Token reset SHA256
- httpOnly cookie (XSS safe)
- Rate limit 100 req / 15min
- Helmet headers
- CORS credentials
- Validacao senha forte frontend e backend
- Expiracao 15min + revogacao apos reset

### Autor

Helton Machado - heltonmachado2017@gmail.com

### Licenca MIT