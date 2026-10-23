import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'teste@teste.com' },
    update: {},
    create: { name: 'Teste', email: 'teste@teste.com', password: hash, role: 'USER' }
  });
  console.log(`Seed OK: ${user.email}`);
}
main().finally(() => prisma.$disconnect());
