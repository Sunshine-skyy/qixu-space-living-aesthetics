import { Router } from 'express';
import { create, detail, list, remove, update } from '../controllers/design.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', list);
router.post('/', create);
router.get('/:id', detail);
router.patch('/:id', update);
router.delete('/:id', remove);
export default router;
