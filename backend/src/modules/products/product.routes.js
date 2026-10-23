import { Router } from 'express';
import { listProducts, createProduct, updateProduct, deleteProduct } from './product.controller.js';
import { protect } from '../../shared/middlewares/auth.js';

const router = Router();

// Protege todas as rotas de produtos
router.use(protect);

// Rota para listar produtos e criar produto
router.get('/', listProducts);
router.post('/', createProduct);

// ADICIONA ESSAS ROTAS PARA EDITAR E DELETAR PRODUTOS
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;