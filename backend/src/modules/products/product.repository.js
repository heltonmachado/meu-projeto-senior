import prisma from '../../config/prisma.js';

export const productRepo = {
  findAll: ({ userId, page = 1, limit = 10, search }) => {
    const skip = (Number(page) - 1) * Number(limit);
    return prisma.product.findMany({
      where: { userId, name: search ? { contains: search, mode: 'insensitive' } : undefined },
      skip, take: Number(limit), orderBy: { createdAt: 'desc' }
    });
  },
  createWithTransaction: (data, userId) => prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data: { ...data, price: parseFloat(data.price), userId } });
    await tx.auditLog.create({ data: { action: 'CREATE_PRODUCT', userId, metadata: JSON.stringify({ productId: product.id }) } });
    return product;
  })
};
