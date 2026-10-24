// Importa o cliente do Prisma (é ele que conversa com o banco de dados)
import prisma from '../../config/prisma.js';

// Importa os schemas de validação do Zod. 
// createProductSchema = regras para CRIAR (ex: nome obrigatório)
// updateProductSchema = regras para ATUALIZAR (ex: tudo opcional)
import { createProductSchema, updateProductSchema } from './product.schema.js';

// Criamos uma classe para organizar todas as funções de produto em um só lugar
// Isso é chamado de Service Layer (camada de serviço)
class ProductServiceClass {

  // CREATE - Cria um produto novo
  // data = o que vem do front (req.body) -> { name, price, etc }
  // userId = id do usuário logado (vem do token JWT)
  async create(data, userId) {
    // 1. Validação com Zod: verifica se os dados estão no formato correto
    // safeParse não quebra o código, ele retorna { success: true/false }
    const parsed = createProductSchema.safeParse(data);

    // Se a validação falhou...
    if (!parsed.success) {
      // Lança um erro que vai ser capturado pelo controller
      // parsed.error.message tem o detalhe do que está errado
      throw new Error(`Dados invalidos: ${parsed.error.message}`);
    }

    // Se passou na validação, cria no banco
    // parsed.data = dados já limpos e validados pelo Zod
    // ...parsed.data = espalha os dados validados (nome, preço...)
    // userId: Number(userId) = vincula o produto ao dono. 
    // Number() é obrigatório porque seu ID no banco é Int, mas do token vem como String
    return prisma.product.create({
      data: { ...parsed.data, userId: Number(userId) },
    });
  }

  // LIST - Lista todos os produtos de um usuário
  async list(userId) {
    // findMany = SELECT * FROM product
    return prisma.product.findMany({ 
      // where = filtro: só traz onde userId for igual ao do usuário logado
      // Isso impede que o usuário A veja produtos do usuário B
      where: { userId: Number(userId) }, 
      // orderBy = ordenação: createdAt desc = mais novos primeiro
      orderBy: { createdAt: 'desc' } 
    });
  }

  // UPDATE - Atualiza um produto existente
  // id = id do produto que vem da URL (ex: PUT /products/5)
  async update(id, data, userId) {
    // 1. Valida os dados de atualização
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Dados invalidos: ${parsed.error.message}`);
    }

    // 2. Converte o ID. Na URL ele chega como "5" (string), mas no banco é 5 (int)
    const productId = Number(id);

    // 3. TRAVA DE SEGURANÇA - Checa se o produto existe E se pertence a esse usuário
    // findFirst com dois filtros: id do produto + id do dono
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: Number(userId) }
    });

    // Se não achou, significa que não existe ou não é dele
    if (!existing) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404; // Adicionamos um status 404 para o middleware de erro saber que é "não encontrado"
      throw error;
    }

    // 4. Se achou e é dele, pode atualizar
    // where = qual produto atualizar
    // data = o que atualizar (só o que passou na validação)
    return prisma.product.update({
      where: { id: productId },
      data: parsed.data,
    });
  }

  // REMOVE - Deleta um produto
  async remove(id, userId) {
    // Converte ID de novo
    const productId = Number(id);

    // Mesma trava de segurança do update: verifica se é dele mesmo
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: Number(userId) }
    });

    if (!existing) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Se for dele, deleta do banco
    // delete = DELETE FROM product WHERE id = productId
    return prisma.product.delete({
      where: { id: productId }
    });
  }
}

// Cria uma única instância da classe (Singleton)
// Assim você não precisa ficar dando "new ProductServiceClass()" em todo arquivo
// É só importar e usar: ProductService.list()
const ProductService = new ProductServiceClass();

// Exporta essa instância pronta
export default ProductService;