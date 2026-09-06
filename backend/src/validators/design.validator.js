import { z } from 'zod';

export const createDesignSchema = z.object({
  name: z.string().trim().min(1).max(120),
  data: z.record(z.string(), z.unknown())
});

export const updateDesignSchema = createDesignSchema.partial().refine(value => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});
