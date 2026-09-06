import { ZodError } from 'zod';
import { createDesign, deleteDesign, getDesign, listDesigns, updateDesign } from '../services/design.service.js';
import { createDesignSchema, updateDesignSchema } from '../validators/design.validator.js';

function validationResponse(error) {
  return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: error.issues } };
}

export async function list(req, res, next) { try { return res.json({ success: true, data: await listDesigns(req.user.id) }); } catch (error) { return next(error); } }
export async function detail(req, res, next) {
  try { const data = await getDesign(req.user.id, req.params.id); if (!data) return res.status(404).json({ success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } }); return res.json({ success: true, data }); } catch (error) { return next(error); }
}
export async function create(req, res, next) {
  try { return res.status(201).json({ success: true, data: await createDesign(req.user.id, createDesignSchema.parse(req.body)) }); } catch (error) { if (error instanceof ZodError) return res.status(400).json(validationResponse(error)); return next(error); }
}
export async function update(req, res, next) {
  try { const data = updateDesignSchema.parse(req.body); const result = await updateDesign(req.user.id, req.params.id, data); if (!result.count) return res.status(404).json({ success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } }); return res.json({ success: true, data: await getDesign(req.user.id, req.params.id) }); } catch (error) { if (error instanceof ZodError) return res.status(400).json(validationResponse(error)); return next(error); }
}
export async function remove(req, res, next) { try { const result = await deleteDesign(req.user.id, req.params.id); if (!result.count) return res.status(404).json({ success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } }); return res.status(204).send(); } catch (error) { return next(error); } }
