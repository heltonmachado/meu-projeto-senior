import prisma from '../../config/prisma.js';
import { createProductSchema, updateProductSchema } from './product.schema.js';

class ProductServiceClass {
  async create(data, userId) {
    const parsed = createProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Dados invalidos: ${parsed.error.message}`);
    }
    return prisma.product.create({
      data: { ...parsed.data, userId: Number(userId) },
    });
  }

  async list(userId) {
    return prisma.product.findMany({ 
      where: { userId: Number(userId) }, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  async update(id, data, userId) {
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Dados invalidos: ${parsed.error.message}`);
    }

    // id é Int, tem que converter
    const productId = Number(id);

    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: Number(userId) }
    });

    if (!existing) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return prisma.product.update({
      where: { id: productId },
      data: parsed.data,
    });
  }

  async remove(id, userId) {
    const productId = Number(id);

    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: Number(userId) }
    });

    if (!existing) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return prisma.product.delete({
      where: { id: productId }
    });
  }
}

const ProductService = new ProductServiceClass();
export default ProductService;