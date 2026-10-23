meu-projeto-senior

Node
Express
Prisma
Postgres
Redis
React
Docker
JWT

    Full Stack Sênior - API com JWT Refresh Rotation + Redis + Postgres + Docker + Frontend React

Projeto de nível sênior com arquitetura modular, segurança com Helmet, observabilidade com Pino, graceful shutdown e seed automático.
📸 O que o projeto faz

    Auth completo: Registro, login com rate limit, refresh token com rotação (jti), logout revogando token no Postgres e Redis, me protegida
    Produtos: CRUD com relação User 1:N, paginação pronta para escala, validação Zod
    Segurança: Helmet, CORS com credentials, cookies httpOnly, hash de refresh token SHA256, bcrypt 10 rounds
    Infra: Docker Compose com 4 serviços (db, redis, api, web), healthcheck no Postgres, volumes nomeados, restart unless-stopped
    Observabilidade: RequestId em todas as requisições, Pino logger, /health com uptime, errorHandler com AppError

🧱 Arquitetura Real

backend/
├── src/
│   ├── app.js                 # Helmet, CORS, RateLimit 100/15min, PinoHttp, RequestId, Rotas
│   ├── server.js              # Graceful shutdown SIGTERM (fecha Prisma e Redis)
│   ├── config/prisma.js       # PrismaClient singleton
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js  # httpOnly cookie, sameSite lax
│   │   │   ├── auth.service.js     # generateAccessToken 15m, generateRefreshToken 7d, jti UUID, Redis EX
│   │   │   ├── auth.repository.js
│   │   │   └── auth.routes.js
│   │   └── products/
│   │       ├── product.controller.js
│   │       ├── product.service.js
│   │       ├── product.repository.js
│   │       ├── product.routes.js
│   │       └── product.schema.js (Zod)
│   └── shared/
│       ├── errors/AppError.js
│       ├── middlewares/auth.js, errorHandler.js, requestId.js, validate.js
│       └── infra/cache/redis.js (ioredis), logger/pino.js
├── prisma/
│   ├── schema.prisma (User, Product, RefreshToken, AuditLog)
│   └── seed.js (teste@teste.com / 123456)
├── Dockerfile (multi-stage ready)
└── .env.example
frontend/
├── src/
│   ├── pages/Login.jsx (fundo branco, texto preto)
│   ├── pages/Products.jsx
│   ├── context/AuthContext.jsx
│   ├── api/api.js
│   └── App.jsx
├── vite.config.js
└── Dockerfile (nginx)

🗄️ Banco de Dados (Prisma)

User: id, name, email @unique, password, role @default(USER), products[], refreshTokens[], createdAt
Product: id, name, description?, price Float, stock Int @default(0), userId @index, user relation Cascade
RefreshToken: id, tokenHash @unique (sha256), userId, revoked Boolean @default(false), expiresAt
AuditLog: id, action, userId, metadata?, createdAt

🚀 Quick Start - Dev (Recomendado)

# 1. Clone e suba banco
git clone https://github.com/heltonmachado/meu-projeto-senior.git
cd meu-projeto-senior
docker compose up -d db redis
docker ps # postgres_senior :5433->5432 healthy, redis_senior :6379
# 2. Backend
cd backend
cp .env.example .env
# .env correto:
# DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/crud_senior?schema=public
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=SEU_SEGREDO_64_CHARS_1234567890_ABCDEF_SUPER_SEGURO
# JWT_REFRESH_SECRET=OUTRO_SEGREDO_64_CHARS_0987654321_FEDCBA_SUPER_SEGURO
npm install
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
# Seed OK: teste@teste.com
npm run dev
# API http://localhost:5000 - Teste: curl http://localhost:5000/health
# 3. Frontend (outro terminal)
cd ../frontend
npm install
npm run dev
# http://localhost:5173 - Login: teste@teste.com / 123456

🐳 Docker Full (Produção Local)

docker compose up -d --build
# Web http://localhost:3000 (nginx)
# API http://localhost:5000
# DB  127.0.0.1:5433
# Redis 127.0.0.1:6379
docker compose logs -f api
docker compose down -v

🔐 Variáveis de Ambiente

backend/.env.example

PORT=5000
DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/crud_senior?schema=public
# Para Docker interno: postgres://postgres:postgres123@db:5432/crud_senior
REDIS_URL=redis://localhost:6379
# Docker interno: redis://redis:6379
JWT_SECRET=64_CHARS_SUPER_SEGURO
JWT_REFRESH_SECRET=64_CHARS_SUPER_SEGURO
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

📡 Endpoints
Método	Rota	Auth	Descrição
GET	/	-	API Senior OK + requestId
GET	/health	-	status ok + uptime
POST	/api/auth/register	-	Zod validation
POST	/api/auth/login	RateLimit Redis	Retorna user + accessToken, seta httpOnly refresh cookie
POST	/api/auth/refresh	Cookie	Rotação, revoga old token
POST	/api/auth/logout	Cookie	Revoga refresh no Postgres e Redis
GET	/api/auth/me	JWT	Perfil
CRUD	/api/products	JWT	Produtos do usuário
🛡️ Segurança Sênior Implementada

    Helmet, CORS com split de origins, limit 10kb json
    RateLimit global 100/15min + login rate limit 5 tentativas / 15min via Redis
    Bcrypt 10 rounds, tokenHash SHA256 no banco, revoked flag
    Access 15m, Refresh 7d, jti UUID, Redis EX com mesmo TTL
    httpOnly cookie, sameSite lax, secure false dev / true prod
    AppError com statusCode, errorHandler não vaza stack
    Graceful shutdown: server.close() -> prisma.$disconnect() -> redis.quit()

🧪 Seed e Testes

npx prisma db seed
# Cria: teste@teste.com / 123456
npm test # quando adicionar jest

📦 Correções Aplicadas

    docker-compose.yml: start_period separado, healthcheck pg_isready, yaml.safe_load, volumes nomeados
    schema.prisma: AuditLog + RefreshToken com relações e índices
    auth.service.js: orderBy corrigido, rotação completa com Redis EX separado (não {EX:})
    Login.jsx e Products.jsx com estilo fundo branco texto preto
    server.js com SIGTERM e comentários SOLID
    package.json com prisma.seed fora de scripts

👨‍💻 Autor

Helton Machado - github.com/heltonmachado
📄 Licença

MIT