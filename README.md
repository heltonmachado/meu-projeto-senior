Senior Project - Fullstack API + Dashboard

    Sistema completo com autenticação JWT, CRUD de produtos, cache com Redis, logs estruturados, política de senha forte e recuperação via e-mail.

Autor: Helton Machado - Desenvolvedor Fullstack | Belém - PA
GitHub: https://github.com/heltonmachado/meu-projeto-senior
Stack: Node.js + React + PostgreSQL + Redis + Docker
Stack

Backend: Node.js, Express, Prisma ORM, PostgreSQL, Redis, JWT, Zod, Pino Logger, Resend, bcryptjs, Helmet, Rate Limit, crypto
Frontend: React, Vite, React Router, Axios com interceptor sênior (failedQueue + _retry), AuthContext
Infra: Docker, Docker Compose, Nginx
Arquitetura

meu-projeto-senior/
├── backend/
│   ├── prisma/schema.prisma (User, Product, RefreshToken, PasswordResetToken, AuditLog)
│   ├── src/modules/auth (register, login, refresh, logout, forgot-password, reset-password)
│   ├── src/modules/products
│   ├── src/shared/middlewares (auth, errorHandler, requestId)
│   └── src/shared/infra (logger, cache)
├── frontend/
│   ├── src/pages (Login.jsx, ForgotPassword.jsx, ResetPassword.jsx, Products.jsx)
│   ├── src/api/api.js (interceptor sênior)
│   ├── src/context/AuthContext.jsx
│   ├── src/App.jsx
│   └── src/index.css (100% CSS centralizado)
└── docker-compose.yml

Features Sênior

    Register com senha forte: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$ com feedback visual
    Login com httpOnly cookie + Toggle Mostrar/Ocultar senha
    Refresh Token Rotation com Redis (JTI único, SHA256, fila failedQueue)
    Forgot Password - POST /api/auth/forgot-password, token SHA256, expira 15min, não revela se e-mail existe, envio via Resend
    Reset Password - POST /api/auth/reset-password, valida token, troca hash, revoga todos refresh tokens
    CRUD Produtos com RBAC
    100% CSS em index.css

Como rodar

    Clone e configure env:

git clone https://github.com/heltonmachado/meu-projeto-senior.git
cd meu-projeto-senior
cp .env.example .env

    Com Docker:

docker-compose up --build

    Sem Docker:

cd backend && npm install && npx prisma migrate dev && npm run dev
cd frontend && npm install && npm run dev

Frontend em: http://localhost:5173
Backend em: http://localhost:5000
Variáveis .env

Crie o arquivo .env a partir do .env.example e preencha com os seus dados. Nunca suba o arquivo .env com chaves reais para o GitHub.

DATABASE_URL=postgresql://user:password@localhost:5432/meu_projeto_senior
REDIS_URL=redis://localhost:6379
JWT_SECRET=sua_chave_secreta_aqui
RESEND_API_KEY=sua_chave_resend_aqui
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

Endpoints
Método	Rota	Descrição
POST	/api/auth/register	Criar conta
POST	/api/auth/login	Login
POST	/api/auth/refresh	Renovar token
POST	/api/auth/logout	Logout
POST	/api/auth/forgot-password	Solicitar recuperação de senha
POST	/api/auth/reset-password	Redefinir senha
GET	/api/auth/me	Dados do usuário logado
GET	/api/products	Listar produtos
POST	/api/products	Criar produto
PUT	/api/products/:id	Atualizar produto
DELETE	/api/products/:id	Excluir produto
Testar recuperar senha

curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@exemplo.com"}'

Segurança

    Senhas bcrypt 10 rounds
    Token reset SHA256
    httpOnly cookie (XSS safe)
    Rate limit 100 req / 15min
    Helmet headers
    CORS credentials
    Validação senha forte frontend e backend
    Expiração 15min + revogação após reset

Atualização 25/11/2026

    Descrição corrigida para recrutadores
    README reorganizado com tabela de endpoints
    Variáveis de ambiente com placeholders, sem chaves reais

Autor

Helton Machado - heltonmachado2017@gmail.com
Belém - PA | Desenvolvedor Fullstack PHP / Node.js
Licença MIT