import prisma from '../../config/prisma.js';
import { createProductSchema } from './product.schema.js';

class ProductServiceClass {
  async create(data, userId) {
    const parsed = createProductSchema.safeParse(data);
    
    if (!parsed.success) {
      console.error('ZOD ERROR:', JSON.stringify(parsed.error.format(), null, 2));
      console.error('DADOS:', data);
      throw new Error(`Dados invalidos: ${parsed.error.message}`);
    }

    return prisma.product.create({
      data: {
        ...parsed.data,
        userId,
      },
    });
  }

  async list(userId) {
    return prisma.product.findMany({ 
      where: { userId }, 
      orderBy: { createdAt: 'desc' } 
    });
  }
}

const ProductService = new ProductServiceClass();
export default ProductService;