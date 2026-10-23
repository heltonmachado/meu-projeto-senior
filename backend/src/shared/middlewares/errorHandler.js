import { AppError } from '../errors/AppError.js';
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, requestId: req.id });
  }
  console.error(err);
  return res.status(500).json({ message: 'Erro interno', requestId: req.id });
};
