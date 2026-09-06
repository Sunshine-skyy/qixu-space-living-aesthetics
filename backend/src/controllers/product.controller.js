import { listProducts, getProduct } from '../services/product.service.js';

export async function list(req, res, next) {
  try {
    const data = await listProducts(req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function detail(req, res, next) {
  try {
    const product = await getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
    }
    return res.json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
}
