// server.js - PONTO DE ENTRADA da API
// Esse arquivo tem UMA responsabilidade: SUBIR o servidor e DESLIGAR com graça (graceful shutdown)
// Princípio S.O.L.I.D - Single Responsibility

// 1. IMPORTS - Separação de responsabilidades
import app from './app.js'; // app.js = Express configurado (middlewares, rotas, helmet, cors). Server.js só sobe!
import prisma from './config/prisma.js'; // Cliente do banco Postgres
import { redis } from './shared/infra/cache/redis.js'; // Cliente do Redis (cache + rate limit)

// 2. PORTA - Nunca hardcode!
// process.env.PORT vem do .env ou do docker-compose (5000)
// || 5000 = fallback se não tiver env (boa prática 12-factor app)
const PORT = process.env.PORT || 5000;

// 3. SUBIR SERVIDOR
// app.listen() retorna o objeto server do Node http.Server
// Guardamos em variável pra conseguir fechar depois no SIGTERM
// console.log é ok aqui porque é bootstrap, mas em produção use Pino logger
const server = app.listen(PORT, () => console.log(`API Senior rodando porta ${PORT}`));

// 4. GRACEFUL SHUTDOWN - ISSO QUE SEPARA JÚNIOR DE SENIOR!
// Quando Docker / Kubernetes / PM2 manda SIGTERM (pedido pra desligar)
// Se você só fizer process.exit(0) você MATA conexões ativas no meio!
// Usuário perdendo pagamento no meio? Produto sendo criado pela metade?

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido'); // Log pra saber que vai desligar (K8s manda isso)
  
  // server.close() = PARA de aceitar novas requisições, mas TERMINA as que já estão rodando
  // Isso é graceful: deixa quem já entrou terminar, não deixa mais ninguém entrar
  server.close(async () => {
    
    // 4.1 Fecha Prisma (pool de conexões Postgres)
    // Se não fechar, fica conexão aberta e o Postgres fica com "too many connections"
    await prisma.$disconnect();
    
    // 4.2 Fecha Redis
    // Se não fechar, fica socket aberto e dá memory leak
    await redis.quit();
    
    // 4.3 Agora sim pode matar o processo com código 0 (sucesso)
    // K8s vai ver que desligou certo e não vai reiniciar como erro
    process.exit(0);
  });
});

// O QUE FALTA PRA FICAR STAFF LEVEL:
// 1. Adicionar SIGINT também (Ctrl+C local): process.on('SIGINT', ...)
// 2. Timeout de 10s: se demorar muito pra fechar, força exit(1)
// 3. Health check: /health retornando 503 quando tá em shutdown
// 4. Trocar console.log por logger.info()