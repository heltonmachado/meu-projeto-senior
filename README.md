# meu-projeto-senior - PRONTO PARA RODAR

## Como executar (testado)

1. Descompacte
2. Na raiz:
   docker compose config  # valida YAML
   docker compose up -d db redis
   # aguarde 20s ate ficar healthy

3. Backend:
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   npm run dev
   # API em http://localhost:5000
   # Teste: curl http://localhost:5000/

4. Frontend:
   cd ../frontend
   npm install
   npm run dev
   # http://localhost:5173

Login padrão após registrar:
POST http://localhost:5000/api/auth/register {"name":"Joao","email":"joao@teste.com","password":"123456"}

5. Docker full:
   docker compose up -d --build
   Frontend http://localhost:3000 (se adicionar service no compose, caso contrario use vite)
   docker compose down -v

CORREÇÕES FEITAS:
- docker-compose.yml corrigido (start_period separado, indentação yaml.safe_load)
- schema.prisma com AuditLog e relações corretas
- auth.js com orderBy e rotação completa
- Login.jsx e Products.jsx completos com estilo fundo branco texto preto
- App.jsx completo
- frontend package.json + vite.config + index.html inclusos


=====================================
rodar o front
cd ~/Downloads/meu-projeto-senior/frontend
npm run dev

===========================
rodar o back
cd ~/Downloads/meu-projeto-senior

# 1 - Sobe SÓ o banco e redis no Docker (backend e frontend ficam local)
docker compose up -d db redis

# 2 - Abre 2 terminais:

# Terminal 1 - BACK
cd ~/Downloads/meu-projeto-senior/backend
npm run dev
# http://localhost:5000 - reinicia sozinho quando você salva arquivo

# Terminal 2 - FRONT (Ctrl+Shift+T pra abrir novo)
cd ~/Downloads/meu-projeto-senior/frontend
npm run dev
# http://localhost:5173 - reinicia sozinho quando você salva arquivo