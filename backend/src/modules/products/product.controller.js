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

// Se tiver update/delete, mantenha o padrão:
// export const updateProduct = async...
// export const deleteProduct = async...