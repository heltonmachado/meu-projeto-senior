import { Router } from 'express';
import { listProducts, createProduct } from './product.controller.js';
import { protect } from '../../shared/middlewares/auth.js';

const router = Router();

// Protege todas as rotas de produtos
router.use(protect);

router.get('/', listProducts);
router.post('/', createProduct);

export default router;