import { Router } from 'express';
import { detail, list } from '../controllers/product.controller.js';

const router = Router();
router.get('/', list);
router.get('/:id', detail);

export default router;
