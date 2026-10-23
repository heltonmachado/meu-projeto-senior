import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  stock: z.coerce.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();