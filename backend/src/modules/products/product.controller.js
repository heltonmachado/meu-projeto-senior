import ProductService from './product.service.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.create(req.body, req.user.id);
    return res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await ProductService.list(req.user.id);
    return res.json(products);
  } catch (err) {
    next(err);
  }
};

// ADICIONA ESSAS 2 - MESMO PADRÃO DO SEU
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductService.update(id, req.body, req.user.id);
    return res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ProductService.remove(id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};